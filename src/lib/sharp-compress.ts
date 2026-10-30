import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface CompressedImageResult {
  url: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
  format: 'webp';
}

/**
 * Automatically optimizes and compresses uploaded image buffers using Sharp:
 * 1. Resizes large images to maximum width 1200px (maintaining aspect ratio without enlargement)
 * 2. Converts format to optimized WebP
 * 3. Applies ~80% quality compression targeted at sub-300KB output
 * 4. Saves only the optimized WebP image to public/uploads/ads/
 */
export async function compressAndSaveImage(
  fileBuffer: Buffer | ArrayBuffer,
  originalFilename = 'ad-image'
): Promise<CompressedImageResult> {
  const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
  const originalSize = buffer.length;

  // Ensure target upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ads');
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate unique collision-free filename
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const filename = `khashala-${timestamp}-${randomSuffix}.webp`;
  const absolutePath = path.join(uploadDir, filename);

  // Initial Sharp pipeline:
  // - Resize max width 1200px, keep aspect ratio, never enlarge smaller images
  // - Convert to WebP format with quality 80
  let quality = 80;
  let compressedBuffer = await sharp(buffer)
    .rotate() // Automatically orient based on EXIF
    .resize({
      width: 1200,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({
      quality,
      effort: 4, // Balanced CPU effort for high compression density
    })
    .toBuffer();

  // If the image is still above 300KB (e.g., highly complex noise/textures),
  // apply a secondary progressive optimization step to meet the strict < 300KB rule
  const MAX_TARGET_BYTES = 300 * 1024; // 300 KB
  if (compressedBuffer.length > MAX_TARGET_BYTES) {
    quality = 68;
    compressedBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: 1200,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({
        quality,
        effort: 5,
      })
      .toBuffer();
  }

  // Write the compressed file to disk
  await fs.writeFile(absolutePath, compressedBuffer);

  // Retrieve final image dimensions
  const metadata = await sharp(compressedBuffer).metadata();
  const compressedSize = compressedBuffer.length;
  const reductionPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);

  return {
    url: `/uploads/ads/${filename}`,
    originalSize,
    compressedSize,
    reductionPercentage: Math.max(0, reductionPercentage),
    width: metadata.width || 1200,
    height: metadata.height || 800,
    format: 'webp',
  };
}
