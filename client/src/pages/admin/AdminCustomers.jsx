import { useEffect, useState } from 'react';
import api, { formatCRC, formatDate } from '../../api/client';
import Loader, { EmptyState } from '../../components/Loader';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = (busqueda = '') => {
    setLoading(true);
    api
      .get('/customers', { params: { search: busqueda || undefined } })
      .then((res) => setCustomers(res.data.data || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Eliminar cliente "${c.nombre} ${c.apellidos}"?`)) return;
    try {
      await api.delete(`/customers/${c.id}`);
      loadCustomers(search);
    } catch (err) {
      alert('No se pudo eliminar el cliente.');
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">Gestión de clientes</h1>

      <div className="mb-4 flex gap-2">
        <input
          className="input-field w-72"
          placeholder="Buscar por nombre, correo o teléfono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadCustomers(search)}
        />
        <button className="btn-primary !py-2 text-sm" onClick={() => loadCustomers(search)}>
          Buscar
        </button>
      </div>

      {loading ? (
        <Loader text="Cargando clientes…" />
      ) : customers.length === 0 ? (
        <EmptyState icon="fa-users" title="Sin clientes" message="Los clientes se registran automáticamente al hacer un pedido." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Pedidos</th>
                <th className="p-3">Total comprado</th>
                <th className="p-3">Último pedido</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{c.nombre} {c.apellidos}</p>
                    <p className="text-xs text-gray-500">Registrado {formatDate(c.createdAt)}</p>
                  </td>
                  <td className="p-3">
                    <p>{c.telefono}</p>
                    {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                  </td>
                  <td className="p-3">
                    <span className="badge bg-blue-100 text-blue-700">{c.numPedidos || 0}</span>
                  </td>
                  <td className="p-3 font-bold text-brand-green">{formatCRC(c.totalComprado || 0)}</td>
                  <td className="p-3 text-gray-600">{c.ultimoPedido ? formatDate(c.ultimoPedido) : '—'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(c)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
