import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'public', 'assets');

async function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let processed = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processed += await processDir(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    if (entry.name.includes('_thumb')) continue; // skip existing thumbnails

    const stats = fs.statSync(fullPath);
    // Skip small files (likely already optimized)
    if (stats.size < 50000) continue;

    const thumbName = entry.name.replace(ext, '_thumb.jpg');
    const thumbPath = path.join(dir, thumbName);

    // Skip if thumbnail already exists
    if (fs.existsSync(thumbPath)) continue;

    try {
      // Create thumbnail
      await sharp(fullPath)
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .rotate()
        .toFile(thumbPath);

      processed++;
      console.log(`✓ Thumbnail: ${entry.name} → ${thumbName}`);
    } catch (err) {
      console.warn(`✗ ${entry.name}: ${err.message}`);
    }
  }

  return processed;
}

console.log('Görseller taranıyor...');
const count = await processDir(assetsDir);
console.log(`\n🎉 ${count} görsel için thumbnail oluşturuldu`);
