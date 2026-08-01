// Rutas de productos (catálogo público + gestión admin)
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?active=true  (catálogo público)
router.get('/', async (req, res) => {
  try {
    const { active, featured } = req.query;
    const where = {};
    if (active === 'true') where.active = true;
    if (featured === 'true') where.featured = true;

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { name: 'asc' }]
    });
    return res.json({ ok: true, data: products });
  } catch (err) {
    console.error('Error listando productos:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    return res.json({ ok: true, data: product });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// POST /api/products (admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    if (!name) return res.status(400).json({ ok: false, message: 'El nombre es obligatorio.' });

    const slug = String(body.slug || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const data = {
      name,
      slug,
      description: body.description || '',
      shortDesc: body.shortDesc || '',
      process: body.process || '',
      profile: body.profile || '',
      altitude: body.altitude || '',
      variety: body.variety || '',
      roast: body.roast || '',
      image: body.image || '/assets/honey.png',
      images: Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []),
      price250: parseFloat(body.price250) || 0,
      price500: parseFloat(body.price500) || 0,
      category: body.category || 'Café de especialidad',
      stock: parseInt(body.stock, 10) || 0,
      active: body.active !== false,
      featured: !!body.featured
    };

    const product = await prisma.product.create({ data });
    return res.status(201).json({ ok: true, data: product });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ ok: false, message: 'Ya existe un producto con ese slug.' });
    }
    console.error('Error creando producto:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido.' });

    const body = req.body || {};
    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    if (name !== undefined && !name) {
      return res.status(400).json({ ok: false, message: 'El nombre no puede estar vacío.' });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (body.description !== undefined) data.description = body.description;
    if (body.shortDesc !== undefined) data.shortDesc = body.shortDesc;
    if (body.process !== undefined) data.process = body.process;
    if (body.profile !== undefined) data.profile = body.profile;
    if (body.altitude !== undefined) data.altitude = body.altitude;
    if (body.variety !== undefined) data.variety = body.variety;
    if (body.roast !== undefined) data.roast = body.roast;
    if (body.image !== undefined) data.image = body.image;
    if (body.images !== undefined) data.images = Array.isArray(body.images) ? body.images : [];
    if (body.price250 !== undefined) data.price250 = parseFloat(body.price250) || 0;
    if (body.price500 !== undefined) data.price500 = parseFloat(body.price500) || 0;
    if (body.category !== undefined) data.category = body.category;
    if (body.stock !== undefined) data.stock = parseInt(body.stock, 10) || 0;
    if (body.active !== undefined) data.active = !!body.active;
    if (body.featured !== undefined) data.featured = !!body.featured;

    const product = await prisma.product.update({ where: { id }, data });
    return res.json({ ok: true, data: product });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    console.error('Error actualizando producto:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// PATCH /api/products/:id/stock (admin) - control de inventario rápido
router.patch('/:id/stock', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const stock = parseInt((req.body || {}).stock, 10);
    if (isNaN(id) || isNaN(stock)) {
      return res.status(400).json({ ok: false, message: 'ID y stock son obligatorios.' });
    }
    const product = await prisma.product.update({ where: { id }, data: { stock } });
    return res.json({ ok: true, data: product });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido.' });
    await prisma.product.delete({ where: { id } });
    return res.json({ ok: true, message: 'Producto eliminado.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;

