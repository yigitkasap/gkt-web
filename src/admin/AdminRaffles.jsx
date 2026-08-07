import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Gift, Upload, Image as ImageIcon, Dice5 } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import ReorderControls, { useReorder } from './ReorderControls';
import MediaPicker from './MediaPicker';
import RaffleDrawer from './RaffleDrawer';

const EMPTY = { name: '', prize: '', winner_name: '', backup_names: '', raffle_date: '', image_path: '', sort_order: 0, is_visible: 1 };

export default function AdminRaffles() {
  const user = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  // Page-visibility toggle lives in /api/settings under 'raffles_page_active'.
  const [pageActive, setPageActive] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drawingFor, setDrawingFor] = useState(null); // the raffle being drawn

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const res = await api.upload(file); setForm(f => ({ ...f, image_path: res.path })); toast('Görsel yüklendi'); }
    catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); }
  };

  const load = () => {
    api.getRaffles()
      .then(setItems)
      .catch(() => toast('Veriler yüklenemedi', 'error'))
      .finally(() => setLoading(false));
    api.getSettings().then(s => setPageActive(s.raffles_page_active === 'true')).catch(() => {});
  };
  useEffect(load, []);

  const move = useReorder({ items, updateFn: api.updateRaffle, load, toast });

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m.id); setForm({ ...m }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('Çekiliş adı gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateRaffle(editing, form); toast('Çekiliş güncellendi'); }
      else { await api.createRaffle(form); toast('Çekiliş eklendi'); }
      setModalOpen(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteRaffle(confirm.id);
      toast('Çekiliş silindi');
      setConfirm({ open: false, id: null });
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const togglePage = async () => {
    if (user.role !== 'admin') { toast('Bu ayarı sadece admin değiştirebilir', 'error'); return; }
    setToggling(true);
    const next = !pageActive;
    try {
      await api.updateSetting('raffles_page_active', next ? 'true' : 'false');
      setPageActive(next);
      toast(next ? 'Çekiliş sayfası açıldı' : 'Çekiliş sayfası kapatıldı');
    } catch (err) { toast(err.message, 'error'); }
    finally { setToggling(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Gift className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Çekiliş</h1>
            <p className="text-xs text-slate-400">Çekiliş adı, ödülü ve kazananını yönet</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">
          <Plus className="w-4 h-4" /> Yeni Çekiliş
        </button>
      </div>

      {/* Page-wide visibility toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {pageActive ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span className="text-sm font-medium text-slate-700">Çekiliş sayfası {pageActive ? 'aktif' : 'kapalı'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {pageActive
              ? 'Sitede navbar\'da görünüyor, ziyaretçiler /cekilis sayfasına erişebilir.'
              : 'Sayfa navbar\'da gizli ve URL üzerinden doğrudan erişilemez.'}
          </p>
        </div>
        <button
          type="button"
          onClick={togglePage}
          disabled={toggling || user.role !== 'admin'}
          className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${pageActive ? 'bg-red-500' : 'bg-slate-300'}`}
          title={user.role !== 'admin' ? 'Sadece admin bu ayarı değiştirebilir' : ''}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${pageActive ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz çekiliş eklenmedi</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ İlk çekilişi ekle</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm table-fixed sm:table-auto">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-2 sm:px-4 py-3 font-semibold text-slate-600 w-12 sm:w-auto">Sıra</th>
                <th className="text-left px-2 sm:px-4 py-3 font-semibold text-slate-600">Çekiliş</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Ödül</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Kazanan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Tarih</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Görünür</th>
                <th className="text-right px-2 sm:px-4 py-3 font-semibold text-slate-600 w-28 sm:w-auto">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((m, i) => (
                <tr key={m.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-2 sm:px-4 py-3 align-top"><ReorderControls idx={i} total={items.length} onMove={move} /></td>
                  <td className="px-2 sm:px-4 py-3 min-w-0">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                      {m.image_path ? (
                        <img src={m.image_path} alt={m.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <span className="font-medium text-slate-800 break-words">{m.name}</span>
                          {/* Mobile-only visibility pill — dedicated column shows on md+ */}
                          <span className="md:hidden mt-0.5">
                            {m.is_visible
                              ? <Eye className="w-3.5 h-3.5 text-emerald-500" title="Görünür" />
                              : <EyeOff className="w-3.5 h-3.5 text-slate-300" title="Gizli" />}
                          </span>
                        </div>
                        {/* Mobile: winner + backup summary under title (since the Kazanan column is hidden) */}
                        <div className="sm:hidden mt-1 text-[11px] text-slate-500">
                          {m.winner_name ? m.winner_name.split(/\n+/).filter(Boolean)[0] : '—'}
                          {m.backup_names && m.backup_names.trim() && (
                            <span className="text-slate-400"> · +{m.backup_names.split(/\n+/).filter(Boolean).length} yedek</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{m.prize || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                    {m.winner_name || '—'}
                    {m.backup_names && m.backup_names.trim() && (
                      <div className="mt-1 text-[10px] text-slate-400" title={m.backup_names}>
                        +{m.backup_names.split(/\n+/).filter(Boolean).length} yedek
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell font-mono text-xs">{m.raffle_date || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {m.is_visible ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                      <button onClick={() => setDrawingFor(m)} className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition" title="Çekiliş çek"><Dice5 className="w-4 h-4" /></button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Çekilişi Düzenle' : 'Yeni Çekiliş'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Çekiliş Adı *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Örn: Bahar Dönemi Çekilişi" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ödül</label>
            <input value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} placeholder="Örn: Bluetooth Kulaklık" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kazanan{form.winner_name && form.winner_name.split(/\n+/).filter(Boolean).length > 1 ? `lar (${form.winner_name.split(/\n+/).filter(Boolean).length})` : ''}</label>
            <textarea
              value={form.winner_name}
              onChange={e => setForm(f => ({ ...f, winner_name: e.target.value }))}
              placeholder={'Ad Soyad\n\nBirden fazla kazanan için her satıra bir isim yaz.'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">"Çek" ile otomatik doldurulur. Tek/çoklu kazanan — her satıra bir isim.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yedekler <span className="text-[10px] text-slate-400 font-normal">(yalnızca admin panelde görünür)</span></label>
            <textarea
              value={form.backup_names}
              onChange={e => setForm(f => ({ ...f, backup_names: e.target.value }))}
              placeholder={'Her satıra bir isim\nÖrnek:\nZeynep Kaya\nMehmet Demir'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">"Çek" ile otomatik doldurulur. Kamuya açık değil — sadece admin paneldeki kayıtta saklanır.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Görsel</label>
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
            <p className="text-[10px] text-slate-400 mt-1">Çekiliş kapağı veya ödül görseli. Önerilen: 800x600px.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
              <input type="date" value={form.raffle_date} onChange={e => setForm(f => ({ ...f, raffle_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Küçük sayı üstte görünür.</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.is_visible} onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked ? 1 : 0 }))} className="w-4 h-4 text-red-600 rounded" />
            <span className="text-sm text-slate-700">Sitede görünür</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">
              {saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Çekilişi Sil" message="Bu çekilişi silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, image_path: p }))} currentPath={form.image_path} />

      <RaffleDrawer
        open={!!drawingFor}
        onClose={() => setDrawingFor(null)}
        raffleName={drawingFor?.name}
        toast={toast}
        onSaveWinner={async (winnerList, backupList) => {
          if (!drawingFor) return;
          // Multiple winners are stored newline-joined in winner_name so the
          // public page can render them with whitespace-pre-line. Backups the
          // same way but admin-only (stripped from public GET).
          const winnersJoined = Array.isArray(winnerList) ? winnerList.filter(Boolean).join('\n') : (winnerList || '');
          const backupJoined  = Array.isArray(backupList) ? backupList.filter(Boolean).join('\n') : (backupList || '');
          await api.updateRaffle(drawingFor.id, {
            ...drawingFor,
            winner_name: winnersJoined,
            backup_names: backupJoined,
          });
          load();
        }}
      />
    </div>
  );
}
