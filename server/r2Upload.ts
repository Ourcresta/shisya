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

// ── Storage backend: Backblaze B2 (primary) or Cloudflare R2 (fallback) ──────
const B2_KEY_ID = process.env.B2_KEY_ID || "";
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY || "";
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || "";
const B2_ENDPOINT = process.env.B2_ENDPOINT || "";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

function isB2Configured(): boolean {
  return !!(B2_KEY_ID && B2_APPLICATION_KEY && B2_BUCKET_NAME && B2_ENDPOINT);
}

function isR2Configured(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
}

function isStorageConfigured(): boolean {
  return isB2Configured() || isR2Configured();
}

function getActiveBucketName(): string {
  return isB2Configured() ? B2_BUCKET_NAME : R2_BUCKET_NAME;
}

// ── DB-driven active CDN base URL ────────────────────────────────────────────
// Called async at upload time so that a GURU manual override (cloudflare ↔ bunny)
// is immediately reflected in all newly generated public URLs — no server restart
// and no stored-URL backfill needed.
async function getActivePublicBaseUrl(): Promise<string> {
  try {
    // Lazy import avoids circular-dependency risk; cdnMetrics → db only, safe.
    const { getCdnMode } = await import("./cdnMetrics");
    const mode = await getCdnMode();
    if (mode === "bunny" && process.env.BUNNY_CDN_URL) {
      return process.env.BUNNY_CDN_URL.replace(/\/$/, "");
    }
  } catch {
    // If DB is unavailable, fall through to env-var priority order
  }
  return (
    process.env.B2_CLOUDFLARE_URL ||
    process.env.BUNNY_CDN_URL ||
    process.env.CLOUDFLARE_R2_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");
}

function getStorageClient(): S3Client {
  if (isB2Configured()) {
    return new S3Client({
      region: "auto",
      endpoint: B2_ENDPOINT,
      credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APPLICATION_KEY,
      },
    });
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: "when_required",
    responseChecksumValidation: "when_required",
  });
}

async function uploadFileToStorage(localPath: string, objectKey: string, contentType: string): Promise<string> {
  const client = getStorageClient();
  const fileBuffer = fs.readFileSync(localPath);
  await client.send(new PutObjectCommand({
    Bucket: getActiveBucketName(),
    Key: objectKey,
    Body: fileBuffer,
    ContentType: contentType,
  }));
  const baseUrl = await getActivePublicBaseUrl();
  return `${baseUrl}/${objectKey}`;
}

// ── HLS conversion jobs ─────────────────────────────────────────────────────
const hlsJobs = new Map<string, { status: string; hlsUrl?: string; error?: string; progress?: string; renditions?: string[] }>();

// ── Standard multi-bitrate HLS quality ladder (3 rungs, no 1080p) ───────────
// 720p is the typical ceiling for OurShiksha source content.
const HLS_LADDER = [
  { name: "720p", height: 720, videoBitrate: 2500, audioBitrate: 128, bandwidth: 2800000, codecs: "avc1.4d401f,mp4a.40.2" },
  { name: "480p", height: 480, videoBitrate: 1000, audioBitrate: 96,  bandwidth: 1150000, codecs: "avc1.4d401e,mp4a.40.2" },
  { name: "360p", height: 360, videoBitrate: 600,  audioBitrate: 64,  bandwidth: 720000,  codecs: "avc1.4d401e,mp4a.40.2" },
];

// ── ABR quality ladder ────────────────────────────────────────────────────────
// Industry-standard Netflix-inspired 4-rung ladder.
// videoBitrate in kbps, audioBitrate in kbps.
// BANDWIDTH in master.m3u8 = video + audio + ~5% overhead.
const ABR_LADDER = [
  { name: "360p",  height: 360,  videoBitrate: 800,  audioBitrate: 96,  bandwidth: 942000,  codecs: "avc1.4d401e,mp4a.40.2" },
  { name: "480p",  height: 480,  videoBitrate: 1400, audioBitrate: 128, bandwidth: 1606000, codecs: "avc1.4d401f,mp4a.40.2" },
  { name: "720p",  height: 720,  videoBitrate: 2800, audioBitrate: 128, bandwidth: 3072000, codecs: "avc1.640020,mp4a.40.2" },
  { name: "1080p", height: 1080, videoBitrate: 5000, audioBitrate: 192, bandwidth: 5448000, codecs: "avc1.640028,mp4a.40.2" },
] as const;

// ── ABR jobs ──────────────────────────────────────────────────────────────────
const abrJobs = new Map<string, {
  status: string;
  hlsUrl?: string;
  error?: string;
  progress?: string;
  renditions?: string[];
}>();

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
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: "B2 Storage is not configured." });
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
    const client = getStorageClient();
    const command = new PutObjectCommand({
      Bucket: getActiveBucketName(),
      Key: objectKey,
      ContentType: fileType,
    });
    const signedUrlOptions: Parameters<typeof getSignedUrl>[2] = { expiresIn: 900 };
    if (!isB2Configured()) {
      signedUrlOptions.unhoistableHeaders = new Set(["x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"]);
    }
    const uploadUrl = await getSignedUrl(client, command, signedUrlOptions);
    const baseUrl = await getActivePublicBaseUrl();
    const publicUrl = `${baseUrl}/${objectKey}`;
    return res.json({ uploadUrl, publicUrl, objectKey });
  } catch (err: any) {
    console.error("B2 presign error:", err);
    return res.status(500).json({ error: "Failed to generate upload URL." });
  }
});

// ── Multi-bitrate HLS conversion (3-rung: 720p / 480p / 360p) ──────────────
// Replaces the old stream-copy pipeline. Encodes each variant sequentially so
// progress messages are granular ("Encoding 720p (1/3)…"), then uploads all
// segment files and a proper master.m3u8 that hls.js uses for true ABR.
r2Router.post("/convert-hls", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: "B2 Storage is not configured." });
  }
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ error: "videoUrl is required." });

  const jobId = `hls_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  hlsJobs.set(jobId, { status: "processing", progress: "Queued…" });
  res.json({ jobId });

  (async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hls-"));
    try {
      // ── 1. Download source video ─────────────────────────────────────────
      hlsJobs.set(jobId, { status: "processing", progress: "Downloading source video…" });
      const inputPath = path.join(tmpDir, "input.mp4");
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      fs.writeFileSync(inputPath, Buffer.from(await response.arrayBuffer()));

      // ── 2. Probe source resolution — skip rungs that would upscale ───────
      let sourceHeight = 720;
      let sourceWidth = 1280;
      try {
        const probe = await execFileAsync("ffprobe", [
          "-v", "error", "-select_streams", "v:0",
          "-show_entries", "stream=width,height",
          "-of", "json", inputPath,
        ]);
        const stream = JSON.parse(probe.stdout)?.streams?.[0];
        if (stream?.height) { sourceHeight = stream.height; sourceWidth = stream.width; }
      } catch { /* use defaults */ }

      const activeRungs = HLS_LADDER.filter((r) => r.height <= sourceHeight);
      if (activeRungs.length === 0) activeRungs.push(HLS_LADDER[HLS_LADDER.length - 1]);

      // ── 3. Encode each rung sequentially (clear per-variant progress) ────
      const timestamp = Date.now();
      const hlsPrefix = `hls/${timestamp}`;

      for (let i = 0; i < activeRungs.length; i++) {
        const r = activeRungs[i];
        hlsJobs.set(jobId, {
          status: "processing",
          progress: `Encoding ${r.name} (${i + 1}/${activeRungs.length})…`,
        });

        const rungDir = path.join(tmpDir, r.name);
        fs.mkdirSync(rungDir, { recursive: true });

        await execFileAsync("ffmpeg", [
          "-i", inputPath,
          "-vf", `scale=-2:${r.height}`,
          "-c:v", "libx264",
          "-preset", "fast",
          "-b:v", `${r.videoBitrate}k`,
          "-maxrate", `${Math.round(r.videoBitrate * 1.07)}k`,
          "-bufsize", `${r.videoBitrate * 2}k`,
          "-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
          "-c:a", "aac",
          "-b:a", `${r.audioBitrate}k`,
          "-ar", "48000",
          "-hls_time", "6",
          "-hls_list_size", "0",
          "-hls_segment_filename", path.join(rungDir, "seg%03d.ts"),
          "-f", "hls",
          path.join(rungDir, "playlist.m3u8"),
        ]);
      }

      // ── 4. Upload all rendition segments + playlists to storage ──────────
      hlsJobs.set(jobId, { status: "processing", progress: "Uploading segments to storage…" });
      for (const r of activeRungs) {
        const rungDir = path.join(tmpDir, r.name);
        for (const file of fs.readdirSync(rungDir)) {
          const ext = path.extname(file);
          const contentType = ext === ".m3u8" ? "application/vnd.apple.mpegurl" : "video/mp2t";
          await uploadFileToStorage(
            path.join(rungDir, file),
            `${hlsPrefix}/${r.name}/${file}`,
            contentType,
          );
        }
      }

      // ── 5. Build and upload master playlist ──────────────────────────────
      const masterLines = ["#EXTM3U", "#EXT-X-VERSION:3", ""];
      for (const r of activeRungs) {
        const aspectW = Math.round((sourceWidth / sourceHeight) * r.height);
        const evenW = aspectW % 2 === 0 ? aspectW : aspectW + 1;
        masterLines.push(
          `#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},RESOLUTION=${evenW}x${r.height},CODECS="${r.codecs}",NAME="${r.name}"`,
          `${r.name}/playlist.m3u8`,
          "",
        );
      }
      const masterPath = path.join(tmpDir, "master.m3u8");
      fs.writeFileSync(masterPath, masterLines.join("\n"));
      const masterUrl = await uploadFileToStorage(masterPath, `${hlsPrefix}/master.m3u8`, "application/vnd.apple.mpegurl");

      const renditionNames = activeRungs.map((r) => r.name);
      hlsJobs.set(jobId, { status: "done", hlsUrl: masterUrl, renditions: renditionNames, progress: "Complete" });
      console.log(`[HLS] Multi-bitrate complete: ${masterUrl} (${renditionNames.join(", ")})`);
    } catch (err: any) {
      console.error("[HLS] Encoding error:", err);
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

// ── Multi-Bitrate HLS (ABR) Conversion ───────────────────────────────────────
// POST /api/guru/r2/convert-hls-abr
// Encodes a source video into a 4-rung quality ladder (360p/480p/720p/1080p)
// using a single ffmpeg pass with filter_complex. Produces a proper HLS master
// playlist with BANDWIDTH + RESOLUTION + CODECS so hls.js can do true ABR.
r2Router.post("/convert-hls-abr", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: "Storage is not configured." });
  }
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ error: "videoUrl is required." });

  const jobId = `abr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  abrJobs.set(jobId, { status: "processing", progress: "Queued..." });
  res.json({ jobId });

  (async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "abr-"));
    try {
      // ── 1. Download source video ─────────────────────────────────────────
      abrJobs.set(jobId, { status: "processing", progress: "Downloading source video..." });
      const inputPath = path.join(tmpDir, "input.mp4");
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error(`Download failed: ${videoRes.status}`);
      fs.writeFileSync(inputPath, Buffer.from(await videoRes.arrayBuffer()));

      // ── 2. Probe source resolution with ffprobe ───────────────────────────
      abrJobs.set(jobId, { status: "processing", progress: "Detecting source resolution..." });
      let sourceHeight = 1080;
      let sourceWidth = 1920;
      try {
        const probe = await execFileAsync("ffprobe", [
          "-v", "error",
          "-select_streams", "v:0",
          "-show_entries", "stream=width,height",
          "-of", "json",
          inputPath,
        ]);
        const probeData = JSON.parse(probe.stdout);
        const stream = probeData?.streams?.[0];
        if (stream?.height) { sourceHeight = stream.height; sourceWidth = stream.width; }
      } catch { /* use defaults */ }

      // ── 3. Filter ladder — never upscale beyond source ────────────────────
      const activeRungs = [...ABR_LADDER].filter((r) => r.height <= sourceHeight);
      // Always include the lowest rung for very poor connections
      if (activeRungs.length === 0) activeRungs.push(ABR_LADDER[0]);

      // ── 4. Build filter_complex graph ─────────────────────────────────────
      // Splits the video once and scales to each target height independently.
      const n = activeRungs.length;
      const splitOutputs = activeRungs.map((_, i) => `[v${i}]`).join("");
      const filterGraph =
        `[0:v]split=${n}${splitOutputs};` +
        activeRungs.map((r, i) => `[v${i}]scale=-2:${r.height}[s${i}]`).join(";");

      // ── 5. Build ffmpeg args (one decode pass, n encode passes) ───────────
      // Create output sub-dirs for each rung
      for (const r of activeRungs) {
        fs.mkdirSync(path.join(tmpDir, r.name), { recursive: true });
      }

      const ffmpegArgs: string[] = [
        "-i", inputPath,
        "-filter_complex", filterGraph,
      ];

      activeRungs.forEach((r, i) => {
        ffmpegArgs.push(
          "-map", `[s${i}]`,
          "-map", "0:a?",
          `-c:v:${i}`, "libx264",
          `-preset:v:${i}`, "fast",
          `-crf:v:${i}`, "23",
          `-maxrate:v:${i}`, `${Math.round(r.videoBitrate * 1.07)}k`,
          `-bufsize:v:${i}`, `${r.videoBitrate * 2}k`,
          `-g:v:${i}`, "48",
          `-keyint_min:v:${i}`, "48",
          `-sc_threshold:v:${i}`, "0",
          `-c:a:${i}`, "aac",
          `-b:a:${i}`, `${r.audioBitrate}k`,
          `-ar:a:${i}`, "48000",
          `-hls_time:v:${i}`, "6",
          `-hls_playlist_type:v:${i}`, "vod",
          `-hls_list_size:v:${i}`, "0",
          `-hls_segment_filename:v:${i}`, path.join(tmpDir, r.name, "seg%03d.ts"),
          path.join(tmpDir, r.name, "playlist.m3u8"),
        );
      });

      abrJobs.set(jobId, {
        status: "processing",
        progress: `Encoding ${activeRungs.map((r) => r.name).join(", ")} in one pass…`,
      });
      await execFileAsync("ffmpeg", ffmpegArgs);

      // ── 6. Upload all rendition segments + playlists to storage ──────────
      const timestamp = Date.now();
      const prefix = `hls-abr/${timestamp}`;

      abrJobs.set(jobId, { status: "processing", progress: "Uploading segments to storage..." });
      for (const r of activeRungs) {
        const rungDir = path.join(tmpDir, r.name);
        const files = fs.readdirSync(rungDir);
        for (const file of files) {
          const ext = path.extname(file);
          const contentType = ext === ".m3u8" ? "application/vnd.apple.mpegurl" : "video/mp2t";
          await uploadFileToStorage(
            path.join(rungDir, file),
            `${prefix}/${r.name}/${file}`,
            contentType,
          );
        }
      }

      // ── 7. Build and upload HLS master playlist ───────────────────────────
      // The master playlist lists each variant stream with BANDWIDTH, RESOLUTION,
      // and CODECS. hls.js reads this and picks the right rung dynamically.
      const masterLines = ["#EXTM3U", "#EXT-X-VERSION:3", ""];
      for (const r of activeRungs) {
        // Calculate actual width from source aspect ratio
        const aspectW = Math.round((sourceWidth / sourceHeight) * r.height);
        const evenW = aspectW % 2 === 0 ? aspectW : aspectW + 1;
        masterLines.push(
          `#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},RESOLUTION=${evenW}x${r.height},CODECS="${r.codecs}",NAME="${r.name}"`,
          `${r.name}/playlist.m3u8`,
          "",
        );
      }
      const masterM3u8Path = path.join(tmpDir, "master.m3u8");
      fs.writeFileSync(masterM3u8Path, masterLines.join("\n"));
      const masterUrl = await uploadFileToStorage(masterM3u8Path, `${prefix}/master.m3u8`, "application/vnd.apple.mpegurl");

      const renditionNames = activeRungs.map((r) => r.name);
      abrJobs.set(jobId, { status: "done", hlsUrl: masterUrl, renditions: renditionNames, progress: "Complete" });
      console.log(`[ABR] Encoding complete: ${masterUrl} (renditions: ${renditionNames.join(", ")})`);
    } catch (err: any) {
      console.error("[ABR] Encoding error:", err);
      abrJobs.set(jobId, { status: "failed", error: err.message, progress: "Failed" });
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  })();
});

r2Router.get("/abr-status/:jobId", requireGuruAuth, (req: Request, res: Response) => {
  const job = abrJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// ── AI Processing Pipeline ────────────────────────────────────────────────────
// POST /api/guru/r2/ai-process
// Generates: transcript → WebVTT subtitles → translations → AI dubbed audio
r2Router.post("/ai-process", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: "B2 Storage is not configured." });
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
      aiJobs.set(jobId, { status: "processing", progress: "Downloading video from B2..." });
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
      const enVttUrl = await uploadFileToStorage(enVttPath, `${prefix}/sub_en.vtt`, "text/vtt");
      result.subtitleTracks.push({ languageCode: "en", languageName: "English", subtitleUrl: enVttUrl });

      // Step 4 — Translate to each target language → generate per-language WebVTT
      for (const lang of languages as string[]) {
        const langName = LANG_NAMES[lang] || lang;
        aiJobs.set(jobId, { status: "processing", progress: `Translating subtitles to ${langName}...` });
        const translatedSegs = await translateSegments(openai, segments, lang, langName);
        const vttPath = path.join(tmpDir, `sub_${lang}.vtt`);
        fs.writeFileSync(vttPath, segmentsToVtt(translatedSegs));
        const vttUrl = await uploadFileToStorage(vttPath, `${prefix}/sub_${lang}.vtt`, "text/vtt");
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
// converts it to 128k stereo MP3 via FFmpeg, stores on B2, returns mp3Url.
r2Router.post("/convert-audio", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: "B2 Storage is not configured." });
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

    // Upload converted MP3 to B2 under the audio/ prefix
    const timestamp = Date.now();
    const baseName = path.basename(urlPath).replace(/\.[^.]+$/, "");
    const mp3Key = `audio/${timestamp}-${baseName}.mp3`;
    const mp3Url = await uploadFileToStorage(outputPath, mp3Key, "audio/mpeg");

    console.log(`[AudioConvert] ${ext} → MP3: ${mp3Url}`);
    return res.json({ mp3Url });
  } catch (err: any) {
    console.error("[AudioConvert] Error:", err);
    return res.status(500).json({ error: err.message || "Audio conversion failed." });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
});
