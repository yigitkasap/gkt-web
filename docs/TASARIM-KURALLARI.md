# gkt-web Tasarım Kuralları

Kapsam: akdenizgkt.com herkese açık tarafı (`src/App.jsx`, `src/ClubCardPage.jsx`, `src/BlogDetailPage.jsx`, `src/illustrations.jsx`, `index.html`). Yönetim paneli (`src/admin/*`) kapsam dışıdır.

Bu belge uydurma değil, koddaki gerçek kullanımdan çıkarılmıştır (23 Kasım 2026, dal `gece-isi-2026-11-23`). Her bölümde "Koddaki baskın değer" sayıları `grep` ile sayılmıştır (App + ClubCard + BlogDetail toplamı). Baskın değer erişilebilirlik testini geçmiyorsa kural **o değeri değil, en yakın geçen değeri** esas alır ve bu açıkça belirtilir (işaret: **[AA düzeltmesi]**). İhlal listesi için bkz. `docs/TASARIM-IHLALLERI.md`.

Yığın: React 18, Vite, Tailwind 3.4 (`tailwind.config.js` boş, tema genişletmesi yok), lucide-react. Başlık fontu `font-display` sınıfı ve gövde fontu `App.jsx` içindeki `GlobalStyles` ve kök `div` satır içi stiliyle tanımlanıyor; tasarım belirteçleri (token) koda yazılı değil, yalnızca Tailwind sınıfı olarak yaşıyor.

---

## 1. Renk

### 1.1 Marka kırmızısı

| Rol | Koddaki baskın değer | Kural |
|---|---|---|
| Marka rengi (tarayıcı, seçim) | `theme-color #DC2626` = `red-600`; `::selection rgba(220,38,38,.15)` | **`red-600` marka rengidir.** |
| Dolu birincil yüzey (buton, rozet, aktif sekme) | `bg-red-500` 17 kez, `bg-red-600` 9 kez; hover `red-600` | **[AA düzeltmesi]** Beyaz yazılı dolgu = `bg-red-600 hover:bg-red-700`. Beyaz / `red-500` oranı 3,76:1 (AA 4,5 ister), beyaz / `red-600` 4,83:1 geçer. |
| Açık zeminde kırmızı metin / link | `text-red-500` 32, `text-red-600` 17 | **[AA düzeltmesi]** `text-red-600` (beyazda 4,83:1). `text-red-500` yalnızca 24 px+ ya da simge (3:1 yeter). |
| Kırmızı yumuşak zemin | `bg-red-50` 14, `bg-red-100` 7 | Hafif vurgu `red-50`, rozet `red-100`. Üzerinde metin `red-700` (red-100 üstünde 5,9:1). |
| Kırmızı kenarlık | `border-red-200` 25 (hover ve ikincil buton) | Hover kenarlığı `border-red-200`. Dolu çerçeve `border-red-600`. |
| Koyu zeminde kırmızı vurgu | `text-red-400` 13 (başlıkta `from-red-400 to-rose-400`) | Yalnızca koyu zeminde (slate-900/950) ve 18 px+ ya da simge olarak. |
| Kırmızı CTA bandı | `from-red-500 via-red-600 to-red-700` | Koru; üzerindeki beyaz metin tam beyaz (`text-white`) olacak. |

Yap: `bg-red-600 hover:bg-red-700 text-white`, `text-red-600 hover:text-red-700`.
Yapma: `bg-red-500 ... text-white` (14–16 px yazı), `text-red-500` ile 10–12 px yazı, aynı bileşende `red-500` ve `red-600` karıştırmak.

### 1.2 Nötrler

| Rol | Koddaki baskın | Kural |
|---|---|---|
| Başlık metni | `text-slate-900` 41 | `text-slate-900` |
| Gövde metni | `slate-500` 14, `slate-600` 12, `slate-700` 11 | Paragraf `text-slate-600` (yoğun metin) ya da `text-slate-500` (kart özeti). 4,5:1 alt sınırı: `slate-500` beyazda 4,76:1. |
| Yardımcı/ikincil metin | `text-slate-400` 42 kez (beyazda 2,56:1) | **[AA düzeltmesi]** Alt sınır `text-slate-500`. `slate-400` yalnızca metin olmayan ikon ve devre dışı gösterimlerde. |
| Yer tutucu (placeholder) | `slate-300` (1,48:1) | `placeholder:text-slate-400` + etiket mutlaka görünür (WCAG yer tutucuyu şart koşmaz ama etiket zorunlu). |
| Sayfa zemini | `bg-white` / `bg-slate-50` (20) | Ritim için sadece bu ikisi. |
| Kenarlık | `border-gray-100` 35, `gray-200` 15 | Kart `border-gray-100`, form alanı `border-gray-200`. `bg-gray-*` kullanma (8 kez var, `slate-*` olmalı). |
| Koyu zemin | `from-slate-950 via-slate-900 to-slate-800`, footer `bg-slate-900` | Sayfa başlığı, hero, 404 = bu degrade. Footer/çerez = `bg-slate-900`. |

### 1.3 Koyu zeminde yarı saydam beyaz (white/xx)

Koddaki 12 farklı `text-white/…` değeri var (5, 15, 20, 30, 35, 40, 45, 50, 60, 70, 75, 80). Kural: **dört kademe**, `bg-slate-900` üzerinde hesaplanmış oranlarla.

| Kademe | Sınıf | Oran (slate-900) | Kullanım |
|---|---|---|---|
| Birincil | `text-white` | 17,8:1 | Başlık, vurgu |
| İkincil | `text-white/80` | ~10:1 | Paragraf |
| Üçüncül | `text-white/60` | ~6,7:1 | Alt bilgi, footer link, form yardımı |
| Sınır | `text-white/50` | ~5,2:1 | En düşük izinli (footer telif, ikon) |

`white/45` ve altı (4,46; 3,72; 3,21; 1,87; 1,56) AA'yı geçmez, **kullanılmaz**. Dekor (örn. 404 devasa rakamı `white/5`) metin sayılmaz ama `aria-hidden` olmalı.
Kırmızı zeminde (CTA bandı) `white/60-70` yetmez (~2,5–3:1); orada `text-white` ya da `text-white/90` kullan.

Yap: `text-white/60 hover:text-white` (footer linki). Yapma: `text-white/35`, `text-white/20`, `text-white/15` (footer 1840–1883 satırları).

### 1.4 Anlam renkleri

Başarı `emerald-500/200/50` (form gönderildi), bilgi notu `amber-50/200/600/900` (ClubCard), LinkedIn hover `blue-600`. Tarihçe illüstrasyonlarındaki amber/emerald/blue/violet yalnızca dekor ve `aria-hidden`. Başka renk ekleme.

---

## 2. Tipografi

| Rol | Font | Koddaki gerçek kullanım |
|---|---|---|
| Başlık, buton, rozet, etiket | Plus Jakarta Sans (`font-display`, ağırlık 500–800) | `font-bold` 52, `font-semibold` 44, `font-extrabold` 20 |
| Gövde | DM Sans (kök `div` satır içi `fontFamily`) | 400/500 |
| Sayı/yıl | JetBrains Mono (`font-mono`) | Yalnızca tarihçe yılları |

Not: `font-display`, `font-mono` ve gövde fontu `tailwind.config.js` içinde değil, `GlobalStyles` ve satır içi stilde. Hedef: `theme.extend.fontFamily` + `index.css` `@layer base`.

### Ölçek (koddaki baskın → kural)

| Rol | Sınıf | Not |
|---|---|---|
| Hero H1 | `clamp(2.2rem,5vw,3.5rem) font-extrabold leading-[1.08] tracking-tight` | Yalnızca ana sayfa |
| Sayfa H1 (PageHeader) | `text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight` | Tek H1/sayfa |
| Bölüm H2 (SectionTitle) | `text-2xl md:text-3xl font-extrabold leading-tight` | |
| Alt başlık / panel H2 | `text-xl font-bold` | |
| Kart başlığı H3 | `text-sm` (liste kartı) / `text-base` (öne çıkan) `font-bold` | Aynı kart her yerde aynı boyut |
| Lead | `text-base md:text-lg leading-relaxed` | |
| Gövde | `text-sm leading-relaxed` | |
| Yardımcı | `text-xs` | **Alt sınır 12 px.** |

**Alt sınır 12 px (`text-xs`).** Koddaki `text-[10px]` 25, `text-[11px]` 10, `text-[9px]` 3 kez kullanılıyor (38 yer); bunlar kural dışıdır. Rozet 12 px `font-semibold`, tarih 12 px.
Yap: `<span class="text-xs text-slate-500">16 Mart 2026</span>`. Yapma: `text-[10px] text-slate-400`.

Başlık sırası atlanmaz (H1 → H2 → H3). Footer sütun başlıkları ve "geçmiş etkinlik" öğeleri `h4` kullanıyor, atlama var; footer için `h2 sr-only` + `h3`, ya da `p` olmalı.

---

## 3. Boşluk ve kapsayıcı

- **Kapsayıcı:** `max-w-7xl mx-auto px-6 sm:px-10 lg:px-16` (28 kez, tutarlı). Dar içerik: yasal sayfa `max-w-4xl` aynı `px-*` ile. Blog yazısı `max-w-[900px] px-6` (tek istisna, bkz. ihlaller).
- **Bölüm dikey boşluğu (baskın):** `py-20 md:py-28` (19+12 kez). Ana sayfa yoğun bölümleri `py-16 md:py-24`; kompakt bölümler `py-14 md:py-20`. Kural: **üç kademe**; sayfa içinde aynı seviyedeki bölümler aynı kademeyi kullanır.
  - Standart: `py-20 md:py-28`
  - Kompakt (SSS, sponsor, CTA öncesi): `py-14 md:py-20`
  - Hero/sayfa başlığı: `py-20 md:py-28`
  - Hiçbir bölüm `md:` kademesiz (`py-16` tek başına) olmaz.
- **SectionTitle altı:** `mb-10 md:mb-14`.
- **Izgara boşluğu:** kart ızgaraları `gap-5` (baskın), küçük kartlar `gap-4`, panel çiftleri `gap-6`.
- **Kart iç boşluğu:** liste kartı `p-5`, küçük kart `p-4`, panel `p-6 md:p-8`.

## 4. Köşe yarıçapları

`rounded-2xl` 46 (kart, panel, görsel kutu), `rounded-xl` 38 (buton, input, ikon karosu), `rounded-full` 38 (rozet, avatar, nokta), `rounded-lg` 14 (küçük ikon butonu), `rounded-3xl` 3 (hero paneli, ClubCard CTA).
Kural: kart = 2xl, buton/alan = xl, rozet = full, küçük ikon butonu = lg. Tek `rounded` (6) yalnızca iskelet çubuğu.

## 5. Gölge

| Rol | Sınıf |
|---|---|
| Birincil buton | `shadow-lg shadow-red-500/25` (hero: `shadow-xl`) |
| Kart hover | `hover:shadow-xl hover:shadow-red-500/5` (baskın) |
| İstatistik kartı | `shadow-lg shadow-slate-900/5` |
| Yapışkan header | `shadow-sm` |
| Modal, çerez | `shadow-2xl` |

Yap: kart hover'ında tek tarif (`shadow-xl shadow-red-500/5`). Yapma: aynı rolde `shadow-md`, `shadow-lg`, `shadow-xl` karışımı.

## 6. Butonlar

Dokunma hedefi en az 44×44 px (bkz. 13).

| Tür | Tarif |
|---|---|
| Birincil | `inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.97]` |
| İkincil (açık zemin) | `min-h-[44px] px-6 py-2.5 border-2 border-red-200 hover:bg-red-50 text-red-600 text-sm font-display font-semibold rounded-xl` |
| Hayalet (koyu zemin) | `min-h-[44px] px-6 py-3.5 text-white/60 hover:text-white hover:bg-white/5 font-display font-semibold rounded-xl` |
| Kırmızı bantta | `bg-white text-red-600 hover:bg-red-50 font-display font-bold rounded-xl` |
| Ölçüler | küçük `px-4 py-2.5 text-sm`, orta `px-7 py-3.5`, büyük `px-8 py-4 text-base` |

Sayfa değiştiren her şey `<Link>` olur (sağ tık, yeni sekme, tarayıcı bağlantı listesi, arama motoru). `onClick={() => navigate()}` ile `<button>` yalnızca gerçekten eylem olanlarda.

## 7. Rozet / badge

| Tür | Tarif |
|---|---|
| Bölüm etiketi (SectionTitle) | `inline-flex gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-display font-bold uppercase tracking-wider` + 6 px kırmızı nokta |
| Kategori (kart) | `px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-display font-bold` |
| Görsel üstü | `px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-display font-bold` (beyaz/25 zemin üzerinde beyaz yazı 2,8:1 verir) |
| Yüzde (ClubCard) | `bg-red-600 text-white text-xs font-display font-extrabold` |

## 8. Kartlar

Ortak kabuk (koddaki 8 kopya): `bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all`.
- Görselli kart: üstte `aspect-[16/10]` (blog) ya da `h-44` (etkinlik/aktivite), altta `p-5`.
- Başlık `font-display font-bold text-slate-900`, özet `text-xs`→`text-sm text-slate-500 line-clamp-2`, alt satır meta (`text-xs text-slate-500`).
- Panel (vizyon/misyon): `p-8 rounded-2xl border border-gray-100 bg-slate-50`.
- İstatistik: beyaz kart, `shadow-lg shadow-slate-900/5`, `p-5 md:p-7 text-center`.
- Tıklanabilir kartın tamamı `<Link>`/`<button>` olur (div+onClick değil), içinde başka etkileşim yoksa.

## 9. Bölüm başlığı (SectionTitle) ve sayfa başlığı (PageHeader)

- **SectionTitle:** `badge` + `h2` + isteğe bağlı `desc`; `align="center"` varsayılan, liste sayfalarında `align="left"`. Tüm sayfalar bunu kullanır; elle yazılmış rozet+h2 yok (ClubCardPage'de var, ihlal).
- **PageHeader:** koyu degrade + `bg-grid`, ikonlu rozet (`bg-white/10 text-white/80`), H1, açıklama (`text-white/80`), altta 64 px beyaza geçiş (`from-white to-transparent`). Her iç sayfa tek PageHeader ile başlar.
- Yasal sayfa ve 404 de aynı H1 ölçeğini ve `font-extrabold` ağırlığı kullanır.

## 10. Koyu / açık bölüm ritmi

Sıra: koyu hero/PageHeader → beyaz → `slate-50` (+`bg-dots`) → beyaz → … → kırmızı CTA → koyu footer. Kural:
1. Üst üste iki aynı zemin gelmez; gerekirse `border-t border-gray-100` yerine zemini değiştir.
2. Koyu bölüm yalnızca sayfa başı, kırmızı CTA ve footer.
3. Koyu→açık geçişi 64–112 px `from-white to-transparent` degradesiyle.

## 11. İkonlar

lucide-react, çizgi stili. Boyut: satır içi `w-3.5/4`, buton içi `w-4`, karo içi `w-5/6`, boş durum `w-10–12`. Renk: karo içi `text-red-500/600` (açık zemin), `text-white` (degrade karo). Dekoratif ikon `aria-hidden="true"`, ikon tek başına etiket taşıyorsa `aria-label` düğmede/linkte. Sosyal ikonlar (X, TikTok) elle SVG; tek bir `SocialLinks` bileşeninde toplanır.

## 12. Görseller

- Oranlar: blog `aspect-[16/10]`, ekip `aspect-square`, çekiliş `aspect-[4/5]`, etkinlik/aktivite kartı `h-44`, geniş sahne `h-64 md:h-72`, sponsor logosu `h-16 object-contain`.
- `loading="lazy"` kıvrımın altındaki her görselde; ilk ekrandaki (hero, blog kapağı) görselde **yok**. Harita iframe'i `loading="lazy"`.
- `width`/`height` ver (CLS). ClubCard kartı örnek: `width="1400" height="882"`.
- Alt metni: bilgi taşıyan görsel için açıklayıcı ("X logosu"), aynı bağlantıdaki başlığı tekrarlayan görsel için `alt=""`, dekor için `alt=""` + `aria-hidden`.
- Görsel üstü yazı için `from-black/60 via-black/20 to-transparent` degrade.

## 13. Animasyon ve `prefers-reduced-motion`

Sınıflar (`GlobalStyles`): `anim-fade` (0,5 s yukarı çıkış), `anim-scale`, `anim-slide`, `anim-slide-up`, `anim-float`, `anim-pulse`. Kademeli gecikme `i * 60–100 ms`. Süre 200–500 ms, ease-out.
Kural: **her** hareket, `@media (prefers-reduced-motion: reduce)` bloğunda kapatılır. Bloğa girmeyenler: `anim-slide-up`, `animate-spin`, `group-hover:scale-*` dönüşümleri, `scrollTo({behavior:'smooth'})` (bkz. ihlaller). Animasyon başlangıç durumu CSS'te `opacity:0` + `animation-fill-mode: both` olmalı ki gecikmeli öğe önce görünüp sonra kaybolmasın.

## 14. Erişilebilirlik

- **Kontrast:** normal metin ≥ 4,5:1; 24 px+ (ya da 18,66 px kalın) ≥ 3:1; ikon ve kenarlık ≥ 3:1. Bölüm 1 değerleri bu eşiğe göre seçildi.
- **Odak:** her etkileşimli öğede görünür halka: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2` (koyu zeminde `ring-offset-slate-900` / `ring-white`). Form alanında `focus:ring-red-500/20` tek başına yetmez: kenarlık `focus:border-red-600` + `focus:ring-2 focus:ring-red-600/30`.
- **Dokunma hedefi:** ≥ 44×44 px (`min-h-[44px] min-w-[44px]`); küçük görünüm için dolgu kullan, simge boyutunu küçük bırak.
- **ARIA:** ikon-only düğme/link `aria-label`; açılır menü/akordeon `aria-expanded` + `aria-controls`; sekme çubuğu `role="tablist"`/`tab`/`aria-selected` ya da `aria-pressed` (ClubCard filtresi doğru); modal `role="dialog" aria-modal="true" aria-labelledby`, Esc ile kapanır, odak tuzağı; hata iletisi `role="alert"` + alanda `aria-describedby`/`aria-invalid`.
- **Link ayrımı:** metin içi link yalnızca renkle ayrılmaz; alt çizgi veya ≥ 3:1 renk farkı + `font-semibold`.
- Her `input`/`textarea` `<label htmlFor>` ile bağlı.
- Sayfa başına tek `h1`, `main` landmark'ı var.

## 15. Duyarlı kırılımlar

Tailwind varsayılanları: `sm 640`, `md 768`, `lg 1024`. Mobil önce. Baskın kalıplar: ızgara `sm:grid-cols-2 lg:grid-cols-3|4`; `md:grid-cols-3` (etkinlik); iki sütun `lg:grid-cols-2`; kapsayıcı dolgusu `px-6 sm:px-10 lg:px-16`; menü `md:` altında çekmece; footer `sm:grid-cols-2 lg:grid-cols-5`. Test genişlikleri: 390, 768, 1440. Yatay taşma sıfır olmalı (şu an doğrulandı: 9 sayfada 390/1440 genişliğinde taşma yok).

## 16. Türkçe metin tonu ve yazım

- Hitap: pazarlama ve arayüz metinlerinde **"sen"** ("Sen de GKT'li Ol", "Takvimini şimdiden ayarla"). Yasal metinlerde "siz". Form etiketleri ve yer tutucularda da "sen" (koddaki karışımı kaldır: "Adınız ve soyadınız" → "Adın ve soyadın").
- "yapay zeka" şapkasız (TDK "zekâ" yazsa da proje kuralı), "hikâye" ve "tarihî" gibi şapkalı sözcükler tek tek sabit seçilir; aynı sayfada hem "Hikaye" hem "tarihî" olmaz.
- Başlık büyük/küçük harf: bölüm başlıkları **Başlık Düzeni** (her sözcük büyük) ya da cümle düzeni; ikisi karışmaz. Koddaki baskın: ana sayfa ve iç sayfalar Başlık Düzeni, ClubCard cümle düzeni.
- Kısa, somut cümle; en çok bir ünlem; emoji arayüzde yok (footer ❤️ dışında).
- Sayılar: "3.000+", yüzde "%25" (ön ek), tarih "16 Mart 2026" (ham `2026-03-16` gösterme).
- Tırnak/kesme: "GKT'li", "GKT'nin". Düğme etiketi eylem fiili: "Mesaj Gönder", "Etkinlikleri Keşfet".
- Kaldırılan içerik: Ulusal Girişimcilik Zirvesi (UGZ) sayfa ve bölümleri kaldırıldı; metin, SSS, JSON-LD, footer ve `llms*.txt` içinde zirveye atıf bırakılmaz.
