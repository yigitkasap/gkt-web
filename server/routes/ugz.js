import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireKoordinator, requireAdmin } from '../auth.js';
import { validateAssetPath } from '../validate.js';

const router = Router();

// Key whitelist for UGZ settings
const VALID_UGZ_KEYS = [
  'ugz_title', 'ugz_subtitle', 'ugz_date', 'ugz_time', 'ugz_location',
  'ugz_registration_open', 'ugz_registration_url', 'ugz_registration_visible',
  'ugz_speakers_visible', 'ugz_program_visible', 'ugz_sponsors_visible',
  'ugz_countdown_visible', 'ugz_page_active',
  'ugz_edition_mode', 'ugz_edition_number', 'ugz_base_year', 'ugz_base_number'
];

const VALID_SESSION_TYPES = ['opening', 'keynote', 'panel', 'workshop', 'talk', 'networking', 'break', 'closing'];
// UGZ sponsorship categories (hierarchy ordered). 'ana' sits above 'platin' per admin request.
const VALID_TIERS = ['ana', 'platin', 'altin', 'gumus', 'logo', 'cekilis', 'iletisim', 'medya', 'konaklama', 'promosyon', 'giyim', 'urun', 'yiyecek-icecek', 'ulasim', 'paydas'];

function validateUrl(url) {
  if (!url || url.trim() === '') return true;
  const u = url.trim().toLowerCase();
  return u.startsWith('http://') || u.startsWith('https://');
}

// Normalise free-form values for date/time settings before persisting.
function normaliseSettingValue(key, value) {
  const v = String(value ?? '');
  if (key === 'ugz_date') {
    if (v === '') return '';
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
  }
  if (key === 'ugz_time') {
    if (v === '') return '';
    const m = v.match(/^(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : '';
  }
  return v;
}

// === PUBLIC ===

router.get('/settings', (req, res) => {
  try {
    res.json(db.prepare('SELECT key, value FROM ugz_settings').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/speakers', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM ugz_speakers WHERE is_visible = 1 ORDER BY sort_order ASC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/program', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM ugz_program WHERE is_visible = 1 ORDER BY sort_order ASC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/sponsors', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM ugz_sponsors WHERE is_visible = 1 ORDER BY sort_order ASC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// === ADMIN (all visible, including hidden) ===

router.get('/speakers/all', requireAuth, (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM ugz_speakers ORDER BY sort_order ASC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/program/all', requireAuth, (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM ugz_program ORDER BY sort_order ASC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/sponsors/all', requireAuth, (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM ugz_sponsors ORDER BY sort_order ASC').all());
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// === UGZ SETTINGS ===

router.put('/settings', requireKoordinator, (req, res) => {
  try {
    const { key, value, settings } = req.body;
    // Bulk update
    if (settings && typeof settings === 'object') {
      const update = db.prepare('UPDATE ugz_settings SET value = ? WHERE key = ?');
      const insert = db.prepare('INSERT INTO ugz_settings (key, value) VALUES (?, ?)');
      const exists = db.prepare('SELECT 1 FROM ugz_settings WHERE key = ?');
      let count = 0;
      for (const [k, v] of Object.entries(settings)) {
        if (!VALID_UGZ_KEYS.includes(k)) continue;
        const normalised = normaliseSettingValue(k, v);
        if (exists.get(k)) update.run(normalised, k);
        else insert.run(k, normalised);
        count++;
      }
      return res.json({ success: true, updated: count });
    }
    // Single update
    if (!key) return res.status(400).json({ error: 'Key gerekli' });
    if (!VALID_UGZ_KEYS.includes(key)) return res.status(400).json({ error: 'Geçersiz ayar anahtarı' });
    const normalised = normaliseSettingValue(key, value);
    if (db.prepare('SELECT 1 FROM ugz_settings WHERE key = ?').get(key)) {
      db.prepare('UPDATE ugz_settings SET value = ? WHERE key = ?').run(normalised, key);
    } else {
      db.prepare('INSERT INTO ugz_settings (key, value) VALUES (?, ?)').run(key, normalised);
    }
    res.json({ key, value: normalised });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// === SPEAKERS CRUD ===

router.post('/speakers', requireKoordinator, (req, res) => {
  try {
    const { name, title, company, image_path, bio, sort_order, is_visible } = req.body;
    const n = (name || '').trim();
    if (n.length < 2 || n.length > 100) return res.status(400).json({ error: 'İsim 2-100 karakter olmalı' });
    if (title && title.length > 100) return res.status(400).json({ error: 'Unvan max 100 karakter' });
    if (company && company.length > 100) return res.status(400).json({ error: 'Firma max 100 karakter' });
    if (bio && bio.length > 2000) return res.status(400).json({ error: 'Biyografi max 2000 karakter' });
    if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });
    const result = db.prepare('INSERT INTO ugz_speakers (name, title, company, image_path, bio, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)').run(n, (title || '').trim(), (company || '').trim(), image_path || '', (bio || '').trim(), parseInt(sort_order) || 0, is_visible ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM ugz_speakers WHERE id = ?').get(result.lastInsertRowid));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.put('/speakers/:id', requireKoordinator, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ugz_speakers WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Konuşmacı bulunamadı' });
    const { name, title, company, image_path, bio, sort_order, is_visible } = req.body;
    const n = name != null ? (name || '').trim() : existing.name;
    if (n.length < 2 || n.length > 100) return res.status(400).json({ error: 'İsim 2-100 karakter olmalı' });
    if (title != null && title.length > 100) return res.status(400).json({ error: 'Unvan max 100 karakter' });
    if (company != null && company.length > 100) return res.status(400).json({ error: 'Firma max 100 karakter' });
    if (bio != null && bio.length > 2000) return res.status(400).json({ error: 'Biyografi max 2000 karakter' });
    if (image_path != null && image_path !== '' && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });
    db.prepare('UPDATE ugz_speakers SET name=?, title=?, company=?, image_path=?, bio=?, sort_order=?, is_visible=? WHERE id=?').run(n, (title ?? existing.title).trim(), (company ?? existing.company).trim(), image_path ?? existing.image_path, (bio ?? existing.bio).trim(), parseInt(sort_order ?? existing.sort_order) || 0, (is_visible ?? existing.is_visible) ? 1 : 0, req.params.id);
    res.json(db.prepare('SELECT * FROM ugz_speakers WHERE id = ?').get(req.params.id));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.delete('/speakers/:id', requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ugz_speakers WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Konuşmacı bulunamadı' });
    db.prepare('DELETE FROM ugz_speakers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// === PROGRAM CRUD ===

router.post('/program', requireKoordinator, (req, res) => {
  try {
    const { time, title, description, speaker_name, session_type, sort_order, is_visible } = req.body;
    const t = (time || '').trim(), ti = (title || '').trim();
    if (!t || t.length > 50) return res.status(400).json({ error: 'Saat gerekli (max 50 karakter)' });
    if (ti.length < 2 || ti.length > 200) return res.status(400).json({ error: 'Başlık 2-200 karakter olmalı' });
    if (description && description.length > 2000) return res.status(400).json({ error: 'Açıklama max 2000 karakter' });
    if (speaker_name && speaker_name.length > 100) return res.status(400).json({ error: 'Konuşmacı max 100 karakter' });
    const st = VALID_SESSION_TYPES.includes(session_type) ? session_type : 'talk';
    const result = db.prepare('INSERT INTO ugz_program (time, title, description, speaker_name, session_type, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)').run(t, ti, (description || '').trim(), (speaker_name || '').trim(), st, parseInt(sort_order) || 0, is_visible ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM ugz_program WHERE id = ?').get(result.lastInsertRowid));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.put('/program/:id', requireKoordinator, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ugz_program WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Program öğesi bulunamadı' });
    const { time, title, description, speaker_name, session_type, sort_order, is_visible } = req.body;
    const t = time != null ? (time || '').trim() : existing.time;
    const ti = title != null ? (title || '').trim() : existing.title;
    if (!t || t.length > 50) return res.status(400).json({ error: 'Saat gerekli (max 50 karakter)' });
    if (ti.length < 2 || ti.length > 200) return res.status(400).json({ error: 'Başlık 2-200 karakter olmalı' });
    if (description != null && description.length > 2000) return res.status(400).json({ error: 'Açıklama max 2000 karakter' });
    const st = session_type != null ? (VALID_SESSION_TYPES.includes(session_type) ? session_type : existing.session_type) : existing.session_type;
    db.prepare('UPDATE ugz_program SET time=?, title=?, description=?, speaker_name=?, session_type=?, sort_order=?, is_visible=? WHERE id=?').run(t, ti, (description ?? existing.description).trim(), (speaker_name ?? existing.speaker_name).trim(), st, parseInt(sort_order ?? existing.sort_order) || 0, (is_visible ?? existing.is_visible) ? 1 : 0, req.params.id);
    res.json(db.prepare('SELECT * FROM ugz_program WHERE id = ?').get(req.params.id));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.delete('/program/:id', requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ugz_program WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Program öğesi bulunamadı' });
    db.prepare('DELETE FROM ugz_program WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// === SPONSORS CRUD ===

router.post('/sponsors', requireKoordinator, (req, res) => {
  try {
    const { name, logo_path, tier, website_url, sort_order, is_visible } = req.body;
    const n = (name || '').trim();
    if (n.length < 2 || n.length > 100) return res.status(400).json({ error: 'Sponsor adı 2-100 karakter olmalı' });
    if (!VALID_TIERS.includes(tier || 'gold')) return res.status(400).json({ error: 'Geçersiz sponsor seviyesi' });
    if (!validateUrl(website_url)) return res.status(400).json({ error: 'Website URL http:// veya https:// ile başlamalı' });
    if (website_url && website_url.length > 500) return res.status(400).json({ error: 'URL max 500 karakter' });
    if (logo_path && !validateAssetPath(logo_path)) return res.status(400).json({ error: 'Geçersiz logo yolu' });
    const result = db.prepare('INSERT INTO ugz_sponsors (name, logo_path, tier, website_url, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?)').run(n, logo_path || '', tier || 'gold', (website_url || '').trim(), parseInt(sort_order) || 0, is_visible ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM ugz_sponsors WHERE id = ?').get(result.lastInsertRowid));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.put('/sponsors/:id', requireKoordinator, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ugz_sponsors WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Sponsor bulunamadı' });
    const { name, logo_path, tier, website_url, sort_order, is_visible } = req.body;
    const n = name != null ? (name || '').trim() : existing.name;
    if (n.length < 2 || n.length > 100) return res.status(400).json({ error: 'Sponsor adı 2-100 karakter olmalı' });
    if (tier != null && !VALID_TIERS.includes(tier)) return res.status(400).json({ error: 'Geçersiz sponsor seviyesi' });
    if (website_url != null && !validateUrl(website_url)) return res.status(400).json({ error: 'Website URL http:// veya https:// ile başlamalı' });
    if (website_url != null && website_url.length > 500) return res.status(400).json({ error: 'URL max 500 karakter' });
    if (logo_path != null && logo_path !== '' && !validateAssetPath(logo_path)) return res.status(400).json({ error: 'Geçersiz logo yolu' });
    db.prepare('UPDATE ugz_sponsors SET name=?, logo_path=?, tier=?, website_url=?, sort_order=?, is_visible=? WHERE id=?').run(n, logo_path ?? existing.logo_path, tier ?? existing.tier, (website_url ?? existing.website_url).trim(), parseInt(sort_order ?? existing.sort_order) || 0, (is_visible ?? existing.is_visible) ? 1 : 0, req.params.id);
    res.json(db.prepare('SELECT * FROM ugz_sponsors WHERE id = ?').get(req.params.id));
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.delete('/sponsors/:id', requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ugz_sponsors WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Sponsor bulunamadı' });
    db.prepare('DELETE FROM ugz_sponsors WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

export default router;
