# SEO ve yapay zeka aramaları

## Sorun
Site tek sayfa React uygulaması. Sunucu her adres için aynı boş HTML kabuğunu (`<div id="root"></div>`) gönderiyordu:
- **JavaScript çalıştırmayan okuyucular** (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bing'in bir kısmı, WhatsApp/LinkedIn/X/Telegram önizlemeleri) hiçbir sayfa içeriği göremiyordu.
- Her paylaşılan link ana sayfa başlığı ve kare logoyla görünüyordu.
- Var olmayan her adres `200` dönüyordu (soft 404).
- `robots.txt`'teki yapay zeka botu grupları `*` grubunu ezdiği için bu botlara panel/API yasağı işlemiyordu.

## Yapılanlar (gece dalı)
### `server/seo.js` — sunucu tarafı sayfa özeti
Her istek için `index.html`'e eklenenler:
- Sayfaya özel `<title>`, `description`, `canonical`, `robots`, Open Graph, Twitter kartı, makaleler için `article:published_time`.
- **JSON-LD:** `Organization` (Akdeniz Üniversitesi `parentOrganization`, sosyal hesaplar ayarlardan), `WebSite`, `BreadcrumbList`, `FAQPage` (ana sayfa + Hakkımızda), `Event` (yaklaşan etkinlikler, ISO tarihliyse), `Blog` / `BlogPosting`, `ContactPage`.
- `#root` içine sayfanın gerçek içeriğinden üretilmiş okunabilir HTML: başlık, açıklama, faaliyetler, etkinlikler, departmanlar ve görev alanları, tarihçe, SSS, blog listesi ve yazının tam metni. Ölçülen özet uzunlukları: ana sayfa 535, Etkinlikler 575, blog yazısı 802 kelime.
- Özet görsel olarak gizli; React açılınca yerine gerçek sayfa çizilir. İçerik birebir aynı olduğu için gizleme (cloaking) sayılmaz.
- Etiketler `data-rh="true"` taşır: react-helmet-async açılışta bunları kendi etiketleriyle değiştirir. Tarayıcıda doğrulandı: React açıldıktan sonra `description` 1, `canonical` 1 adet, tekrar yok; SPA içi gezintide başlık ve canonical doğru değişiyor.
- İçerik React ile aynı kaynaktan okunur (`src/fallbackData.js`: departmanlar, faaliyetler, SSS; `src/clubcardData.js`). SSS metinleri bu yüzden `App.jsx`'ten `fallbackData.js`'e taşındı (`HOME_FAQ`, `ABOUT_FAQ`).

### Durum kodları ve dizinleme
- Bilinmeyen adres ve olmayan blog yazısı → **404** + `noindex`.
- `/admin`, `/superadmin` → `noindex, nofollow`.
- `/clubcard` → `noindex, follow` (yönetim kararı: yalnızca link/QR). Hem sunucu HTML'inde hem React'te.
- Bilinmeyen `/api/*` → JSON 404 (önceden istek asılı kalıyordu).

### Diğer
- **Paylaşım görseli:** `public/assets/og/gkt-og.jpg` (1200×630, 86 KB, site tasarım diliyle). Blog yazılarında kapak görseli varsa o kullanılır.
- **`robots.txt`:** Yapay zeka botları tek grupta toplandı ve panel/API yasakları bu gruba da eklendi. Yeni botlar eklendi: OAI-SearchBot, Claude-SearchBot, Claude-User, Perplexity-User, Applebot-Extended, meta-externalagent.
- **`llms.txt` / `llms-full.txt`:** UGZ sayfası, eski kadro isimleri ve Club Card çıkarıldı.
- **Sitemap:** `/ugz` ve `/clubcard` çıkarıldı. Blog yazıları `lastmod` ile duruyor.
- **Hız:** 31 MB video kaldırıldı, görseller 14,2 MB → 2,1 MB. Ana JS paketi 407 KB → 375 KB.

## Yayından sonra yapılacak kontroller (15 dk)
1. `curl -A GPTBot https://akdenizgkt.com/etkinlikler`: çıktıda `<main>` içinde etkinlik metinleri görünmeli.
2. Google **Zengin Sonuçlar Testi**: ana sayfa (FAQPage, Organization) ve bir blog yazısı (BlogPosting).
3. **Facebook Sharing Debugger** ya da **LinkedIn Post Inspector** ile bir blog linki: başlık ve görsel doğru gelmeli. Eski önizleme önbellekteyse "Scrape again".
4. **Google Search Console**: sitemap'i yeniden gönder, `/ugz` için kaldırma isteği gerekmez (301).
5. **Bing Webmaster Tools**: siteyi ekle. ChatGPT arama ve Copilot büyük ölçüde Bing dizinini kullanır; bu, yapay zeka görünürlüğü için en etkili tek adım.

## Sonraki öneriler (öncelik sırasıyla)
1. **Etkinlik başına sayfa** (`/etkinlikler/:slug`): her etkinliğin kendi URL'si, `Event` şeması ve paylaşım görseli olur. "Akdeniz kariyer günleri 2026" gibi aramalarda çıkmanın yolu bu.
2. **Blog düzeni:** ayda 2–3 yazı; başlıkta soru biçimi ("Staj nasıl bulunur?"), yazı başında 2–3 cümlelik net cevap. Yapay zeka asistanları bu paragrafları alıntılıyor.
3. **Google İşletme Profili** (Akdeniz Üniversitesi kampüs adresiyle): "Antalya öğrenci topluluğu" yerel aramaları.
4. **Sosyal hesaplarda site linki:** Instagram bio, LinkedIn şirket sayfası ve YouTube kanal açıklamasında `akdenizgkt.com`. `Organization.sameAs` ile karşılıklı doğrulama sağlar.
5. **Erişilebilirlik düzeltmeleri** (`TASARIM-IHLALLERI.md`): Lighthouse SEO ve erişilebilirlik puanını doğrudan etkiler.
