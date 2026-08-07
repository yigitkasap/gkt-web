// Input validation & sanitization helpers

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+().-]{0,20}$/;
const SLUG_RE = /^[a-z0-9-]{0,200}$/;
const VALID_ROLES = ['admin', 'koordinator', 'direktor'];
const VALID_DEPARTMENTS = ['Yönetim Kurulu', 'Medya ve IT', 'Etkinlik ve Org.', 'Kurumsal İlişkiler', 'Üye İlişkileri'];
const VALID_EVENT_CATS = ['Zirve', 'Kariyer', 'Gezi', 'Workshop', 'Sosyal', 'Konser'];
const VALID_BLOG_CATS = ['Duyuru', 'Haber', 'Etkinlik', 'Röportaj'];

export function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

export function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone) return true; // optional
  return typeof phone === 'string' && PHONE_RE.test(phone.trim());
}

export function validateRole(role) {
  return VALID_ROLES.includes(role);
}

export function validateDepartment(dept) {
  return !dept || VALID_DEPARTMENTS.includes(dept);
}

export function validateEventCategory(cat) {
  return !cat || VALID_EVENT_CATS.includes(cat);
}

export function validateBlogCategory(cat) {
  return !cat || VALID_BLOG_CATS.includes(cat);
}

export function validateSlug(slug) {
  return !slug || SLUG_RE.test(slug);
}

// Pick only allowed fields from body
export function pickFields(body, allowed) {
  const result = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      result[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
    }
  }
  return result;
}

// Validate URL: must be http(s) and stay under reasonable length. Empty allowed.
export function validateUrl(url) {
  if (!url) return true;
  if (typeof url !== 'string') return false;
  const u = url.trim();
  if (u.length > 500) return false;
  return /^https?:\/\/[^\s<>"']+$/i.test(u);
}

// Validate path-only URL produced by our /api/upload (server-controlled).
export function validateAssetPath(p) {
  if (!p) return true;
  if (typeof p !== 'string') return false;
  return /^\/assets\/[A-Za-z0-9._\-/]{1,200}$/.test(p);
}

// HTML escape for plain-text fields surfaced into HTML contexts.
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Strip dangerous HTML constructs without pulling in jsdom on the server.
// Removes <script>/<style>/<iframe>/<object> blocks, on*=" event handlers,
// and javascript:/data: URLs. Caller is still expected to render via DOMPurify.
export function sanitizeRichHtml(html) {
  if (typeof html !== 'string') return '';
  let out = html;
  out = out.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  out = out.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, '');
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/(href|src|action|formaction|xlink:href)\s*=\s*("\s*(?:javascript|data|vbscript):[^"]*"|'\s*(?:javascript|data|vbscript):[^']*'|(?:javascript|data|vbscript):[^\s>]*)/gi, '$1="#"');
  return out;
}
