// Middleware de autenticación JWT para el panel administrativo
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'san-bernardo-secret';

function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, nombre: admin.nombre },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: 'No autorizado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado.' });
  }
}

module.exports = { generateToken, requireAuth };

