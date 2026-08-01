// Dashboard con estadísticas (admin)
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', requireAuth, async (_req, res) => {
  try {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders,
      totalRevenue,
      monthOrders,
      monthRevenue,
      todayOrders,
      todayRevenue,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startMonth } }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startToday } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startToday } }, _sum: { total: true } }),
      prisma.order.count({ where: { estado: 'Pendiente' } }),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 10 } } })
    ]);

    return res.json({
      ok: true,
      data: {
        totalOrders,
        totalRevenue: totalOrders ? totalRevenue._sum.total || 0 : 0,
        monthOrders,
        monthRevenue: monthOrders ? monthRevenue._sum.total || 0 : 0,
        todayOrders,
        todayRevenue: todayOrders ? todayRevenue._sum.total || 0 : 0,
        pendingOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts
      }
    });
  } catch (err) {
    console.error('Error en dashboard:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/dashboard/orders-by-status (distribución de pedidos por estado)
router.get('/orders-by-status', requireAuth, async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({ select: { estado: true } });
    const counts = orders.reduce((acc, o) => {
      acc[o.estado] = (acc[o.estado] || 0) + 1;
      return acc;
    }, {});
    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/dashboard/sales-last-7-days
router.get('/sales-last-7-days', requireAuth, async (_req, res) => {
  try {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);

      const result = await prisma.order.aggregate({
        where: { createdAt: { gte: d, lt: next } },
        _sum: { total: true }
      });
      const count = await prisma.order.count({ where: { createdAt: { gte: d, lt: next } } });

      data.push({
        date: d.toISOString().slice(0, 10),
        total: result._sum.total || 0,
        orders: count
      });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

// GET /api/dashboard/top-products
router.get('/top-products', requireAuth, async (_req, res) => {
  try {
    const items = await prisma.orderItem.findMany({
      select: {
        productName: true,
        qty: true,
        subtotal: true
      }
    });
    const byProduct = {};
    for (const it of items) {
      if (!byProduct[it.productName]) {
        byProduct[it.productName] = { name: it.productName, qty: 0, revenue: 0 };
      }
      byProduct[it.productName].qty += it.qty;
      byProduct[it.productName].revenue += it.subtotal;
    }
    const data = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;

