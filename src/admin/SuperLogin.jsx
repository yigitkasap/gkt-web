import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperLogin() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/super-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, new_password: newPassword || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) setError('Çok fazla deneme. 1 saat sonra tekrar dene.');
        else setError(data.error || 'Giriş başarısız');
        setLoading(false);
        return;
      }
      localStorage.setItem('gkt-admin-token', data.token);
      navigate('/admin');
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0A0A' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <img src="/assets/logo_gkt.png" alt="GKT" className="w-2/5 mx-auto mb-4" />
        <input
          type="password"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          placeholder="Güvenlik Anahtarı"
          required
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
        />
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Yeni Şifre (opsiyonel)"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm font-medium rounded-lg transition"
        >
          {loading ? '...' : 'Giriş'}
        </button>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </form>
    </div>
  );
}
