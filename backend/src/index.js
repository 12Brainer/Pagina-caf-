// Servidor principal SAN BERNARDO SPECIALTY COFFEE ESTATE
// Express + Prisma + MySQL
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const uploadRoutes = require('./routes/upload');
const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- Middlewares ----------
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limit para endpoints públicos
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { ok: false, message: 'Demasiadas solicitudes. Intenta más tarde.' }
});

// ---------- Archivos subidos (comprobantes) ----------
const { UPLOAD_DIR } = require('./middleware/upload');
app.use('/uploads', express.static(UPLOAD_DIR));

// ---------- Assets del proyecto existente (logo, fotos de café) ----------
const projectRoot = path.join(__dirname, '..', '..');
app.use('/assets', express.static(path.join(projectRoot, 'assets')));

// ---------- Rutas API ----------
app.use('/api/auth', publicLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', publicLimiter, uploadRoutes.router);

// ---------- Servir el frontend compilado (si existe) ----------
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API SAN BERNARDO funcionando correctamente.' });
});

// SPA fallback (para rutas del frontend en producción)
app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ---------- Manejo de errores ----------
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err);
  return res.status(500).json({ ok: false, message: err.message || 'Error interno del servidor.' });
});

// ---------- Inicio ----------
async function start() {
  try {
    await prisma.$connect();
    console.log('✔ Conexión a la base de datos MySQL establecida (Prisma).');
    app.listen(PORT, () => {
      console.log(`✔ Servidor SAN BERNARDO en http://localhost:${PORT}`);
      console.log(`✔ API base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('✖ No se pudo conectar a la base de datos:', err.message);
    console.error('  Revisa tu DATABASE_URL en backend/.env');
    process.exit(1);
  }
}

start();

