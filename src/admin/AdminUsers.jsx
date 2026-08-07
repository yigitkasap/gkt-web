import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Shield, UserCog, Users } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';

const DEPARTMENTS = ['Medya ve IT', 'Etkinlik ve Org.', 'Kurumsal İlişkiler', 'Üye İlişkileri'];
const ROLE_LABELS = { admin: 'Başkan', koordinator: 'Koordinatör', direktor: 'Direktör' };
const ROLE_STYLES = { admin: 'bg-red-100 text-red-700', koordinator: 'bg-purple-100 text-purple-700', direktor: 'bg-blue-100 text-blue-700' };
const ROLE_ICONS = { admin: Shield, koordinator: UserCog, direktor: Users };

export default function AdminUsers() {
  const currentUser = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ username: '', display_name: '', password: '', role: 'direktor', department: '' });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = () => { api.getUsers().then(setUsers).catch(() => toast('Yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setForm({ username: '', display_name: '', password: '', role: 'direktor', department: '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.username.trim() || !form.password.trim()) return toast('Kullanıcı adı ve şifre gerekli', 'error');
    if (['koordinator', 'direktor'].includes(form.role) && !form.department) return toast('Departman seçimi gerekli', 'error');
    setSaving(true);
    try {
      const data = { ...form };
      if (data.role === 'admin') data.department = null;
      await api.createUser(data);
      toast('Kullanıcı oluşturuldu');
      setModalOpen(false); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.deleteUser(confirm.id); toast('Kullanıcı silindi'); setConfirm({ open: false, id: null }); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Kullanıcılar</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni Kullanıcı</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed sm:table-auto">
          <thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-2 sm:px-4 py-3 font-semibold text-slate-600">Kullanıcı</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Görünen Ad</th>
            <th className="text-left px-2 sm:px-4 py-3 font-semibold text-slate-600 w-24 sm:w-auto">Rol</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Departman</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Oluşturma</th>
            <th className="text-right px-2 sm:px-4 py-3 font-semibold text-slate-600 w-14 sm:w-auto">İşlem</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u, i) => {
              const RIcon = ROLE_ICONS[u.role] || UserCog;
              return (
                <tr key={u.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-2 sm:px-4 py-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{u.display_name?.[0]?.toUpperCase() || 'U'}</div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">{u.username}</div>
                        {/* Mobile: show display_name under username since the dedicated column is hidden */}
                        <div className="sm:hidden text-[11px] text-slate-500 truncate">{u.display_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{u.display_name}</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${ROLE_STYLES[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      <RIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{ROLE_LABELS[u.role] || u.role}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{u.department || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="px-2 sm:px-4 py-3 text-right">
                    {u.id !== currentUser.id && u.id !== 1 && (
                      <button onClick={() => setConfirm({ open: true, id: u.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition" title="Sil"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Kullanıcı">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı *</label>
            <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Giriş için kullanılacak. Boşluk ve özel karakter kullanmayın. Örn: medya-koord</p>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Görünen Ad</label><input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre *</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">En az 8 karakter. Büyük harf, küçük harf ve rakam içermeli.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value, department: e.target.value === 'admin' ? '' : f.department }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="direktor">Direktör</option>
              <option value="koordinator">Koordinatör</option>
              <option value="admin">Başkan</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Başkan: Tüm yetkilere sahip. Koordinatör: Kendi departmanını yönetir. Direktör: Sınırlı düzenleme yetkisi.</p>
          </div>
          {['koordinator', 'direktor'].includes(form.role) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departman *</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Seçin</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Koordinatör ve Direktör için zorunlu. Kullanıcının bağlı olduğu departmanı seçin.</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">{saving ? 'Oluşturuluyor...' : 'Oluştur'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Kullanıcıyı Sil" message="Bu kullanıcıyı silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
    </div>
  );
}
