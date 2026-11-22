import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin, requireKoordinator, optionalAuth } from '../auth.js';
import { validateUrl, validateAssetPath } from '../validate.js';

const router = Router();

// Herkese açık yanıtta telefon ve e-posta yer almaz (KVKK: veri minimizasyonu).
// Giriş yapmış ekip (panel) tüm alanları görür.
const PUBLIC_COLUMNS = 'id, name, role_title, department, image_path, linkedin, sort_order, is_board, created_at';

// Ekip, panelde "Ekibi sitede göster" (settings.team_public = 'true') açılana kadar herkese açık uçta görünmez.
const teamIsPublic = () => db.prepare("SELECT value FROM settings WHERE key = 'team_public'").get()?.value === 'true';

// GET /api/team — public (supports ?board=1, ?department=X)
router.get('/', (req, res) => {
  const staff = optionalAuth(req);
  if (!staff && !teamIsPublic()) return res.json([]);
  let sql = `SELECT ${staff ? '*' : PUBLIC_COLUMNS} FROM team_members`;
  const conditions = [];
  const params = [];
  if (req.query.board !== undefined) { conditions.push('is_board = ?'); params.push(parseInt(req.query.board)); }
  if (req.query.department) { conditions.push('department = ?'); params.push(req.query.department); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY sort_order ASC, id ASC';
  const members = db.prepare(sql).all(...params);
  res.json(members);
});

router.get('/:id', (req, res) => {
  const staff = optionalAuth(req);
  if (!staff && !teamIsPublic()) return res.status(404).json({ error: 'Üye bulunamadı' });
  const member = db.prepare(`SELECT ${staff ? '*' : PUBLIC_COLUMNS} FROM team_members WHERE id = ?`).get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Üye bulunamadı' });
  res.json(member);
});

// POST /api/team — admin or koordinator (own dept only for koordinator)
router.post('/', requireKoordinator, (req, res) => {
  const { name, role_title, department, image_path, phone, email, linkedin, sort_order, is_board } = req.body;
  if (!name) return res.status(400).json({ error: 'İsim gerekli' });
  if (req.user.role === 'koordinator' && department !== req.user.department) {
    return res.status(403).json({ error: 'Sadece kendi departmanınıza üye ekleyebilirsiniz' });
  }
  if (linkedin && !validateUrl(linkedin)) return res.status(400).json({ error: 'LinkedIn URL http(s) ile başlamalı' });
  if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });
  const autoBoard = department === 'Yönetim Kurulu' ? 1 : 0;
  const result = db.prepare(
    'INSERT INTO team_members (name, role_title, department, image_path, phone, email, linkedin, sort_order, is_board) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, role_title || null, department || null, image_path || null, phone || null, email || null, linkedin || null, sort_order || 0, is_board ?? autoBoard);
  const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(member);
});

// PUT /api/team/:id — admin, koordinator (own dept), direktor (own dept)
router.put('/:id', requireAuth, (req, res) => {
  if (!['admin', 'koordinator', 'direktor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Yetkiniz yok' });
  }
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Üye bulunamadı' });
  if (req.user.role !== 'admin' && existing.department !== req.user.department) {
    return res.status(403).json({ error: 'Sadece kendi departmanınızdaki üyeleri düzenleyebilirsiniz' });
  }
  const { name, role_title, department, image_path, phone, email, linkedin, sort_order, is_board } = req.body;
  if (linkedin && !validateUrl(linkedin)) return res.status(400).json({ error: 'LinkedIn URL http(s) ile başlamalı' });
  if (image_path && !validateAssetPath(image_path)) return res.status(400).json({ error: 'Geçersiz görsel yolu' });
  const finalDept = department ?? existing.department;
  const autoBoard = finalDept === 'Yönetim Kurulu' ? 1 : 0;
  db.prepare(
    'UPDATE team_members SET name=?, role_title=?, department=?, image_path=?, phone=?, email=?, linkedin=?, sort_order=?, is_board=? WHERE id=?'
  ).run(
    name ?? existing.name, role_title ?? existing.role_title, finalDept,
    image_path ?? existing.image_path, phone ?? existing.phone, email ?? existing.email,
    linkedin ?? existing.linkedin, sort_order ?? existing.sort_order, is_board ?? autoBoard,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/team/:id — admin or koordinator (own dept)
router.delete('/:id', requireKoordinator, (req, res) => {
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Üye bulunamadı' });
  if (req.user.role === 'koordinator' && existing.department !== req.user.department) {
    return res.status(403).json({ error: 'Sadece kendi departmanınızdaki üyeleri silebilirsiniz' });
  }
  db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
