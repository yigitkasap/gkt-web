import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin, requireDirektor } from '../auth.js';
import { validateAssetPath } from '../validate.js';

const router = Router();

// GET /api/events — public (supports ?upcoming=1 or ?upcoming=0 and ?limit=3)
router.get('/', (req, res) => {
  let sql = 'SELECT * FROM events';
  const params = [];
  // Tarihi geçen etkinlik, panelde "yaklaşan" işaretli kalsa bile otomatik olarak geçmiş sayılır.
  // Yalnızca YYYY-MM-DD biçimli tarihler karşılaştırılır; boş/serbest metin tarihler bayrağa göre kalır.
  const ISO = "date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*'";
  const PASSED = `(${ISO} AND substr(date, 1, 10) < date('now', 'localtime'))`;
  if (req.query.upcoming !== undefined) {
    sql += parseInt(req.query.upcoming) === 1
      ? ` WHERE is_upcoming = 1 AND NOT ${PASSED}`
      : ` WHERE (is_upcoming = 0 OR ${PASSED})`;
  }
  sql += ' ORDER BY sort_order ASC, date DESC, id DESC';
  if (req.query.limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(req.query.limit));
  }
  const events = db.prepare(sql).all(...params);
  res.json(events);
});

// GET /api/events/:id — public
router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadı' });
  res.json(event);
});

// POST /api/events — editor+
router.post('/', requireAuth, (req, res) => {
  const { title, date, location, category, description, color, is_upcoming, sort_order, image_path } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlık gerekli' });
  if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });

  const result = db.prepare(
    'INSERT INTO events (title, date, location, category, description, color, is_upcoming, sort_order, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, date || null, location || null, category || null, description || null, color || null, is_upcoming ?? 1, sort_order || 0, image_path || '');

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

// PUT /api/events/:id — editor+
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Etkinlik bulunamadı' });

  const { title, date, location, category, description, color, is_upcoming, sort_order, image_path } = req.body;
  if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });
  db.prepare(
    'UPDATE events SET title=?, date=?, location=?, category=?, description=?, color=?, is_upcoming=?, sort_order=?, image_path=? WHERE id=?'
  ).run(
    title ?? existing.title, date ?? existing.date, location ?? existing.location,
    category ?? existing.category, description ?? existing.description, color ?? existing.color,
    is_upcoming ?? existing.is_upcoming, sort_order ?? existing.sort_order,
    image_path ?? existing.image_path, req.params.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/events/:id — direktor+
router.delete('/:id', requireDirektor, (req, res) => {
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Etkinlik bulunamadı' });
  res.json({ success: true });
});

export default router;
