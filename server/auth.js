import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 20) {
  console.error('CRITICAL: JWT_SECRET is missing or too short. Set a strong secret in .env');
}

// Token blacklist (logout invalidation)
export const tokenBlacklist = new Set();

export function generateToken(user) {
  // Never sign with an empty secret — a missing JWT_SECRET must fail loudly, not issue weak tokens.
  if (!JWT_SECRET) throw new Error('JWT_SECRET tanımlı değil');
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, department: user.department || null, tv: user.token_version || 0 },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verifies a bearer token AND checks the account still exists with the same token_version.
 * Deleting a user or changing a password (token_version++) invalidates old tokens immediately,
 * and role/department always come from the database rather than the (possibly stale) token.
 * Returns the current user row or null.
 */
function resolveUser(authHeader) {
  if (!JWT_SECRET || !authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (tokenBlacklist.has(token)) return null;
  let decoded;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { return null; }
  const user = db.prepare('SELECT id, username, role, department, display_name, token_version FROM users WHERE id = ?').get(decoded.id);
  if (!user) return null;
  if ((decoded.tv || 0) !== (user.token_version || 0)) return null;
  return { id: user.id, username: user.username, role: user.role, department: user.department || null, display_name: user.display_name };
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token gerekli' });
  }
  const user = resolveUser(authHeader);
  if (!user) return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum' });
  req.user = user;
  next();
}

/** Returns the current user when a valid token is present, otherwise null. Never rejects. */
export function optionalAuth(req) {
  return resolveUser(req.headers.authorization);
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    next();
  });
}

export function requireKoordinator(req, res, next) {
  requireAuth(req, res, () => {
    if (!['admin', 'koordinator'].includes(req.user.role)) return res.status(403).json({ error: 'Koordinatör yetkisi gerekli' });
    next();
  });
}

export function requireDirektor(req, res, next) {
  requireAuth(req, res, () => {
    if (!['admin', 'koordinator', 'direktor'].includes(req.user.role)) return res.status(403).json({ error: 'Yetkiniz yok' });
    next();
  });
}
