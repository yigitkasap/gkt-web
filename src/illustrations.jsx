/* Event card illustrations — displayed on gradient backgrounds */
export function EventIllustration({ category, title }) {
  // Title-specific illustration for UGZ
  if (title && title.includes('Ulusal Girişimcilik Zirvesi')) {
    return (
      <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
        {/* Background glow */}
        <circle cx="200" cy="100" r="140" fill="white" fillOpacity="0.03" />
        <circle cx="350" cy="25" r="80" fill="white" fillOpacity="0.04" />
        <circle cx="40" cy="175" r="55" fill="white" fillOpacity="0.03" />
        {/* Stage / podium */}
        <rect x="100" y="140" width="200" height="8" rx="4" fill="white" fillOpacity="0.2" />
        <rect x="80" y="148" width="240" height="4" rx="2" fill="white" fillOpacity="0.12" />
        <rect x="155" y="95" width="90" height="45" rx="5" fill="white" fillOpacity="0.1" />
        <rect x="165" y="100" width="70" height="30" rx="3" fill="white" fillOpacity="0.06" />
        {/* Main podium screen */}
        <rect x="170" y="105" width="60" height="20" rx="2" fill="white" fillOpacity="0.08" />
        <rect x="178" y="110" width="44" height="3" rx="1.5" fill="white" fillOpacity="0.15" />
        <rect x="178" y="116" width="35" height="2" rx="1" fill="white" fillOpacity="0.1" />
        {/* Microphone center */}
        <circle cx="200" cy="78" r="8" fill="white" fillOpacity="0.25" />
        <rect x="198" y="86" width="4" height="14" rx="2" fill="white" fillOpacity="0.2" />
        <rect x="192" y="100" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.15" />
        {/* Left speaker at podium */}
        <circle cx="130" cy="115" r="10" fill="white" fillOpacity="0.08" />
        <circle cx="130" cy="112" r="4" fill="white" fillOpacity="0.15" />
        <path d="M124 120 C124 117, 136 117, 136 120" fill="white" fillOpacity="0.1" />
        <rect x="125" y="122" width="10" height="18" rx="2" fill="white" fillOpacity="0.06" />
        {/* Right speaker at podium */}
        <circle cx="270" cy="115" r="10" fill="white" fillOpacity="0.08" />
        <circle cx="270" cy="112" r="4" fill="white" fillOpacity="0.15" />
        <path d="M264 120 C264 117, 276 117, 276 120" fill="white" fillOpacity="0.1" />
        <rect x="265" y="122" width="10" height="18" rx="2" fill="white" fillOpacity="0.06" />
        {/* Audience — 3 rows of dots */}
        {[160,170,180,190,200,210,220,230,240].map((x,i) => <circle key={'r1'+i} cx={x} cy="165" r={3.5} fill="white" fillOpacity={0.12 + (i%3)*0.02} />)}
        {[150,162,174,186,198,210,222,234,246,254].map((x,i) => <circle key={'r2'+i} cx={x} cy="178" r={3} fill="white" fillOpacity={0.08 + (i%3)*0.02} />)}
        {[142,155,168,181,194,207,220,233,246,259].map((x,i) => <circle key={'r3'+i} cx={x} cy="190" r={2.5} fill="white" fillOpacity={0.05 + (i%3)*0.01} />)}
        {/* Rising bars — growth chart right side */}
        <rect x="310" y="130" width="10" height="30" rx="2" fill="white" fillOpacity="0.08" />
        <rect x="325" y="110" width="10" height="50" rx="2" fill="white" fillOpacity="0.1" />
        <rect x="340" y="85" width="10" height="75" rx="2" fill="white" fillOpacity="0.13" />
        <rect x="355" y="60" width="10" height="100" rx="2" fill="white" fillOpacity="0.16" />
        {/* Arrow up on chart */}
        <path d="M360 50 L363 42 L366 50" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
        <line x1="363" y1="42" x2="363" y2="58" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
        {/* Left side — lightbulb (innovation) */}
        <circle cx="55" cy="60" r="16" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
        <path d="M48 60 C48 50, 62 50, 62 60 C62 65, 58 68, 58 72 L52 72 C52 68, 48 65, 48 60" fill="white" fillOpacity="0.12" />
        <rect x="51" y="73" width="8" height="3" rx="1.5" fill="white" fillOpacity="0.15" />
        <rect x="52" y="78" width="6" height="2" rx="1" fill="white" fillOpacity="0.12" />
        {/* Rays from lightbulb */}
        <line x1="55" y1="38" x2="55" y2="32" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="38" y1="48" x2="33" y2="44" stroke="white" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="72" y1="48" x2="77" y2="44" stroke="white" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="35" y1="65" x2="29" y2="65" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="75" y1="65" x2="81" y2="65" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" strokeLinecap="round" />
        {/* Rocket — top right */}
        <path d="M320 20 C320 10, 335 10, 335 20 L335 40 C335 42, 320 42, 320 40 Z" fill="white" fillOpacity="0.12" />
        <polygon points="320,40 327,48 320,45" fill="white" fillOpacity="0.1" />
        <polygon points="335,40 328,48 335,45" fill="white" fillOpacity="0.1" />
        <circle cx="327" cy="25" r="3" fill="white" fillOpacity="0.2" />
        {/* Rocket flame */}
        <path d="M325 48 L327 56 L330 48" fill="white" fillOpacity="0.15" />
        {/* Confetti */}
        <rect x="90" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.1" transform="rotate(25 92 25)" />
        <rect x="280" y="15" width="3" height="8" rx="1" fill="white" fillOpacity="0.08" transform="rotate(-20 281 19)" />
        <circle cx="110" cy="40" r="2.5" fill="white" fillOpacity="0.12" />
        <circle cx="285" y="45" r="2" fill="white" fillOpacity="0.1" />
        {/* Stars */}
        <path d="M50 130 L52 125 L54 130 L59 131 L55 134 L56 139 L52 136 L48 139 L49 134 L45 131 Z" fill="white" fillOpacity="0.1" />
        <path d="M75 100 L76 97 L77 100 L80 101 L78 103 L78.5 106 L76 104 L73.5 106 L74 103 L72 101 Z" fill="white" fillOpacity="0.08" />
      </svg>
    );
  }
  switch (category) {
    case 'Zirve':
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="360" cy="25" r="70" fill="white" fillOpacity="0.06" />
          <circle cx="30" cy="180" r="45" fill="white" fillOpacity="0.04" />
          <rect x="100" y="130" width="200" height="6" rx="3" fill="white" fillOpacity="0.15" />
          <rect x="150" y="85" width="100" height="45" rx="6" fill="white" fillOpacity="0.1" />
          <rect x="130" y="100" width="20" height="30" rx="3" fill="white" fillOpacity="0.08" />
          <rect x="250" y="95" width="20" height="35" rx="3" fill="white" fillOpacity="0.08" />
          <circle cx="200" cy="68" r="10" fill="white" fillOpacity="0.25" />
          <rect x="198" y="78" width="4" height="12" rx="2" fill="white" fillOpacity="0.2" />
          <rect x="194" y="90" width="12" height="2" rx="1" fill="white" fillOpacity="0.15" />
          <circle cx="120" cy="155" r="4" fill="white" fillOpacity="0.12" />
          <circle cx="140" cy="152" r="5" fill="white" fillOpacity="0.1" />
          <circle cx="160" cy="154" r="4" fill="white" fillOpacity="0.13" />
          <circle cx="180" cy="150" r="6" fill="white" fillOpacity="0.11" />
          <circle cx="200" cy="153" r="4" fill="white" fillOpacity="0.12" />
          <circle cx="220" cy="151" r="5" fill="white" fillOpacity="0.1" />
          <circle cx="240" cy="155" r="4" fill="white" fillOpacity="0.13" />
          <circle cx="260" cy="152" r="5" fill="white" fillOpacity="0.11" />
          <circle cx="280" cy="154" r="4" fill="white" fillOpacity="0.12" />
          <rect x="310" y="110" width="14" height="50" rx="3" fill="white" fillOpacity="0.08" />
          <rect x="330" y="90" width="14" height="70" rx="3" fill="white" fillOpacity="0.1" />
          <rect x="350" y="65" width="14" height="95" rx="3" fill="white" fillOpacity="0.13" />
        </svg>
      );
    case 'Kariyer':
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="340" cy="40" r="80" fill="white" fillOpacity="0.05" />
          <circle cx="60" cy="160" r="50" fill="white" fillOpacity="0.04" />
          <rect x="155" y="55" width="90" height="110" rx="6" fill="white" fillOpacity="0.1" />
          <rect x="165" y="70" width="50" height="4" rx="2" fill="white" fillOpacity="0.2" />
          <rect x="165" y="82" width="70" height="3" rx="1.5" fill="white" fillOpacity="0.12" />
          <rect x="165" y="92" width="60" height="3" rx="1.5" fill="white" fillOpacity="0.12" />
          <rect x="165" y="102" width="65" height="3" rx="1.5" fill="white" fillOpacity="0.12" />
          <rect x="165" y="116" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
          <rect x="165" y="126" width="55" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
          <rect x="165" y="140" width="30" height="12" rx="3" fill="white" fillOpacity="0.15" />
          <circle cx="80" cy="90" r="18" fill="white" fillOpacity="0.08" />
          <circle cx="80" cy="90" r="6" fill="white" fillOpacity="0.15" />
          <path d="M68 115 C68 105, 92 105, 92 115" stroke="white" strokeOpacity="0.12" strokeWidth="2" fill="none" />
          <circle cx="320" cy="110" r="18" fill="white" fillOpacity="0.08" />
          <circle cx="320" cy="110" r="6" fill="white" fillOpacity="0.15" />
          <path d="M308 135 C308 125, 332 125, 332 135" stroke="white" strokeOpacity="0.12" strokeWidth="2" fill="none" />
          <line x1="98" y1="95" x2="155" y2="95" stroke="white" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="245" y1="95" x2="302" y2="110" stroke="white" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      );
    case 'Gezi':
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="350" cy="35" r="65" fill="white" fillOpacity="0.05" />
          <circle cx="40" cy="170" r="40" fill="white" fillOpacity="0.04" />
          <path d="M60 160 L120 160 L120 110 L100 95 L80 110 L80 160" stroke="white" strokeOpacity="0.15" strokeWidth="2" fill="white" fillOpacity="0.05" />
          <rect x="88" y="130" width="16" height="30" rx="1" fill="white" fillOpacity="0.1" />
          <rect x="140" y="120" width="60" height="40" rx="3" fill="white" fillOpacity="0.08" />
          <rect x="210" y="105" width="50" height="55" rx="3" fill="white" fillOpacity="0.06" />
          <rect x="270" y="115" width="45" height="45" rx="3" fill="white" fillOpacity="0.07" />
          <path d="M50 170 Q200 150, 350 170" stroke="white" strokeOpacity="0.12" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          <circle cx="100" cy="165" r="5" fill="white" fillOpacity="0.2" />
          <line x1="100" y1="160" x2="100" y2="150" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <circle cx="250" cy="160" r="5" fill="white" fillOpacity="0.2" />
          <line x1="250" y1="155" x2="250" y2="145" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <circle cx="340" cy="165" r="5" fill="white" fillOpacity="0.2" />
          <line x1="340" y1="160" x2="340" y2="150" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
        </svg>
      );
    case 'Workshop':
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="350" cy="30" r="70" fill="white" fillOpacity="0.05" />
          <circle cx="50" cy="175" r="40" fill="white" fillOpacity="0.04" />
          <circle cx="200" cy="50" r="22" fill="white" fillOpacity="0.08" />
          <path d="M200 28 L200 18" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M184 34 L178 26" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M216 34 L222 26" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M178 50 L168 50" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M222 50 L232 50" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <rect x="100" y="90" width="80" height="100" rx="4" fill="white" fillOpacity="0.08" />
          <rect x="108" y="100" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.15" />
          <rect x="108" y="110" width="64" height="3" rx="1.5" fill="white" fillOpacity="0.12" />
          <rect x="108" y="120" width="55" height="3" rx="1.5" fill="white" fillOpacity="0.12" />
          <rect x="108" y="134" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
          <rect x="108" y="144" width="58" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
          <circle cx="290" cy="120" r="30" fill="white" fillOpacity="0.06" />
          <path d="M275 120 A15 15 0 0 1 305 120" stroke="white" strokeOpacity="0.15" strokeWidth="3" fill="none" />
          <circle cx="290" cy="120" r="5" fill="white" fillOpacity="0.15" />
          <rect x="285" y="90" width="10" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
          <rect x="315" y="115" width="10" height="3" rx="1.5" fill="white" fillOpacity="0.1" />
        </svg>
      );
    case 'Sosyal':
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="355" cy="30" r="65" fill="white" fillOpacity="0.05" />
          <circle cx="45" cy="170" r="45" fill="white" fillOpacity="0.04" />
          <circle cx="160" cy="90" r="20" fill="white" fillOpacity="0.08" />
          <circle cx="160" cy="90" r="7" fill="white" fillOpacity="0.15" />
          <path d="M146 118 C146 106, 174 106, 174 118" stroke="white" strokeOpacity="0.12" strokeWidth="2" fill="none" />
          <circle cx="240" cy="90" r="20" fill="white" fillOpacity="0.08" />
          <circle cx="240" cy="90" r="7" fill="white" fillOpacity="0.15" />
          <path d="M226 118 C226 106, 254 106, 254 118" stroke="white" strokeOpacity="0.12" strokeWidth="2" fill="none" />
          <path d="M180 90 L220 90" stroke="white" strokeOpacity="0.15" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M185 140 Q200 125, 215 140" stroke="white" strokeOpacity="0.2" strokeWidth="2" fill="none" />
          <circle cx="200" cy="145" r="12" fill="white" fillOpacity="0.06" />
          <path d="M194 145 L200 139 L206 145" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="60" r="4" fill="white" fillOpacity="0.1" />
          <circle cx="300" cy="55" r="3" fill="white" fillOpacity="0.08" />
          <circle cx="320" cy="150" r="5" fill="white" fillOpacity="0.07" />
          <circle cx="80" cy="130" r="3" fill="white" fillOpacity="0.09" />
        </svg>
      );
    case 'Konser':
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="350" cy="30" r="70" fill="white" fillOpacity="0.05" />
          <circle cx="50" cy="170" r="40" fill="white" fillOpacity="0.04" />
          <circle cx="200" cy="80" r="15" fill="white" fillOpacity="0.12" />
          <rect x="213" y="80" width="3" height="60" rx="1.5" fill="white" fillOpacity="0.15" />
          <path d="M216 85 L230 78 L230 95 L216 100" fill="white" fillOpacity="0.1" />
          <path d="M120 140 Q160 100, 200 140 Q240 180, 280 140" stroke="white" strokeOpacity="0.1" strokeWidth="2" fill="none" />
          <path d="M100 150 Q160 115, 200 150 Q240 185, 300 150" stroke="white" strokeOpacity="0.07" strokeWidth="2" fill="none" />
          <circle cx="130" cy="60" r="3" fill="white" fillOpacity="0.15" />
          <circle cx="270" cy="50" r="4" fill="white" fillOpacity="0.12" />
          <circle cx="310" cy="80" r="2" fill="white" fillOpacity="0.15" />
          <circle cx="90" cy="100" r="3" fill="white" fillOpacity="0.1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
          <circle cx="350" cy="30" r="70" fill="white" fillOpacity="0.06" />
          <circle cx="50" cy="170" r="45" fill="white" fillOpacity="0.04" />
          <path d="M190 120 L200 60 L210 120 Z" fill="white" fillOpacity="0.1" />
          <rect x="185" y="120" width="30" height="8" rx="2" fill="white" fillOpacity="0.12" />
          <circle cx="200" cy="55" r="4" fill="white" fillOpacity="0.2" />
          <path d="M170 100 L185 120" stroke="white" strokeOpacity="0.08" strokeWidth="2" />
          <path d="M230 100 L215 120" stroke="white" strokeOpacity="0.08" strokeWidth="2" />
          <circle cx="130" cy="50" r="3" fill="white" fillOpacity="0.15" />
          <circle cx="270" cy="45" r="2" fill="white" fillOpacity="0.12" />
          <circle cx="300" cy="80" r="4" fill="white" fillOpacity="0.08" />
          <circle cx="100" cy="90" r="2" fill="white" fillOpacity="0.1" />
          <circle cx="310" cy="140" r="3" fill="white" fillOpacity="0.07" />
        </svg>
      );
  }
}

/* Blog card illustrations — includes its own background gradient */
const BLOG_STYLES = {
  'Duyuru': { bg: 'from-red-50 to-rose-100', color: 'text-red-300' },
  'Haber': { bg: 'from-emerald-50 to-teal-100', color: 'text-emerald-300' },
  'Etkinlik': { bg: 'from-violet-50 to-purple-100', color: 'text-violet-300' },
  'Röportaj': { bg: 'from-amber-50 to-orange-100', color: 'text-amber-300' },
};

// Slug-specific detailed illustrations for featured blog posts
function SlugIllustration({ slug }) {
  switch (slug) {
    // CV Hazırlama Rehberi — CV belgesi, kalem, checklist, profil, yıldızlar
    case 'etkili-cv-hazirlama-staj-bulma-ve-mulakat-teknikleri-universite-ogrencileri-icin-kariyer-rehberi':
      return (
        <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center text-emerald-400">
          <svg viewBox="0 0 400 160" fill="none" className="w-full h-full">
            {/* Background decorations */}
            <circle cx="360" cy="15" r="80" fill="currentColor" fillOpacity="0.07" />
            <circle cx="30" cy="145" r="50" fill="currentColor" fillOpacity="0.07" />
            <circle cx="200" cy="80" r="120" fill="currentColor" fillOpacity="0.04" />
            {/* Floating dots pattern */}
            <circle cx="45" cy="25" r="2" fill="currentColor" fillOpacity="0.26" />
            <circle cx="75" cy="45" r="1.5" fill="currentColor" fillOpacity="0.18" />
            <circle cx="355" cy="130" r="2" fill="currentColor" fillOpacity="0.22" />
            <circle cx="325" cy="35" r="1.5" fill="currentColor" fillOpacity="0.18" />
            <circle cx="280" cy="15" r="2" fill="currentColor" fillOpacity="0.13" />
            {/* Main CV Document */}
            <rect x="145" y="15" width="110" height="130" rx="6" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.33" strokeWidth="1" />
            <rect x="145" y="15" width="110" height="28" rx="6" fill="currentColor" fillOpacity="0.18" />
            {/* Photo placeholder on CV */}
            <circle cx="172" cy="30" r="8" fill="currentColor" fillOpacity="0.33" />
            <rect x="188" y="24" width="55" height="4" rx="2" fill="currentColor" fillOpacity="0.44" />
            <rect x="188" y="32" width="40" height="3" rx="1.5" fill="currentColor" fillOpacity="0.26" />
            {/* CV content lines */}
            <rect x="157" y="52" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.40" />
            <rect x="157" y="61" width="85" height="2.5" rx="1.25" fill="currentColor" fillOpacity="0.22" />
            <rect x="157" y="69" width="78" height="2.5" rx="1.25" fill="currentColor" fillOpacity="0.22" />
            <rect x="157" y="77" width="82" height="2.5" rx="1.25" fill="currentColor" fillOpacity="0.18" />
            {/* Skills section */}
            <rect x="157" y="90" width="25" height="3" rx="1.5" fill="currentColor" fillOpacity="0.40" />
            <rect x="157" y="99" width="20" height="8" rx="4" fill="currentColor" fillOpacity="0.26" />
            <rect x="181" y="99" width="24" height="8" rx="4" fill="currentColor" fillOpacity="0.22" />
            <rect x="209" y="99" width="18" height="8" rx="4" fill="currentColor" fillOpacity="0.18" />
            <rect x="157" y="112" width="22" height="8" rx="4" fill="currentColor" fillOpacity="0.18" />
            <rect x="183" y="112" width="26" height="8" rx="4" fill="currentColor" fillOpacity="0.22" />
            {/* Experience bar */}
            <rect x="157" y="126" width="85" height="3" rx="1.5" fill="currentColor" fillOpacity="0.13" />
            <rect x="157" y="126" width="55" height="3" rx="1.5" fill="currentColor" fillOpacity="0.33" />
            {/* Left: Pen writing */}
            <rect x="55" y="50" width="4" height="55" rx="2" fill="currentColor" fillOpacity="0.40" transform="rotate(-15 57 77)" />
            <polygon points="55,105 59,105 57,112" fill="currentColor" fillOpacity="0.55" transform="rotate(-15 57 108)" />
            <path d="M68 108 C75 100, 85 95, 95 98" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" fill="none" strokeDasharray="3 3" />
            {/* Right: Checklist */}
            <rect x="290" y="35" width="75" height="90" rx="5" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
            <rect x="300" y="45" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.33" />
            <path d="M302 49 L305 52 L309 46" stroke="currentColor" strokeOpacity="0.66" strokeWidth="1.5" fill="none" />
            <rect x="314" y="47" width="38" height="3" rx="1.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="300" y="60" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.33" />
            <path d="M302 64 L305 67 L309 61" stroke="currentColor" strokeOpacity="0.66" strokeWidth="1.5" fill="none" />
            <rect x="314" y="62" width="42" height="3" rx="1.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="300" y="75" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.33" />
            <path d="M302 79 L305 82 L309 76" stroke="currentColor" strokeOpacity="0.66" strokeWidth="1.5" fill="none" />
            <rect x="314" y="77" width="35" height="3" rx="1.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="300" y="90" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <rect x="314" y="92" width="40" height="3" rx="1.5" fill="currentColor" fillOpacity="0.18" />
            <rect x="300" y="105" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <rect x="314" y="107" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.18" />
            {/* Star ratings */}
            <path d="M85 30 L87 25 L89 30 L95 31 L90 35 L92 41 L87 38 L82 41 L84 35 L79 31 Z" fill="currentColor" fillOpacity="0.33" />
            <path d="M105 18 L106.5 14 L108 18 L112 19 L109 22 L110 26 L106.5 24 L103 26 L104 22 L101 19 Z" fill="currentColor" fillOpacity="0.22" />
            <path d="M120 35 L121 32 L122 35 L125 36 L123 38 L123.5 41 L121 39.5 L118.5 41 L119 38 L117 36 Z" fill="currentColor" fillOpacity="0.18" />
          </svg>
        </div>
      );

    // LinkedIn Profili Optimize Etme — LinkedIn arayüz, profil, bağlantılar, network
    case 'linkedin-profili-nasil-optimize-edilir':
      return (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center text-blue-400">
          <svg viewBox="0 0 400 160" fill="none" className="w-full h-full">
            {/* Background */}
            <circle cx="350" cy="20" r="85" fill="currentColor" fillOpacity="0.07" />
            <circle cx="40" cy="140" r="55" fill="currentColor" fillOpacity="0.07" />
            {/* Floating dots */}
            <circle cx="55" cy="20" r="2" fill="currentColor" fillOpacity="0.22" />
            <circle cx="345" cy="140" r="2" fill="currentColor" fillOpacity="0.18" />
            <circle cx="310" cy="25" r="1.5" fill="currentColor" fillOpacity="0.13" />
            {/* Main LinkedIn profile card */}
            <rect x="120" y="10" width="160" height="140" rx="8" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            {/* Banner */}
            <rect x="120" y="10" width="160" height="35" rx="8" fill="currentColor" fillOpacity="0.22" />
            <rect x="120" y="35" width="160" height="10" fill="currentColor" fillOpacity="0.22" />
            {/* Profile photo */}
            <circle cx="160" cy="48" r="18" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.44" strokeWidth="1.5" />
            <circle cx="160" cy="44" r="6" fill="currentColor" fillOpacity="0.44" />
            <path d="M148 58 C148 52, 172 52, 172 58" fill="currentColor" fillOpacity="0.26" />
            {/* Name & headline */}
            <rect x="132" y="72" width="70" height="5" rx="2.5" fill="currentColor" fillOpacity="0.48" />
            <rect x="132" y="82" width="100" height="3" rx="1.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="132" y="89" width="80" height="3" rx="1.5" fill="currentColor" fillOpacity="0.18" />
            {/* Connection count */}
            <rect x="132" y="100" width="45" height="10" rx="5" fill="currentColor" fillOpacity="0.18" />
            <rect x="182" y="100" width="55" height="10" rx="5" fill="currentColor" fillOpacity="0.13" />
            {/* Skills tags */}
            <rect x="132" y="118" width="28" height="8" rx="4" fill="currentColor" fillOpacity="0.22" />
            <rect x="164" y="118" width="35" height="8" rx="4" fill="currentColor" fillOpacity="0.18" />
            <rect x="203" y="118" width="22" height="8" rx="4" fill="currentColor" fillOpacity="0.13" />
            <rect x="132" y="130" width="32" height="8" rx="4" fill="currentColor" fillOpacity="0.13" />
            <rect x="168" y="130" width="28" height="8" rx="4" fill="currentColor" fillOpacity="0.18" />
            {/* Left: Network connections */}
            <circle cx="55" cy="55" r="12" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <circle cx="55" cy="52" r="4" fill="currentColor" fillOpacity="0.33" />
            <path d="M48 61 C48 57, 62 57, 62 61" fill="currentColor" fillOpacity="0.22" />
            <circle cx="40" cy="95" r="10" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
            <circle cx="40" cy="92" r="3.5" fill="currentColor" fillOpacity="0.26" />
            <path d="M34 99 C34 96, 46 96, 46 99" fill="currentColor" fillOpacity="0.18" />
            <circle cx="80" cy="105" r="10" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
            <circle cx="80" cy="102" r="3.5" fill="currentColor" fillOpacity="0.26" />
            <path d="M74 109 C74 106, 86 106, 86 109" fill="currentColor" fillOpacity="0.18" />
            {/* Connection lines */}
            <line x1="65" y1="60" x2="120" y2="50" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="50" y1="90" x2="55" y2="67" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="75" y1="97" x2="55" y2="67" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="88" y1="100" x2="120" y2="90" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1" strokeDasharray="3 3" />
            {/* Right: Growth chart */}
            <rect x="310" y="55" width="70" height="80" rx="5" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            <polyline points="320,120 332,110 344,105 356,90 368,75" stroke="currentColor" strokeOpacity="0.44" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="320" cy="120" r="2.5" fill="currentColor" fillOpacity="0.44" />
            <circle cx="332" cy="110" r="2.5" fill="currentColor" fillOpacity="0.44" />
            <circle cx="344" cy="105" r="2.5" fill="currentColor" fillOpacity="0.44" />
            <circle cx="356" cy="90" r="2.5" fill="currentColor" fillOpacity="0.44" />
            <circle cx="368" cy="75" r="3" fill="currentColor" fillOpacity="0.55" />
            {/* Arrow up */}
            <path d="M365 68 L368 62 L371 68" stroke="currentColor" strokeOpacity="0.44" strokeWidth="1.5" fill="none" />
            {/* LinkedIn logo hint */}
            <rect x="247" y="100" width="16" height="16" rx="3" fill="currentColor" fillOpacity="0.26" />
            <rect x="250" y="107" width="3" height="6" rx="0.5" fill="white" fillOpacity="0.70" />
            <circle cx="251.5" cy="104.5" r="1.5" fill="white" fillOpacity="0.70" />
            <rect x="255" y="104" width="5" height="9" rx="0.5" fill="white" fillOpacity="0.70" />
          </svg>
        </div>
      );

    // Topluluk Üyeliği — takım, departmanlar, liderlik, beceri ağacı
    case 'universite-topluluk-uyeligi-kariyer-katkisi':
      return (
        <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center text-amber-400">
          <svg viewBox="0 0 400 160" fill="none" className="w-full h-full">
            {/* Background */}
            <circle cx="355" cy="18" r="80" fill="currentColor" fillOpacity="0.07" />
            <circle cx="35" cy="145" r="55" fill="currentColor" fillOpacity="0.07" />
            <circle cx="200" cy="80" r="100" fill="currentColor" fillOpacity="0.03" />
            {/* Floating particles */}
            <circle cx="50" cy="25" r="2" fill="currentColor" fillOpacity="0.26" />
            <circle cx="350" cy="135" r="2" fill="currentColor" fillOpacity="0.22" />
            <circle cx="90" cy="130" r="1.5" fill="currentColor" fillOpacity="0.13" />
            <circle cx="310" cy="30" r="1.5" fill="currentColor" fillOpacity="0.18" />
            {/* Center: Team circle — 5 people around a center */}
            <circle cx="200" cy="72" r="50" fill="none" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1" strokeDasharray="4 4" />
            {/* Center person (leader) */}
            <circle cx="200" cy="72" r="14" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.33" strokeWidth="1" />
            <circle cx="200" cy="68" r="5" fill="currentColor" fillOpacity="0.44" />
            <path d="M192 78 C192 74, 208 74, 208 78" fill="currentColor" fillOpacity="0.26" />
            {/* Top person */}
            <circle cx="200" cy="25" r="11" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <circle cx="200" cy="22" r="4" fill="currentColor" fillOpacity="0.33" />
            <path d="M194 29 C194 26, 206 26, 206 29" fill="currentColor" fillOpacity="0.22" />
            <line x1="200" y1="36" x2="200" y2="58" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            {/* Right person */}
            <circle cx="248" cy="92" r="11" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <circle cx="248" cy="89" r="4" fill="currentColor" fillOpacity="0.33" />
            <path d="M242 96 C242 93, 254 93, 254 96" fill="currentColor" fillOpacity="0.22" />
            <line x1="237" y1="88" x2="214" y2="78" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            {/* Left person */}
            <circle cx="152" cy="92" r="11" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <circle cx="152" cy="89" r="4" fill="currentColor" fillOpacity="0.33" />
            <path d="M146 96 C146 93, 158 93, 158 96" fill="currentColor" fillOpacity="0.22" />
            <line x1="163" y1="88" x2="186" y2="78" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            {/* Bottom-left person */}
            <circle cx="170" cy="130" r="11" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <circle cx="170" cy="127" r="4" fill="currentColor" fillOpacity="0.33" />
            <path d="M164 134 C164 131, 176 131, 176 134" fill="currentColor" fillOpacity="0.22" />
            <line x1="178" y1="122" x2="193" y2="86" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            {/* Bottom-right person */}
            <circle cx="230" cy="130" r="11" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <circle cx="230" cy="127" r="4" fill="currentColor" fillOpacity="0.33" />
            <path d="M224 134 C224 131, 236 131, 236 134" fill="currentColor" fillOpacity="0.22" />
            <line x1="222" y1="122" x2="207" y2="86" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            {/* Left: Skills tree */}
            <rect x="30" y="40" width="65" height="85" rx="5" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            <rect x="40" y="50" width="45" height="4" rx="2" fill="currentColor" fillOpacity="0.33" />
            <rect x="40" y="60" width="45" height="5" rx="2.5" fill="currentColor" fillOpacity="0.13" />
            <rect x="40" y="60" width="38" height="5" rx="2.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="40" y="72" width="45" height="5" rx="2.5" fill="currentColor" fillOpacity="0.13" />
            <rect x="40" y="72" width="30" height="5" rx="2.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="40" y="84" width="45" height="5" rx="2.5" fill="currentColor" fillOpacity="0.13" />
            <rect x="40" y="84" width="42" height="5" rx="2.5" fill="currentColor" fillOpacity="0.26" />
            <rect x="40" y="96" width="45" height="5" rx="2.5" fill="currentColor" fillOpacity="0.13" />
            <rect x="40" y="96" width="25" height="5" rx="2.5" fill="currentColor" fillOpacity="0.22" />
            <rect x="40" y="108" width="45" height="5" rx="2.5" fill="currentColor" fillOpacity="0.13" />
            <rect x="40" y="108" width="35" height="5" rx="2.5" fill="currentColor" fillOpacity="0.22" />
            {/* Right: Trophy / Achievement */}
            <rect x="305" y="35" width="70" height="90" rx="5" fill="white" fillOpacity="0.70" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            {/* Trophy */}
            <rect x="330" y="50" width="20" height="22" rx="3" fill="currentColor" fillOpacity="0.26" />
            <path d="M328 52 C322 52, 322 62, 328 64" stroke="currentColor" strokeOpacity="0.33" strokeWidth="1.5" fill="none" />
            <path d="M352 52 C358 52, 358 62, 352 64" stroke="currentColor" strokeOpacity="0.33" strokeWidth="1.5" fill="none" />
            <rect x="336" y="72" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.22" />
            <rect x="332" y="80" width="16" height="4" rx="2" fill="currentColor" fillOpacity="0.26" />
            {/* Achievement badges */}
            <circle cx="322" cy="100" r="7" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <path d="M320 100 L322 98 L324 100" stroke="currentColor" strokeOpacity="0.44" strokeWidth="1" fill="none" />
            <circle cx="340" cy="100" r="7" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
            <path d="M337 100 L340 97 L343 100" stroke="currentColor" strokeOpacity="0.44" strokeWidth="1" fill="none" />
            <circle cx="358" cy="100" r="7" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
            <path d="M355 100 L358 97 L361 100" stroke="currentColor" strokeOpacity="0.33" strokeWidth="1" fill="none" />
            {/* Confetti */}
            <rect x="110" y="15" width="4" height="8" rx="1" fill="currentColor" fillOpacity="0.22" transform="rotate(25 112 19)" />
            <rect x="280" y="10" width="3" height="7" rx="1" fill="currentColor" fillOpacity="0.18" transform="rotate(-15 281 13)" />
            <circle cx="130" cy="140" r="2.5" fill="currentColor" fillOpacity="0.18" />
            <circle cx="270" cy="145" r="2" fill="currentColor" fillOpacity="0.13" />
          </svg>
        </div>
      );

    // Güz Dönemi Üye Başvuruları — megafon, başvuru formu, departman ikonları, eller yukarı
    case 'guz-donemi-uye-basvurulari-basladi':
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center text-red-400">
          <svg viewBox="0 0 400 160" fill="none" className="w-full h-full">
            {/* Background */}
            <circle cx="355" cy="18" r="85" fill="currentColor" fillOpacity="0.05" />
            <circle cx="35" cy="145" r="55" fill="currentColor" fillOpacity="0.04" />
            {/* Confetti / celebration particles */}
            <rect x="60" y="15" width="5" height="12" rx="1.5" fill="currentColor" fillOpacity="0.18" transform="rotate(25 62 21)" />
            <rect x="340" y="10" width="4" height="10" rx="1" fill="currentColor" fillOpacity="0.15" transform="rotate(-20 342 15)" />
            <rect x="290" y="130" width="4" height="9" rx="1" fill="currentColor" fillOpacity="0.12" transform="rotate(35 292 134)" />
            <circle cx="85" cy="35" r="3" fill="currentColor" fillOpacity="0.2" />
            <circle cx="315" cy="25" r="2.5" fill="currentColor" fillOpacity="0.15" />
            <circle cx="45" cy="110" r="2" fill="currentColor" fillOpacity="0.12" />
            <circle cx="360" cy="110" r="2.5" fill="currentColor" fillOpacity="0.1" />
            <rect x="110" y="5" width="3" height="8" rx="1" fill="currentColor" fillOpacity="0.12" transform="rotate(-10 111 9)" />
            <rect x="250" y="145" width="3" height="7" rx="1" fill="currentColor" fillOpacity="0.1" transform="rotate(15 251 148)" />
            {/* Center: Megaphone / announcement */}
            <rect x="170" y="30" width="16" height="55" rx="8" fill="currentColor" fillOpacity="0.25" />
            <path d="M186 35 L240 18 L240 80 L186 85" fill="currentColor" fillOpacity="0.18" />
            <rect x="164" y="85" width="28" height="5" rx="2.5" fill="currentColor" fillOpacity="0.2" />
            {/* Sound waves */}
            <path d="M245 45 C255 40, 255 60, 245 55" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" fill="none" />
            <path d="M255 38 C270 30, 270 68, 255 62" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
            <path d="M265 32 C285 22, 285 78, 265 68" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" fill="none" />
            {/* Left: Application form */}
            <rect x="35" y="45" width="85" height="95" rx="6" fill="white" fillOpacity="0.65" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
            <rect x="35" y="45" width="85" height="22" rx="6" fill="currentColor" fillOpacity="0.12" />
            <rect x="35" y="61" width="85" height="6" fill="currentColor" fillOpacity="0.12" />
            <rect x="50" y="52" width="50" height="4" rx="2" fill="white" fillOpacity="0.7" />
            {/* Form fields */}
            <rect x="45" y="75" width="65" height="8" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />
            <rect x="49" y="77.5" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
            <rect x="45" y="90" width="65" height="8" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />
            <rect x="49" y="92.5" width="40" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
            <rect x="45" y="105" width="65" height="8" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />
            <rect x="49" y="107.5" width="25" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
            {/* Submit button on form */}
            <rect x="55" y="122" width="45" height="12" rx="6" fill="currentColor" fillOpacity="0.25" />
            <rect x="65" y="126" width="25" height="4" rx="2" fill="white" fillOpacity="0.6" />
            {/* Right: 4 Department icons in 2x2 grid */}
            <rect x="290" y="40" width="80" height="80" rx="8" fill="white" fillOpacity="0.45" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
            {/* Dept 1 - Medya (monitor) */}
            <rect x="302" y="52" width="22" height="16" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.8" />
            <rect x="310" y="68" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.15" />
            <rect x="306" y="72" width="14" height="2" rx="1" fill="currentColor" fillOpacity="0.12" />
            {/* Dept 2 - Etkinlik (calendar) */}
            <rect x="338" y="52" width="22" height="20" rx="3" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
            <rect x="338" y="52" width="22" height="7" rx="3" fill="currentColor" fillOpacity="0.2" />
            <rect x="342" y="62" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.18" />
            <rect x="349" y="62" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.15" />
            <rect x="356" y="62" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
            {/* Dept 3 - Kurumsal (handshake) */}
            <path d="M305 95 C305 90, 315 88, 318 92 C321 88, 328 90, 328 95 C328 100, 318 105, 316 108 C314 105, 305 100, 305 95" fill="currentColor" fillOpacity="0.15" />
            {/* Dept 4 - Üye İlişkileri (people) */}
            <circle cx="349" cy="92" r="5" fill="currentColor" fillOpacity="0.15" />
            <circle cx="349" cy="90" r="2.5" fill="currentColor" fillOpacity="0.22" />
            <circle cx="359" cy="95" r="4" fill="currentColor" fillOpacity="0.12" />
            <circle cx="359" cy="93.5" r="2" fill="currentColor" fillOpacity="0.18" />
            <path d="M342 100 C342 96, 356 96, 356 100" fill="currentColor" fillOpacity="0.12" />
            {/* Department labels */}
            <rect x="300" y="112" width="28" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
            <rect x="336" y="112" width="28" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />
            {/* Bottom: Raised hands / people joining */}
            <path d="M145 140 L148 125 L151 140" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="148" cy="122" r="4" fill="currentColor" fillOpacity="0.15" />
            <path d="M160 143 L163 130 L166 143" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="163" cy="127" r="3.5" fill="currentColor" fillOpacity="0.13" />
            <path d="M175 141 L178 128 L181 141" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="178" cy="125" r="4" fill="currentColor" fillOpacity="0.18" />
            <path d="M215 142 L218 129 L221 142" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="218" cy="126" r="3.5" fill="currentColor" fillOpacity="0.15" />
            <path d="M230 140 L233 126 L236 140" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="233" cy="123" r="4" fill="currentColor" fillOpacity="0.16" />
            <path d="M245 143 L248 131 L251 143" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="248" cy="128" r="3.5" fill="currentColor" fillOpacity="0.12" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}

export function BlogIllustration({ category, slug }) {
  // Check for slug-specific illustration first
  if (slug) {
    const specific = SlugIllustration({ slug });
    if (specific) return specific;
  }
  const style = BLOG_STYLES[category] || { bg: 'from-slate-50 to-slate-100', color: 'text-slate-300' };

  const svgContent = (() => {
    switch (category) {
      case 'Duyuru':
        return (
          <>
            <circle cx="340" cy="30" r="60" fill="currentColor" fillOpacity="0.06" />
            <circle cx="60" cy="140" r="40" fill="currentColor" fillOpacity="0.04" />
            <rect x="160" y="45" width="14" height="50" rx="7" fill="currentColor" fillOpacity="0.15" />
            <path d="M174 50 L220 35 L220 85 L174 95" fill="currentColor" fillOpacity="0.1" />
            <rect x="156" y="95" width="22" height="4" rx="2" fill="currentColor" fillOpacity="0.1" />
            <circle cx="220" cy="60" r="25" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="2" />
            <circle cx="220" cy="60" r="40" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1.5" />
            <circle cx="220" cy="60" r="55" fill="none" stroke="currentColor" strokeOpacity="0.03" strokeWidth="1" />
            <circle cx="100" cy="40" r="3" fill="currentColor" fillOpacity="0.1" />
            <circle cx="300" cy="100" r="4" fill="currentColor" fillOpacity="0.08" />
            <circle cx="80" cy="100" r="2" fill="currentColor" fillOpacity="0.07" />
          </>
        );
      case 'Haber':
        return (
          <>
            <circle cx="340" cy="25" r="65" fill="currentColor" fillOpacity="0.05" />
            <circle cx="55" cy="135" r="35" fill="currentColor" fillOpacity="0.04" />
            <rect x="130" y="30" width="140" height="110" rx="6" fill="currentColor" fillOpacity="0.06" />
            <rect x="140" y="42" width="80" height="4" rx="2" fill="currentColor" fillOpacity="0.15" />
            <rect x="140" y="55" width="120" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />
            <rect x="140" y="65" width="110" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />
            <rect x="140" y="75" width="100" height="3" rx="1.5" fill="currentColor" fillOpacity="0.08" />
            <rect x="140" y="92" width="50" height="35" rx="3" fill="currentColor" fillOpacity="0.08" />
            <rect x="200" y="92" width="60" height="3" rx="1.5" fill="currentColor" fillOpacity="0.08" />
            <rect x="200" y="102" width="55" height="3" rx="1.5" fill="currentColor" fillOpacity="0.07" />
            <rect x="200" y="112" width="50" height="3" rx="1.5" fill="currentColor" fillOpacity="0.06" />
            <circle cx="90" cy="50" r="3" fill="currentColor" fillOpacity="0.1" />
            <circle cx="320" cy="120" r="4" fill="currentColor" fillOpacity="0.07" />
          </>
        );
      case 'Etkinlik':
        return (
          <>
            <circle cx="345" cy="30" r="60" fill="currentColor" fillOpacity="0.05" />
            <circle cx="50" cy="140" r="40" fill="currentColor" fillOpacity="0.04" />
            <rect x="160" y="25" width="80" height="90" rx="6" fill="currentColor" fillOpacity="0.07" />
            <rect x="160" y="25" width="80" height="22" rx="6" fill="currentColor" fillOpacity="0.1" />
            <rect x="170" y="55" width="15" height="15" rx="2" fill="currentColor" fillOpacity="0.08" />
            <rect x="192" y="55" width="15" height="15" rx="2" fill="currentColor" fillOpacity="0.08" />
            <rect x="214" y="55" width="15" height="15" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect x="170" y="78" width="15" height="15" rx="2" fill="currentColor" fillOpacity="0.06" />
            <rect x="192" y="78" width="15" height="15" rx="2" fill="currentColor" fillOpacity="0.06" />
            <rect x="214" y="78" width="15" height="15" rx="2" fill="currentColor" fillOpacity="0.06" />
            <circle cx="120" cy="40" r="4" fill="currentColor" fillOpacity="0.12" />
            <circle cx="290" cy="50" r="3" fill="currentColor" fillOpacity="0.1" />
            <circle cx="300" cy="110" r="5" fill="currentColor" fillOpacity="0.06" />
            <path d="M100 120 L110 110 L120 125" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1.5" fill="none" />
            <path d="M280 30 L290 20 L295 35" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1.5" fill="none" />
          </>
        );
      case 'Röportaj':
        return (
          <>
            <circle cx="340" cy="30" r="65" fill="currentColor" fillOpacity="0.05" />
            <circle cx="55" cy="140" r="40" fill="currentColor" fillOpacity="0.04" />
            <circle cx="180" cy="70" r="10" fill="currentColor" fillOpacity="0.12" />
            <rect x="178" y="80" width="4" height="35" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect x="170" y="115" width="20" height="4" rx="2" fill="currentColor" fillOpacity="0.08" />
            <path d="M220 40 L280 40 L280 80 L250 80 L240 90 L240 80 L220 80 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            <rect x="230" y="52" width="40" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
            <rect x="230" y="62" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />
            <circle cx="110" cy="55" r="3" fill="currentColor" fillOpacity="0.1" />
            <circle cx="320" cy="110" r="4" fill="currentColor" fillOpacity="0.07" />
          </>
        );
      default:
        return (
          <>
            <circle cx="340" cy="30" r="65" fill="currentColor" fillOpacity="0.06" />
            <circle cx="55" cy="140" r="40" fill="currentColor" fillOpacity="0.04" />
            <rect x="160" y="35" width="80" height="95" rx="4" fill="currentColor" fillOpacity="0.07" />
            <rect x="170" y="48" width="50" height="4" rx="2" fill="currentColor" fillOpacity="0.15" />
            <rect x="170" y="60" width="60" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />
            <rect x="170" y="70" width="55" height="3" rx="1.5" fill="currentColor" fillOpacity="0.08" />
            <rect x="170" y="80" width="45" height="3" rx="1.5" fill="currentColor" fillOpacity="0.08" />
            <circle cx="200" cy="110" r="8" fill="currentColor" fillOpacity="0.08" />
            <path d="M196 110 L200 106 L204 110" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" fill="none" />
            <circle cx="100" cy="50" r="3" fill="currentColor" fillOpacity="0.1" />
            <circle cx="310" cy="100" r="4" fill="currentColor" fillOpacity="0.07" />
          </>
        );
    }
  })();

  return (
    <div className={`w-full h-full bg-gradient-to-br ${style.bg} flex items-center justify-center ${style.color}`}>
      <svg viewBox="0 0 400 160" fill="none" className="w-full h-full">
        {svgContent}
      </svg>
    </div>
  );
}
