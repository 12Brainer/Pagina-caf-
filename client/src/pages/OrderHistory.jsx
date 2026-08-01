import { useState } from 'react';
import api, { formatCRC, formatDate } from '../api/client';
import { EmptyState } from '../components/Loader';

export default function OrderHistory() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buscar = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/history', { params: { email: email.trim() } });
      setOrders(res.data.data || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo consultar el historial.');
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-brand-green">
        Historial de compras
      </h1>
      <p className="mb-6 text-center text-gray-600">
        Consulta tus compras anteriores con tu correo electrónico.
      </p>

      <form onSubmit={buscar} className="card flex flex-col gap-3 p-5 sm:flex-row">
        <input
          className="input-field flex-1"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Buscando…' : 'Consultar'}
        </button>
      </form>

      {error && <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p>}

      {searched && !loading && orders.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon="fa-receipt"
            title="Sin compras registradas"
            message="No encontramos compras con ese correo."
          />
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold text-brand-green">
                  {o.orderNumber}
                </h3>
                <span className="badge bg-emerald-100 text-emerald-700">{o.estado}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{formatDate(o.createdAt)}</p>
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

