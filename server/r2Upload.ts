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

const hlsJobs = new Map<string, { status: string; hlsUrl?: string; error?: string; progress?: string }>();

export const r2Router = Router();

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
