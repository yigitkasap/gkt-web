/**
 * Seed past events with images.
 * Run: node server/seeds/seed-events.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check images exist
const eventsDir = path.join(__dirname, '..', '..', 'public', 'assets', 'events');
const requiredImages = ['cine-talks.jpg', 'genc-rota.jpg', 'qnb-career.jpg', 'gkt-for-yours.jpg'];
for (const img of requiredImages) {
  if (!fs.existsSync(path.join(eventsDir, img))) {
    console.warn(`⚠ Görsel bulunamadı: public/assets/events/${img}`);
  }
}

const events = [
  { title: "CINE TALKS: Bir Filmin Anatomisi", date: "2026-03-04", location: "Hukuk Fakültesi Konferans Salonu", category: "Workshop", description: "Sinema sektöründe oyunculuktan senaryoya, yönetmenlikten yapım ve dağıtıma kadar sürecin her aşamasında söz sahibi, alanında en iyi isimleri bir araya getirdik. Alper Kul, Derviş Zaim, Tümay Özokur, Rıza Sönmez, Murat Şeker, Zafer Külünk, Cemal Okan ve Ferhat Aslan gibi sektör profesyonelleri ile bir filmin nasıl doğduğunu, perde arkasında neler yaşandığını konuştuk. Moderatör: Tılsım Yılmaz.", color: "from-amber-600 to-amber-800", is_upcoming: 0, image_path: "/assets/events/cine-talks-ici.jpg", sort_order: 1 },
  { title: "Genç Rota: Türkiye İş Bankası", date: "2026-03-03", location: "Yavuz Tekelioğlu Konferans Salonu", category: "Kariyer", description: "Türkiye İş Bankası'nın Genç Rota etkinliği ile bankacılık dünyasının kapılarını araladık. Bankacı olmak, başarıya götüren yetkinlikler, işe alım süreçleri ve sürpriz oturum ile dolu bir program gerçekleştirdik. Katılımcılar networking fırsatı yakalarken kariyerlerine sağlam bir adım attı.", color: "from-blue-500 to-blue-700", is_upcoming: 0, image_path: "/assets/events/genc-rota.jpg", sort_order: 2 },
  { title: "QNB Career: Yetenek Kampüsü", date: "2025-12-15", location: "Hukuk Fakültesi Salonu", category: "Kariyer", description: "QNB Finansbank iş birliğiyle düzenlediğimiz Career etkinliğinde akademisyen Ahmet Aydemir ile duygusal zekanın gücünü keşfettik, QNB insan kaynakları yöneticileriyle kariyer fırsatlarını konuştuk. Çalışmanın geleceği, geleceğin meslekleri, finans sektöründeki fırsatlar ve duygu yönetimi konularını ele aldık. Sertifika ve sürpriz hediyeler katılımcılara sunuldu.", color: "from-purple-500 to-purple-700", is_upcoming: 0, image_path: "/assets/events/qnb-career-ici.jpg", sort_order: 3 },
  { title: "GKT for Yours: Yıldızlar Geçidi", date: "2025-11-28", location: "Hukuk Fakültesi Konferans Salonu", category: "Sosyal", description: "Yours İstanbul Dijital Marketing Ajansı kurucuları Deniz Erol ve Yiğit Özel ile influencerlar Büşra Zeynep Çetin, Tunahan Ak, Öykü Berkan ve Özgün Görkem'i ağırladık. Üç oturumluk özel etkinlikte dijital pazarlama dünyasından ilham dolu sohbetler ve deneyim paylaşımları gerçekleştirdik.", color: "from-orange-400 to-rose-500", is_upcoming: 0, image_path: "/assets/events/gkt-for-yours-ici.jpg", sort_order: 4 },
];

const tx = db.transaction(() => {
  let count = 0;
  for (const e of events) {
    const existing = db.prepare('SELECT id FROM events WHERE title = ?').get(e.title);
    if (existing) continue;
    db.prepare('INSERT INTO events (title, date, location, category, description, color, is_upcoming, image_path, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(e.title, e.date, e.location, e.category, e.description, e.color, e.is_upcoming, e.image_path, e.sort_order);
    count++;
  }
  console.log(`✓ ${count} etkinlik eklendi (${events.length - count} zaten mevcut)`);
});

tx();
db.close();
