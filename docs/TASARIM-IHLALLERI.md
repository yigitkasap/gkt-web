# gkt-web Tasarım İhlalleri

Kural kaynağı: `docs/TASARIM-KURALLARI.md`. İnceleme tarihi: 23 Kasım 2026, dal `gece-isi-2026-11-23`. Kapsam: herkese açık site; yönetim paneli dışarıda.

**Yöntem ve güvenilirlik.** Yerel üretim sunucusunda (`localhost:3099`) 9 sayfa (`/`, `/hakkimizda`, `/etkinlikler`, `/departmanlar`, `/blog`, `/iletisim`, `/clubcard`, `/gizlilik`, 404) 1440 ve 390 px genişlikte Playwright ile açıldı. Her sayfada betikle ölçülenler: yatay taşma, 44 px altı etkileşimli öğeler, `alt` eksikliği, metin/zemin kontrast oranı (WCAG formülü, yarı saydamlık ve opaklık birleştirilerek). Her maddede kanıt türü belirtilir: **[ölçüm]** tarayıcıda ölçüldü, **[ekran]** ekran görüntüsünde görüldü, **[kod]** yalnızca kod okumasıyla çıkarıldı, **[hesap]** elle hesaplandı, **[doğrulanmadı]** denenmedi.

Notlar:
- Betik, degrade/görsel üstündeki metinde zemini yanlış bulabildi; bu yüzden aşağıdaki "oran" değerlerinden degrade ya da fotoğraf üstündekiler elle hesaplandı ya da "doğrulanmadı" işaretlendi. Kapalı SSS yanıtlarındaki "1:1" çıktıları yanlış pozitiftir (kapalıyken `opacity-0`), listeye alınmadı.
- Ekip bölümü bu gece başka bir çalışmada değişiyor (`TeamRoster`, `RosterSoon`); satır numaraları çalışma ağacındaki `App.jsx` (1888 satır) içindir ve o dosya değiştikçe kayar. Ekip içeriği değil yerleşim ve bileşen tasarımı değerlendirildi.
- Testte sunucu bir kez bağlantıyı reddetti, ölçüm yeniden alındı (sonuçlar ikinci koşudan).
- Yatay taşma: 9 sayfanın hiçbirinde 390 ya da 1440 px'de yok **[ölçüm]**. `alt` eksikliği: hiçbir `<img>` `alt`siz değil **[ölçüm]** (ama bkz. G1 gereksiz tekrar).

## Özet tablo

| ID | Madde | Önem | Efor | Kanıt |
|---|---|---|---|---|
| R1 | Beyaz yazılı `bg-red-500` butonlar 3,76:1 | Yüksek | S | ölçüm |
| R2 | Kırmızı-500 metin/link ve kırmızı-600 on red-100 küçük rozetler (3,4–3,95:1) | Yüksek | S | ölçüm |
| R3 | `text-slate-400/300` küçük yazı (2,56:1; yer tutucu 1,48:1) | Yüksek | M | ölçüm |
| R4 | Footer `white/35`, `white/20`, `white/15` | Yüksek | S | ölçüm |
| R5 | Kırmızı CTA bandında `white/30–70` metin ve ikonlar | Yüksek | S | hesap |
| R6 | Koyu zeminde `white/40–45` paragraflar (hero, PageHeader, 404) | Orta | S | ölçüm |
| T1 | Dokunma hedefi < 44 px (footer, sosyal, menü, ekip ikonları, ClubCard) | Yüksek | M | ölçüm |
| F1 | Hiçbir yerde `focus-visible` yok; form/arama odak halkası zayıf | Yüksek | M | kod |
| A1 | Etkinlik modalı: dialog değil, Esc yok, kart `div onClick` klavyeyle açılmaz | Yüksek | M | kod |
| A2 | Mobil menü, SSS, sekmeler, "Konu" seçici: `aria-*` yok | Orta | M | kod |
| A3 | Form: etiket-alan bağı eksik, hata mesajı ilişkisiz ve 10 px | Orta | S | kod |
| A4 | İkon-only linklerde `aria-label` yok (ekip, blog paylaş) | Orta | S | ölçüm |
| A5 | Metin içi link yalnızca renkle ayrılıyor / çelişkili sınıf | Orta | S | kod |
| A6 | Navigasyon `button` ile yapılıyor (footer, CTA'lar) | Orta | M | kod |
| Y1 | Zirve (UGZ) kalıntıları: SSS, JSON-LD, footer, metinler, `llms*.txt`, 31 MB video | Yüksek | S–M | kod, ekran |
| Y2 | Ekip bölümü yerleşim sağlamlığı (dizin sabit, iç içe bileşen, 11 px) | Orta | M | kod, ekran |
| C1 | Renk tonu karışımı: red-500/600, gray/slate, 12 farklı white/xx | Orta | M | kod |
| C2 | Yazı boyutu 9–11 px (38 yer) | Orta | M | kod |
| S1 | Tutarsız bölüm dikey boşlukları | Düşük | S | kod |
| S2 | Aynı rolde farklı buton ölçüleri | Düşük | S | kod |
| S3 | Rozet 5 farklı biçimde | Düşük | S | kod |
| S4 | Kart hover gölgesi/başlık boyutu kayması (ana sayfa vs Etkinlikler) | Düşük | S | kod |
| B1 | Tekrar eden ama bileşenleştirilmemiş kalıplar | Orta | L | kod |
| B2 | Render içinde tanımlanan bileşenler (`TeamCard`, `MilestoneCard`) | Orta | M | kod |
| N1 | Hareket: `prefers-reduced-motion` kapsamı eksik; gecikmeli animasyonda başlangıç parlaması | Orta | S | kod |
| G1 | Görsel: `alt` tekrarı, `width/height` yok, LCP görseli `lazy`, harita `eager` | Düşük | S | kod |
| M1 | Mobilde 9–10 px tarihçe metni, kaydırma ipucu yok, sekme etiketi kesiliyor | Orta | S | kod, ekran |
| D1 | Blog yazısı sayfasının kendi tipografisi (`fontFamily` satır içi, `px-6`, 900 px) | Düşük | S | kod |
| D2 | ClubCard: rozet+H2 elle kopya, arama alanı düşük kontrast, "Harita" linki 17 px | Orta | S | ölçüm |
| D3 | Dil: sen/siz karışık, başlık düzeni, hikâye/Hikaye, sabit tarihler | Düşük | S | kod |
| D4 | Çalışmayan/anlamsız sınıflar ve çakışmalar | Düşük | S | kod |

Efor: S = 30 dk altı, M = 1–3 saat, L = yarım gün ve üzeri.

---

## Yüksek önem

### R1. Beyaz yazılı `bg-red-500` butonlar AA'yı geçmiyor (3,76:1) — Yüksek, S
Yerler (`src/App.jsx`): 171–172 (navbar "Bize Ulaşın", 14 px), 234 (çerez "Kabul Et", 12 px), 347 (hero "Etkinlikleri Keşfet", 16 px), 885 (CTA "Sen de GKT'li Ol"), 1063 (aktif departman sekmesi), 1380 (form "Mesaj Gönder", 16 px), 1793 (404 düğmesi), 172 mobil menü düğmesi; `src/ClubCardPage.jsx`: 19 (`%25` rozeti, 12 px), 142 (aktif filtre). Ölçüm: "Bize Ulaşın" 3,76:1, "Mesaj Gönder" 3,76:1, "% 25" 3,76:1 **[ölçüm]**. 244'teki çıkış oku ikon olduğu için 3:1 geçer.
Neden önemli: 14–16 px yarı kalın yazı "büyük metin" değildir, AA 4,5:1 ister. Düşük görme ve güneş altında telefon kullanımında okunmaz. Marka kırmızısı zaten `red-600` (`theme-color`).
Düzeltme (ortak sınıf):
```jsx
// önce
className="... bg-red-500 hover:bg-red-600 text-white ..."
// sonra (beyaz / red-600 = 4,83:1)
className="... bg-red-600 hover:bg-red-700 text-white ..."
```
Gölge `shadow-red-500/25` kalabilir. `bg-red-500` kalan yerler: etkin sekme/filtre (`bg-red-600 border-red-600`).

### R2. Kırmızı metin ve küçük rozetler — Yüksek, S
- `text-red-500` küçük metin (3,76:1): 510 ve 1215 "Devamını Oku →" (12 px), 482 ve 516 ikincil buton metni (3,6:1, `slate-50` üstünde), 45 "@akdenizgkt" bağlantısı, 1378 "Gizlilik Politikası" (10 px), `text-sm font-bold text-red-500` e-posta (`Bize Ulaşın` sayfası, 3,76:1) **[ölçüm]**.
- `bg-red-100 text-red-600` rozetleri (3,95:1): 505, 1186, 1210 (10 px) **[ölçüm]**. `SectionTitle` rozeti zaten doğru (`red-700`, 1420).
- Bölüm departman rozeti `bg-red-50 text-red-500 text-[9px]` (1122): 3,44:1 ve 9 px **[ölçüm]**.
- `text-[10px] text-red-500` form hata iletileri (1346, 1351, 1355, 1372, 1377).
Düzeltme: açık zeminde `text-red-600` (4,83:1), rozet `text-red-700 text-xs`; ikincil buton `text-red-600`; hata iletisi `text-red-600 text-xs`.

### R3. `text-slate-400` / `slate-300` küçük yazı (2,56:1) — Yüksek, M
Kodda `text-slate-400` 42, `text-slate-300` 9 kez. Beyaz zeminde `slate-400` = 2,56:1, `slate-50` zeminde 2,45:1, `slate-300` = 1,48:1 / 1,42:1 **[ölçüm]**. Ölçülen örnekler: SectionTitle açıklaması (1425; tüm sayfalarda, 14 px), istatistik etiketleri (382, 12 px), aktivite kartı özeti (416), etkinlik/blog özetleri ve tarihleri (472–473, 506–509, 12/10 px), sponsor adı (531, 11 px), "Yaklaşan etkinlik yok" yardım metni (45), vizyon sayfasında ekip rol metni (11 px), `Departman` etiketi, "Görev Alanları" başlığı (1088, `slate-300` = **1,42:1**), iletişim adres/telefon etiketi, "Son güncelleme" (1473), sayfa içi tarih "2026-04-15" biçimi, yer tutucular ("Konu seçiniz" 1,48:1) **[ölçüm]**. 
Neden önemli: sitenin en çok kullanılan ikincil metni okunmuyor; AA başarısızlığının tek büyük kaynağı bu.
Düzeltme: arama-değiştir ile mekanik:
```
text-slate-400  → text-slate-500   (metin)   ; 12 px ve altında text-slate-600
text-slate-300  → text-slate-400   (yalnızca ikon), yer tutucu: placeholder:text-slate-400
```
`slate-500` beyazda 4,76:1, `slate-50` üstünde 4,45:1 (sınırda); `slate-50` üstündeki 12 px metinde `slate-600` kullan. Ek: ham tarih `2026-03-16` gösteriliyor (`ev.date`, `p.date`): biçimlendir (D3).

### R4. Footer'da `white/35`, `white/20`, `white/15` — Yüksek, S
`src/App.jsx` 1816, 1839, 1849, 1864, 1873, 1874 (`text-white/35`, 3,21:1), 1882 (`© 2026`, `white/20`, **1,87:1**), 1883 ("Medya & IT Departmanı…", `white/15`, **1,56:1**), 1826 sosyal ikonlar `white/40` (3,7:1, ikon 3:1 geçer ama hover dışında soluk) **[ölçüm]**. Yasal bağlantılar (Gizlilik, KVKK) bu rengi kullanıyor; yasal metne erişim en az kontrastlı yerde.
Düzeltme: linkler/metin `text-white/60 hover:text-white`, telif `text-white/50`, başlıklar `text-white/80`. Satır yüksekliği için bkz. T1.

### R5. Kırmızı CTA bandında düşük kontrast — Yüksek, S (hesaplandı, yazı tarayıcı ölçümünde degradeyi göremediği için)
`App.jsx` 561 (`text-white/60`, red-600 üstünde ~2,5:1), 566 ("Daha Fazla Bilgi" `text-white/70` + `border-white/20`, ~3,0:1), 580 (sosyal ikonlar `text-white/50` + `bg-white/10`, ~2,2:1, ikon eşiği 3:1), 584 (`text-white/30` ~1,5:1 ve `text-white/50` bağlantı) **[hesap]**.
Düzeltme: `text-white/90`, ikonlar `text-white`, e-posta `text-white underline`, ikincil buton `border-white/60 text-white`.

### R6. Koyu zeminde `white/40–45` açıklamalar — Orta, S
343 hero açıklaması `white/45` = 4,46:1 (4,5 eşiğinin hemen altı); 1407 PageHeader `white/40` = 3,72:1 (tüm iç sayfalar); 1789'da 404 açıklaması `white/40`; ClubCard hero 82 `white/45` (4,46:1) ve istatistik etiketleri `white/40` (10–11 px, 3,82:1) **[ölçüm]**. Düzeltme: `text-white/70` (≥ 7:1).

### T1. Dokunma hedefi 44 px altında — Yüksek, M
Mobil 390 px **[ölçüm]**:
| Öğe | Boyut | Yer |
|---|---|---|
| Menü düğmesi | 40×40 | 174 (`w-10 h-10`) |
| Logo bağlantısı | 190×36 | 150 çevresi |
| Footer link düğmeleri (14 adet) | 23–112 × **16** | 1839, 1849, 1864 (`h-4`) |
| Footer logo düğmesi | 137×32 | 1801 |
| Footer sosyal ikonlar | 32×32 | 1826 (`w-8 h-8`) |
| CTA sosyal ikonlar | 36×36 | 579 (`w-9 h-9`) |
| Ekip kartı posta/LinkedIn ikonları | 32×32 | 607, 610, 613 ve 1126, 1129 (`w-8 h-8`) |
| İçerik bağlantıları (@akdenizgkt, e-posta) | 88×18, 138×18 | 45, 584 |
| Departman sekmeleri | 167×40 | 1063 |
| Çerez "Reddet" | ~32 yüksekliğinde | 233 |
| Blog paylaş ikonları | 36×36 | BlogDetail 130, 133, 136 |
| ClubCard: Arka yüzü göster 149×32, filtre düğmeleri 40, arama 42, "Harita" **48×17** (18 kez) | | ClubCard 31, 108, 142, 132 |
Düzeltme: 
```jsx
// footer linki
<Link to={...} className="inline-flex items-center min-h-[44px] text-xs text-white/60 hover:text-white">
// ikon düğmesi
className="inline-flex items-center justify-center w-11 h-11 rounded-lg ..."   // 44 px
// menü düğmesi: w-10 h-10 -> w-11 h-11
```
Footer sütunlarında `gap-3` + 44 px yüksek link: listeyi daha uzun yapar; `gap-0` ve link yüksekliğiyle denge. Not: `min-h-[44px]` zaten yeni `RosterSoon` düğmesinde (673) kullanılıyor; aynı kalıbı yay.

### F1. Odak stili eksik — Yüksek, M
`focus-visible` sıfır kez geçiyor (4 dosyada **[kod]**). Linkler ve düğmeler tarayıcının varsayılan halkasına kalmış (klavye ile elle test edilmedi: **[doğrulanmadı]**; koyu zeminde varsayılan halka görünürlüğü düşer). Form alanlarında `focus:outline-none` + `focus:ring-red-500/20` (1361, 1376, 1456): `red-500` kenarlık beyazda 3,76:1 geçer ama halka %20 olduğu için seçilmez. ClubCard arama kutusu (133): `focus:border-red-300` (≈1,9:1) + `ring-red-100` **[hesap]** → odak neredeyse görünmez.
Düzeltme:
```jsx
// ortak: index.css
@layer base {
  :focus-visible { outline: 2px solid #DC2626; outline-offset: 2px; }
  .on-dark :focus-visible { outline-color: #fff; }
}
// form alanı
focus:border-red-600 focus:ring-2 focus:ring-red-600/30
// ClubCard arama
focus:border-red-600 focus:ring-2 focus:ring-red-600/30
```
Koyu zeminli bölümlerde (hero, PageHeader, footer, çerez) beyaz halka (`focus-visible:outline-white`).

### A1. Etkinlik modalı ve tıklanan kart — Yüksek, M
`App.jsx` 395: aktivite kartı `div onClick` + `cursor-pointer`; klavyeyle odaklanamaz, ekran okuyucuya düğme gibi görünmez. 426: modal `div`, `role="dialog"`, `aria-modal`, `aria-labelledby` yok; Esc ile kapanmıyor; odak tuzağı yok; kapatma düğmesi 36×36 (`w-9 h-9`); `loading="lazy"` modal görselinde. **[kod]**
Düzeltme: kartı `<button type="button" className="text-left ...">` yap; modal:
```jsx
<div role="dialog" aria-modal="true" aria-labelledby="aktivite-baslik" onKeyDown={e => e.key==='Escape' && close()}>
```
ve açılınca odağı kapat düğmesine taşı, kapanınca karta döndür.

### Y1. Zirve (UGZ) kalıntıları — Yüksek (içerik/SEO), S–M
Kaldırılan sayfaya giden ya da onu anlatan içerik hâlâ canlı **[kod]**:
- `App.jsx` 546 SSS: "Ulusal Girişimcilik Zirvesi nedir?" yanıtlı kart, 324 aynı metinle `FAQPage` JSON-LD (Google'a SSS olarak gidiyor).
- 1848 footer "Hızlı Erişim" listesinde "Girişimcilik Zirvesi" bağlantısı (`etkinlikler`e gidiyor).
- 391 "Zirvelerden kariyer günlerine…", 920 "Ulusal zirvelerden…", 916 ve meta açıklama "girişimcilik zirveleri", 543 SSS departman yanıtı "zirve, konferans planlama".
- `fallbackData.js` 47 ("18. Ulusal Girişimcilik Zirvesi" etkinliği), 59 ve tarihçe 86/89/90 (2012 İlk Ulusal Zirve, 2024 Rekor Katılım "17. Zirve", 2026 "18. Zirve hazırlıkları") ve `HakkimizdaPage` tarihçe sahneleri (748–770; bir sahne "2012 – İlk Ulusal Zirve" yorumuyla). Tarihçe geçmiş olduğu için kalabilir; ama 2026 "18. Zirve hazırlıkları" artık yanlış.
- `illustrations.jsx` 3–4 ("title-specific illustration for UGZ") ve 76 `case 'Zirve'`.
- `public/llms.txt` 16, 27 ve `public/llms-full.txt` 34–35, 46, 57, 60, 61: yapay zeka arama motorlarına zirveyi hâlâ anlatıyor.
- `public/assets/ugz-17-video.mp4` (31 MB) ve `public/assets/ugz/` (112 KB) dağıtım paketinde duruyor; `/ugz` yönlendirmesi var ama dosyalar boşuna yükleniyor.
Düzeltme: SSS maddesini ve JSON-LD karşılığını sil (324, 546), footer maddesini kaldır ya da "Kariyer Günleri"ne çevir, kopyaları "kariyer günleri, teknik geziler…" yap, `llms*.txt` güncelle, video ve klasörü sil (kullanım yoksa `grep` ile doğrula: **[doğrulanmadı]**, başka bir sayfa kullanıyor olabilir).

---

## Orta önem

### A2. Açılır/sekme bileşenlerinde ARIA yok — Orta, M
`aria-expanded` kodda sıfır kez. Yerler: mobil menü düğmesi (174, `aria-label` var ama `aria-expanded` yok; menü açıkken sayfa kaydırılıyor, Esc yok, odak tuzağı yok); SSS düğmeleri (1436, kapalı yanıt `opacity-0` ile gizleniyor ama ekran okuyucuya hâlâ açık: `grid-rows-[0fr]` içeriği erişilebilirlik ağacından çıkarmaz); departman sekmeleri (1063, `role="tab"`/`aria-selected` yok); "Konu" özel seçici (1361–1370: `aria-haspopup`, `aria-expanded`, `role="listbox"`, klavye okları yok; üstelik gizli `input` `required` olsa da doğrulama çalışmaz).
Düzeltme: SSS için `aria-expanded={open}` `aria-controls`, yanıt `hidden`/`inert`; sekme için `role="tablist"`/`tab` ya da en az `aria-pressed` (ClubCard'daki gibi); "Konu" için yerel `<select>` kullanmak en ucuz yoldur.

### A3. Form erişilebilirliği — Orta, S
`FormField` etiketi `htmlFor` ile bağlı (1456, iyi) ama "Konu" (1359) ve "Mesajınız" (1375) etiketlerinde `htmlFor` ve alanda `id` yok; `<textarea>` (1376) bağsız. Hata iletileri (1346–1377) `text-[10px]`, `aria-describedby`/`role="alert"` yok, alana `aria-invalid` yok; doğrulama `form.querySelector` ile `placeholder*="Adınız"` yer tutucusuna bağlı (1241 çevresi: yer tutucuyu değiştirirsen form bozulur). Gönderim hatası (ağ) için kullanıcıya hiçbir ileti yok (`postMessage` `false` dönerse sessiz).
Düzeltme: alanlara `id`, `aria-invalid`, `aria-describedby="hata-id"`; hata iletisi `text-xs text-red-600 role="alert"`; başarısızlıkta `setError('Gönderilemedi, tekrar dene')`.

### A4. İkon-only linklerde erişilebilir ad yok — Orta, S
Ekip kartı posta ve LinkedIn bağlantıları (607, 610, 613, 1126, 1129) yalnızca `title`; `hakkimizda-m` ölçümünde 18 adet "adsız" `<a>` 32×32 **[ölçüm]**. Blog yazısı paylaş bağlantıları (BlogDetail 130, 133, 136) `aria-label`siz. (CTA ve footer sosyal ikonlar `aria-label`li, doğru.)
Düzeltme: `aria-label={`${m.name} — e-posta`}`, `aria-label="X'te paylaş"`. İkonlar `aria-hidden`.

### A5. Metin içi linkler — Orta, S
584: `underline underline-offset-2 … no-underline` çelişkili sınıflar; sonuçta alt çizgisiz, renk `white/50` ve çevre metni `white/30`: link yalnızca renkle (ve çok düşük kontrastla) ayrılıyor. 45 (`@akdenizgkt`): çevre `slate-400`, link `red-500`, alt çizgi yok. 1378 `hover:underline` yalnızca hover'da. WCAG 1.4.1.
Düzeltme: `underline underline-offset-2 font-semibold` kalıcı; çelişkili `no-underline` sil.

### A6. Sayfa gezintisi `button` ile — Orta, M
Footer sayfa/yasal/hızlı erişim listeleri (1839–1864), hero ve CTA düğmeleri (230, 347, 350, 482, 516, 563, 566, 885, 1379) `navigate()` çağıran `<button>`. Sağ tık/yeni sekmede aç, Ctrl+tık çalışmaz; arama motoru footer bağlantılarını izleyemez; ekran okuyucu "düğme" der.
Düzeltme: `navigate(id)` yerine `<Link to={PATHS[id]}>`; stil aynı kalır (`no-underline`).

### Y2. Ekip bölümü yerleşim sağlamlığı — Orta, M
**[kod + ekran]** (içerik değil, yerleşim). Gece değişikliğinde `TeamRoster` (594) ve `RosterSoon` (656) ayrıldı; iyi: `RosterSoon` 2/4 sütunlu liste, `ul/li`, 44 px düğme. Kalan sorunlar:
- `TeamCard` bileşeni `TeamRoster` içinde tanımlı (595): her render'da yeni bileşen = remount, `anim-fade` yeniden oynar, görseller yanıp söner.
- Yönetim satırı dizine bağlı: `currentTeam.slice(0, 3)` ve `[yonetim[0], yonetim[2], yonetim[1]]` (620+). Kişi sayısı/sırası değişince başka kişi "başkan" konumuna düşer; yeni `.filter(Boolean)` çökmeyi önlüyor ama yerleşim sırası yine yanlış olabilir.
- Mobilde `flex-row-reverse` ile ikinci satır ters çevriliyor (629–634, `sm:hidden` ayrı kopya) → aynı üç kart DOM'da iki kez render edilir; masaüstü ve mobil için tek ızgara + `order-*` yeter.
- `RosterSoon`: rol etiketleri `text-sm`, "Yakında" rozeti `text-[11px]` (kural: ≥12 px), kutudaki `User` ikonu `text-slate-400` (dekor, `aria-hidden` doğru). 11 sütun listesi `md:grid-cols-4` → 4+4+... sonu tek kartla bitiyorsa yetim satır kalır (kart sayısı: `ROSTER_ROLES`, **[doğrulanmadı]** ekranda).
- Kart rol metni `text-[11px] text-slate-400` (2,56:1; ekip sayfasında 11 satır) → R3.
Düzeltme: `TeamCard`'ı dosya düzeyine al, ızgarayı veriyle sür (`role` alanına göre gruplandır), tek `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4`.

### C1. Ton karışıklığı — Orta, M
Kodda aynı rol için birden çok değer:
- Birincil: `bg-red-500` 17, `bg-red-600` 9 (hover `red-600`; marka `red-600`); metin `red-500` 32 / `red-600` 17; vurgu çizgisi `bg-red-500`, aktif link `text-red-600`.
- Nötr: kenarlık `border-gray-*` (55), metin/zemin `slate-*`; `bg-gray-100` 5 + `bg-gray-50` 3 ile `bg-slate-50` 20 yan yana.
- Yarı saydam beyaz: `text-white/…` 12 farklı değer (5, 15, 20, 30, 35, 40, 45, 50, 60, 70, 75, 80), `bg-white/…` 8 değer, `border-white/…` 5 değer.
- Kırmızı gölge: `shadow-red-500/5, /20, /25, /30, /40`, `shadow-red-600/20, /40`, `shadow-red-900/20`.
Düzeltme: `tailwind.config.js` içine belirteç ekle:
```js
theme: { extend: {
  colors: { brand: { DEFAULT: '#DC2626', dark: '#B91C1C', soft: '#FEE2E2' } },
  fontFamily: { display: ['Plus Jakarta Sans','system-ui','sans-serif'], sans: ['DM Sans','Segoe UI','system-ui','sans-serif'], mono: ['JetBrains Mono','monospace'] },
}}
```
sonra `bg-red-500` → `bg-brand`, `hover:bg-red-600` → `hover:bg-brand-dark`.

### C2. 9–11 px yazı — Orta, M
38 yer (`text-[10px]` 25, `[11px]` 10, `[9px]` 3). Mobil tarihçe kartında 9–10 px (837–838), dept rozeti 9 px (1122), rozet/tarih/hata iletisi 10 px (467, 505–506, 1346–1379, 1560, 1569), footer başlığı ve telif 10–11 px (1836–1883). Birçoğunun kontrastı da yetersiz (R2–R4). Düzeltme: tümünü `text-xs` (12 px) yap; satır taşarsa metni kısalt.

### N1. Hareket ve `prefers-reduced-motion` — Orta, S
`GlobalStyles` (62–90) yalnızca `.anim-fade, .anim-float, .anim-slide, .anim-scale, .anim-pulse` sınıflarını kapatıyor (78). Kapsam dışı **[kod]**: `.anim-slide-up` (çerez bandı 71, 226; 1 sn gecikmeli), `animate-spin` (97, 207, 209, 1519, BlogDetail 32), `group-hover:scale-105/110` ve `transition-transform` (aktivite, ekip, vizyon ikonu), FAQ `duration-500`, `scrollTo({behavior:'smooth'})` (242).
Başlangıç parlaması: `anim-fade` `animation: … forwards` ile `animation-delay: ${i*80}ms` kullanıyor, `fill-mode: backwards/both` yok → gecikme süresince öğe **tam görünür**, sonra `opacity:0`'dan başlar (60–100 ms × 12 kart = 1 sn'ye varan titreme). Çerez bandı 1 sn gecikmeyle aynı sorunu yaşar. Tarayıcıda gözlenmedi: **[doğrulanmadı]**.
Düzeltme:
```css
.anim-fade { animation: fadeUp .5s ease-out both; }  /* both = delay boyunca opacity:0 */
@media (prefers-reduced-motion: reduce) {
  .anim-slide-up, .animate-spin { animation: none !important; opacity: 1 !important; }
  .group:hover * { transform: none !important; }
  html { scroll-behavior: auto; }
}
```
`scrollTo` için `matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'`.

### M1. Mobil kırılma ve okunabilirlik — Orta, S
Taşma yok **[ölçüm]**; ama:
- Tarihçe mobil yatay kaydırma (854–856): kart `w-44` (176 px), metin `text-[10px] text-slate-400`, yıl `text-[9px]`; kaydırma ipucu/kenar gölgesi/`snap` yok, ekran görüntüsünde yalnızca ilk iki kart görünüyor (kalan kartlar yatay kaydırmanın içinde **[ekran]**). Ortak zaman çizgisini dikey yap ya da `snap-x` + oklu ipucu ekle.
- Departman sekmeleri mobilde 2×2, `text-xs`, `truncate` (1063): "Etkinlik ve Organizasyon" 167 px içinde kesilir **[kod, ekranda doğrulanmadı]**; `truncate` yerine iki satıra izin ver ya da kısa ad kullan (kod zaten "Etkinlik ve Org." haritası içeriyor, 1037 çevresi).
- Hero `min-h-[85vh]` (329): iOS adres çubuğunda atlama; `min-h-[85svh]`. **[doğrulanmadı]**
- Çerez bandı ile "yukarı çık" düğmesi (`z-[60]` ve `z-50`) aynı köşede çakışabilir; bandın üstüne çıkma **[doğrulanmadı]**.

### D2. ClubCard — Orta, S
- `Anlaşmalı işletmeler` rozeti ve H2 elle kopyalanmış (123–126), `SectionTitle` bileşeni kullanılmıyor (ve "Nasıl kullanılır?" bölümü 177–179 rozetsiz).
- Arama alanı odak halkası (133) ve yer tutucu/ikon `slate-300` (130, 133): 1,48:1 **[ölçüm]**, odak ≈1,9:1 **[hesap]**.
- "Harita" bağlantısı 48×17 px, 11 px, `slate-400` (31): 18 kopyada tekrar **[ölçüm]**.
- Adım numarası `text-slate-100` (187, 1,1:1) dekor; `aria-hidden` yok.
- Rozet `%25` beyaz/`red-500` (19) → R1.
- CTA (206–216) `rounded-3xl` + `from-red-600 to-rose-600`: ana CTA bandından (`red-500→700`) farklı degrade; ayrı kopya.
- "Arka yüzü göster" düğmesi (108) hem `showBack`'e bağlı `alt` metni güncelliyor (iyi) hem `aria-pressed`/canlı bölge yok; küçük (149×32).

### B1. Bileşenleştirilmemiş tekrarlar — Orta, L
Aynı kod bloğunun kopyaları **[kod]**:
| Kalıp | Kopya | Yer |
|---|---|---|
| Kart kabuğu `hover:border-red-200 hover:shadow-xl…` | 8 | 395, 459, 495, 596, 931, 1175, 1200, 1529 |
| Blog kartı | 3 (ana sayfa, Blog, öne çıkan) | 495–512, 1200–1217 |
| Etkinlik kartı | 2, **drift'li** (ana sayfa `text-base` + `flex-wrap`, Etkinlikler `text-sm`) | 459–478, 931–950 |
| Sosyal ikon dizisi + 2 elle SVG (X, TikTok) | 2 (+BlogDetail'de bir X SVG daha) | 572–577, 1819–1825, BlogDetail 131 |
| Birincil buton (`bg-red-500 … rounded-xl shadow-lg`) | 7 | 171, 234, 244, 347, 885, 1380, 1793 |
| İkincil çerçeveli buton | 2 | 482, 516 |
| Kategori rozeti `bg-red-100 text-red-600` | 3 | 505, 1186, 1210 |
| Yükleniyor döngüsü `border-2 border-red-500 border-t-transparent rounded-full animate-spin` | 5 | 97, 207, 209, 1519, + BlogDetail |
| Bölüm kapsayıcı `max-w-7xl mx-auto px-6 sm:px-10 lg:px-16` | 28 | her bölüm |
| Ekip kartı (posta/LinkedIn ikon satırı) | 2 | 595+, 1110+ |
| Boş durum kartı | 3 (UpcomingEmpty, çekiliş, 404 değil) | 41, 1519 |
Düzeltme: `src/ui/` altında `Container`, `Button` (variant: primary/secondary/ghost/onRed, size), `Badge`, `Card`, `PostCard`, `EventCard`, `SocialLinks`, `Spinner`, `EmptyState`; birincil buton tarifini tek yerde `bg-red-600 hover:bg-red-700` yaparak R1'i de kapatır. `App.jsx` (1888 satır) içindeki sayfaları ayrı dosyalara bölmek aynı işin parçasıdır. Efor büyük ama risk düşük (stil değişmez).

### B2. Render içinde bileşen tanımı — Orta, M
`const TeamCard` (595) ve `const MilestoneCard` (745) bir IIFE/işlev içinde tanımlanıyor; üst bileşen render olunca yeni bir bileşen türü doğuyor, alt ağaç yeniden bağlanır (görseller yeniden yüklenir, animasyonlar sıfırlanır). `mb-${size === "sm" ? "4" : "6"}` (satır 789 civarı, tarihçe kartı) Tailwind'in derleme zamanı tarayıcısı için kırılgandır: `mb-4`/`mb-6` başka yerde geçtiği için çalışıyor; geçmeseydi stil üretilmezdi. Düzeltme: bileşenleri dosya düzeyine taşı; dinamik sınıfı iki tam sınıf adıyla yaz.

---

## Düşük önem

### S1. Bölüm boşlukları — Düşük, S
Dominant `py-20 md:py-28` (19 yer) ama: 452, 490, 557, 1516 `py-16 md:py-24`; 524, 539, 1808 `py-14 md:py-20`; 389 `pt-16 md:pt-24 pb-12 md:pb-16` (ana sayfa aktivite bölümü başka); 881 hakkımızda CTA `py-16` (kademesiz); 1465 yasal `py-20 md:py-28` (doğru). Ana sayfada sıra: 24→24→24→20→20→24(CTA) rastgele; hakkımızda'da SSS (`py-20 md:py-28`, 869) beyaz, ardından tarihçe de beyaz (iki beyaz bölüm yan yana, ayırıcı `border-t` ile; 984'te de aynı) → ritim kuralı (zemin değişmeli). Düzeltme: `Section` bileşeni (`size="md|sm"`), ayrıcı `border-t` yerine `bg-slate-50`.

### S2. Buton ölçüleri — Düşük, S
Yedi farklı iç boşluk: `px-7 py-3.5` (hero), `px-8 py-4` (CTA), `px-7 py-3` (404/hakkımızda), `px-4 py-2` (navbar), `px-6 py-2.5` (ikincil), `px-5 py-2.5` (çerez), `px-7 py-3.5 text-base` (form). Kural üç boy (küçük/orta/büyük). Birincil gölgesi hero'da `shadow-xl`, diğerlerinde `shadow-lg`.

### S3. Rozet biçimleri — Düşük, S
SectionTitle (`px-3 py-1 text-[10px] uppercase red-700`), kart kategorisi (`px-2 / px-2.5 py-0.5 text-[10px] red-600`), dept rozeti (`red-50/500 text-[9px]`), görsel üstü (`bg-white/25 text-white text-[10px]`, 2,8:1 **[ölçüm]**), `RosterSoon` (`red-50/700 text-[11px]`), ClubCard (`red-500 text-xs`). Hepsi tek `Badge` varyasyonuna iner.

### S4. Kart varyasyonu — Düşük, S
Hover gölgesi: `shadow-xl shadow-red-500/5` (6), düz `shadow-xl` (ekip, çekiliş) , `shadow-lg` (sponsor), `shadow-md` (geçmiş etkinlik). Başlık: etkinlik kartı `text-base` (471) / `text-sm` (937); çekiliş kartı başlığı `text-base`, blog `text-sm`. Aynı kartlar sayfalar arasında kayıyor. Çözüm B1 ile birlikte.

### G1. Görseller — Düşük, S
Ölçüm: 0 eksik `alt` **[ölçüm]**. Ama:
- Kart bağlantısı içindeki görselin `alt={title}` değeri aynı bağlantıdaki `h3` ile çakışıyor: ekran okuyucu başlığı iki kez okur (498, 1138, 1162, BlogDetail 150; aktivite 398 görsel `alt=title` yanında `h3` başlık). Düzeltme: `alt=""`.
- Sponsor logosu `alt="X logosu"` ve altında görünür ad (530–531): tekrar; sponsor logosu `opacity-60` + `text-slate-400` ad **soluk**, ekran görüntüsünde "British Express" logosu neredeyse görünmüyor **[ekran]**; `opacity-100` ya da gri tonlama yerine `opacity-80`.
- `width`/`height` yok (ClubCard hariç) → düzen kayması (CLS). Kart görsellerinde `aspect-*` var (iyi), hero logosu, navbar logosu, footer logosu ve sponsor logoları boyutsuz.
- Blog yazısı kapağı `loading="lazy"` (BlogDetail 83): sayfanın en büyük görseli, LCP'yi geciktirir. Kaldır.
- İletişim haritası `loading="eager"` (1323): ilk ekran altında ağır iframe, `lazy` olmalı.
- Footer logosu `loading="lazy"` (iyi), navbar logosu eager (iyi).

### D1. Blog yazısı sayfası — Düşük, S
BlogDetail 79, 97, 103, 115, 128, 145: `fontFamily` satır içi stil 6 kez (`font-display` sınıfı varken). 89: `max-w-[900px] px-6` (tek yerde `sm:px-10 lg:px-16` yok, `max-w-4xl` değil). Başlık `font-extrabold` ama bölüm/başlık düzeni PageHeader kalıbını izlemiyor (koyu üstbilgi yok; ok olabilir, tasarım kararı). Geri bağlantısı `text-slate-400` 14 px (2,56:1 **[kod]**). "Yazı bulunamadı" ve yükleme durumları `font-display` kullanmıyor. 130–136 paylaş ikonları: T1, A4.

### D3. Dil, yazım ve içerik tutarlılığı — Düşük, S
- Hitap karışık: 1275 "tekliflerin için bizimle iletişime geçebilirsin" (sen) ile aynı sayfada 1333 "Bize Mesaj Gönderin", "Adınız ve soyadınız", "Mesajınızı buraya yazın" (siz); navbar "Bize Ulaşın" vs mobil menü "Sen de GKT'li Ol"; footer "Yakında burada paylaşılacak" (pasif) vs "hesabını takip et" (sen).
- 883 "Bu Hikayenin Bir Parçası Ol": "Hikâye"; aynı projede "tarihî rekor" (şapkalı). Birini seç.
- Başlık büyük/küçük harf: "Kampüsün Nabzı Burada Atıyor", "Sıkça Sorulan Sorular" (Başlık Düzeni) / ClubCard "Kartın geçtiği yerler", "Nasıl kullanılır?" (cümle düzeni).
- Ham tarih `2026-03-16`, `2027-03-01`, `2026-04-15` (ana sayfa duyuru kartları, etkinlik meta'sı, geçmiş etkinlik listesi) kullanıcıya olduğu gibi gösteriliyor **[ekran]**; Türkçe biçime çevir (`16 Mart 2026`, `formatDate` zaten 1486 çekiliş sayfasında var, ortak yardımcıya taşı).
- Sabit "Son güncelleme: 14 Şubat 2026" (1473) ve "© 2026" (1882): yıl elle yazılı.
- Footer "❤️ ile geliştirildi": emoji (kural: arayüzde yok), `white/15` ile 1,56:1.
- Test verisi yansıyor: "Test" kategori rozeti ve 2027-03-01 tarihli etkinlik ana sayfada (yalnızca test veritabanında; yayında yok sayılır **[doğrulanmadı]**).
- "yapay zeka" geçen yer yok **[kod]**; şapkalı yazım ihlali yok.

### D4. Çalışmayan ya da kırılgan sınıflar — Düşük, S
- 956 `md:direction-rtl`: Tailwind'de böyle bir sınıf yok; etkisiz (yerleşimi `md:order-*` yapıyor). Sil.
- LegalPageLayout `prose prose-sm prose-slate` (1463): `@tailwindcss/typography` eklentisi `tailwind.config.js` içinde yok (`plugins: []`); `prose` etkisiz, stil yalnızca `[&_h2]:…` ile geliyor.
- `GlobalStyles` içinde `.line-clamp-2/3` yeniden tanımlı (Tailwind 3.4 yerleşik); `@keyframes pulse` yeniden tanımı Tailwind `animate-pulse` görünümünü değiştirir (iskeletler 0,6 opaklığa düşer, Tailwind'in 0,5'i yerine).
- Kapsam dışı ama etkisi var: font ve `font-display` sınıfı bir bileşenin `<style>` etiketinde (62–90); `BlogDetailPage` ve Suspense yedekleri (97, 207) `GlobalStyles` dışında kalıyor → `font-display` her zaman tanımlı olmayabilir (`MainLayout` içinde kaldığı için bugün çalışıyor).
- 404 devasa "404" `text-white/5` (1789) dekor, `aria-hidden` yok.
- Tarihçe dekor rakamları (`red-400/20`, `amber-400/20` vb., 757, 822…) 1,1–1,2:1 ama dekor; `aria-hidden="true"` verilmeli.
- Aktivite/etkinlik kartlarında `anim-fade` ilk yüklemede görünüm alanı dışındakiler için de oynuyor (kaydırınca animasyon görünmez, `useInView` yalnızca `CountUp`'ta kullanılıyor).

---

## Neyi doğrulayamadım

- Klavye ile odak sırası ve görünür halka (gerçek klavye testi yapılmadı) → F1, A1, A2.
- Çerez bandının "yukarı çık" düğmesiyle çakışması, iOS `vh` davranışı → M1.
- `anim-fade` gecikmesindeki parlama (kod açık, canlı gözlem yok) → N1.
- Degrade/fotoğraf üstündeki yazının gerçek kontrastı (aktivite kartı başlığı `text-white` üzerine `from-black/60` degrade): ölçüm betiği zemini bulamadı; koyu degrade nedeniyle büyük olasılıkla geçer, **doğrulanmadı**.
- Ekip bölümünün kişi adı/fotoğrafı kalktıktan sonraki son hâli (başka bir çalışma sürerken `App.jsx` değişiyordu).
- `public/assets/ugz*` dosyalarının başka yerden kullanılıp kullanılmadığı → Y1.
- Gerçek veritabanındaki içerik (boş test veritabanı, yedek veri ile ölçüldü).
