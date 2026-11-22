/**
 * Seed script: Migrates hardcoded site content into SQLite database.
 * Run once: node server/seeds/seed-content.js
 */
import db from '../db.js';

// Helper: insert if table is empty
const isEmpty = (table) => db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c === 0;

// ═══════ TEAM MEMBERS ═══════
// Ekip üyeleri panelden eklenir. Bu repo herkese açık: seed dosyasına gerçek kişi adı, fotoğrafı,
// telefonu ya da e-postası yazılmaz.

// ═══════ EVENTS ═══════
if (isEmpty('events')) {
  const insert = db.prepare('INSERT INTO events (title, date, location, category, description, color, is_upcoming, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const events = [
    { title: "18. Ulusal Girişimcilik Zirvesi", date: "2026-04-15", location: "Kongre Merkezi", category: "Zirve", description: "Sektör liderleri, yatırımcılar ve genç girişimciler bir araya geliyor. Keynote konuşmalar, paneller ve networking.", color: "from-red-600 to-red-500", is_upcoming: 1, sort_order: 1 },
    { title: "Kariyer Günleri 2026", date: "2026-03-20", location: "Olbia Kültür Merkezi", category: "Kariyer", description: "50'den fazla firma ile birebir mülakat ve staj görüşmesi imkânı. CV atölyesi ve mock interview.", color: "from-emerald-500 to-teal-500", is_upcoming: 1, sort_order: 2 },
    { title: "Teknik Gezi: Antalya Teknokent", date: "2026-03-05", location: "Antalya Teknokent", category: "Gezi", description: "Startup ekosistemini yerinde görme fırsatı. Girişimcilerle tanışma ve ofis turu.", color: "from-violet-500 to-purple-500", is_upcoming: 1, sort_order: 3 },
    { title: "17. Ulusal Girişimcilik Zirvesi", date: "2025-04-01", location: "Kongre Merkezi", category: "Zirve", description: "3.000+ katılımcı, 40+ konuşmacı ile rekor katılım.", color: "from-red-600 to-red-500", is_upcoming: 0, sort_order: 1 },
    { title: "Marka Zirvesi 2025", date: "2025-05-01", location: "Olbia Kültür Merkezi", category: "Kariyer", description: "Türkiye'nin önde gelen marka yöneticileri ile branding oturumları.", color: "from-blue-500 to-cyan-500", is_upcoming: 0, sort_order: 2 },
    { title: "CineGKT: Film Gecesi", date: "2025-02-01", location: "GKT Ofisi", category: "Sosyal", description: "\"The Social Network\" izleyip tartıştık.", color: "from-amber-500 to-orange-500", is_upcoming: 0, sort_order: 3 },
  ];
  const tx = db.transaction(() => events.forEach(e => insert.run(e.title, e.date, e.location, e.category, e.description, e.color, e.is_upcoming, e.sort_order)));
  tx();
  console.log(`✓ ${events.length} events seeded`);
}

// ═══════ BLOG POSTS ═══════
if (isEmpty('blog_posts')) {
  const insert = db.prepare('INSERT INTO blog_posts (title, date, category, excerpt, content, is_featured) VALUES (?, ?, ?, ?, ?, ?)');
  const posts = [
    { title: "Güz Dönemi Üye Başvuruları Başladı!", date: "2026-02-10", category: "Duyuru", excerpt: "2025-2026 Güz dönemi için topluluk üye başvuruları açıldı. Başvuru formunu doldurup GKT ailesine katılabilirsin!", content: "", is_featured: 1 },
    { title: "ATSO ile Yeni İş Birliği Protokolü İmzalandı", date: "2026-02-03", category: "Haber", excerpt: "Antalya Ticaret ve Sanayi Odası ile staj, mentorluk ve girişimcilik eğitimi alanlarında iş birliği protokolü imzalandı.", content: "", is_featured: 0 },
    { title: "GKT Podcast Serisi Yayında!", date: "2026-01-25", category: "Duyuru", excerpt: "Girişimcilik dünyasından ilham veren hikayeleri dinleyebileceğin GKT Podcast serimiz Spotify ve YouTube'da yayında.", content: "", is_featured: 0 },
  ];
  const tx = db.transaction(() => posts.forEach(p => insert.run(p.title, p.date, p.category, p.excerpt, p.content, p.is_featured)));
  tx();
  console.log(`✓ ${posts.length} blog posts seeded`);
}

// ═══════ SPONSORS ═══════
if (isEmpty('sponsors')) {
  const insert = db.prepare('INSERT INTO sponsors (name, logo_path, sort_order) VALUES (?, ?, ?)');
  const sponsors = [
    { name: "Antalya Ticaret ve Sanayi Odası", logo_path: "/assets/sponsors/antalya-ticaret-sanayi-odasi-logo.png", sort_order: 1 },
    { name: "İŞKUR", logo_path: "/assets/sponsors/iskur-logo.png", sort_order: 2 },
    { name: "Altınyıldız Classics", logo_path: "/assets/sponsors/altinyildiz-logo.png", sort_order: 3 },
    { name: "British Express", logo_path: "/assets/sponsors/british-express-logo.png", sort_order: 4 },
    { name: "Mebay Medya", logo_path: "/assets/sponsors/mebay-logo.png", sort_order: 5 },
    { name: "3İK", logo_path: "/assets/sponsors/3ik-logo.png", sort_order: 6 },
    { name: "Anbean Kampüs", logo_path: "/assets/sponsors/anbean-kampus.png", sort_order: 7 },
  ];
  const tx = db.transaction(() => sponsors.forEach(s => insert.run(s.name, s.logo_path, s.sort_order)));
  tx();
  console.log(`✓ ${sponsors.length} sponsors seeded`);
}

// ═══════ MILESTONES ═══════
if (isEmpty('milestones')) {
  const insert = db.prepare('INSERT INTO milestones (year, title, description, sort_order) VALUES (?, ?, ?, ?)');
  const milestones = [
    { year: "2002", title: "Kuruluş", description: "Bir avuç girişimci ruhlu öğrenci tarafından kuruldu.", sort_order: 1 },
    { year: "2012", title: "İlk Ulusal Zirve", description: "İlk Ulusal Girişimcilik Zirvesi 500+ katılımcıyla gerçekleşti.", sort_order: 2 },
    { year: "2016", title: "Kariyer Günleri", description: "30+ firma ile ilk Kariyer Günleri etkinliği.", sort_order: 3 },
    { year: "2020", title: "Dijital Dönüşüm", description: "Pandemi sürecinde etkinlikler online platforma taşındı.", sort_order: 4 },
    { year: "2024", title: "Rekor Katılım", description: "17. Zirve — 3.000+ katılımcı ile tarihî rekor.", sort_order: 5 },
    { year: "2026", title: "Yeni Dönem", description: "Yenilenen site, genişleyen ekip ve 18. Zirve hazırlıkları.", sort_order: 6 },
  ];
  const tx = db.transaction(() => milestones.forEach(m => insert.run(m.year, m.title, m.description, m.sort_order)));
  tx();
  console.log(`✓ ${milestones.length} milestones seeded`);
}

// ═══════ ACTIVITIES ═══════
if (isEmpty('activities')) {
  const insert = db.prepare('INSERT INTO activities (title, description, image_path, icon_name, sort_order) VALUES (?, ?, ?, ?, ?)');
  const activities = [
    { title: "Kariyer Günleri", description: "Kariyer Günleri, kariyerinizde ilk adımı atabilmeniz için size bir şans tanıyor. Her sene düzenlediğimiz Kariyer Günlerinde iş dünyasını bir öğrenci gözünden gözlemliyor, sektörün üstündeki insanlarla tanışma fırsatı yakalıyoruz.", image_path: "/assets/activities/kariyer-gunleri.jpg", icon_name: "GraduationCap", sort_order: 1 },
    { title: "Teknik Geziler", description: "Şirketlerin, fabrikaların ve diğer iş yerlerinin nasıl yürütüldüğünü daha iyi anlamamızı sağlıyor. İş dünyasıyla doğrudan temasa geçerek bilgi birikimimizi artırıyor ve staj-iş fırsatları yakalıyoruz.", image_path: "/assets/activities/teknik-gezi.jpg", icon_name: "MapPin", sort_order: 2 },
    { title: "CineGKT", description: "Her perşembe ofisimizde düzenli olarak gerçekleştirdiğimiz CineGKT etkinliğiyle, yerli ve yabancı filmlerin yer aldığı gösterimlerde sinema aracılığıyla hem eğlenip hem öğrenerek farklı bakış açıları kazandırıyoruz.", image_path: "/assets/activities/cine-gkt.jpg", icon_name: "Play", sort_order: 3 },
    { title: "Sosyal Sorumluluk", description: "Üyelerimizin farklı fikirleri izlemesi, demokratik tartışma ve uzlaşma deneyiminin geliştirilmesi, takım çalışması, iletişim, liderlik ve proje yürütme becerilerinin güçlendirilmesi açısından zengin bir seçenek sunuyoruz.", image_path: "/assets/activities/sosyal-sorumluluk.jpg", icon_name: "Heart", sort_order: 4 },
    { title: "Staj Programları", description: "Seminer ve birebir buluşmalar sayesinde üyelerimizi sektörün önde gelen iş insanlarıyla bir araya getiriyoruz. Birçok üyemiz güçlü bağlantılar kuruyor ve mezuniyet öncesi önemli deneyimler kazanıyor.", image_path: "/assets/activities/staj-programlari.png", icon_name: "Briefcase", sort_order: 5 },
    { title: "Ofis Sohbetleri", description: "Alanında deneyimli isimleri ofisimizde misafir ederek iş dünyasına dair bilgi edinmeyi ve kişisel gelişimimize katkı sağlamayı hedefliyoruz. Samimi bir ortamda merak ettiğimiz soruları uzmanlara birebir yöneltebiliyoruz.", image_path: "/assets/activities/ofis-sohbetleri.jpg", icon_name: "Coffee", sort_order: 6 },
    { title: "GKT Akustik", description: "Üyelerimizin sanat ve müzikle olan bağlarına dokunuyoruz. Her hafta düzenli olarak gerçekleştirdiğimiz bu etkinlikte farklı enstrümanları dinleme ve çalma fırsatı bulurken yeni arkadaşlıklar kuruluyor.", image_path: "/assets/activities/gkt-akustik.jpg", icon_name: "Music", sort_order: 7 },
    { title: "Üniversite Dışı Etkinlikler", description: "Kardeş üniversitelerimiz, iş dünyası çevreleri ve paydaş kurumlarımızdan gelen etkinlik davetlerine hep birlikte icabet ediyoruz. Forum İstanbul, ANSİAD ve birçok kongre ve seminerlere katılıyoruz.", image_path: "/assets/activities/universite-disi-etkinlikler.jpg", icon_name: "Globe", sort_order: 8 },
  ];
  const tx = db.transaction(() => activities.forEach(a => insert.run(a.title, a.description, a.image_path, a.icon_name, a.sort_order)));
  tx();
  console.log(`✓ ${activities.length} activities seeded`);
}

// ═══════ SETTINGS ═══════
const upsertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?');
const settings = {
  stat_year: "24+", stat_members: "6000+", stat_events: "200+", stat_partners: "50+",
  contact_address: "Akdeniz Üniversitesi, Dumlupınar Blv. 07058, Konyaaltı / Antalya",
  contact_phone: "+90 551 167 79 68",
  contact_email: "info@akdenizgkt.com",
  social_instagram: "https://www.instagram.com/akdenizgkt/",
  social_youtube: "https://www.youtube.com/channel/UCBYzke_LtR9SBacQFjRo7ag",
  social_tiktok: "https://www.tiktok.com/@gktmedya?lang=tr-TR",
  social_twitter: "https://x.com/AkdenizGKT",
  social_facebook: "https://www.facebook.com/akdenizgkt/?locale=tr_TR",
  social_linkedin: "https://www.linkedin.com/company/akdeniz-%C3%BCniversitesi-giri%C5%9Fimcilik-ve-kariyer-toplulu%C4%9Fu/",
  instagram_posts: JSON.stringify([
    { id: "DS73h7qDOT2", type: "reel", title: "Yılbaşı Röportajı", desc: "Yeni yıl öncesi ekibimizle röportajlar", color: "from-rose-500 to-red-600" },
    { id: "DSaajCyjJga", type: "reel", title: "Kristal Endüstriyel Teknik Gezi", desc: "Kristal Endüstriyel üretim merkezi ziyareti", color: "from-emerald-500 to-teal-600" },
    { id: "DSc8r-kDIsB", type: "reel", title: "Kristal Gezi Röportajları", desc: "Teknik gezi sonrası ekip röportajları", color: "from-blue-500 to-indigo-600" },
    { id: "DScILnHDDR9", type: "p", title: "Kristal Gezi Toplu Fotoğraf", desc: "Kristal Endüstriyel ziyareti toplu fotoğraf", color: "from-violet-500 to-purple-600" },
  ]),
};

const settingsTx = db.transaction(() => {
  Object.entries(settings).forEach(([key, value]) => upsertSetting.run(key, value, value));
});
settingsTx();
console.log(`✓ ${Object.keys(settings).length} settings seeded`);

console.log('\n🎉 Seed completed successfully!');
db.close();
