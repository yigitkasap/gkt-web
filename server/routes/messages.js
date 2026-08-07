import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sanitize, validateEmail, validatePhone } from '../validate.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const name = sanitize(req.body.name, 100);
    const email = sanitize(req.body.email, 100);
    const phone = sanitize(req.body.phone, 20);
    const subject = sanitize(req.body.subject, 200);
    const message = sanitize(req.body.message, 5000);

    if (!name || name.length < 2) return res.status(400).json({ error: 'İsim en az 2 karakter olmalı' });
    if (!message || message.length < 10) return res.status(400).json({ error: 'Mesaj en az 10 karakter olmalı' });
    if (email && !validateEmail(email)) return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin' });
    if (phone && !validatePhone(phone)) return res.status(400).json({ error: 'Geçersiz telefon numarası' });

    const result = db.prepare(
      'INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email || null, phone || null, subject || null, message);
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.get('/', requireAuth, (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json(messages);
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.put('/:id/read', requireAuth, (req, res) => {
  try {
    const result = db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Mesaj bulunamadı' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Mesaj bulunamadı' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Sunucu hatası' }); }
});

export default router;
