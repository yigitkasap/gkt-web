import { useState, useEffect } from 'react';
import { Settings, Users, Calendar, Award, Plus, Edit2, Trash2, Upload, Eye, EyeOff, Rocket, User, Save, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import MediaPicker from './MediaPicker';
import ReorderControls, { useReorder } from './ReorderControls';

const TABS = [
  { id: 'settings', label: 'Genel Ayarlar', icon: Settings },
  { id: 'speakers', label: 'Konuşmacılar', icon: Users },
  { id: 'program', label: 'Program', icon: Calendar },
  { id: 'sponsors', label: 'Sponsorlar', icon: Award },
];

const SESSION_TYPES = [
  { value: 'opening', label: 'Açılış', color: 'bg-purple-100 text-purple-700' },
  { value: 'keynote', label: 'Keynote', color: 'bg-red-100 text-red-700' },
  { value: 'panel', label: 'Panel', color: 'bg-blue-100 text-blue-700' },
  { value: 'workshop', label: 'Workshop', color: 'bg-green-100 text-green-700' },
  { value: 'talk', label: 'Konuşma', color: 'bg-amber-100 text-amber-700' },
  { value: 'networking', label: 'Networking', color: 'bg-teal-100 text-teal-700' },
  { value: 'break', label: 'Ara', color: 'bg-gray-100 text-gray-600' },
  { value: 'closing', label: 'Kapanış', color: 'bg-purple-100 text-purple-700' },
];

// UGZ sponsorship tiers from the sponsorship kit (hierarchy preserved).
// 'ana' is the highest tier above Platin.
const SPONSOR_TIERS = [
  { value: 'ana', label: 'Ana Sponsor' },
  { value: 'platin', label: 'Platin Sponsor' },
  { value: 'altin', label: 'Altın Sponsor' },
  { value: 'gumus', label: 'Gümüş Sponsor' },
  { value: 'logo', label: 'Logo Sponsor' },
  { value: 'cekilis', label: 'Çekiliş Sponsor' },
  { value: 'iletisim', label: 'İletişim Sponsor' },
  { value: 'medya', label: 'Medya Sponsor' },
  { value: 'konaklama', label: 'Konaklama Sponsor' },
  { value: 'promosyon', label: 'Promosyon Sponsor' },
  { value: 'giyim', label: 'Giyim Sponsor' },
  { value: 'urun', label: 'Ürün Sponsor' },
  { value: 'yiyecek-icecek', label: 'Yiyecek ve İçecek Sponsor' },
  { value: 'ulasim', label: 'Ulaşım Sponsor' },
  { value: 'paydas', label: 'Paydaş' },
];

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {description && <div className="text-xs text-slate-400 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-red-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

/* ─── SETTINGS TAB ─── */
function UGZSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getUGZSettings()
      .then(arr => {
        const obj = {};
        arr.forEach(s => { obj[s.key] = s.value; });
        setSettings(obj);
      })
      .catch(() => toast('Ayarlar yüklenemedi', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUGZSettingsBulk(settings);
      toast('Ayarlar kaydedildi');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
          <input value={settings.ugz_title || ''} onChange={e => set('ugz_title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alt Başlık</label>
          <input value={settings.ugz_subtitle || ''} onChange={e => set('ugz_subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
          <input type="date" value={settings.ugz_date || ''} onChange={e => set('ugz_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Saat</label>
          <input type="time" value={settings.ugz_time || ''} onChange={e => set('ugz_time', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Konum</label>
          <input value={settings.ugz_location || ''} onChange={e => set('ugz_location', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kayıt URL</label>
          <input value={settings.ugz_registration_url || ''} onChange={e => set('ugz_registration_url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Görünürlük Ayarları</h3>
        <Toggle checked={settings.ugz_page_active === 'true'} onChange={v => set('ugz_page_active', v ? 'true' : 'false')} label="Sayfa Aktif" description="UGZ sayfasını ziyaretçilere göster" />
        <Toggle checked={settings.ugz_countdown_visible === 'true'} onChange={v => set('ugz_countdown_visible', v ? 'true' : 'false')} label="Geri Sayım" description="Ana sayfada geri sayım sayacını göster" />
        <Toggle checked={settings.ugz_speakers_visible === 'true'} onChange={v => set('ugz_speakers_visible', v ? 'true' : 'false')} label="Konuşmacılar" description="Konuşmacı bölümünü göster" />
        <Toggle checked={settings.ugz_program_visible === 'true'} onChange={v => set('ugz_program_visible', v ? 'true' : 'false')} label="Program" description="Program bölümünü göster" />
        <Toggle checked={settings.ugz_sponsors_visible === 'true'} onChange={v => set('ugz_sponsors_visible', v ? 'true' : 'false')} label="Sponsorlar" description="Sponsor bölümünü göster" />
        <Toggle checked={settings.ugz_registration_visible === 'true'} onChange={v => set('ugz_registration_visible', v ? 'true' : 'false')} label="Kayıt Bölümü" description="Kayıt bölümünü ve butonunu göster" />
        {settings.ugz_registration_visible === 'true' && (
          <Toggle checked={settings.ugz_registration_open === 'true'} onChange={v => set('ugz_registration_open', v ? 'true' : 'false')} label="Kayıt URL Aktif" description="Açıkken kayıt butonu URL'ye yönlendirir, kapalıyken 'Kayıtlar yakında açılacak' gösterir" />
        )}
      </div>

      {/* Edition Number */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Zirve Numarası</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" checked={settings.ugz_edition_mode !== 'manual'} onChange={() => set('ugz_edition_mode', 'auto')} className="accent-red-500" />
            Otomatik (her yıl +1)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" checked={settings.ugz_edition_mode === 'manual'} onChange={() => set('ugz_edition_mode', 'manual')} className="accent-red-500" />
            Manuel
          </label>
        </div>
        {settings.ugz_edition_mode === 'manual' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zirve Numarası</label>
            <input type="number" value={settings.ugz_edition_number || '18'} onChange={e => set('ugz_edition_number', e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Baz yıl: {settings.ugz_base_year || '2026'}, Baz numara: {settings.ugz_base_number || '18'} → Şu anki: <span className="font-bold text-slate-700">{parseInt(settings.ugz_base_number || '18') + (new Date().getFullYear() - parseInt(settings.ugz_base_year || '2026'))}. Zirve</span>
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">
          <Save className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

/* ─── SPEAKERS TAB ─── */
const EMPTY_SPEAKER = { name: '', title: '', company: '', bio: '', image_path: '', sort_order: 0, is_visible: 1 };

function UGZSpeakers() {
  const user = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_SPEAKER);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = () => { api.getUGZSpeakers().then(setItems).catch(() => toast('Veriler yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const move = useReorder({ items, updateFn: api.updateUGZSpeaker, load, toast });

  const openNew = () => { setEditing(null); setForm({ ...EMPTY_SPEAKER }); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m.id); setForm({ ...m }); setModalOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload(file);
      setForm(f => ({ ...f, image_path: res.path }));
      toast('Fotoğraf yüklendi');
    } catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('İsim gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateUGZSpeaker(editing, form); toast('Konuşmacı güncellendi'); }
      else { await api.createUGZSpeaker(form); toast('Konuşmacı eklendi'); }
      setModalOpen(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUGZSpeaker(confirm.id);
      toast('Konuşmacı silindi');
      setConfirm({ open: false, id: null });
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{items.length} konuşmacı</span>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">
          <Plus className="w-4 h-4" /> Yeni Konuşmacı
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz konuşmacı eklenmedi</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni konuşmacı ekle</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Sıra</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Fotoğraf</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ad</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Unvan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Firma</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Görünür</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((m, i) => (
                <tr key={m.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-4 py-3"><ReorderControls idx={i} total={items.length} onMove={move} /></td>
                  <td className="px-4 py-3">
                    {m.image_path ? (
                      <img src={m.image_path} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">{m.name[0]}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{m.title}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{m.company}</td>
                  <td className="px-4 py-3">
                    {m.is_visible ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setConfirm({ open: true, id: m.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Konuşmacıyı Düzenle' : 'Yeni Konuşmacı'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unvan</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="CEO" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Konuşmacının mesleki unvanı. Örn: CEO, Kurucu Ortak, Genel Müdür</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Firma</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Konuşmacının temsil ettiği kurum/şirket adı</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biyografi</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            <p className="text-[10px] text-slate-400 mt-1">Kısa tanıtım yazısı. 2-3 cümle. Konuşmacının uzmanlık alanı ve deneyimi.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fotoğraf</label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.image_path && <img src={form.image_path} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition">
                <ImageIcon className="w-4 h-4" /> Medyadan Seç
              </button>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 cursor-pointer transition">
                <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              {form.image_path && <button type="button" onClick={() => setForm(f => ({ ...f, image_path: '' }))} className="text-xs text-red-500 hover:text-red-600">Kaldır</button>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Önerilen: 400x400px, kare, JPG. Profesyonel portre fotoğraf.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Küçük sayı önce görünür. Keynote konuşmacıları en üste.</p>
            </div>
            <div className="flex items-end pb-1">
              <Toggle checked={!!form.is_visible} onChange={v => setForm(f => ({ ...f, is_visible: v ? 1 : 0 }))} label="Görünür" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">
              {saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Konuşmacıyı Sil" message="Bu konuşmacıyı silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, image_path: p }))} currentPath={form.image_path} />
    </div>
  );
}

/* ─── PROGRAM TAB ─── */
const EMPTY_SESSION = { time: '', title: '', description: '', speaker_name: '', session_type: 'talk', sort_order: 0, is_visible: 1 };

function UGZProgram() {
  const user = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_SESSION);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = () => { api.getUGZProgram().then(setItems).catch(() => toast('Veriler yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const move = useReorder({ items, updateFn: api.updateUGZProgram, load, toast });

  const openNew = () => { setEditing(null); setForm({ ...EMPTY_SESSION }); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m.id); setForm({ ...m }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast('Başlık gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateUGZProgram(editing, form); toast('Oturum güncellendi'); }
      else { await api.createUGZProgram(form); toast('Oturum eklendi'); }
      setModalOpen(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUGZProgram(confirm.id);
      toast('Oturum silindi');
      setConfirm({ open: false, id: null });
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const getSessionBadge = (type) => {
    const st = SESSION_TYPES.find(s => s.value === type);
    if (!st) return null;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{items.length} oturum</span>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">
          <Plus className="w-4 h-4" /> Yeni Oturum
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz oturum eklenmedi</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni oturum ekle</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Sıra</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Saat</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Başlık</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Konuşmacı</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Tür</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Görünür</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((m, i) => (
                <tr key={m.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-4 py-3"><ReorderControls idx={i} total={items.length} onMove={move} /></td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{m.time}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{m.title}</td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{m.speaker_name || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{getSessionBadge(m.session_type)}</td>
                  <td className="px-4 py-3">
                    {m.is_visible ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setConfirm({ open: true, id: m.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Oturumu Düzenle' : 'Yeni Oturum'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Saat</label>
              <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="09:00 - 09:30" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Başlangıç-bitiş formatında. Örn: 09:00 - 09:30</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
              <select value={form.session_type} onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Programda renk kodlaması için kullanılır.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Oturumun adı. Örn: Keynote: Girişimciliğin Geleceği</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            <p className="text-[10px] text-slate-400 mt-1">Opsiyonel. Oturumun kısa tanımı.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konuşmacı</label>
            <input value={form.speaker_name} onChange={e => setForm(f => ({ ...f, speaker_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Bu oturumun konuşmacısının adı. Ara ve kapanış için boş bırakın.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Program sırasına göre numaralandırın. 1, 2, 3...</p>
            </div>
            <div className="flex items-end pb-1">
              <Toggle checked={!!form.is_visible} onChange={v => setForm(f => ({ ...f, is_visible: v ? 1 : 0 }))} label="Görünür" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">
              {saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Oturumu Sil" message="Bu oturumu silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
    </div>
  );
}

/* ─── SPONSORS TAB ─── */
const EMPTY_SPONSOR = { name: '', logo_path: '', tier: 'platin', website_url: '', sort_order: 0, is_visible: 1 };

function UGZSponsors() {
  const user = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_SPONSOR);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = () => { api.getUGZSponsors().then(setItems).catch(() => toast('Veriler yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setEditing(null); setForm({ ...EMPTY_SPONSOR }); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m.id); setForm({ ...m }); setModalOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('png')) {
      toast('Lütfen PNG formatında logo yükleyin', 'error');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const res = await api.upload(file);
      setForm(f => ({ ...f, logo_path: res.path }));
      toast('Logo yüklendi');
    } catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('Sponsor adı gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateUGZSponsor(editing, form); toast('Sponsor güncellendi'); }
      else { await api.createUGZSponsor(form); toast('Sponsor eklendi'); }
      setModalOpen(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUGZSponsor(confirm.id);
      toast('Sponsor silindi');
      setConfirm({ open: false, id: null });
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const getTierLabel = (tier) => SPONSOR_TIERS.find(t => t.value === tier)?.label || tier;

  const grouped = SPONSOR_TIERS.map(tier => ({
    ...tier,
    sponsors: items.filter(s => s.tier === tier.value),
  })).filter(g => g.sponsors.length > 0);

  // Reorder within a single tier: renumber that tier's items with 10-step gaps.
  // Other tiers keep their sort_order since they display in separate filters anyway.
  const moveInTier = async (tierSponsors, idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= tierSponsors.length) return;
    const reordered = [...tierSponsors];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    try {
      await Promise.all(reordered.map((it, i) =>
        api.updateUGZSponsor(it.id, { ...it, sort_order: (i + 1) * 10 })
      ));
      toast('Sıralama güncellendi');
      load();
    } catch (err) {
      toast(err.message || 'Sıralama kaydedilemedi', 'error');
      load();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{items.length} sponsor</span>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">
          <Plus className="w-4 h-4" /> Yeni Sponsor
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz sponsor eklenmedi</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni sponsor ekle</button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.value}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{group.label}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {group.sponsors.map((s, i) => (
                  <div key={s.id} className={`bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-3 relative group ${!s.is_visible ? 'opacity-50' : ''}`}>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <ReorderControls idx={i} total={group.sponsors.length} onMove={(idx, delta) => moveInTier(group.sponsors, idx, delta)} />
                    </div>
                    {s.logo_path ? (
                      <img src={s.logo_path} alt={s.name} className="w-20 h-20 object-contain" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold">{s.name[0]}</div>
                    )}
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-800 truncate max-w-[140px]">{s.name}</div>
                      {s.website_url && (
                        <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center justify-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" /> Web
                        </a>
                      )}
                    </div>
                    {!s.is_visible && <EyeOff className="absolute bottom-2 right-2 w-3.5 h-3.5 text-slate-400" />}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEdit(s)} className="p-1 bg-white border border-gray-200 rounded-md hover:bg-blue-50 text-blue-500 transition shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConfirm({ open: true, id: s.id })} className="p-1 bg-white border border-gray-200 rounded-md hover:bg-red-50 text-red-500 transition shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sponsoru Düzenle' : 'Yeni Sponsor'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sponsor Adı *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo <span className="text-slate-400 font-normal">(PNG)</span></label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.logo_path && <img src={form.logo_path} alt="" className="w-16 h-16 object-contain bg-slate-50 rounded-lg p-1" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition">
                <ImageIcon className="w-4 h-4" /> Medyadan Seç
              </button>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 cursor-pointer transition">
                <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'PNG Yükle'}
                <input type="file" accept="image/png" onChange={handleUpload} className="hidden" />
              </label>
              {form.logo_path && <button type="button" onClick={() => setForm(f => ({ ...f, logo_path: '' }))} className="text-xs text-red-500 hover:text-red-600">Kaldır</button>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">PNG format, şeffaf arka plan önerilir. Min 200x200px.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seviye</label>
              <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {SPONSOR_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Ana Sponsor en büyük logoda, Destekçi en küçükte gösterilir.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
            <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Opsiyonel. Logoya tıklanınca açılacak link.</p>
          </div>
          <Toggle checked={!!form.is_visible} onChange={v => setForm(f => ({ ...f, is_visible: v ? 1 : 0 }))} label="Görünür" description="Sponsoru sayfada göster" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">
              {saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Sponsoru Sil" message="Bu sponsoru silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, logo_path: p }))} currentPath={form.logo_path} />
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function AdminUGZ() {
  const [tab, setTab] = useState('settings');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">18. UGZ Yönetimi</h1>
            <p className="text-xs text-slate-400">Zirve ayarları, konuşmacılar, program ve sponsorlar</p>
          </div>
        </div>
      </div>

      {/* Tabs — grid on mobile (2×2) so labels never overflow, row on sm+ */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 mb-6 bg-slate-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-0 ${tab === t.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <t.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'settings' && <UGZSettings />}
      {tab === 'speakers' && <UGZSpeakers />}
      {tab === 'program' && <UGZProgram />}
      {tab === 'sponsors' && <UGZSponsors />}
    </div>
  );
}
