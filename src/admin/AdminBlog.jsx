import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, Star, Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link2, Minus, Eye, EyeOff, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import DOMPurify from 'dompurify';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';
import MediaPicker from './MediaPicker';

const CATEGORIES = ['Duyuru', 'Haber', 'Etkinlik', 'Röportaj'];
const EMPTY = { title: '', date: '', category: '', excerpt: '', content: '', is_featured: 0, cover_image: '' };
const MAX_FEATURED = 3;

function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const initializedRef = useRef(false);
  const lastExternalValue = useRef(value);

  useEffect(() => {
    // Load content when value changes externally (e.g. opening a different post)
    if (editorRef.current && value !== lastExternalValue.current) {
      editorRef.current.innerHTML = value || '';
      setCharCount(editorRef.current.innerText.length);
      lastExternalValue.current = value;
      initializedRef.current = true;
    } else if (editorRef.current && !initializedRef.current && value) {
      editorRef.current.innerHTML = value;
      setCharCount(editorRef.current.innerText.length);
      initializedRef.current = true;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastExternalValue.current = html;
      onChange(html);
      setCharCount(editorRef.current.innerText.length);
    }
  }, [onChange]);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('URL girin:');
    if (url) exec('createLink', url);
  };

  const ToolBtn = ({ onClick, active, children, title }) => (
    <button type="button" onClick={onClick} title={title} className={`p-1.5 rounded transition-colors ${active ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:bg-gray-200 hover:text-slate-700'}`}>
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        <ToolBtn onClick={() => exec('bold')} title="Kalın"><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="İtalik"><Italic className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Altı çizili"><Underline className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolBtn onClick={() => exec('formatBlock', '<h2>')} title="Başlık 2"><Heading2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', '<h3>')} title="Başlık 3"><Heading3 className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Liste"><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Sıralı Liste"><ListOrdered className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolBtn onClick={insertLink} title="Link"><Link2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => exec('insertHorizontalRule')} title="Ayraç"><Minus className="w-4 h-4" /></ToolBtn>
        <div className="flex-1" />
        <ToolBtn onClick={() => setShowPreview(!showPreview)} title={showPreview ? 'Düzenle' : 'Önizle'}>
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </ToolBtn>
      </div>
      {showPreview ? (
        <div className="p-4 min-h-[400px] prose prose-sm max-w-none bg-white" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value || '<p class="text-slate-400">İçerik yok</p>', { ALLOWED_TAGS: ['p','br','h2','h3','strong','em','u','ul','ol','li','a','hr','blockquote','code','span'], ALLOWED_ATTR: ['href','title','target','rel','class'] }) }} />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-4 min-h-[400px] text-sm text-slate-800 focus:outline-none bg-white [&:empty]:before:content-['Yazınızı_buraya_yazın...'] [&:empty]:before:text-slate-300 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_a]:text-red-500 [&_a]:underline [&_hr]:my-4 [&_hr]:border-gray-200"
          style={{ wordBreak: 'break-word' }}
        />
      )}
      <div className="flex items-center justify-end px-3 py-1.5 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-slate-400">{charCount} karakter</span>
      </div>
    </div>
  );
}

export default function AdminBlog() {
  const user = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [pickerOpen, setPickerOpen] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const res = await api.upload(file); setForm(f => ({ ...f, cover_image: res.path })); toast('Kapak görseli yüklendi'); }
    catch (err) { toast(err.message || 'Yükleme başarısız', 'error'); }
    finally { setUploading(false); }
  };

  const load = () => { api.getBlog().then(setPosts).catch(() => toast('Yüklenemedi', 'error')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const featuredCount = posts.filter(p => p.is_featured).length;
  const canFeature = (postId) => {
    if (editing && posts.find(p => p.id === editing)?.is_featured) return true;
    return featuredCount < MAX_FEATURED;
  };

  const openNew = () => { const f = { ...EMPTY, date: new Date().toISOString().split('T')[0] }; setEditing(null); setForm(f); setInitialForm(f); setModalOpen(true); };
  const openEdit = (p) => { const f = { ...p }; setEditing(p.id); setForm(f); setInitialForm(f); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast('Başlık gerekli', 'error');
    setSaving(true);
    try {
      if (editing) { await api.updateBlog(editing, form); toast('Yazı güncellendi'); }
      else { await api.createBlog(form); toast('Yazı eklendi'); }
      setModalOpen(false); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.deleteBlog(confirm.id); toast('Yazı silindi'); setConfirm({ open: false, id: null }); load(); }
    catch (err) { toast(err.message, 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Blog & Duyurular</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"><Plus className="w-4 h-4" /> Yeni Yazı</button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400">Henüz yazı yok</p>
          <button onClick={openNew} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">+ Yeni yazı ekle</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Başlık</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Kategori</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Tarih</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Öne Çıkan</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">İşlem</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p, i) => (
                <tr key={p.id} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition`}>
                  <td className="px-4 py-3 min-w-0">
                    <div className="font-medium text-slate-800 line-clamp-2 break-words">{p.title}</div>
                    <div className="text-xs text-slate-400 line-clamp-2 break-words">{p.excerpt}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs whitespace-nowrap">{p.category}</span></td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell whitespace-nowrap">{p.date}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{p.is_featured ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Star className="w-4 h-4 text-gray-300" />}</td>
                  <td className="px-4 py-3 text-right w-20">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition"><Pencil className="w-4 h-4" /></button>
                      {user.role === 'admin' && <button onClick={() => setConfirm({ open: true, id: p.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Yazıyı Düzenle' : 'Yeni Yazı'} wide dirty={isDirty}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">SEO için 50-70 karakter önerilir. Anahtar kelime içermeli.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kapak Görseli</label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.cover_image && <img src={form.cover_image} alt="Kapak" className="w-20 h-14 object-cover rounded-lg border border-gray-200" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-sm text-slate-600 hover:bg-gray-200 rounded-lg transition">
                <ImageIcon className="w-4 h-4" /> Medyadan Seç
              </button>
              <label className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
                <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
              {form.cover_image && <button type="button" onClick={() => setForm(f => ({ ...f, cover_image: '' }))} className="text-xs text-red-500 hover:text-red-600">Kaldır</button>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Önerilen: 1200x630px (sosyal medya uyumlu), JPG veya PNG. Yüklenmezse otomatik placeholder gösterilir.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-[10px] text-slate-400 mt-1">Yayın tarihi. İleri tarih girilirse o tarihe kadar yayınlanmaz.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Seçin</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Haber, Duyuru, Etkinlik, Röportaj gibi kategoriler.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kısa Özet <span className="text-slate-400">(max 200 karakter)</span></label>
            <textarea rows={2} maxLength={200} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-[10px] text-slate-400 mt-1">Google arama sonuçlarında görünecek açıklama. Max 200 karakter.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">İçerik</label>
            <RichEditor value={form.content} onChange={content => setForm(f => ({ ...f, content }))} />
            <p className="text-[10px] text-slate-400 mt-1">HTML editör: Metni seçip araç çubuğundan biçimlendirin. H2 ana başlık, H3 alt başlık için kullanılır.</p>
          </div>
          <div>
            <label className={`flex items-center gap-2 ${!canFeature(editing) && !form.is_featured ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={!!form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))} disabled={!canFeature(editing) && !form.is_featured} className="w-4 h-4 text-red-600 rounded disabled:opacity-50" />
              <span className="text-sm text-slate-700">Öne Çıkan Yazı</span>
            </label>
            <p className="text-[10px] text-slate-400 mt-1">En fazla 3 yazı öne çıkarılabilir. Ana sayfada ve blog sayfasında vurgulanır.</p>
            {!canFeature(editing) && !form.is_featured && (
              <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                En fazla {MAX_FEATURED} yazı öne çıkarılabilir. Yeni bir yazıyı öne çıkarmak için mevcut öne çıkan yazılardan birini kaldırın.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition">{saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Ekle')}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} title="Yazıyı Sil" message="Bu yazıyı silmek istediğinize emin misiniz?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={p => setForm(f => ({ ...f, cover_image: p }))} currentPath={form.cover_image} />
    </div>
  );
}
