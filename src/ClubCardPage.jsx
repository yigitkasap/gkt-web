import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CreditCard, MapPin, Search, RotateCcw, UserCheck, ScanLine, BadgePercent, Store, ArrowRight, Info, Navigation } from "lucide-react";
import { CLUBCARD_PARTNERS, CLUBCARD_TIERS, CLUBCARD_PERIOD } from "./clubcardData";

const LOGO_DIR = "/assets/clubcard";

const normalize = (s) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

const mapsUrl = (p) => {
  const area = p.branch.startsWith("Tüm") ? "" : ` ${p.branch.replace(/ Şubesi$/, "")}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}${area} Antalya`)}`;
};

function PartnerCard({ p, i }) {
  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-xl hover:shadow-slate-900/5 transition-all overflow-hidden anim-fade" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
      <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-display font-extrabold shadow-md shadow-red-500/30">%{p.discount}</span>
      <div className="h-36 flex items-center justify-center px-14 py-6 bg-white border-b border-gray-50">
        <img src={`${LOGO_DIR}/${p.logo}.webp`} alt={`${p.name} logosu`} loading="lazy" className="max-h-full max-w-full object-contain group-hover:scale-[1.04] transition-transform duration-300" />
      </div>
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-display font-bold text-slate-900 text-sm leading-snug">{p.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">{p.branch}</span>
          </span>
          <a href={mapsUrl(p)} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1 text-[11px] font-display font-semibold text-slate-400 hover:text-red-500 transition-colors no-underline" aria-label={`${p.name} haritada aç`}>
            <Navigation className="w-3 h-3" /> Harita
          </a>
        </div>
      </div>
    </article>
  );
}

export default function ClubCardPage() {
  const [tier, setTier] = useState("all");
  const [query, setQuery] = useState("");
  const [showBack, setShowBack] = useState(false);

  const maxDiscount = Math.max(...CLUBCARD_TIERS);
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return CLUBCARD_PARTNERS.filter(p =>
      (tier === "all" || p.discount === tier) &&
      (!q || normalize(`${p.name} ${p.category} ${p.branch}`).includes(q))
    );
  }, [tier, query]);
  const groups = CLUBCARD_TIERS.map(t => ({ t, items: filtered.filter(p => p.discount === t) })).filter(g => g.items.length);

  return (
    <>
      <Helmet>
        <title>GKT Club Card | Akdeniz GKT</title>
        <meta name="description" content={`GKT Club Card ile GKT Mutfak üyeleri Antalya'da ${CLUBCARD_PARTNERS.length} anlaşmalı işletmede %${maxDiscount}'e varan indirimden yararlanır. ${CLUBCARD_PERIOD} dönemi güncel listesi.`} />
        <link rel="canonical" href="https://akdenizgkt.com/clubcard" />
        {/* Yönetim kararı: yalnızca link/QR ile açılır, arama sonuçlarında listelenmez (server/seo.js ile aynı) */}
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="GKT Club Card — Bir kart, birçok ayrıcalık" />
        <meta property="og:description" content={`GKT Mutfak üyelerine ${CLUBCARD_PARTNERS.length} işletmede %${maxDiscount}'e varan indirim.`} />
        <meta property="og:image" content="https://akdenizgkt.com/assets/clubcard/kart-on.jpg" />
        <meta property="og:url" content="https://akdenizgkt.com/clubcard" />
        <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Anasayfa", "item": "https://akdenizgkt.com/" }, { "@type": "ListItem", "position": 2, "name": "GKT Club Card", "item": "https://akdenizgkt.com/clubcard" }] })}</script>
      </Helmet>

      {/* HEADER */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl anim-fade">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-display font-semibold mb-5">
                <CreditCard className="w-3.5 h-3.5" /> GKT Mutfak'a özel
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
                GKT <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">Club Card</span>
              </h1>
              <p className="mt-2 text-xs md:text-sm font-display font-semibold tracking-[0.3em] text-white/50 uppercase">Bir kart, birçok ayrıcalık</p>
              <p className="mt-5 text-base md:text-lg text-white/45 leading-relaxed">
                GKT Club Card, GKT Mutfak üyelerine Antalya'daki anlaşmalı işletmelerde indirim sağlayan bir GKT girişimi. Kafeden spor salonuna, dil okulundan parfümeriye kadar {CLUBCARD_PARTNERS.length} işletmede geçerli.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                {[
                  { v: CLUBCARD_PARTNERS.length, l: "İşletme" },
                  { v: `%${maxDiscount}'e`, l: "varan indirim" },
                  { v: CLUBCARD_PERIOD, l: "Dönemi" },
                ].map(s => (
                  <div key={s.l} className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-3 text-center">
                    <div className="font-display font-extrabold text-white text-base sm:text-lg md:text-xl leading-none whitespace-nowrap">{s.v}</div>
                    <div className="mt-1.5 text-[10px] md:text-[11px] text-white/40 leading-tight">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="anim-scale" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto max-w-lg">
                <div className="absolute inset-4 rounded-3xl bg-red-500/30 blur-2xl" />
                <img
                  src={`${LOGO_DIR}/${showBack ? "kart-arka" : "kart-on"}.webp`}
                  alt={showBack ? "GKT Club Card arka yüzü: anlaşmalı işletme listesi ve QR kod" : "GKT Club Card ön yüzü: indirim oranlarına göre anlaşmalı işletme logoları"}
                  width="1400" height="882"
                  className="relative w-full h-auto rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
                />
                <button onClick={() => setShowBack(b => !b)} className="relative mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-display font-semibold transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> {showBack ? "Ön yüzü göster" : "Arka yüzü göster"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* PARTNERS */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-display font-bold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Anlaşmalı işletmeler
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">Kartın geçtiği yerler</h2>
            </div>
            <label className="relative w-full md:w-72">
              <span className="sr-only">İşletme ara</span>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="İşletme, kategori veya şube ara"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none text-sm text-slate-700 placeholder:text-slate-300 transition-all"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="İndirim oranına göre filtrele">
            {["all", ...CLUBCARD_TIERS].map(t => (
              <button
                key={t} onClick={() => setTier(t)} aria-pressed={tier === t}
                className={`px-4 py-2 rounded-xl text-sm font-display font-semibold border-2 transition-all ${tier === t ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20" : "bg-white text-slate-500 border-gray-200 hover:border-red-200 hover:text-slate-900"}`}
              >
                {t === "all" ? `Tümü (${CLUBCARD_PARTNERS.length})` : `%${t}`}
              </button>
            ))}
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-slate-400">Aramana uyan işletme bulunamadı.</p>
              <button onClick={() => { setQuery(""); setTier("all"); }} className="mt-3 text-sm font-display font-semibold text-red-500 hover:text-red-600">Filtreleri temizle</button>
            </div>
          ) : (
            <div className="space-y-12">
              {groups.map(g => (
                <div key={g.t}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-display font-extrabold text-2xl md:text-3xl text-red-500">%{g.t}</span>
                    <span className="text-sm font-display font-semibold text-slate-900">indirim</span>
                    <span className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-slate-400">{g.items.length} işletme</span>
                  </div>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {g.items.map((p, i) => <PartnerCard key={p.name} p={p} i={i} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 md:py-20 bg-slate-50 bg-dots">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">Nasıl kullanılır?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: UserCheck, t: "GKT Mutfak'ta ol", d: "Club Card, GKT Mutfak üyelerine verilir. Kartın dönem boyunca geçerlidir." },
              { icon: CreditCard, t: "Kartını göster", d: "Anlaşmalı işletmede ödemeden önce GKT Club Card'ını göster." },
              { icon: BadgePercent, t: "İndirimini al", d: "Listede yazan oranda indirim, belirtilen şubede uygulanır." },
            ].map((s, i) => (
              <div key={s.t} className="relative bg-white rounded-2xl border border-gray-100 p-6 md:p-7">
                <span className="absolute top-5 right-6 font-display font-extrabold text-4xl text-slate-100">{i + 1}</span>
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4"><s.icon className="w-5 h-5 text-red-500" /></div>
                <h3 className="font-display font-bold text-slate-900">{s.t}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 md:p-5">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs md:text-sm text-amber-900/80 leading-relaxed">
              Oranlar ve şubeler {CLUBCARD_PERIOD} dönemi için geçerlidir. Yeni işletmeler eklendikçe bu sayfa güncellenir. Kartının arkasındaki <ScanLine className="inline w-3.5 h-3.5 -mt-0.5" /> QR kod her zaman bu sayfayı açar.
            </p>
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-rose-600 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4"><Store className="w-5 h-5 text-white" /></div>
                <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white leading-tight">İşletmeni Club Card'a ekle</h2>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">Akdeniz Üniversitesi'nin en aktif öğrenci topluluklarından birinin üyelerine ulaşmak ister misin? Kurumsal İlişkiler ekibimizle iletişime geç.</p>
              </div>
              <Link to="/iletisim" className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-600 hover:bg-red-50 font-display font-semibold rounded-xl shadow-xl shadow-black/10 transition-all active:scale-[0.97] no-underline">
                Bize ulaş <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
