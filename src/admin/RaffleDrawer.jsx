import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Search, Download, Save, Dice5, Trophy, Loader2, FileText, CheckCircle2 } from 'lucide-react';

/**
 * Full-screen raffle drawer that matches the admin panel design language:
 * white cards on a soft gray background, red primary actions, slate typography.
 * Logic (paste/upload, dedupe, random draw with animation, save winner) is
 * preserved; visuals follow the rest of the admin UI (AdminRaffles, AdminTeam, ...).
 */
export default function RaffleDrawer({ open, onClose, raffleName, onSaveWinner, toast }) {
  const [names, setNames] = useState([]);
  const [nameSet, setNameSet] = useState(() => new Set());
  const [winners, setWinners] = useState([]);
  const [backups, setBackups] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [backupCount, setBackupCount] = useState(3);
  const [excludeWinners, setExcludeWinners] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [showReveal, setShowReveal] = useState(false);
  const [pickedWinners, setPickedWinners] = useState([]);
  const [pickedBackups, setPickedBackups] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [savingWinner, setSavingWinner] = useState(false);
  // Phase-driven reveal: 'countdown' → 'rolling' → 'landed' → 'done'. Drives the whole animation stack.
  const [drawPhase, setDrawPhase] = useState('done');
  const [countdownValue, setCountdownValue] = useState(null);
  const [revealedWinners, setRevealedWinners] = useState([]); // progressively revealed during animation
  const [backupsVisible, setBackupsVisible] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0); // bump to retrigger burst
  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setNames([]); setNameSet(new Set()); setWinners([]); setBackups([]);
      setSearch(''); setPasteText(''); setShowReveal(false);
      setPickedWinners([]); setPickedBackups([]); setTab('paste');
      setDrawPhase('done'); setCountdownValue(null);
      setRevealedWinners([]); setBackupsVisible(false); setRollingName('');
    }
  }, [open]);

  const parseNames = (text) => {
    if (!text) return [];
    return text
      .split(/[\n\r,;\t|]+/)
      .map(n => n.trim().replace(/^["']+|["']+$/g, '').trim())
      .filter(n => n.length > 0 && n.length < 200);
  };

  // Turkish-aware normalization for duplicate detection.
  //  - Lowercase + fold ş/ç/ğ/ü/ö/ı to ASCII
  //  - Strip punctuation
  //  - Collapse repeated letters: "barriis" → "baris"
  //  - Sort tokens so "Ali Veli" and "Veli Ali" collide
  const normalizeKey = (name) => {
    const folded = name.toLowerCase()
      .replace(/[şŞ]/g, 's')
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[öÖ]/g, 'o')
      .replace(/[ıİ]/g, 'i')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/(.)\1+/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    return folded.split(' ').filter(Boolean).sort().join(' ');
  };

  // Classic Levenshtein (edit distance). Two-row DP for lower memory on long strings.
  const levenshtein = (a, b) => {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = new Array(n + 1);
    let cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        cur[j] = a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  };

  // Edit-distance tolerance that scales with name length. Short names stay strict
  // to avoid merging actually-different short names; longer names can tolerate
  // a typo or two ("Barış Manço" ↔ "Baris Macno" differ by 2 edits).
  const dupThreshold = (len) => {
    if (len < 4) return 0;
    if (len < 8) return 1;
    if (len < 13) return 2;
    return Math.min(3, Math.floor(len * 0.15));
  };

  const isFuzzyDuplicate = (key, existingKeys) => {
    if (!key) return false;
    if (existingKeys.has(key)) return true;
    const len = key.length;
    const thresh = dupThreshold(len);
    if (thresh === 0) return false;
    for (const other of existingKeys) {
      if (Math.abs(other.length - len) > thresh) continue; // cheap length filter
      if (levenshtein(key, other) <= thresh) return true;
    }
    return false;
  };

  const addNames = (newNames) => {
    if (!newNames.length) return;
    let added = 0, dupes = 0;
    const nextNames = [...names];
    const nextKeys = new Set(nameSet);
    for (const name of newNames) {
      const key = normalizeKey(name);
      if (!key) { dupes++; continue; }
      if (isFuzzyDuplicate(key, nextKeys)) { dupes++; continue; }
      nextKeys.add(key);
      nextNames.push(name);
      added++;
    }
    setNames(nextNames);
    setNameSet(nextKeys);
    setToastMsg({ added, dupes });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 4000);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return names;
    return names.filter(n => n.toLowerCase().includes(q));
  }, [names, search]);

  const poolCount = useMemo(() => {
    if (!excludeWinners) return names.length;
    const excluded = new Set([...winners, ...backups]);
    return names.filter(n => !excluded.has(n)).length;
  }, [names, winners, backups, excludeWinners]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => addNames(parseNames(e.target.result));
    reader.readAsText(file, 'utf-8');
  };

  const removeName = (name) => {
    setNames(n => n.filter(x => x !== name));
    setNameSet(s => { const n = new Set(s); n.delete(normalizeKey(name)); return n; });
    setWinners(w => w.filter(x => x !== name));
    setBackups(b => b.filter(x => x !== name));
  };

  const handleClear = () => {
    if (confirmClear) {
      setNames([]); setNameSet(new Set()); setWinners([]); setBackups([]);
      setConfirmClear(false);
      clearTimeout(clearTimerRef.current);
    } else {
      setConfirmClear(true);
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Multi-phase draw animation:
  //   1. Countdown 3→2→1 (anticipation)
  //   2. Rolling: name cycles rapidly then decelerates to final (slot-machine feel)
  //   3. Land: name locks in with scale/color pop + confetti burst
  //   Repeat 2-3 for each winner (sequential reveal)
  //   4. Backups slide in from below
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const rollToName = async (pool, finalName) => {
    // Long decelerating roll: starts ~20ms (blur of names), exponentially slows to
    // ~500ms per tick at the end — "drum roll" feel before the winner locks in.
    // Total ~3.8s per winner, most of the slowdown in the last 6-8 ticks.
    const iterations = 30;
    for (let i = 0; i < iterations; i++) {
      const progress = i / (iterations - 1);
      const delay = 20 + Math.pow(progress, 3.5) * 480;
      const candidate = i === iterations - 1 ? finalName : pool[Math.floor(Math.random() * pool.length)];
      setRollingName(candidate);
      await sleep(delay);
    }
  };

  const drawWinners = async () => {
    const excluded = new Set([...winners, ...backups]);
    const pool = excludeWinners ? names.filter(n => !excluded.has(n)) : [...names];
    if (pool.length === 0) return;

    const winN = Math.min(Math.max(1, parseInt(winnerCount) || 1), pool.length);
    const bkupN = Math.min(Math.max(0, parseInt(backupCount) || 0), pool.length - winN);
    const picked = shuffle(pool).slice(0, winN + bkupN);
    const pw = picked.slice(0, winN);
    const pb = picked.slice(winN, winN + bkupN);

    setIsDrawing(true);
    setShowReveal(true);
    setPickedWinners([]);
    setPickedBackups([]);
    setRevealedWinners([]);
    setBackupsVisible(false);
    setRollingName('');

    // Phase 1 — countdown 3, 2, 1
    setDrawPhase('countdown');
    for (let n = 3; n >= 1; n--) {
      setCountdownValue(n);
      await sleep(700);
    }
    setCountdownValue(null);

    // Phase 2 — per-winner rolling + landing with confetti burst
    setDrawPhase('rolling');
    for (let wi = 0; wi < pw.length; wi++) {
      await rollToName(pool, pw[wi]);
      setDrawPhase('landed');
      setConfettiKey(k => k + 1); // triggers fresh confetti burst
      setRevealedWinners(prev => [...prev, pw[wi]]);
      await sleep(1700); // hold each winner on screen ~1.7s so it's savored
      if (wi < pw.length - 1) {
        setDrawPhase('rolling'); // next spin
        await sleep(250);
      }
    }

    // Commit to Sonuçlar state
    setPickedWinners(pw);
    setPickedBackups(pb);
    if (excludeWinners) {
      setWinners(w => [...w, ...pw]);
      setBackups(b => [...b, ...pb]);
    } else {
      setWinners(pw);
      setBackups(pb);
    }

    // Phase 4 — backups slide in
    if (pb.length > 0) {
      await sleep(300);
      setBackupsVisible(true);
    }

    setDrawPhase('done');
    setIsDrawing(false);
  };

  const exportResults = () => {
    if (!winners.length && !backups.length) return;
    let content = `ÇEKİLİŞ SONUÇLARI\n${raffleName || ''}\n${new Date().toLocaleString('tr-TR')}\n\n`;
    if (winners.length) content += `KAZANANLAR\n${winners.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\n`;
    if (backups.length) content += `YEDEKLER\n${backups.map((b, i) => `${i + 1}. Yedek: ${b}`).join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cekilis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Accepts arrays of winners and backups so multi-winner draws are saved in full.
  const saveResultsToRaffle = async (winnerList, backupList = []) => {
    const ws = Array.isArray(winnerList) ? winnerList.filter(Boolean) : [winnerList].filter(Boolean);
    const bs = Array.isArray(backupList) ? backupList.filter(Boolean) : [];
    if (ws.length === 0 || !onSaveWinner) return;
    setSavingWinner(true);
    try {
      await onSaveWinner(ws, bs);
      const parts = [`${ws.length} kazanan`];
      if (bs.length > 0) parts.push(`${bs.length} yedek`);
      toast?.(parts.join(' + ') + ' kaydedildi');
    } catch (err) {
      toast?.(err.message || 'Kaydedilemedi', 'error');
    } finally {
      setSavingWinner(false);
    }
  };

  if (!open) return null;

  // Rendered via portal to document.body so no admin layout stacking context
  // (sidebar, sticky header) can poke through the drawer.
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-gray-50 overflow-y-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Dice5 className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-800 truncate">Çekiliş Çek</h1>
              {raffleName && <p className="text-xs text-slate-400 truncate">{raffleName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <div className="hidden sm:flex items-center gap-5">
              <Stat label="Katılımcı" value={names.length} />
              <Stat label="Kazanan" value={winners.length} accent="text-red-500" />
              <Stat label="Yedek" value={backups.length} />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Kapat"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-5 gap-6">
        {/* Left column */}
        <section className="lg:col-span-2 space-y-4">
          {/* Input card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Katılımcıları Ekle</h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setTab('paste')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'paste' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Metin Yapıştır
                </button>
                <button
                  onClick={() => setTab('upload')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dosya Yükle
                </button>
              </div>
            </div>

            {tab === 'paste' && (
              <div className="space-y-3">
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder={'Ahmet Yılmaz\nZeynep Kaya\nMurat Demir\n\nVirgül, noktalı virgül, tab — hepsi çalışır.'}
                  className="w-full h-52 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-slate-700 placeholder-slate-400 leading-relaxed"
                />
                <button
                  onClick={() => { addNames(parseNames(pasteText)); setPasteText(''); }}
                  disabled={!pasteText.trim()}
                  className="w-full px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-lg transition"
                >
                  Listeye Ekle
                </button>
              </div>
            )}

            {tab === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                className="h-52 border-2 border-dashed border-gray-200 hover:border-red-300 hover:bg-red-50/30 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition"
              >
                <Upload className="w-8 h-8 text-slate-400" />
                <div className="text-center">
                  <div className="text-sm text-slate-700 font-medium">Dosyayı buraya bırakın</div>
                  <div className="text-xs text-slate-400 mt-0.5">CSV, TXT, TSV — veya tıklayıp seç</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,text/*"
                  className="hidden"
                  onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }}
                />
              </div>
            )}

            {toastMsg && (
              <div className="flex items-center gap-2 text-sm px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-800">
                  <span className="font-semibold">{toastMsg.added}</span> yeni isim eklendi
                  {toastMsg.dupes > 0 && <span className="text-emerald-600/70"> · {toastMsg.dupes} tekrar elendi</span>}
                </span>
              </div>
            )}
          </div>

          {/* Settings card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Çekiliş Ayarları</h2>

            <div className="grid grid-cols-2 gap-3">
              <Counter label="Kazanan sayısı" value={winnerCount} onChange={v => setWinnerCount(Math.max(1, v))} min={1} />
              <Counter label="Yedek sayısı" value={backupCount} onChange={v => setBackupCount(Math.max(0, v))} min={0} />
            </div>
            <p className="text-[10px] text-slate-400 -mt-2">Yedekler, kazanan diskalifiye olursa sırayla devreye girer.</p>

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeWinners}
                onChange={e => setExcludeWinners(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <span className="text-sm text-slate-600 leading-snug">Önceki kazanan ve yedekler bu çekilişe dahil olmasın</span>
            </label>

            <button
              onClick={drawWinners}
              disabled={poolCount === 0 || isDrawing}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-lg transition flex items-center justify-center gap-2"
            >
              <Dice5 className="w-4 h-4" /> Çekilişi Başlat
            </button>
            {poolCount === 0 && names.length > 0 && (
              <p className="text-xs text-center text-slate-400">Havuz boş. Listeyi temizle veya "hariç tut" seçeneğini kapat.</p>
            )}
          </div>

          {/* Results card */}
          {(winners.length > 0 || backups.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">Sonuçlar</h2>
                <button
                  onClick={exportResults}
                  className="text-xs text-slate-500 hover:text-red-500 inline-flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" /> İndir
                </button>
              </div>

              {winners.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">Kazananlar ({winners.length})</div>
                    {onSaveWinner && (
                      <button
                        onClick={() => saveResultsToRaffle(winners, backups)}
                        disabled={savingWinner}
                        className="text-[10px] uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded px-2.5 py-1 transition disabled:opacity-40 inline-flex items-center gap-1 font-semibold"
                        title="Tüm kazananları ve yedekleri çekilişe kaydet"
                      >
                        <Save className="w-3 h-3" /> {savingWinner ? 'Kaydediliyor...' : (backups.length > 0 ? 'Hepsini Kaydet' : 'Kaydet')}
                      </button>
                    )}
                  </div>
                  {winners.map((w, i) => (
                    <div key={w + i} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-slate-400 tabular-nums w-5 text-right font-semibold">{i + 1}.</span>
                      <span className="flex-1 text-sm text-slate-800 font-medium">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {backups.length > 0 && (
                <div className="space-y-1 pt-3 border-t border-gray-100">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Yedekler ({backups.length})</div>
                  {backups.map((b, i) => (
                    <div key={b + i} className="flex items-baseline gap-3 py-1 text-sm">
                      <span className="text-xs text-slate-400 tabular-nums w-16 text-right">{i + 1}. yedek</span>
                      <span className="text-slate-600">{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right column — participant list */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Listede ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
            </div>
            {names.length > 0 && (
              <button
                onClick={handleClear}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition ${confirmClear ? 'text-red-600 border-red-300 bg-red-50' : 'text-slate-500 hover:text-red-500 border-gray-200 hover:border-red-200'}`}
              >
                {confirmClear ? 'Emin misin?' : 'Temizle'}
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Katılımcı Listesi</span>
              {search && <span className="tabular-nums">{filtered.length.toLocaleString('tr-TR')} / {names.length.toLocaleString('tr-TR')}</span>}
            </div>
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                {names.length === 0 ? (
                  <>
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Liste boş</p>
                    <p className="text-xs text-slate-400 mt-1">Soldan isim ekleyerek başla</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">"{search}" için sonuç yok</p>
                )}
              </div>
            ) : (
              <div className="overflow-y-auto divide-y divide-gray-100" style={{ maxHeight: 'min(560px, 65vh)' }}>
                {filtered.map((name, i) => {
                  const isWinner = winners.includes(name);
                  const isBackup = !isWinner && backups.includes(name);
                  return (
                    <div key={name} className="flex items-center gap-3 px-4 py-2.5 group hover:bg-gray-50 transition">
                      <span className="text-xs text-slate-400 tabular-nums w-8 text-right font-semibold">{String(i + 1).padStart(3, '0')}</span>
                      <span className="flex-1 text-sm text-slate-700 truncate">{name}</span>
                      {isWinner && <span className="text-[9px] uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-semibold">Kazanan</span>}
                      {isBackup && <span className="text-[9px] uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-semibold">Yedek</span>}
                      <button
                        onClick={() => removeName(name)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Reveal overlay — multi-phase animation.
          Outside-click intentionally does NOT close: admin wants to keep winners
          on-screen until they explicitly press Kapat or the X. */}
      {showReveal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <style>{`
            @keyframes rd_pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
            @keyframes rd_out { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.6); opacity: 0; } }
            @keyframes rd_winnerIn { 0% { transform: scale(0.5) translateY(30px); opacity: 0; } 55% { transform: scale(1.08) translateY(-6px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes rd_backupSlide { 0% { transform: translateY(24px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
            @keyframes rd_pulseRing { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(1.8); opacity: 0; } }
            @keyframes rd_shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
            .rd-pop { animation: rd_pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            .rd-out { animation: rd_out 0.2s ease-in forwards; }
            .rd-winner-in { animation: rd_winnerIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
            .rd-backup-in { animation: rd_backupSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
            .rd-pulse-ring::before { content: ''; position: absolute; inset: 0; border-radius: inherit; border: 2px solid rgb(239 68 68 / 0.6); animation: rd_pulseRing 1.2s ease-out infinite; pointer-events: none; }
          `}</style>

          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col"
            style={{ minHeight: 'clamp(380px, 55vh, 520px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Countdown phase */}
            {drawPhase === 'countdown' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-4">Çekiliş Başlıyor</p>
                <div
                  key={countdownValue}
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-xl shadow-red-500/40 rd-pop relative"
                >
                  <span className="text-7xl font-extrabold text-white tabular-nums">{countdownValue}</span>
                </div>
              </div>
            )}

            {/* Rolling phase — name cycles and decelerates */}
            {drawPhase === 'rolling' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-semibold">
                    {revealedWinners.length + 1}. Kazanan Çekiliyor
                  </p>
                </div>
                <div className="text-3xl md:text-5xl font-bold text-slate-800 min-h-[64px] max-w-full break-words px-4">
                  {rollingName || '...'}
                </div>
              </div>
            )}

            {/* Landed phase — name just locked in, confetti burst */}
            {drawPhase === 'landed' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-semibold mb-4">
                  {revealedWinners.length}. Kazanan
                </p>
                <div
                  key={`land-${confettiKey}`}
                  className="inline-block relative rd-pulse-ring rounded-2xl max-w-full"
                >
                  <div className="relative rd-pop px-8 py-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/40">
                    <span className="text-3xl md:text-5xl font-extrabold text-white break-words">
                      {revealedWinners[revealedWinners.length - 1]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Done phase — full results */}
            {drawPhase === 'done' && (
              <div className="animate-modal-in">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Sonuç</p>
                    <h3 className="text-lg font-bold text-slate-800">
                      {pickedWinners.length === 1 ? 'Kazanan belirlendi' : `${pickedWinners.length} kazanan belirlendi`}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowReveal(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition shrink-0"
                    title="Kapat"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {pickedWinners.map((w, i) => (
                    <div
                      key={w + i}
                      className="rd-winner-in flex items-center gap-3 p-4 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white relative"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold tabular-nums shrink-0 shadow-md shadow-red-500/30">
                        {i + 1}
                      </div>
                      <span className="flex-1 text-xl md:text-2xl font-bold text-slate-800 break-words">{w}</span>
                    </div>
                  ))}

                  {pickedBackups.length > 0 && backupsVisible && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2 rd-backup-in">Yedekler</p>
                      <div className="space-y-1.5">
                        {pickedBackups.map((b, i) => (
                          <div
                            key={b + i}
                            className="rd-backup-in flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
                            style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                          >
                            <span className="text-xs text-slate-400 tabular-nums font-semibold whitespace-nowrap">{i + 1}. yedek</span>
                            <span className="flex-1 text-sm text-slate-700">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowReveal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition"
                  >
                    Kapat
                  </button>
                  {onSaveWinner && pickedWinners.length > 0 && (
                    <button
                      onClick={async () => { await saveResultsToRaffle(pickedWinners, pickedBackups); setShowReveal(false); }}
                      disabled={savingWinner}
                      className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition inline-flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {savingWinner ? 'Kaydediliyor...' : (pickedBackups.length > 0 ? `${pickedWinners.length} Kazanan + ${pickedBackups.length} Yedek Kaydet` : `${pickedWinners.length > 1 ? 'Kazananları' : 'Kazananı'} Kaydet`)}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

function Stat({ label, value, accent = 'text-slate-800' }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${accent}`}>{value.toLocaleString('tr-TR')}</div>
    </div>
  );
}

function Counter({ label, value, onChange, min }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, (parseInt(value) || min) - 1))}
          className="w-8 h-9 shrink-0 rounded-lg border border-gray-200 hover:bg-gray-50 text-slate-500 font-bold"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || min)}
          className="min-w-0 flex-1 px-2 py-2 border border-gray-200 rounded-lg text-center text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          onClick={() => onChange((parseInt(value) || min) + 1)}
          className="w-8 h-9 shrink-0 rounded-lg border border-gray-200 hover:bg-gray-50 text-slate-500 font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
