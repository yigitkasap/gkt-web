import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Search, Image as ImageIcon } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import MediaPicker from './MediaPicker';
import ReorderControls, { useReorder } from './ReorderControls';

const DEPARTMENTS = ['Yönetim Kurulu', 'Medya ve IT', 'Etkinlik ve Org.', 'Kurumsal İlişkiler', 'Üye İlişkileri'];
const EMPTY = { name: '', role_title: '', department: '', image_path: '', phone: '', email: '', linkedin: '', sort_order: 0 };

export default function AdminTeam() {
  const user = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [filter, setFilter] = useState(user.role !== 'admin' && user.department ? user.department : '');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isAdmin = user.role === 'admin';
  const canAdd = isAdmin || user.role === 'koordinator';
  const canDelete = isAdmin || user.role === 'koordinator';

  const load = () => { api.getTeam().then(setMembers).catch(() => toast('Veriler yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, department: !isAdmin ? user.department : '' }); setModalOpen(true); };
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
    const data = { ...form, is_board: form.department === 'Yönetim Kurulu' ? 1 : 0 };
    setSaving(true);
    try {
      if (editing) { await api.updateTeam(editing, data); toast('Üye güncellendi'); }
      else { await api.createTeam(data); toast('Üye eklendi'); }
      setModalOpen(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteTeam(confirm.id);
      toast('Üye silindi');
      setConfirm({ open: false, id: null });
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const filtered = members.filter(m =>
    (!filter || m.department === filter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const move = useReorder({ items: filtered, updateFn: api.updateTeam, load, toast });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Ekip Üyeleri</h1>
        {canAdd && <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni Üye Ekle</button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <select value={filter} onChange={e => isAdmin && setFilter(e.target.value)} disabled={!isAdmin} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
          <option value="">Tüm Departmanlar</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz kayıt yok</p>
          {canAdd && <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni üye ekle</button>}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Üye</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Unvan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Departman</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">E-posta</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Sıra</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m, i) => (
                <tr key={m.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.image_path ? (
                        <img src={m.image_path} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">{m.name[0]}</div>
                      )}
                      <span className="font-medium text-slate-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{m.role_title}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{m.department}</span></td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{m.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ReorderControls idx={i} total={filtered.length} onMove={move} />
                      <span className="text-slate-500 text-xs">{m.sort_order}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Pencil className="w-4 h-4" /></button>
                      {canDelete && <button onClick={() => setConfirm({ open: true, id: m.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Üyeyi Düzenle' : 'Yeni Üye Ekle'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unvan</label>
              <input value={form.role_title} onChange={e => setForm(f => ({ ...f, role_title: e.target.value }))} placeholder="Koordinatör" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Örn: Yönetim Kurulu Başkanı, Medya ve IT Koordinatörü</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departman</label>
              <select value={form.department} onChange={e => isAdmin && setForm(f => ({ ...f, department: e.target.value }))} disabled={!isAdmin} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100">
                <option value="">Seçin</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Üyenin bağlı olduğu departman. YK üyeleri için 'Yönetim Kurulu' seçin.</p>
            </div>
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
            <p className="text-[10px] text-slate-400 mt-1">Önerilen: 400x400px, kare format, JPG. Yüz net görünmeli.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Opsiyonel. +90 ile başlayan format.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Örn: adsoyad@akdenizgkt.com</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
            <input value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
            <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Küçük sayı yukarıda görünür. YK üyeleri: 1-10, Koordinatörler: 11-20</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">
              {saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Üyeyi Sil" message="Bu üyeyi silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, image_path: p }))} currentPath={form.image_path} />
    </div>
  );
}
