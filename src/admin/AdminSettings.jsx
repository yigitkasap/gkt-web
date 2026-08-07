import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from './adminApi';
import { useToast } from './AdminApp';

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState('');

  useEffect(() => {
    api.getSettings().then(s => { setSettings(s); setLoading(false); }).catch(() => { toast('Yüklenemedi', 'error'); setLoading(false); });
  }, []);

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const saveSection = async (keys) => {
    const sectionName = keys[0].split('_')[0];
    setSavingSection(sectionName);
    try {
      for (const key of keys) {
        if (settings[key] !== undefined) await api.updateSetting(key, settings[key]);
      }
      toast('Kaydedildi');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSavingSection(''); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  const Section = ({ title, children, keys, sectionId }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end">
        <button onClick={() => saveSection(keys)} disabled={savingSection === sectionId} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400 transition">
          {savingSection === sectionId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Kaydet
        </button>
      </div>
    </div>
  );

  const Input = ({ label, settingKey, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} value={settings[settingKey] || ''} onChange={e => update(settingKey, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Site Ayarları</h1>

      <Section title="İstatistikler" keys={['stat_year', 'stat_members', 'stat_events', 'stat_partners']} sectionId="stat">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Yıl" settingKey="stat_year" placeholder="2009" />
          <Input label="Üye Sayısı" settingKey="stat_members" placeholder="6000" />
          <Input label="Etkinlik Sayısı" settingKey="stat_events" placeholder="200" />
          <Input label="Paydaş Sayısı" settingKey="stat_partners" placeholder="50" />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Tam sayı girin. '500' girilirse sitede '500+' olarak görünür.</p>
      </Section>

      <Section title="Sosyal Medya" keys={['social_instagram', 'social_youtube', 'social_tiktok', 'social_twitter', 'social_facebook', 'social_linkedin']} sectionId="social">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Instagram" settingKey="social_instagram" placeholder="https://instagram.com/..." />
          <Input label="YouTube" settingKey="social_youtube" placeholder="https://youtube.com/..." />
          <Input label="TikTok" settingKey="social_tiktok" placeholder="https://tiktok.com/..." />
          <Input label="Twitter / X" settingKey="social_twitter" placeholder="https://x.com/..." />
          <Input label="Facebook" settingKey="social_facebook" placeholder="https://facebook.com/..." />
          <Input label="LinkedIn" settingKey="social_linkedin" placeholder="https://linkedin.com/..." />
        </div>
      </Section>

      <Section title="İletişim Bilgileri" keys={['contact_address', 'contact_phone', 'contact_email']} sectionId="contact">
        <div>
          <Input label="Adres" settingKey="contact_address" placeholder="Üniversite adresi..." />
          <p className="text-[10px] text-slate-400 mt-1">İletişim sayfasında gösterilecek fiziksel adres.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input label="Telefon" settingKey="contact_phone" placeholder="+90 5xx xxx xx xx" />
          </div>
          <div>
            <Input label="E-posta" settingKey="contact_email" placeholder="info@akdenizgkt.com" />
            <p className="text-[10px] text-slate-400 mt-1">İletişim sayfasında gösterilecek e-posta adresi.</p>
          </div>
        </div>
      </Section>

      <Section title="Instagram Embed" keys={['ig_post_1', 'ig_post_1_type', 'ig_post_2', 'ig_post_2_type', 'ig_post_3', 'ig_post_3_type', 'ig_post_4', 'ig_post_4_type']} sectionId="ig">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><Input label={`Post ${n} ID`} settingKey={`ig_post_${n}`} placeholder="Instagram Post ID" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
              <select value={settings[`ig_post_${n}_type`] || 'post'} onChange={e => update(`ig_post_${n}_type`, e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="post">Post</option>
                <option value="reel">Reel</option>
              </select>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
