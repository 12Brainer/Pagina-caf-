// Rutas de autenticación (admin)
const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email y contraseña son obligatorios.' });
    }

    const admin = await prisma.admin.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!admin) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(String(password), admin.password);
    if (!valid) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas.' });
    }

    const token = generateToken(admin);
    return res.json({
      ok: true,
      token,
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/auth/me (validar token)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, nombre: true, email: true }
    });
    if (!admin) return res.status(404).json({ ok: false, message: 'Admin no encontrado.' });
    return res.json({ ok: true, admin });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;

