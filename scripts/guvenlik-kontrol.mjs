#!/usr/bin/env node
/**
 * GKT web — güvenlik ve kişisel veri denetimi
 *
 *   npm run guvenlik            → repo + kod + bağımlılık denetimi
 *   npm run guvenlik -- --gecmis  → ek olarak tüm git geçmişini sır için tarar
 *   npm run guvenlik:canli      → ek olarak canlı siteyi (yalnızca GET istekleriyle) denetler
 *   --json <dosya>              → bulguları JSON olarak da yazar
 *
 * Öncelik: kullanıcı bilgilerini korumak. Bulgu seviyeleri:
 *   KRİTİK  → hemen düzeltilmeli (sır sızıntısı, yetkisiz yazma, açık veri dosyası). Çıkış kodu 1.
 *   YÜKSEK  → yayından önce düzeltilmeli.
 *   ORTA / DÜŞÜK → planlanmalı.
 * İzin verilen istisnalar: scripts/guvenlik-izinli.json
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const OPT = {
  gecmis: args.includes('--gecmis'),
  canli: args.includes('--canli'),
  json: args.includes('--json') ? args[args.indexOf('--json') + 1] : null,
  site: process.env.GKT_SITE || 'https://akdenizgkt.com',
};
const izinli = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/guvenlik-izinli.json'), 'utf8')); }
  catch { return { pii: [], dosyalar: [] }; }
})();

const bulgular = [];
const ekle = (seviye, alan, mesaj, yer = '') => bulgular.push({ seviye, alan, mesaj, yer });
const sh = (cmd) => execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });

// ─────────────────────────────────────────────── 1. Repo: sırlar ve takip edilmemesi gereken dosyalar
const tracked = sh('git ls-files').split('\n').filter(Boolean);
const metinDosyasi = (f) => /\.(m?js|cjs|jsx|ts|json|md|txt|html|css|sh|ps1|yml|yaml|env|example|conf|htaccess)$/i.test(f) || !path.extname(f);
const okunur = tracked.filter(f => metinDosyasi(f) && !f.endsWith('package-lock.json') && fs.existsSync(path.join(ROOT, f)));

const YASAK_DOSYA = [
  [/(^|\/)\.env(\.|$)(?!example)/, 'ortam dosyası (.env) repoda'],
  [/\.sqlite3?$|\.db$/, 'veritabanı dosyası repoda'],
  [/(^|\/)\.claude\//, 'yerel Claude ayarları repoda (yerel yollar/token içerebilir)'],
  [/(^|\/)id_(rsa|ed25519)|\.pem$|\.key$/, 'özel anahtar dosyası repoda'],
  [/GİRİŞ|GIRIS|sifre|şifre|password/i, 'adı şifre/giriş bilgisi çağrıştıran dosya repoda'],
];
for (const f of tracked) for (const [re, msg] of YASAK_DOSYA) if (re.test(f) && !izinli.dosyalar?.includes(f)) ekle('KRİTİK', 'repo', msg, f);

const SIR_KALIPLARI = [
  [/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JWT token'],
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'özel anahtar'],
  [/AKIA[0-9A-Z]{16}/, 'AWS erişim anahtarı'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/(JWT_SECRET|RECOVERY_SECRET|ADMIN_INITIAL_PASSWORD|DB_PASSWORD|API_KEY)\s*=\s*(?!process\.env)[^\s<'"`$]{6,}/, 'ortam değişkeni değeri koda yazılmış'],
  [/(password|şifre|sifre|passwd)["']?\s*[:=]\s*["'][^"'\s]{6,}["']/i, 'koda gömülü şifre'],
  [/hashSync\(\s*["'][^"']+["']/, 'sabit metinden şifre hash\'i (varsayılan şifre)'],
  [/gkt2026admin|Koord2026!|Dir2026!/, 'eskiden sızmış panel şifresi'],
];
const SIR_HARIC = (f) => f === 'scripts/guvenlik-kontrol.mjs' || f.startsWith('src/admin/demoData');
for (const f of okunur) {
  if (SIR_HARIC(f)) continue;
  const satirlar = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
  satirlar.forEach((s, i) => {
    for (const [re, ad] of SIR_KALIPLARI) if (re.test(s)) ekle('KRİTİK', 'sır', ad, `${f}:${i + 1}`);
  });
}

if (OPT.gecmis) {
  const desen = 'eyJhbGci|BEGIN .*PRIVATE KEY|gkt2026admin|Koord2026!|JWT_SECRET=[A-Za-z0-9]|RECOVERY_SECRET=[A-Za-z0-9]';
  let sonuc = '';
  try { sonuc = sh(`git log --all -p -G "${desen}" --format="commit %h" -- . ":(exclude)scripts/guvenlik-kontrol.mjs"`); } catch { /* eşleşme yok */ }
  const commitler = [...new Set((sonuc.match(/^commit \w+/gm) || []).map(s => s.slice(7)))];
  if (commitler.length) ekle('KRİTİK', 'git geçmişi', `sır içeren commit(ler): ${commitler.join(', ')} — geçmiş yeniden yazılmalı`, 'git');
}

// ─────────────────────────────────────────────── 2. Kişisel veri (KVKK)
const PII = [
  [/(?<![\d])(?:\+?90[\s-]?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}(?![\d])/g, 'cep telefonu'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'e-posta'],
  [/(?<!\d)[1-9]\d{10}(?!\d)/g, 'TC kimlik no olabilir'],
];
const tcGecerli = (n) => {
  const d = n.split('').map(Number);
  const t10 = ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10;
  return t10 === d[9] && d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10];
};
const PII_IZINLI = new Set([...(izinli.pii || []), 'info@akdenizgkt.com', 'noreply@anthropic.com']);
for (const f of okunur) {
  if (f === 'scripts/guvenlik-kontrol.mjs' || f === 'scripts/guvenlik-izinli.json') continue;
  const metin = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const [re, ad] of PII) {
    for (const m of metin.matchAll(re)) {
      const v = m[0];
      if (PII_IZINLI.has(v) || /example\.|@ornek\.com$|test@test|@akdenizgkt\.com$/.test(v)) continue;
      if (ad === 'TC kimlik no olabilir' && !tcGecerli(v)) continue;
      if (ad === 'e-posta' && /\.(png|jpe?g|webp|svg|js|css)$/i.test(v)) continue;
      const satir = metin.slice(0, m.index).split('\n').length;
      ekle(ad === 'e-posta' ? 'ORTA' : 'YÜKSEK', 'kişisel veri', `${ad}: ${v.slice(0, 4)}…`, `${f}:${satir}`);
    }
  }
}

// ─────────────────────────────────────────────── 3. Kod kalıpları
const kod = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const kodDosyalari = tracked.filter(f => /\.(m?js|cjs|jsx)$/.test(f) && (f.startsWith('server/') || f.startsWith('src/')));
for (const f of kodDosyalari) {
  const satirlar = kod(f).split('\n');
  satirlar.forEach((s, i) => {
    const yer = `${f}:${i + 1}`;
    if (/dangerouslySetInnerHTML/.test(s) && !/DOMPurify\.sanitize/.test(s)) ekle('YÜKSEK', 'XSS', 'dangerouslySetInnerHTML DOMPurify olmadan', yer);
    if (/\beval\(|new Function\(/.test(s)) ekle('YÜKSEK', 'kod', 'eval / new Function', yer);
    if (/\.prepare\(\s*`[^`]*\$\{[^}]*req\./.test(s)) ekle('KRİTİK', 'SQL', 'istek verisi SQL metnine gömülüyor (enjeksiyon)', yer);
    if (/localStorage\.setItem\([^)]*token/i.test(s)) ekle('DÜŞÜK', 'oturum', 'token localStorage\'da (XSS olursa çalınabilir) — CSP ile birlikte değerlendir', yer);
  });
  // Yazma rotaları yetki kontrolü
  if (f.startsWith('server/routes/')) {
    satirlar.forEach((s, i) => {
      const m = s.match(/router\.(post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z]+)?/);
      if (!m) return;
      const acikRotalar = ['auth.js POST /login', 'auth.js POST /super-login', 'messages.js POST /'];
      const anahtar = `${path.basename(f)} ${m[1].toUpperCase()} ${m[2]}`;
      if (!/^require[A-Z]/.test(m[3] || '') && !acikRotalar.includes(anahtar)) ekle('KRİTİK', 'yetki', `yetki kontrolü olmayan yazma rotası: ${m[1].toUpperCase()} ${m[2]}`, `${f}:${i + 1}`);
    });
  }
}

// Sunucu yapılandırması
const idx = kod('server/index.js');
if (!/helmet\(/.test(idx)) ekle('KRİTİK', 'başlıklar', 'helmet kullanılmıyor', 'server/index.js');
if (/scriptSrc:[^\]]*'unsafe-inline'/.test(idx)) ekle('ORTA', 'CSP', "script-src 'unsafe-inline' — XSS korumasını zayıflatıyor", 'server/index.js');
if (/origin:\s*['"]\*['"]|origin:\s*true/.test(idx)) ekle('YÜKSEK', 'CORS', 'CORS tüm kökenlere açık', 'server/index.js');
if (!/authLimiter/.test(idx)) ekle('YÜKSEK', 'kaba kuvvet', 'giriş için hız sınırı yok', 'server/index.js');
const auth = kod('server/auth.js');
if (!/JWT_SECRET\.length\s*<\s*(2\d|3\d)/.test(auth)) ekle('ORTA', 'JWT', 'JWT_SECRET uzunluk kontrolü yok', 'server/auth.js');
if (!/if \(!JWT_SECRET\) throw/.test(auth)) ekle('YÜKSEK', 'JWT', 'JWT_SECRET yoksa token üretimi engellenmiyor', 'server/auth.js');
if (!/token_version/.test(auth)) ekle('ORTA', 'oturum', 'token her istekte veritabanından doğrulanmıyor (silinen hesap/şifre değişimi 24 saat geçerli kalır)', 'server/auth.js');
const authRoutes = kod('server/routes/auth.js');
if (!/\/password/.test(authRoutes)) ekle('ORTA', 'hesap', 'şifre değiştirme/sıfırlama uç noktası yok (sızıntıda hesap silmek gerekiyor)', 'server/routes/auth.js');
if (/secret !== RECOVERY_SECRET/.test(authRoutes)) ekle('DÜŞÜK', 'zamanlama', 'kurtarma anahtarı sabit zamanlı karşılaştırılmıyor (timingSafeEqual)', 'server/routes/auth.js');
const settingsR = kod('server/routes/settings.js');
if (!/PUBLIC_KEY/.test(settingsR)) ekle('ORTA', 'veri sızıntısı', 'GET /api/settings tüm ayar anahtarlarını herkese döndürüyor — yalnızca herkese açık anahtarlar dönmeli', 'server/routes/settings.js');
const msgR = kod('server/routes/messages.js');
if (/router\.get\('\/', requireAuth/.test(msgR)) ekle('ORTA', 'kişisel veri', 'iletişim mesajlarını (ad/e-posta/telefon) her rol okuyabiliyor — en az koordinatör olmalı', 'server/routes/messages.js');
const teamR = kod('server/routes/team.js');
if (!/PUBLIC_COLUMNS/.test(teamR)) ekle('ORTA', 'kişisel veri', 'GET /api/team telefon/e-posta alanlarını herkese döndürüyor (alan süzmesi yok)', 'server/routes/team.js');

// ─────────────────────────────────────────────── 4. Bağımlılıklar ve build
try {
  let out; try { out = sh('npm audit --omit=dev --json'); } catch (e) { out = e.stdout?.toString() || '{}'; }
  const v = JSON.parse(out).metadata?.vulnerabilities || {};
  if (v.critical) ekle('KRİTİK', 'bağımlılık', `${v.critical} kritik npm açığı (npm audit)`, 'package.json');
  if (v.high) ekle('YÜKSEK', 'bağımlılık', `${v.high} yüksek npm açığı (npm audit)`, 'package.json');
  if (v.moderate) ekle('ORTA', 'bağımlılık', `${v.moderate} orta npm açığı (npm audit)`, 'package.json');
} catch { ekle('DÜŞÜK', 'bağımlılık', 'npm audit çalıştırılamadı (ağ?)', 'package.json'); }
if (fs.existsSync(path.join(ROOT, 'dist'))) {
  const dist = sh('git ls-files --others --ignored --exclude-standard dist').split('\n').filter(Boolean);
  for (const f of dist) {
    if (/\.map$/.test(f)) ekle('ORTA', 'build', 'kaynak haritası yayın paketinde', f);
    if (/\.env|\.sqlite/.test(f)) ekle('KRİTİK', 'build', 'gizli dosya yayın paketinde', f);
  }
  const distJs = dist.filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  if (/gkt2026admin|RECOVERY_SECRET=|JWT_SECRET=/.test(distJs)) ekle('KRİTİK', 'build', 'yayın paketinde sır', 'dist/assets');
}

// ─────────────────────────────────────────────── 5. Canlı site (yalnızca GET)
if (OPT.canli) {
  const al = async (p, opt = {}) => {
    try {
      const r = await fetch(OPT.site + p, { redirect: 'manual', ...opt, headers: { 'User-Agent': 'gkt-guvenlik-kontrol/1.0', ...(opt.headers || {}) } });
      const govde = r.status < 400 ? (await r.text()).slice(0, 400000) : '';
      return { s: r.status, h: r.headers, govde };
    } catch (e) { return { s: 0, h: new Headers(), govde: '', hata: e.message }; }
  };
  const anaSayfa = await al('/');
  const spaImza = anaSayfa.govde.includes('<div id="root">');
  const ifsa = async (p, ad) => {
    const r = await al(p);
    const spa = r.govde.includes('<div id="root">');
    if (r.s === 200 && !spa && r.govde.length > 0) ekle('KRİTİK', 'canlı', `${ad} herkese açık: ${p}`, OPT.site + p);
  };
  for (const [p, ad] of [['/.env', '.env'], ['/server/.env', '.env'], ['/.git/HEAD', 'git deposu'], ['/server/database.sqlite', 'veritabanı'], ['/database.sqlite', 'veritabanı'], ['/database-backup.sqlite', 'veritabanı yedeği'], ['/package.json', 'package.json'], ['/app.cjs', 'başlatma dosyası'], ['/server/index.js', 'sunucu kodu'], ['/ecosystem.config.cjs', 'pm2 ayarı'], ['/.htaccess', '.htaccess'], ['/logs/error.log', 'hata günlüğü'], ['/stderr.log', 'hata günlüğü']]) await ifsa(p, ad);
  const liste = await al('/assets/uploads/');
  if (liste.s === 200 && /Index of|<a href=/.test(liste.govde) && !liste.govde.includes('<div id="root">')) ekle('YÜKSEK', 'canlı', 'yükleme klasörü listelenebiliyor', OPT.site + '/assets/uploads/');
  for (const p of ['/api/messages', '/api/auth/users', '/api/media', '/api/auth/me']) {
    const r = await al(p);
    if (r.s !== 401 && r.s !== 403) ekle('KRİTİK', 'canlı', `kimlik doğrulamasız erişim: ${p} → ${r.s}`, OPT.site + p);
  }
  const h = anaSayfa.h;
  for (const [ad, seviye] of [['strict-transport-security', 'YÜKSEK'], ['content-security-policy', 'YÜKSEK'], ['x-content-type-options', 'ORTA'], ['x-frame-options', 'ORTA'], ['referrer-policy', 'DÜŞÜK']]) if (!h.get(ad)) ekle(seviye, 'canlı başlık', `${ad} başlığı yok`, OPT.site);
  if (/'unsafe-inline'/.test((h.get('content-security-policy') || '').split(';').find(d => d.trim().startsWith('script-src')) || '')) ekle('ORTA', 'canlı başlık', "CSP script-src 'unsafe-inline' içeriyor", OPT.site);
  const ekip = await al('/api/team');
  try {
    const d = JSON.parse(ekip.govde || '[]');
    const telefon = d.filter(m => m.phone).length, eposta = d.filter(m => m.email).length;
    if (telefon) ekle('YÜKSEK', 'canlı kişisel veri', `/api/team ${telefon} kişinin telefonunu herkese döndürüyor`, OPT.site + '/api/team');
    if (eposta) ekle('ORTA', 'canlı kişisel veri', `/api/team ${eposta} kişinin e-postasını herkese döndürüyor`, OPT.site + '/api/team');
    if (d.length && 'phone' in d[0]) ekle('DÜŞÜK', 'canlı kişisel veri', '/api/team yanıtında telefon/e-posta alanları var (boş olsa da) — herkese açık uçta alan süzülmeli', OPT.site + '/api/team');
  } catch { /* JSON değil */ }
  const ayar = await al('/api/settings');
  try {
    const anahtarlar = Object.keys(JSON.parse(ayar.govde || '{}'));
    const supheli = anahtarlar.filter(k => /secret|token|password|sifre|key|smtp|api/i.test(k));
    if (supheli.length) ekle('KRİTİK', 'canlı', `/api/settings hassas görünen anahtar döndürüyor: ${supheli.join(', ')}`, OPT.site + '/api/settings');
  } catch { /* yok */ }
  const hata = await al('/api/events/%27');
  if (/at\s+\S+\s+\(|node_modules|SQLITE_/i.test(hata.govde)) ekle('YÜKSEK', 'canlı', 'hata yanıtı yığın izi/SQL hatası sızdırıyor', OPT.site + '/api/events/%27');
  if (!spaImza) ekle('DÜŞÜK', 'canlı', 'ana sayfa beklenen SPA kabuğunu döndürmedi (denetim sonuçlarını elle doğrula)', OPT.site);
}

// ─────────────────────────────────────────────── Rapor
const SIRA = { 'KRİTİK': 0, 'YÜKSEK': 1, 'ORTA': 2, 'DÜŞÜK': 3 };
bulgular.sort((a, b) => SIRA[a.seviye] - SIRA[b.seviye]);
const renk = { 'KRİTİK': '\x1b[41;97m', 'YÜKSEK': '\x1b[31m', 'ORTA': '\x1b[33m', 'DÜŞÜK': '\x1b[36m' };
const sayac = Object.fromEntries(Object.keys(SIRA).map(k => [k, bulgular.filter(b => b.seviye === k).length]));
console.log(`\nGKT güvenlik denetimi — ${new Date().toLocaleString('tr-TR')}${OPT.canli ? ` (canlı: ${OPT.site})` : ''}${OPT.gecmis ? ' (git geçmişi dahil)' : ''}`);
console.log(`Kritik ${sayac['KRİTİK']} · Yüksek ${sayac['YÜKSEK']} · Orta ${sayac['ORTA']} · Düşük ${sayac['DÜŞÜK']}\n`);
for (const b of bulgular) console.log(`${renk[b.seviye]}${b.seviye.padEnd(6)}\x1b[0m [${b.alan}] ${b.mesaj}${b.yer ? `  — ${b.yer}` : ''}`);
if (!bulgular.length) console.log('Bulgu yok.');
if (OPT.json) fs.writeFileSync(OPT.json, JSON.stringify({ tarih: new Date().toISOString(), secenekler: OPT, sayac, bulgular }, null, 2));
process.exitCode = sayac['KRİTİK'] ? 1 : 0;
