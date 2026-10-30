import sharp from 'sharp';
import { compressAndSaveImage } from '../src/lib/sharp-compress';
import fs from 'fs';
import path from 'path';

async function testSharpCompression() {
  console.log('--- Testing Sharp Automatic Image Compression & Optimization ---');

  // 1. Generate an oversized high-res test image (1920x1080)
  const highResWidth = 1920;
  const highResHeight = 1080;
  console.log(`Generating simulated raw user upload (${highResWidth}x${highResHeight})...`);

  // Create an SVG with gradient/content and convert to PNG buffer
  const svgBuffer = Buffer.from(`
    <svg width="${highResWidth}" height="${highResHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(224,32,32);stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgb(0,47,52);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(245,158,11);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <text x="50%" y="50%" font-size="72" fill="#ffffff" text-anchor="middle" font-family="Arial">
        Khashala خشاله Test Ad Image
      </text>
    </svg>
  `);

  const rawPngBuffer = await sharp(svgBuffer).png().toBuffer();
  const rawSizeKB = (rawPngBuffer.length / 1024).toFixed(2);
  console.log(`Raw upload size: ${rawSizeKB} KB`);

  // 2. Run through Khashala automatic Sharp compression pipeline
  const result = await compressAndSaveImage(rawPngBuffer, 'test-car.png');

  console.log('\nCompression Results:');
  console.log(`- Saved URL: ${result.url}`);
  console.log(`- Original Size: ${(result.originalSize / 1024).toFixed(2)} KB`);
  console.log(`- Compressed Size: ${(result.compressedSize / 1024).toFixed(2)} KB`);
  console.log(`- Compression Savings: ${result.reductionPercentage}%`);
  console.log(`- Result Dimensions: ${result.width}x${result.height}`);
  console.log(`- Result Format: ${result.format}`);

  // Assertions
  const fullDiskPath = path.join(process.cwd(), 'public', result.url);
  if (!fs.existsSync(fullDiskPath)) {
    throw new Error(`File was not saved to disk at: ${fullDiskPath}`);
  }

  if (result.width > 1200) {
    throw new Error(`Width exceeded 1200px limit: ${result.width}px`);
  }

  if (result.format !== 'webp') {
    throw new Error(`Format is not WebP: ${result.format}`);
  }

  if (result.compressedSize > 300 * 1024) {
    throw new Error(`Size exceeded 300KB limit: ${(result.compressedSize / 1024).toFixed(2)} KB`);
  }

  console.log('\n✓ All Sharp Compression & Optimization criteria verified successfully!');
}

testSharpCompression().catch((err) => {
  console.error('Sharp test failed:', err);
  process.exit(1);
});
