// Rutas de pedidos (creación pública + gestión admin)
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `SB-${y}${m}${day}-${rand}`;
}

// GET /api/orders (admin) - con filtros por estado
router.get('/', requireAuth, async (req, res) => {
  try {
    const { estado, estadoPago, search } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (estadoPago) where.estadoPago = estadoPago;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { clienteNombre: { contains: search } },
        { clienteTelefono: { contains: search } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ ok: true, data: orders });
  } catch (err) {
    console.error('Error listando pedidos:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/orders/track?telefono=...
// Seguimiento público de pedidos por número de teléfono
router.get('/track', async (req, res) => {
  try {
    const { telefono, email } = req.query;
    if (!telefono && !email) {
      return res.status(400).json({ ok: false, message: 'Indica teléfono o correo.' });
    }
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { clienteTelefono: telefono || '___' },
          { clienteEmail: email || '___' }
        ]
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.json({ ok: true, data: orders });
  } catch (err) {
    console.error('Error en seguimiento:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// POST /api/orders - crear pedido (checkout público)
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const { items, cliente, entrega, direccion, metodoPago, comprobante, notas } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'El pedido no tiene productos.' });
    }
    if (!cliente || !cliente.nombre || !cliente.telefono) {
      return res.status(400).json({ ok: false, message: 'Nombre y teléfono son obligatorios.' });
    }
    if (!metodoPago) {
      return res.status(400).json({ ok: false, message: 'El método de pago es obligatorio.' });
    }

    // Calcular totales con las mismas reglas del frontend
    let subtotal = 0;
    const orderItemsData = [];

    for (const it of items) {
      const qty = parseInt(it.qty, 10) || 1;
      const size = parseInt(it.size, 10) || 250;
      const price = parseFloat(it.price) || 0;
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;

      // Reducir inventario si el producto viene identificado
      let productId = null;
      if (it.productId) {
        productId = parseInt(it.productId, 10);
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          const newStock = Math.max(0, product.stock - qty);
          await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
        }
      }

      orderItemsData.push({
        productId,
        productName: String(it.productName || it.product || 'Café de especialidad'),
        size,
        grind: it.grind || 'Grano',
        qty,
        price,
        subtotal: itemSubtotal
      });
    }

    const ENVIO_COSTO = 3000;
    const ENVIO_GRATIS_MIN = 30000;
    const envio = entrega === 'envio' ? (subtotal >= ENVIO_GRATIS_MIN ? 0 : ENVIO_COSTO) : 0;
    const total = subtotal + envio;

    // Buscar o crear cliente (para historial)
    let customer = null;
    if (cliente.email) {
      customer = await prisma.customer.findFirst({
        where: { email: cliente.email.toLowerCase().trim() }
      });
    }
    if (!customer) {
      customer = await prisma.customer.findFirst({
        where: {
          nombre: String(cliente.nombre).trim(),
          apellidos: String(cliente.apellidos || '').trim(),
          telefono: String(cliente.telefono).trim()
        }
      });
    }
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          nombre: String(cliente.nombre).trim(),
          apellidos: String(cliente.apellidos || '').trim(),
          telefono: String(cliente.telefono).trim(),
          email: cliente.email ? cliente.email.toLowerCase().trim() : null,
          direccion: direccion || null
        }
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        clienteNombre: `${cliente.nombre} ${cliente.apellidos || ''}`.trim(),
        clienteTelefono: String(cliente.telefono).trim(),
        clienteEmail: cliente.email ? cliente.email.toLowerCase().trim() : null,
        entrega: entrega === 'envio' ? 'envio' : 'recoger',
        direccion: direccion || null,
        metodoPago,
        comprobante: comprobante || null,
        subtotal,
        envio,
        total,
        estado: 'Pendiente',
        estadoPago: metodoPago === 'SINPE Móvil' ? 'Pendiente' : 'Pendiente',
        notas: notas || null,
        items: { create: orderItemsData }
      },
      include: { items: true }
    });

    return res.status(201).json({ ok: true, data: order });
  } catch (err) {
    console.error('Error creando pedido:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/orders/history?email=...  (historial de compras)
router.get('/history', async (req, res) => {
  try {
    const { email, telefono } = req.query;
    if (!email && !telefono) {
      return res.status(400).json({ ok: false, message: 'Indica email o teléfono.' });
    }
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { clienteEmail: email || '___' },
          { clienteTelefono: telefono || '___' }
        ]
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ ok: true, data: orders });
  } catch (err) {
    console.error('Error en historial:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/orders/:id (admin o seguimiento con número)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: 'ID inválido.' });
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return res.status(404).json({ ok: false, message: 'Pedido no encontrado.' });
    return res.json({ ok: true, data: order });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// PATCH /api/orders/:id/estado (admin) - seguimiento del pedido
router.patch('/:id/estado', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado, estadoPago } = req.body || {};
    if (!estado && !estadoPago) {
      return res.status(400).json({ ok: false, message: 'Indica estado o estadoPago.' });
    }
    const data = {};
    if (estado) data.estado = estado;
    if (estadoPago) data.estadoPago = estadoPago;

    const order = await prisma.order.update({ where: { id }, data, include: { items: true } });
    return res.json({ ok: true, data: order });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Pedido no encontrado.' });
    console.error('Error actualizando estado:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;

