# Sorun analizi ve çözüm önerileri

İlk incelemede (23 Kasım 2026) tespit edilen sorunlar ve bu gece yapılanlar. Durum sütunu:
**✅ Çözüldü** (gece dalında, yayın bekliyor) · **🟡 Kısmen** · **📝 Öneri** (karar/iş bekliyor).

| # | Sorun | Etki | Durum |
|---|---|---|---|
| 1 | Panel şifreleri public repoda açıktı | Kritik: herkes panele girebilir | ✅ repo · 🟡 canlıda şifreler hâlâ değişmeli |
| 2 | UGZ sayfası 7 ay eskimiş (18. zirve, kayıt açık) | Güven kaybı | ✅ sayfa kaldırıldı, tarihi geçen etkinlik otomatik "geçmiş" |
| 3 | Site JS'siz okunamıyor (SPA), paylaşım önizlemeleri hep ana sayfa | SEO + yapay zeka görünürlüğü | ✅ `server/seo.js` |
| 4 | Her adres 200 dönüyor (soft 404) | Dizin kirliliği | ✅ gerçek 404 |
| 5 | Ağır medya (31 MB video, 4–6 MB fotoğraf) | Mobil hız, LCP | ✅ 14,2 MB → 2,1 MB, video kaldırıldı |
| 6 | Tüm statik dosyalar 1 yıl önbellekte | Aynı adla değişen görsel bir yıl eski kalır | ✅ yalnızca hash'li dosyalar 1 yıl |
| 7 | `deploy.sh` eski seed yolları | Yeni kurulum bozuk | ✅ |
| 8 | Şifre değiştirme/sıfırlama yok | Sızıntıda hesap silmek gerekiyordu | ✅ uç + panel arayüzü |
| 9 | Silinen hesabın token'ı 24 saat geçerli | Erişim iptali gecikir | ✅ `token_version` |
| 10 | `/api/team` telefon/e-posta, `/api/settings` tüm anahtarlar herkese | KVKK | ✅ alan süzme |
| 11 | Kişi adları/fotoğrafları koda ve repoya gömülü | KVKK, eski kadro | ✅ kaldırıldı, panel anahtarı |
| 12 | `robots.txt`: yapay zeka botlarına panel/API yasağı işlemiyordu | Gereksiz tarama | ✅ |
| 13 | npm açıkları (1 kritik, 7 yüksek) | Sunucu güvenliği | ✅ (yalnızca geliştirme ortamındaki esbuild kaldı) |
| 14 | İletişim mesajlarını her rol okuyabiliyor | KVKK | 📝 |
| 15 | Token `localStorage`'da | XSS olursa çalınır | 📝 |
| 16 | `App.jsx` 1900 satır tek dosya | Bakım zorluğu | 📝 |
| 17 | Her yazmada tüm veritabanı dosyası yeniden yazılıyor (sql.js) | Ölçek/kayıp riski | 📝 |
| 18 | Test yok | Gerileme riski | 📝 |
| 19 | Tasarım: kontrast, dokunma hedefi, odak stili | Erişilebilirlik | 📝 bkz. `TASARIM-IHLALLERI.md` |

---

## 1. Canlı panel şifreleri — hâlâ en acil iş
**Durum:** Repo ve geçmiş temiz (taze klon taraması 0 bulgu). Ama arşivdeki panel notu, canlı panelin büyük ihtimalle eski şifrelerle çalıştığını gösteriyor. Şifreler aylarca açıkta kaldığı için değişmeleri şart.

**Çözüm (gece dalı yayına alındıktan sonra, cPanel gerekmez):**
1. `admin` ile giriş yap → sol alttaki **Şifremi Değiştir**.
2. **Kullanıcılar** → her hesap için 🔑 **Şifre sıfırla** → çıkan geçici şifreyi kişiye özel ilet. Kullanılmayan seed hesaplarını (ör. `uye-direktor`) sil.
3. cPanel → `/home/akdenizg/akdenizg/.env` (ya da Node.js App → Environment variables) içinde `JWT_SECRET` ve `RECOVERY_SECRET`'ı en az 32 karakterlik rastgele değerlerle değiştir → Restart. Tüm oturumlar kapanır.

Şifre değişince ya da hesap silinince o hesabın açık oturumları **anında** kapanır (`token_version`).

## 2. Etkinlik ve UGZ kalıntıları
- `/ugz` → `/` 301; menü, ana sayfa tanıtımı ve Etkinlikler banner'ı kaldırıldı.
- Panelde "yaklaşan" işaretli kalan, tarihi geçmiş etkinlik artık otomatik olarak geçmişe düşer (`server/lib/eventFilters.js`). Yaklaşan liste boşsa site eski yedek veriyi değil "Yeni dönem etkinlikleri yakında" kartını gösterir.
- **Öneri:** Panelde etkinlik formuna tarih zorunluluğu (YYYY-AA-GG) koy; serbest metin tarih otomatik kuralın dışında kalıyor.
- **Öneri:** `AdminUGZ` menüden gizlenmeli ya da sezonluk aç/kapa yapılmalı (`docs/YONETIM-PANELI-ONERI.md`).

## 3–4. SEO / yapay zeka ve soft 404
Ayrıntı: `docs/SEO-YAPAY-ZEKA.md`.

## 5–6. Medya ve önbellek
- `public/assets/events` ve `activities` görselleri aynı adla yeniden sıkıştırıldı (en büyüğü 6,4 MB → 137 KB). Veritabanındaki yollar değişmedi.
- **Dikkat:** Canlıda bu görselleri LiteSpeed doğrudan `public_html/assets/` altından veriyor. Sıkıştırılmış kopyalar oraya da yüklenmeli (yayın paketi 2).
- **Öneri:** Panelden yüklenen görseller zaten 1200 px'e küçültülüyor; WebP çıktısı eklenirse %30 daha küçülür.
- `staj-programlari.png` (1 MB) PNG kalitesiyle küçülmedi; JPG/WebP'ye çevrilmesi önerilir (DB yolu değişeceği için panelden güncellenmeli).

## 14. İletişim mesajlarına erişim (KVKK)
**Sorun:** Mesajlarda ad, e-posta, telefon var; direktör dahil her rol hepsini okuyabiliyor, saklama süresi yok.
**Çözüm önerisi:**
1. `GET /api/messages` → `requireKoordinator` (yalnızca Başkan + koordinatörler). Direktörlerin iş akışı değişeceği için **senin kararın** gerekiyor.
2. 12 ay sonra otomatik silme (sunucu açılışında `DELETE FROM messages WHERE created_at < date('now','-12 months')`).
3. İletişim formuna KVKK aydınlatma onay kutusu.

## 15. Token saklama
**Sorun:** Panel token'ı `localStorage`'da; bir XSS açığı olursa çalınabilir.
**Durum:** CSP'den `script-src 'unsafe-inline'` kaldırıldı; bu XSS riskini ciddi azaltır.
**Öneri:** Token'ı `HttpOnly; Secure; SameSite=Strict` çereze taşımak (sunucuda `cookie-parser`, istemcide `credentials: 'include'`, yazma isteklerinde CSRF başlığı). Yaklaşık yarım günlük iş.

## 16. `App.jsx` monoliti
**Öneri (davranış değişmeden, adım adım):** `src/pages/` altına her sayfa bir dosya; `src/components/` altına `PageHeader`, `SectionTitle`, `FAQSection`, `Button`, `Card`. Sayfalar `lazy()` ile bölünürse ana paket ~375 KB'tan ~200 KB'a iner. Önce ortak bileşenler, sonra sayfa sayfa taşıma; her adımda görsel kontrol.

## 17. Veritabanı yazma modeli
**Sorun:** `sql.js` belleğe yüklenip her yazmada tüm dosya yeniden yazılıyor; sıralama değişikliği gibi toplu işlemler N kez dosya yazıyor. Aynı anda iki süreç çalışırsa veri kaybı olur.
**Öneri:** Kısa vadede toplu uçlar (`PUT /reorder`) ve `db.transaction` içinde tek kayıt. Orta vadede `better-sqlite3`'e geçiş (cPanel'de derleme gerekebilir, önce denenmeli). Her gece `database.sqlite` yedeği (cPanel Cron Jobs ile `cp`).

## 18. Test
**Öneri:** `node:test` + geçici veritabanıyla API testleri (bu gece elle çalıştırılan 25 maddelik auth/KVKK senaryosu `docs/GUVENLIK.md`'de). `server/db.js`'e `DB_PATH` ortam değişkeni eklenirse testler gerçek veritabanına dokunmadan koşar.
