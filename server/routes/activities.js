import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { validateAssetPath } from '../validate.js';

const router = Router();

// GET /api/activities — public
router.get('/', (req, res) => {
  const activities = db.prepare('SELECT * FROM activities ORDER BY sort_order ASC, id ASC').all();
  res.json(activities);
});

// POST /api/activities — editor+
router.post('/', requireAuth, (req, res) => {
  const { title, description, image_path, icon_name, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlık gerekli' });
  if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });

  const result = db.prepare(
    'INSERT INTO activities (title, description, image_path, icon_name, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description || null, image_path || null, icon_name || null, sort_order || 0);

  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(activity);
});

// PUT /api/activities/:id — editor+
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Aktivite bulunamadı' });

  const { title, description, image_path, icon_name, sort_order } = req.body;
  if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });
  db.prepare('UPDATE activities SET title=?, description=?, image_path=?, icon_name=?, sort_order=? WHERE id=?').run(
    title ?? existing.title, description ?? existing.description, image_path ?? existing.image_path,
    icon_name ?? existing.icon_name, sort_order ?? existing.sort_order, req.params.id
  );
  const updated = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/activities/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Aktivite bulunamadı' });
  res.json({ success: true });
});

export default router;
