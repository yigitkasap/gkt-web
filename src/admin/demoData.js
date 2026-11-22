// DEMO MODE — örnek veriler
export const demoTeam = [
  { id: 1, name: "Örnek Başkan", role_title: "Yönetim Kurulu Başkanı", department: "Yönetim Kurulu", email: "", phone: "", image_path: "/assets/atahan_sineoglu.png", sort_order: 1, is_board: 1 },
  { id: 2, name: "Örnek Genel Koordinatör", role_title: "Genel Koordinatör", department: "Yönetim Kurulu", email: "", phone: "", image_path: "/assets/rabia_ozturk.png", sort_order: 2, is_board: 1 },
  { id: 3, name: "Örnek Başkan Yardımcısı", role_title: "Başkan Yardımcısı", department: "Yönetim Kurulu", email: "", phone: "", image_path: "/assets/elif_sude_mizrak.png", sort_order: 3, is_board: 1 },
  { id: 4, name: "Örnek Koordinatör", role_title: "Medya ve IT Koordinatörü", department: "Medya ve IT", email: "", phone: "", image_path: "/assets/melih_demir.png", sort_order: 9, is_board: 0 },
  { id: 5, name: "Örnek Koordinatör 2", role_title: "Etkinlik ve Org. Koordinatörü", department: "Etkinlik ve Organizasyon", email: "", phone: "", image_path: "/assets/doga_naz_yilmaz.png", sort_order: 6, is_board: 0 },
];

export const demoEvents = [
  { id: 1, title: "18. Ulusal Girişimcilik Zirvesi", date: "2026-04-15", location: "Kongre Merkezi", category: "Zirve", description: "Sektör liderleri, yatırımcılar ve genç girişimciler bir araya geliyor.", color: "from-red-600 to-red-500", is_upcoming: 1, sort_order: 1 },
  { id: 2, title: "CINE TALKS: Bir Filmin Anatomisi", date: "2026-03-04", location: "Hukuk Fakültesi Konferans Salonu", category: "Workshop", description: "Sinema sektöründe alanında en iyi isimleri bir araya getirdik.", color: "from-amber-500 to-orange-500", is_upcoming: 0, sort_order: 2, image_path: "/assets/events/cine-talks-ici.jpg" },
  { id: 3, title: "Genç Rota: Türkiye İş Bankası", date: "2026-03-03", location: "Yavuz Tekelioğlu Konferans Salonu", category: "Kariyer", description: "Bankacılık dünyasının kapılarını araladık.", color: "from-emerald-500 to-teal-500", is_upcoming: 0, sort_order: 3, image_path: "/assets/events/genc-rota.jpg" },
];

export const demoBlog = [
  { id: 1, title: "Etkili CV Hazırlama, Staj Bulma ve Mülakat Teknikleri", slug: "etkili-cv-hazirlama-rehberi", date: "2026-03-16", category: "Haber", excerpt: "Üniversite öğrencileri için CV hazırlama ipuçları...", is_featured: 1 },
  { id: 2, title: "LinkedIn Profili Nasıl Optimize Edilir?", slug: "linkedin-profili-nasil-optimize-edilir", date: "2026-03-14", category: "Haber", excerpt: "LinkedIn profilini profesyonel bir şekilde düzenle.", is_featured: 1 },
  { id: 3, title: "Güz Dönemi Üye Başvuruları Başladı!", slug: "guz-donemi-uye-basvurulari-basladi", date: "2026-02-10", category: "Duyuru", excerpt: "Topluluk üye başvuruları açıldı.", is_featured: 1 },
];

export const demoSponsors = [
  { id: 1, name: "Antalya Ticaret ve Sanayi Odası", logo_path: "/assets/antalya-ticaret-sanayi-odasi-logo.png", sort_order: 1 },
  { id: 2, name: "İŞKUR", logo_path: "/assets/iskur-logo.png", sort_order: 2 },
  { id: 3, name: "Altınyıldız Classics", logo_path: "/assets/altinyildiz-logo.png", sort_order: 3 },
];

export const demoMessages = [
  { id: 1, name: "Ali Yılmaz", email: "ali@ornek.com", phone: "", subject: "Üyelik Başvurusu", message: "Merhaba, topluluğunuza katılmak istiyorum. Başvuru süreci hakkında bilgi alabilir miyim?", is_read: 0, created_at: "2026-03-16 14:30:00" },
  { id: 2, name: "Ayşe Kaya", email: "ayse@ornek.com", phone: "", subject: "Sponsorluk Teklifi", message: "Firmamız adına sponsorluk hakkında bilgi almak istiyoruz.", is_read: 1, created_at: "2026-03-15 10:15:00" },
  { id: 3, name: "Mehmet Demir", email: "mehmet@ornek.com", phone: "", subject: "Etkinlik Sorusu", message: "18. UGZ'ye katılım ücreti var mı? Kayıt nasıl yapılıyor?", is_read: 0, created_at: "2026-03-14 16:45:00" },
];

export const demoMilestones = [
  { id: 1, year: "2002", title: "Kuruluş", description: "Bir avuç girişimci ruhlu öğrenci tarafından kuruldu.", sort_order: 1 },
  { id: 2, year: "2012", title: "İlk Ulusal Zirve", description: "İlk Ulusal Girişimcilik Zirvesi 500+ katılımcıyla gerçekleşti.", sort_order: 2 },
  { id: 3, year: "2024", title: "Rekor Katılım", description: "17. Zirve — 3.000+ katılımcı ile tarihî rekor.", sort_order: 3 },
];

export const demoActivities = [
  { id: 1, title: "Kariyer Günleri", description: "50+ firma ile birebir görüşme imkanı.", icon_name: "GraduationCap", image_path: "/assets/kariyer-gunleri.jpg", sort_order: 1 },
  { id: 2, title: "Ulusal Girişimcilik Zirvesi", description: "Türkiye'nin en büyük öğrenci girişimcilik etkinliği.", icon_name: "TrendingUp", image_path: "/assets/ugz-zirve.jpg", sort_order: 2 },
];

export const demoSettings = [
  { key: "stat_year", value: "24" },
  { key: "stat_members", value: "6000" },
  { key: "stat_events", value: "200" },
  { key: "stat_partners", value: "50" },
];

export const demoUsers = [
  { id: 1, username: "admin", display_name: "Başkan", role: "admin", department: null, created_at: "2026-01-01" },
  { id: 2, username: "medya-koord", display_name: "Medya Koordinatör", role: "koordinator", department: "Medya ve IT", created_at: "2026-01-15" },
  { id: 3, username: "etkinlik-koord", display_name: "Etkinlik Koordinatör", role: "koordinator", department: "Etkinlik ve Organizasyon", created_at: "2026-01-15" },
];

export const demoUGZSettings = [
  { key: 'ugz_title', value: '18. Ulusal Girişimcilik Zirvesi' },
  { key: 'ugz_subtitle', value: "Türkiye'nin en büyük öğrenci girişimcilik etkinliği" },
  { key: 'ugz_date', value: '2026-04-15' },
  { key: 'ugz_time', value: '09:00' },
  { key: 'ugz_location', value: 'Kongre Merkezi, Antalya' },
  { key: 'ugz_registration_open', value: 'false' },
  { key: 'ugz_registration_url', value: '' },
  { key: 'ugz_speakers_visible', value: 'true' },
  { key: 'ugz_program_visible', value: 'true' },
  { key: 'ugz_sponsors_visible', value: 'true' },
  { key: 'ugz_countdown_visible', value: 'true' },
  { key: 'ugz_page_active', value: 'true' },
];

export const demoUGZSpeakers = [
  { id: 1, name: "Örnek Konuşmacı", title: "CEO", company: "Firma A", image_path: "", bio: "Deneyimli iş insanı.", sort_order: 1, is_visible: 1 },
];

export const demoUGZProgram = [
  { id: 1, time: "09:00 - 09:30", title: "Açılış Konuşması", description: "", speaker_name: "Örnek Başkan", session_type: "opening", sort_order: 1, is_visible: 1 },
  { id: 2, time: "09:30 - 10:30", title: "Keynote: Girişimciliğin Geleceği", description: "", speaker_name: "Örnek Konuşmacı", session_type: "keynote", sort_order: 2, is_visible: 1 },
  { id: 3, time: "10:30 - 11:00", title: "Kahve Arası", description: "", speaker_name: "", session_type: "break", sort_order: 3, is_visible: 1 },
];

export const demoUGZSponsors = [
  { id: 1, name: "Ana Sponsor Firma", logo_path: "", tier: "main", website_url: "", sort_order: 1, is_visible: 1 },
  { id: 2, name: "Altın Sponsor 1", logo_path: "", tier: "gold", website_url: "", sort_order: 2, is_visible: 1 },
];

export const demoMedia = {
  files: [
    { filename: "demo-photo-1.jpg", path: "/assets/uploads/demo-photo-1.jpg", size: 245000, sizeFormatted: "245 KB", type: "image/jpeg", createdAt: "2026-03-16T12:00:00Z", usedIn: [{ type: "team", id: 1, label: "Ekip: Örnek Başkan" }] },
    { filename: "demo-photo-2.jpg", path: "/assets/uploads/demo-photo-2.jpg", size: 180000, sizeFormatted: "180 KB", type: "image/jpeg", createdAt: "2026-03-15T10:00:00Z", usedIn: [] },
    { filename: "demo-logo.png", path: "/assets/uploads/demo-logo.png", size: 52000, sizeFormatted: "52 KB", type: "image/png", createdAt: "2026-03-14T08:00:00Z", usedIn: [{ type: "sponsor", id: 1, label: "Sponsor: Baglofy" }] },
  ],
  stats: { total: 3, totalSize: "477 KB", totalSizeBytes: 477000, used: 2, unused: 1 }
};

export const demoStats = { team: 17, events: 10, blog: 4, unread: 2 };
