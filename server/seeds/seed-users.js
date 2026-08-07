/**
 * Seed users: Creates default koordinator and direktor accounts.
 * Run: node server/seeds/seed-users.js
 *
 * Passwords are generated randomly for each NEW account and printed once to the
 * console — copy them somewhere safe and share privately. Never hard-code
 * passwords here: this repository is public.
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';

const users = [
  { username: "medya-koord", role: "koordinator", department: "Medya ve IT", display_name: "Medya Koordinatör" },
  { username: "medya-direktor", role: "direktor", department: "Medya ve IT", display_name: "Medya Direktör" },
  { username: "etkinlik-koord", role: "koordinator", department: "Etkinlik ve Organizasyon", display_name: "Etkinlik Koordinatör" },
  { username: "etkinlik-direktor", role: "direktor", department: "Etkinlik ve Organizasyon", display_name: "Etkinlik Direktör" },
  { username: "kurumsal-koord", role: "koordinator", department: "Kurumsal İlişkiler", display_name: "Kurumsal Koordinatör" },
  { username: "kurumsal-direktor", role: "direktor", department: "Kurumsal İlişkiler", display_name: "Kurumsal Direktör" },
  { username: "uye-koord", role: "koordinator", department: "Üye İlişkileri", display_name: "Üye İlişkileri Koordinatör" },
  { username: "uye-direktor", role: "direktor", department: "Üye İlişkileri", display_name: "Üye İlişkileri Direktör" },
];

const insert = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role, department, display_name) VALUES (?, ?, ?, ?, ?)');

const tx = db.transaction(() => {
  const created = [];
  for (const u of users) {
    const password = crypto.randomBytes(12).toString('base64url');
    const result = insert.run(u.username, bcrypt.hashSync(password, 10), u.role, u.department, u.display_name);
    if (result.changes > 0) created.push({ kullanici: u.username, sifre: password });
  }
  console.log(`✓ ${created.length} kullanıcı oluşturuldu (${users.length - created.length} zaten mevcut)`);
  if (created.length) {
    console.log('Geçici şifreler (yalnızca şimdi gösterilir, güvenli bir yere kaydet):');
    console.table(created);
  }
});

tx();
db.close();
