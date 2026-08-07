import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import MediaPicker from './MediaPicker';
import ReorderControls, { useReorder } from './ReorderControls';

const EMPTY = { name: '', logo_path: '', category: '', sort_order: 0 };

// Annual sponsorship categories (per GKT sponsorship kit).
const SPONSOR_CATEGORIES = [
  { value: '', label: 'Kategorisiz' },
  { value: 'ana', label: 'Yıllık Ana Sponsor' },
  { value: 'urun', label: 'Yıllık Ürün Sponsoru' },
];

export default function AdminSponsors() {
  const user = useAuth();
  const toast = useToast();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = () => { api.getSponsors().then(setSponsors).catch(() => toast('Yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s.id); setForm({ ...s }); setModalOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const res = await api.upload(file); setForm(f => ({ ...f, logo_path: res.path })); toast('Logo yüklendi'); }
    catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('İsim gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateSponsor(editing, form); toast('Sponsor güncellendi'); }
      else { await api.createSponsor(form); toast('Sponsor eklendi'); }
      setModalOpen(false); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.deleteSponsor(confirm.id); toast('Sponsor silindi'); setConfirm({ open: false, id: null }); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const move = useReorder({ items: sponsors, updateFn: api.updateSponsor, load, toast });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Sponsorlar</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni Sponsor</button>
      </div>

      {sponsors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz sponsor yok</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni sponsor ekle</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sponsors.map((s, i) => (
            <div key={s.id} className="relative bg-white rounded-xl border border-gray-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition">
              <div className="absolute top-1.5 left-1.5">
                <ReorderControls idx={i} total={sponsors.length} onMove={move} />
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                <button onClick={() => openEdit(s)} className="p-1 hover:bg-blue-50 rounded-md text-blue-500" title="Düzenle"><Pencil className="w-3.5 h-3.5" /></button>
                {user.role === 'admin' && <button onClick={() => setConfirm({ open: true, id: s.id })} className="p-1 hover:bg-red-50 rounded-md text-red-500" title="Sil"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="h-14 flex items-center justify-center mt-5">
                {s.logo_path
                  ? <img src={s.logo_path} alt={s.name} className="max-h-14 max-w-full object-contain" />
                  : <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Logo</div>}
              </div>
              <span className="text-xs font-medium text-slate-700 text-center line-clamp-2 break-words">{s.name}</span>
              {s.category && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-display font-bold uppercase tracking-wider text-center">
                  {SPONSOR_CATEGORIES.find(c => c.value === s.category)?.label || s.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sponsoru Düzenle' : 'Yeni Sponsor'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Firmanın resmi adı</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.logo_path && <img src={form.logo_path} alt="" className="h-12 object-contain" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition">
                <ImageIcon className="w-4 h-4" /> Medyadan Seç
              </button>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 cursor-pointer transition">
                <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              {form.logo_path && <button type="button" onClick={() => setForm(f => ({ ...f, logo_path: '' }))} className="text-xs text-red-500 hover:text-red-600">Kaldır</button>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Önerilen: PNG format, şeffaf arka plan, min 200x200px. Kare veya yatay format.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {SPONSOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">GKT sponsorluk dosyasındaki yıllık kategori.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">{saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Sponsoru Sil" message="Bu sponsoru silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, logo_path: p }))} currentPath={form.logo_path} />
    </div>
  );
}
