import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CreditCard, MapPin, Search, RotateCcw, UserCheck, ScanLine, BadgePercent, Store, ArrowRight, Info, Navigation, Gift, X } from "lucide-react";
import { fetchClubcard } from "./api";
import { CLUBCARD_PARTNERS, CLUBCARD_PERIOD, maxDiscount, partnerTiers, hasPerk, conditionList } from "./clubcardData";

const normalize = (s) => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
const PERK = "perk";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2";

const mapsUrl = (p) => {
  if (p.maps_url) return p.maps_url;
  const area = !p.branch || p.branch.startsWith("Tüm") ? "" : ` ${p.branch.replace(/ Şubesi$/, "").replace(/ şubeleri$/i, "")}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}${area} Antalya`)}`;
};
const whatsappUrl = (p) => `https://wa.me/${p.whatsapp}?text=${encodeURIComponent("Merhaba, GKT Club Card üyesi olarak ulaşıyorum.")}`;

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.39 9.39 0 0 1-1.44-5.01c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.43 9.42Zm8.02-17.45A11.27 11.27 0 0 0 12.05.72C5.8.72.72 5.8.71 12.04c0 2 .52 3.95 1.52 5.66L.62 23.28l5.7-1.5a11.3 11.3 0 0 0 5.4 1.38h.01c6.25 0 11.33-5.08 11.34-11.33 0-3.03-1.18-5.87-3.32-8.01Z" />
    </svg>
  );
}

function OfferRow({ o }) {
  if (!o.discount) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-3 py-2.5">
        <Gift className="w-4 h-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
        <span className="text-sm font-display font-semibold text-slate-900 leading-snug">{o.scope}</span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-2 rounded-xl bg-red-50 px-3 py-2">
      <span className="font-display font-extrabold text-xl text-red-600 leading-none">%{o.discount}</span>
      <span className="text-sm text-slate-700">{o.scope ? <><span className="font-semibold">{o.scope}</span> indirim</> : "indirim"}</span>
    </div>
  );
}

function PartnerCard({ p, i }) {
  const conds = conditionList(p);
  const wa = p.contact === "whatsapp" && p.whatsapp;
  return (
    <article className="flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all overflow-hidden anim-fade" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
      <div className="h-32 flex items-center justify-center px-10 py-5 border-b border-gray-100">
        {p.logo_path
          ? <img src={p.logo_path} alt={`${p.name} logosu`} loading="lazy" className="max-h-full max-w-full object-contain" />
          : <span className="font-display font-extrabold text-xl text-slate-300">{p.name}</span>}
      </div>
      <div className="flex-1 flex flex-col p-5">
        <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
        {p.category && <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>}

        <div className="mt-4 space-y-2">
          {p.offers.map((o, k) => <OfferRow key={k} o={o} />)}
        </div>

        {conds.length > 0 && (
          <ul className="mt-3 space-y-1" aria-label="Koşullar">
            {conds.map(c => (
              <li key={c} className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-amber-600 mt-px shrink-0" aria-hidden="true" /> {c}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4">
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="inline-flex items-start gap-1.5 text-xs text-slate-600 min-w-0 leading-snug">
              {p.branch ? <><MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-px" aria-hidden="true" /><span>{p.branch}</span></> : <span className="text-slate-500">Online hizmet</span>}
            </span>
            {wa ? (
              <a href={whatsappUrl(p)} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} ile WhatsApp'tan yazış`}
                className={`shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 -mr-1 rounded-xl text-xs font-display font-bold text-emerald-700 hover:bg-emerald-50 transition-colors no-underline ${FOCUS}`}>
                <WhatsAppIcon className="w-4 h-4" /> WhatsApp
              </a>
            ) : p.contact !== "none" && p.contact !== "whatsapp" ? (
              <a href={mapsUrl(p)} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} konumunu haritada aç`}
                className={`shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 -mr-1 rounded-xl text-xs font-display font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors no-underline ${FOCUS}`}>
                <Navigation className="w-3.5 h-3.5" aria-hidden="true" /> Yol tarifi
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" aria-hidden="true">
      <div className="h-32 bg-slate-50 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
        <div className="h-10 rounded-xl bg-slate-50 animate-pulse" />
      </div>
    </div>
  );
}

export default function ClubCardPage() {
  const [data, setData] = useState(null);
  const [tier, setTier] = useState("all");
  const [query, setQuery] = useState("");
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchClubcard().then(d => {
      if (!alive) return;
      const ok = d && Array.isArray(d.partners) && d.partners.length > 0;
      setData(ok ? { period: d.period || CLUBCARD_PERIOD, partners: d.partners } : { period: CLUBCARD_PERIOD, partners: CLUBCARD_PARTNERS });
    });
    return () => { alive = false; };
  }, []);

  const partners = data?.partners || [];
  const period = data?.period || CLUBCARD_PERIOD;
  const tiers = useMemo(() => partnerTiers(partners), [partners]);
  const perkCount = partners.filter(hasPerk).length;
  const top = tiers[0] || 0;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return partners.filter(p =>
      (tier === "all" || (tier === PERK ? hasPerk(p) : p.offers.some(o => o.discount === tier))) &&
      (!q || normalize(`${p.name} ${p.category} ${p.branch} ${p.offers.map(o => o.scope).join(" ")}`).includes(q))
    );
  }, [partners, tier, query]);

  // "Tümü"de her işletme en yüksek oranının grubunda bir kez görünür; oran filtresinde o oranın grubunda.
  const groups = useMemo(() => {
    const keyOf = (p) => tier === "all" ? (maxDiscount(p) || PERK) : tier;
    const keys = [...tiers, PERK].filter(k => tier === "all" || k === tier);
    return keys.map(k => ({ k, items: filtered.filter(p => keyOf(p) === k) })).filter(g => g.items.length);
  }, [filtered, tiers, tier]);

  const chips = [{ k: "all", label: `Tümü (${partners.length})` }, ...tiers.map(t => ({ k: t, label: `%${t}` })), ...(perkCount ? [{ k: PERK, label: "Ayrıcalıklar" }] : [])];

  return (
    <>
      <Helmet>
        <title>GKT Club Card | Akdeniz GKT</title>
        <meta name="description" content={`GKT Club Card ile GKT Mutfak üyeleri Antalya'daki anlaşmalı işletmelerde %${top || 25}'e varan indirimden yararlanır. ${period} dönemi güncel listesi.`} />
        <link rel="canonical" href="https://akdenizgkt.com/clubcard" />
        {/* Yönetim kararı: yalnızca link/QR ile açılır, arama sonuçlarında listelenmez (server/seo.js ile aynı) */}
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="GKT Club Card — Bir kart, birçok ayrıcalık" />
        <meta property="og:description" content={`GKT Mutfak üyelerine anlaşmalı işletmelerde %${top || 25}'e varan indirim.`} />
        <meta property="og:image" content="https://akdenizgkt.com/assets/clubcard/kart-on.jpg" />
        <meta property="og:url" content="https://akdenizgkt.com/clubcard" />
      </Helmet>

      {/* HEADER */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-red-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl anim-fade">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-display font-semibold mb-5">
                <CreditCard className="w-3.5 h-3.5" aria-hidden="true" /> GKT Mutfak'a özel
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
                GKT <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">Club Card</span>
              </h1>
              <p className="mt-2 text-xs md:text-sm font-display font-semibold tracking-[0.3em] text-white/60 uppercase">Bir kart, birçok ayrıcalık</p>
              <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed">
                GKT Mutfak üyelerine Antalya'daki anlaşmalı işletmelerde indirim sağlayan bir GKT girişimi. Kafeden spor salonuna, burgerciden parfümeriye; kartını göster, indirimini al.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                {[
                  { v: data ? partners.length : "…", l: "İşletme" },
                  { v: top ? `%${top}'e` : "…", l: "varan indirim" },
                  { v: period, l: "Dönem" },
                ].map(s => (
                  <div key={s.l} className="flex flex-col-reverse rounded-xl bg-white/[0.06] border border-white/10 px-3 py-3 text-center">
                    <dt className="mt-1.5 text-xs text-white/60 leading-tight">{s.l}</dt>
                    <dd className="font-display font-extrabold text-white text-base sm:text-lg md:text-xl leading-none whitespace-nowrap">{s.v}</dd>
                  </div>
                ))}
              </dl>
              <a href="#isletmeler" className={`mt-8 inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-display font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.97] no-underline ${FOCUS} focus-visible:ring-offset-slate-900`}>
                İşletmeleri gör <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
            <div className="anim-scale" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto max-w-lg">
                <div className="absolute inset-4 rounded-3xl bg-red-500/30 blur-2xl" aria-hidden="true" />
                <img
                  src={`/assets/clubcard/${showBack ? "kart-arka" : "kart-on"}.webp`}
                  alt={showBack ? "GKT Club Card arka yüzü" : "GKT Club Card ön yüzü"}
                  width="1400" height="882"
                  className="relative w-full h-auto rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
                />
                <button onClick={() => setShowBack(b => !b)} className={`relative mt-4 mx-auto flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-display font-semibold transition-colors ${FOCUS} focus-visible:ring-offset-slate-900`}>
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> {showBack ? "Ön yüzü göster" : "Arka yüzü göster"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
      </section>

      {/* PARTNERS */}
      <section id="isletmeler" className="py-14 md:py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-display font-bold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" /> Anlaşmalı işletmeler
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">Kartın geçtiği yerler</h2>
              <p className="mt-2 text-sm text-slate-500">Koşulu olan işletmelerde koşul, kartın altında yazar.</p>
            </div>
            <div className="relative w-full md:w-80">
              <label htmlFor="cc-ara" className="sr-only">İşletme ara</label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="cc-ara" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="İşletme, kategori veya şube ara"
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-500/20 outline-none text-sm text-slate-700 placeholder:text-slate-400 transition-all"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Aramayı temizle" className={`absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 ${FOCUS}`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="sticky top-16 z-20 -mx-6 px-6 sm:mx-0 sm:px-0 py-3 mb-8 bg-white/95 backdrop-blur border-b border-gray-100 sm:border-0">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="İndirim oranına göre filtrele">
              {chips.map(c => (
                <button
                  key={c.k} onClick={() => setTier(c.k)} aria-pressed={tier === c.k}
                  className={`shrink-0 min-h-[44px] px-4 rounded-xl text-sm font-display font-semibold border-2 transition-all ${FOCUS} ${tier === c.k ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20" : "bg-white text-slate-600 border-gray-200 hover:border-red-200 hover:text-slate-900"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {!data ? (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-slate-500">Aramana uyan işletme bulunamadı.</p>
              <button onClick={() => { setQuery(""); setTier("all"); }} className={`mt-3 min-h-[44px] px-4 rounded-xl text-sm font-display font-semibold text-red-600 hover:text-red-700 ${FOCUS}`}>Filtreleri temizle</button>
            </div>
          ) : (
            <div className="space-y-12">
              {groups.map(g => (
                <div key={g.k}>
                  <h3 className="flex items-center gap-3 mb-5">
                    {g.k === PERK
                      ? <span className="inline-flex items-center gap-2 font-display font-extrabold text-2xl md:text-3xl text-red-600"><Gift className="w-6 h-6" aria-hidden="true" /> Ayrıcalıklar</span>
                      : <><span className="font-display font-extrabold text-2xl md:text-3xl text-red-600">%{g.k}</span><span className="text-sm font-display font-semibold text-slate-900">indirim</span></>}
                    <span className="flex-1 h-px bg-gray-100" aria-hidden="true" />
                    <span className="text-xs font-normal text-slate-500">{g.items.length} işletme</span>
                  </h3>
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {g.items.map((p, i) => <PartnerCard key={p.id ?? p.name} p={p} i={i} />)}
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
          <ol className="grid md:grid-cols-3 gap-5">
            {[
              { icon: UserCheck, t: "GKT Mutfak'ta ol", d: "Club Card, GKT Mutfak üyelerine verilir ve dönem boyunca geçerlidir." },
              { icon: CreditCard, t: "Kartını göster", d: "Anlaşmalı işletmede ödemeden önce GKT Club Card'ını göster." },
              { icon: BadgePercent, t: "İndirimini al", d: "İndirim, bu sayfada yazan oran, şube ve koşullarla uygulanır." },
            ].map((s, i) => (
              <li key={s.t} className="relative bg-white rounded-2xl border border-gray-100 p-6 md:p-7">
                <span className="absolute top-5 right-6 font-display font-extrabold text-4xl text-slate-100" aria-hidden="true">{i + 1}</span>
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4"><s.icon className="w-5 h-5 text-red-600" aria-hidden="true" /></div>
                <h3 className="font-display font-bold text-slate-900">{s.t}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 md:p-5">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-900 leading-relaxed">
              Oranlar ve koşullar {period} dönemi için geçerlidir; yeni işletmeler eklendikçe bu sayfa güncellenir. Kartının arkasındaki <ScanLine className="inline w-3.5 h-3.5 -mt-0.5" aria-hidden="true" /> QR kod her zaman bu sayfayı açar.
            </p>
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-700 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4"><Store className="w-5 h-5 text-white" aria-hidden="true" /></div>
                <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white leading-tight">İşletmeni Club Card'a ekle</h2>
                <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">Akdeniz Üniversitesi'nin en aktif öğrenci topluluklarından birinin üyelerine ulaşmak ister misin? Kurumsal İlişkiler ekibimizle iletişime geç.</p>
              </div>
              <Link to="/iletisim" className={`shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3.5 bg-white text-red-600 hover:bg-red-50 font-display font-bold rounded-xl shadow-xl shadow-black/10 transition-all active:scale-[0.97] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600`}>
                Bize ulaş <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
