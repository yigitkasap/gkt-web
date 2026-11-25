/**
 * Sunucu tarafı SEO / yapay zeka arama katmanı
 *
 * Site tek sayfa React uygulaması (SPA). JavaScript çalıştırmayan tarayıcılar (GPTBot, ClaudeBot,
 * PerplexityBot, WhatsApp/LinkedIn/X önizlemeleri, Bing'in bir kısmı) her sayfada aynı boş kabuğu görüyordu.
 * Bu modül her istek için index.html'e şunları ekler:
 *   - sayfaya özel <title>, description, canonical, robots, Open Graph ve Twitter etiketleri
 *   - JSON-LD yapılandırılmış veri (Organization, WebSite, BreadcrumbList, FAQPage, Event, BlogPosting)
 *   - #root içine sayfanın gerçek içeriğinden üretilmiş okunabilir HTML özeti
 *
 * React açılınca #root içeriğini kendi çizdiği sayfayla değiştirir; özet görsel olarak gizlidir
 * (ekran okuyucu/kopya ile aynı içerik — gizleme değil, JS'siz okuyucular için anlık görüntü).
 * Etiketler data-rh="true" taşır: react-helmet-async açılışta bunları kendi etiketleriyle değiştirir,
 * böylece JS çalıştıran tarayıcılarda tekrar eden (duplicate) etiket oluşmaz.
 * Bilinmeyen adresler gerçek 404 döner (önceden her adres 200 dönüyordu → "soft 404").
 */
import fs from 'fs';
import path from 'path';
import db from './db.js';
import { UPCOMING_WHERE, PAST_WHERE } from './lib/eventFilters.js';
// İçerik, React tarafıyla aynı kaynaktan okunur. Sunucuda src/ eksik olsa bile site düşmesin diye
// import hataya dayanıklıdır (özet o durumda yalnızca veritabanı içeriğiyle üretilir).
let DEPARTMENTS = [], ACTIVITIES = [], MILESTONES = [], HOME_FAQ = [], ABOUT_FAQ = [], CLUBCARD_PARTNERS = [], CLUBCARD_PERIOD = '';
try { ({ DEPARTMENTS, ACTIVITIES, MILESTONES, HOME_FAQ, ABOUT_FAQ } = await import('../src/fallbackData.js')); }
catch (e) { console.error('[seo] src/fallbackData.js okunamadı:', e.message); }
try { ({ CLUBCARD_PARTNERS, CLUBCARD_PERIOD } = await import('../src/clubcardData.js')); }
catch (e) { console.error('[seo] src/clubcardData.js okunamadı:', e.message); }

export const SITE = 'https://akdenizgkt.com';
const ORG_NAME = 'Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu';
const DEFAULT_IMAGE = `${SITE}/assets/og/gkt-og.jpg`;

// ─────────────────────────────────────────────── yardımcılar
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const abs = (p) => (!p ? DEFAULT_IMAGE : /^https?:\/\//.test(p) ? p : `${SITE}${p.startsWith('/') ? '' : '/'}${p}`);
const stripHtml = (html) => String(html || '')
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<\/(p|h[1-6]|li|blockquote|div)>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
const clip = (s, n = 160) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t; };
const jsonLd = (obj) => `<script type="application/ld+json" data-rh="true">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}/.test(String(d || '')) ? String(d).slice(0, 10) : null);
const trDate = (d) => {
  const iso = isoDate(d); if (!iso) return d || '';
  const [y, m, g] = iso.split('-').map(Number);
  return `${g} ${['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][m - 1]} ${y}`;
};
const q = (sql, ...p) => { try { return db.prepare(sql).all(...p); } catch { return []; } };
const settings = () => Object.fromEntries(q('SELECT key, value FROM settings').map(r => [r.key, r.value]));

// ─────────────────────────────────────────────── yapılandırılmış veri
function organization(s) {
  const sameAs = ['social_instagram', 'social_youtube', 'social_linkedin', 'social_twitter', 'social_facebook', 'social_tiktok']
    .map(k => s[k]).filter(u => /^https?:\/\//.test(u || ''));
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: ORG_NAME,
    alternateName: ['Akdeniz GKT', 'GKT'],
    url: `${SITE}/`,
    logo: `${SITE}/assets/logo_gkt.png`,
    foundingDate: '2002',
    description: "2002'den bu yana Akdeniz Üniversitesi öğrencilerine kariyer rehberliği, girişimcilik kültürü ve profesyonel gelişim fırsatları sunan öğrenci topluluğu.",
    email: s.contact_email || 'info@akdenizgkt.com',
    address: { '@type': 'PostalAddress', streetAddress: s.contact_address || 'Akdeniz Üniversitesi', addressLocality: 'Konyaaltı', addressRegion: 'Antalya', addressCountry: 'TR' },
    parentOrganization: { '@type': 'CollegeOrUniversity', name: 'Akdeniz Üniversitesi', url: 'https://www.akdeniz.edu.tr/' },
    sameAs: sameAs.length ? sameAs : ['https://www.instagram.com/akdenizgkt/', 'https://x.com/AkdenizGKT', 'https://www.facebook.com/akdenizgkt/'],
  };
}
const website = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Akdeniz GKT', inLanguage: 'tr-TR', publisher: { '@id': `${SITE}/#organization` } });
const breadcrumb = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'Anasayfa', path: '/' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE}${it.path}` })) });
const faqPage = (items) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const eventLd = (e) => {
  const start = isoDate(e.date); if (!start) return null;
  return {
    '@context': 'https://schema.org', '@type': 'Event', name: e.title, startDate: start,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: e.location || 'Akdeniz Üniversitesi', address: { '@type': 'PostalAddress', addressLocality: 'Antalya', addressCountry: 'TR' } },
    description: clip(e.description, 300) || undefined, image: e.image_path ? [abs(e.image_path)] : undefined,
    organizer: { '@type': 'Organization', name: ORG_NAME, url: `${SITE}/` },
  };
};

// ─────────────────────────────────────────────── içerik parçaları (görsel olarak gizli özet)
const section = (title, inner) => `<section><h2>${esc(title)}</h2>${inner}</section>`;
const list = (items) => `<ul>${items.join('')}</ul>`;
const faqHtml = (items) => section('Sıkça Sorulan Sorular', items.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join(''));
const navHtml = () => `<nav aria-label="Site"><ul>${[['/', 'Anasayfa'], ['/hakkimizda', 'Hakkımızda'], ['/etkinlikler', 'Etkinlikler'], ['/departmanlar', 'Departmanlar'], ['/blog', 'Blog'], ['/iletisim', 'İletişim']].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></nav>`;
const eventsHtml = (title, rows) => rows.length ? section(title, list(rows.map(e => `<li><h3>${esc(e.title)}</h3><p>${esc([trDate(e.date), e.location].filter(Boolean).join(' · '))}</p>${e.description ? `<p>${esc(clip(e.description, 400))}</p>` : ''}</li>`))) : '';
const activities = () => { const r = q('SELECT title, description FROM activities ORDER BY sort_order ASC, id ASC'); return r.length ? r : ACTIVITIES.map(a => ({ title: a.title, description: a.desc })); };
const activitiesHtml = () => section('Faaliyetlerimiz', list(activities().map(a => `<li><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></li>`)));
const blogPosts = (limit) => q(`SELECT title, slug, date, excerpt, category, cover_image FROM blog_posts WHERE slug IS NOT NULL AND slug != '' ORDER BY is_featured DESC, date DESC, id DESC${limit ? ' LIMIT ' + Number(limit) : ''}`);
const blogListHtml = (rows) => rows.length ? list(rows.map(p => `<li><h3><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h3><p>${esc([trDate(p.date), p.category].filter(Boolean).join(' · '))}</p><p>${esc(clip(p.excerpt, 300))}</p></li>`)) : '<p>Henüz yazı yok.</p>';

// ─────────────────────────────────────────────── sayfa tanımları
const LEGAL = {
  '/gizlilik': ['Gizlilik Politikası', 'Akdeniz GKT web sitesinin gizlilik politikası: hangi verilerin toplandığı ve nasıl korunduğu.'],
  '/kullanim-sartlari': ['Kullanım Şartları', 'Akdeniz GKT web sitesinin kullanım şartları.'],
  '/kvkk': ['KVKK Aydınlatma Metni', '6698 sayılı KVKK kapsamında Akdeniz GKT aydınlatma metni.'],
  '/cerez': ['Çerez Politikası', 'Akdeniz GKT web sitesinde kullanılan çerezler ve tercihleriniz.'],
};

function pageFor(pathname) {
  const s = settings();
  const base = { image: DEFAULT_IMAGE, robots: 'index, follow, max-image-preview:large', ld: [organization(s), website()] };
  const p = pathname.replace(/\/+$/, '') || '/';

  if (p === '/') {
    const up = q(`SELECT * FROM events WHERE ${UPCOMING_WHERE} ORDER BY sort_order ASC, date ASC LIMIT 3`);
    const stats = [['stat_year', 'yıllık deneyim'], ['stat_members', 'üye'], ['stat_events', 'etkinlik'], ['stat_partners', 'kurumsal paydaş']]
      .filter(([k]) => s[k]).map(([k, l]) => `<li>${esc(String(s[k]).replace(/\+?$/, '+'))} ${l}</li>`).join('');
    return { ...base, path: '/', title: `${ORG_NAME} | GKT`,
      description: "2002'den bu yana Akdeniz Üniversitesi öğrencilerine kariyer rehberliği, girişimcilik kültürü ve profesyonel gelişim fırsatları sunan öğrenci topluluğu.",
      ld: [...base.ld, faqPage(HOME_FAQ), ...up.map(eventLd).filter(Boolean)],
      body: `<h1>${esc(ORG_NAME)}</h1><p>Geleceği inşa edenler burada. Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu (GKT) olarak 2002'den bu yana binlerce öğrencinin kariyer yolculuğuna rehberlik ediyoruz: kariyer günleri, teknik geziler, Ulusal Girişimcilik Zirvesi, atölyeler ve sosyal sorumluluk projeleri.</p>${stats ? section('Rakamlarla GKT', `<ul>${stats}</ul>`) : ''}${activitiesHtml()}${eventsHtml('Yaklaşan Etkinlikler', up)}${section('Son Duyurular', blogListHtml(blogPosts(3)))}${faqHtml(HOME_FAQ)}` };
  }
  if (p === '/hakkimizda') {
    const ms = q('SELECT year, title, description FROM milestones ORDER BY sort_order ASC, year ASC');
    const rows = (ms.length ? ms : MILESTONES.map(m => ({ year: m.year, title: m.title, description: m.text })));
    return { ...base, path: p, title: 'Hakkımızda | Akdeniz GKT',
      description: "Akdeniz Üniversitesi GKT'nin vizyonu, misyonu, yönetim kadrosu ve 2002'den bugüne tarihçesi.",
      ld: [...base.ld, breadcrumb([{ name: 'Hakkımızda', path: p }]), faqPage(ABOUT_FAQ)],
      body: `<h1>Biz Kimiz?</h1><p>2002 yılından bu yana Akdeniz Üniversitesi öğrencilerine hem akademik hem de iş yaşamlarına destek olmak, girişimcilik kültürünü yaymak ve sosyal sorumluluk alanında duyarlı bireyler yetiştirmek amacıyla faaliyet yürütüyoruz.</p>${section('Vizyonumuz', "<p>Girişimci, akılcı, ilkeli ve sorumlu yaklaşımımızla alışılmışın dışında Türkiye'nin önde gelen öğrenci topluluğu olmak.</p>")}${section('Misyonumuz', '<p>Girişimci ve yenilikçi ruha sahip, toplumsal değerlere bağlı, iyi eğitimli sosyal bireylerin yetişmesine ve her bir üyesinin networkünü, vizyonunu ve entelektüel sermayesini genişletmesine fırsat sağlamak ve öncülük etmek.</p>')}${section('Tarihçe', list(rows.map(m => `<li><strong>${esc(m.year)}</strong> — ${esc(m.title)}: ${esc(m.description)}</li>`)))}${faqHtml(ABOUT_FAQ)}` };
  }
  if (p === '/etkinlikler') {
    const up = q(`SELECT * FROM events WHERE ${UPCOMING_WHERE} ORDER BY sort_order ASC, date ASC`);
    const past = q(`SELECT * FROM events WHERE ${PAST_WHERE} ORDER BY date DESC, id DESC LIMIT 12`);
    return { ...base, path: p, title: 'Etkinlikler | Akdeniz GKT',
      description: 'Kariyer günleri, teknik geziler, girişimcilik zirveleri, atölyeler ve daha fazlası: Akdeniz GKT etkinlik takvimi ve geçmiş etkinlikler.',
      ld: [...base.ld, breadcrumb([{ name: 'Etkinlikler', path: p }]), ...up.map(eventLd).filter(Boolean)],
      body: `<h1>Etkinliklerimiz</h1><p>Ulusal zirvelerden kariyer günlerine, teknik gezilerden sosyal sorumluluk projelerine tüm etkinliklerimiz.</p>${eventsHtml('Yaklaşan Etkinlikler', up) || section('Yaklaşan Etkinlikler', '<p>Yeni dönem etkinlikleri yakında duyurulacak.</p>')}${activitiesHtml()}${eventsHtml('Geçmiş Etkinlikler', past)}` };
  }
  if (p === '/departmanlar') {
    return { ...base, path: p, title: 'Departmanlar | Akdeniz GKT',
      description: 'Medya ve IT, Etkinlik ve Organizasyon, Kurumsal İlişkiler, Üye İlişkileri — Akdeniz GKT departmanları ve görev alanları.',
      ld: [...base.ld, breadcrumb([{ name: 'Departmanlar', path: p }])],
      body: `<h1>Departmanlarımız</h1><p>GKT dört ana departman altında organize oluyor. Her biri topluluğun farklı bir yetkinlik alanını temsil eder.</p>${DEPARTMENTS.map(d => section(d.name, `<p>${esc(d.desc)}</p>${list((d.tasks || []).map(t => `<li>${esc(t)}</li>`))}`)).join('')}` };
  }
  if (p === '/blog') {
    const posts = blogPosts(50);
    return { ...base, path: p, title: 'Blog & Duyurular | Akdeniz GKT',
      description: 'Kariyer rehberleri, girişimcilik yazıları, etkinlik haberleri ve topluluk duyuruları — Akdeniz GKT blogu.',
      ld: [...base.ld, breadcrumb([{ name: 'Blog', path: p }]), { '@context': 'https://schema.org', '@type': 'Blog', name: 'Akdeniz GKT Blog', url: `${SITE}/blog`, publisher: { '@id': `${SITE}/#organization` }, blogPost: posts.slice(0, 20).map(x => ({ '@type': 'BlogPosting', headline: x.title, url: `${SITE}/blog/${x.slug}`, datePublished: isoDate(x.date) || undefined })) }],
      body: `<h1>Blog &amp; Duyurular</h1>${blogListHtml(posts)}` };
  }
  const slug = p.match(/^\/blog\/([a-z0-9-]{1,200})$/i)?.[1];
  if (slug) {
    const post = q('SELECT * FROM blog_posts WHERE slug = ?', slug)[0];
    if (!post) return null;
    const text = stripHtml(post.content);
    const img = post.cover_image ? abs(post.cover_image) : DEFAULT_IMAGE;
    const url = `${SITE}/blog/${post.slug}`;
    return { ...base, path: p, type: 'article', image: img, title: `${post.title} | Akdeniz GKT`,
      description: clip(post.excerpt || text, 160),
      published: isoDate(post.date) || isoDate(post.created_at), modified: isoDate(post.updated_at),
      ld: [...base.ld, breadcrumb([{ name: 'Blog', path: '/blog' }, { name: post.title, path: p }]), {
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: clip(post.title, 110), description: clip(post.excerpt || text, 300),
        image: [img], datePublished: isoDate(post.date) || isoDate(post.created_at) || undefined, dateModified: isoDate(post.updated_at) || undefined,
        mainEntityOfPage: url, url, inLanguage: 'tr-TR', articleSection: post.category || undefined,
        author: { '@type': 'Organization', name: ORG_NAME, url: `${SITE}/` }, publisher: { '@id': `${SITE}/#organization` },
      }],
      body: `<article><h1>${esc(post.title)}</h1><p>${esc([trDate(post.date), post.category].filter(Boolean).join(' · '))}</p>${post.excerpt ? `<p><strong>${esc(post.excerpt)}</strong></p>` : ''}${text.split('\n').filter(Boolean).map(par => `<p>${esc(par)}</p>`).join('')}</article><p><a href="/blog">Tüm yazılar</a></p>` };
  }
  if (p === '/iletisim') {
    return { ...base, path: p, title: 'İletişim | Akdeniz GKT',
      description: 'Akdeniz GKT ile iletişime geçin: üyelik, sponsorluk ve iş birliği talepleriniz için iletişim formu ve e-posta.',
      ld: [...base.ld, breadcrumb([{ name: 'İletişim', path: p }]), { '@context': 'https://schema.org', '@type': 'ContactPage', url: `${SITE}${p}`, about: { '@id': `${SITE}/#organization` } }],
      body: `<h1>İletişim</h1><p>Üyelik, sponsorluk ve iş birliği talepleriniz için bize yazın.</p><ul><li>E-posta: ${esc(s.contact_email || 'info@akdenizgkt.com')}</li><li>Adres: ${esc(s.contact_address || 'Akdeniz Üniversitesi, Konyaaltı / Antalya')}</li></ul>` };
  }
  if (p === '/clubcard') {
    // Yönetim kararı: Club Card yalnızca link/QR ile açılır — arama sonuçlarında listelenmez.
    // Liste panelden yönetilir (clubcard_partners); tablo okunamazsa başlangıç verisine düşer.
    const rows = q('SELECT * FROM clubcard_partners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
      .map(r => { let offers = []; try { offers = JSON.parse(r.offers || '[]'); } catch {} return { ...r, offers }; });
    const partners = rows.length ? rows : CLUBCARD_PARTNERS;
    const period = s.clubcard_period || CLUBCARD_PERIOD;
    const offerText = (o) => o.discount ? `%${o.discount} indirim${o.scope ? ` (${o.scope})` : ''}` : o.scope;
    return { ...base, path: p, robots: 'noindex, follow',
      title: 'GKT Club Card | Akdeniz GKT',
      description: `GKT Club Card ile GKT Mutfak üyeleri Antalya'da ${partners.length} anlaşmalı işletmede indirimden yararlanır (${period}).`,
      ld: [organization(s)],
      body: `<h1>GKT Club Card</h1><p>Bir kart, birçok ayrıcalık. GKT Mutfak üyelerine ${esc(period)} döneminde geçerli indirimler.</p>${list(partners.map(x => `<li>${esc(x.name)} — ${esc((x.offers || []).map(offerText).join(', '))}${x.branch ? ` · ${esc(x.branch)}` : ''}${x.conditions ? ` · ${esc(String(x.conditions).split(String.fromCharCode(10)).join('; '))}` : ''}</li>`))}` };
  }
  if (p === '/cekilis') {
    return { ...base, path: p, robots: 'noindex, follow', title: 'Çekiliş | Akdeniz GKT', description: 'Akdeniz GKT çekiliş sonuçları.', ld: [organization(s)], body: '<h1>Çekiliş</h1>' };
  }
  if (LEGAL[p]) {
    const [t, d] = LEGAL[p];
    return { ...base, path: p, title: `${t} | Akdeniz GKT`, description: d, ld: [organization(s), breadcrumb([{ name: t, path: p }])], body: `<h1>${esc(t)}</h1><p>${esc(d)}</p>` };
  }
  return null; // bilinmeyen adres → 404
}

// ─────────────────────────────────────────────── HTML üretimi
let cache = { file: null, mtime: 0, html: '' };
function template(distPath) {
  const file = path.join(distPath, 'index.html');
  const st = fs.statSync(file);
  if (cache.file !== file || cache.mtime !== st.mtimeMs) {
    const raw = fs.readFileSync(file, 'utf8')
      // Sabit başlık/açıklama/OG/Twitter etiketlerini çıkar — sayfaya özel olanlar eklenecek
      .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
      .replace(/<meta\s+(name|property)="(description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, '');
    cache = { file, mtime: st.mtimeMs, html: raw };
  }
  return cache.html;
}

function headTags(pg, status) {
  const url = `${SITE}${pg.path === '/' ? '/' : pg.path}`;
  const t = [
    `<title data-rh="true">${esc(pg.title)}</title>`,
    `<meta data-rh="true" name="description" content="${esc(pg.description)}">`,
    `<meta data-rh="true" name="robots" content="${status === 404 ? 'noindex, follow' : pg.robots}">`,
  ];
  if (status !== 404) t.push(`<link data-rh="true" rel="canonical" href="${esc(url)}">`);
  t.push(
    `<meta data-rh="true" property="og:type" content="${pg.type || 'website'}">`,
    `<meta data-rh="true" property="og:site_name" content="Akdeniz GKT">`,
    `<meta data-rh="true" property="og:locale" content="tr_TR">`,
    `<meta data-rh="true" property="og:title" content="${esc(pg.title)}">`,
    `<meta data-rh="true" property="og:description" content="${esc(pg.description)}">`,
    `<meta data-rh="true" property="og:url" content="${esc(url)}">`,
    `<meta data-rh="true" property="og:image" content="${esc(pg.image)}">`,
    `<meta data-rh="true" name="twitter:card" content="summary_large_image">`,
    `<meta data-rh="true" name="twitter:site" content="@AkdenizGKT">`,
    `<meta data-rh="true" name="twitter:title" content="${esc(pg.title)}">`,
    `<meta data-rh="true" name="twitter:description" content="${esc(pg.description)}">`,
    `<meta data-rh="true" name="twitter:image" content="${esc(pg.image)}">`,
  );
  if (pg.published) t.push(`<meta data-rh="true" property="article:published_time" content="${pg.published}">`);
  if (pg.modified) t.push(`<meta data-rh="true" property="article:modified_time" content="${pg.modified}">`);
  for (const obj of pg.ld || []) t.push(jsonLd(obj));
  return t.join('\n    ');
}

// Görsel olarak gizli ama erişilebilir anlık görüntü — React açılınca yerine gerçek sayfa çizilir.
const SNAPSHOT_STYLE = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:normal;border:0';

export function renderPage(pathname, distPath) {
  let pg = pageFor(pathname);
  let status = 200;
  if (!pg) {
    status = 404;
    pg = { path: pathname, title: 'Sayfa bulunamadı | Akdeniz GKT', description: 'Aradığınız sayfa bulunamadı. Anasayfaya dönerek Akdeniz GKT etkinliklerine, blog yazılarına ve iletişim bilgilerine ulaşabilirsiniz.', image: DEFAULT_IMAGE, robots: 'noindex, follow', ld: [], body: '<h1>Sayfa bulunamadı</h1><p><a href="/">Anasayfaya dön</a></p>' };
  }
  const html = template(distPath)
    .replace('</head>', `    ${headTags(pg, status)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><div style="${SNAPSHOT_STYLE}">${navHtml()}<main>${pg.body}</main></div></div>`);
  return { status, html };
}

// Uygulama yolları: arama motoruna kapalı, anlık görüntü yok.
export function renderApp(distPath) {
  const html = template(distPath).replace('</head>', `    <title>Yönetim Paneli | Akdeniz GKT</title>\n    <meta name="robots" content="noindex, nofollow">\n  </head>`);
  return { status: 200, html };
}
