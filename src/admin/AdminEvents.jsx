import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import MediaPicker from './MediaPicker';
import ReorderControls, { useReorder } from './ReorderControls';

const CATEGORIES = ['Zirve', 'Kariyer', 'Gezi', 'Workshop', 'Sosyal', 'Konser'];
const COLORS = [
  { label: 'Kırmızı', value: 'from-red-500 to-rose-600' },
  { label: 'Yeşil', value: 'from-emerald-500 to-teal-600' },
  { label: 'Mor', value: 'from-purple-500 to-violet-600' },
  { label: 'Mavi', value: 'from-blue-500 to-cyan-600' },
  { label: 'Turuncu', value: 'from-orange-500 to-amber-600' },
];
const EMPTY = { title: '', date: '', location: '', category: '', description: '', color: '', is_upcoming: 1, sort_order: 0, image_path: '' };

export default function AdminEvents() {
  const user = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const res = await api.upload(file); setForm(f => ({ ...f, image_path: res.path })); toast('Görsel yüklendi'); }
    catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); }
  };

  const load = () => { api.getEvents().then(setEvents).catch(() => toast('Yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = events.filter(e => tab === 'upcoming' ? e.is_upcoming : !e.is_upcoming);
  const move = useReorder({ items: filtered, updateFn: api.updateEvent, load, toast });

  const openNew = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (ev) => { setEditing(ev.id); setForm({ ...ev }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast('Başlık gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateEvent(editing, form); toast('Etkinlik güncellendi'); }
      else { await api.createEvent(form); toast('Etkinlik eklendi'); }
      setModalOpen(false); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.deleteEvent(confirm.id); toast('Etkinlik silindi'); setConfirm({ open: false, id: null }); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Etkinlikler</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni Etkinlik</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('upcoming')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'upcoming' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Yaklaşan</button>
        <button onClick={() => setTab('past')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'past' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Geçmiş</button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz etkinlik yok</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni etkinlik ekle</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Sıra</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Başlık</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Tarih</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Mekan</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Kategori</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((ev, i) => (
                <tr key={ev.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-4 py-3"><ReorderControls idx={i} total={filtered.length} onMove={move} /></td>
                  <td className="px-4 py-3 font-medium text-slate-800">{ev.title}</td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{ev.date}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{ev.location}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{ev.category}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(ev)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Pencil className="w-4 h-4" /></button>
                      {true && <button onClick={() => setConfirm({ open: true, id: ev.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Etkinliğin tam adı. Örn: 18. Ulusal Girişimcilik Zirvesi</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Etkinliğin gerçekleşeceği tarih</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mekan</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Örn: Hukuk Fakültesi Konferans Salonu, Kongre Merkezi</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Etkinlik Görseli</label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.image_path && <img src={form.image_path} alt="" className="h-16 rounded-lg object-cover" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition">
                <ImageIcon className="w-4 h-4" /> Medyadan Seç
              </button>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 cursor-pointer transition">
                <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              {form.image_path && <button type="button" onClick={() => setForm(f => ({ ...f, image_path: '' }))} className="text-xs text-red-500 hover:text-red-600">Kaldır</button>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Önerilen: 1200x750px (16:10 oran), JPG. Etkinlik afişi veya etkinlik içi fotoğraf.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Etkinliğin kısa tanımı. 2-3 cümle yeterli.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Seçin</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Zirve, Kariyer, Workshop, Sosyal, Gezi gibi bir kategori seçin.</p>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Renk</label>
              <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Seçin</option>
                {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Etkinlik Durumu</label>
              <select value={form.is_upcoming} onChange={e => setForm(f => ({ ...f, is_upcoming: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value={1}>Yaklaşan Etkinlik</option>
                <option value={0}>Geçmiş Etkinlik</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Yaklaşan etkinlikler ana sayfada gösterilir. Bitince 'Geçmiş' yapın.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">{saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Etkinliği Sil" message="Bu etkinliği silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, image_path: p }))} currentPath={form.image_path} />
    </div>
  );
}
