import { useState, useEffect } from 'react';
import { Trash2, Loader2, Mail, MailOpen, Eye } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';

export default function AdminMessages() {
  const user = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = () => { api.getMessages().then(setMessages).catch(() => toast('Yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      try { await api.markRead(msg.id); load(); } catch {}
    }
  };

  const handleDelete = async () => {
    try { await api.deleteMessage(confirm.id); toast('Mesaj silindi'); setConfirm({ open: false, id: null }); if (selected?.id === confirm.id) setSelected(null); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mesajlar</h1>
          {unreadCount > 0 && <p className="text-sm text-red-500 mt-0.5">{unreadCount} okunmamış mesaj</p>}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">Henüz mesaj yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 w-8"></th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Gönderen</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">E-posta</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Konu</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Tarih</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map((m, i) => (
                <tr key={m.id} className={`${!m.is_read ? 'bg-red-50/30' : i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition cursor-pointer`} onClick={() => openMessage(m)}>
                  <td className="px-4 py-3">{m.is_read ? <MailOpen className="w-4 h-4 text-slate-400" /> : <Mail className="w-4 h-4 text-red-500" />}</td>
                  <td className={`px-4 py-3 ${!m.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{m.name}</td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{m.email}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell truncate max-w-[200px]">{m.subject || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{new Date(m.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openMessage(m)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Eye className="w-4 h-4" /></button>
                      {user.role === 'admin' && <button onClick={() => setConfirm({ open: true, id: m.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Mesaj Detayı">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400">Gönderen</label><p className="text-sm font-medium text-slate-800">{selected.name}</p></div>
              <div><label className="text-xs text-slate-400">E-posta</label><p className="text-sm text-slate-600">{selected.email || '-'}</p></div>
              <div><label className="text-xs text-slate-400">Telefon</label><p className="text-sm text-slate-600">{selected.phone || '-'}</p></div>
              <div><label className="text-xs text-slate-400">Tarih</label><p className="text-sm text-slate-600">{new Date(selected.created_at).toLocaleString('tr-TR')}</p></div>
            </div>
            {selected.subject && <div><label className="text-xs text-slate-400">Konu</label><p className="text-sm font-medium text-slate-800">{selected.subject}</p></div>}
            <div><label className="text-xs text-slate-400">Mesaj</label><p className="text-sm text-slate-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg mt-1">{selected.message}</p></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirm.open} title="Mesajı Sil" message="Bu mesajı silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
    </div>
  );
}
