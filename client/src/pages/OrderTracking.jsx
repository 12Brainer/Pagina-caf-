import { useState } from 'react';
import api, { formatCRC, formatDate } from '../api/client';
import { EmptyState } from '../components/Loader';

const ESTADOS = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'];

const ESTADO_STYLE = {
  Pendiente: 'bg-amber-100 text-amber-700',
  Confirmado: 'bg-blue-100 text-blue-700',
  Enviado: 'bg-purple-100 text-purple-700',
  Entregado: 'bg-emerald-100 text-emerald-700',
  Cancelado: 'bg-red-100 text-red-600'
};

export default function OrderTracking() {
  const [telefono, setTelefono] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buscar = async (e) => {
    e?.preventDefault();
    if (!telefono.trim()) {
      setError('Ingresa tu número de teléfono.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/track', { params: { telefono: telefono.trim() } });
      setOrders(res.data.data || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo consultar el pedido.');
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-brand-green">
        Seguimiento de pedidos
      </h1>
      <p className="mb-6 text-center text-gray-600">
        Ingresa tu número de teléfono para ver el estado de tus pedidos.
      </p>

      <form onSubmit={buscar} className="card flex flex-col gap-3 p-5 sm:flex-row">
        <input
          className="input-field flex-1"
          placeholder="Teléfono (ej. 83910511)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p>}

      {searched && !loading && orders.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon="fa-magnifying-glass"
            title="No se encontraron pedidos"
            message="Verifica el número de teléfono utilizado al realizar la compra."
          />
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold text-brand-green">
                  Pedido {o.orderNumber}
                </h3>
                <span className={`badge ${ESTADO_STYLE[o.estado] || 'bg-gray-100 text-gray-600'}`}>
                  {o.estado}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(o.createdAt)} · {o.metodoPago} · {o.entrega === 'envio' ? 'Envío' : 'Retiro en tienda'}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {o.items.map((it, idx) => (
                  <li key={idx} className="flex justify-between text-gray-600">
                    <span>{it.qty} × {it.productName} {it.size}g ({it.grind})</span>
                    <span className="font-bold text-gray-900">{formatCRC(it.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-2 font-extrabold">
                <span>Total</span>
                <span className="text-brand-green">{formatCRC(o.total)}</span>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  {ESTADOS.filter((e) => e !== 'Cancelado').map((e, idx) => {
                    const reached = ESTADOS.indexOf(o.estado) >= idx;
                    return (
                      <span key={e} className={reached ? 'text-brand-green' : ''}>
                        {e}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-brand-green transition-all"
                    style={{
                      width: `${o.estado === 'Cancelado' ? 100 : Math.max(0, (ESTADOS.indexOf(o.estado) / (ESTADOS.length - 2)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

