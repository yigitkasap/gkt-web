import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 20) {
  console.error('CRITICAL: JWT_SECRET is missing or too short. Set a strong secret in .env');
}

// Token blacklist (logout invalidation)
export const tokenBlacklist = new Set();

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, department: user.department || null },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token gerekli' });
  }
  const token = authHeader.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Oturum sonlandırılmış' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
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
