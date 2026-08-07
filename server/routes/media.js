import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', '..', 'public', 'assets');
const uploadDir = path.join(assetsDir, 'uploads');

const router = Router();

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

function scanDir(dir, prefix = '/assets') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = prefix + '/' + entry.name;
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath, relativePath));
    } else if (!entry.name.startsWith('.') && IMAGE_EXTS.includes(path.extname(entry.name).toLowerCase())) {
      const stats = fs.statSync(fullPath);
      results.push({
        filename: entry.name,
        path: relativePath,
        fullDiskPath: fullPath,
        size: stats.size,
        sizeFormatted: formatSize(stats.size),
        type: getMimeType(path.extname(entry.name)),
        createdAt: stats.birthtime || stats.mtime,
        folder: prefix.replace('/assets', '') || '/',
      });
    }
  }
  return results;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getMimeType(ext) {
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

// Hardcoded site assets used in App.jsx/components (not in DB)
const HARDCODED_ASSETS = [
  '/assets/logo_gkt.png',
  '/assets/ugz/ugz-17-kapak.jpg',
];

function getFileUsage(filePath) {
  const usage = [];

  // Check hardcoded references
  if (HARDCODED_ASSETS.includes(filePath)) {
    usage.push({ type: 'site', id: 0, label: 'Site: Sabit kullanım (kod içinde)' });
  }

  try {
    const teamRefs = db.prepare("SELECT id, name FROM team_members WHERE image_path = ?").all(filePath);
    teamRefs.forEach(r => usage.push({ type: 'team', id: r.id, label: 'Ekip: ' + r.name }));

    const blogRefs = db.prepare("SELECT id, title FROM blog_posts WHERE cover_image = ?").all(filePath);
    blogRefs.forEach(r => usage.push({ type: 'blog', id: r.id, label: 'Blog: ' + r.title }));

    const sponsorRefs = db.prepare("SELECT id, name FROM sponsors WHERE logo_path = ?").all(filePath);
    sponsorRefs.forEach(r => usage.push({ type: 'sponsor', id: r.id, label: 'Sponsor: ' + r.name }));

    const eventRefs = db.prepare("SELECT id, title FROM events WHERE image_path = ?").all(filePath);
    eventRefs.forEach(r => usage.push({ type: 'event', id: r.id, label: 'Etkinlik: ' + r.title }));

    const activityRefs = db.prepare("SELECT id, title FROM activities WHERE image_path = ?").all(filePath);
    activityRefs.forEach(r => usage.push({ type: 'activity', id: r.id, label: 'Aktivite: ' + r.title }));

    const speakerRefs = db.prepare("SELECT id, name FROM ugz_speakers WHERE image_path = ?").all(filePath);
    speakerRefs.forEach(r => usage.push({ type: 'ugz_speaker', id: r.id, label: 'UGZ Konuşmacı: ' + r.name }));

    const ugzSponsorRefs = db.prepare("SELECT id, name FROM ugz_sponsors WHERE logo_path = ?").all(filePath);
    ugzSponsorRefs.forEach(r => usage.push({ type: 'ugz_sponsor', id: r.id, label: 'UGZ Sponsor: ' + r.name }));

    // Settings (ugz cover, etc.)
    const settingRefs = db.prepare("SELECT key FROM settings WHERE value = ?").all(filePath);
    settingRefs.forEach(r => usage.push({ type: 'setting', id: 0, label: 'Ayar: ' + r.key }));

    const blogContentRefs = db.prepare("SELECT id, title FROM blog_posts WHERE content LIKE ?").all('%' + filePath + '%');
    blogContentRefs.forEach(r => {
      if (!usage.find(u => u.type === 'blog' && u.id === r.id)) {
        usage.push({ type: 'blog_content', id: r.id, label: 'Blog İçerik: ' + r.title });
      }
    });
  } catch {}

  return usage;
}

// GET /api/media — list all media files from public/assets/
router.get('/', requireAuth, (req, res) => {
  try {
    const allFiles = scanDir(assetsDir)
      .map(f => ({ ...f, usedIn: getFileUsage(f.path) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allFiles);
  } catch (err) {
    res.status(500).json({ error: 'Dosyalar listelenemedi' });
  }
});

// GET /api/media/stats
router.get('/stats', requireAuth, (req, res) => {
  try {
    const allFiles = scanDir(assetsDir);
    let totalSize = 0;
    let used = 0;
    let unused = 0;

    for (const f of allFiles) {
      totalSize += f.size;
      if (getFileUsage(f.path).length > 0) used++;
      else unused++;
    }

    res.json({ total: allFiles.length, totalSize: formatSize(totalSize), totalSizeBytes: totalSize, used, unused });
  } catch {
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// DELETE /api/media/:filename — only from uploads folder
router.delete('/:filename', requireAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const force = req.query.force === 'true';

    // Path traversal protection
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Geçersiz dosya adı' });
    }

    const fullPath = path.join(uploadDir, filename);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'Dosya bulunamadı veya uploads dışında' });

    const filePath = '/assets/uploads/' + filename;
    const usage = getFileUsage(filePath);
    if (usage.length > 0 && !force) {
      return res.status(400).json({ error: 'Bu dosya kullanımda: ' + usage.map(u => u.label).join(', '), usedIn: usage });
    }

    fs.unlinkSync(fullPath);
    res.json({ success: true, deleted: filename });
  } catch {
    res.status(500).json({ error: 'Dosya silinemedi' });
  }
});

export default router;
