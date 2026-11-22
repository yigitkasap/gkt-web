import { demoTeam, demoEvents, demoBlog, demoSponsors, demoMessages, demoMilestones, demoActivities, demoSettings, demoUsers, demoUGZSettings, demoUGZSpeakers, demoUGZProgram, demoUGZSponsors, demoMedia } from './demoData';

const API = '/api';

// DEMO MODE — URL'de ?demo=true veya window.__DEMO_MODE__ ile aktif
export const isDemoMode = () => new URLSearchParams(window.location.search).get('demo') === 'true' || window.__DEMO_MODE__ === true;

const DEMO_WRITE_ERROR = 'Demo modda değişiklik yapılamaz';

const getToken = () => {
  try {
    const token = localStorage.getItem('gkt-admin-token');
    if (token && token.split('.').length === 3) return token;
    return null;
  } catch { return null; }
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem('gkt-admin-token');
    window.location.href = '/admin';
    throw new Error('Oturum süresi doldu');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export const api = {
  // Auth
  login: (username, password) => {
    if (isDemoMode()) return Promise.resolve({ token: 'demo-token', user: { id: 0, username: 'demo', role: 'admin', display_name: 'Demo Kullanıcı', department: null } });
    return request(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  },
  me: () => {
    if (isDemoMode()) return Promise.resolve({ id: 0, username: 'demo', role: 'admin', display_name: 'Demo Kullanıcı', department: null });
    return request(`${API}/auth/me`, { headers: authHeaders() });
  },
  getUsers: () => {
    if (isDemoMode()) return Promise.resolve(demoUsers);
    return request(`${API}/auth/users`, { headers: authHeaders() });
  },
  createUser: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/auth/users`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  // Şifre değiştirme (kendi) — yeni token döner, eski oturumlar kapanır
  changePassword: async (current_password, new_password) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    const data = await request(`${API}/auth/password`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ current_password, new_password }) });
    if (data.token) localStorage.setItem('gkt-admin-token', data.token);
    return data;
  },
  // Admin şifre sıfırlama — geçici şifre bir kez döner
  resetUserPassword: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/auth/users/${id}/password`, { method: 'PUT', headers: authHeaders() });
  },
  deleteUser: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/auth/users/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Team
  getTeam: () => {
    if (isDemoMode()) return Promise.resolve(demoTeam);
    return request(`${API}/team`, { headers: authHeaders() });
  },
  createTeam: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/team`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateTeam: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/team/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteTeam: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/team/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Events
  getEvents: () => {
    if (isDemoMode()) return Promise.resolve(demoEvents);
    return request(`${API}/events`, { headers: authHeaders() });
  },
  createEvent: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/events`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateEvent: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/events/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteEvent: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/events/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Blog
  getBlog: () => {
    if (isDemoMode()) return Promise.resolve(demoBlog);
    return request(`${API}/blog`, { headers: authHeaders() });
  },
  createBlog: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/blog`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateBlog: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/blog/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteBlog: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/blog/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Sponsors
  getSponsors: () => {
    if (isDemoMode()) return Promise.resolve(demoSponsors);
    return request(`${API}/sponsors`, { headers: authHeaders() });
  },
  createSponsor: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/sponsors`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateSponsor: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/sponsors/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteSponsor: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/sponsors/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Messages
  getMessages: () => {
    if (isDemoMode()) return Promise.resolve(demoMessages);
    return request(`${API}/messages`, { headers: authHeaders() });
  },
  markRead: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/messages/${id}/read`, { method: 'PUT', headers: authHeaders() });
  },
  deleteMessage: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/messages/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Settings
  getSettings: () => {
    if (isDemoMode()) return Promise.resolve(demoSettings);
    return request(`${API}/settings`, { headers: authHeaders() });
  },
  updateSetting: (key, value) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ key, value }) });
  },

  // Milestones
  getMilestones: () => {
    if (isDemoMode()) return Promise.resolve(demoMilestones);
    return request(`${API}/milestones`, { headers: authHeaders() });
  },
  createMilestone: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/milestones`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateMilestone: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/milestones/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteMilestone: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/milestones/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Activities
  getActivities: () => {
    if (isDemoMode()) return Promise.resolve(demoActivities);
    return request(`${API}/activities`, { headers: authHeaders() });
  },
  createActivity: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/activities`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateActivity: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/activities/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteActivity: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/activities/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // UGZ
  getUGZSettings: () => {
    if (isDemoMode()) return Promise.resolve(demoUGZSettings);
    return request(`${API}/ugz/settings`, { headers: authHeaders() });
  },
  updateUGZSetting: (key, value) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ key, value }) });
  },
  updateUGZSettingsBulk: (settings) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ settings }) });
  },
  getUGZSpeakers: () => {
    if (isDemoMode()) return Promise.resolve(demoUGZSpeakers);
    return request(`${API}/ugz/speakers/all`, { headers: authHeaders() });
  },
  createUGZSpeaker: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/speakers`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateUGZSpeaker: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/speakers/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteUGZSpeaker: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/speakers/${id}`, { method: 'DELETE', headers: authHeaders() });
  },
  getUGZProgram: () => {
    if (isDemoMode()) return Promise.resolve(demoUGZProgram);
    return request(`${API}/ugz/program/all`, { headers: authHeaders() });
  },
  createUGZProgram: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/program`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateUGZProgram: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/program/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteUGZProgram: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/program/${id}`, { method: 'DELETE', headers: authHeaders() });
  },
  getUGZSponsors: () => {
    if (isDemoMode()) return Promise.resolve(demoUGZSponsors);
    return request(`${API}/ugz/sponsors/all`, { headers: authHeaders() });
  },
  createUGZSponsor: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/sponsors`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateUGZSponsor: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/sponsors/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteUGZSponsor: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/ugz/sponsors/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Raffles
  getRaffles: () => {
    if (isDemoMode()) return Promise.resolve([]);
    return request(`${API}/raffles/all`, { headers: authHeaders() });
  },
  createRaffle: (data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/raffles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  },
  updateRaffle: (id, data) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/raffles/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  },
  deleteRaffle: (id) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/raffles/${id}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Media
  getMedia: () => {
    if (isDemoMode()) return Promise.resolve(demoMedia.files);
    return request(`${API}/media`, { headers: authHeaders() });
  },
  getMediaStats: () => {
    if (isDemoMode()) return Promise.resolve(demoMedia.stats);
    return request(`${API}/media/stats`, { headers: authHeaders() });
  },
  deleteMedia: (filename, force = false) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    return request(`${API}/media/${encodeURIComponent(filename)}${force ? '?force=true' : ''}`, { method: 'DELETE', headers: authHeaders() });
  },

  // Upload
  upload: async (file) => {
    if (isDemoMode()) throw new Error(DEMO_WRITE_ERROR);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Yükleme başarısız');
    }
    return res.json();
  }
};

export { getToken };
