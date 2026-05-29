#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'src/assets');

const images = [
  { name: 'background.png', quality: 75, resize: { width: 1920, height: 1080, fit: 'cover' } },
  { name: 'logobg.png', quality: 80, resize: { width: 1920, height: 1080, fit: 'cover' } },
  { name: 'logo.png', quality: 85, resize: { width: 400, fit: 'contain' } },
  { name: 'favicon.png', quality: 85, resize: { width: 192, fit: 'cover' } },
  { name: 'EmailLogo.png', quality: 85, resize: { width: 300, fit: 'contain' } },
];

async function compressImages() {
  console.log('🖼️  Starting image compression and optimization...\n');

  for (const img of images) {
    const inputPath = path.join(assetsDir, img.name);
    const outputPath = path.join(assetsDir, img.name);
    const webpPath = path.join(assetsDir, img.name.replace(/\.[^.]+$/, '.webp'));

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️  ${img.name} not found, skipping...`);
      continue;
    }

    const beforeSize = fs.statSync(inputPath).size;

    try {
      // Compress and resize original
      let pipeline = sharp(inputPath);
      if (img.resize) {
        pipeline = pipeline.resize(img.resize.width, img.resize.height, img.resize);
      }
      pipeline = pipeline.png({ quality: img.quality, progressive: true });

      await pipeline.toFile(outputPath + '.tmp');
      fs.renameSync(outputPath + '.tmp', outputPath);

      // Create WebP version
      let webpPipeline = sharp(inputPath);
      if (img.resize) {
        webpPipeline = webpPipeline.resize(img.resize.width, img.resize.height, img.resize);
      }
      webpPipeline = webpPipeline.webp({ quality: img.quality });

      await webpPipeline.toFile(webpPath + '.tmp');
      fs.renameSync(webpPath + '.tmp', webpPath);

      const afterSize = fs.statSync(outputPath).size;
      const webpSize = fs.statSync(webpPath).size;
      const reduction = ((1 - afterSize / beforeSize) * 100).toFixed(1);

      console.log(`✅ ${img.name}`);
      console.log(`   Before: ${(beforeSize / 1024 / 1024).toFixed(2)}MB → After: ${(afterSize / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`);
      console.log(`   WebP:   ${(webpSize / 1024 / 1024).toFixed(2)}MB (${((1 - webpSize / beforeSize) * 100).toFixed(1)}% vs original)\n`);
    } catch (error) {
      console.error(`❌ Error processing ${img.name}:`, error.message);
    }
  }

  console.log('✨ Image compression complete!');
}

compressImages().catch(console.error);
