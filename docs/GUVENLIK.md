# Güvenlik ve kişisel veri

## Güvenlik betiği
`scripts/guvenlik-kontrol.mjs` — öncelik kullanıcı bilgilerini korumak.

```bash
npm run guvenlik          # repo + kod + bağımlılık
npm run guvenlik:tam      # + tüm git geçmişi + canlı site (yalnızca GET istekleri)
GKT_SITE=http://localhost:3099 node scripts/guvenlik-kontrol.mjs --canli   # yerel sunucuya karşı
node scripts/guvenlik-kontrol.mjs --json rapor.json                       # JSON çıktı
```

| Katman | Ne denetler |
|---|---|
| Repo | `.env`, veritabanı, `.claude/`, anahtar dosyası, adı "şifre" çağrıştıran dosya repoda mı |
| Sırlar | JWT, özel anahtar, AWS/GitHub token, koda gömülü şifre, varsayılan şifre hash'i, eskiden sızmış şifreler; `--gecmis` ile tüm git geçmişi |
| Kişisel veri | Cep telefonu, e-posta, geçerli TC kimlik no (sağlama hesabıyla) |
| Kod | DOMPurify'sız `dangerouslySetInnerHTML`, `eval`, istek verisinin SQL'e gömülmesi, yetki kontrolü olmayan yazma rotası, helmet/CSP/CORS/hız sınırı, JWT ayarları, şifre uçları, herkese açık uçlarda alan süzme |
| Bağımlılık | `npm audit` (yalnızca yayın bağımlılıkları), yayın paketinde kaynak haritası veya sır |
| Canlı | `.env`, `.git`, veritabanı, kaynak kod, günlük dosyaları dışarıdan açık mı; yükleme klasörü listeleniyor mu; korumalı uçlar 401 mi; güvenlik başlıkları; `/api/team` ve `/api/settings` kişisel veya hassas veri döndürüyor mu; hata yanıtı yığın izi sızdırıyor mu |

Kritik bulgu varsa çıkış kodu 1 olur (CI'a bağlanabilir). Bilinçli istisnalar `scripts/guvenlik-izinli.json` dosyasında tutulur.

## Bu gecenin sonuçları
Raporlar: `docs/guvenlik/*.json`.

| Ölçüm | Kritik | Yüksek | Orta | Düşük |
|---|---|---|---|---|
| Başlangıç (repo + geçmiş + canlı) | 3* | 8 | 11 | 3 |
| Gece sonu, kod (repo + geçmiş) | 0 | 0 | 1 | 3 |
| Gece sonu, yeni sunucu (yerelde canlı denetim) | 0 | 0 | 1 | 3 |

\* 2'si yanlış alarmdı (`process.env` okuması), kural düzeltildi. Gerçek kritik bulgu npm açığıydı.

**Canlı sitede doğrulananlar (bugünkü sürüm):** `.env`, veritabanı, `.git`, kaynak dosyalar ve günlükler dışarıdan erişilemiyor. `/api/messages`, `/api/auth/users`, `/api/media`, `/api/auth/me` kimliksiz 401 dönüyor. HSTS ve CSP var. Git geçmişinde sır yok.

**Bilerek açık bırakılanlar (karar senin):**
- ORTA: İletişim mesajlarını her rol okuyabiliyor → `docs/SORUN-ANALIZI.md` §14.
- DÜŞÜK: Panel token'ı `localStorage`'da → §15.

## Bu gece yapılan sertleştirmeler
1. **Oturum doğrulama:** Token her istekte veritabanından kontrol edilir (`users.token_version`). Hesap silinince, şifre değişince ya da sıfırlanınca eski oturumlar anında kapanır. Rol ve departman token'dan değil veritabanından okunur.
2. **Şifre uçları:** `PUT /api/auth/password` (kendi şifresi, mevcut şifre gerekir) ve `PUT /api/auth/users/:id/password` (admin sıfırlama, geçici şifre yalnızca bir kez gösterilir). Panelde "Şifremi Değiştir" ve "Şifre sıfırla" arayüzü var. Yanlış mevcut şifre 400 döner, oturum kapanmaz.
3. **Şifre kuralı:** Her yerde 10–128 karakter. Panel ipucu ile sunucu kuralı artık aynı.
4. **Kurtarma anahtarı:** Sabit zamanlı karşılaştırma (`timingSafeEqual`); kurtarmayla şifre değişince de oturumlar kapanır.
5. **JWT:** `JWT_SECRET` yoksa token üretilmez.
6. **Veri minimizasyonu:** `/api/team` girişsiz isteklerde telefon ve e-posta alanı içermez; `team_public` kapalıyken hiç kişi döndürmez. `/api/settings` yalnızca herkese açık anahtarları döndürür. Ayar anahtarı biçimi ve değer uzunluğu doğrulanır.
7. **CSP:** `script-src 'unsafe-inline'` kaldırıldı (build'de satır içi script yok; tarayıcıda konsol hatası olmadığı doğrulandı).
8. **Bağımlılıklar:** `npm audit fix` ile body-parser, multer, path-to-regexp, proxy-addr, qs, ip-address ve dompurify güncellendi; `sharp` 0.35.5'e yükseltildi (libvips/librsvg açıkları). Görsel yükleme dönüşümleri yerelde denendi. Node ≥ 20.9 gerekiyor; cPanel'de 20.20.2 var.
9. **Kişisel veri:** Kadro adları, fotoğrafları, kişisel e-postaları ve telefonlar kod, seed, demo verisi ve llms dosyalarından kaldırıldı; 17 fotoğraf repodan silindi. Kişi adı içeren tek seferlik veritabanı göçü kaldırıldı.

## Uçtan uca test (yerel, 25 senaryo — hepsi geçti)
Kurtarma anahtarı (yanlış/doğru) · girişsiz `/settings` iç anahtarı göstermez · admin tümünü görür · geçersiz ayar anahtarı reddi · girişsiz `/team` telefon/e-posta yok · admin görür · hesap açma · giriş · yanlış mevcut şifre (400, oturum sürer) · kısa şifre reddi · şifre değiştirme + yeni token · eski token geçersiz · yeni token geçerli · eski şifreyle giriş reddi · direktör başkasını sıfırlayamaz · admin sıfırlama · sıfırlamadan sonra oturum kapanır · geçici şifreyle giriş · hesap silme · silinen hesabın token'ı geçersiz · girişsiz `/messages` ve sıfırlama 401.

Tarayıcıda ayrıca denendi: panelde geçici şifre penceresi, "Şifremi Değiştir" akışı (yanlış ve doğru), ekip görünürlük anahtarı (kapalı/açık).
