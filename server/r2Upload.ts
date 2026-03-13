import { Router } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireGuruAuth } from "./guruAuth";
import type { Request, Response } from "express";

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
    // Disable automatic checksum calculation — R2 doesn't require it and
    // the browser XHR upload cannot supply a matching checksum.
    requestChecksumCalculation: "when_required",
    responseChecksumValidation: "when_required",
  });
}

function isR2Configured(): boolean {
  return !!(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET_NAME && PUBLIC_URL);
}

export const r2Router = Router();

r2Router.post("/presign", requireGuruAuth, async (req: Request, res: Response) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: "Cloudflare R2 is not configured. Please set the required environment secrets." });
  }

  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    return res.status(400).json({ error: "fileName and fileType are required." });
  }

  if (!fileType.startsWith("video/")) {
    return res.status(400).json({ error: "Only video files are accepted." });
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `videos/${timestamp}-${safeName}`;

  try {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 900,
      // Do not hoist checksum headers into the query string — they confuse
      // plain browser XHR PUT requests which cannot set them.
      unhoistableHeaders: new Set(["x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"]),
    });
    const publicUrl = `${PUBLIC_URL}/${objectKey}`;

    return res.json({ uploadUrl, publicUrl, objectKey });
  } catch (err: any) {
    console.error("R2 presign error:", err);
    return res.status(500).json({ error: "Failed to generate upload URL. Check R2 configuration." });
  }
});
