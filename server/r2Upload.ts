import { Router } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireGuruAuth } from "./guruAuth";
import type { Request, Response } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
const PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");

function getS3Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: "when_required",
    responseChecksumValidation: "when_required",
  });
}

function isR2Configured(): boolean {
  return !!(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET_NAME && PUBLIC_URL);
}

async function uploadFileToR2(localPath: string, objectKey: string, contentType: string): Promise<string> {
  const client = getS3Client();
  const fileBuffer = fs.readFileSync(localPath);
  await client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: fileBuffer,
    ContentType: contentType,
  }));
  return `${PUBLIC_URL}/${objectKey}`;
}

// ── HLS conversion jobs ─────────────────────────────────────────────────────
const hlsJobs = new Map<string, { status: string; hlsUrl?: string; error?: string; progress?: string }>();

// ── AI processing jobs ──────────────────────────────────────────────────────
const aiJobs = new Map<string, {
  status: string;
  progress: string;
  result?: {
    subtitleTracks: Array<{ languageCode: string; languageName: string; subtitleUrl: string }>;
    audioTracks: Array<{ languageCode: string; languageName: string; audioUrl: string }>;
    transcriptText: string;
  };
  error?: string;
}>();

// ── Language map ─────────────────────────────────────────────────────────────
const LANG_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu",
  kn: "Kannada", ml: "Malayalam", mr: "Marathi", bn: "Bengali",
  gu: "Gujarati", pa: "Punjabi",
};

// ── VTT helpers ──────────────────────────────────────────────────────────────
function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function segmentsToVtt(segments: Array<{ start: number; end: number; text: string }>): string {
  const lines = ["WEBVTT", ""];
  segments.forEach((seg, i) => {
    lines.push(String(i + 1));
    lines.push(`${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}`);
    lines.push(seg.text.trim());
    lines.push("");
  });
  return lines.join("\n");
}

// ── Translation via GPT-4.1-mini ─────────────────────────────────────────────
async function translateSegments(
  openai: any,
  segments: Array<{ start: number; end: number; text: string }>,
  targetLang: string,
  langName: string
): Promise<Array<{ start: number; end: number; text: string }>> {
  const CHUNK = 60;
  const allTranslated: string[] = [];

  for (let i = 0; i < segments.length; i += CHUNK) {
    const slice = segments.slice(i, i + CHUNK);
    const texts = slice.map((s) => s.text);
    const resp = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: `Translate the following ${texts.length} subtitle segments from English to ${langName}. Preserve the same number of items and keep them short (subtitle-friendly). Return ONLY a JSON object: {"t": ["translation1", "translation2", ...]}\n\nInput: ${JSON.stringify(texts)}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    try {
      const parsed = JSON.parse(resp.choices[0].message.content || "{}");
      const arr = parsed.t || parsed.translations || parsed.segments || Object.values(parsed)[0];
      if (Array.isArray(arr) && arr.length === texts.length) {
        allTranslated.push(...arr.map(String));
      } else {
        allTranslated.push(...texts);
      }
    } catch {
      allTranslated.push(...texts);
    }
  }

  return segments.map((seg, i) => ({
    start: seg.start,
    end: seg.end,
    text: allTranslated[i] ?? seg.text,
  }));
}

// ── WAV → MP3 conversion helper ───────────────────────────────────────────────
async function convertAudioToMp3(inputPath: string, outputPath: string): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-i", inputPath,
    "-acodec", "mp3",
    "-ab", "128k",
    "-ar", "44100",
    "-ac", "2",
    outputPath,
  ]);
}

// ── Router ────────────────────────────────────────────────────────────────────
export const r2Router = Router();

// Presigned URL for direct browser upload
r2Router.post("/presign", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: "Cloudflare R2 is not configured." });
  }
  const { fileName, fileType, folder = "videos" } = req.body;
  if (!fileName || !fileType) {
    return res.status(400).json({ error: "fileName and fileType are required." });
  }

  const allowedFolders: Record<string, string[]> = {
    videos: ["video/"],
    audio: ["audio/"],
    subtitles: ["text/vtt", "text/srt", "application/x-subrip", "text/plain"],
    files: ["application/pdf", "application/zip", "text/", "application/msword", "application/vnd."],
  };

  const allowed = allowedFolders[folder] || allowedFolders.videos;
  const isAllowed = allowed.some((prefix) => fileType.startsWith(prefix));
  if (!isAllowed) {
    return res.status(400).json({ error: `File type ${fileType} not allowed for folder ${folder}.` });
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `${folder}/${timestamp}-${safeName}`;

  try {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
    });
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 900,
      unhoistableHeaders: new Set(["x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"]),
    });
    const publicUrl = `${PUBLIC_URL}/${objectKey}`;
    return res.json({ uploadUrl, publicUrl, objectKey });
  } catch (err: any) {
    console.error("R2 presign error:", err);
    return res.status(500).json({ error: "Failed to generate upload URL." });
  }
});

// HLS conversion (single-quality, stream-copy)
r2Router.post("/convert-hls", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: "Cloudflare R2 is not configured." });
  }
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ error: "videoUrl is required." });

  const jobId = `hls_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  hlsJobs.set(jobId, { status: "processing", progress: "Downloading video..." });
  res.json({ jobId });

  (async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hls-"));
    const inputPath = path.join(tmpDir, "input.mp4");
    const outputM3u8 = path.join(tmpDir, "playlist.m3u8");
    const timestamp = Date.now();
    const hlsPrefix = `hls/${timestamp}`;

    try {
      hlsJobs.set(jobId, { status: "processing", progress: "Downloading video from R2..." });
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(inputPath, buffer);

      hlsJobs.set(jobId, { status: "processing", progress: "Converting to HLS with ffmpeg..." });
      await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-codec:", "copy",
        "-start_number", "0",
        "-hls_time", "10",
        "-hls_list_size", "0",
        "-hls_segment_filename", path.join(tmpDir, "segment%03d.ts"),
        "-f", "hls",
        outputM3u8,
      ]);

      hlsJobs.set(jobId, { status: "processing", progress: "Uploading HLS segments to R2..." });
      const files = fs.readdirSync(tmpDir).filter((f) => f !== "input.mp4");
      for (const file of files) {
        const localFile = path.join(tmpDir, file);
        const isM3u8 = file.endsWith(".m3u8");
        const isTs = file.endsWith(".ts");
        if (!isM3u8 && !isTs) continue;
        const contentType = isM3u8 ? "application/vnd.apple.mpegurl" : "video/mp2t";
        await uploadFileToR2(localFile, `${hlsPrefix}/${file}`, contentType);
      }

      const hlsPublicUrl = `${PUBLIC_URL}/${hlsPrefix}/playlist.m3u8`;
      hlsJobs.set(jobId, { status: "done", hlsUrl: hlsPublicUrl });
      console.log(`[HLS] Conversion complete: ${hlsPublicUrl}`);
    } catch (err: any) {
      console.error("[HLS] Conversion error:", err);
      hlsJobs.set(jobId, { status: "failed", error: err.message });
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  })();
});

r2Router.get("/hls-status/:jobId", requireGuruAuth, (req: Request, res: Response) => {
  const job = hlsJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// ── AI Processing Pipeline ────────────────────────────────────────────────────
// POST /api/guru/r2/ai-process
// Generates: transcript → WebVTT subtitles → translations → AI dubbed audio
r2Router.post("/ai-process", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: "Cloudflare R2 is not configured." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "OpenAI API key is not configured." });
  }

  const { videoUrl, languages = ["hi", "ta"] } = req.body;
  if (!videoUrl) return res.status(400).json({ error: "videoUrl is required." });

  const jobId = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  aiJobs.set(jobId, { status: "processing", progress: "Starting AI pipeline..." });
  res.json({ jobId });

  (async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-"));
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const timestamp = Date.now();
      const prefix = `ai/${timestamp}`;

      // Step 1 — Download video & extract audio
      aiJobs.set(jobId, { status: "processing", progress: "Downloading video from R2..." });
      const inputPath = path.join(tmpDir, "input.mp4");
      const audioPath = path.join(tmpDir, "audio.mp3");

      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error(`Video download failed: ${videoRes.status}`);
      fs.writeFileSync(inputPath, Buffer.from(await videoRes.arrayBuffer()));

      aiJobs.set(jobId, { status: "processing", progress: "Extracting audio for transcription..." });
      await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-vn",
        "-acodec", "mp3",
        "-ar", "16000",
        "-ac", "1",
        "-b:a", "64k",
        audioPath,
      ]);

      // Step 2 — Whisper transcription
      aiJobs.set(jobId, { status: "processing", progress: "Transcribing with OpenAI Whisper..." });
      const transcription = await (openai.audio.transcriptions as any).create({
        file: fs.createReadStream(audioPath),
        model: "whisper-1",
        response_format: "verbose_json",
      });

      type Segment = { start: number; end: number; text: string };
      const segments: Segment[] = ((transcription as any).segments || []).map((s: any) => ({
        start: Number(s.start),
        end: Number(s.end),
        text: String(s.text),
      }));
      const transcriptText: string = (transcription as any).text || segments.map((s) => s.text).join(" ");

      const result: {
        subtitleTracks: Array<{ languageCode: string; languageName: string; subtitleUrl: string }>;
        audioTracks: Array<{ languageCode: string; languageName: string; audioUrl: string }>;
        transcriptText: string;
      } = { subtitleTracks: [], audioTracks: [], transcriptText };

      // Step 3 — English WebVTT
      aiJobs.set(jobId, { status: "processing", progress: "Generating English subtitles (WebVTT)..." });
      const enVttPath = path.join(tmpDir, "sub_en.vtt");
      fs.writeFileSync(enVttPath, segmentsToVtt(segments));
      const enVttUrl = await uploadFileToR2(enVttPath, `${prefix}/sub_en.vtt`, "text/vtt");
      result.subtitleTracks.push({ languageCode: "en", languageName: "English", subtitleUrl: enVttUrl });

      // Step 4 — Translate to each target language → generate per-language WebVTT
      for (const lang of languages as string[]) {
        const langName = LANG_NAMES[lang] || lang;
        aiJobs.set(jobId, { status: "processing", progress: `Translating subtitles to ${langName}...` });
        const translatedSegs = await translateSegments(openai, segments, lang, langName);
        const vttPath = path.join(tmpDir, `sub_${lang}.vtt`);
        fs.writeFileSync(vttPath, segmentsToVtt(translatedSegs));
        const vttUrl = await uploadFileToR2(vttPath, `${prefix}/sub_${lang}.vtt`, "text/vtt");
        result.subtitleTracks.push({ languageCode: lang, languageName: langName, subtitleUrl: vttUrl });
      }

      aiJobs.set(jobId, { status: "done", progress: "AI processing complete!", result });
      console.log(`[AI] Pipeline complete: ${jobId}`);
    } catch (err: any) {
      console.error("[AI] Pipeline error:", err);
      aiJobs.set(jobId, { status: "failed", progress: "Processing failed", error: err.message });
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  })();
});

r2Router.get("/ai-status/:jobId", requireGuruAuth, (req: Request, res: Response) => {
  const job = aiJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// ── WAV / Audio → MP3 server-side conversion ─────────────────────────────────
// Accepts a URL to any uploaded audio file (WAV, FLAC, M4A, etc.),
// converts it to 128k stereo MP3 via FFmpeg, stores on R2, returns mp3Url.
r2Router.post("/convert-audio", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: "Cloudflare R2 is not configured." });
  }
  const { audioUrl } = req.body;
  if (!audioUrl) return res.status(400).json({ error: "audioUrl is required." });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "audioconv-"));
  try {
    // Download the source audio file
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const urlPath = new URL(audioUrl).pathname;
    const ext = path.extname(urlPath) || ".wav";
    const inputPath = path.join(tmpDir, `input${ext}`);
    const outputPath = path.join(tmpDir, "output.mp3");

    fs.writeFileSync(inputPath, Buffer.from(await response.arrayBuffer()));

    // Convert to MP3 (128kbps, 44.1kHz stereo)
    await convertAudioToMp3(inputPath, outputPath);

    // Upload converted MP3 to R2 under the audio/ prefix
    const timestamp = Date.now();
    const baseName = path.basename(urlPath).replace(/\.[^.]+$/, "");
    const mp3Key = `audio/${timestamp}-${baseName}.mp3`;
    const mp3Url = await uploadFileToR2(outputPath, mp3Key, "audio/mpeg");

    console.log(`[AudioConvert] ${ext} → MP3: ${mp3Url}`);
    return res.json({ mp3Url });
  } catch (err: any) {
    console.error("[AudioConvert] Error:", err);
    return res.status(500).json({ error: err.message || "Audio conversion failed." });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
});
