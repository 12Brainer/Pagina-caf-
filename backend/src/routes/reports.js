// Reportes de ventas (admin)
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/sales?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get('/sales', requireAuth, async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde) where.createdAt = { gte: new Date(`${desde}T00:00:00`) };
    if (hasta) {
      where.createdAt = {
        ...(where.createdAt || {}),
        lte: new Date(`${hasta}T23:59:59`)
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalVentas = orders.reduce((sum, o) => sum + o.total, 0);
    const totalPedidos = orders.length;
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    // Ventas por producto en el rango
    const productMap = {};
    for (const o of orders) {
      for (const it of o.items) {
        if (!productMap[it.productName]) {
          productMap[it.productName] = { name: it.productName, qty: 0, revenue: 0 };
        }
        productMap[it.productName].qty += it.qty;
        productMap[it.productName].revenue += it.subtotal;
      }
    }
    const ventasPorProducto = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    // Ventas por día
    const byDay = {};
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { date: key, total: 0, orders: 0 };
      byDay[key].total += o.total;
      byDay[key].orders += 1;
    }
    const ventasPorDia = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

    // Método de pago
    const byPago = {};
    for (const o of orders) {
      byPago[o.metodoPago] = (byPago[o.metodoPago] || 0) + o.total;
    }
    const ventasPorMetodoPago = Object.entries(byPago).map(([name, total]) => ({ name, total }));

    return res.json({
      ok: true,
      data: {
        rango: { desde: desde || null, hasta: hasta || null },
        resumen: { totalVentas, totalPedidos, ticketPromedio },
        ventasPorProducto,
        ventasPorDia,
        ventasPorMetodoPago,
        pedidos: orders
      }
    });
  } catch (err) {
    console.error('Error en reportes:', err);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;

