# akdenizgkt.com

Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu (GKT) web sitesi ve yönetim paneli.

- **Ön yüz:** React 18 + Vite + Tailwind 3 (`src/`), yönetim paneli `src/admin/`
- **Sunucu:** Express 5 + sql.js/SQLite (`server/`), sunucu tarafı SEO katmanı `server/seo.js`
- **Barındırma:** cPanel Node.js uygulaması (uygulama kökü `akdenizg`, başlangıç dosyası `app.cjs`); bazı statik dosyalar `public_html` altından LiteSpeed ile sunulur

## Geliştirme
```bash
npm install
cp .env.example .env    # JWT_SECRET, RECOVERY_SECRET, ADMIN_INITIAL_PASSWORD doldur
npm run dev             # Vite :5173 + API :3001
```
Yerel üretim denemesi: `npm run build` ve ardından `NODE_ENV=production PORT=3099 node server/index.js`.

## Önemli kurallar
- **Repo herkese açık.** Şifre, token, `.env`, veritabanı ya da kişisel veri (ad, telefon, e-posta, fotoğraf) commit'lenmez. Commit'ten önce `npm run guvenlik` çalıştır.
- Ekip/kadro yalnızca panelden yönetilir. Panelde **Ekip → Sitede yayınla** açılana kadar sitede görünmez.
- Club Card işletmeleri panelden yönetilir (**Panel → Club Card**, koordinatör ve admin). `src/clubcardData.js` yalnızca veritabanının ilk dolumu ve API'ye ulaşılamadığında yedek liste içindir. WhatsApp numaraları repoya yazılmaz, panelden girilir. Basılı kartlardaki QR `/clupkart` adresine gider; bu yönlendirme kaldırılmamalı.
- Sayfa metinlerini sunucu tarafı özet de kullanır: SSS ve departman metinleri `src/fallbackData.js` içinde.

## Belgeler
| Belge | İçerik |
|---|---|
| `DEPLOY-GUIDE.md` | Sunucu kurulumu |
| `docs/TASARIM-KURALLARI.md` | Tasarım dili ve bileşen kuralları |
| `docs/TASARIM-IHLALLERI.md` | Kurallara uymayan yerler ve düzeltme önerileri |
| `docs/YONETIM-PANELI-ONERI.md` | Yönetim paneli modernleştirme önerisi |
| `docs/SEO-YAPAY-ZEKA.md` | SEO ve yapay zeka arama optimizasyonu |
| `docs/GUVENLIK.md` | Güvenlik betiği, bulgular, sertleştirmeler |
| `docs/SORUN-ANALIZI.md` | Bilinen sorunlar ve çözüm önerileri |
