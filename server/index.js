import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requireAuth } from './auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import eventsRoutes from './routes/events.js';
import blogRoutes from './routes/blog.js';
import sponsorsRoutes from './routes/sponsors.js';
import settingsRoutes from './routes/settings.js';
import messagesRoutes from './routes/messages.js';
import milestonesRoutes from './routes/milestones.js';
import activitiesRoutes from './routes/activities.js';
import ugzRoutes from './routes/ugz.js';
import mediaRoutes from './routes/media.js';
import rafflesRoutes from './routes/raffles.js';

// Initialize DB (runs table creation + seed)
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy (for correct IP behind reverse proxy)
if (isProd) app.set('trust proxy', 1);

// ═══════ SECURITY MIDDLEWARE ═══════

// Helmet — security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      // Google Maps embeds hit maps.google.com and get redirected to www.google.com/maps/embed.
      // Both hosts must be allowed or the iframe shows "content blocked".
      frameSrc: ["https://maps.google.com", "https://www.google.com", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: isProd ? (process.env.CORS_ORIGIN || 'https://akdenizgkt.com') : 'http://localhost:5173',
  credentials: true
}));

// Body parser with size limit
app.use(express.json({ limit: '1mb' }));

// Prevent browser caching of JSON API responses so admin reorders show up instantly.
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Global rate limit
const isDev = process.env.NODE_ENV !== 'production';
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 100,
  message: { error: 'Çok fazla istek. Lütfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Auth rate limit
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 50 : 5,
  message: { error: 'Çok fazla giriş denemesi. Lütfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message rate limit: 3 req/min per IP
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Çok fazla mesaj gönderildi. Lütfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limit: 10 req/min per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Çok fazla yükleme. Lütfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Destructive-action rate limit: 20 DELETE req/min per IP
const deleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Çok fazla silme isteği. Lütfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', (req, res, next) => req.method === 'DELETE' ? deleteLimiter(req, res, next) : next());

// ═══════ FILE UPLOAD CONFIG ═══════
const uploadDir = path.join(__dirname, '..', 'public', 'assets', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, safeName + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return cb(new Error('Sadece jpg, jpeg, png ve webp dosyaları yüklenebilir'));
    if (!ALLOWED_MIME.includes(file.mimetype)) return cb(new Error('Geçersiz dosya türü'));
    cb(null, true);
  }
});

// ═══════ API ROUTES ═══════
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/super-login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', (req, res, next) => { if (req.method === 'POST' && !req.headers.authorization) messageLimiter(req, res, next); else next(); }, messagesRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/ugz', ugzRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/raffles', rafflesRoutes);

// ═══════ UPLOAD ENDPOINT ═══════
app.post('/api/upload', requireAuth, uploadLimiter, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya gerekli' });

  // Path traversal check
  const origName = req.file.originalname || '';
  if (origName.includes('..') || origName.includes('/') || origName.includes('\\')) {
    if (req.file.path) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Geçersiz dosya adı' });
  }

  const baseName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const isPng = req.file.mimetype === 'image/png';
  const ext = isPng ? '.png' : '.jpg';
  const fileName = baseName + ext;
  const filePath = path.join(uploadDir, fileName);

  try {
    const input = req.file.path || req.file.buffer;
    if (isPng) {
      await sharp(input).resize(1200, null, { withoutEnlargement: true }).png({ quality: 85 }).toFile(filePath);
    } else {
      await sharp(input).resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).rotate().toFile(filePath);
    }
    if (req.file.path) fs.unlinkSync(req.file.path);

    res.json({ path: '/assets/uploads/' + fileName });
  } catch {
    res.status(500).json({ error: 'Görsel işleme hatası' });
  }
});

// ═══════ UPLOAD ERROR HANDLER ═══════
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Dosya boyutu 5MB\'dan büyük olamaz' });
    return res.status(400).json({ error: 'Dosya yükleme hatası' });
  }
  if (err.message && err.message.includes('Sadece')) return res.status(400).json({ error: err.message });
  if (err.message && err.message.includes('Geçersiz dosya')) return res.status(400).json({ error: err.message });
  next(err);
});

// ═══════ SITEMAP ═══════
app.get('/sitemap.xml', (req, res) => {
  const posts = db.prepare("SELECT slug, updated_at FROM blog_posts WHERE slug IS NOT NULL AND slug != ''").all();
  const baseUrl = 'https://akdenizgkt.com';
  const staticPages = [
    { loc: '/', cf: 'weekly', p: '1.0' }, { loc: '/hakkimizda', cf: 'monthly', p: '0.8' },
    { loc: '/etkinlikler', cf: 'weekly', p: '0.8' }, { loc: '/departmanlar', cf: 'monthly', p: '0.8' },
    { loc: '/blog', cf: 'weekly', p: '0.8' }, { loc: '/iletisim', cf: 'monthly', p: '0.8' },
    { loc: '/ugz', cf: 'weekly', p: '0.9' },
  ];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const pg of staticPages) xml += `  <url><loc>${baseUrl}${pg.loc}</loc><changefreq>${pg.cf}</changefreq><priority>${pg.p}</priority></url>\n`;
  for (const post of posts) xml += `  <url><loc>${baseUrl}/blog/${post.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority>${post.updated_at ? `<lastmod>${post.updated_at.split(' ')[0]}</lastmod>` : ''}</url>\n`;
  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// ═══════ PRODUCTION STATIC SERVING ═══════
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath, {
    maxAge: '1y',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    }
  }));
  // Express 5 + path-to-regexp v8 reject bare '*' — use a regex catch-all instead.
  app.get(/.*/, (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ═══════ GLOBAL ERROR HANDLER ═══════
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: isProd ? 'Sunucu hatası.' : err.message });
});

async function start() {
  // db.js uses top-level await — by the time this module loads, DB is ready
  app.listen(PORT, () => {
    console.log(`GKT Backend running on http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}
start();
