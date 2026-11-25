import sharp from "sharp";

// Longest edge kept for stored product photos. The storefront's image
// optimizer serves resized copies from this, so 2000px is plenty for
// full-width retina views while keeping each stored file a few hundred KB.
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 82;

export type OptimizedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

/**
 * Shrinks an uploaded product photo before it goes to storage: applies the
 * camera's EXIF rotation, caps the longest edge at MAX_DIMENSION, flattens
 * any transparency onto white, and re-encodes as a progressive JPEG. Sharp
 * drops EXIF metadata (including phone GPS location) by default.
 *
 * If the file can't be decoded (e.g. a format sharp doesn't support), the
 * original is returned unchanged so the upload still succeeds.
 */
export async function optimizeProductImage(
  input: Buffer,
  originalType: string,
  originalExtension: string,
): Promise<OptimizedImage> {
  try {
    const buffer = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({
        quality: JPEG_QUALITY,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    // A small, already-compressed JPEG can come out larger; keep the smaller.
    if (
      buffer.length >= input.length &&
      originalType === "image/jpeg"
    ) {
      return {
        buffer: input,
        contentType: originalType,
        extension: originalExtension,
      };
    }

    return {
      buffer,
      contentType: "image/jpeg",
      extension: "jpg",
    };
  } catch (error) {
    console.warn(
      "Image optimization failed; uploading original.",
      error,
    );

    return {
      buffer: input,
      contentType: originalType,
      extension: originalExtension,
    };
  }
}
