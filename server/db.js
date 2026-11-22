import initSqlJs from 'sql.js/dist/sql-asm.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Initialize sql.js (top-level await — ESM required)
const SQL = await initSqlJs();

let sqlDb;
if (fs.existsSync(DB_PATH)) {
  const buffer = fs.readFileSync(DB_PATH);
  sqlDb = new SQL.Database(buffer);
} else {
  sqlDb = new SQL.Database();
}

// ═══════ PERSISTENCE ═══════

export function saveDb() {
  if (sqlDb) {
    const data = sqlDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// ═══════ better-sqlite3 COMPAT WRAPPER ═══════

let inTransaction = false;

function makePrepare(sql) {
  return {
    get(...params) {
      const stmt = sqlDb.prepare(sql);
      if (params.length) stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all(...params) {
      const results = [];
      const stmt = sqlDb.prepare(sql);
      if (params.length) stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    },
    run(...params) {
      sqlDb.run(sql, params);
      const changes = sqlDb.getRowsModified();
      const info = sqlDb.exec("SELECT last_insert_rowid() as id");
      const lastInsertRowid = info.length > 0 ? info[0].values[0][0] : 0;
      if (!inTransaction) saveDb();
      return { lastInsertRowid, changes };
    }
  };
}

const db = {
  prepare: (sql) => makePrepare(sql),
  exec: (sql) => { sqlDb.exec(sql); saveDb(); },
  pragma: (str) => { try { sqlDb.exec(`PRAGMA ${str}`); } catch {} },
  transaction: (fn) => {
    return (...args) => {
      sqlDb.exec('BEGIN');
      inTransaction = true;
      try {
        const result = fn(...args);
        sqlDb.exec('COMMIT');
        inTransaction = false;
        saveDb();
        return result;
      } catch (e) {
        sqlDb.exec('ROLLBACK');
        inTransaction = false;
        throw e;
      }
    };
  },
  close: () => { saveDb(); sqlDb.close(); }
};

// ═══════ PRAGMAS ═══════

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ═══════ CREATE TABLES ═══════

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'editor',
    display_name TEXT,
    department TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role_title TEXT,
    department TEXT,
    image_path TEXT,
    phone TEXT,
    email TEXT,
    linkedin TEXT,
    sort_order INTEGER DEFAULT 0,
    is_board INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT,
    location TEXT,
    category TEXT,
    description TEXT,
    color TEXT,
    is_upcoming INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT,
    category TEXT,
    excerpt TEXT,
    content TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_path TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year TEXT,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_path TEXT,
    icon_name TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ugz_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS ugz_speakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT DEFAULT '',
    company TEXT DEFAULT '',
    image_path TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ugz_program (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    speaker_name TEXT DEFAULT '',
    session_type TEXT DEFAULT 'talk',
    sort_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ugz_sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_path TEXT DEFAULT '',
    tier TEXT DEFAULT 'gold',
    website_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS raffles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    prize TEXT DEFAULT '',
    winner_name TEXT DEFAULT '',
    backup_names TEXT DEFAULT '',
    raffle_date TEXT DEFAULT '',
    image_path TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ═══════ MIGRATIONS ═══════

// Migration: add department column to users if not exists
try { db.exec('ALTER TABLE users ADD COLUMN department TEXT'); } catch {}

// Migration: add image_path column to events if not exists
try { db.exec("ALTER TABLE events ADD COLUMN image_path TEXT DEFAULT ''"); } catch {}

// Migration: add image_path column to raffles if not exists (for existing installs)
try { db.exec("ALTER TABLE raffles ADD COLUMN image_path TEXT DEFAULT ''"); } catch {}

// Migration: add backup_names column (admin-only raffle backup list, newline separated)
try { db.exec("ALTER TABLE raffles ADD COLUMN backup_names TEXT DEFAULT ''"); } catch {}

// Migration: add category column to annual sponsors (Ana / Ürün distinction per sponsorship kit)
try { db.exec("ALTER TABLE sponsors ADD COLUMN category TEXT DEFAULT ''"); } catch {}

// Migration: rename legacy UGZ sponsor tiers to match the new sponsorship kit categories.
// Old → New: main→platin, gold→altin, silver→gumus, bronze→logo, supporter→ulasim.
// Idempotent: each UPDATE only touches rows still on the old name.
try { db.prepare("UPDATE ugz_sponsors SET tier='platin'  WHERE tier='main'").run(); } catch {}
try { db.prepare("UPDATE ugz_sponsors SET tier='altin'   WHERE tier='gold'").run(); } catch {}
try { db.prepare("UPDATE ugz_sponsors SET tier='gumus'   WHERE tier='silver'").run(); } catch {}
try { db.prepare("UPDATE ugz_sponsors SET tier='logo'    WHERE tier='bronze'").run(); } catch {}
try { db.prepare("UPDATE ugz_sponsors SET tier='ulasim'  WHERE tier='supporter'").run(); } catch {}

// (Tek seferlik telefon temizliği Kasım 2026'da kaldırıldı: kişi adı içeriyordu ve canlıda zaten uygulanmıştı.)

// Migration: token_version — şifre değişince/hesap silinince eski oturumlar anında geçersiz olur
try { db.exec("ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0"); } catch {}

// Migration: add slug column to blog_posts
try { db.exec("ALTER TABLE blog_posts ADD COLUMN slug TEXT"); } catch {}

// Migration: add cover_image column to blog_posts
try { db.exec("ALTER TABLE blog_posts ADD COLUMN cover_image TEXT"); } catch {}

// Generate slugs for existing posts that don't have one
const slugify = (text) => text.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i').replace(/İ/g,'i').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
const postsWithoutSlug = db.prepare("SELECT id, title FROM blog_posts WHERE slug IS NULL OR slug = ''").all();
for (const p of postsWithoutSlug) {
  const slug = slugify(p.title);
  db.prepare("UPDATE blog_posts SET slug = ? WHERE id = ?").run(slug, p.id);
}

// ═══════ SEED DEFAULTS ═══════

// Seed default admin if users table is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
// Password comes from ADMIN_INITIAL_PASSWORD (.env); otherwise a random one is
// generated and printed ONCE. Never hard-code a password here — this repo is public.
if (userCount.count === 0) {
  const envPass = process.env.ADMIN_INITIAL_PASSWORD;
  const initialPassword = envPass && envPass.length >= 12 ? envPass : crypto.randomBytes(12).toString('base64url');
  const hash = bcrypt.hashSync(initialPassword, 10);
  db.prepare('INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)').run('admin', hash, 'admin', 'Başkan');
  console.log(envPass ? 'Admin kullanıcısı ADMIN_INITIAL_PASSWORD ile oluşturuldu.' : `Admin kullanıcısı oluşturuldu — kullanıcı adı: admin, geçici şifre: ${initialPassword} (ilk girişte değiştir)`);
}

// Seed UGZ default settings
const ugzDefaults = [
  { key: 'ugz_title', value: '18. Ulusal Girişimcilik Zirvesi' },
  { key: 'ugz_subtitle', value: "Türkiye'nin en büyük öğrenci girişimcilik etkinliği" },
  { key: 'ugz_date', value: '' },
  { key: 'ugz_time', value: '09:00' },
  { key: 'ugz_location', value: 'Kongre Merkezi, Antalya' },
  { key: 'ugz_registration_open', value: 'false' },
  { key: 'ugz_registration_url', value: '' },
  { key: 'ugz_speakers_visible', value: 'true' },
  { key: 'ugz_program_visible', value: 'true' },
  { key: 'ugz_sponsors_visible', value: 'true' },
  { key: 'ugz_countdown_visible', value: 'true' },
  { key: 'ugz_page_active', value: 'true' },
  { key: 'ugz_registration_visible', value: 'true' },
  { key: 'ugz_edition_mode', value: 'auto' },
  { key: 'ugz_edition_number', value: '18' },
  { key: 'ugz_base_year', value: '2026' },
  { key: 'ugz_base_number', value: '18' },
];
const ugzInsert = db.prepare('INSERT OR IGNORE INTO ugz_settings (key, value) VALUES (?, ?)');
for (const d of ugzDefaults) ugzInsert.run(d.key, d.value);

// Seed site settings defaults — only inserts if key missing; existing values untouched.
const siteDefaults = [
  { key: 'raffles_page_active', value: 'false' },
];
const siteInsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING');
for (const d of siteDefaults) siteInsert.run(d.key, d.value);

export function getDb() { return db; }
export default db;
