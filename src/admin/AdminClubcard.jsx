import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon, ExternalLink, MapPin, MessageCircle, Eye, EyeOff, X, AlertTriangle, Search, Gift } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import MediaPicker from './MediaPicker';
import ReorderControls, { useReorder } from './ReorderControls';

const EMPTY = { name: '', category: '', branch: '', logo_path: '', offers: [{ discount: 10, scope: '' }], conditions: '', contact: 'maps', whatsapp: '', maps_url: '', is_active: 1 };

const CONTACTS = [
  { value: 'maps', label: 'Yol tarifi (harita)', icon: MapPin },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'none', label: 'Bağlantı yok', icon: X },
];

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const offerText = (o) => (o.discount ? `%${o.discount}${o.scope ? ` ${o.scope}` : ''}` : o.scope);

export default function AdminClubcard() {
  const user = useAuth();
  const toast = useToast();
  const canEdit = ['admin', 'koordinator'].includes(user.role);
  const [partners, setPartners] = useState([]);
  const [period, setPeriod] = useState('');
  const [periodDraft, setPeriodDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [initial, setInitial] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = () => {
    api.getClubcard()
      .then(d => { setPartners(d.partners || []); setPeriod(d.period || ''); setPeriodDraft(d.period || ''); })
      .catch(() => toast('Club Card listesi yüklenemedi', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const move = useReorder({ items: partners, updateFn: api.updateClubcardPartner, load, toast });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setOffer = (i, k, v) => setForm(f => ({ ...f, offers: f.offers.map((o, j) => (j === i ? { ...o, [k]: v } : o)) }));

  const openNew = () => { setEditing(null); setForm(EMPTY); setInitial(EMPTY); setModalOpen(true); };
  const openEdit = (p) => {
    const f = { ...EMPTY, ...p, offers: p.offers?.length ? p.offers.map(o => ({ discount: o.discount ?? '', scope: o.scope || '' })) : EMPTY.offers };
    setEditing(p.id); setForm(f); setInitial(f); setModalOpen(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const res = await api.upload(file); set('logo_path', res.path); toast('Logo yüklendi'); }
    catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('İşletme adı gerekli', 'error');
    if (form.contact === 'whatsapp' && !form.whatsapp.trim()) return toast('WhatsApp seçiliyse numara gerekli', 'error');
    const payload = { ...form, offers: form.offers.map(o => ({ discount: o.discount === '' || o.discount === null ? null : Number(o.discount), scope: o.scope })) };
    setSaving(true);
    try {
      if (editing) { await api.updateClubcardPartner(editing, payload); toast('İşletme güncellendi'); }
      else { await api.createClubcardPartner(payload); toast('İşletme eklendi'); }
      setModalOpen(false); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (p) => {
    try { await api.updateClubcardPartner(p.id, { is_active: p.is_active ? 0 : 1 }); toast(p.is_active ? 'Sayfadan gizlendi' : 'Sayfada yayında'); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const handleDelete = async () => {
    try { await api.deleteClubcardPartner(confirm.id); toast('İşletme silindi'); setConfirm({ open: false, id: null, name: '' }); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const savePeriod = async () => {
    try { const r = await api.updateClubcardPeriod(periodDraft.trim()); setPeriod(r.period); toast('Dönem güncellendi'); }
    catch (err) { toast(err.message, 'error'); }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return q ? partners.filter(p => `${p.name} ${p.category} ${p.branch}`.toLocaleLowerCase('tr').includes(q)) : partners;
  }, [partners, query]);
  const activeCount = partners.filter(p => p.is_active).length;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Club Card</h1>
          <p className="text-sm text-slate-500 mt-0.5">{activeCount} işletme yayında{partners.length - activeCount > 0 ? `, ${partners.length - activeCount} gizli` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/clubcard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition no-underline">
            <ExternalLink className="w-4 h-4" /> Sayfayı aç
          </a>
          {canEdit && <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni İşletme</button>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="cc-period" className="block text-sm font-medium text-slate-700 mb-1">Kart dönemi</label>
          <div className="flex gap-2">
            <input id="cc-period" value={periodDraft} disabled={!canEdit} onChange={e => setPeriodDraft(e.target.value)} placeholder="2026–2027" className={`${inputCls} max-w-[200px]`} />
            {canEdit && periodDraft.trim() !== period && <button onClick={savePeriod} className="px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition">Kaydet</button>}
          </div>
          <p className="text-xs text-slate-500 mt-1">Sayfanın üstündeki kartta ve bilgi notunda görünür.</p>
        </div>
        <div className="relative md:w-72">
          <label htmlFor="cc-search" className="sr-only">İşletme ara</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input id="cc-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="İşletme ara" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {!canEdit && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Listeyi görebilirsin; değişiklik için koordinatör ya da admin yetkisi gerekir.</p>}

      {partners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-500">Henüz işletme yok</p>
          {canEdit && <button onClick={openNew} className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium">+ İlk işletmeyi ekle</button>}
        </div>
      ) : (
        <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {visible.map(p => {
            const i = partners.indexOf(p);
            const waMissing = p.contact === 'whatsapp' && !p.whatsapp;
            return (
              <li key={p.id} className={`flex items-center gap-3 p-3 ${p.is_active ? '' : 'bg-slate-50'}`}>
                {canEdit && !query && <ReorderControls idx={i} total={partners.length} onMove={move} />}
                <div className={`w-16 h-12 shrink-0 flex items-center justify-center rounded-lg border border-gray-100 bg-white ${p.is_active ? '' : 'opacity-50'}`}>
                  {p.logo_path ? <img src={p.logo_path} alt="" className="max-w-[56px] max-h-10 object-contain" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${p.is_active ? 'text-slate-800' : 'text-slate-500'}`}>{p.name}</span>
                    {!p.is_active && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">Gizli</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    {p.offers.map((o, k) => (
                      <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
                        {!o.discount && <Gift className="w-3 h-3" />}{offerText(o)}
                      </span>
                    ))}
                    <span className="text-xs text-slate-500 truncate">{[p.category, p.branch].filter(Boolean).join(' · ')}</span>
                  </div>
                  {(p.conditions || waMissing) && (
                    <p className={`mt-1 text-xs truncate ${waMissing ? 'text-amber-700' : 'text-slate-500'}`}>
                      {waMissing ? <><AlertTriangle className="inline w-3 h-3 -mt-0.5" /> WhatsApp numarası girilmemiş, sayfada buton görünmüyor</> : `Koşul: ${p.conditions.split('\n').join(' · ')}`}
                    </p>
                  )}
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 shrink-0" title="Kartın altındaki bağlantı">
                  {(() => { const C = CONTACTS.find(c => c.value === p.contact) || CONTACTS[0]; return <><C.icon className="w-3.5 h-3.5" />{C.value === 'maps' ? 'Harita' : C.value === 'whatsapp' ? 'WhatsApp' : '—'}</>; })()}
                </span>
                {canEdit && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => toggleActive(p)} className="p-2 hover:bg-gray-100 rounded-md text-slate-500" title={p.is_active ? 'Sayfadan gizle' : 'Sayfada yayınla'} aria-label={p.is_active ? `${p.name}: sayfadan gizle` : `${p.name}: sayfada yayınla`}>
                      {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-blue-50 rounded-md text-blue-600" title="Düzenle" aria-label={`${p.name}: düzenle`}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setConfirm({ open: true, id: p.id, name: p.name })} className="p-2 hover:bg-red-50 rounded-md text-red-600" title="Sil" aria-label={`${p.name}: sil`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </li>
            );
          })}
          {visible.length === 0 && <li className="p-6 text-center text-sm text-slate-500">Aramana uyan işletme yok.</li>}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'İşletmeyi Düzenle' : 'Yeni İşletme'} wide dirty={dirty}>
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cc-name" className="block text-sm font-medium text-slate-700 mb-1">İşletme adı *</label>
              <input id="cc-name" value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="cc-cat" className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <input id="cc-cat" value={form.category} onChange={e => set('category', e.target.value)} placeholder="Kafe, Burger, Spor salonu…" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cc-branch" className="block text-sm font-medium text-slate-700 mb-1">Şube</label>
              <input id="cc-branch" value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="Meltem Şubesi, Tüm şubelerde… (online hizmette boş bırak)" className={inputCls} />
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1">Logo</span>
            <div className="flex items-center gap-3 flex-wrap">
              {form.logo_path && <img src={form.logo_path} alt="" className="h-12 max-w-[120px] object-contain border border-gray-100 rounded-lg p-1" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition"><ImageIcon className="w-4 h-4" /> Medyadan Seç</button>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 cursor-pointer transition">
                <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              {form.logo_path && <button type="button" onClick={() => set('logo_path', '')} className="text-xs text-red-600 hover:text-red-700">Kaldır</button>}
            </div>
            <p className="text-xs text-slate-500 mt-1">Şeffaf ya da beyaz zeminli, yatay logo en iyi sonucu verir.</p>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-slate-700 mb-1">İndirimler *</legend>
            <p className="text-xs text-slate-500 mb-2">Tek oran için kapsamı boş bırak. Farklı oranlar için satır ekle (örn. %25 kahvelerde, %10 oyunlarda). Yüzde olmayan ayrıcalıkta oranı boş bırakıp metni yaz.</p>
            <div className="space-y-2">
              {form.offers.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative w-24 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                    <input type="number" min="1" max="100" aria-label={`${i + 1}. satır indirim oranı`} value={o.discount ?? ''} onChange={e => setOffer(i, 'discount', e.target.value)} placeholder="—" className={`${inputCls} pl-7`} />
                  </div>
                  <input aria-label={`${i + 1}. satır kapsam`} value={o.scope} onChange={e => setOffer(i, 'scope', e.target.value)} placeholder={o.discount === '' || o.discount == null ? 'Ayrıcalık: Waffle yanında filtre kahve ücretsiz' : 'Kapsam (isteğe bağlı): Kahvelerde'} className={inputCls} />
                  {form.offers.length > 1 && <button type="button" onClick={() => set('offers', form.offers.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600" aria-label={`${i + 1}. satırı sil`}><X className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
            {form.offers.length < 4 && <button type="button" onClick={() => set('offers', [...form.offers, { discount: '', scope: '' }])} className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium">+ Satır ekle</button>}
          </fieldset>

          <div>
            <label htmlFor="cc-cond" className="block text-sm font-medium text-slate-700 mb-1">Koşullar</label>
            <textarea id="cc-cond" rows={3} value={form.conditions} onChange={e => set('conditions', e.target.value)} placeholder={'Her satıra bir koşul:\nFly yoga dahil değil\nKredi kartıyla ödemede geçerli'} className={inputCls} />
            <p className="text-xs text-slate-500 mt-1">Kartın altında ⓘ işaretiyle listelenir. En fazla 6 satır.</p>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-slate-700 mb-2">Kartın altındaki bağlantı</legend>
            <div className="flex flex-wrap gap-2">
              {CONTACTS.map(c => (
                <label key={c.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition ${form.contact === c.value ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
                  <input type="radio" name="cc-contact" value={c.value} checked={form.contact === c.value} onChange={() => set('contact', c.value)} className="sr-only" />
                  <c.icon className="w-4 h-4" /> {c.label}
                </label>
              ))}
            </div>
            {form.contact === 'whatsapp' && (
              <div className="mt-3">
                <label htmlFor="cc-wa" className="block text-sm font-medium text-slate-700 mb-1">WhatsApp numarası *</label>
                <input id="cc-wa" inputMode="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="905xxxxxxxxx" className={`${inputCls} max-w-xs`} />
                <p className="text-xs text-slate-500 mt-1">Ülke koduyla, başında + ve 0 olmadan (örn. 90 5xx xxx xx xx). Sayfada herkese açık görünür; yalnızca işletmenin kurumsal numarasını gir.</p>
              </div>
            )}
            {form.contact === 'maps' && (
              <div className="mt-3">
                <label htmlFor="cc-maps" className="block text-sm font-medium text-slate-700 mb-1">Harita bağlantısı</label>
                <input id="cc-maps" value={form.maps_url} onChange={e => set('maps_url', e.target.value)} placeholder="https://maps.app.goo.gl/…" className={inputCls} />
                <p className="text-xs text-slate-500 mt-1">Boş bırakılırsa Google Haritalar'da "işletme adı + şube + Antalya" aranır. Doğru şubeyi göstermek için Haritalar'daki "Paylaş" bağlantısını yapıştır.</p>
              </div>
            )}
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked ? 1 : 0)} className="w-4 h-4 accent-red-600" />
            Sayfada yayında
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">{saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="İşletmeyi Sil" message={`${confirm.name} Club Card listesinden kalıcı olarak silinecek. Geçici olarak kaldırmak için göz simgesiyle gizleyebilirsin.`} onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null, name: '' })} />
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => set('logo_path', p)} currentPath={form.logo_path} />
    </div>
  );
}
