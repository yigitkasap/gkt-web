import {
  Sparkles, TrendingUp, Award, Users, CalendarDays, MapPin, Mail, Phone,
  Monitor, Handshake, Newspaper, Clock, Target, Play, Star, Zap,
  BookOpen, Coffee, Music, Globe, Heart, Building2, GraduationCap,
  Briefcase, Megaphone, Compass, Rocket, Eye,
  Instagram, Youtube, Linkedin, Facebook, Twitter
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */
export const NAV = [
  { label: "Anasayfa", id: "home", path: "/" },
  { label: "Hakkımızda", id: "hakkimizda", path: "/hakkimizda" },
  { label: "Etkinlikler", id: "etkinlikler", path: "/etkinlikler" },
  { label: "Departmanlar", id: "departmanlar", path: "/departmanlar" },
  { label: "Blog", id: "blog", path: "/blog" },
  { label: "İletişim", id: "iletisim", path: "/iletisim" },
];

export const PATHS = {
  home: "/", hakkimizda: "/hakkimizda", etkinlikler: "/etkinlikler",
  departmanlar: "/departmanlar", blog: "/blog", iletisim: "/iletisim",
  cekilis: "/cekilis", clubcard: "/clubcard", gizlilik: "/gizlilik",
  "kullanim-sartlari": "/kullanim-sartlari", kvkk: "/kvkk", cerez: "/cerez",
};

export const STATS = [
  { value: "24+", label: "Yıllık Deneyim", icon: Award },
  { value: "6000+", label: "Toplam Üye", icon: Users },
  { value: "200+", label: "Etkinlik", icon: CalendarDays },
  { value: "50+", label: "Kurumsal Paydaş", icon: Building2 },
];

export const ACTIVITIES = [
  { icon: GraduationCap, title: "Kariyer Günleri", image: "/assets/activities/kariyer-gunleri.jpg", desc: "Kariyer Günleri, kariyerinizde ilk adımı atabilmeniz için size bir şans tanıyor. Her sene düzenlediğimiz Kariyer Günlerinde iş dünyasını bir öğrenci gözünden gözlemliyor, sektörün üstündeki insanlarla tanışma fırsatı yakalıyoruz." },
  { icon: MapPin, title: "Teknik Geziler", image: "/assets/activities/teknik-gezi.jpg", desc: "Şirketlerin, fabrikaların ve diğer iş yerlerinin nasıl yürütüldüğünü daha iyi anlamamızı sağlıyor. İş dünyasıyla doğrudan temasa geçerek bilgi birikimimizi artırıyor ve staj-iş fırsatları yakalıyoruz." },
  { icon: Play, title: "CineGKT", image: "/assets/activities/cine-gkt.jpg", desc: "Her perşembe ofisimizde düzenli olarak gerçekleştirdiğimiz CineGKT etkinliğiyle, yerli ve yabancı filmlerin yer aldığı gösterimlerde sinema aracılığıyla hem eğlenip hem öğrenerek farklı bakış açıları kazandırıyoruz." },
  { icon: Heart, title: "Sosyal Sorumluluk", image: "/assets/activities/sosyal-sorumluluk.jpg", desc: "Üyelerimizin farklı fikirleri izlemesi, demokratik tartışma ve uzlaşma deneyiminin geliştirilmesi, takım çalışması, iletişim, liderlik ve proje yürütme becerilerinin güçlendirilmesi açısından zengin bir seçenek sunuyoruz." },
  { icon: Briefcase, title: "Staj Programları", image: "/assets/activities/staj-programlari.png", desc: "Seminer ve birebir buluşmalar sayesinde üyelerimizi sektörün önde gelen iş insanlarıyla bir araya getiriyoruz. Birçok üyemiz güçlü bağlantılar kuruyor ve mezuniyet öncesi önemli deneyimler kazanıyor." },
  { icon: Coffee, title: "Ofis Sohbetleri", image: "/assets/activities/ofis-sohbetleri.jpg", desc: "Alanında deneyimli isimleri ofisimizde misafir ederek iş dünyasına dair bilgi edinmeyi ve kişisel gelişimimize katkı sağlamayı hedefliyoruz. Samimi bir ortamda merak ettiğimiz soruları uzmanlara birebir yöneltebiliyoruz." },
  { icon: Music, title: "GKT Akustik", image: "/assets/activities/gkt-akustik.jpg", desc: "Üyelerimizin sanat ve müzikle olan bağlarına dokunuyoruz. Her hafta düzenli olarak gerçekleştirdiğimiz bu etkinlikte farklı enstrümanları dinleme ve çalma fırsatı bulurken yeni arkadaşlıklar kuruluyor." },
  { icon: Globe, title: "Üniversite Dışı Etkinlikler", image: "/assets/activities/universite-disi-etkinlikler.jpg", desc: "Kardeş üniversitelerimiz, iş dünyası çevreleri ve paydaş kurumlarımızdan gelen etkinlik davetlerine hep birlikte icabet ediyoruz. Forum İstanbul, ANSİAD ve birçok kongre ve seminerlere katılıyoruz." },
];

export const EVENTS_UPCOMING = [
  { title: "18. Ulusal Girişimcilik Zirvesi", date: "2026-04-15", loc: "Kongre Merkezi", cat: "Zirve", desc: "Sektör liderleri, yatırımcılar ve genç girişimciler bir araya geliyor. Keynote konuşmalar, paneller ve networking.", color: "from-red-600 to-red-500" },
];

export const EVENTS_PAST = [
  { title: "CINE TALKS: Bir Filmin Anatomisi", date: "2026-03-04", location: "Hukuk Fakültesi Konferans Salonu", category: "Workshop", desc: "Sinema sektöründe oyunculuktan senaryoya, yönetmenlikten yapım ve dağıtıma kadar sürecin her aşamasında söz sahibi, alanında en iyi isimleri bir araya getirdik.", image_path: "/assets/events/cine-talks-ici.jpg", color: "from-amber-500 to-orange-500" },
  { title: "Genç Rota: Türkiye İş Bankası", date: "2026-03-03", location: "Yavuz Tekelioğlu Konferans Salonu", category: "Kariyer", desc: "Türkiye İş Bankası'nın Genç Rota etkinliği ile bankacılık dünyasının kapılarını araladık.", image_path: "/assets/events/genc-rota.jpg", color: "from-emerald-500 to-teal-500" },
  { title: "QNB Career: Yetenek Kampüsü", date: "2025-12-15", location: "Hukuk Fakültesi Salonu", category: "Kariyer", desc: "QNB Finansbank'ın kariyer programı ile bankacılık ve finans sektöründe kariyer fırsatlarını keşfettik.", image_path: "/assets/events/qnb-career-ici.jpg", color: "from-emerald-500 to-teal-500" },
  { title: "GKT for Yours: Yıldızlar Geçidi", date: "2025-11-28", location: "Hukuk Fakültesi Konferans Salonu", category: "Sosyal", desc: "Topluluğumuzun en renkli sosyal etkinliği. Müzik, eğlence ve networking bir arada.", image_path: "/assets/events/gkt-for-yours-ici.jpg", color: "from-pink-500 to-rose-500" },
];

export const DEPARTMENTS = [
  { id: 0, name: "Medya ve IT", icon: Monitor, color: "from-red-500 to-red-600", image: "/assets/medya-it.png", desc: "Topluluğun görsel kimliğini ve dijital iletişim stratejisini şekillendirir. Sosyal medya içerik üretimi, grafik tasarım, video prodüksiyon ve fotoğrafçılık gibi alanlarda yaratıcı çalışmalar yürütür. Etkinliklerin tanıtım materyallerini hazırlar, marka tutarlılığını sağlar ve web altyapısını yönetir.", tasks: ["Grafik tasarım ve marka kimliği yönetimi", "Sosyal medya içerik üretimi ve yönetimi", "Video prodüksiyon ve fotoğraf çekimi", "Web sitesi geliştirme ve dijital altyapı"] },
  { id: 1, name: "Etkinlik ve Organizasyon", icon: CalendarDays, color: "from-rose-600 to-red-700", image: "/assets/etkinlik-organizasyon.png", desc: "Ulusal Girişimcilik Zirvesi, Kariyer Günleri, seminerler, workshop'lar ve teknik geziler gibi büyük ve orta ölçekli etkinliklerin A'dan Z'ye planlamasını üstlenir. Mekan seçimi, lojistik koordinasyon, program akışı tasarımı ve gün içi sahne yönetimini gerçekleştirir. Konuşmacı ve katılımcı deneyimini en üst düzeyde tutmayı hedefler.", tasks: ["Zirve, konferans ve kariyer günü organizasyonu", "Mekan seçimi, sahne ve lojistik koordinasyonu", "Program akışı tasarımı ve moderasyon", "Konuşmacı davet süreçleri ve katılımcı yönetimi"] },
  { id: 2, name: "Kurumsal İlişkiler", icon: Handshake, color: "from-slate-700 to-slate-900", image: "/assets/kurumsal-iliskiler.png", desc: "Topluluğun dış dünyayla kurduğu tüm kurumsal bağları yönetir. Sponsorluk görüşmeleri, protokol süreçleri, şirket iş birlikleri ve paydaş ilişkilerini koordine eder. Üyelere staj ve iş fırsatları sunmak için sektör temsilcileriyle stratejik ortaklıklar kurar ve etkinliklerin finansal sürdürülebilirliğini sağlar.", tasks: ["Sponsorluk görüşmeleri ve protokol yönetimi", "Kurumsal paydaş ve sektör temsilcisi ilişkileri", "Staj, iş fırsatı ve kariyer köprüsü oluşturma", "Bütçe planlaması ve finansal sürdürülebilirlik"] },
  { id: 3, name: "Üye İlişkileri", icon: Users, color: "from-red-800 to-rose-900", image: "/assets/uye-iliskileri.png", desc: "Topluluk kültürünü canlı tutar ve üye bağlılığını güçlendirir. Yeni üyelerin adaptasyon sürecini yönetir, sosyal etkinlikler ve tanışma toplantıları düzenler. Üye memnuniyetini ölçümler, geri bildirimleri değerlendirir ve iç iletişim kanallarını aktif tutarak topluluğun bir aile gibi işlemesini sağlar.", tasks: ["Yeni üye kayıt, oryantasyon ve adaptasyon süreci", "Sosyal etkinlik, tanışma toplantısı ve ofis aktiviteleri", "Üye memnuniyeti analizi ve geri bildirim yönetimi", "İç iletişim kanalları ve motivasyon çalışmaları"] },
];

// Kişi adları/fotoğrafları koda gömülmez (KVKK). Ekip yalnızca panelden ve "Ekibi sitede göster" açıkken görünür.
export const TEAM = [];

export const MILESTONES = [
  { year: "2002", title: "Kuruluş", text: "Bir avuç girişimci ruhlu öğrenci tarafından kuruldu.", icon: Star, color: "from-red-500 to-rose-600" },
  { year: "2012", title: "İlk Ulusal Zirve", text: "İlk Ulusal Girişimcilik Zirvesi 500+ katılımcıyla gerçekleşti.", icon: Award, color: "from-amber-500 to-orange-600" },
  { year: "2016", title: "Kariyer Günleri", text: "30+ firma ile ilk Kariyer Günleri etkinliği.", icon: Briefcase, color: "from-emerald-500 to-teal-600" },
  { year: "2020", title: "Dijital Dönüşüm", text: "Pandemi sürecinde etkinlikler online platforma taşındı.", icon: Monitor, color: "from-blue-500 to-indigo-600" },
  { year: "2024", title: "Rekor Katılım", text: "17. Zirve — 3.000+ katılımcı ile tarihî rekor.", icon: TrendingUp, color: "from-violet-500 to-purple-600" },
  { year: "2026", title: "Yeni Dönem", text: "Yenilenen site, genişleyen ekip ve 18. Zirve hazırlıkları.", icon: Zap, color: "from-red-500 to-red-700" },
];

export const BLOG_POSTS = [
  { title: "Etkili CV Hazırlama, Staj Bulma ve Mülakat Teknikleri: Üniversite Öğrencileri İçin Kariyer Rehberi", slug: "etkili-cv-hazirlama-staj-bulma-ve-mulakat-teknikleri-universite-ogrencileri-icin-kariyer-rehberi", date: "16 Mart 2026", cat: "Haber", excerpt: "Üniversite öğrencileri için etkili CV hazırlama yöntemleri, staj bulma stratejileri ve mülakat ipuçları. GKT'nin Kariyer Günleri, teknik gezileri ve mentorluk programlarıyla kariyerine nasıl yön verebileceğini keşfet.", featured: true },
  { title: "LinkedIn Profili Nasıl Optimize Edilir? Üniversite Öğrencileri İçin Rehber", slug: "linkedin-profili-nasil-optimize-edilir", date: "14 Mart 2026", cat: "Haber", excerpt: "LinkedIn profilini profesyonel bir şekilde düzenleyerek staj ve iş fırsatlarını artırabilirsin. Profil fotoğrafından başlık yazısına, deneyim bölümünden networking stratejilerine kadar adım adım rehber.", featured: true },
  { title: "Üniversitede Topluluk Üyeliğinin Kariyere 5 Büyük Katkısı", slug: "universite-topluluk-uyeligi-kariyer-katkisi", date: "12 Mart 2026", cat: "Haber", excerpt: "Bir öğrenci topluluğuna üye olmak sadece sosyalleşmek değil, kariyerinin temellerini atmak demek. İşte topluluk deneyiminin sana kazandıracağı 5 kritik beceri ve fırsat.", featured: true },
  { title: "Güz Dönemi Üye Başvuruları Başladı!", slug: "guz-donemi-uye-basvurulari-basladi", date: "10 Şubat 2026", cat: "Duyuru", excerpt: "2025–2026 Güz dönemi için topluluk üye başvuruları açıldı. Başvuru formunu doldurup GKT ailesine katılabilirsin!", featured: true },
];

export const SPONSORS = [
  { name: "Antalya Ticaret ve Sanayi Odası", logo: "/assets/sponsors/antalya-ticaret-sanayi-odasi-logo.png" },
  { name: "İŞKUR", logo: "/assets/sponsors/iskur-logo.png" },
  { name: "Altınyıldız Classics", logo: "/assets/sponsors/altinyildiz-logo.png" },
  { name: "British Express", logo: "/assets/sponsors/british-express-logo.png" },
  { name: "Mebay Medya", logo: "/assets/sponsors/mebay-logo.png" },
  { name: "3İK", logo: "/assets/sponsors/3ik-logo.png" },
  { name: "Anbean Kampüs", logo: "/assets/sponsors/anbean-kampus.png" },
];

export const INSTAGRAM_POSTS = [
  { id: "DS73h7qDOT2", type: "reel", title: "Yılbaşı Röportajı", desc: "Yeni yıl öncesi ekibimizle röportajlar", color: "from-rose-500 to-red-600" },
  { id: "DSaajCyjJga", type: "reel", title: "Kristal Endüstriyel Teknik Gezi", desc: "Kristal Endüstriyel üretim merkezi ziyareti", color: "from-emerald-500 to-teal-600" },
  { id: "DSc8r-kDIsB", type: "reel", title: "Kristal Gezi Röportajları", desc: "Teknik gezi sonrası ekip röportajları", color: "from-blue-500 to-indigo-600" },
  { id: "DScILnHDDR9", type: "p", title: "Kristal Gezi Toplu Fotoğraf", desc: "Kristal Endüstriyel ziyareti toplu fotoğraf", color: "from-violet-500 to-purple-600" },
];

export const SOCIALS = [
  { icon: Instagram, label: "Instagram", handle: "@akdenizgkt", href: "https://www.instagram.com/akdenizgkt/" },
  { icon: Youtube, label: "YouTube", handle: "Akdeniz GKT", href: "https://www.youtube.com/channel/UCBYzke_LtR9SBacQFjRo7ag" },
  { icon: Music, label: "TikTok", handle: "@gktmedya", href: "https://www.tiktok.com/@gktmedya?lang=tr-TR" },
  { icon: Twitter, label: "X (Twitter)", handle: "@AkdenizGKT", href: "https://x.com/AkdenizGKT" },
  { icon: Facebook, label: "Facebook", handle: "akdenizgkt", href: "https://www.facebook.com/akdenizgkt/?locale=tr_TR" },
  { icon: Linkedin, label: "LinkedIn", handle: "Akdeniz GKT", href: "https://www.linkedin.com/company/akdeniz-%C3%BCniversitesi-giri%C5%9Fimcilik-ve-kariyer-toplulu%C4%9Fu/" },
];

/* ══════════════════════════════════════════════════════════════
   ICON MAPPER — converts icon_name string from API to component
   ══════════════════════════════════════════════════════════════ */
export const ICON_MAP = { Sparkles, TrendingUp, Award, Users, CalendarDays, MapPin, Mail, Phone, Monitor, Handshake, Newspaper, Clock, Target, Play, Star, Zap, BookOpen, Coffee, Music, Globe, Heart, Building2, GraduationCap, Briefcase, Megaphone, Compass, Rocket, Eye };
export const getIcon = (name) => ICON_MAP[name] || Star;
