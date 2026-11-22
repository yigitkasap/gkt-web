# akdenizgkt.com Yönetim Paneli (/admin) — İnceleme ve Modernizasyon Önerisi

Tarih: 2026-11-23 · Dal: `gece-isi-2026-11-23` · Kapsam: `src/admin/*`, `server/routes/*`, `server/auth.js`
Not: Bu belge yalnızca öneridir; kodda hiçbir değişiklik yapılmamıştır. Yerel üretim sunucusunda (`localhost:3099/admin?demo=true`) masaüstü (1366 px) ve telefon (390 px) görünümleri incelendi; canlı siteye giriş denenmedi. Ekran görüntüleri oturum çalışma klasöründe (`scratchpad\panel`).

---

## 0. Kısa özet (yönetici özeti)

Panel bugün **çalışan, tutarlı görünen, ama her modülün kendi kopyasını taşıyan** bir yapı. 7 173 satırın büyük kısmı 11 modülde tekrar eden aynı form/tablo/onay kalıbından oluşuyor. Gönüllü kullanıcılar için asıl eksikler görsel değil **iş akışı** düzeyinde:

1. Dönem geçişi (eski kurulu kaldır, yenisini ekle) bugün tek tek ekle/sil ile yapılıyor; toplu ekleme, arşiv ve "yayına al" yok.
2. Hesap güvenliği zayıf: şifre değiştirme/sıfırlama yok, silinen/rolü düşürülen kullanıcının token'ı 24 saat geçerli kalıyor, işlem günlüğü yok.
3. İletişim mesajları (ad, e-posta, telefon) rolü ne olursa olsun **her girişli kullanıcıya** açık; saklama süresi ve KVKK silme akışı yok.
4. Taslak/yayında ayrımı yalnızca Çekiliş ve UGZ'de var (`is_visible`); blog, etkinlik, ekip, sponsor yayına doğrudan düşüyor.
5. Telefonda "açılıyor" ama "rahat kullanılmıyor": tablolar 3 sütuna çöküyor, modal formlar uzun, sıralama yukarı/aşağı okuyla N adet kayıt yazıyor.

Öneri: yığını (React 18 + Tailwind + react-router + lucide) **koruyarak**, `src/admin/ui/` altında 8–10 ortak bileşen çıkarmak, menüyü dört gruba ayırmak, sunucuya küçük üç ekleme yapmak (`audit_log`, `seasons`/`status`, toplu sıralama + soft delete). Yeniden yazım gerekmez; kademeli geçilir.

---

## 1. Mevcut durum

### 1.1 Mimari ve ortak noktalar

| Konu | Bulgu | Kanıt |
|---|---|---|
| Kabuk | Yan menü + üst çubuk; menü `MENU` dizisi, 3 grup (içerik / diğer / yalnız admin) ve ayırıcılar; "içerik" grubunda 8 öğe (Ekip, Etkinlik, UGZ, Medya, Blog, Sponsor, Mesaj) karışık | `AdminApp.jsx:115-133` |
| Menü gizleme | Yalnız `adminOnly` var; koordinatör/direktör için başka rol ayrımı yok. Yetkisiz URL'ye girilince rota hiç tanımlı olmadığından **boş sayfa** görünür (404/403 ekranı yok) | `AdminApp.jsx:131,329-330` |
| Breadcrumb | Her üst parça `/admin`'e gidiyor, hiyerarşi yok; kullanıcıya bilgi katmıyor | `AdminApp.jsx:135-149,282-296` |
| Tekrarlı kod | Aynı input sınıfı dizisi (`focus:ring-2 focus:ring-red-500`) 14 dosyada, toplam ~82 kez; her modülde ayrı `modalOpen/editing/form/saving/confirm/uploading/pickerOpen` durumu (12 `setConfirm` ve 9 `handleUpload` kopyası) | `grep` sayımı: `AdminTeam` 9, `AdminEvents` 8, `AdminUGZ` 22 vb. |
| Erişilebilirlik | Tüm panelde **sıfır** `aria-*`/`role=` kullanımı; Modal'da Esc, odak tuzağı, `role="dialog"` yok; toast `aria-live` değil | `AdminApp.jsx:38-91` |
| Toast | 3 sn sabit, tek tip, `id = Date.now()` (aynı ms'de çakışır), üst sağ köşe telefonda üst çubuğun üstüne biniyor; geri al (undo) yok | `AdminApp.jsx:26-36` |
| ConfirmDialog | Onay düğmesi **her zaman "Sil"**; silme dışı onaylarda (yayından kaldır, arşivle) kullanılamaz | `AdminApp.jsx:71-72` |
| Modal | Dışarı tıklayınca kapanmıyor (bilinçli, iyi); ama form uzun olduğunda iç kaydırma + `my-auto` karışımı telefonda başlığı/kaydet düğmesini ekran dışında bırakıyor; kaydet düğmesi sabit değil | `AdminApp.jsx:90-97`, `AdminTeam.jsx:149-210` |
| Veri çekme | Her sayfa kendi `load()`'unu çağırıyor; önbellek yok; mesajlar **iki kez** çekiliyor (kabuk rozeti + pano), her ikisi de yalnız sayı için tüm kayıtları indiriyor; rozet hiç yenilenmiyor | `AdminApp.jsx:171-173`, `AdminDashboard.jsx:18-27` |
| Sayfalama | Hiçbir listede yok (`SELECT *`); mesajlar sınırsız büyür | `server/routes/messages.js:28-33` |
| Sıralama | Yukarı/aşağı ok; her taşımada **tüm listeyi** sırayla PUT'luyor, sunucu her yazmada tüm veritabanı dosyasını diske yazıyor (sql.js) → 20 kişilik listede 20 istek + 20 dosya yazımı | `ReorderControls.jsx:12-34`, `server/db.js:24-27,63` |
| Demo modu | İyi fikir (`?demo=true`); ama yazma işlemleri hata verip yalnız toast gösteriyor, boş durum ve yükleme iskeletlerini test etmek için yarı işlevsel | `adminApi.js:7-9,35-40` |

### 1.2 Modül modül değerlendirme

**Pano (`AdminDashboard.jsx`)** — İyi: iskelet yükleme ekranı, hızlı eylem düğmeleri. Zor: yalnızca 4 sayı + son 5 mesaj + son 3 blog; "bana ne iş düşüyor" sorusuna cevap vermiyor (taslak yok, yaklaşan etkinlik yok, eksik içerik yok, UGZ/çekiliş yok). "Etkinlikler: 3" tüm etkinlikleri sayıyor, yaklaşan değil (`:24`). 👋 emoji ve "İşte genel durumun" metni dışında rol bazlı içerik yok: direktör de aynı panoyu görüyor. Dört istek paralel ama herhangi biri hata verirse sessizce `[]` dönüyor → "0 üye" yanlış güven verir (`:19-22`).

**Ekip (`AdminTeam.jsx`)** — İyi: arama + departman filtresi, koordinatör/direktör için departman kilidi, MediaPicker + yükleme. Zor:
- Dönem/sezon kavramı yok; `team_members` tablosunda `season`, `is_visible`, `status` alanı yok (`server/db.js:111-123`). Eski kurulu "arşivle" = tek tek **sil** (geri dönüşü yok, `AdminTeam.jsx:57-65`).
- Toplu ekleme/toplu işlem yok; her üye için 1 modal (6 alan + görsel) → 15 kişilik kurul ≈ 15 modal, ≥ 90 tıklama/alan geçişi.
- `DEPARTMENTS` sabiti Ekip (`:9`) ve Kullanıcılar (`AdminUsers.jsx:6`) dosyalarında **farklı** (Kullanıcılar'da "Yönetim Kurulu" yok); tek kaynak yok.
- `sort_order` serbest sayı; ipucu metni "YK: 1-10, Koordinatörler: 11-20" gibi elle kurallara dayanıyor (`:205`).
- Genel `GET /api/team` `SELECT *` dönüyor; **telefon ve e-posta herkese açık API'den çıkıyor** (`server/routes/team.js:8-18`). Site yeni ekibe geçerken bu alanlar için gizli/açık ayrımı yapılmalı.
- Telefon: tablo Unvan/Departman/E-posta sütunlarını gizliyor (`:108-110`), geriye avatar + ad + sıra + işlem kalıyor; görsel yüklenmemişse alt metin taşıyor (ekran görüntüsünde kırık görsel + alt yazı sızıyor).
- Yetki: `PUT` rota seviyesinde `requireAuth`; koordinatör/direktör yalnız kendi departmanı (`team.js:48-53`) — iyi; `POST/DELETE` koordinatör+.

**Etkinlikler (`AdminEvents.jsx`)** — İyi: Yaklaşan/Geçmiş sekmeleri; sunucu tarihi geçeni otomatik "geçmiş" sayıyor (`events.js:12-22`). Zor: tarihi geçince panel yine "yaklaşan" sekmesinde gösteriyor olabilir (panel ham `is_upcoming` bayrağıyla süzüyor, `AdminEvents.jsx:44`) → panel ile site farklı sonuç gösterir. Taslak/yayın yok; yinelenen etkinlik (kopyala) yok; renk seçimi Tailwind gradyan dizgesi (`:9-15`) — gönüllü için anlamsız. Yeni etkinlik: Yeni Etkinlik → 9 alan → Ekle; en az 4 tıklama + metin. Etkinlik başına katılımcı/kayıt/duyuru bağlantısı yok.

**Blog & Duyurular (`AdminBlog.jsx`)** — İyi: kendi zengin metin editörü, öne çıkan limiti (`blog.js checkFeaturedLimit`), slug kilidi (SEO için doğru karar), sunucuda HTML temizleme (`sanitizeRichHtml`). Zor: editör `document.execCommand` ile (`:43`) — kullanımdan kalkmış API, mobilde tutarsız; taslak/zamanlı yayın yok → yazılan her şey kaydedildiği an yayında; önizleme yok; otomatik kaydetme/kurtarma yok; DELETE yalnız admin, ama POST/PUT herkese açık (direktör herkesin yazısını düzenleyebilir).

**Sponsorlar (`AdminSponsors.jsx`)** — Basit ve yeterli: ad, logo, kategori, sıra. Eksik: web sitesi bağlantısı, sezon/yıl, görünürlük, sponsor kademesi (UGZ'de var, ana sponsorda yok → `ugz_sponsors` ve `sponsors` ayrı iki liste).

**Mesajlar (`AdminMessages.jsx`)** — İyi: okunmamış vurgusu, satır tıklayınca aç, silme yalnız admin. Zor (ciddi):
- Telefon + e-posta listede açık (`:61-63`); **rol ayrımı yok** — direktör dahil her girişli hesap `GET /api/messages` ile tüm kişisel veriyi alıyor (`messages.js:28-33`).
- "Okundu" otomatik: modal açılınca işaretleniyor (`:15-20`), yani yanlışlıkla açılan "okunmuş" olur; "okunmadı yap", durum (yeni/yanıtlandı/arşiv), atama, not, arama, filtre, toplu silme, dışa aktarma yok.
- Saklama süresi yok; silme kalıcı ve tek tek (`DELETE FROM messages`, geri alınamaz).
- Yanıt akışı panelde yok: "Yanıtla" mailto/WhatsApp bağlantısı bile yok.

**Tarihçe / Aktiviteler (`AdminMilestones.jsx`, `AdminActivities.jsx`)** — Aynı kalıp, 106 ve 139 satır; ayrı modül olarak menüde "diğer" altında. İçerik yönetimi açısından "Hakkımızda" başlığı altında tek ekranda iki sekme olabilir.

**Çekiliş (`AdminRaffles.jsx` + `RaffleDrawer.jsx`, 304 + 758 satır)** — Panelin en olgun modülü: `is_visible` (taslak benzeri), yedek kazananlar yalnız adminde (`raffles.js:15` herkese açık sorguda `backup_names` yok — doğru). Zor: 758 satırlık tek dosya; kaydırmalı çekmece (drawer) kalıbı burada var ama diğer modüllere yayılmamış → **drawer ortak bileşene dönüştürülebilir**. `GET /all` ve yazma herkese açık (`requireAuth`), kazanan adı kişisel veri → rol sınırı yok.

**Medya (`AdminMedia.jsx` 642 satır + `MediaPicker.jsx`)** — İyi: kütüphane + `stats` ucu + seçici; sunucuda `sharp` ile görsel optimizasyonu (`server/optimize-images.js`). Zor: hangi içerikte kullanıldığı görünmüyor → silme körü körüne (silme yalnız admin, `media.js:137`); klasör/etiket yok.

**Site Ayarları (`AdminSettings.jsx`)** — Gerçek hata: `Section` ve `Input` bileşenleri `AdminSettings` **render fonksiyonunun içinde** tanımlı (`:32`, `:44`). Her tuş vuruşunda `settings` durumu değiştiği için bileşen tipi yeniden oluşuyor, input DOM'dan sökülüp yeniden takılıyor → **yazarken odak kaybı** ihtimali yüksek (uzun metin yazan kişi her harften sonra tıklamak zorunda kalabilir; canlıda doğrulanmalı). Çözüm: bileşenleri dosya düzeyine taşımak (5 dk). Ayarlar anahtar bazlı tek tek PUT'lanıyor (`:19-23`) — kısmen kaydedilirse tutarsız kalır.

**Kullanıcılar (`AdminUsers.jsx`)** — İyi: rol rozetleri, telefon için sütun gizleme, kendini/süper adminı silememe. Zor:
- Yalnız **oluştur ve sil**; rol/departman düzenleme, şifre sıfırlama, devre dışı bırakma, son giriş yok.
- Form ipucu "Büyük harf, küçük harf ve rakam içermeli" (`:111`) diyor, sunucu yalnız 8–128 karakter denetliyor (`server/routes/auth.js:130`) → kullanıcıya yalan vaat, zayıf şifre kabul ediliyor.
- Silinen hesabın JWT'si 24 saat geçerli (`auth.js:14`, `requireAuth` veritabanına bakmıyor, `auth.js:21-35`); rol/departman da token içine gömülü (`auth.js:12`) → rol düşürme/dönem sonu çıkarma anında etki etmez.
- Çıkış listesi (`tokenBlacklist`) bellekte; sunucu yeniden başlayınca (Hostinger/Passenger yeniden başlatmaları) logout olan token'lar tekrar geçerli olur (`auth.js:9`).
- Giriş denemesi sınırı yalnız IP başına bellekte (`auth.js` routes: `checkLoginRate`), kullanıcı adı bazlı kilit yok; arkada paylaşılan IP (üniversite ağı) yüzünden masum kullanıcılar da kilitlenebilir.
- Süper admin kurtarma uç noktası (`/super-login`) gizli anahtarla tek istekte şifre sıfırlıyor — acil durum için iyi, ama işlem günlüğüne yazılmıyor, yalnız `console.warn` var.

**UGZ (`AdminUGZ.jsx`, 748 satır)** — Dört alt sekme (Ayarlar/Konuşmacılar/Program/Sponsorlar), 22 input kopyası, üç ayrı Modal. Herkese açık sitede sayfa kaldırıldı (`src/App.jsx:100` `/ugz` → `/` yönlendirmesi) ama menüde "18. UGZ" duruyor ve başlık yıla/sayıya sabit. Öneri 2.4'te.

### 1.3 Ölçülebilir sorun özeti

| Ölçüt | Bugün | Hedef |
|---|---|---|
| Yeni etkinlik ekleme | Menü → Yeni → 9 alan → Ekle (≥ 4 tıklama, her seferinde boş form) | Pano "Hızlı ekle" veya `Ctrl+K` → "etkinlik" (2 tıklama), kopyala ile yinelenenler 1 tıklama |
| 15 kişilik kurul ekleme | 15 × (aç, 6 alan, görsel, kaydet) ≈ 15 modal | Tek tabloya yapıştır + toplu fotoğraf (1 ekran, ≈ 5 dk) |
| Dönem geçişi | Elle sil/ekle; geri dönüş yok | 4 adımlı sihirbaz, tek işlemde yayına alma, tek tıkla geri al |
| Sıralama | N istek + N dosya yazımı | Sürükle-bırak + tek `PUT /reorder` |
| Tekrarlı input sınıfı | ~82 | 1 `Field` bileşeni |
| aria/role | 0 | Modal/Drawer/Toast/Menü tamamı |
| Mobilde tablo | 3 sütun, e-posta/unvan gizli | Kart görünümü (ad + unvan + durum) |
| Rol bazlı kapı | Yalnız `adminOnly` menü; sayfa içi boş ekran | Rol izin matrisi tek kaynaktan hem menü hem sunucu |
| Kişisel veriye erişim | Her girişli hesap | Yalnız yetkili rol, maskeli liste, erişim günlüğü |

### 1.4 Rol bazlı görünürlük — bugünkü gerçek durum (sunucu kodundan)

| Kaynak | Okuma | Ekle | Düzenle | Sil |
|---|---|---|---|---|
| Ekip | Herkese açık | Koord.+ (kendi dep.) | Dir.+ (kendi dep.) | Koord.+ (kendi dep.) |
| Etkinlik | Herkese açık | **Herkes (girişli)** | **Herkes** | **Herkes** (`requireDirektor` = üç rol) |
| Blog | Herkese açık | **Herkes** | **Herkes** | Yalnız admin |
| Sponsor | Herkese açık | **Herkes** | **Herkes** | Koord.+ |
| Mesaj | **Herkes (girişli)** | Herkese açık form | Okundu: herkes | Yalnız admin |
| Tarihçe / Aktivite | Herkese açık | Herkes | Herkes | Yalnız admin |
| Çekiliş | Herkes (girişli, yedekler dahil) | Herkes | Herkes | Yalnız admin |
| UGZ | Herkes (girişli) | Koord.+ | Koord.+ | Yalnız admin |
| Medya | Herkes | Herkes (yükleme) | — | Yalnız admin |
| Ayarlar, Kullanıcılar | Yalnız admin | Yalnız admin | Yalnız admin | Yalnız admin |

Sorun: "direktör = sınırlı yetki" (`AdminUsers.jsx:115` ipucu) ifadesi etkinlik/blog/sponsor/mesaj için **doğru değil**; direktör bu alanlarda koordinatörle eşdeğer, etkinliği silebilir (`events.js:72`). Yetki kuralları 12 dosyada dağınık `requireX` çağrılarıyla ifade edilmiş, tek tablo yok.

---

## 2. Hedef bilgi mimarisi

### 2.1 Menü: dört grup

```
GENEL
  Pano

İÇERİK                          (herkese açık siteyi doğrudan değiştirir)
  Etkinlikler
  Blog & Duyurular
  Medya Kütüphanesi
  Site Sayfaları  ▸ Tarihçe · Aktiviteler · Sponsorlar   (tek ekran, sekmeli)

TOPLULUK
  Ekip & Dönemler                ← "Ekip Üyeleri" yerine; dönem seçici içinde
  Çekilişler
  (Zirve — sezonluk, bkz. 2.4)

ETKİLEŞİM
  Mesaj Kutusu            ● 3
  (İleride: Başvurular, Bülten)

SİSTEM                          (yalnız admin; koordinatör "Hesabım" görür)
  Kullanıcılar & Roller
  Site Ayarları
  İşlem Günlüğü
  Hesabım  (şifre, oturumlar)
```

Kurallar:
- Menü kendi rol izni dışındaki öğeyi **göstermez**; doğrudan URL'ye gidilirse boş sayfa yerine "Bu sayfa için yetkiniz yok" ekranı (`AdminApp.jsx:329-330` yerine).
- Telefonda sol çekmece yerine **alt sekme çubuğu** (Pano · İçerik · Topluluk · Mesaj · Daha fazla); 5 hedef, başparmakla ulaşılır. Çekmece "Daha fazla" içinde.
- Breadcrumb yalnız iç sayfalarda (Ekip › 2026-27 › Ad Soyad); `BREADCRUMBS` dizisi yerine rota tanımından türetilir.

### 2.2 Pano (widget'lar)

Rol bazlı, sıralı "Bugün ne yapmalıyım?" panosu:

1. **Dikkat gerektirenler** (en üst): okunmamış mesajlar (3 gün+ bekleyenler kırmızı), taslak blog yazıları, tarihi geçmiş ama "yaklaşan" işaretli etkinlikler, görseli olmayan ekip üyeleri, yayına hazır dönem.
2. **Hızlı ekle**: Etkinlik · Blog · Duyuru · Ekip üyesi · Çekiliş (rol izin verdiği kadar).
3. **Yaklaşan etkinlikler** (sonraki 3, tarih + durum rozeti + düzenle).
4. **Site durumu**: son yayın zamanı, kaç öğe yayında/taslak, `Siteyi aç` bağlantısı.
5. **Mesaj özeti** (admin/iletişim sorumlusu): yeni · yanıt bekleyen · bu hafta (kişisel veri göstermeden yalnız konu).
6. **Son işlemler** (işlem günlüğünden son 8; admin): "Elif, Etkinlik 'Kariyer Günü'nü yayına aldı — 2 dk önce".

Veri: tek uç `GET /api/admin/summary` (sunucuda sayımlar) → mesajlar iki kez indirilmez; rozet 60 sn'de bir yenilenir.

### 2.3 Genel arama / komut paleti (`Ctrl/Cmd+K`, telefonda üst çubukta büyüteç)

- Üç tür sonuç: **Sayfa** ("Mesajlar"), **Kayıt** (ekip, etkinlik, blog, sponsor adı — istemcide yüklü listelerden), **Eylem** ("Yeni etkinlik", "Dönem sihirbazı", "Şifremi değiştir").
- Rol izni olmayan eylemler listelenmez. Mesaj içerikleri **aranmaz** (KVKK; yalnız Mesaj Kutusu içinde yetkili arar).
- Uygulama: ek bağımlılık olmadan ~150 satırlık bileşen (modal + input + yön tuşları); `cmdk` kullanılmak istenirse tek paket (~5 kB).

### 2.4 UGZ'nin akıbeti

Herkese açık sayfa kaldırıldığı için panelde "18. UGZ" menü öğesi yanlış güven veriyor (kullanıcı veri girer, hiçbir yerde görünmez). Seçenekler:

| Seçenek | Artı | Eksi |
|---|---|---|
| A. Gizle (menüden çıkar, kod/veri kalsın) | 10 dk, risksiz | Geri getirmek için kod değişikliği gerekir |
| B. Arşivle (salt okunur dışa aktar + menüden çıkar) | Veri korunur, yıl sonunda temizlenir | Ek iş |
| **C. Sezonluk aç/kapa (öneri)** | Bir `ugz_enabled` ayarı: kapalıyken menüde görünmez ve `/api/ugz/*` herkese açık uçları boş döner; açılınca eski veri durur | Küçük sunucu ayarı |

**Öneri: C, ilk adımı A olarak hemen yapmak.** Ayrıca başlık "18. UGZ" yerine ayardan gelen "Zirve (yıl)" olmalı; dört sekme `Site Sayfaları` altına değil, **Topluluk › Zirve** altına taşınır ve yalnız `ugz_enabled=1` iken görünür. 748 satırlık dosya ortak bileşenlere geçerken (Aşama 3) en son taşınır; şu an dokunmak gereksiz risk.

---

## 3. Ortak bileşen sistemi (`src/admin/ui/`)

Hepsi Tailwind + lucide ile, yeni bağımlılık olmadan. Her biri şu an tekrarlanan bir koddan çıkar.

| Bileşen | Çözdüğü sorun | Ana özellikler |
|---|---|---|
| `Field`, `TextInput`, `Select`, `Textarea`, `Toggle` | ~82 tekrar eden sınıf dizisi; etiket/ipucu/hata düzeni her yerde farklı | `label`, `hint`, `error`, `required`, `aria-describedby` otomatik; tek odak halkası |
| `DataTable` | 11 ayrı tablo kopyası | Metin arama, sütun filtreleri, sıralama (başlığa tıkla), sayfalama (25/50), satır seçimi + **toplu işlem çubuğu**, boş/yükleniyor/hata durumları, **mobilde kart görünümü** (`renderCard` prop'u), kalıcı filtre (URL parametresi) |
| `Drawer` | Uzun modal formlar, telefonda sabit olmayan "Kaydet" | Sağdan kayan panel (masaüstü 480 px), telefonda alttan tam yükseklik; başlık ve altbilgi sabit, gövde kayar; Esc, odak tuzağı, kirli form uyarısı (mevcut `dirty` mantığı korunur); RaffleDrawer'daki deseni genelleştirir |
| `StatusBadge` + durum alanı | Taslak/yayında yok | `draft` · `published` · `scheduled` · `archived`; liste başında filtre sekmeleri; **kaydet** (taslak) ve **yayına al** ayrı düğmeler |
| `PreviewButton` | Yayına almadan sonucu görememe | Önizleme: public sitede `?onizle=<kısa ömürlü token>` ile taslağı gösterir (tek uç + kısa JWT); olmazsa panel içinde "kart önizlemesi" |
| `SortableList` | Yukarı/aşağı ok, N yazma | Sürükle-bırak (`@dnd-kit/sortable` ≈ 12 kB **veya** bağımlılıksız HTML5 DnD + klavye için yukarı/aşağı düğmesi korunur); bırakınca tek `PUT /<kaynak>/reorder {ids:[…]}`; sıra numarası alanı formdan kalkar |
| `ImageField` | 9 kopya yükleme + MediaPicker | Sürükle-bırak yükleme, ilerleme, kırp (kare/16:9 oranı kaynağa göre), alt metin alanı, kaldır, "Medyadan seç" |
| `ToastProvider` | Sabit 3 sn, a11y yok | `aria-live`; hata kalıcı, başarı 3 sn; **Geri al** eylemi (soft delete ile 8 sn); telefonda alta yakın |
| `ConfirmDialog` v2 | Hep "Sil" | `confirmLabel`, `tone` (danger/default), yazarak onay ("SİL" yaz) yalnız toplu ve geri alınamaz işlemlerde |
| `EmptyState` | Her yerde farklı metin | İkon + tek cümle + birincil eylem ("İlk etkinliği ekle"); filtre sonucu boşsa "Filtreyi temizle" |
| `useResource(name)` | Her sayfa kendi `load()`'u | `list/create/update/remove` + yükleme/hata durumu + iyimser güncelleme; sayfalar arası basit önbellek |
| `can(user, 'event.delete')` | Rol kuralları dağınık | Tek `permissions.js` (menü, düğme ve rota kapısı aynı tablodan) ve sunucuda aynı tablonun `requirePermission('event.delete')` karşılığı |

Kod büyüklüğü beklentisi: 11 modül ≈ 3 400 satır liste/form kodundan ≈ 1 100 satıra, ortak bileşenler ≈ 900 satır; toplamda ~%35 küçülme ve her yeni modül ≈ 60 satır.

---

## 4. Kritik akışlar için tel çerçeveler

### 4.1 Pano — masaüstü

```
┌──────────────┬─────────────────────────────────────────────────────────────┐
│ GKT          │  🔍 Ara veya komut yaz… (Ctrl+K)            ● 3   Elif ▾   │
│ ──────────── ├─────────────────────────────────────────────────────────────┤
│ ▣ Pano       │  Merhaba Elif — Medya ve IT Koordinatörü                   │
│ İÇERİK       │                                                             │
│  Etkinlikler │  DİKKAT GEREKTİRENLER                                       │
│  Blog        │  ┌──────────────────────────────────────────────────────┐  │
│  Medya       │  │ ● 3 mesaj 2 gündür yanıt bekliyor        [Aç →]      │  │
│  Sayfalar    │  │ ◐ "Güz Dönemi" yazısı taslak, 5 gündür    [Düzenle]  │  │
│ TOPLULUK     │  │ ◔ "Kariyer Günü" tarihi geçti, hâlâ "yaklaşan" [Düzelt]│ │
│  Ekip        │  │ ▢ 4 ekip üyesinin fotoğrafı eksik         [Tamamla]  │  │
│  Çekilişler  │  └──────────────────────────────────────────────────────┘  │
│ ETKİLEŞİM    │                                                             │
│  Mesajlar ●3 │  HIZLI EKLE   [+ Etkinlik] [+ Blog] [+ Duyuru] [+ Üye]     │
│ SİSTEM       │                                                             │
│  Kullanıcılar│  ┌─ Yaklaşan etkinlikler ──────┐ ┌─ Site durumu ───────────┐│
│  Ayarlar     │  │ 28 Kas  Kariyer Günü  ●Yayında│ │ Yayında: 12 etk · 9 yazı ││
│  Günlük      │  │ 05 Ara  Workshop      ◐Taslak │ │ Taslak : 2 etk · 1 yazı  ││
│              │  │ 12 Ara  Gezi          ●Yayında│ │ Son yayın: 2 sa önce      ││
│ Hesabım      │  └──────────────────────────────┘ │ [Siteyi aç ↗]            ││
│ Çıkış        │  ┌─ Son işlemler ───────────────┐ └──────────────────────────┘│
│              │  │ Ali — blog yazısını düzenledi 4 dk │                        │
└──────────────┴──└─────────────────────────────────────────────────────────────┘
```

### 4.2 Pano — mobil

```
┌────────────────────────┐
│ ☰ GKT      🔍   ● 3    │
├────────────────────────┤
│ Merhaba Elif           │
│ ┌────────────────────┐ │
│ │● 3 mesaj bekliyor →│ │
│ │◐ 1 taslak yazı    →│ │
│ │◔ 1 etkinlik tarihi │ │
│ │  geçti            →│ │
│ └────────────────────┘ │
│ [+ Etkinlik] [+ Blog]  │
│ [+ Duyuru ] [+ Üye  ]  │
│ Yaklaşan               │
│ 28 Kas Kariyer Günü ●  │
│ 05 Ara Workshop     ◐  │
├────────────────────────┤
│ ⌂ Pano  ▤ İçerik  ◉ Topluluk │
│ ✉ Mesaj●3   ⋯ Daha    │
└────────────────────────┘
```

### 4.3 Ekip — dönem geçişi (sihirbaz)

Veri modeli: `seasons(id, name, status[draft|active|archived], starts_on, ends_on)`; `team_members.season_id`, `is_visible`. Herkese açık `GET /api/team` yalnızca `active` dönemin `is_visible=1` kayıtlarını ve **yalnız izin verilen alanları** döndürür (ad, unvan, departman, görsel; telefon/e-posta ancak üye açıkça "sitede göster" işaretlemişse).

Ekip ana ekranı:

```
┌─ Ekip & Dönemler ───────────────────────────────────────────────────────┐
│ Dönem: [ 2026-27 (Aktif) ▾ ]   [ Yeni dönem hazırla ]   [ Arşivi gör ]   │
│ 🔍 Ara…   Departman: [Tümü ▾]   Durum: [Tümü ▾]       [+ Üye] [⬆ Toplu]  │
├──────────────────────────────────────────────────────────────────────────┤
│ ☐ Üye                Unvan                Departman        Durum    ⋮    │
│ ☐ (foto) Ad Soyad    Başkan               Yönetim Kurulu   ● Yayında ⋮   │
│ ☐ (foto) Ad Soyad    Medya ve IT Koord.   Medya ve IT      ◐ Taslak  ⋮   │
│ ☐ ▢ Ad Soyad         —                    Üye İlişkileri   ◐ Fotoğrafsız │
├──────────────────────────────────────────────────────────────────────────┤
│ 2 seçili:  [Yayına al] [Taslağa al] [Departman değiştir] [Arşivle]       │
└──────────────────────────────────────────────────────────────────────────┘
```

Sihirbaz (Yeni dönem hazırla):

```
 ① Dönem       ② Üyeler          ③ Fotoğraflar       ④ Önizle & Yayına al
 ●─────────────○─────────────────○───────────────────○

 ADIM 2 — Üyeleri ekle
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Yapıştır (Excel/Sheets'ten kopyala) veya CSV yükle:                    │
 │ ┌────────────────────────────────────────────────────────────────────┐ │
 │ │ Ad Soyad ⇥ Unvan ⇥ Departman ⇥ E-posta(ops.)                      │ │
 │ │ Ayşe Kaya    Başkan             Yönetim Kurulu                     │ │
 │ │ Can Demir    Medya ve IT Koord. Medya ve IT                        │ │
 │ └────────────────────────────────────────────────────────────────────┘ │
 │ Önizleme (14 satır, 1 hata):                                           │
 │  ✓ Ayşe Kaya · Yönetim Kurulu         ✓ Can Demir · Medya ve IT        │
 │  ✗ Satır 9: "Medya & IT" tanınmadı → [Medya ve IT] olarak düzelt       │
 │ [ ← Geri ]        [ Şablonu indir ]               [ 14 üyeyi ekle → ]  │
 └────────────────────────────────────────────────────────────────────────┘

 ADIM 4 — Önizle ve yayına al
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Yeni dönem: 2026-27 · 14 üye · 11 fotoğraflı · 3 fotoğrafsız (uyarı)   │
 │ [ Siteyi taslakla önizle ↗ ]                                           │
 │ Yayına alınca:                                                         │
 │  • 2025-26 dönemi ARŞİVLENİR (silinmez, sitede görünmez)               │
 │  • Eski dönemdeki koordinatör/direktör hesapları: ( ) olduğu gibi kalsın│
 │      (•) devre dışı bırak  ( ) yeni üyelere devret                       │
 │  • Eski üyelerin telefon/e-posta bilgisi 90 gün sonra silinir          │
 │ [ ← Geri ]                                  [ ✔ Yayına al ] (Geri alınabilir, 30 gün) │
 └────────────────────────────────────────────────────────────────────────┘
```

Mobil: sihirbaz adımları tam ekran, adım göstergesi üstte, "Yapıştır" yerine **kişi kartı + "Sıradaki kişi" ekle** akışı; satır listesi dokununca alta açılan çekmece.

Tasarım notları:
- Toplu fotoğraf: bir klasör/çoklu dosya sürükle; dosya adından ad eşleştirme ("ayse-kaya.jpg" → Ayşe Kaya) ve eşleşmeyenleri el ile ata.
- Yayına alma **tek veritabanı işlemi**: `UPDATE seasons SET status='archived' WHERE active; UPDATE seasons SET status='active' WHERE id=?`. Geri al = aynı işlemin tersi (30 gün).
- Site şu an isimsiz/görselsiz ekip gösteriyor: yeni dönem yayına alınana kadar `GET /api/team` boş dönebilmeli ve site "ekibimiz yakında" boş durumu göstermeli (public tarafta doğrulanmalı).
- Dönem geçişi hesap geçişini de kapsar: eski koordinatör/direktör hesapları dönem sonunda otomatik **devre dışı** (silme değil) → eski üye panele erişemez (bkz. 5.1).

### 4.4 Etkinlik ekle — masaüstü (drawer) ve mobil

```
Masaüstü (Drawer, sağdan 480 px)                         Mobil (alttan tam ekran)
┌────────────────────────────────────────────┐          ┌──────────────────────┐
│ Yeni etkinlik                      ✕       │          │ ✕ Yeni etkinlik      │
│ ────────────────────────────────────────── │          │ ──────────────────── │
│ Başlık *      [____________________]        │          │ Başlık *             │
│ Tarih *       [ 2026-12-05 ] Saat [18:00]  │          │ [__________________] │
│ Yer           [____________________]        │          │ Tarih *   Saat       │
│ Kategori      [Workshop ▾]                  │          │ [05.12.2026][18:00]  │
│ Açıklama      [____________________]        │          │ Yer                  │
│               [____________________] 0/300  │          │ Kategori ▾           │
│ Görsel        [ sürükle bırak / Medyadan ]  │          │ Görsel [📷 Ekle]     │
│ Renk          ● ● ● ● ●  (isimli)           │          │ Açıklama …           │
│ Kayıt bağlantısı [https://…] (ops.)         │          │ ──────────────────── │
│ ────────────────────────────────────────── │          │ ◐ Taslak olarak      │
│ Durum: (•) Taslak ( ) Yayında ( ) Zamanla  │          │   kaydet             │
│ [ Önizle ↗ ]   [ Taslak kaydet ] [Yayına al]│          │ [   Yayına al   ]   │
└────────────────────────────────────────────┘          └──────────────────────┘
```

İyileştirmeler: tarih alanı gerçek `date` girişi (sunucu zaten `YYYY-MM-DD` bekliyor, `events.js:12`); "yaklaşan/geçmiş" bayrağı formdan kalkar, tarihe göre otomatik türetilir (sunucuda zaten var); **Kopyala** eylemi satır menüsünde; "Taslak kaydet" `is_visible=0`.

### 4.5 Mesaj kutusu — masaüstü ve mobil

```
Masaüstü (liste + okuma paneli)
┌─ Mesaj Kutusu ────────────────────────────────────────────────────────────┐
│ 🔍 Ara…   [Yeni ▾]   Durum: ● Yeni 3 · ◐ Yanıtlandı · ▣ Arşiv   [⬇ Dışa aktar]│
├─────────────────────────────┬─────────────────────────────────────────────┤
│ ● A**ı Y*****z   14 Mar     │  Üyelik Başvurusu                           │
│   Üyelik Başvurusu          │  A** Y*****z · a***@gmail.com · 05** *** ** 12│
│ ○ Ay** K***     13 Mar      │  [👁 İletişim bilgisini göster]  (günlüğe yazılır)│
│   Sponsorluk Teklifi        │ ──────────────────────────────────────────  │
│ ○ M***** D****  12 Mar      │  Mesaj metni …                               │
│                             │                                              │
│ ☐ ☐ ☐   Seçili: 2           │  Notlar (iç):  [______________________]     │
│ [Okundu][Arşivle][Sil…]     │  Atanan: [Üye İlişkileri ▾]                  │
│                             │  [ ✉ E-postayla yanıtla ] [Yanıtlandı işaretle]│
│                             │  Otomatik silinme: 11 ay 3 gün sonra  [Şimdi sil]│
└─────────────────────────────┴─────────────────────────────────────────────┘

Mobil (liste → detay ayrı ekran)
┌──────────────────────┐   ┌──────────────────────┐
│ Mesajlar  [Yeni ▾]   │   │ ← Üyelik Başvurusu   │
│ ● A** Y***  Üyelik…  │ → │ A** Y*****z          │
│   14 Mar             │   │ [👁 Bilgiyi göster]  │
│ ○ Ay** K*** Sponsor… │   │ Mesaj metni …        │
│ ○ M***** D**** Etkin…│   │ [✉ Yanıtla] [✔ Bitti]│
└──────────────────────┘   │ ⋯ Arşivle · Sil      │
                           └──────────────────────┘
```

Kurallar: açınca otomatik "okundu" yerine 3 sn sonra veya "Okundu" düğmesiyle; ad/e-posta/telefon listede maskeli; "Göster" erişimi günlüğe yazar; "Yanıtla" `mailto:` ile varsayılan e-posta uygulamasını açar (sunucu e-postası gerektirmez); silme önce **çöp kutusuna** (30 gün) gider.

---

## 5. Güvenlik ve KVKK

### 5.1 Hesap güvenliği

Bugünkü açıklar (kod kanıtlı, bölüm 1.2 Kullanıcılar):

| # | Sorun | Etki | Öneri |
|---|---|---|---|
| G1 | Şifre değiştirme/sıfırlama yok | Şifre sızarsa tek çare hesabı silmek | **Bu gece eklenen** `PUT /auth/me/password` (eski şifre + yeni şifre, yeni oturum) ve admin `POST /auth/users/:id/reset` (tek kullanımlık geçici şifre veya 30 dk bağlantı, ilk girişte değiştirmeye zorla `must_change_password`) |
| G2 | Şifre kuralı UI ile sunucuda farklı | `AdminUsers.jsx:111` büyük/küçük/rakam diyor, `auth.js:130` yalnız uzunluk | Tek kural: ≥ 10 karakter, yaygın şifre listesi kontrolü; kuralı sunucu belirler, UI aynı metni gösterir |
| G3 | Token 24 saat, veritabanına bakılmıyor | Silinen/rolü düşen kullanıcı 24 sa erişir (`auth.js:14,21-35`) | `requireAuth` içinde kullanıcıyı çekip `active` ve güncel `role/department` doğrula (sql.js bellek içi, maliyet ihmal edilebilir) veya `token_version` kolonu |
| G4 | Çıkış listesi bellekte | Yeniden başlatmada logout geri alınır | Kısa ömürlü access token (1–2 sa) + yenileme, ya da `token_version` (G3 ile birlikte çözülür, liste gerekmez) |
| G5 | Oturum süresi sabit 24 sa, boşta çıkış yok | Ortak bilgisayar riski | 2 sa access + 8 sa mutlak sınır; istemcide 30 dk boşta uyarı + otomatik çıkış |
| G6 | Token `localStorage`'da (`adminApi.js:11`) | XSS'te çalınır | CSP zaten var (iyi); orta vadede `HttpOnly; SameSite=Strict` cookie + CSRF header; en azından panelde 3. taraf script yok kuralı |
| G7 | Giriş sınırı yalnız IP, bellekte | Paylaşılan ağda masum kilit; yeniden başlatmada sıfırlanır | IP **ve** kullanıcı adı başına sayaç, tabloya yaz, başarısız denemeleri günlüğe yaz |
| G8 | Kullanıcı düzenleme yok | Rol/departman değişmek için hesabı silip açmak gerekir | Kullanıcı düzenle: rol, departman, görünen ad, **devre dışı bırak**, son giriş zamanı |
| G9 | Süper admin kurtarma (`/super-login`) günlüksüz | İzsiz kullanım | Başarılı/başarısız her çağrıyı `audit_log`'a yaz, bildirim e-postası (ops.) |
| G10 | İki adımlı doğrulama yok | Tek faktör | Yalnız `admin` için TOTP (isteğe bağlı, Aşama 4) |

### 5.2 İşlem günlüğü (audit log)

Tablo: `audit_log(id, at, user_id, username, role, action, entity, entity_id, summary, ip, ua)`. Tek yardımcı `audit(req, 'event.update', 'events', id, özet)`; her POST/PUT/DELETE rotasının sonunda 1 satır. Gizli alan yok (şifre, mesaj gövdesi yazılmaz; yalnız "mesaj #42 açıldı/silindi"). Kapsam: giriş başarılı/başarısız, şifre değişimi/sıfırlama, kullanıcı/rol değişimi, dönem yayına alma, her silme, mesaj görüntüleme/dışa aktarma, ayar değişimi. Panelde **Sistem › İşlem Günlüğü** (filtre: kullanıcı, tür, tarih), 12 ay saklanır. Aynı yapı "Geri al" için veri kaynağı olur (silinmeden önceki kayıt `before` JSON'u olarak tutulabilir).

### 5.3 Rol izin matrisi (öneri)

Roller aynı kalır (admin > koordinatör > direktör); **izinler tek tabloda**, hem menü hem sunucu ondan okur. ✓ tam · D yalnız kendi departmanı · T yalnız taslak (yayına alma koordinatör+) · — yok.

| İzin | Direktör | Koordinatör | Admin (Başkan) |
|---|---|---|---|
| Pano, arama | ✓ | ✓ | ✓ |
| Etkinlik oluştur/düzenle | T | ✓ | ✓ |
| Etkinlik yayına al / sil | — | ✓ / ✓ (soft) | ✓ |
| Blog/duyuru yaz | T | ✓ | ✓ |
| Blog yayına al / sil | — | ✓ / — | ✓ |
| Ekip üyesi düzenle | D | D | ✓ |
| Ekip üyesi ekle/arşivle | — | D | ✓ |
| **Dönem sihirbazı, yayına alma** | — | — | ✓ |
| Sponsor, tarihçe, aktivite düzenle | — | ✓ | ✓ |
| Çekiliş yönet (yedekler dahil) | — | ✓ | ✓ |
| Medya yükle / sil | yükle / — | yükle / kendi yüklediğini sil | ✓ |
| **Mesaj kutusu (kişisel veri)** | — | Yalnız "iletişim sorumlusu" bayrağı olan | ✓ |
| Mesaj sil / dışa aktar | — | — | ✓ |
| Kullanıcı yönetimi | — | Kendi departmanında direktör ekle/devre dışı (öneri) | ✓ |
| Şifresini değiştir (Hesabım) | ✓ | ✓ | ✓ |
| Ayarlar, günlük, yedek | — | — | ✓ |

Bu matris bugünkü duruma göre **sıkılaştırma** içerir: direktörün silme ve mesaj okuma yetkisi kalkar, blog/sponsor/çekiliş yazma yetkisi koordinatörle sınırlanır. Geçiş için "ilk gün yalnızca günlükle izle, ikinci hafta uygulat" yaklaşımı önerilir (gönüllüler alışkın olduğu bir yetkiyi birden kaybetmesin).

### 5.4 Mesajlar ve KVKK

Veri: ad, e-posta, telefon, konu, mesaj (`messages` tablosu). Hukuki görüş yerine hizmet veren kişiyle doğrulanması gereken **teknik öneriler**:

1. **Aydınlatma ve açık rıza metni**: iletişim formunun altında kısa aydınlatma + "Gönderirken KVKK Aydınlatma Metni'ni okudum" onayı; onay zamanı mesajla birlikte saklanır (`consent_at`). Formun şu an böyle bir metin içerip içermediği bu incelemede kontrol edilmedi (`Contact` bileşeni ayrıca bakılmalı).
2. **Erişim**: yalnız admin ve "iletişim sorumlusu" işaretli hesap; direktör/koordinatör göremez. Liste maskeli; detayda "Göster" tıklaması günlüğe yazılır.
3. **Veri en az**: telefon alanı zorunlu değil (zaten opsiyonel) — iletişim amacı için e-posta yeterliyse telefon alanını formdan kaldırmayı değerlendir.
4. **Saklama süresi**: varsayılan **12 ay** (öneri; topluluk gerekçesiyle belirlenmeli), her gün çalışan görev `created_at < now-12ay` kayıtlarını kalıcı siler; panelde her mesajda "N gün sonra silinecek" görünür. Yanıtlanıp kapatılan mesaj için kısa süre (örn. 6 ay) seçeneği.
5. **Silme akışı**: panelde Sil → 30 gün **çöp kutusu** (`deleted_at`) → sonra kalıcı silme. İlgili kişi "verilerimi sil" talebinde: e-posta/ad ile ara → tüm eşleşen mesajları seç → "Kalıcı sil" (günlüğe yazılır). Talep yanıt süresi 30 gün olduğu için talep tarihi/not alanı eklenir.
6. **Dışa aktarma**: ilgili kişi erişim talebi için tek kişinin mesajlarını CSV/PDF indir (admin).
7. **Yedekler**: veritabanı dosyası (sql.js, `server/db.js:24-27`) yedeklerinde mesajlar kalır; yedek saklama süresi (örn. 30 gün) mesaj saklama süresiyle uyumlu olmalı ve yedek erişimi admine kısıtlı olmalı.
8. **Ekip verisi**: halka açık `GET /api/team` telefon/e-posta döndürüyor (`team.js:8-18`). Yeni dönemde yalnız üyenin açık onayı varsa yayınla; kimlik görselleri için de onay (`consent_photo`) bayrağı; arşivlenen eski üyelerin telefon/e-postası 90 gün sonra silinir/anonimleştirilir.
9. **Çekiliş**: kazanan adı + yedekler kişisel veri; yayın sonrası belirli süre (örn. 12 ay) sonra "baş harfler" ya da silme seçeneği.
10. **Panel verisi dışarı çıkarken**: ekran görüntüsü/e-posta ile mesaj paylaşımı için panelde "Kişisel veri — paylaşma" uyarısı ve dışa aktarmanın günlüğe yazılması.

---

## 6. Aşamalı uygulama planı

Efor tahminleri tek geliştirici, gönüllü tempo değil net çalışma süresidir. Her aşama bağımsız yayınlanabilir; her aşamadan sonra `npm run build` + demo modda tarama + mobil (390 px) kontrol.

### Aşama 1 — Hızlı kazanımlar (≈ 1 gün, 6–8 saat)

Hepsi mevcut yığında, bağımlılıksız, düşük risk.

| # | İş | Etkilenen dosyalar | Efor |
|---|---|---|---|
| 1.1 | Ayarlar'da `Section`/`Input`'u render dışına taşı (odak kaybı hatası) | `src/admin/AdminSettings.jsx` | 0,5 sa |
| 1.2 | Şifre ipucu metnini sunucuyla eşitle; UI'da 10 karakter kuralı | `src/admin/AdminUsers.jsx`, `server/routes/auth.js` | 0,5 sa |
| 1.3 | Menüyü 4 gruba ayır, etiketleri (Ekip & Dönemler, Mesaj Kutusu) güncelle; UGZ'yi menüden gizle (`ugz_enabled` yoksa sabit bayrak) | `src/admin/AdminApp.jsx` | 1 sa |
| 1.4 | Yetkisiz rota için "Yetkiniz yok" ekranı; breadcrumb'ı hiyerarşik yap | `AdminApp.jsx` | 1 sa |
| 1.5 | `ConfirmDialog`'a `confirmLabel`/`tone`; Modal'a Esc + `role="dialog"` + `aria-modal`; Toast'a `aria-live` ve benzersiz id | `AdminApp.jsx` | 1,5 sa |
| 1.6 | Mesajlarda: listede telefon/e-posta maskele, "Göster" düğmesi; otomatik okundu yerine düğme; ayrı rozet `GET /api/messages/unread-count` (yalnız sayı) | `AdminMessages.jsx`, `AdminApp.jsx:171-173`, `AdminDashboard.jsx`, `server/routes/messages.js` | 2 sa |
| 1.7 | Direktör için mesaj uçlarını kapat (rota seviyesinde `requireKoordinator`, geçici olarak) | `server/routes/messages.js:28,35` | 0,5 sa |
| 1.8 | Pano: "dikkat gerektirenler" (okunmamış, taslak/yaklaşan sayısı) + "etkinlik: yaklaşan" düzeltmesi + hata durumunda sessiz `[]` yerine uyarı | `AdminDashboard.jsx` | 1,5 sa |
| 1.9 | `GET /api/team` yanıtını alan beyaz listesine al (telefon/e-posta hariç) — **site tarafı kullanımı doğrulanarak** | `server/routes/team.js:8-18` + `src/` ekip bileşenleri | 1 sa |

Çıktı: hata düzeltmeleri, KVKK'nin en kritik iki açığı (herkes mesajı görüyor, halka açık telefon/e-posta) ve daha anlaşılır menü.

### Aşama 2 — Orta (≈ 1 hafta, 5 iş günü)

| # | İş | Etkilenen dosyalar | Efor |
|---|---|---|---|
| 2.1 | Ortak UI kütüphanesi: `Field`, `Drawer`, `ConfirmDialog` v2, `EmptyState`, `Toast` v2, `StatusBadge` (`src/admin/ui/*`) | yeni `src/admin/ui/`, `AdminApp.jsx` (Modal/Toast/Confirm buradan çıkar) | 1 gün |
| 2.2 | `DataTable` (arama, filtre, sıralama, sayfalama, toplu işlem, mobil kart) + `useResource` | yeni `src/admin/ui/DataTable.jsx`, `useResource.js` | 1,5 gün |
| 2.3 | Ekip, Etkinlik, Sponsor, Mesajlar'ı yeni bileşenlere taşı (Drawer + DataTable) | `AdminTeam.jsx`, `AdminEvents.jsx`, `AdminSponsors.jsx`, `AdminMessages.jsx` | 1,5 gün |
| 2.4 | Taslak/yayında: `status` (veya `is_visible`) kolonu, etkinlik + blog + ekip; public uçlar yalnız yayındakini döndürür | `server/db.js` (ALTER), `server/routes/{events,blog,team}.js` | 0,5 gün |
| 2.5 | Toplu sıralama: `PUT /api/<kaynak>/reorder` + `SortableList` (sürükle-bırak) | `ReorderControls.jsx` (yerine), `server/routes/*.js` | 0,5 gün |
| 2.6 | Şifre değiştirme/sıfırlama (bu gece eklenenle birleştir), kullanıcı düzenleme (rol, departman, devre dışı), `active` kontrolü `requireAuth`'ta | `AdminUsers.jsx`, yeni `AdminAccount.jsx`, `server/auth.js`, `server/routes/auth.js`, `server/db.js` | 1 gün |
| 2.7 | `audit_log` + panelde Günlük ekranı | `server/db.js`, `server/routes/*.js`, yeni `AdminAudit.jsx` | 0,5 gün |

(2.1–2.7 toplamı ≈ 6,5 gün; öncelik sırasıyla 2.6 → 2.7 → 2.1 → 2.4 → 2.2 → 2.3 → 2.5 yapılırsa hafta sonunda en değerli kısım biter, kalan ertelenir.)

### Aşama 3 — Dönem geçişi ve KVKK akışları (≈ 1 hafta)

| # | İş | Etkilenen dosyalar | Efor |
|---|---|---|---|
| 3.1 | `seasons` tablosu, `team_members.season_id/is_visible`, dönem API'leri (oluştur, yayına al, arşivle, geri al) | `server/db.js`, yeni `server/routes/seasons.js`, `server/routes/team.js` | 1 gün |
| 3.2 | Ekip & Dönemler ekranı + 4 adımlı sihirbaz + yapıştır/CSV içe aktarma + toplu fotoğraf | `AdminTeam.jsx` (yeniden), yeni `src/admin/team/*`, `MediaPicker.jsx` | 2,5 gün |
| 3.3 | Mesaj Kutusu v2: durum, not, atama, arama, toplu işlem, çöp kutusu (soft delete), dışa aktarma | `AdminMessages.jsx`, `server/routes/messages.js`, `server/db.js` | 1,5 gün |
| 3.4 | Saklama süresi görevi (günlük temizlik), `consent_at`, talep arama/sil akışı | `server/index.js` (zamanlayıcı), yeni `server/retention.js`, `messages.js` | 1 gün |
| 3.5 | Eski dönem hesaplarını devre dışı bırakma seçeneği (sihirbaz adım 4) | `server/routes/auth.js`, sihirbaz | 0,5 gün |
| 3.6 | UGZ sezonluk aç/kapa (`ugz_enabled`), menüden dinamik gizleme | `server/routes/ugz.js`, `AdminApp.jsx`, `AdminSettings.jsx` | 0,5 gün |

### Aşama 4 — Büyük (yeniden yazım / ileri seviye, 2–3 hafta, isteğe bağlı)

| # | İş | Not | Efor |
|---|---|---|---|
| 4.1 | Komut paleti (`Ctrl+K`) + alt sekme çubuğu (mobil) | Bağımlılıksız ya da `cmdk` | 2 gün |
| 4.2 | Önizleme akışı (token'lı taslak görüntüleme, public site tarafı) | Public bileşenlerin `?onizle` desteği | 2 gün |
| 4.3 | Zamanlı yayın (`publish_at`), blog editörünü TipTap/Lexical ile değiştirme, otomatik kaydetme | Yeni bağımlılık (~60–120 kB); `execCommand` bağımlılığını bitirir | 3 gün |
| 4.4 | Oturum mimarisi: HttpOnly cookie + CSRF, access/refresh, TOTP (admin) | `server/auth.js`, `adminApi.js` | 3 gün |
| 4.5 | UGZ (748 satır) + Raffle (758 satır) modüllerini ortak bileşenlere taşı | Test + gerileme riski yüksek; son sırada | 3 gün |
| 4.6 | Veritabanı: sql.js tam-dosya yazma yerine `better-sqlite3` ya da en az yazma birleştirme + otomatik yedek | Barındırma (Hostinger) uyumu önce doğrulanmalı | 2 gün |
| 4.7 | Uçtan uca test (Playwright; rol matrisi senaryoları) | Matris regresyonlarını yakalar | 2 gün |

### Tavsiye edilen sıra

1. **Aşama 1 tamamı** (düşük risk, KVKK ve hata kapanışı).
2. 2.6 + 2.7 (hesap güvenliği + günlük) — dönem geçişinden önce, çünkü eski hesapları devre dışı bırakmak bunlara dayanır.
3. 2.4 + 3.1 + 3.2 (taslak/yayın + dönem sihirbazı) — yeni ekip geldiğinde hazır olsun.
4. 2.1–2.3, 2.5 (ortak bileşenler ve tablo) — modül modül, her biri ayrı PR.
5. 3.3–3.4 (mesaj kutusu v2 + saklama).
6. Aşama 4'ten yalnız ihtiyaç doğdukça.

### Riskler ve dikkat

- Sunucu `sql.js` ile her yazmada tüm dosyayı yazıyor (`server/db.js:24-27`): toplu içe aktarma (dönem sihirbazı) **tek işlemde** yazılmalı (`db.js:63` işlem desteği var), kayıt başına istek atılmamalı.
- Yetki sıkılaştırması gönüllülerin alışkanlığını bozar: önce günlükle izle, sonra uygula; duyuru metni hazırla.
- Public site API'lerinin (ekip alanları, durum filtresi) değişimi site bileşenlerini etkiler: her sunucu değişikliğinde `src/` tarafında kullanım taraması gerekir.
- Mobil için gerçek cihaz testi yapılmadı (yalnız 390 px emülasyon, yatay taşma yok: `scrollWidth 390`); alt sekme çubuğu ve sürükle-bırak için dokunmatik test şart.
- Bu inceleme yalnız demo modu + kaynak kodu üzerindendir; canlı verilerle (kayıt sayıları, mesaj hacmi) performans ve sayfalama eşikleri doğrulanmalı.

---

## Ek: Kanıt dosyaları (özet)

| Konu | Dosya:satır |
|---|---|
| Menü tanımı | `src/admin/AdminApp.jsx:115-133` |
| Yetkisiz rota boş | `src/admin/AdminApp.jsx:329-330` |
| Modal/Confirm/Toast | `src/admin/AdminApp.jsx:26-112` |
| Mesaj sayısı iki kez indiriliyor | `AdminApp.jsx:171-173`, `AdminDashboard.jsx:18-27` |
| Ayarlarda içeride tanımlı bileşenler | `src/admin/AdminSettings.jsx:32,44` |
| Şifre kuralı uyuşmazlığı | `src/admin/AdminUsers.jsx:111` ↔ `server/routes/auth.js:130` |
| Token 24 sa, DB kontrolsüz | `server/auth.js:12-35` |
| Bellek içi çıkış listesi | `server/auth.js:9`, `server/routes/auth.js:100-111` |
| Mesajlar herkese açık (girişli) | `server/routes/messages.js:28-33` |
| Halka açık ekip API'si tüm alanlar | `server/routes/team.js:8-18` |
| Sıralama N yazma | `src/admin/ReorderControls.jsx:12-34`, `server/db.js:24-27,63` |
| Etkinlik silme = her girişli | `server/routes/events.js:72` (`requireDirektor`) |
| UGZ public'te kapalı | `src/App.jsx:100` |
