import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sanitizeRichHtml, validateAssetPath } from '../validate.js';

const router = Router();

const slugify = (text) => text.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i').replace(/İ/g,'i').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

router.get('/', (req, res) => {
  let sql = 'SELECT * FROM blog_posts ORDER BY is_featured DESC, date DESC, id DESC';
  const params = [];
  if (req.query.limit) { sql += ' LIMIT ?'; params.push(parseInt(req.query.limit)); }
  const posts = db.prepare(sql).all(...params);
  res.json(posts);
});

// GET /api/blog/slug/:slug — public
router.get('/slug/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Yazı bulunamadı' });
  res.json(post);
});

router.get('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Yazı bulunamadı' });
  res.json(post);
});

function checkFeaturedLimit(is_featured, editingId) {
  if (!is_featured) return null;
  let count;
  if (editingId) {
    count = db.prepare('SELECT COUNT(*) as c FROM blog_posts WHERE is_featured = 1 AND id != ?').get(editingId);
  } else {
    count = db.prepare('SELECT COUNT(*) as c FROM blog_posts WHERE is_featured = 1').get();
  }
  if ((count?.c || 0) >= 3) return 'En fazla 3 yazı öne çıkarılabilir';
  return null;
}

router.post('/', requireAuth, (req, res) => {
  const { title, date, category, excerpt, content, is_featured, cover_image } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlık gerekli' });
  if (cover_image && !validateAssetPath(cover_image)) return res.status(400).json({ error: 'Geçersiz kapak görseli yolu' });
  const err = checkFeaturedLimit(is_featured, null);
  if (err) return res.status(400).json({ error: err });
  const slug = slugify(title);
  const safeContent = content != null ? sanitizeRichHtml(content) : null;
  const result = db.prepare(
    'INSERT INTO blog_posts (title, date, category, excerpt, content, is_featured, slug, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, date || null, category || null, excerpt || null, safeContent, is_featured || 0, slug, cover_image || null);
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Yazı bulunamadı' });
  const { title, date, category, excerpt, content, is_featured, cover_image } = req.body;
  if (cover_image && !validateAssetPath(cover_image)) return res.status(400).json({ error: 'Geçersiz kapak görseli yolu' });
  const newFeatured = is_featured ?? existing.is_featured;
  const safeContent = content != null ? sanitizeRichHtml(content) : existing.content;
  if (newFeatured && !existing.is_featured) {
    const err = checkFeaturedLimit(true, req.params.id);
    if (err) return res.status(400).json({ error: err });
  }
  // Slug is locked after creation to preserve SEO and avoid breaking shared links.
  const finalSlug = existing.slug || (title ? slugify(title) : '');
  db.prepare(
    "UPDATE blog_posts SET title=?, date=?, category=?, excerpt=?, content=?, is_featured=?, slug=?, cover_image=?, updated_at=datetime('now') WHERE id=?"
  ).run(title ?? existing.title, date ?? existing.date, category ?? existing.category, excerpt ?? existing.excerpt, safeContent, newFeatured, finalSlug, cover_image ?? existing.cover_image, req.params.id);
  const updated = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Yazı bulunamadı' });
  res.json({ success: true });
});

export default router;
