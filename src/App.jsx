import { useState, useEffect, useRef, lazy, Suspense } from "react";
import useInView from './useInView';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SiteDataProvider, useSiteData } from "./contexts/SiteDataContext";
import { fetchTeam, fetchEvents, fetchBlog, fetchSponsors, fetchMilestones, fetchActivities, fetchRaffles, postMessage } from "./api";
import { Helmet } from 'react-helmet-async';
const AdminApp = lazy(() => import("./admin/AdminApp"));
const SuperLogin = lazy(() => import("./admin/SuperLogin"));
const BlogDetailPage = lazy(() => import('./BlogDetailPage'));
const ClubCardPage = lazy(() => import('./ClubCardPage'));
import {
  Menu, X, ArrowRight, ChevronRight, Sparkles, TrendingUp, Award,
  Users, CalendarDays, MapPin, Mail, Phone, Send, CheckCircle, Eye, Target,
  Monitor, Handshake, Newspaper, Clock, User, ArrowUpRight, ExternalLink, Instagram,
  Youtube, Linkedin, Facebook, Star, Zap, Building2, Briefcase, Gift, Trophy
} from "lucide-react";
import { NAV, PATHS, STATS, ACTIVITIES, EVENTS_UPCOMING, EVENTS_PAST, DEPARTMENTS, TEAM, MILESTONES, BLOG_POSTS, SPONSORS, INSTAGRAM_POSTS, SOCIALS, ICON_MAP, getIcon } from './fallbackData';
import { EventIllustration, BlogIllustration } from './illustrations';

const sanitizeUrl = (url) => {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return '#';
};

/* ══════════════════════════════════════════════════════════════
   SKELETON HELPERS
   ══════════════════════════════════════════════════════════════ */
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="w-2/3 h-4 bg-gray-100 rounded" />
      <div className="w-full h-3 bg-gray-50 rounded" />
      <div className="w-4/5 h-3 bg-gray-50 rounded" />
    </div>
  </div>
);

const UpcomingEmpty = () => (
  <div className="md:col-span-3 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
    <CalendarDays className="w-7 h-7 text-red-300 mx-auto mb-3" />
    <p className="font-display font-bold text-slate-900">Yeni dönem etkinlikleri yakında</p>
    <p className="mt-1.5 text-sm text-slate-400">Takvim netleştikçe burada duyuracağız. Güncel duyurular için <a href="https://www.instagram.com/akdenizgkt/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600 font-semibold">@akdenizgkt</a> hesabını takip et.</p>
  </div>
);

const TeamSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="w-3/4 h-4 bg-gray-100 rounded" />
      <div className="w-1/2 h-3 bg-gray-50 rounded" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
   ══════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    .font-display { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes fadeUp { 0% { opacity:0; transform:translateY(20px); } 100% { opacity:1; transform:translateY(0); } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
    @keyframes slideIn { 0% { opacity:0; transform:translateX(-16px); } 100% { opacity:1; transform:translateX(0); } }
    @keyframes scaleIn { 0% { opacity:0; transform:scale(0.95); } 100% { opacity:1; transform:scale(1); } }
    @keyframes slideUp { 0% { opacity:0; transform:translateY(100%); } 100% { opacity:1; transform:translateY(0); } }
    .anim-slide-up { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
    .anim-fade { animation: fadeUp 0.5s ease-out forwards; will-change: transform, opacity; }
    .anim-float { animation: float 5s ease-in-out infinite; will-change: transform; }
    .anim-slide { animation: slideIn 0.4s ease-out forwards; will-change: transform, opacity; }
    .anim-scale { animation: scaleIn 0.4s ease-out forwards; will-change: transform, opacity; }
    .anim-pulse { animation: pulse 2s ease-in-out infinite; will-change: opacity; }
    @media (prefers-reduced-motion: reduce) { .anim-fade, .anim-float, .anim-slide, .anim-scale, .anim-pulse { animation: none !important; opacity: 1 !important; } }
    .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .line-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
    .bg-grid { background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 48px 48px; }
    .bg-dots { background-image: radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px); background-size: 20px 20px; }
    .scrollbar-thin::-webkit-scrollbar { width: 6px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
    ::selection { background: rgba(220,38,38,0.15); }
  `}</style>
);

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}><AdminApp /></Suspense>} />
        <Route path="/superadmin" element={<Suspense fallback={null}><SuperLogin /></Suspense>} />
        {/* UGZ sayfası kaldırıldı (Kasım 2026); eski linkler ana sayfaya gider. */}
        <Route path="/ugz" element={<Navigate to="/" replace />} />
        <Route path="/*" element={<SiteDataProvider><MainLayout /></SiteDataProvider>} />
      </Routes>
    </BrowserRouter>
  );
}

function MainLayout() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const { settings } = useSiteData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem("gkt-cookie-consent"));
  const mainRef = useRef(null);

  const pathToId = Object.fromEntries(Object.entries(PATHS).map(([k, v]) => [v, k]));
  const activePage = pathToId[location.pathname] || "home";

  // Raffle page visibility is driven by an admin toggle in the settings table;
  // it is absent from the nav (and unreachable) when the toggle is 'false'.
  const rafflesActive = settings.raffles_page_active === 'true';
  const visibleNav = rafflesActive
    ? [...NAV.slice(0, 5), { label: "Çekiliş", id: "cekilis", path: PATHS.cekilis }, ...NAV.slice(5)]
    : NAV;

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 30); setShowScrollTop(window.scrollY > 600); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/
  const navigate = (id) => {
    routerNavigate(PATHS[id] || "/");
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <GlobalStyles />

      {/* ═══════ NAVBAR ═══════ */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-white/60 backdrop-blur-md"}`} style={{ minHeight: 64 }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between" style={{ height: 64 }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/assets/logo_gkt.png" alt="Akdeniz GKT" className="w-9 h-9 rounded-full object-cover shadow-lg shadow-red-600/20 group-hover:shadow-red-600/40 transition-shadow" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-display font-bold text-xs text-slate-900 tracking-tight leading-tight text-left">Akdeniz Üniversitesi</span>
              <span className="text-[9px] text-slate-500 font-semibold tracking-wide text-left">Girişimcilik ve Kariyer Topluluğu</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {visibleNav.map(n => (
              <Link key={n.id} to={n.path} className={`relative px-3 py-2 text-xs font-display font-medium rounded-lg transition-all no-underline ${activePage === n.id ? "text-red-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                {n.label}
                {activePage === n.id && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-red-500 rounded-full" />}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            <Link to="/iletisim" className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all active:scale-[0.97] no-underline">
              Bize Ulaşın
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"} className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
              {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ MOBILE MENU ═══════ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ top: 64 }}>
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-full max-w-xs h-full bg-white shadow-2xl flex flex-col p-6 pt-4 anim-slide" style={{ animationDuration: "0.25s" }}>
            <nav className="flex flex-col gap-1 flex-1">
              {visibleNav.map((n, i) => (
                <Link key={n.id} to={n.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-display font-medium transition-all anim-fade no-underline ${activePage === n.id ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50"}`} style={{ animationDelay: `${i * 50}ms` }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activePage === n.id ? "bg-red-500" : "bg-slate-200"}`} />
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link to="/iletisim" onClick={() => setMobileOpen(false)} className="w-full py-3.5 bg-red-500 text-white text-base font-display font-semibold rounded-xl mt-4 text-center block no-underline">Sen de GKT'li Ol</Link>
          </div>
        </div>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main ref={mainRef} className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage navigate={navigate} />} />
          <Route path="/hakkimizda" element={<HakkimizdaPage navigate={navigate} />} />
          <Route path="/etkinlikler" element={<EtkinliklerPage />} />
          <Route path="/departmanlar" element={<DepartmanlarPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}><BlogDetailPage /></Suspense>} />
          <Route path="/iletisim" element={<IletisimPage navigate={navigate} />} />
          <Route path="/clubcard" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}><ClubCardPage /></Suspense>} />
          {/* Basılı kartlardaki QR kod /clupkart adresine gidiyor — kaldırma. */}
          {["/clupkart", "/clubkart", "/clup-kart", "/club-card", "/clup-card"].map(p => <Route key={p} path={p} element={<Navigate to="/clubcard" replace />} />)}
          <Route path="/cekilis" element={<CekilisPage active={rafflesActive} navigate={navigate} />} />
          {/* Backwards-compat redirect from old URL */}
          <Route path="/cekilis-sonuclari" element={<Navigate to="/cekilis" replace />} />
          <Route path="/gizlilik" element={<GizlilikPage navigate={navigate} />} />
          <Route path="/kullanim-sartlari" element={<KullanimSartlariPage navigate={navigate} />} />
          <Route path="/kvkk" element={<KVKKPage navigate={navigate} />} />
          <Route path="/cerez" element={<CerezPage navigate={navigate} />} />
          <Route path="*" element={<NotFoundPage navigate={navigate} />} />
        </Routes>
        <Footer navigate={navigate} />
      </main>

      {/* ═══════ COOKIE CONSENT ═══════ */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6 anim-slide-up" style={{ animationDelay: "1s" }}>
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-white font-display font-semibold mb-1">Çerez Kullanımı</p>
              <p className="text-xs text-white/50 leading-relaxed">Web sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz. Detaylı bilgi için <button onClick={() => navigate("cerez")} className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">Çerez Politikamızı</button> inceleyebilirsiniz.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button onClick={() => { localStorage.setItem("gkt-cookie-consent", "rejected"); setCookieConsent("rejected"); }} aria-label="Çerezleri reddet" className="px-4 py-2 text-xs font-display font-semibold text-white/50 hover:text-white rounded-xl hover:bg-white/10 transition-all">Reddet</button>
              <button onClick={() => { localStorage.setItem("gkt-cookie-consent", "accepted"); setCookieConsent("accepted"); }} aria-label="Çerezleri kabul et" className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all active:scale-[0.97]">Kabul Et</button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Sayfanın başına dön"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center transition-all duration-300 active:scale-90 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ChevronRight className="w-5 h-5 -rotate-90" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: HOME
   ══════════════════════════════════════════════════════════════ */
function CountUp({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target.replace(/[^0-9]/g, '')) || 0;
    if (num === 0) { setCount(target); return; }
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{typeof count === 'number' ? count + suffix : count}</span>;
}

function HomePage({ navigate }) {
  const { settings } = useSiteData();
  const [selectedActivity, setSelectedActivity] = useState(null);

  // API data
  const [apiActivities, setApiActivities] = useState(null);
  const [apiSponsors, setApiSponsors] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [apiUpcoming, setApiUpcoming] = useState(null);
  const [apiBlog, setApiBlog] = useState(null);

  useEffect(() => {
    fetchActivities().then(d => Array.isArray(d) && d.length > 0 && setApiActivities(d)).catch(() => {});
    fetchSponsors().then(d => Array.isArray(d) && d.length > 0 && setApiSponsors(d)).catch(() => {});
    // Yaklaşan etkinliklerde eski yedek veriye düşülmez (yanıltıcı olur): boşsa "yakında" gösterilir.
    fetchEvents('upcoming=1&limit=3').then(d => setApiUpcoming(Array.isArray(d) ? d : [])).catch(() => setApiUpcoming([]));
    fetchBlog('limit=3').then(d => Array.isArray(d) && d.length > 0 && setApiBlog(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (settings.stat_year) {
      const fmt = (v) => v && !String(v).includes('+') ? v + '+' : v;
      setApiStats([
        { value: fmt(settings.stat_year), label: "Yıllık Deneyim", icon: Award },
        { value: fmt(settings.stat_members), label: "Toplam Üye", icon: Users },
        { value: fmt(settings.stat_events), label: "Etkinlik", icon: CalendarDays },
        { value: fmt(settings.stat_partners), label: "Kurumsal Paydaş", icon: Building2 },
      ]);
    }
  }, [settings]);

  const currentStats = apiStats || STATS;
  const currentActivities = apiActivities ? apiActivities.map(a => ({ ...a, icon: getIcon(a.icon_name), image: a.image_path, desc: a.description })) : ACTIVITIES;
  const currentSponsors = apiSponsors ? apiSponsors.map(s => ({ name: s.name, logo: s.logo_path })) : SPONSORS;

  return (
    <>
      <Helmet>
        <title>Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu | GKT</title>
        <meta name="description" content="2002'den bu yana Akdeniz Üniversitesi öğrencilerine kariyer rehberliği, girişimcilik kültürü ve profesyonel gelişim fırsatları sunan öğrenci topluluğu." />
        <link rel="canonical" href="https://akdenizgkt.com/" />
        <meta property="og:title" content="Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu" />
        <meta property="og:description" content="2002'den bu yana öğrencilerin kariyer yolculuğuna rehberlik ediyoruz." />
        <meta property="og:image" content="https://akdenizgkt.com/assets/logo_gkt.png" />
        <meta property="og:url" content="https://akdenizgkt.com/" />
        <meta property="og:site_name" content="Akdeniz GKT" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":"Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu","alternateName":"Akdeniz GKT","url":"https://akdenizgkt.com","logo":"https://akdenizgkt.com/assets/logo_gkt.png","foundingDate":"2002","address":{"@type":"PostalAddress","addressLocality":"Antalya","addressCountry":"TR"},"sameAs":["https://www.instagram.com/akdenizgkt/","https://www.youtube.com/channel/UCBYzke_LtR9SBacQFjRo7ag","https://www.linkedin.com/company/akdeniz-%C3%BCniversitesi-giri%C5%9Fimcilik-ve-kariyer-toplulu%C4%9Fu/","https://x.com/AkdenizGKT","https://www.facebook.com/akdenizgkt/","https://www.tiktok.com/@gktmedya"]})}</script>
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"GKT nedir?","acceptedAnswer":{"@type":"Answer","text":"Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu, 2002 yılında kurulmuş, öğrencilere kariyer rehberliği sunan bir öğrenci topluluğudur. Kariyer günleri, girişimcilik zirveleri, teknik geziler ve sosyal sorumluluk projeleri düzenler."}},{"@type":"Question","name":"GKT'ye nasıl üye olunur?","acceptedAnswer":{"@type":"Answer","text":"Her dönem başında üye başvuru formu açılır. akdenizgkt.com adresinden veya Instagram @akdenizgkt hesabından duyurular takip edilebilir. Başvuru formu doldurulduktan sonra mülakat süreciyle üye alımı gerçekleşir."}},{"@type":"Question","name":"GKT'nin departmanları nelerdir?","acceptedAnswer":{"@type":"Answer","text":"Dört ana departman vardır: Medya ve IT, Etkinlik ve Organizasyon, Kurumsal İlişkiler ve Üye İlişkileri."}},{"@type":"Question","name":"Ulusal Girişimcilik Zirvesi nedir?","acceptedAnswer":{"@type":"Answer","text":"Her yıl düzenlenen, Türkiye'nin en büyük öğrenci girişimcilik etkinliğidir."}},{"@type":"Question","name":"GKT etkinliklerine katılmak için üye olmak gerekir mi?","acceptedAnswer":{"@type":"Answer","text":"Çoğu etkinlik tüm Akdeniz Üniversitesi öğrencilerine açıktır. Bazı özel workshop'lar sadece üyelere özeldir."}},{"@type":"Question","name":"GKT ile nasıl iletişime geçebilirim?","acceptedAnswer":{"@type":"Answer","text":"Web sitemizdeki iletişim formu, info@akdenizgkt.com e-posta adresi veya sosyal medya hesaplarımız üzerinden bize ulaşabilirsiniz."}}]})}</script>
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","speakable":{"@type":"SpeakableSpecification","cssSelector":[".hero-description",".faq-answer"]}})}</script>
      </Helmet>

      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-grid" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl anim-fade">
              <h1 className="font-display font-extrabold text-white leading-[1.08] tracking-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}>
                Geleceği{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">inşa</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-red-500/20 rounded" />
                </span>
                <br />edenler burada.
              </h1>
              <p className="hero-description mt-6 text-lg text-white/45 leading-relaxed max-w-md">
                Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu olarak 2002'den bu yana binlerce öğrencinin kariyer yolculuğuna rehberlik ediyoruz.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-10">
                <button onClick={() => navigate("etkinlikler")} className="flex items-center gap-2 px-7 py-3.5 bg-red-500 hover:bg-red-600 text-white font-display font-semibold rounded-xl shadow-xl shadow-red-500/25 transition-all active:scale-[0.97]">
                  Etkinlikleri Keşfet <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate("hakkimizda")} className="flex items-center gap-2 px-6 py-3.5 text-white/60 hover:text-white font-display font-semibold rounded-xl hover:bg-white/5 transition-all">
                  Bizi Tanı <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logo Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square anim-scale" style={{ animationDelay: "0.2s" }}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 flex items-center justify-center p-12">
                  <img src="/assets/logo_gkt.png" alt="Akdeniz GKT Logo" className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <div className="absolute -top-3 -right-3 w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center" style={{ animationDelay: "1.5s" }}>
                  <Award className="w-5 h-5 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* STATS */}
      <section className="relative -mt-14 z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {currentStats.map((s, i) => (
            <div key={s.label || i} className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-slate-900/5 p-5 md:p-7 text-center group hover:border-red-200 transition-all anim-fade" style={{ animationDelay: `${i * 80}ms` }}>
              <s.icon className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-display font-extrabold text-slate-900"><CountUp target={s.value} suffix="+" /></div>
              <p className="mt-1 text-xs text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Neler Yapıyoruz" title="Kampüsün Nabzı Burada Atıyor" desc="Zirvelerden kariyer günlerine, teknik gezilerden sosyal sorumluluk projelerine geniş bir yelpaze." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/ */}
            {currentActivities.map((a, i) => (
              <div key={a.title || i} onClick={() => setSelectedActivity(a)} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all anim-fade cursor-pointer" style={{ animationDelay: `${i * 60}ms` }}>
                {a.image ? (
                  <div className="relative h-44 overflow-hidden">
                    <img src={a.image} alt={a.title} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center">
                        <a.icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-display font-bold text-white">{a.title}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-44 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                    <a.icon className="w-10 h-10 text-red-300" />
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-sm font-display font-bold text-red-600">{a.title}</h3>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITY MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedActivity(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl anim-scale" onClick={e => e.stopPropagation()}>
            {selectedActivity.image && (
              <div className="relative h-64 overflow-hidden">
                <img src={selectedActivity.image} alt={selectedActivity.title} loading="lazy" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center">
                    <selectedActivity.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">{selectedActivity.title}</h3>
                </div>
              </div>
            )}
            <button onClick={() => setSelectedActivity(null)} aria-label="Kapat" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">{selectedActivity.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* UPCOMING EVENTS */}
      <section className="py-16 md:py-24 bg-slate-50 bg-dots">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Etkinlikler" title="Yaklaşan Etkinlikler" desc="Takvimini şimdiden ayarla. Geri sayım başladı." />
          <div className="grid md:grid-cols-3 gap-5">
            {apiUpcoming === null && [0, 1, 2].map(i => <CardSkeleton key={i} />)}
            {apiUpcoming?.length === 0 && <UpcomingEmpty />}
            {(apiUpcoming || []).map((ev, i) => (
              <div key={ev.id || ev.title || i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all anim-fade" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`h-44 bg-gradient-to-br ${ev.color || 'from-red-500 to-rose-600'} flex items-center justify-center relative overflow-hidden`}>
                  {ev.image_path ? (
                    <img src={ev.image_path} alt={ev.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <EventIllustration category={ev.cat || ev.category} title={ev.title} />
                  )}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="inline-block px-2 py-0.5 bg-white/25 rounded-full text-[10px] font-display font-bold text-white">{ev.cat || ev.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-slate-900 text-base">{ev.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{ev.desc || ev.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {ev.date}</span>
                    {(ev.loc || ev.location) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.loc || ev.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate("etkinlikler")} className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm font-display font-semibold rounded-xl transition-all">
              Tüm Etkinlikler <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* DUYURULAR */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Duyurular" title="Son Duyurular" desc="Topluluğumuzdan en güncel duyurular ve haberler." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(apiBlog || BLOG_POSTS).map((p, i) => (
              <Link key={p.id || p.slug || i} to={'/blog/' + (p.slug || p.title?.toLowerCase().replace(/\s+/g, '-'))} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all anim-fade no-underline flex flex-col" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-[16/10] rounded-t-2xl overflow-hidden">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <BlogIllustration category={p.cat || p.category} slug={p.slug} />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-display font-bold">{p.cat || p.category}</span>
                    <span className="text-[10px] text-slate-400">{p.date}</span>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-sm leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 flex-1">{p.excerpt}</p>
                  <span className="text-xs font-display font-semibold text-red-500 mt-3 inline-block">Devamını Oku →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate("blog")} className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm font-display font-semibold rounded-xl transition-all">
              Tüm Duyurular <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SPONSORS + SOSYAL MEDYA — combined */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Paydaşlarımız" title="Sponsor ve Paydaşlarımız" desc="Etkinliklerimizi hayata geçiren değerli kurumsal paydaşlarımız." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentSponsors.map((s, i) => (
              <div key={s.name || i} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 bg-white hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                <img src={s.logo} alt={s.name + " logosu"} loading="lazy" className="h-16 w-auto object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 mb-3" />
                <p className="text-[11px] font-display font-semibold text-slate-400 text-center group-hover:text-slate-600 transition-colors">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="SSS" title="Sıkça Sorulan Sorular" desc="Merak ettiğin her şey burada." />
          <FAQSection items={[
            { q: "GKT nedir?", a: "Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu, 2002 yılında kurulmuş, öğrencilere kariyer rehberliği sunan bir öğrenci topluluğudur. Kariyer günleri, girişimcilik zirveleri, teknik geziler ve sosyal sorumluluk projeleri düzenler." },
            { q: "GKT'ye nasıl üye olunur?", a: "Her dönem başında üye başvuru formu açılır. akdenizgkt.com adresinden veya Instagram @akdenizgkt hesabından duyurular takip edilebilir. Başvuru formu doldurulduktan sonra mülakat süreciyle üye alımı gerçekleşir." },
            { q: "GKT'nin departmanları nelerdir?", a: "Dört ana departman vardır: Medya ve IT (dijital iletişim, tasarım), Etkinlik ve Organizasyon (zirve, konferans planlama), Kurumsal İlişkiler (sponsorluk, paydaş yönetimi) ve Üye İlişkileri (üye adaptasyonu, sosyal etkinlikler)." },
            { q: "Ulusal Girişimcilik Zirvesi nedir?", a: "Her yıl düzenlenen, Türkiye'nin en büyük öğrenci girişimcilik etkinliğidir. 2025'teki 17. Zirve'ye 3.000'den fazla katılımcı ve 40'tan fazla konuşmacı katılmıştır." },
            { q: "GKT etkinliklerine katılmak için üye olmak gerekir mi?", a: "Çoğu etkinlik tüm Akdeniz Üniversitesi öğrencilerine açıktır. Ancak bazı özel workshop'lar ve iç etkinlikler sadece üyelere özeldir." },
            { q: "GKT ile nasıl iletişime geçebilirim?", a: "Web sitemizdeki iletişim formu, info@akdenizgkt.com e-posta adresi veya sosyal medya hesaplarımız üzerinden bize ulaşabilirsiniz." },
          ]} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700" />
        <div className="absolute inset-0 bg-grid" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24 text-center">
          <p className="font-display font-extrabold text-white leading-tight mx-auto" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", maxWidth: 600 }}>
            Kariyerine yön verecek topluluğa katıl.
          </p>
          <p className="mt-4 text-lg text-white/60 max-w-lg mx-auto">Binlerce Akdenizli öğrenciyle girişimcilik ekosisteminin bir parçası ol.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <button onClick={() => navigate("iletisim")} className="flex items-center gap-2 px-8 py-4 bg-white text-red-600 hover:bg-white/90 font-display font-bold rounded-xl shadow-xl shadow-red-900/20 text-base transition-all active:scale-[0.97]">
              Hemen Sen de GKT'li Ol <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate("hakkimizda")} className="flex items-center gap-2 px-7 py-4 text-white/70 hover:text-white border-2 border-white/20 hover:border-white/40 font-display font-semibold rounded-xl hover:bg-white/10 transition-all">
              Daha Fazla Bilgi
            </button>
          </div>
          <div className="flex items-center justify-center gap-2.5 mt-10">
            {[
              { icon: Instagram, href: "https://www.instagram.com/akdenizgkt/", label: "Instagram" },
              { icon: Youtube, href: "https://www.youtube.com/channel/UCBYzke_LtR9SBacQFjRo7ag", label: "YouTube" },
              { icon: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, href: "https://x.com/AkdenizGKT", label: "X" },
              { icon: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.5V7.12a4.83 4.83 0 01-1-.43z"/></svg>, href: "https://www.tiktok.com/@gktmedya", label: "TikTok" },
              { icon: Facebook, href: "https://www.facebook.com/akdenizgkt/", label: "Facebook" },
              { icon: Linkedin, href: "https://www.linkedin.com/company/akdeniz-%C3%BCniversitesi-giri%C5%9Fimcilik-ve-kariyer-toplulu%C4%9Fu/", label: "LinkedIn" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} aria-label={s.label} className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-all duration-200">
                <s.icon className="w-4 h-4 text-white/50" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/30">veya <a href={"mailto:" + (settings.contact_email || "info@akdenizgkt.com")} className="text-white/50 hover:text-white underline underline-offset-2 transition-colors no-underline">{settings.contact_email || "info@akdenizgkt.com"}</a> adresinden bize ulaşın.</p>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: HAKKIMIZDA
   ══════════════════════════════════════════════════════════════ */
function HakkimizdaPage({ navigate }) {
  const [apiTeam, setApiTeam] = useState(null);
  const [apiMilestones, setApiMilestones] = useState(null);

  useEffect(() => {
    fetchTeam().then(d => Array.isArray(d) && d.length > 0 && setApiTeam(d.map(m => ({ name: m.name, role: m.role_title, image: m.image_path, phone: m.phone, email: m.email })))).catch(() => {});
    fetchMilestones().then(d => Array.isArray(d) && d.length > 0 && setApiMilestones(d.map((m, i) => ({ year: m.year, title: m.title, text: m.description, icon: Star, color: MILESTONES[i]?.color || "from-red-500 to-rose-600" })))).catch(() => {});
  }, []);

  const currentTeam = apiTeam || TEAM;
  const currentMilestones = apiMilestones || MILESTONES;

  return (
    <>
      <Helmet>
        <title>Hakkımızda | Akdeniz GKT</title>
        <meta name="description" content="Akdeniz Üniversitesi GKT'nin vizyonu, misyonu, yönetim kurulu ve 2002'den bugüne tarihçesi." />
        <link rel="canonical" href="https://akdenizgkt.com/hakkimizda" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Anasayfa","item":"https://akdenizgkt.com/"},{"@type":"ListItem","position":2,"name":"Hakkımızda","item":"https://akdenizgkt.com/hakkimizda"}]})}</script>
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"GKT kaç yıldır faaliyet gösteriyor?","acceptedAnswer":{"@type":"Answer","text":"2002 yılında kurulmuştur, 24 yılı aşkın deneyime sahiptir."}},{"@type":"Question","name":"GKT'nin vizyonu nedir?","acceptedAnswer":{"@type":"Answer","text":"Girişimci, akılcı, ilkeli ve sorumlu yaklaşımla Türkiye'nin önde gelen öğrenci topluluğu olmak."}},{"@type":"Question","name":"GKT'de hangi becerileri kazanabilirim?","acceptedAnswer":{"@type":"Answer","text":"Takım çalışması, proje yönetimi, liderlik, etkinlik organizasyonu, kurumsal iletişim, dijital pazarlama, grafik tasarım ve networking becerileri."}}]})}</script>
      </Helmet>
      <PageHeader icon={Users} badge="Hakkımızda" title="Biz Kimiz?" desc="2002 yılından bu yana Akdeniz Üniversitesi öğrencilerine hem akademik hem de iş yaşamlarına destek olmak, girişimcilik kültürünü yaymak ve sosyal sorumluluk alanında duyarlı bireyler yetiştirmek amacıyla faaliyet yürütüyoruz." />

      {/* Vision / Mission */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-gray-100 bg-slate-50 hover:border-red-200 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Eye className="w-6 h-6 text-red-600" /></div>
              <h2 className="text-xl font-display font-bold text-slate-900 mb-3">Vizyonumuz</h2>
              <p className="text-slate-500 leading-relaxed text-sm">Girişimci, akılcı, ilkeli ve sorumlu yaklaşımımızla alışılmışın dışında Türkiye'nin önde gelen öğrenci topluluğu olmak.</p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-100 bg-slate-50 hover:border-red-200 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Target className="w-6 h-6 text-slate-600" /></div>
              <h2 className="text-xl font-display font-bold text-slate-900 mb-3">Misyonumuz</h2>
              <p className="text-slate-500 leading-relaxed text-sm">Girişimci ve yenilikçi ruha sahip, toplumsal değerlere bağlı, iyi eğitimli sosyal bireylerin yetişmesine ve her bir üyesinin networkünü, vizyonunu ve entelektüel sermayesini genişletmesine fırsat sağlamak ve öncülük etmek.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-28 bg-slate-50 bg-dots">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Ekibimiz" title="Yönetim Kadromuz" desc="Topluluğumuzun yönetim kadrosunu tanıyın." />
          {(() => {
            const TeamCard = ({ m, i }) => (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl transition-all group anim-fade flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="aspect-square overflow-hidden relative">
                  <img src={m.image} alt={m.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(220,38,38,0.12) 0%, transparent 60%)" }} />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-slate-900 text-sm leading-tight">{m.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.role}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <a href={`mailto:${m.email}`} title={m.email} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Mail className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                    </a>
                    {m.role === "Yönetim Kurulu Başkanı" && m.phone && <a href={`tel:${m.phone}`} title={m.phone} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Phone className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                    </a>}
                    <a href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(m.name)}`} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 flex items-center justify-center transition-colors">
                      <Linkedin className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            );
            const yonetim = currentTeam.slice(0, 3);
            const denetim = currentTeam.filter(m => m.role && m.role.includes('Denetim'));
            const yurutme = currentTeam.slice(3).filter(m => !m.role || !m.role.includes('Denetim'));
            const cardWidth = "w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] md:w-[calc(25%-15px)]";
            return (
              <>
                <div className="sm:flex sm:justify-center sm:gap-5 hidden">
                  {[yonetim[0], yonetim[2], yonetim[1]].map((m, i) => <div key={m.name || i} className={cardWidth}><TeamCard m={m} i={i} /></div>)}
                </div>
                <div className="flex flex-col items-center gap-5 sm:hidden">
                  <div className={cardWidth}><TeamCard m={yonetim[0]} i={0} /></div>
                  <div className="flex justify-center gap-5 w-full flex-row-reverse">
                    {yonetim.slice(1).map((m, i) => <div key={m.name || i} className={cardWidth}><TeamCard m={m} i={i + 1} /></div>)}
                  </div>
                </div>
                {denetim.length > 0 && (
                  <div className="mt-16">
                    <SectionTitle badge="Ekibimiz" title="Denetim Kurulu" desc="Topluluğumuzun denetim kurulu üyeleri." />
                    <div className="flex justify-center gap-5 flex-wrap">
                      {denetim.map((m, i) => <div key={m.name || i} className={cardWidth}><TeamCard m={m} i={i + 3} /></div>)}
                    </div>
                  </div>
                )}
                <div className="mt-16">
                  <SectionTitle badge="Ekibimiz" title="Yürütme Kadromuz" desc="Koordinatörler ve takım direktörlerimiz." />
                  <div className="flex justify-center gap-5 flex-wrap">
                    {yurutme.map((m, i) => <div key={m.name || i} className={cardWidth}><TeamCard m={m} i={i + 5} /></div>)}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Yolculuğumuz" title="Tarihçe" desc="2002'den bugüne dönüm noktalarımız." />

          {/* Shared visual card renderer */}
          {(() => {
            const MilestoneCard = ({ m, i, size = "lg" }) => {
              const scenes = [
                /* 2002 - Kuruluş */
                <div className="w-full h-full bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl overflow-hidden flex flex-col items-center justify-between py-[15%]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-rose-300/50 rounded-full" />
                    <Sparkles className="w-4 h-4 text-amber-400/50" />
                    <div className="w-1.5 h-1.5 bg-red-300/40 rounded-full" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-red-200/30 flex items-center justify-center">
                    <Star className="w-8 h-8 text-red-400/70" />
                  </div>
                  <span className="font-display font-extrabold text-red-400/20 text-2xl">2002</span>
                </div>,
                // Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/
                /* 2012 - İlk Ulusal Zirve */
                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl overflow-hidden flex flex-col items-center justify-between py-[15%]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-300/50 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-orange-300/40 rounded-full" />
                    <div className="w-2 h-2 bg-amber-400/30 rounded-full" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-200/30 flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-500/70" />
                  </div>
                  <span className="font-display font-extrabold text-amber-400/20 text-2xl">500+</span>
                </div>,
                /* 2016 - Kariyer Günleri */
                <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl overflow-hidden flex flex-col items-center justify-between py-[15%]">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400/50" />
                    <div className="w-2 h-2 bg-teal-300/40 rounded-full" />
                    <CheckCircle className="w-3 h-3 text-teal-400/40" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-200/30 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-emerald-500/70" />
                  </div>
                  <span className="font-display font-extrabold text-emerald-400/20 text-2xl">30+</span>
                </div>,
                /* 2020 - Dijital Dönüşüm */
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden flex flex-col items-center justify-between py-[15%]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1.5 bg-blue-300/30 rounded-full" />
                    <div className="w-5 h-1.5 bg-indigo-300/20 rounded-full" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-200/30 flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-blue-500/70" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-300/30 rounded-full" />
                    <div className="w-6 h-0.5 bg-blue-200/40" />
                    <div className="w-3 h-3 bg-indigo-300/30 rounded-full" />
                  </div>
                </div>,
                /* 2024 - Rekor Katılım */
                <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl overflow-hidden flex flex-col items-center justify-between py-[15%]">
                  <TrendingUp className="w-5 h-5 text-violet-400/40" />
                  <div className="w-14 h-14 rounded-2xl bg-violet-200/30 flex items-center justify-center">
                    <Users className="w-8 h-8 text-violet-500/70" />
                  </div>
                  <div className="flex items-end gap-1.5">
                    <div className="w-3 h-4 bg-violet-300/30 rounded-t-sm" />
                    <div className="w-3 h-7 bg-violet-400/30 rounded-t-sm" />
                    <div className="w-3 h-10 bg-purple-400/40 rounded-t-sm" />
                    <div className="w-3 h-6 bg-purple-300/30 rounded-t-sm" />
                  </div>
                </div>,
                /* 2026 - Yeni Dönem */
                <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 rounded-2xl overflow-hidden flex flex-col items-center justify-between py-[15%]">
                  <div className="flex items-center gap-3">
                    <Star className="w-3.5 h-3.5 text-red-300/40" />
                    <Sparkles className="w-4 h-4 text-rose-400/40" />
                    <Star className="w-3 h-3 text-red-300/30" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-red-200/30 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-red-500/70" />
                  </div>
                  <span className="font-display font-extrabold text-red-400/20 text-2xl">GKT</span>
                </div>,
              ];
              return (
                <div className="flex flex-col items-center text-center anim-fade" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-full ${size === "sm" ? "aspect-square" : "aspect-square"} mb-${size === "sm" ? "4" : "6"} group hover:scale-105 transition-transform cursor-default`}>
                    {scenes[i]}
                  </div>
                  <div className={`relative w-full flex items-center justify-center ${size === "sm" ? "mb-3" : "mb-5"}`}>
                    {size === "lg" && <div className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-red-200 ${i === 0 ? "left-1/2 right-0" : i === currentMilestones.length - 1 ? "left-0 right-1/2" : "left-0 right-0"}`} />}
                    <div className={`relative z-10 ${size === "sm" ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-white border-[3px] border-red-500 flex items-center justify-center shadow-md`}>
                      <span className={`font-display font-extrabold text-red-500 ${size === "sm" ? "text-[10px]" : "text-xs"}`}>{i + 1}</span>
                    </div>
                  </div>
                  <h3 className={`${size === "sm" ? "text-xs" : "text-sm"} font-display font-bold text-slate-900`}>{m.title}</h3>
                  <p className={`${size === "sm" ? "text-[10px]" : "text-xs"} text-slate-400 mt-1.5 leading-relaxed`}>{m.text}</p>
                  <span className={`font-mono ${size === "sm" ? "text-[9px]" : "text-[10px]"} text-red-400 font-semibold mt-2`}>{m.year}</span>
                </div>
              );
            };
            return (
              <>
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-6 gap-6">
                  {currentMilestones.map((m, i) => <MilestoneCard key={m.year || i} m={m} i={i} size="lg" />)}
                </div>
                {/* Tablet */}
                <div className="hidden md:grid lg:hidden grid-cols-3 gap-6">
                  {currentMilestones.map((m, i) => <MilestoneCard key={m.year || i} m={m} i={i} size="md" />)}
                </div>
                {/* Mobile */}
                <div className="md:hidden">
                  <div className="flex gap-5 overflow-x-auto pb-4">
                    {currentMilestones.map((m, i) => (
                      <div key={m.year || i} className="shrink-0 w-44">
                        <MilestoneCard m={m} i={i} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="SSS" title="Sıkça Sorulan Sorular" />
          <FAQSection items={[
            { q: "GKT kaç yıldır faaliyet gösteriyor?", a: "2002 yılında kurulmuştur, 24 yılı aşkın deneyime sahiptir." },
            { q: "GKT'nin vizyonu nedir?", a: "Girişimci, akılcı, ilkeli ve sorumlu yaklaşımla Türkiye'nin önde gelen öğrenci topluluğu olmak." },
            { q: "GKT'de hangi becerileri kazanabilirim?", a: "Takım çalışması, proje yönetimi, liderlik, etkinlik organizasyonu, kurumsal iletişim, dijital pazarlama, grafik tasarım ve networking becerileri." },
          ]} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50 border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="text-2xl font-display font-bold text-slate-900">Bu Hikayenin Bir Parçası Ol</p>
          <p className="mt-2 text-slate-400 text-sm">Kariyerine yatırım yapmanın tam zamanı.</p>
          <button onClick={() => navigate("iletisim")} className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-red-500 hover:bg-red-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all">
            Sen de GKT'li Ol <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: ETKİNLİKLER
   ══════════════════════════════════════════════════════════════ */
function EtkinliklerPage() {
  const [apiActivities, setApiActivities] = useState(null);
  const [apiUpcoming, setApiUpcoming] = useState(null);
  const [apiPast, setApiPast] = useState(null);

  useEffect(() => {
    fetchActivities().then(d => Array.isArray(d) && d.length > 0 && setApiActivities(d.map(a => ({ ...a, icon: getIcon(a.icon_name), image: a.image_path, desc: a.description })))).catch(() => {});
    fetchEvents('upcoming=1').then(d => setApiUpcoming(Array.isArray(d) ? d : [])).catch(() => setApiUpcoming([]));
    fetchEvents('upcoming=0').then(d => Array.isArray(d) && d.length > 0 && setApiPast(d)).catch(() => {});
  }, []);

  const etkinlikActivities = apiActivities || ACTIVITIES;
  const upcomingEvents = apiUpcoming || [];
  const pastEvents = apiPast || EVENTS_PAST;

  return (
    <>
      <Helmet>
        <title>Etkinlikler | Akdeniz GKT</title>
        <meta name="description" content="Kariyer günleri, teknik geziler, girişimcilik zirveleri ve daha fazlası. GKT etkinlik takvimi." />
        <link rel="canonical" href="https://akdenizgkt.com/etkinlikler" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Anasayfa","item":"https://akdenizgkt.com/"},{"@type":"ListItem","position":2,"name":"Etkinlikler","item":"https://akdenizgkt.com/etkinlikler"}]})}</script>
      </Helmet>
      <PageHeader icon={CalendarDays} badge="Etkinlikler" title="Etkinliklerimiz" desc="Ulusal zirvelerden kariyer günlerine, teknik gezilerden sosyal sorumluluk projelerine tüm etkinliklerimiz." />

      {/* Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/ */}
      {/* Upcoming Events */}
      <section className="py-20 md:py-28 bg-slate-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Yaklaşan" title="Yaklaşan Etkinlikler" align="left" />
          <div className="grid md:grid-cols-3 gap-5">
            {apiUpcoming === null && [0, 1, 2].map(i => <CardSkeleton key={i} />)}
            {apiUpcoming?.length === 0 && <UpcomingEmpty />}
            {upcomingEvents.map((ev, i) => (
              <div key={ev.id || ev.title || i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all anim-fade" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`h-44 bg-gradient-to-br ${ev.color || 'from-red-500 to-rose-600'} flex items-center justify-center relative overflow-hidden`}>
                  {ev.image_path ? <img src={ev.image_path} alt={ev.title} loading="lazy" className="w-full h-full object-cover" /> : <EventIllustration category={ev.cat || ev.category} title={ev.title} />}
                  <div className="absolute bottom-3 left-4"><span className="px-2 py-0.5 bg-white/25 rounded-full text-[10px] font-display font-bold text-white">{ev.cat || ev.category}</span></div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-slate-900 text-sm">{ev.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{ev.desc || ev.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {ev.date}</span>
                    {(ev.loc || ev.location) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.loc || ev.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Showcase */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Neler Yapıyoruz" title="Etkinlik Alanlarımız" desc="Her biri farklı bir deneyim sunan etkinliklerimiz ile kampüsün nabzını tutuyoruz." />
          <div className="space-y-8">
            {etkinlikActivities.map((a, i) => (
              <div key={a.title || i} className={`group grid md:grid-cols-2 gap-6 items-center rounded-2xl border border-gray-100 overflow-hidden bg-white hover:border-red-200 hover:shadow-lg transition-all anim-fade ${i % 2 === 1 ? "md:direction-rtl" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`${i % 2 === 1 ? "md:order-2" : ""}`}>
                  {a.image ? (
                    <div className="relative h-64 md:h-72 overflow-hidden">
                      <img src={a.image} alt={a.title} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-64 md:h-72 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                      <a.icon className="w-16 h-16 text-red-200" />
                    </div>
                  )}
                </div>
                <div className={`p-6 md:p-8 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                      <a.icon className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-900">{a.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <SectionTitle badge="Arşiv" title="Geçmiş Etkinlikler" align="left" />
          <div className="space-y-4">
            {pastEvents.map((ev, i) => (
              <div key={ev.id || ev.title || i} className="flex items-start gap-5 p-5 rounded-2xl border border-gray-100 bg-white hover:border-red-200 hover:shadow-md transition-all anim-fade" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${ev.color || 'from-slate-100 to-slate-200'} flex items-center justify-center overflow-hidden`}>
                  {ev.image_path ? <img src={ev.image_path} alt={ev.title} loading="lazy" className="w-full h-full object-cover" /> : <Clock className="w-5 h-5 text-white/60" />}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400">{ev.date}</span>
                  <h4 className="font-display font-bold text-slate-900 text-sm mt-0.5">{ev.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{ev.desc || ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: DEPARTMANLAR
   ══════════════════════════════════════════════════════════════ */
function TeamMemberImage({ src, alt }) {
  const [error, setError] = useState(false);
  if (error || !src) return <div className="w-full h-full flex items-center justify-center bg-slate-100"><User className="w-16 h-16 text-slate-300" /></div>;
  return <img src={src} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={() => setError(true)} />;
}

function DepartmanlarPage() {
  const [active, setActive] = useState(0);
  const [apiTeamMembers, setApiTeamMembers] = useState(null);

  useEffect(() => {
    fetchTeam().then(d => {
      if (!Array.isArray(d) || d.length === 0) return;
      const byDept = {};
      d.forEach(m => {
        const dept = m.department;
        if (!byDept[dept]) byDept[dept] = [];
        byDept[dept].push({ name: m.name, role: m.role_title?.includes("Koordinatör") ? "Koordinatör" : m.role_title, image: m.image_path, email: m.email, phone: m.phone });
      });
      setApiTeamMembers(byDept);
    }).catch(() => {});
  }, []);

  const dept = { ...DEPARTMENTS[active] };
  if (apiTeamMembers) {
    const deptNameMap = { "Medya ve IT": "Medya ve IT", "Etkinlik ve Organizasyon": "Etkinlik ve Org.", "Kurumsal İlişkiler": "Kurumsal İlişkiler", "Üye İlişkileri": "Üye İlişkileri" };
    const apiKey = Object.entries(deptNameMap).find(([, v]) => v === dept.name)?.[0] || dept.name;
    const members = apiTeamMembers[apiKey] || apiTeamMembers[dept.name];
    if (members) dept.team = members;
  }

  return (
    <>
      <Helmet>
        <title>Departmanlar | Akdeniz GKT</title>
        <meta name="description" content="Medya ve IT, Etkinlik ve Organizasyon, Kurumsal İlişkiler, Üye İlişkileri — GKT departman yapısı." />
        <link rel="canonical" href="https://akdenizgkt.com/departmanlar" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Anasayfa","item":"https://akdenizgkt.com/"},{"@type":"ListItem","position":2,"name":"Departmanlar","item":"https://akdenizgkt.com/departmanlar"}]})}</script>
      </Helmet>
      <PageHeader icon={Users} badge="Organizasyon" title="Departmanlarımız" desc="GKT dört ana departman altında organize oluyor. Her biri topluluğun farklı bir yetkinlik alanını temsil eder." />

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Tabs — 2×2 grid on mobile for even layout, wrap on sm+ */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 mb-10">
            {DEPARTMENTS.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => setActive(d.id)}
                  className={`inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-display font-semibold border-2 transition-all min-w-0 ${active === d.id ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20" : "bg-white text-slate-500 border-gray-200 hover:border-red-200 hover:text-slate-900"}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{d.name}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-8">
            {/* Content */}
            <div className="anim-fade" key={active}>
              <div className="p-8 rounded-2xl border border-gray-100 bg-slate-50">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
                    <dept.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-slate-900">{dept.name}</h2>
                    <p className="text-xs text-slate-400">Departman</p>
                  </div>
                </div>
                <p className="text-slate-500 leading-relaxed text-sm mb-6">{dept.desc}</p>
                <div className="border-t border-gray-200 pt-5">
                  <h4 className="text-xs font-display font-semibold text-slate-300 uppercase tracking-wider mb-3">Görev Alanları</h4>
                  <ul className="space-y-2">
                    {dept.tasks.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Department Member Cards */}
          {dept.team && (
            <div className="mt-12 anim-fade" key={`team-${active}`}>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
                  <Users className="w-4 h-4 text-white" />
                </div>
                {dept.name} Ekibi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {dept.team.map((m, i) => {
                  const isCoord = m.role === "Koordinatör";
                  return (
                    <div key={m.name || i} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all group anim-fade flex flex-col ${isCoord ? "border-red-200 ring-1 ring-red-100" : "border-gray-100 hover:border-red-200"}`} style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="aspect-square overflow-hidden bg-slate-100 relative">
                        <TeamMemberImage src={m.image} alt={m.name} />
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(220,38,38,0.12) 0%, transparent 60%)" }} />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex-1">
                          <span className="block w-fit px-2 py-0.5 -ml-2 rounded-full bg-red-50 text-red-500 text-[9px] font-display font-bold tracking-wider mb-1.5">{isCoord ? `${dept.name} Koordinatörü` : m.role}</span>
                          <h3 className="font-display font-bold text-slate-900 text-sm leading-tight">{m.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <a href={`mailto:${m.email}`} title={m.email} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors">
                            <Mail className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                          </a>
                          <a href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(m.name)}`} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 flex items-center justify-center transition-colors">
                            <Linkedin className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 transition-colors" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: BLOG
   ══════════════════════════════════════════════════════════════ */
function BlogPage() {
  const [blogPosts, setBlogPosts] = useState(null);

  useEffect(() => {
    fetchBlog().then(d => Array.isArray(d) && d.length > 0 && setBlogPosts(d)).catch(() => {});
  }, []);

  const posts = blogPosts || BLOG_POSTS;
  const featured = posts.find(p => p.is_featured || p.featured);
  const rest = posts.filter(p => p !== featured);

  return (
    <>
      <Helmet>
        <title>Blog & Duyurular | Akdeniz GKT</title>
        <meta name="description" content="GKT'den kariyer rehberleri, etkinlik haberleri, duyurular ve girişimcilik dünyasından yazılar." />
        <link rel="canonical" href="https://akdenizgkt.com/blog" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Anasayfa","item":"https://akdenizgkt.com/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://akdenizgkt.com/blog"}]})}</script>
      </Helmet>
      {/* Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/ */}
      <PageHeader icon={Newspaper} badge="Blog" title="Haberler & Duyurular" desc="Topluluğumuzdan son gelişmeler, etkinlik haberleri ve duyurular." />

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Featured Post */}
          {featured && (
            <Link to={'/blog/' + (featured.slug || featured.title?.toLowerCase().replace(/\s+/g, '-'))} className="block rounded-2xl border border-gray-100 overflow-hidden mb-12 anim-fade hover:border-red-200 hover:shadow-xl transition-all no-underline">
              <div className="grid md:grid-cols-2">
                <div className="aspect-[16/10] md:aspect-auto bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center min-h-[240px] overflow-hidden">
                  {featured.cover_image ? (
                    <img src={featured.cover_image} alt={featured.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <Newspaper className="w-12 h-12 text-red-200" />
                  )}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-display font-bold">{featured.cat || featured.category}</span>
                    <span className="text-xs text-slate-400">{featured.date}</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-slate-900 leading-snug">{featured.title}</h2>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{featured.excerpt}</p>
                </div>
              </div>
            </Link>
          )}

          {/* All Posts Grid */}
          <SectionTitle badge="Son Yazılar" title="Tüm Yazılar" align="left" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((p, i) => (
              <Link key={p.id || p.slug || i} to={'/blog/' + (p.slug || p.title?.toLowerCase().replace(/\s+/g, '-'))} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all anim-fade no-underline flex flex-col" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-[16/10] overflow-hidden">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <BlogIllustration category={p.cat || p.category} slug={p.slug} />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-display font-bold">{p.cat || p.category}</span>
                    <span className="text-[10px] text-slate-400">{p.date}</span>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-sm leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 flex-1">{p.excerpt}</p>
                  <span className="text-xs font-display font-semibold text-red-500 mt-3 inline-block">Devamını Oku →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: İLETİŞİM
   ══════════════════════════════════════════════════════════════ */
function IletisimPage({ navigate }) {
  const { settings } = useSiteData();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [konuOpen, setKonuOpen] = useState(false);
  const [konu, setKonu] = useState("");
  const [errors, setErrors] = useState({});
  const konuOptions = ["Üyelik Başvurusu", "İş Birliği Teklifi", "Sponsorluk", "Etkinlik Bilgisi", "Öneri / Şikayet", "Diğer"];

  const handleIletisimSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const form = e.target;
    const nameInput = form.querySelector('input[placeholder*="Adınız"]') || form.elements[0];
    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const textarea = form.querySelector('textarea');
    const data = {
      name: nameInput?.value || '',
      email: emailInput?.value || '',
      phone: phoneInput?.value || '',
      subject: konu,
      message: textarea?.value || '',
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    if (!data.name || data.name.trim().length < 2) newErrors.name = 'Ad Soyad en az 2 karakter olmalı';
    if (!emailRegex.test(data.email)) newErrors.email = 'Geçerli bir e-posta adresi girin';
    if (data.phone && !/^[\d\s+().-]{0,20}$/.test(data.phone)) newErrors.phone = 'Geçerli bir telefon numarası girin';
    if (!data.message || data.message.trim().length < 10) newErrors.message = 'Mesaj en az 10 karakter olmalı';
    if (!konu) newErrors.konu = 'Lütfen bir konu seçin';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setSending(false); return; }
    setErrors({});
    const ok = await postMessage(data);
    if (ok) setSubmitted(true);
    setSending(false);
  };

  return (
    <>
      <Helmet>
        <title>İletişim | Akdeniz GKT</title>
        <meta name="description" content="Akdeniz Üniversitesi GKT ile iletişime geçin. Üyelik başvurusu, iş birliği ve sorularınız için." />
        <link rel="canonical" href="https://akdenizgkt.com/iletisim" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Anasayfa","item":"https://akdenizgkt.com/"},{"@type":"ListItem","position":2,"name":"İletişim","item":"https://akdenizgkt.com/iletisim"}]})}</script>
      </Helmet>
      <PageHeader icon={Mail} badge="İletişim" title="Bize Ulaşın" desc="Soru, öneri veya iş birliği tekliflerin için bizimle iletişime geçebilirsin. Üyelik başvurusu yapmak istiyorsan da doğru yerdesin!" />

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left: Info cards */}
            <div className="flex flex-col gap-5">
              {/* Topluluk Bilgileri */}
              <div className="p-7 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-base font-display font-bold text-slate-900">Topluluk Bilgileri</h3>
                <div>
                  <p className="text-sm font-display font-semibold text-slate-800">Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{settings.contact_address || "Pınarbaşı, Akdeniz Ünv. İktisadi ve İdari Bilimler Fakültesi, B Blok Bodrum Kat, 07100 Konyaaltı / Antalya"}</p>
                </div>
              </div>

              {/* Telefon & E-posta — stack on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="p-5 sm:p-6 rounded-2xl border border-gray-100 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                    <Phone className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-display">Telefon</p>
                  <p className="text-sm font-display font-bold text-slate-900 mt-0.5 break-words">{settings.contact_phone || "—"}</p>
                </div>
                <a
                  href={"mailto:" + (settings.contact_email || "info@akdenizgkt.com")}
                  className="p-5 sm:p-6 rounded-2xl border border-gray-100 min-w-0 block no-underline hover:border-red-200 transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-display">E-posta</p>
                  <p className="text-sm font-display font-bold text-red-500 mt-0.5 break-words" style={{ wordBreak: 'break-word' }}>
                    {settings.contact_email || "info@akdenizgkt.com"}
                  </p>
                </a>
              </div>

              {/* Harita */}
              <div className="p-5 rounded-2xl border border-gray-100 flex-1 flex flex-col">
                <h3 className="text-base font-display font-bold text-slate-900 mb-4">Bizi Haritada Bulun</h3>
                <div className="rounded-xl overflow-hidden border border-gray-100 flex-1">
                  <iframe
                    src="https://www.google.com/maps?q=36.894096,30.658231&t=&z=17&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full min-h-[200px] border-0"
                    allowFullScreen
                    loading="eager"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Akdeniz Üniversitesi Harita"
                  />
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Bize Mesaj Gönderin</h3>

              {submitted ? (
                <div className="flex flex-col items-center py-16 px-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-center anim-scale">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-display font-bold text-slate-900 mb-2">Mesajın İletildi!</h3>
                  <p className="text-sm text-slate-400">En kısa sürede seninle iletişime geçeceğiz.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-5 text-sm font-display font-semibold text-red-600 hover:text-red-700">Yeni mesaj gönder →</button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleIletisimSubmit}>
                  <div>
                    <FormField label="Ad Soyad" placeholder="Adınız ve soyadınız" required />
                    {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FormField label="E-posta" type="email" placeholder="ornek@email.com" required onBlur={(e) => { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (e.target.value && !emailRegex.test(e.target.value)) { setErrors(prev => ({ ...prev, email: 'Geçerli bir e-posta adresi girin' })); } else { setErrors(prev => { const { email, ...rest } = prev; return rest; }); } }} />
                      {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <FormField label="Telefon" type="tel" placeholder="0(5XX) XXX XX XX" />
                      {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="block text-sm font-medium text-slate-700 font-display">Konu</label>
                    <input type="hidden" name="konu" value={konu} required />
                    <button type="button" onClick={() => setKonuOpen(!konuOpen)} className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-left flex items-center justify-between transition-all ${konuOpen ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className={konu ? "text-slate-900" : "text-slate-300"}>{konu || "Konu seçiniz"}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${konuOpen ? "rotate-90" : ""}`} />
                    </button>
                    <div className={`absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden transition-all duration-300 origin-top ${konuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}>
                      {konuOptions.map((opt, i) => (
                        <button key={i} type="button" onClick={() => { setKonu(opt); setKonuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${konu === opt ? "bg-red-50 text-red-600 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {errors.konu && <p className="text-[10px] text-red-500 mt-1">{errors.konu}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 font-display">Mesajınız</label>
                    <textarea placeholder="Mesajınızı buraya yazın..." required className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300 transition-all resize-y" style={{ minHeight: 200 }} />
                    {errors.message && <p className="text-[10px] text-red-500 mt-1">{errors.message}</p>}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">Formu göndererek <button type="button" onClick={() => navigate("gizlilik")} className="text-red-500 hover:underline">Gizlilik Politikası</button>'nı kabul etmiş olursunuz.</p>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-7 py-3.5 bg-red-500 hover:bg-red-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.97] text-base">
                    Mesaj Gönder <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════════════════════ */
function PageHeader({ icon: Icon, badge, title, desc }) {
  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
        <div className="max-w-2xl anim-fade">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-display font-semibold mb-5">
            <Icon className="w-3.5 h-3.5" /> {badge}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">{title}</h1>
          <p className="mt-4 text-base md:text-lg text-white/40 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

function SectionTitle({ badge, title, desc, align = "center" }) {
  return (
    <div className={`max-w-3xl mb-10 md:mb-14 ${align === "center" ? "mx-auto text-center" : ""}`}>
      {/* Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/ */}
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-display font-bold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {badge}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">{title}</h2>
      {desc && <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-xl" style={align === "center" ? { margin: "12px auto 0" } : {}}>{desc}</p>}
    </div>
  );
}

function FAQSection({ items }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`rounded-2xl border transition-all duration-300 anim-fade ${openIdx === i ? 'border-red-200 bg-red-50/30 shadow-sm' : 'border-gray-100 bg-white hover:border-red-200'}`} style={{ animationDelay: `${i * 80}ms` }}>
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center gap-3 px-5 py-4 text-left group">
            <ChevronRight className={`w-4 h-4 text-red-400 shrink-0 transition-transform duration-500 ease-out ${openIdx === i ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
            <span className="font-display font-semibold text-slate-900 text-sm">{item.q}</span>
          </button>
          <div className={`grid transition-all duration-500 ease-out ${openIdx === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <p className="px-5 pb-5 pl-12 text-sm text-slate-500 leading-relaxed faq-answer">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormField({ label, ...props }) {
  const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 font-display">{label}</label>
      <input id={id} {...props} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300 transition-all" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LEGAL PAGES
   ══════════════════════════════════════════════════════════════ */

function LegalPageLayout({ title, children, navigate }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
        <button onClick={() => navigate("home")} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors mb-8 group">
          <ChevronRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Anasayfa
        </button>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">{title}</h1>
        <p className="text-sm text-slate-400 mb-10">Son güncelleme: 14 Şubat 2026</p>
        <div className="prose prose-sm prose-slate max-w-none [&_h2]:text-lg [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-slate-700 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:text-sm [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: ÇEKİLİŞ SONUÇLARI
   ══════════════════════════════════════════════════════════════ */
function CekilisPage({ active, navigate }) {
  const [raffles, setRaffles] = useState(null);

  useEffect(() => {
    if (!active) return;
    fetchRaffles().then(d => setRaffles(Array.isArray(d) ? d : [])).catch(() => setRaffles([]));
  }, [active]);

  // Page is gated by the admin toggle — hide it completely when disabled
  // so direct URL visits return a 404 rather than a dormant route.
  if (!active) return <NotFoundPage navigate={navigate} />;

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso + 'T00:00:00');
      if (isNaN(d.getTime())) return '';
      const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch { return ''; }
  };

  return (
    <>
      <Helmet>
        <title>Çekiliş | Akdeniz GKT</title>
        <meta name="description" content="GKT çekilişleri: kazananlar, ödüller ve tarihler." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <PageHeader icon={Gift} badge="Çekiliş" title="Çekiliş" desc="Düzenlediğimiz çekilişlerin kazananları ve ödülleri." />

      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {raffles === null ? (
            <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : raffles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-2xl mx-auto">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold text-slate-700 mb-1">Henüz çekiliş sonucu yok</h3>
              <p className="text-sm text-slate-400">Yakında burada paylaşılacak.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {raffles.map((r, i) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all anim-fade flex flex-col" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="aspect-[4/5] overflow-hidden bg-slate-50 relative">
                    {r.image_path ? (
                      <img src={r.image_path} alt={r.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                        <Trophy className="w-20 h-20 text-white/80" />
                      </div>
                    )}
                    {r.raffle_date && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] text-slate-700 font-display font-bold shadow-sm">
                        <CalendarDays className="w-3 h-3" /> {formatDate(r.raffle_date)}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{r.name}</h3>
                    {r.prize && (
                      <p className="text-sm text-slate-500 mt-2">
                        <span className="font-semibold text-slate-700">Ödül:</span> {r.prize}
                      </p>
                    )}
                    {r.winner_name && (() => {
                      const winList = r.winner_name.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
                      if (winList.length === 0) return null;
                      return (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Trophy className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-slate-400 font-display font-semibold uppercase tracking-wider">
                              {winList.length > 1 ? `Kazananlar (${winList.length})` : 'Kazanan'}
                            </p>
                            {winList.length === 1 ? (
                              <p className="text-sm text-red-600 font-display font-bold truncate">{winList[0]}</p>
                            ) : (
                              <ul className="mt-0.5 space-y-0.5">
                                {winList.map((w, idx) => (
                                  <li key={idx} className="text-sm text-red-600 font-display font-bold truncate flex items-baseline gap-1.5">
                                    <span className="text-[10px] text-red-400 tabular-nums shrink-0">{idx + 1}.</span>
                                    <span className="truncate">{w}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function GizlilikPage({ navigate }) {
  return (
    <LegalPageLayout title="Gizlilik Politikası" navigate={navigate}>
      <p>Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu (GKT) olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.</p>

      <h2>1. Toplanan Veriler</h2>
      <p>Web sitemiz üzerinden aşağıdaki kişisel verileri toplayabiliriz:</p>
      <ul>
        <li>Ad ve soyad</li>
        <li>E-posta adresi</li>
        <li>Telefon numarası</li>
        <li>İletişim formu aracılığıyla gönderdiğiniz mesaj içerikleri</li>
        <li>Üyelik başvuru formunda paylaştığınız bilgiler</li>
      </ul>

      <h2>2. Verilerin Kullanım Amaçları</h2>
      <p>Toplanan kişisel veriler aşağıdaki amaçlarla kullanılmaktadır:</p>
      <ul>
        <li>İletişim taleplerinize yanıt verilmesi</li>
        <li>Topluluk etkinlikleri hakkında bilgilendirme yapılması</li>
        <li>Üyelik başvurularının değerlendirilmesi</li>
        <li>Hizmet kalitesinin artırılması</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>3. Verilerin Paylaşımı</h2>
      <p>Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. Verileriniz yalnızca Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu bünyesinde, belirtilen amaçlar doğrultusunda kullanılır.</p>

      <h2>4. Veri Güvenliği</h2>
      <p>Kişisel verilerinizin güvenliğini sağlamak için uygun teknik ve idari tedbirler alınmaktadır. Verilerinize yetkisiz erişim, kayıp veya kötüye kullanıma karşı koruma sağlanmaktadır.</p>

      <h2>5. Veri Saklama Süresi</h2>
      <p>Kişisel verileriniz, toplama amacının gerektirdiği süre boyunca veya yasal düzenlemelerin öngördüğü süre kadar saklanır. Süre sona erdiğinde veriler güvenli bir şekilde silinir veya anonim hale getirilir.</p>

      <h2>6. Haklarınız</h2>
      <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
        <li>Verilerin silinmesini veya yok edilmesini isteme</li>
      </ul>

      <h2>7. İletişim</h2>
      <p>Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:</p>
      <p>E-posta: info@akdenizgkt.com</p>
    </LegalPageLayout>
  );
}

function KullanimSartlariPage({ navigate }) {
  return (
    <LegalPageLayout title="Kullanım Şartları" navigate={navigate}>
      <p>Bu web sitesini kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. Lütfen bu şartları dikkatlice okuyunuz.</p>

      <h2>1. Genel Hükümler</h2>
      <p>Bu web sitesi, Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu (GKT) tarafından işletilmektedir. Siteye erişiminiz ve kullanımınız bu kullanım şartlarına tabidir.</p>

      <h2>2. Fikri Mülkiyet Hakları</h2>
      <p>Bu web sitesindeki tüm içerikler (metin, grafik, logo, ikon, görsel, ses, video ve yazılım dahil) Akdeniz Üniversitesi GKT'ye aittir veya lisanslıdır. Bu içeriklerin izinsiz kopyalanması, çoğaltılması, dağıtılması veya yayınlanması yasaktır.</p>

      <h2>3. Kullanıcı Yükümlülükleri</h2>
      <p>Web sitemizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
      <ul>
        <li>Siteyi yalnızca yasal amaçlarla kullanmak</li>
        <li>Yanıltıcı veya yanlış bilgi paylaşmamak</li>
        <li>Sitenin işleyişini bozmaya yönelik eylemlerden kaçınmak</li>
        <li>Diğer kullanıcıların haklarına saygı göstermek</li>
        <li>Zararlı yazılım veya kod göndermemek</li>
      </ul>

      <h2>4. İletişim Formu</h2>
      <p>İletişim formu aracılığıyla gönderdiğiniz bilgilerin doğruluğundan siz sorumlusunuz. Topluluk, form aracılığıyla iletilen talepler için makul sürede yanıt vermeye çalışır ancak yanıt süresi konusunda garanti vermez.</p>

      <h2>5. Bağlantılar</h2>
      <p>Web sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir. Bu bağlantılar bilgilendirme amaçlı sunulmakta olup, bağlantı verilen sitelerin içeriklerinden GKT sorumlu değildir.</p>

      <h2>6. Sorumluluk Sınırlaması</h2>
      <p>Web sitemizdeki bilgiler "olduğu gibi" sunulmaktadır. GKT, siteye erişimden veya kullanımdan doğabilecek doğrudan ya da dolaylı zararlardan sorumlu tutulamaz. Site içeriğindeki bilgilerin güncelliği, doğruluğu ve eksiksizliği konusunda garanti verilmemektedir.</p>

      <h2>7. Değişiklikler</h2>
      <p>GKT, bu kullanım şartlarını önceden bildirmeksizin değiştirme hakkını saklı tutar. Değişiklikler web sitesinde yayınlandığı anda yürürlüğe girer. Siteyi kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir.</p>

      <h2>8. Uygulanacak Hukuk</h2>
      <p>Bu kullanım şartları Türkiye Cumhuriyeti kanunlarına tabidir. Herhangi bir uyuşmazlık halinde Antalya Mahkemeleri ve İcra Daireleri yetkilidir.</p>
    </LegalPageLayout>
  );
}

function KVKKPage({ navigate }) {
  return (
    <LegalPageLayout title="KVKK Aydınlatma Metni" navigate={navigate}>
      <p>Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan şekilde işlemekteyiz.</p>

      <h2>1. Veri Sorumlusu</h2>
      <p>Veri Sorumlusu: Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu</p>
      <p>Adres: Akdeniz Üniversitesi, Konyaaltı / Antalya</p>
      <p>E-posta: info@akdenizgkt.com</p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <p>Aşağıdaki kategorilerdeki kişisel verileriniz işlenmektedir:</p>
      <ul>
        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
        <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası</li>
        <li><strong>Talep/Şikayet Bilgileri:</strong> İletişim formu mesaj içerikleri, konu başlıkları</li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
      <ul>
        <li>İletişim faaliyetlerinin yürütülmesi</li>
        <li>Topluluk etkinlikleri hakkında bilgilendirme yapılması</li>
        <li>Üyelik süreçlerinin yönetilmesi</li>
        <li>Talep ve şikayetlerin takip edilmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
      <p>Kişisel verileriniz, KVKK'nın 5. maddesi kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
      <ul>
        <li>Açık rızanız</li>
        <li>Meşru menfaatlerimiz için veri işlemenin zorunlu olması</li>
        <li>Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması</li>
      </ul>

      <h2>5. Kişisel Verilerin Aktarılması</h2>
      <p>Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak ve gerekli güvenlik önlemleri alınarak yalnızca yasal zorunluluk hallerinde yetkili kamu kurum ve kuruluşlarına aktarılabilir.</p>

      <h2>6. Veri Sahibi Olarak Haklarınız</h2>
      <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
        <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
        <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
        <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
        <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
      </ul>

      <h2>7. Başvuru Yöntemi</h2>
      <p>Yukarıda belirtilen haklarınızı kullanmak için info@akdenizgkt.com adresine yazılı olarak başvurabilirsiniz. Başvurunuz en kısa sürede ve en geç 30 gün içinde sonuçlandırılacaktır.</p>
    </LegalPageLayout>
  );
}

function CerezPage({ navigate }) {
  return (
    <LegalPageLayout title="Çerez Politikası" navigate={navigate}>
      <p>Bu Çerez Politikası, Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu web sitesinin çerez kullanımına ilişkin bilgileri içermektedir.</p>

      <h2>1. Çerez Nedir?</h2>
      <p>Çerezler (cookies), web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, web sitesinin düzgün çalışmasını sağlamak, kullanıcı deneyimini geliştirmek ve site kullanımını analiz etmek amacıyla kullanılmaktadır.</p>

      <h2>2. Kullanılan Çerez Türleri</h2>

      <h3>a) Zorunlu Çerezler</h3>
      <p>Web sitesinin temel işlevlerini yerine getirmek için gereklidir. Bu çerezler olmadan site düzgün çalışmaz. Kullanıcı tercihlerini hatırlama ve oturum yönetimi gibi işlevleri kapsar.</p>

      <h3>b) Analitik Çerezler</h3>
      <p>Ziyaretçilerin web sitesini nasıl kullandığını anlamamıza yardımcı olur. Sayfa görüntüleme sayısı, ziyaret süresi ve trafik kaynakları gibi bilgileri anonim olarak toplar.</p>

      {/* Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/ */}
      <h3>c) Üçüncü Taraf Çerezleri</h3>
      <p>Web sitemizde yer alan Google Maps ve sosyal medya entegrasyonları gibi üçüncü taraf hizmetleri kendi çerezlerini kullanabilir. Bu çerezler ilgili üçüncü tarafların gizlilik politikalarına tabidir.</p>

      <h2>3. Çerezlerin Kullanım Amaçları</h2>
      <ul>
        <li>Web sitesinin düzgün çalışmasını sağlamak</li>
        <li>Kullanıcı tercihlerini hatırlamak</li>
        <li>Site performansını analiz etmek ve iyileştirmek</li>
        <li>Kullanıcı deneyimini kişiselleştirmek</li>
      </ul>

      <h2>4. Çerez Yönetimi</h2>
      <p>Tarayıcı ayarlarınız üzerinden çerezleri yönetebilir, silebilir veya engelleyebilirsiniz. Ancak çerezleri devre dışı bırakmanız durumunda web sitesinin bazı özellikleri düzgün çalışmayabilir.</p>
      <p>Yaygın tarayıcılarda çerez ayarları genellikle "Gizlilik" veya "Güvenlik" bölümünde bulunmaktadır.</p>

      <h2>5. Değişiklikler</h2>
      <p>Bu Çerez Politikası gerektiğinde güncellenebilir. Güncellemeler web sitesinde yayınlandığı tarihten itibaren geçerli olur.</p>

      <h2>6. İletişim</h2>
      <p>Çerez politikamız hakkında sorularınız için info@akdenizgkt.com adresinden bize ulaşabilirsiniz.</p>
    </LegalPageLayout>
  );
}

function NotFoundPage({ navigate }) {
  return (
    <>
      <Helmet>
        <title>Sayfa Bulunamadı | Akdeniz GKT</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative text-center px-6 anim-fade">
          <p className="text-[120px] sm:text-[160px] font-display font-extrabold text-white/5 leading-none select-none">404</p>
          <div className="-mt-16 sm:-mt-20">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Sayfa Bulunamadı</h1>
            <p className="text-sm text-white/40 max-w-md mx-auto mb-8">Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.</p>
            <button onClick={() => navigate("home")} className="inline-flex items-center gap-2 px-7 py-3 bg-red-500 hover:bg-red-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.97]">
              Anasayfaya Dön <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function Footer({ navigate }) {
  const { settings } = useSiteData();
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <button onClick={() => navigate("home")} className="flex items-center gap-2 mb-4 group">
              <img src="/assets/logo_gkt.png" alt="Akdeniz GKT" loading="lazy" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-display font-bold text-base text-white">Akdeniz GKT</span>
            </button>
            <p className="text-white/35 text-xs leading-relaxed mb-5 max-w-[240px]">2002'den bu yana öğrencilerin kariyer yolculuğuna rehberlik ediyoruz.</p>
            <div className="flex items-center gap-1.5">
              {[
                { icon: Instagram, href: "https://www.instagram.com/akdenizgkt/", label: "Instagram" },
                { icon: Youtube, href: "https://www.youtube.com/channel/UCBYzke_LtR9SBacQFjRo7ag", label: "YouTube" },
                { icon: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, href: "https://x.com/AkdenizGKT", label: "X" },
                { icon: ({ className }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.5V7.12a4.83 4.83 0 01-1-.43z"/></svg>, href: "https://www.tiktok.com/@gktmedya", label: "TikTok" },
                { icon: Facebook, href: "https://www.facebook.com/akdenizgkt/", label: "Facebook" },
                { icon: Linkedin, href: "https://www.linkedin.com/company/akdeniz-%C3%BCniversitesi-giri%C5%9Fimcilik-ve-kariyer-toplulu%C4%9Fu/", label: "LinkedIn" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" title={s.label} aria-label={s.label}>
                  <s.icon className="w-3.5 h-3.5 text-white/40 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Developed by Mehmet Yiğit Kasap — https://www.linkedin.com/in/mehmet-yigit-kasap/ */}
          {/* Pages */}
          <div>
            <h4 className="font-display font-semibold text-[11px] text-white/70 uppercase tracking-wider mb-4">Sayfalar</h4>
            <ul className="flex flex-col gap-3">
              {NAV.map(n => (
                <li key={n.id}><button onClick={() => navigate(n.id)} className="block text-xs h-4 text-white/35 hover:text-white transition-colors">{n.label}</button></li>
              ))}
            </ul>
          </div>

          {/* Quick */}
          <div>
            <h4 className="font-display font-semibold text-[11px] text-white/70 uppercase tracking-wider mb-4">Hızlı Erişim</h4>
            <ul className="flex flex-col gap-3">
              {["Girişimcilik Zirvesi", "Kariyer Günleri", "Sen de GKT'li Ol", "Blog & Haberler"].map((l, i) => (
                <li key={i}><button onClick={() => navigate(i < 2 ? "etkinlikler" : i === 2 ? "iletisim" : "blog")} className="flex items-center gap-1 text-xs h-4 text-white/35 hover:text-white transition-colors group">{l}<ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" /></button></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-[11px] text-white/70 uppercase tracking-wider mb-4">Yasal</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Gizlilik Politikası", id: "gizlilik" },
                { label: "Kullanım Şartları", id: "kullanim-sartlari" },
                { label: "KVKK Aydınlatma", id: "kvkk" },
                { label: "Çerez Politikası", id: "cerez" },
              ].map(l => (
                <li key={l.id}><button onClick={() => navigate(l.id)} className="block text-xs h-4 text-white/35 hover:text-white transition-colors">{l.label}</button></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-[11px] text-white/70 uppercase tracking-wider mb-4">İletişim</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5"><MapPin className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" /><p className="text-xs text-white/35 leading-relaxed">{settings.contact_address || "Akdeniz Üniversitesi, Konyaaltı / Antalya"}</p></div>
              <div className="flex items-center gap-2.5"><Mail className="w-3.5 h-3.5 text-red-400 shrink-0" /><span className="text-xs text-white/35">{settings.contact_email || "info@akdenizgkt.com"}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/20">© 2026 Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu.</p>
          <p className="text-[10px] text-white/15">Medya & IT Departmanı tarafından ❤️ ile geliştirildi.</p>
        </div>
      </div>
    </footer>
  );
}
