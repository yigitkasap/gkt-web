import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { generateToken, requireAuth, requireAdmin, tokenBlacklist } from '../auth.js';
import { sanitize, validateEmail, validateRole, validateDepartment, pickFields } from '../validate.js';

const router = Router();
const SUPER_ADMIN_ID = 1;
// Şifre kuralı (panel ipuçlarıyla aynı): 10-128 karakter.
const validNewPassword = (p) => typeof p === 'string' && p.length >= 10 && p.length <= 128;

// Brute force protection
const loginAttempts = new Map();
function checkLoginRate(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry) {
    entry.attempts = entry.attempts.filter(t => now - t < 900000); // 15 min window
    if (entry.attempts.length >= 5) return false;
    entry.attempts.push(now);
  } else {
    loginAttempts.set(ip, { attempts: [now] });
  }
  // Cleanup old entries every 100 calls
  if (loginAttempts.size > 1000) {
    for (const [k, v] of loginAttempts) { if (v.attempts.every(t => now - t > 900000)) loginAttempts.delete(k); }
  }
  return true;
}

// Super-login rate limiter
const superLoginAttempts = new Map();
function checkSuperRate(ip) {
  const now = Date.now();
  const entry = superLoginAttempts.get(ip);
  if (entry) {
    entry.attempts = entry.attempts.filter(t => now - t < 3600000);
    if (entry.attempts.length >= 5) return false;
    entry.attempts.push(now);
  } else {
    superLoginAttempts.set(ip, { attempts: [now] });
  }
  if (superLoginAttempts.size > 1000) {
    for (const [k, v] of superLoginAttempts) { if (v.attempts.every(t => now - t > 3600000)) superLoginAttempts.delete(k); }
  }
  return true;
}

router.post('/login', (req, res) => {
  try {
    const ip = req.ip || 'unknown';
    if (!checkLoginRate(ip)) return res.status(429).json({ error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar dene.' });

    const username = sanitize(req.body.username, 50);
    const password = req.body.password;
    if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    if (password.length > 128) return res.status(400).json({ error: 'Geçersiz şifre' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, display_name: user.display_name, department: user.department } });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.post('/super-login', (req, res) => {
  try {
    const ip = req.ip || 'unknown';
    if (!checkSuperRate(ip)) return res.status(429).json({ error: 'Çok fazla deneme. 1 saat sonra tekrar dene.' });

    const { secret, new_password } = req.body;
    const RECOVERY_SECRET = process.env.RECOVERY_SECRET;
    const given = Buffer.from(String(secret || ''));
    const expected = Buffer.from(String(RECOVERY_SECRET || ''));
    const ok = RECOVERY_SECRET && given.length === expected.length && crypto.timingSafeEqual(given, expected);
    if (!ok) {
      console.warn(`[SUPER-LOGIN FAIL] IP: ${ip}, Time: ${new Date().toISOString()}`);
      return res.status(403).json({ error: 'Geçersiz güvenlik anahtarı' });
    }

    const superAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(SUPER_ADMIN_ID);
    if (!superAdmin) return res.status(500).json({ error: 'Süper admin bulunamadı' });

    if (new_password && new_password.trim() && new_password.trim().length >= 8) {
      const hash = bcrypt.hashSync(new_password.trim(), 10);
      db.prepare('UPDATE users SET password_hash = ?, token_version = COALESCE(token_version, 0) + 1 WHERE id = ?').run(hash, SUPER_ADMIN_ID);
    }

    const token = generateToken(db.prepare('SELECT * FROM users WHERE id = ?').get(SUPER_ADMIN_ID));
    res.json({ token, user: { id: superAdmin.id, username: superAdmin.username, role: superAdmin.role, display_name: superAdmin.display_name, department: superAdmin.department } });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, role, display_name, department, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.post('/logout', requireAuth, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    tokenBlacklist.add(token);
    // Hold the token in the blacklist until its JWT expiry (24h matches generateToken)
    // so a stolen-after-logout token can't be reused for the rest of its lifetime.
    const t = setTimeout(() => tokenBlacklist.delete(token), 24 * 3600000);
    if (typeof t.unref === 'function') t.unref();
  }
  res.json({ success: true });
});

router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, role, display_name, department, created_at FROM users').all();
    res.json(users);
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.post('/users', requireAdmin, (req, res) => {
  try {
    const data = pickFields(req.body, ['username', 'password', 'role', 'display_name', 'department']);
    const username = sanitize(data.username, 50);
    const password = data.password;
    const role = data.role;
    const display_name = sanitize(data.display_name, 100);
    const department = data.department;

    if (!username || username.length < 2) return res.status(400).json({ error: 'Kullanıcı adı en az 2 karakter olmalı' });
    if (!validNewPassword(password)) return res.status(400).json({ error: 'Şifre 10-128 karakter olmalı' });
    if (role && !validateRole(role)) return res.status(400).json({ error: 'Geçersiz rol' });
    if (['koordinator', 'direktor'].includes(role) && !validateDepartment(department)) return res.status(400).json({ error: 'Geçerli bir departman seçin' });

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(409).json({ error: 'Bu kullanıcı adı zaten mevcut' });

    const hash = bcrypt.hashSync(password, 10);
    const r = role || 'direktor';
    const result = db.prepare('INSERT INTO users (username, password_hash, role, display_name, department) VALUES (?, ?, ?, ?, ?)').run(username, hash, r, display_name || username, department || null);
    res.status(201).json({ id: result.lastInsertRowid, username, role: r, display_name: display_name || username, department: department || null });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// ═══════ ŞİFRE İŞLEMLERİ ═══════
// Şifre değişince token_version artar: o hesabın açık tüm oturumları anında geçersiz olur.

// PUT /api/auth/password — giriş yapmış kullanıcı kendi şifresini değiştirir
router.put('/password', requireAuth, (req, res) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!validNewPassword(new_password)) return res.status(400).json({ error: 'Yeni şifre 10-128 karakter olmalı' });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user || typeof current_password !== 'string' || !bcrypt.compareSync(current_password, user.password_hash)) {
      // 401 değil: panel 401'de oturumu kapatır, yanlış yazılan şifre kullanıcıyı dışarı atmamalı
      return res.status(400).json({ error: 'Mevcut şifre hatalı' });
    }
    if (bcrypt.compareSync(new_password, user.password_hash)) return res.status(400).json({ error: 'Yeni şifre eskisiyle aynı olamaz' });
    db.prepare('UPDATE users SET password_hash = ?, token_version = COALESCE(token_version, 0) + 1 WHERE id = ?').run(bcrypt.hashSync(new_password, 10), user.id);
    const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    res.json({ success: true, token: generateToken(fresh) });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

// PUT /api/auth/users/:id/password — admin bir hesabın şifresini sıfırlar (geçici şifre bir kez döner)
router.put('/users/:id/password', requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === SUPER_ADMIN_ID && req.user.id !== SUPER_ADMIN_ID) return res.status(403).json({ error: 'Bu hesap korunmaktadır.' });
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    const temp = crypto.randomBytes(12).toString('base64url');
    db.prepare('UPDATE users SET password_hash = ?, token_version = COALESCE(token_version, 0) + 1 WHERE id = ?').run(bcrypt.hashSync(temp, 10), userId);
    console.warn(`[ŞİFRE SIFIRLAMA] ${req.user.username} → ${user.username} (${new Date().toISOString()})`);
    res.json({ success: true, username: user.username, temporary_password: temp });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.delete('/users/:id', requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === SUPER_ADMIN_ID) return res.status(403).json({ error: 'Bu hesap korunmaktadır.' });
    if (userId === req.user.id) return res.status(400).json({ error: 'Kendinizi silemezsiniz' });
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

export default router;
