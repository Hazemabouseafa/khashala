const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:/Users/w.i/.gemini/antigravity/brain/177a4023-40c2-4147-b0fc-6484f4bf4ba3/.user_uploaded/media_1793372102409_599b2cac.jpg';

async function processLogo() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });

  // 1. Precise Artwork Bounds
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const brightness = (r + g + b) / 3;
      const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
      
      // Real artwork has saturation or darkness
      if (brightness < 218 || diff > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('Detected artwork bounds:', { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY });

  // Add small 12px padding around the artwork
  const pad = 12;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(info.width - cropX, (maxX - minX) + pad * 2);
  const cropH = Math.min(info.height - cropY, (maxY - minY) + pad * 2);

  // Background color reference
  const bgR = 244, bgG = 248, bgB = 251;

  // Function to create transparent buffer from a sub-region
  function createTransparentBuffer(startX, startY, width, height) {
    const rgba = Buffer.alloc(width * height * 4);

    for (let cy = 0; cy < height; cy++) {
      for (let cx = 0; cx < width; cx++) {
        const origX = startX + cx;
        const origY = startY + cy;
        const srcIdx = (origY * info.width + origX) * 3;
        const dstIdx = (cy * width + cx) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        const brightness = (r + g + b) / 3;
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
        const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);

        let alpha = 1.0;

        // Background detection
        if (brightness >= 235 && maxDiff <= 12 && dist < 24) {
          alpha = 0;
        } else if (brightness >= 220 && maxDiff <= 22 && dist < 50) {
          // Anti-aliased boundary: compute alpha based on color distance from background
          const t = Math.max(0, Math.min(1, (dist - 16) / 34));
          // S-curve for clean edge
          alpha = t * t * (3 - 2 * t);
        } else {
          alpha = 1.0;
        }

        if (alpha <= 0.02) {
          rgba[dstIdx] = 0;
          rgba[dstIdx + 1] = 0;
          rgba[dstIdx + 2] = 0;
          rgba[dstIdx + 3] = 0;
        } else {
          // Color decontamination to avoid halos
          const cleanR = Math.min(255, Math.max(0, Math.round((r - (1 - alpha) * bgR) / alpha)));
          const cleanG = Math.min(255, Math.max(0, Math.round((g - (1 - alpha) * bgG) / alpha)));
          const cleanB = Math.min(255, Math.max(0, Math.round((b - (1 - alpha) * bgB) / alpha)));

          rgba[dstIdx] = cleanR;
          rgba[dstIdx + 1] = cleanG;
          rgba[dstIdx + 2] = cleanB;
          rgba[dstIdx + 3] = Math.round(alpha * 255);
        }
      }
    }
    return rgba;
  }

  // 1. Full Logo (Icon + Text)
  const fullRgba = createTransparentBuffer(cropX, cropY, cropW, cropH);
  await sharp(fullRgba, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(__dirname, '../public/logo.png'));

  await sharp(path.join(__dirname, '../public/logo.png'))
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(__dirname, '../public/logo.webp'));

  // 2. Icon-only variant (the upper 3D box, arrow, and magnifier)
  // Find bottom of the emblem (above the Arabic text)
  // Text starts around y: 285
  const iconH = Math.min(cropH, (285 - cropY) + pad);
  const iconRgba = createTransparentBuffer(cropX, cropY, cropW, iconH);
  await sharp(iconRgba, { raw: { width: cropW, height: iconH, channels: 4 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(__dirname, '../public/logo-icon.png'));

  // 3. SVG vector wrapper referencing the transparent logo
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="${cropW}" height="${cropH}">
  <image href="/logo.png" width="${cropW}" height="${cropH}" />
</svg>`;
  fs.writeFileSync(path.join(__dirname, '../public/logo.svg'), svgContent);

  console.log('✓ Successfully processed transparent logo files:');
  console.log('  - public/logo.png (Full transparent logo: ' + cropW + 'x' + cropH + ')');
  console.log('  - public/logo.webp (Compact WebP)');
  console.log('  - public/logo-icon.png (Icon mark only)');
  console.log('  - public/logo.svg (SVG format)');
}

processLogo().catch(console.error);
