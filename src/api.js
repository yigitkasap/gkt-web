// Public API helper for frontend
const API = '/api';

async function get(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API}${url}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function postMessage(data) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export const fetchSettings = () => get('/settings');
export const fetchTeam = (params = '') => get(`/team${params ? '?' + params : ''}`);
export const fetchEvents = (params = '') => get(`/events${params ? '?' + params : ''}`);
export const fetchBlog = (params = '') => get(`/blog${params ? '?' + params : ''}`);
export const fetchSponsors = () => get('/sponsors');
export const fetchMilestones = () => get('/milestones');
export const fetchActivities = () => get('/activities');
export const fetchBlogBySlug = (slug) => get(`/blog/slug/${slug}`);
export const fetchRaffles = () => get('/raffles');
