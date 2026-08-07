import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Grid, List, Search, Upload, Trash2, Copy, ExternalLink, AlertTriangle, Check, X, Loader2, HardDrive, ImageIcon, CheckCircle } from 'lucide-react';
import { api } from './adminApi';
import { useAuth, useToast, Modal, ConfirmDialog } from './AdminApp';

export default function AdminMedia() {
  const user = useAuth();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalSize: '0 B', used: 0, unused: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [detailFile, setDetailFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, filename: null, force: false, message: '' });
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getMedia(), api.getMediaStats()])
      .then(([f, s]) => { setFiles(f || []); setStats(s || {}); })
      .catch(() => toast('Veriler yüklenemedi', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const folders = [...new Set(files.map(f => f.folder || '/'))].sort();

  const filtered = files
    .filter(f => {
      if (filter === 'used') return f.usedIn && f.usedIn.length > 0;
      if (filter === 'unused') return !f.usedIn || f.usedIn.length === 0;
      return true;
    })
    .filter(f => folderFilter === 'all' || (f.folder || '/') === folderFilter)
    .filter(f => !search || f.filename.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'largest') return b.size - a.size;
      if (sort === 'smallest') return a.size - b.size;
      return a.filename.localeCompare(b.filename);
    });

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let successCount = 0;
    for (const file of fileList) {
      try {
        await api.upload(file);
        successCount++;
      } catch (err) {
        toast(file.name + ': ' + err.message, 'error');
      }
    }
    setUploading(false);
    setShowUpload(false);
    if (successCount > 0) {
      toast(successCount + ' dosya yüklendi');
      load();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) handleUpload(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDelete = async (filename, force = false) => {
    try {
      await api.deleteMedia(filename, force);
      toast('Dosya silindi');
      setDetailFile(null);
      setConfirm({ open: false, filename: null, force: false, message: '' });
      setSelected(prev => { const n = new Set(prev); n.delete(filename); return n; });
      load();
    } catch (err) {
      if (err.message && err.message.includes('kullanımda')) {
        setConfirm({ open: true, filename, force: true, message: err.message });
      } else {
        toast(err.message, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    const unusedSelected = [...selected].filter(fn => {
      const f = files.find(x => x.filename === fn);
      return f && (!f.usedIn || f.usedIn.length === 0);
    });
    if (unusedSelected.length === 0) {
      toast('Seçili dosyaların hepsi kullanımda, silinemez', 'error');
      return;
    }
    for (const fn of unusedSelected) {
      try { await api.deleteMedia(fn); } catch {}
    }
    toast(unusedSelected.length + ' dosya silindi');
    setSelected(new Set());
    load();
  };

  const toggleSelect = (filename) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(filename)) n.delete(filename); else n.add(filename);
      return n;
    });
  };

  const copyPath = (path) => {
    navigator.clipboard.writeText(window.location.origin + path);
    toast('URL kopyalandı');
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const anySelected = selected.size > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medya Kütüphanesi</h1>
          <p className="text-sm text-slate-500 mt-1">Yüklenen görselleri yönetin</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.total || 0}</div>
            <div className="text-xs text-slate-500">Toplam Dosya</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.totalSize || '0 B'}</div>
            <div className="text-xs text-slate-500">Toplam Boyut</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{stats.used || 0}</div>
            <div className="text-xs text-slate-500">Kullanılan</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{stats.unused || 0}</div>
            <div className="text-xs text-slate-500">Kullanılmayan</div>
          </div>
        </div>
      </div>

      {/* Toolbar — responsive grid on mobile, single row on lg+ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 lg:space-y-0">
        {/* Row 1 (mobile+): view toggle + search + upload. Same row on lg+ too. */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition ${view === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Izgara görünümü"
            ><Grid className="w-4 h-4" /></button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition ${view === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Liste görünümü"
            ><List className="w-4 h-4" /></button>
          </div>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition active:scale-[0.97] shrink-0"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2 (mobile): 3 filters in a 3-col grid so they line up cleanly. */}
        <div className="grid grid-cols-3 gap-2 lg:hidden">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-w-0"
          >
            <option value="all">Tümü</option>
            <option value="used">Kullanılan</option>
            <option value="unused">Kullanılmayan</option>
          </select>
          <select
            value={folderFilter}
            onChange={e => setFolderFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-w-0"
          >
            <option value="all">Tüm Klasörler</option>
            {folders.map(f => <option key={f} value={f}>{f === '/' ? 'Kök' : f.replace('/', '')}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-w-0"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="largest">En Büyük</option>
            <option value="smallest">En Küçük</option>
            <option value="name">İsim</option>
          </select>
        </div>

        {/* lg+: single row layout */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition ${view === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Izgara görünümü"
            ><Grid className="w-4 h-4" /></button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition ${view === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Liste görünümü"
            ><List className="w-4 h-4" /></button>
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="all">Tümü</option>
            <option value="used">Kullanılan</option>
            <option value="unused">Kullanılmayan</option>
          </select>
          <select
            value={folderFilter}
            onChange={e => setFolderFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="all">Tüm Klasörler</option>
            {folders.map(f => <option key={f} value={f}>{f === '/' ? 'Kök' : f.replace('/', '')}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="largest">En Büyük</option>
            <option value="smallest">En Küçük</option>
            <option value="name">İsim</option>
          </select>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56 pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition active:scale-[0.97]"
          >
            <Upload className="w-4 h-4" /> Görsel Yükle
          </button>
        </div>
      </div>

      {/* Upload area */}
      {showUpload && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`bg-white rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              <p className="text-sm text-slate-600 font-medium">Dosyalar yükleniyor...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600 font-medium">Görselleri sürükleyip bırakın veya tıklayın</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP, SVG desteklenir</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => handleUpload(e.target.files)}
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-600 mb-1">Dosya bulunamadı</h3>
          <p className="text-sm text-slate-400">
            {search ? 'Arama kriterlerinize uygun dosya yok' : 'Henüz görsel yüklenmemiş'}
          </p>
        </div>
      ) : view === 'grid' ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(file => {
            const isUnused = !file.usedIn || file.usedIn.length === 0;
            const isSelected = selected.has(file.filename);
            return (
              <div
                key={file.filename}
                className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                  isSelected ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => anySelected ? toggleSelect(file.filename) : setDetailFile(file)}
              >
                <img
                  src={file.path}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="12">Görsel</text></svg>'; }}
                />

                {/* Checkbox — always visible, click to select */}
                <div
                  className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 z-10 cursor-pointer ${
                    isSelected
                      ? 'bg-red-500 border-red-500 text-white opacity-100'
                      : 'bg-white/90 border-gray-300 opacity-100'
                  }`}
                  onClick={e => { e.stopPropagation(); toggleSelect(file.filename); }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-medium truncate">{file.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70 text-[10px]">{file.sizeFormatted}</span>
                    {isUnused ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-medium">
                        Kullanılmıyor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium">
                        Kullanılıyor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every(f => selected.has(f.filename))}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelected(new Set(filtered.map(f => f.filename)));
                        } else {
                          setSelected(new Set());
                        }
                      }}
                      className="rounded border-gray-300 text-red-500 focus:ring-red-500/20"
                    />
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Önizleme</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Dosya Adı</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Boyut</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Tarih</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Durum</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Kullanım</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(file => {
                  const isUnused = !file.usedIn || file.usedIn.length === 0;
                  const isSelected = selected.has(file.filename);
                  return (
                    <tr
                      key={file.filename}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-red-50/50' : ''}`}
                      onClick={() => setDetailFile(file)}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(file.filename)}
                          className="rounded border-gray-300 text-red-500 focus:ring-red-500/20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <img
                          src={file.path}
                          alt={file.filename}
                          className="w-10 h-10 rounded object-cover bg-gray-100"
                          onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="12">?</text></svg>'; }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] block">{file.filename}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{file.sizeFormatted}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(file.createdAt)}</td>
                      <td className="px-4 py-3">
                        {isUnused ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                            Kullanılmıyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                            Kullanılıyor
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {file.usedIn && file.usedIn.length > 0
                          ? file.usedIn.map(u => u.label).join(', ')
                          : <span className="text-slate-300">-</span>
                        }
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyPath(file.path)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="URL Kopyala"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {user.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(file.filename)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {anySelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-modal-in">
          <span className="text-sm font-medium">{selected.size} dosya seçildi</span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-slate-400 hover:text-white transition-colors"
            title="Seçimi Temizle"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-600" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.97]"
          >
            <Trash2 className="w-4 h-4" />
            Seçilenleri Sil
          </button>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detailFile} onClose={() => setDetailFile(null)} title="Dosya Detayı" wide>
        {detailFile && (
          <div className="space-y-6">
            {/* Image preview */}
            <div className="flex justify-center bg-gray-50 rounded-xl p-4">
              <img
                src={detailFile.path}
                alt={detailFile.filename}
                className="max-w-lg w-full h-auto rounded-lg object-contain max-h-80"
                onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f1f5f9" width="400" height="300"/><text x="200" y="155" text-anchor="middle" fill="%2394a3b8" font-size="16">Görsel yüklenemedi</text></svg>'; }}
              />
            </div>

            {/* File info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dosya Adı</label>
                <p className="text-sm text-slate-700 mt-1 font-medium break-all">{detailFile.filename}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Boyut</label>
                <p className="text-sm text-slate-700 mt-1">{detailFile.sizeFormatted}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tür</label>
                <p className="text-sm text-slate-700 mt-1">{detailFile.type}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarih</label>
                <p className="text-sm text-slate-700 mt-1">{formatDate(detailFile.createdAt)}</p>
              </div>
            </div>

            {/* Used in */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kullanıldığı Yerler</label>
              {detailFile.usedIn && detailFile.usedIn.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {detailFile.usedIn.map((usage, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-red-600 hover:text-red-700 hover:underline cursor-pointer font-medium">
                        {usage.label}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 mt-2">Bu dosya hiçbir yerde kullanılmıyor.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => copyPath(detailFile.path)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.97]"
              >
                <Copy className="w-4 h-4" />
                URL Kopyala
              </button>
              <div className="flex-1" />
              {user.role === 'admin' && (
                <button
                  onClick={() => handleDelete(detailFile.filename)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.97]"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm dialog for force delete */}
      <ConfirmDialog
        open={confirm.open}
        title="Dosya Kullanımda"
        message={confirm.message || 'Bu dosya başka yerlerde kullanılıyor. Yine de silmek istiyor musunuz?'}
        onConfirm={() => handleDelete(confirm.filename, true)}
        onCancel={() => setConfirm({ open: false, filename: null, force: false, message: '' })}
      />
    </div>
  );
}
