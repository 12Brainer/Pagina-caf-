import { useEffect, useState } from 'react';
import api, { formatCRC, formatDate } from '../../api/client';
import Loader, { EmptyState } from '../../components/Loader';

const ESTADOS = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'];
const PAGOS = ['Pendiente', 'Pagado'];

const ESTADO_COLOR = {
  Pendiente: 'bg-amber-100 text-amber-700',
  Confirmado: 'bg-blue-100 text-blue-700',
  Enviado: 'bg-purple-100 text-purple-700',
  Entregado: 'bg-emerald-100 text-emerald-700',
  Cancelado: 'bg-red-100 text-red-600'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const loadOrders = (estado = '', busqueda = '') => {
    setLoading(true);
    api
      .get('/orders', { params: { estado: estado || undefined, search: busqueda || undefined } })
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders(filter, search);
  }, []);

  const changeEstado = async (orderId, field, value) => {
    try {
      await api.patch(`/orders/${orderId}/estado`, { [field]: value });
      loadOrders(filter, search);
    } catch (err) {
      alert('No se pudo actualizar el estado.');
    }
  };

  const filtered = orders.filter((o) => {
    if (!filter) return true;
    return o.estado === filter;
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">Gestión de pedidos</h1>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input-field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e}>{e}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            className="input-field w-56"
            placeholder="Buscar por #, nombre o teléfono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders(filter, search)}
          />
          <button className="btn-primary !py-2 text-sm" onClick={() => loadOrders(filter, search)}>
            Buscar
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Cargando pedidos…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="fa-truck" title="Sin pedidos" message="Aún no hay pedidos registrados." />
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-extrabold text-brand-green">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${ESTADO_COLOR[o.estado] || 'bg-gray-100 text-gray-600'}`}>{o.estado}</span>
                  <span className={`badge ${o.estadoPago === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    Pago: {o.estadoPago}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                <strong>{o.clienteNombre}</strong> · {o.clienteTelefono}
                {o.clienteEmail && ` · ${o.clienteEmail}`}
              </p>
              <p className="text-xs text-gray-500">
                Entrega: {o.entrega === 'envio' ? 'Envío' : 'Retiro'} · Pago: {o.metodoPago}
                {o.direccion && <><br />📍 {o.direccion}</>}
              </p>

              {o.comprobante && (
                <a
                  href={o.comprobante}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <i className="fa-solid fa-file-image" /> Ver comprobante
                </a>
              )}

              <div className="mt-3 border-t border-gray-100 pt-3">
                <ul className="space-y-1 text-sm">
                  {o.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between text-gray-600">
                      <span>{it.qty} × {it.productName} {it.size}g ({it.grind})</span>
                      <span className="font-bold">{formatCRC(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-extrabold">
                  <span>Total</span>
                  <span className="text-brand-green">{formatCRC(o.total)}</span>
                </div>
              </div>

              {/* Controles de estado */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Estado del pedido</label>
                  <select
                    className="input-field !py-2 text-sm"
                    value={o.estado}
                    onChange={(e) => changeEstado(o.id, 'estado', e.target.value)}
                  >
                    {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Estado de pago</label>
                  <select
                    className="input-field !py-2 text-sm"
                    value={o.estadoPago}
                    onChange={(e) => changeEstado(o.id, 'estadoPago', e.target.value)}
                  >
                    {PAGOS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
