import { createContext, useContext, useState, useEffect } from 'react';

const SiteDataContext = createContext({ settings: {}, loading: true });

export function SiteDataProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const sitePromise = fetch('/api/settings', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        // /api/settings returns an object { key: value } (not an array).
        // Legacy array shape is still accepted in case the endpoint changes.
        if (Array.isArray(data)) {
          const obj = {};
          data.forEach(s => { if (s.key) obj[s.key] = s.value; });
          setSettings(obj);
        } else if (data && typeof data === 'object') {
          setSettings(data);
        }
      })
      .catch(() => {});

    sitePromise.finally(() => {
      setLoading(false);
      clearTimeout(timeout);
    });
  }, []);

  return (
    <SiteDataContext.Provider value={{ settings, loading }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export const useSiteData = () => useContext(SiteDataContext);
