import { useEffect, useState } from 'react';
import api, { formatCRC } from '../../api/client';
import Loader from '../../components/Loader';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/orders-by-status'),
      api.get('/dashboard/sales-last-7-days'),
      api.get('/dashboard/top-products')
    ])
      .then(([s, st, sa, tp]) => {
        setStats({
          ...s.data.data,
          ordersByStatus: st.data.data || [],
          salesLast7Days: sa.data.data || [],
          topProducts: tp.data.data || []
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Cargando dashboard…" />;
  if (!stats) return <p className="text-center text-red-500">No se pudo cargar el dashboard.</p>;

  const cards = [
    { label: 'Pedidos totales', value: stats.totalOrders, icon: 'fa-truck', color: 'bg-blue-500' },
    { label: 'Ingresos totales', value: formatCRC(stats.totalRevenue || 0), icon: 'fa-dollar-sign', color: 'bg-emerald-500' },
    { label: 'Pedidos este mes', value: stats.monthOrders, icon: 'fa-calendar-alt', color: 'bg-purple-500' },
    { label: 'Pedidos hoy', value: stats.todayOrders, icon: 'fa-clock', color: 'bg-amber-500' },
    { label: 'Pendientes', value: stats.pendingOrders, icon: 'fa-hourglass', color: 'bg-red-500' },
    { label: 'Clientes', value: stats.totalCustomers, icon: 'fa-users', color: 'bg-teal-500' },
    { label: 'Productos', value: stats.totalProducts, icon: 'fa-coffee', color: 'bg-brand-green' },
    { label: 'Stock bajo', value: stats.lowStockProducts, icon: 'fa-exclamation-triangle', color: 'bg-orange-500' }
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-white ${c.color}`}>
              <i className={`fa-solid ${c.icon} text-xl`} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">{c.label}</p>
              <p className="text-xl font-extrabold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de ventas últimos 7 días */}
      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Ventas (últimos 7 días)</h2>
        {stats.salesLast7Days.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos de ventas en los últimos días.</p>
        ) : (
          <div className="flex items-end gap-2 overflow-x-auto pb-2">
            {stats.salesLast7Days.map((d) => {
              const max = Math.max(...stats.salesLast7Days.map((x) => x.total), 1);
              const height = Math.max(8, (d.total / max) * 120);
              return (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-600">{formatCRC(d.total)}</span>
                  <div className="h-32 w-10 rounded-lg bg-brand-green/20" style={{ position: 'relative' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-lg bg-brand-green transition-all"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Productos más vendidos */}
      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Productos más vendidos</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay ventas de productos.</p>
        ) : (
          <div className="space-y-2">
            {stats.topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-gray-900">{p.name}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-bold text-gray-900">{p.qty} vendidos</span>
                  <span className="ml-3 text-gray-500">{formatCRC(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
