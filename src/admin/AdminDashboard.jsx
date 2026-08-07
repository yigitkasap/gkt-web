import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, FileText, Mail, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { api } from './adminApi';
import { useAuth } from './AdminApp';

const CARD_BORDERS = ['border-t-red-500', 'border-t-emerald-500', 'border-t-blue-500', 'border-t-amber-500'];

export default function AdminDashboard() {
  const user = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ team: 0, events: 0, blog: 0, unread: 0 });
  const [messages, setMessages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getTeam().catch(() => []),
      api.getEvents().catch(() => []),
      api.getBlog().catch(() => []),
      api.getMessages().catch(() => []),
    ]).then(([team, events, blog, msgs]) => {
      setStats({ team: team.length, events: events.length, blog: blog.length, unread: msgs.filter(m => !m.is_read).length });
      setMessages(msgs.slice(0, 5));
      setPosts(blog.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Ekip Üyeleri', value: stats.team, icon: Users, color: 'bg-red-500', link: '/admin/team' },
    { label: 'Etkinlikler', value: stats.events, icon: CalendarDays, color: 'bg-emerald-500', link: '/admin/events' },
    { label: 'Blog Yazıları', value: stats.blog, icon: FileText, color: 'bg-blue-500', link: '/admin/blog' },
    { label: 'Okunmamış Mesaj', value: stats.unread, icon: Mail, color: 'bg-amber-500', link: '/admin/messages' },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-gray-200 p-5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-12 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hoş geldin, {user?.display_name || 'Admin'} 👋</h1>
        <p className="text-slate-500 mt-1">İşte genel durumun</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <button
            key={c.label}
            onClick={() => navigate(c.link)}
            className={`bg-white rounded-xl border border-gray-200 border-t-4 ${CARD_BORDERS[i]} p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left active:scale-[0.97]`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center shadow-lg shadow-${c.color}/20`}>
              <c.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{c.label === 'Okunmamış Mesaj' && c.value > 0 ? <span className="inline-flex items-center gap-2">{c.value}<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /></span> : c.value}</div>
              <div className="text-sm text-slate-500">{c.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/admin/blog')} className="group flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200 active:scale-[0.97]">
          <Plus className="w-4 h-4" /> Yeni Blog Yazısı <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button onClick={() => navigate('/admin/events')} className="group flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-all duration-200 active:scale-[0.97]">
          <Plus className="w-4 h-4" /> Yeni Etkinlik <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button onClick={() => navigate('/admin/messages')} className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-[0.97]">
          <Mail className="w-4 h-4" /> Mesajları Gör <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent messages */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-slate-800">Son Mesajlar</h2>
            <button onClick={() => navigate('/admin/messages')} className="group text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">Tümü <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" /></button>
          </div>
          <div className="divide-y divide-gray-100">
            {messages.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Mail className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Henüz mesaj yok</p>
              </div>
            ) : messages.map(m => (
              <div key={m.id} className={`px-5 py-3 flex gap-0 transition-all duration-200 hover:bg-gray-50 ${!m.is_read ? 'bg-red-50/40' : ''}`}>
                {!m.is_read && <div className="w-[3px] -ml-5 mr-[17px] bg-red-500 rounded-r shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${!m.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{m.name}</span>
                    <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{m.subject || m.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent blog posts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-slate-800">Son Blog Yazıları</h2>
            <button onClick={() => navigate('/admin/blog')} className="group text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">Tümü <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" /></button>
          </div>
          <div className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Henüz yazı yok</p>
              </div>
            ) : posts.map(p => (
              <div key={p.id} className="px-5 py-3 transition-all duration-200 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">{p.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{p.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{p.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
