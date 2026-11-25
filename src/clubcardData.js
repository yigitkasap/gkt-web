/* ══════════════════════════════════════════════════════════════
   GKT CLUB CARD — anlaşmalı işletmeler (BAŞLANGIÇ VERİSİ)
   Asıl liste veritabanında durur ve yönetim panelinden (Panel → Club Card)
   güncellenir. Bu dosya yalnızca:
     1) veritabanı ilk kez kurulurken tabloyu doldurmak (server/routes/clubcard.js),
     2) API'ye ulaşılamazsa sayfanın boş kalmaması
   için kullanılır. Panelde yapılan değişiklikler buraya yansımaz.
   Kaynak: yönetimin el yazısı listesi ve koşul notları (24 Kasım 2026).

   offers: [{ discount: 25, scope: "Kahvelerde" }]
     discount null ise scope bir ayrıcalık metnidir ("Waffle yanında filtre kahve ücretsiz").
   conditions: her satır ayrı bir koşul.
   contact: "maps" (haritada aç) | "whatsapp" (WhatsApp'tan yaz) | "none"
   WhatsApp numarası repoya yazılmaz (repo herkese açık); panelden girilir.
   ══════════════════════════════════════════════════════════════ */

export const CLUBCARD_PERIOD = "2026–2027";

// Basılı kartın arka yüzündeki QR kod bu adrese gidiyor: https://akdenizgkt.com/clupkart
// (App.jsx ve server/index.js içinde /clubcard'a yönlendiriliyor — kaldırma.)
export const CLUBCARD_PATH = "/clubcard";

const L = (slug) => `/assets/clubcard/${slug}.webp`;

export const CLUBCARD_PARTNERS = [
  { name: "Arceus Park", category: "Oyun & kafe", branch: "Kültür Şubesi", logo_path: L("arceus-park"),
    offers: [{ discount: 25, scope: "Kahvelerde" }, { discount: 10, scope: "Oyunlarda" }],
    conditions: "Kampanyalar ve PS5 dahil değil", contact: "maps" },
  { name: "British Express", category: "Dil okulu", branch: "Tüm şubelerde", logo_path: L("british-express"),
    offers: [{ discount: 25, scope: "" }], conditions: "", contact: "maps" },

  { name: "Baha Box Burger", category: "Burger", branch: "Meltem Şubesi", logo_path: L("baha-box-burger"),
    offers: [{ discount: 20, scope: "" }], conditions: "", contact: "maps" },
  { name: "Tostar", category: "Tost & sandviç", branch: "Meltem Şubesi", logo_path: L("tostar"),
    offers: [{ discount: 20, scope: "" }], conditions: "", contact: "maps" },
  { name: "Nefes Pilates Studio", category: "Pilates", branch: "Meltem Şubesi", logo_path: L("nefes-pilates"),
    offers: [{ discount: 20, scope: "" }], conditions: "Kredi kartıyla ödemede geçerli", contact: "maps" },
  { name: "Sfenks", category: "Giyim & kahve", branch: "Kültür Şubesi", logo_path: L("sfenks"),
    offers: [{ discount: 20, scope: "Giyimde" }, { discount: 10, scope: "Kahvelerde" }], conditions: "", contact: "maps" },
  { name: "Frederic Patric", category: "Parfüm", branch: "Konyaaltı Cd. Şubesi", logo_path: L("frederic-patric"),
    offers: [{ discount: 20, scope: "" }], conditions: "Tekli ürün alımında geçerli", contact: "maps" },

  { name: "CoffeeTainer", category: "Kahve", branch: "Tüm şubelerde", logo_path: L("coffeetainer"),
    offers: [{ discount: 15, scope: "" }], conditions: "Yalnızca kahvelerde geçerli", contact: "maps" },
  { name: "Zilli Öküz", category: "Burger", branch: "Yakut Şubesi", logo_path: L("zilli-okuz"),
    offers: [{ discount: 15, scope: "" }], conditions: "", contact: "maps" },
  { name: "Raum Studio", category: "Yoga & kahve", branch: "Meltem Şubesi", logo_path: L("raum-studio"),
    offers: [{ discount: 15, scope: "" }], conditions: "Fly yoga dahil değil", contact: "maps" },
  { name: "Mebay Medya", category: "Medya & reklam", branch: "", logo_path: L("mebay-medya"),
    offers: [{ discount: 15, scope: "" }], conditions: "", contact: "whatsapp" },

  { name: "Q7 Gym", category: "Spor salonu", branch: "Imperial ve Premium şubeleri", logo_path: L("q7"),
    offers: [{ discount: 10, scope: "" }], conditions: "", contact: "maps" },
  { name: "Gusto Makarna", category: "Makarna", branch: "Kültür Şubesi", logo_path: L("gusto-makarna"),
    offers: [{ discount: 10, scope: "" }], conditions: "", contact: "maps" },
  { name: "Kiraz Waffle", category: "Dondurma & waffle", branch: "Meltem Şubesi", logo_path: L("kiraz-waffle"),
    offers: [{ discount: 10, scope: "" }], conditions: "", contact: "maps" },
  { name: "Kampüs Ev Yemekleri", category: "Ev yemekleri", branch: "Ceypark Şubesi", logo_path: L("kampus-ev-yemekleri"),
    offers: [{ discount: 10, scope: "" }], conditions: "", contact: "maps" },
  { name: "GLR Garaj", category: "Motosiklet ekipman & aksesuar", branch: "Kültür Şubesi", logo_path: L("glr-garaj"),
    offers: [{ discount: 10, scope: "" }], conditions: "Tek çekim ve nakit ödemede geçerli", contact: "maps" },
  { name: "The Nani Cafe", category: "Kafe", branch: "Ceypark Şubesi", logo_path: L("nani-cafe"),
    offers: [{ discount: 10, scope: "" }], conditions: "", contact: "maps" },

  { name: "Waffles Waffle & Coffee", category: "Waffle & kahve", branch: "Tüm şubelerde", logo_path: L("waffles"),
    offers: [{ discount: null, scope: "Waffle yanında filtre kahve ücretsiz" }], conditions: "", contact: "maps" },
].map((p, i) => ({ id: i + 1, whatsapp: "", maps_url: "", sort_order: (i + 1) * 10, ...p }));

/* ── Ortak yardımcılar (sayfa + panel + sunucu özeti) ── */

export const maxDiscount = (p) => Math.max(0, ...p.offers.map(o => o.discount || 0));

export const partnerTiers = (partners) =>
  [...new Set(partners.flatMap(p => p.offers.map(o => o.discount)).filter(Boolean))].sort((a, b) => b - a);

export const hasPerk = (p) => p.offers.some(o => !o.discount);

export const conditionList = (p) => String(p.conditions || "").split("\n").map(s => s.trim()).filter(Boolean);

export const offerLabel = (o) => o.discount ? `%${o.discount}${o.scope ? ` ${o.scope.toLocaleLowerCase("tr")}` : ""}` : o.scope;
