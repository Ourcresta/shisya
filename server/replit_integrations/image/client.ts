import fs from "node:fs";
import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an image and return as Buffer.
 * Uses dall-e-3 model via OpenAI API.
 */
export async function generateImageBuffer(
  prompt: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024"
): Promise<Buffer> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size,
    response_format: "b64_json",
  });
  const base64 = response.data[0]?.b64_json ?? "";
  return Buffer.from(base64, "base64");
}

/**
 * Edit an image with a prompt.
 * Uses dall-e-2 model via OpenAI API (dall-e-3 doesn't support editing).
 */
export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  if (imageFiles.length === 0) {
    throw new Error("At least one image file is required");
  }

  const image = await toFile(fs.createReadStream(imageFiles[0]), imageFiles[0], {
    type: "image/png",
  });

  const response = await openai.images.edit({
    model: "dall-e-2",
    image,
    prompt,
    response_format: "b64_json",
  });

  const imageBase64 = response.data[0]?.b64_json ?? "";
  const imageBytes = Buffer.from(imageBase64, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}

