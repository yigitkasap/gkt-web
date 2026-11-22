# 🌙 GECE İŞİ — 23 Kasım 2026

> **Dal:** `gece-isi-2026-11-23` (GitHub'a push'lu, `main`'e alınmadı) · **Canlıya yüklenmedi**
> Sabah: bu raporu oku → gerekirse yerelde dene → onaylarsan `main`'e al ve aşağıdaki paketleri yükle.

## Önce bu gece main'e ne girdi (canlıya yüklenmeyi bekliyor)
`main` @ `1dc5233`: UGZ sayfası kaldırıldı, Club Card menüden ve sitemap'ten çıkarıldı (yalnızca link/QR ile açılıyor), tarihi geçen etkinlik otomatik "geçmiş" sayılıyor.
Paket: `C:\dev\gkt-web-yayin\1-uygulama-klasorune-akdenizg.zip` + `2-public_html-icin-llms.zip`.
**Gece dalını onaylarsan bu paketleri atla**, aşağıdaki gece paketleri hepsini içeriyor.

## Gece işi — ne yapıldı
| İstek | Sonuç | Nerede |
|---|---|---|
| Tasarımı incele, kurallar çıkar | ✅ 205 satırlık kural belgesi | `docs/TASARIM-KURALLARI.md` |
| Kurallara uymayan yerleri not et | ✅ öncelikli ihlal listesi, düzeltme önerileriyle (kod değiştirilmedi) | `docs/TASARIM-IHLALLERI.md` |
| Bahsettiğim sorunları analiz et, çözüm öner | ✅ 19 madde; 13'ü bu gece çözüldü, 6'sı karar bekliyor | `docs/SORUN-ANALIZI.md` |
| SEO + yapay zeka optimizasyonu | ✅ sunucu tarafı sayfa özeti, JSON-LD, gerçek 404, OG görseli, robots düzeltmesi, medya 14 MB → 2 MB | `docs/SEO-YAPAY-ZEKA.md` |
| Güvenlik betiği, her işte kontrol | ✅ `npm run guvenlik` / `guvenlik:tam`; başlangıç 3 kritik + 8 yüksek → son 0 + 0 | `docs/GUVENLIK.md`, `docs/guvenlik/*.json` |
| Yönetim sayfası nasıl modernleşir | ✅ öneri belgesi (tel çerçeveler + aşamalı plan) | `docs/YONETIM-PANELI-ONERI.md` |
| Kişilerin isim ve görsellerini kaldır | ✅ sitede ve herkese açık API'de görünmüyor; kod, seed, demo, llms ve 17 fotoğraf repodan silindi | aşağıda |

### Kişi isimleri ve görselleri — nasıl çalışıyor
- Hakkımızda'da isim/fotoğraf yerine 8 rol kartı ("Yönetim Kurulu Başkanı · Yakında" …) ve "Ekibimize katılmak ister misin?" bağlantısı var. Departmanlar'da ekip kartları gizli.
- `/api/team` girişsiz isteklere **boş liste** dönüyor; panel tam listeyi görmeye devam ediyor.
- **Yeni isimler gelince:** Panel → Ekip Üyeleri → eski kadroyu sil, yenileri ekle → üstteki sarı kutuda **"Sitede yayınla"**. Bana isimleri söylersen bu adımı birlikte yaparız.
- Canlı veritabanındaki eski kadro kayıtları silinmedi (gece canlıya dokunmadım). Gizli durumda, yeni kadro girilirken silinebilir.

### Kendi kararımla yaptığım ve onayına sunduğum şeyler
1. **`/clubcard` arama motorlarına kapalı** (`noindex`). "Yalnızca link ya da QR ile ulaşılacak" isteğini böyle yorumladım. İstemezsen tek satır.
2. **CSP'den `'unsafe-inline'` kaldırıldı.** Tüm sayfalarda ve panelde konsol hatası yok; yine de canlıda bir göz at.
3. **Şifre kuralı 10 karakter.** Mevcut şifreler etkilenmez, yalnızca yeni ve değişen şifreler için geçerli.
4. **Ana sayfa SSS'deki "18. Zirve Nisan 2026'da gerçekleşecektir" cümlesi** silindi (zirve SSS'si kaldı).
5. **`sharp` 0.35.5'e yükseltildi.** Bu yüzden canlıda **Run NPM Install** şart (aşağıda).

### Bilerek yapmadıklarım (karar senin)
- Mesajları direktörlerin okumasını kısıtlamak: iş akışını değiştirir (`SORUN-ANALIZI.md` §14).
- Tasarım düzeltmeleri: kontrast, dokunma hedefi, odak stili ("not et" dediğin için yalnızca listelendi).
- Canlı panel şifrelerini değiştirmek: ekibin girişini etkiler; yayından sonra senin yapman gereken ilk iş (aşağıda).

## Test edilenler (hepsi yerelde, üretim modunda)
- 25 maddelik auth ve KVKK senaryosunun 25'i geçti (`docs/GUVENLIK.md`).
- Tarayıcıda: panelde şifre sıfırlama ve değiştirme, ekip görünürlük anahtarı, React açıldıktan sonra etiketlerin tekrar etmemesi, SPA gezintisinde başlık ve canonical, 6 sayfada masaüstü ve mobilde yatay taşma yok, konsolda hata yok.
- JS'siz bot görünümü: 13 adres (sayfalar, blog yazısı, 404, panel, API 404) doğru durum kodu, başlık ve JSON-LD ile.
- Güvenlik betiği yeni sunucuya karşı: 0 kritik, 0 yüksek.
- **Test edilmeyen:** gerçek cPanel ortamı (Node 20.20.2 + LiteSpeed). `sharp` 0.35'in sunucudaki kurulumu en belirsiz nokta.

## Yayın (onaylarsan) — cPanel, ~10 dk
Paketler: `C:\dev\gkt-web-yayin\gece\`

**A. Uygulama klasörü** `/home/akdenizg/akdenizg`
1. **Yedek:** `dist` klasörünün adını `dist-eski-2026-11-23` yap. `server` klasörünü **silme**, içinde canlı veritabanı (`database.sqlite`) var.
2. `1-uygulama-akdenizg.zip` dosyasını yükle → Extract (üzerine yazar). Pakette veritabanı ya da `.env` yok.
3. Setup Node.js App → **Run NPM Install** (sharp ve güvenlik güncellemeleri) → **Restart**.

**B. `public_html`**
4. `2-public_html.zip` dosyasını `public_html`'e yükle → Extract. İçinde robots, llms ve sıkıştırılmış etkinlik/faaliyet görselleri var.
5. Varsa `public_html/assets/team/` ve `public_html/assets/ugz*` dosyalarını sil (eski kadro fotoğrafları ve 31 MB video).

**C. Hemen ardından şifreler**
6. `/admin` → **Şifremi Değiştir** → Kullanıcılar → her hesap için **Şifre sıfırla** (geçici şifreyi kişiye özel ilet), kullanılmayan hesapları sil.
7. cPanel'de `JWT_SECRET` ve `RECOVERY_SECRET`'ı yenile → Restart.

**Kontrol:** `npm run guvenlik:tam` → canlıda 0 kritik ve 0 yüksek beklenir. Ardından `docs/SEO-YAPAY-ZEKA.md` içindeki 15 dakikalık kontrol listesi.

**Geri alma:** `dist-eski-2026-11-23` klasörünü `dist` yap; `server` dosyaları için `main` @ `1dc5233` paketini yükle → Restart.

## Commit'ler (`gece-isi-2026-11-23`)
`git log main..gece-isi-2026-11-23 --oneline` ile gör.
