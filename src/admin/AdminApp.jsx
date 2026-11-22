import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, FileText, Handshake, Mail,
  Clock, Target, Settings, UserCog, LogOut, Menu, X, ChevronRight, Bell, PanelLeftClose, PanelLeft, Rocket, Image, Gift, KeyRound
} from 'lucide-react';
import { api, getToken, isDemoMode } from './adminApi';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminTeam from './AdminTeam';
import AdminEvents from './AdminEvents';
import AdminBlog from './AdminBlog';
import AdminSponsors from './AdminSponsors';
import AdminMessages from './AdminMessages';
import AdminSettings from './AdminSettings';
import AdminMilestones from './AdminMilestones';
import AdminActivities from './AdminActivities';
import AdminUsers from './AdminUsers';
import AdminUGZ from './AdminUGZ';
import AdminMedia from './AdminMedia';
import AdminRaffles from './AdminRaffles';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-toast-in ${t.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-toast-in { animation: toastIn 0.35s cubic-bezier(0.16,1,0.3,1); }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-overlay { animation: overlayIn 0.2s ease-out; }
        @keyframes modalScale { from { transform: scale(0.95) translateY(-10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-modal-in { animation: modalScale 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        .hover-shake:hover { animation: shake 0.3s ease-in-out; }
      `}</style>
    </ToastContext.Provider>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center animate-overlay" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-modal-in" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-[0.97]">İptal</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 active:scale-[0.97]">Sil</button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ open, onClose }) {
  const toast = useToast();
  const [f, setF] = useState({ current: '', next: '', again: '' });
  const [saving, setSaving] = useState(false);
  const close = () => { setF({ current: '', next: '', again: '' }); onClose(); };
  const save = async () => {
    if (f.next.length < 10) return toast('Yeni şifre en az 10 karakter olmalı', 'error');
    if (f.next !== f.again) return toast('Yeni şifreler eşleşmiyor', 'error');
    setSaving(true);
    try { await api.changePassword(f.current, f.next); toast('Şifren değişti. Diğer cihazlardaki oturumların kapandı.'); close(); }
    catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
  return (
    <Modal open={open} onClose={close} title="Şifremi Değiştir">
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Mevcut şifre</label><input type="password" autoComplete="current-password" value={f.current} onChange={e => setF(s => ({ ...s, current: e.target.value }))} className={input} /></div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifre</label>
          <input type="password" autoComplete="new-password" value={f.next} onChange={e => setF(s => ({ ...s, next: e.target.value }))} className={input} />
          <p className="text-[11px] text-slate-500 mt-1">En az 10 karakter. Uzun bir parola cümlesi en güvenlisidir.</p>
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifre (tekrar)</label><input type="password" autoComplete="new-password" value={f.again} onChange={e => setF(s => ({ ...s, again: e.target.value }))} onKeyDown={e => e.key === 'Enter' && save()} className={input} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={close} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition">İptal</button>
          <button onClick={save} disabled={saving || !f.current || !f.next} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition">{saving ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}</button>
        </div>
      </div>
    </Modal>
  );
}

export function Modal({ open, onClose, title, children, wide, dirty }) {
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);
  if (!open) return null;
  const tryClose = () => {
    if (dirty) { setShowDirtyWarning(true); return; }
    onClose();
  };
  return (
    // Outside click intentionally does NOT close the modal — users close only via
    // the X button or Cancel/İptal action. Prevents accidentally losing form input.
    <div className="fixed inset-0 z-[80] flex flex-col animate-overlay">
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative flex-1 overflow-y-auto py-8 flex justify-center">
        <div className={`relative bg-white rounded-xl shadow-2xl mx-4 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} h-fit my-auto animate-modal-in`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button onClick={tryClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-[0.97]"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
      {showDirtyWarning && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center" onClick={e => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-modal-in">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Kaydedilmemiş değişiklikler</h3>
            <p className="text-slate-600 text-sm mb-6">Yaptığınız değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDirtyWarning(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all">Düzenlemeye Dön</button>
              <button onClick={() => { setShowDirtyWarning(false); onClose(); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all">Çık</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MENU = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, group: 'main' },
  { divider: true, group: 'content-start' },
  { path: '/admin/team', label: 'Ekip Üyeleri', icon: Users, group: 'content' },
  { path: '/admin/events', label: 'Etkinlikler', icon: CalendarDays, group: 'content' },
  { path: '/admin/ugz', label: '18. UGZ', icon: Rocket, group: 'content' },
  { path: '/admin/media', label: 'Medya', icon: Image, group: 'content' },
  { path: '/admin/blog', label: 'Blog & Duyurular', icon: FileText, group: 'content' },
  { path: '/admin/sponsors', label: 'Sponsorlar', icon: Handshake, group: 'content' },
  { path: '/admin/messages', label: 'Mesajlar', icon: Mail, badge: true, group: 'content' },
  { divider: true, group: 'other-start' },
  { path: '/admin/milestones', label: 'Tarihçe', icon: Clock, group: 'other' },
  { path: '/admin/activities', label: 'Aktiviteler', icon: Target, group: 'other' },
  { path: '/admin/raffles', label: 'Çekiliş', icon: Gift, group: 'other' },
  { divider: true, adminOnly: true, group: 'admin-start' },
  { path: '/admin/settings', label: 'Site Ayarları', icon: Settings, adminOnly: true, group: 'admin' },
  { path: '/admin/users', label: 'Kullanıcılar', icon: UserCog, adminOnly: true, group: 'admin' },
];

const BREADCRUMBS = {
  '/admin': ['Dashboard'],
  '/admin/team': ['Dashboard', 'Ekip Üyeleri'],
  '/admin/events': ['Dashboard', 'Etkinlikler'],
  '/admin/ugz': ['Dashboard', '18. UGZ'],
  '/admin/media': ['Dashboard', 'Medya Kütüphanesi'],
  '/admin/blog': ['Dashboard', 'Blog & Duyurular'],
  '/admin/sponsors': ['Dashboard', 'Sponsorlar'],
  '/admin/messages': ['Dashboard', 'Mesajlar'],
  '/admin/milestones': ['Dashboard', 'Tarihçe'],
  '/admin/activities': ['Dashboard', 'Aktiviteler'],
  '/admin/raffles': ['Dashboard', 'Çekiliş'],
  '/admin/settings': ['Dashboard', 'Site Ayarları'],
  '/admin/users': ['Dashboard', 'Kullanıcılar'],
};

function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pwOpen, setPwOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // DEMO MODE — auth bypass
    if (isDemoMode()) {
      setUser({ id: 0, username: 'demo', role: 'admin', display_name: 'Demo Kullanıcı', department: null });
      setLoading(false);
      return;
    }
    if (!getToken()) { setLoading(false); return; }
    api.me().then(u => { setUser(u); setLoading(false); }).catch(() => { localStorage.removeItem('gkt-admin-token'); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    api.getMessages().then(msgs => setUnreadCount(msgs.filter(m => !m.is_read).length)).catch(() => {});
  }, [user]);

  const logout = () => {
    const token = localStorage.getItem('gkt-admin-token');
    if (token) fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
    localStorage.removeItem('gkt-admin-token');
    navigate('/admin/login');
  };

  const crumbs = BREADCRUMBS[location.pathname] || ['Dashboard'];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <AuthContext.Provider value={user}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
          {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-overlay" onClick={() => setSidebarOpen(false)} />}

          {/* Sidebar */}
          <aside className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 bg-slate-900 z-50 transform transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-screen ${collapsed ? 'w-[68px]' : 'w-60'}`}>
            {/* Header */}
            <div className={`shrink-0 border-b border-slate-700/50 ${collapsed ? 'px-3 py-4' : 'px-4 py-4'}`}>
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <img src="/assets/logo_gkt.png" alt="GKT" className="h-9 w-9 rounded-full object-cover shadow-lg shadow-red-600/20 shrink-0" />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-xs leading-tight tracking-tight">Girişimcilik ve Kariyer Topluluğu</div>
                    <div className="text-slate-500 text-[9px] mt-0.5 font-medium">Websitesi Yönetim Paneli</div>
                  </div>
                )}
              </div>
            </div>

            {/* DEMO MODE badge */}
            {isDemoMode() && !collapsed && (
              <div className="mx-3 mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] font-display font-bold text-amber-500 uppercase tracking-wider animate-pulse">Demo Mod</span>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 min-h-0 py-3 px-2 overflow-y-auto space-y-0.5">
              {MENU.map((item, i) => {
                if (item.adminOnly && user.role !== 'admin') return null;
                if (item.divider) return <div key={i} className="my-2 mx-2 border-t border-slate-700/30" />;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${isActive ? 'bg-red-600/10 text-red-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full" />}
                        <item.icon className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {item.badge && unreadCount > 0 && (
                          <span className={`bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse ${collapsed ? 'absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] text-[8px]' : 'px-1'}`}>{unreadCount}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Collapse toggle (desktop) */}
            <div className="shrink-0 hidden lg:block px-2 pb-1">
              <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all duration-200" title={collapsed ? 'Genişlet' : 'Daralt'}>
                {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            {/* Profile */}
            <div className={`shrink-0 border-t border-slate-700/50 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
              {collapsed ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold" title={user.display_name}>
                    {user.display_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <button onClick={() => setPwOpen(true)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200" title="Şifremi Değiştir" aria-label="Şifremi değiştir">
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button onClick={logout} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200" title="Çıkış Yap">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.display_name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{user.display_name}</div>
                      <div className="text-slate-400 text-xs truncate">{user.role === 'admin' ? 'Yönetim Kurulu' : user.department ? `${user.department} ${user.role === 'koordinator' ? 'Koordinatörü' : 'Direktörü'}` : user.role === 'koordinator' ? 'Koordinatör' : 'Direktör'}</div>
                    </div>
                  </div>
                  {!isDemoMode() && (
                    <button onClick={() => setPwOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 active:scale-[0.97]">
                      <KeyRound className="w-4 h-4" /> Şifremi Değiştir
                    </button>
                  )}
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 active:scale-[0.97]">
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"><Menu className="w-5 h-5" /></button>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm">
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                    {i < crumbs.length - 1 ? (
                      <Link to="/admin" className="text-red-500 hover:text-red-600 hover:underline underline-offset-2 font-medium transition-colors">{c}</Link>
                    ) : (
                      <span className="text-slate-600 font-medium">{c}</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex-1" />
              <button
                onClick={() => navigate('/admin/messages')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition"
                title="Mesajları görüntüle"
              >
                <div className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </div>
                {unreadCount > 0 && <span className="text-red-500 font-medium hidden sm:inline">{unreadCount} okunmamış</span>}
              </button>
            </header>
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="ugz" element={<AdminUGZ />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="sponsors" element={<AdminSponsors />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="milestones" element={<AdminMilestones />} />
                <Route path="activities" element={<AdminActivities />} />
                <Route path="raffles" element={<AdminRaffles />} />
                {user.role === 'admin' && <Route path="settings" element={<AdminSettings />} />}
                {user.role === 'admin' && <Route path="users" element={<AdminUsers />} />}
              </Routes>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AuthContext.Provider>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="*" element={<AdminLayout />} />
    </Routes>
  );
}
