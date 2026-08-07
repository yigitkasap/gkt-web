import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { validateAssetPath } from '../validate.js';

const router = Router();

// Public: only visible raffles are returned, and only if the page is active.
// backup_names is stripped — backups are admin-only data and must never leak publicly.
router.get('/', (req, res) => {
  try {
    const activeRow = db.prepare("SELECT value FROM settings WHERE key = 'raffles_page_active'").get();
    const isActive = activeRow?.value === 'true';
    if (!isActive) return res.status(404).json({ error: 'Sayfa aktif değil' });
    const rows = db.prepare('SELECT id, name, prize, winner_name, raffle_date, image_path, sort_order, is_visible, created_at FROM raffles WHERE is_visible = 1 ORDER BY sort_order ASC, id DESC').all();
    res.json(rows);
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// Admin: list everything regardless of visibility flag.
router.get('/all', requireAuth, (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM raffles ORDER BY sort_order ASC, id DESC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { name, prize, winner_name, backup_names, raffle_date, image_path, sort_order, is_visible } = req.body;
    const n = (name || '').trim();
    if (n.length < 2 || n.length > 200) return res.status(400).json({ error: 'Çekiliş adı 2-200 karakter olmalı' });
    if (prize && prize.length > 300) return res.status(400).json({ error: 'Ödül max 300 karakter' });
    if (winner_name && winner_name.length > 200) return res.status(400).json({ error: 'Kazanan adı max 200 karakter' });
    if (backup_names && backup_names.length > 5000) return res.status(400).json({ error: 'Yedek listesi max 5000 karakter' });
    if (raffle_date && !/^\d{4}-\d{2}-\d{2}$/.test(raffle_date)) return res.status(400).json({ error: 'Geçersiz tarih formatı' });
    if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });

    const result = db.prepare('INSERT INTO raffles (name, prize, winner_name, backup_names, raffle_date, image_path, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(n, (prize || '').trim(), (winner_name || '').trim(), (backup_names || '').trim(), raffle_date || '', image_path || '', parseInt(sort_order) || 0, is_visible ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM raffles WHERE id = ?').get(result.lastInsertRowid));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.put('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM raffles WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Çekiliş bulunamadı' });
    const { name, prize, winner_name, backup_names, raffle_date, image_path, sort_order, is_visible } = req.body;
    const n = name != null ? (name || '').trim() : existing.name;
    if (n.length < 2 || n.length > 200) return res.status(400).json({ error: 'Çekiliş adı 2-200 karakter olmalı' });
    if (prize != null && prize.length > 300) return res.status(400).json({ error: 'Ödül max 300 karakter' });
    if (winner_name != null && winner_name.length > 200) return res.status(400).json({ error: 'Kazanan adı max 200 karakter' });
    if (backup_names != null && backup_names.length > 5000) return res.status(400).json({ error: 'Yedek listesi max 5000 karakter' });
    if (raffle_date != null && raffle_date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(raffle_date)) return res.status(400).json({ error: 'Geçersiz tarih formatı' });
    if (image_path != null && image_path !== '' && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });

    db.prepare('UPDATE raffles SET name=?, prize=?, winner_name=?, backup_names=?, raffle_date=?, image_path=?, sort_order=?, is_visible=? WHERE id=?').run(
      n,
      (prize ?? existing.prize).trim(),
      (winner_name ?? existing.winner_name).trim(),
      (backup_names ?? existing.backup_names ?? '').trim(),
      raffle_date ?? existing.raffle_date,
      image_path ?? existing.image_path,
      parseInt(sort_order ?? existing.sort_order) || 0,
      (is_visible ?? existing.is_visible) ? 1 : 0,
      req.params.id
    );
    res.json(db.prepare('SELECT * FROM raffles WHERE id = ?').get(req.params.id));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM raffles WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Çekiliş bulunamadı' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

export default router;
