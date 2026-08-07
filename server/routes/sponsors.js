import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin, requireKoordinator } from '../auth.js';
import { validateAssetPath } from '../validate.js';

const router = Router();

// Annual sponsorship categories from the sponsorship kit. Empty string means
// "uncategorized" and is accepted so legacy rows keep working until re-assigned.
const VALID_SPONSOR_CATEGORIES = ['', 'ana', 'urun'];

// GET /api/sponsors — public
router.get('/', (req, res) => {
  const sponsors = db.prepare('SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC').all();
  res.json(sponsors);
});

// POST /api/sponsors — editor+
router.post('/', requireAuth, (req, res) => {
  const { name, logo_path, category, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: 'İsim gerekli' });
  if (logo_path && !validateAssetPath(logo_path)) return res.status(400).json({ error: 'Geçersiz logo yolu' });
  if (category != null && !VALID_SPONSOR_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Geçersiz kategori' });

  const result = db.prepare('INSERT INTO sponsors (name, logo_path, category, sort_order) VALUES (?, ?, ?, ?)')
    .run(name, logo_path || null, category || '', sort_order || 0);
  const sponsor = db.prepare('SELECT * FROM sponsors WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(sponsor);
});

// PUT /api/sponsors/:id — editor+
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM sponsors WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Sponsor bulunamadı' });

  const { name, logo_path, category, sort_order } = req.body;
  if (logo_path && !validateAssetPath(logo_path)) return res.status(400).json({ error: 'Geçersiz logo yolu' });
  if (category != null && !VALID_SPONSOR_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Geçersiz kategori' });
  db.prepare('UPDATE sponsors SET name=?, logo_path=?, category=?, sort_order=? WHERE id=?').run(
    name ?? existing.name,
    logo_path ?? existing.logo_path,
    category ?? existing.category,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM sponsors WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/sponsors/:id — koordinator+
router.delete('/:id', requireKoordinator, (req, res) => {
  const result = db.prepare('DELETE FROM sponsors WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Sponsor bulunamadı' });
  res.json({ success: true });
});

export default router;
