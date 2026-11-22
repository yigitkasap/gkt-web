import { Router } from 'express';
import db from '../db.js';
import { requireAdmin, optionalAuth } from '../auth.js';

const router = Router();

// Herkese açık siteye yalnızca bu anahtarlar gider. Yeni bir ayar herkese açık olacaksa buraya ekle;
// eklenmeyen anahtarlar (ileride eklenecek iç ayarlar, anahtarlar vb.) yalnızca giriş yapmış ekibe döner.
const PUBLIC_KEY = /^(contact_|social_|stat_)[a-z0-9_]+$|^(instagram_posts|raffles_page_active|team_public)$/;

// GET /api/settings — herkese açık anahtarlar; giriş yapmış ekip hepsini görür
router.get('/', (req, res) => {
  const staff = optionalAuth(req);
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { if (staff || PUBLIC_KEY.test(r.key)) settings[r.key] = r.value; });
  res.json(settings);
});

// PUT /api/settings — admin only
router.put('/', requireAdmin, (req, res) => {
  const { key, value } = req.body;
  if (!key || typeof key !== 'string' || !/^[a-z0-9_]{1,64}$/.test(key)) return res.status(400).json({ error: 'Geçersiz ayar anahtarı' });
  if (value != null && String(value).length > 20000) return res.status(400).json({ error: 'Ayar değeri çok uzun' });

  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
  res.json({ key, value });
});

export default router;
