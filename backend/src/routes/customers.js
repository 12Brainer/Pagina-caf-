// Rutas de clientes (admin)
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers (admin) - listar clientes con sus pedidos
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { apellidos: { contains: search } },
        { email: { contains: search } },
        { telefono: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: { orders: true },
      orderBy: { createdAt: 'desc' }
    });

    // Agregar métricas derivadas
    const data = customers.map((c) => {
      const totalComprado = c.orders.reduce((sum, o) => sum + o.total, 0);
      const numPedidos = c.orders.length;
      const ultimoPedido = c.orders.length
        ? new Date(Math.max(...c.orders.map((o) => new Date(o.createdAt).getTime()))).toISOString()
        : null;
      return {
        ...c,
        totalComprado,
        numPedidos,
        ultimoPedido
      };
    });

    return res.json({ ok: true, data });
  } catch (err) {
    console.error('Error listando clientes:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/customers/:id (admin)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido.' });
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { orders: { include: { items: true }, orderBy: { createdAt: 'desc' } } }
    });
    if (!customer) return res.status(404).json({ ok: false, message: 'Cliente no encontrado.' });
    return res.json({ ok: true, data: customer });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// PUT /api/customers/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body || {};
    const data = {};
    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.apellidos !== undefined) data.apellidos = body.apellidos;
    if (body.telefono !== undefined) data.telefono = body.telefono;
    if (body.email !== undefined) data.email = body.email;
    if (body.direccion !== undefined) data.direccion = body.direccion;

    const customer = await prisma.customer.update({ where: { id }, data });
    return res.json({ ok: true, data: customer });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Cliente no encontrado.' });
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// DELETE /api/customers/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido.' });
    await prisma.customer.delete({ where: { id } });
    return res.json({ ok: true, message: 'Cliente eliminado.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Cliente no encontrado.' });
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;

