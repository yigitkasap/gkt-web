import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireKoordinator } from '../auth.js';
import { validateAssetPath } from '../validate.js';

// GKT Club Card anlaşmalı işletmeleri. Liste panelden yönetilir (Panel → Club Card).
// Herkese açık uç yalnızca yayındaki işletmeleri döndürür.

const router = Router();

const CONTACTS = ['maps', 'whatsapp', 'none'];
const MAPS_URL = /^https:\/\/(www\.)?(google\.[a-z.]{2,6}\/maps|maps\.google\.[a-z.]{2,6}|maps\.app\.goo\.gl|goo\.gl\/maps)\/?[^\s<>"']{0,500}$/;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const parseOffers = (raw) => { try { const o = JSON.parse(raw || '[]'); return Array.isArray(o) ? o : []; } catch { return []; } };

function toPublic(row) {
  return {
    id: row.id, name: row.name, category: row.category, branch: row.branch, logo_path: row.logo_path,
    offers: parseOffers(row.offers), conditions: row.conditions, contact: row.contact,
    whatsapp: row.contact === 'whatsapp' ? row.whatsapp : '', maps_url: row.maps_url, sort_order: row.sort_order,
  };
}

function toAdmin(row) {
  return { ...toPublic(row), whatsapp: row.whatsapp, is_active: row.is_active };
}

/** Gelen gövdeyi doğrular; { data } ya da { error } döner. */
function validatePartner(b) {
  const name = str(b.name, 100);
  if (!name) return { error: 'İşletme adı gerekli' };

  const logo_path = str(b.logo_path, 220);
  if (logo_path && !validateAssetPath(logo_path)) return { error: 'Geçersiz logo yolu' };

  if (!Array.isArray(b.offers) || b.offers.length === 0) return { error: 'En az bir indirim ya da ayrıcalık gerekli' };
  if (b.offers.length > 4) return { error: 'En fazla 4 indirim satırı eklenebilir' };
  const offers = [];
  for (const o of b.offers) {
    const scope = str(o?.scope, 80);
    const hasDiscount = o?.discount !== null && o?.discount !== undefined && o?.discount !== '';
    if (hasDiscount) {
      const d = Number(o.discount);
      if (!Number.isInteger(d) || d < 1 || d > 100) return { error: 'İndirim oranı 1 ile 100 arasında tam sayı olmalı' };
      offers.push({ discount: d, scope });
    } else {
      if (!scope) return { error: 'Oranı boş bırakılan satıra ayrıcalık metni yazılmalı' };
      offers.push({ discount: null, scope });
    }
  }

  const conditions = str(b.conditions, 600).split('\n').map(s => s.trim()).filter(Boolean).slice(0, 6).join('\n');

  const contact = CONTACTS.includes(b.contact) ? b.contact : 'maps';
  const whatsapp = str(b.whatsapp, 30).replace(/[^\d]/g, '');
  if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) return { error: 'WhatsApp numarası ülke koduyla 10–15 rakam olmalı (örn. 905xxxxxxxxx)' };

  const maps_url = str(b.maps_url, 500);
  if (maps_url && !MAPS_URL.test(maps_url)) return { error: 'Harita bağlantısı bir Google Haritalar adresi olmalı' };

  const sort_order = Number.isInteger(Number(b.sort_order)) ? Number(b.sort_order) : 0;
  const is_active = b.is_active === false || b.is_active === 0 ? 0 : 1;

  return { data: { name, category: str(b.category, 60), branch: str(b.branch, 80), logo_path, offers: JSON.stringify(offers), conditions, contact, whatsapp, maps_url, sort_order, is_active } };
}

// ── İlk kurulum: tablo boşsa src/clubcardData.js listesiyle doldur (yalnızca bir kez) ──
try {
  const seeded = db.prepare("SELECT value FROM settings WHERE key = 'clubcard_seeded'").get();
  if (!seeded) {
    const count = db.prepare('SELECT COUNT(*) AS c FROM clubcard_partners').get().c;
    if (count === 0) {
      const { CLUBCARD_PARTNERS, CLUBCARD_PERIOD } = await import('../../src/clubcardData.js');
      const ins = db.prepare('INSERT INTO clubcard_partners (name, category, branch, logo_path, offers, conditions, contact, whatsapp, maps_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const p of CLUBCARD_PARTNERS) {
        const { data } = validatePartner(p);
        if (data) ins.run(data.name, data.category, data.branch, data.logo_path, data.offers, data.conditions, data.contact, data.whatsapp, data.maps_url, 1, data.sort_order);
      }
      db.prepare("INSERT INTO settings (key, value) VALUES ('clubcard_period', ?) ON CONFLICT(key) DO NOTHING").run(CLUBCARD_PERIOD);
      console.log(`[clubcard] ${CLUBCARD_PARTNERS.length} işletme başlangıç verisinden eklendi.`);
    }
    db.prepare("INSERT INTO settings (key, value) VALUES ('clubcard_seeded', 'true') ON CONFLICT(key) DO NOTHING").run();
  }
} catch (e) {
  console.error('[clubcard] başlangıç verisi eklenemedi:', e.message);
}

const period = () => db.prepare("SELECT value FROM settings WHERE key = 'clubcard_period'").get()?.value || '';

// GET /api/clubcard — herkese açık: dönem + yayındaki işletmeler
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM clubcard_partners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all();
  res.json({ period: period(), partners: rows.map(toPublic) });
});

// GET /api/clubcard/all — panel: yayında olmayanlar dahil
router.get('/all', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM clubcard_partners ORDER BY sort_order ASC, id ASC').all();
  res.json({ period: period(), partners: rows.map(toAdmin) });
});

// PUT /api/clubcard/period — koordinatör+
router.put('/period', requireKoordinator, (req, res) => {
  const value = str(req.body?.period, 40);
  if (!value) return res.status(400).json({ error: 'Dönem boş olamaz' });
  db.prepare("INSERT INTO settings (key, value) VALUES ('clubcard_period', ?) ON CONFLICT(key) DO UPDATE SET value = ?").run(value, value);
  res.json({ period: value });
});

// POST /api/clubcard — koordinatör+
router.post('/', requireKoordinator, (req, res) => {
  const { data, error } = validatePartner(req.body || {});
  if (error) return res.status(400).json({ error });
  if (!req.body.sort_order) data.sort_order = (db.prepare('SELECT MAX(sort_order) AS m FROM clubcard_partners').get().m || 0) + 10;
  const r = db.prepare('INSERT INTO clubcard_partners (name, category, branch, logo_path, offers, conditions, contact, whatsapp, maps_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(data.name, data.category, data.branch, data.logo_path, data.offers, data.conditions, data.contact, data.whatsapp, data.maps_url, data.is_active, data.sort_order);
  res.status(201).json(toAdmin(db.prepare('SELECT * FROM clubcard_partners WHERE id = ?').get(r.lastInsertRowid)));
});

// PUT /api/clubcard/:id — koordinatör+ (eksik alanlar mevcut değerle tamamlanır)
router.put('/:id', requireKoordinator, (req, res) => {
  const existing = db.prepare('SELECT * FROM clubcard_partners WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'İşletme bulunamadı' });
  const merged = { ...toAdmin(existing), ...(req.body || {}) };
  const { data, error } = validatePartner(merged);
  if (error) return res.status(400).json({ error });
  db.prepare('UPDATE clubcard_partners SET name=?, category=?, branch=?, logo_path=?, offers=?, conditions=?, contact=?, whatsapp=?, maps_url=?, is_active=?, sort_order=? WHERE id=?')
    .run(data.name, data.category, data.branch, data.logo_path, data.offers, data.conditions, data.contact, data.whatsapp, data.maps_url, data.is_active, data.sort_order, req.params.id);
  res.json(toAdmin(db.prepare('SELECT * FROM clubcard_partners WHERE id = ?').get(req.params.id)));
});

// DELETE /api/clubcard/:id — koordinatör+
router.delete('/:id', requireKoordinator, (req, res) => {
  const r = db.prepare('DELETE FROM clubcard_partners WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'İşletme bulunamadı' });
  res.json({ success: true });
});

export default router;
