/* ══════════════════════════════════════════════════════════════
   GKT CLUB CARD — anlaşmalı işletmeler
   Kaynak: basılı kart tasarımı ("clup kart tasarım (2).pdf", arka yüz listesi).
   Oran, şube veya işletme değişince yalnızca bu dosyayı güncelle.
   Logolar: public/assets/clubcard/<logo>.webp
   ══════════════════════════════════════════════════════════════ */

export const CLUBCARD_PERIOD = "2026–2027";

// Basılı kartın arka yüzündeki QR kod bu adrese gidiyor: https://akdenizgkt.com/clupkart
// (App.jsx içinde /clubcard'a yönlendiriliyor — kaldırma.)
export const CLUBCARD_PATH = "/clubcard";

export const CLUBCARD_PARTNERS = [
  // %25
  { name: "British Express", category: "Dil okulu", discount: 25, branch: "Tüm şubelerde", logo: "british-express" },
  { name: "Arceus Park", category: "Oyun & kafe", discount: 25, branch: "Kültür Şubesi", logo: "arceus-park" },

  // %20
  { name: "Baha Box Burger", category: "Burger", discount: 20, branch: "Meltem Şubesi", logo: "baha-box-burger" },
  { name: "Tostar", category: "Tost & sandviç", discount: 20, branch: "Meltem Şubesi", logo: "tostar" },
  { name: "Nefes Pilates Studio", category: "Pilates", discount: 20, branch: "Meltem Şubesi", logo: "nefes-pilates" },
  { name: "Sfenks", category: "Giyim & kahve", discount: 20, branch: "Kültür Şubesi", logo: "sfenks" },
  { name: "Frederic Patric", category: "Parfüm", discount: 20, branch: "Konyaaltı Cd. Şubesi", logo: "frederic-patric" },
  { name: "Raum Studio", category: "Yoga & kahve", discount: 20, branch: "Meltem Şubesi", logo: "raum-studio" },

  // %15
  { name: "CoffeeTainer", category: "Kahve", discount: 15, branch: "Tüm şubelerde", logo: "coffeetainer" },
  { name: "Zilli Öküz", category: "Burger", discount: 15, branch: "Yakut Şubesi", logo: "zilli-okuz" },
  { name: "Kiraz Waffle", category: "Dondurma & waffle", discount: 15, branch: "Meltem Şubesi", logo: "kiraz-waffle" },
  { name: "Mebay Medya", category: "Medya & reklam", discount: 15, branch: "Tüm şubelerde", logo: "mebay-medya" },

  // %10
  { name: "Q7", category: "Spor salonu", discount: 10, branch: "Tüm şubelerde", logo: "q7" },
  { name: "Gusto Makarna", category: "Makarna", discount: 10, branch: "Kültür Şubesi", logo: "gusto-makarna" },
  { name: "Kampüs Ev Yemekleri", category: "Ev yemekleri", discount: 10, branch: "Ceypark Şubesi", logo: "kampus-ev-yemekleri" },
  { name: "GLR Garaj", category: "Motosiklet ekipman & aksesuar", discount: 10, branch: "Kültür Şubesi", logo: "glr-garaj" },
  { name: "The Nani Cafe", category: "Kafe", discount: 10, branch: "Ceypark Şubesi", logo: "nani-cafe" },
  { name: "Waffles Waffle & Coffee", category: "Waffle & kahve", discount: 10, branch: "Tüm şubelerde", logo: "waffles" },
];

export const CLUBCARD_TIERS = [...new Set(CLUBCARD_PARTNERS.map(p => p.discount))].sort((a, b) => b - a);
