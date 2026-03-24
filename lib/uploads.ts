import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function isAllowedMagicBytes(buffer: Buffer) {
  const signatures = {
    jpeg: [0xff, 0xd8, 0xff],
    png: [0x89, 0x50, 0x4e, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46],
  };

  const isJpeg = signatures.jpeg.every((byte, index) => buffer[index] === byte);
  const isPng = signatures.png.every((byte, index) => buffer[index] === byte);
  const isWebp =
    signatures.webp.every((byte, index) => buffer[index] === byte) &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isJpeg || isPng || isWebp;
}

export async function saveImageUpload(file: File, folder: "projects" | "blog") {
  if (!file || file.size === 0) {
    return null;
  }

  if (!ACCEPTED_MIME.has(file.type)) {
    throw new Error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 4MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!isAllowedMagicBytes(buffer)) {
    throw new Error("File gambar tidak valid.");
  }

  const now = new Date();
  const relativeDirectory = path.posix.join(
    "uploads",
    folder,
    `${now.getUTCFullYear()}`,
    `${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
  );
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
  const fileName = `${crypto.randomUUID()}.webp`;
  const absolutePath = path.join(absoluteDirectory, fileName);

  await mkdir(absoluteDirectory, { recursive: true });

  const outputBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await sharp(outputBuffer).toFile(absolutePath);

  return `/${path.posix.join(relativeDirectory, fileName)}`;
}

export async function removeLocalUpload(relativePath: string | null | undefined) {
  if (!relativePath || !relativePath.startsWith("/uploads/")) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", relativePath.replace(/^\//, ""));

  try {
    await unlink(absolutePath);
  } catch {
    // Ignore missing file so deletion remains idempotent.
  }
}
