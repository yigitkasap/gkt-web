import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();

// GET /api/milestones — public
router.get('/', (req, res) => {
  const milestones = db.prepare('SELECT * FROM milestones ORDER BY sort_order ASC, year ASC').all();
  res.json(milestones);
});

// POST /api/milestones — editor+
router.post('/', requireAuth, (req, res) => {
  const { year, title, description, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlık gerekli' });

  const result = db.prepare(
    'INSERT INTO milestones (year, title, description, sort_order) VALUES (?, ?, ?, ?)'
  ).run(year || null, title, description || null, sort_order || 0);

  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(milestone);
});

// PUT /api/milestones/:id — editor+
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Dönüm noktası bulunamadı' });

  const { year, title, description, sort_order } = req.body;
  db.prepare('UPDATE milestones SET year=?, title=?, description=?, sort_order=? WHERE id=?').run(
    year ?? existing.year, title ?? existing.title, description ?? existing.description,
    sort_order ?? existing.sort_order, req.params.id
  );
  const updated = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/milestones/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM milestones WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Dönüm noktası bulunamadı' });
  res.json({ success: true });
});

export default router;
