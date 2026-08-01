import { useEffect, useState } from 'react';
import api, { formatCRC, formatDate } from '../../api/client';
import Loader, { EmptyState } from '../../components/Loader';

export default function AdminReports() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = (e) => {
    e?.preventDefault();
    setLoading(true);
    api
      .get('/reports/sales', { params: { desde: desde || undefined, hasta: hasta || undefined } })
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">Reportes de ventas</h1>

      <form onSubmit={loadReport} className="card mb-6 flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Desde</label>
          <input className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Hasta</label>
          <input className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button className="btn-primary !py-2 text-sm" disabled={loading}>
          {loading ? 'Generando…' : 'Generar reporte'}
        </button>
      </form>

      {loading ? (
        <Loader text="Generando reporte…" />
      ) : !data ? (
        <EmptyState icon="fa-file-lines" title="Sin datos" message="No hay ventas en el rango seleccionado." />
      ) : (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-bold uppercase text-gray-500">Total ventas</p>
              <p className="text-2xl font-extrabold text-brand-green">{formatCRC(data.resumen.totalVentas)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-bold uppercase text-gray-500">Pedidos</p>
              <p className="text-2xl font-extrabold text-gray-900">{data.resumen.totalPedidos}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-bold uppercase text-gray-500">Ticket promedio</p>
              <p className="text-2xl font-extrabold text-gray-900">{formatCRC(data.resumen.ticketPromedio)}</p>
            </div>
          </div>

          {/* Ventas por producto */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Ventas por producto</h2>
            {data.ventasPorProducto.length === 0 ? (
              <p className="text-sm text-gray-500">Sin ventas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr><th className="p-3">Producto</th><th className="p-3">Cantidad</th><th className="p-3">Ingresos</th></tr>
                  </thead>
                  <tbody>
                    {data.ventasPorProducto.map((p, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="p-3 font-bold">{p.name}</td>
                        <td className="p-3">{p.qty}</td>
                        <td className="p-3 font-bold text-brand-green">{formatCRC(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ventas por día */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Ventas por día</h2>
            {data.ventasPorDia.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr><th className="p-3">Fecha</th><th className="p-3">Pedidos</th><th className="p-3">Total</th></tr>
                  </thead>
                  <tbody>
                    {data.ventasPorDia.map((d, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="p-3">{d.date}</td>
                        <td className="p-3">{d.orders}</td>
                        <td className="p-3 font-bold">{formatCRC(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Métodos de pago</h2>
            {data.ventasPorMetodoPago.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.ventasPorMetodoPago.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-brand-beige p-4">
                    <span className="font-bold text-gray-900">{m.name}</span>
                    <span className="font-extrabold text-brand-green">{formatCRC(m.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalle de pedidos */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Detalle de pedidos ({data.pedidos.length})</h2>
            {data.pedidos.length === 0 ? (
              <p className="text-sm text-gray-500">Sin pedidos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-3">#</th><th className="p-3">Cliente</th><th className="p-3">Fecha</th>
                      <th className="p-3">Pago</th><th className="p-3">Estado</th><th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pedidos.map((o) => (
                      <tr key={o.id} className="border-t border-gray-100">
                        <td className="p-3 font-bold text-brand-green">{o.orderNumber}</td>
                        <td className="p-3">{o.clienteNombre}</td>
                        <td className="p-3 text-gray-600">{formatDate(o.createdAt)}</td>
                        <td className="p-3">{o.metodoPago}</td>
                        <td className="p-3">{o.estado}</td>
                        <td className="p-3 text-right font-bold">{formatCRC(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
