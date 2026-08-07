import { useState, useEffect, useRef } from 'react';
import { Search, Upload, X, Loader2, ImageIcon, Check } from 'lucide-react';
import { api } from './adminApi';
import { useToast } from './AdminApp';

export default function MediaPicker({ open, onClose, onSelect, currentPath }) {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('library');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.getMedia()
      .then(d => setFiles(Array.isArray(d) ? d : []))
      .catch(() => toast('Medya yüklenemedi', 'error'))
      .finally(() => setLoading(false));
  }, [open, toast]);

  if (!open) return null;

  const folders = [...new Set(files.map(f => f.folder || '/'))].sort();
  const filtered = files
    .filter(f => folderFilter === 'all' || (f.folder || '/') === folderFilter)
    .filter(f => !search || f.filename.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload(file);
      toast('Görsel yüklendi');
      onSelect(res.path);
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const pick = (file) => {
    onSelect(file.path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 animate-overlay" />
      <div className="relative flex-1 overflow-y-auto py-8 flex justify-center">
        <div
          className="relative bg-white rounded-xl shadow-2xl mx-4 w-full max-w-4xl h-fit my-auto animate-modal-in flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Görsel Seç</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kütüphaneden seçin veya yeni yükleyin</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition active:scale-[0.97]">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="px-6 pt-4 shrink-0">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setTab('library')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'library' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Kütüphane
              </button>
              <button
                onClick={() => setTab('upload')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Yeni Yükle
              </button>
            </div>
          </div>

          {tab === 'library' && (
            <>
              <div className="px-6 py-4 flex items-center gap-2 flex-wrap shrink-0 border-b border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Dosya ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <select
                  value={folderFilter}
                  onChange={e => setFolderFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="all">Tüm Klasörler</option>
                  {folders.map(f => <option key={f} value={f}>{f === '/' ? 'Kök' : f.replace('/', '')}</option>)}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Dosya bulunamadı</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {filtered.map(file => {
                      const isCurrent = file.path === currentPath;
                      return (
                        <button
                          key={file.filename}
                          type="button"
                          onClick={() => pick(file)}
                          className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition cursor-pointer ${isCurrent ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 hover:border-red-400'}`}
                          title={file.filename}
                        >
                          <img
                            src={file.path}
                            alt={file.filename}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="10">Görsel</text></svg>'; }}
                          />
                          {isCurrent && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition">
                            <p className="text-[10px] text-white font-medium truncate">{file.filename}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'upload' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50/50 p-12 text-center cursor-pointer transition"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                    <p className="text-sm text-slate-600 font-medium">Yükleniyor...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Görseli seçmek için tıklayın</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — max 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleUpload(e.target.files?.[0])}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
