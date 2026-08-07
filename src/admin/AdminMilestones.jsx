import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import ReorderControls, { useReorder } from './ReorderControls';

const EMPTY = { year: '', title: '', description: '', sort_order: 0 };

export default function AdminMilestones() {
  const user = useAuth();
  const toast = useToast();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = () => { api.getMilestones().then(setMilestones).catch(() => toast('Yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m.id); setForm({ ...m }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast('Başlık gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateMilestone(editing, form); toast('Güncellendi'); }
      else { await api.createMilestone(form); toast('Eklendi'); }
      setModalOpen(false); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.deleteMilestone(confirm.id); toast('Silindi'); setConfirm({ open: false, id: null }); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const move = useReorder({ items: milestones, updateFn: api.updateMilestone, load, toast });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Tarihçe</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni Dönüm Noktası</button>
      </div>

      {milestones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz kayıt yok</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni ekle</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Sıra</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Yıl</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Başlık</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Açıklama</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {milestones.map((m, i) => (
                <tr key={m.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-4 py-3"><ReorderControls idx={i} total={milestones.length} onMove={move} /></td>
                  <td className="px-4 py-3 font-bold text-red-500">{m.year}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{m.title}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[300px] hidden md:table-cell">{m.description}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Pencil className="w-4 h-4" /></button>
                      {user.role === 'admin' && <button onClick={() => setConfirm({ open: true, id: m.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Düzenle' : 'Yeni Dönüm Noktası'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Yıl</label><input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">{saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Sil" message="Bu kaydı silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
    </div>
  );
}
