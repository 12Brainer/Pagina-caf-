import { useEffect, useState } from 'react';
import api, { formatCRC } from '../../api/client';
import Loader, { EmptyState } from '../../components/Loader';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadProducts = () => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const lowStock = products.filter((p) => p.stock <= 10);
  const inStock = products.filter((p) => p.stock > 10);

  const saveStock = async (p) => {
    const stock = parseInt(newStock, 10);
    if (isNaN(stock) || stock < 0) {
      alert('Ingresa un stock válido.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/products/${p.id}/stock`, { stock });
      setMsg(`Stock de "${p.name}" actualizado a ${stock}.`);
      setEditingStock(null);
      loadProducts();
    } catch (err) {
      alert('No se pudo actualizar el stock.');
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (p) => (
    <tr key={p.id} className="border-t border-gray-100">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-bold text-gray-900">{p.name}</span>
        </div>
      </td>
      <td className="p-3 text-sm">{formatCRC(p.price250)} / {formatCRC(p.price500)}</td>
      <td className="p-3">
        {editingStock === p.id ? (
          <div className="flex items-center gap-2">
            <input
              className="input-field !w-24 !py-1 text-sm"
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              autoFocus
            />
            <button className="rounded-lg bg-brand-green px-3 py-1.5 text-xs font-bold text-white" onClick={() => saveStock(p)} disabled={saving}>
              Guardar
            </button>
            <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold" onClick={() => setEditingStock(null)}>
              Cancelar
            </button>
          </div>
        ) : (
          <span className={`badge ${p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            {p.stock} unidades
          </span>
        )}
      </td>
      <td className="p-3 text-right">
        <button
          onClick={() => {
            setEditingStock(p.id);
            setNewStock(String(p.stock));
          }}
          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
        >
          <i className="fa-solid fa-pen" />
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-extrabold text-brand-green">Control de inventario</h1>
      <p className="mb-6 text-sm text-gray-500">
        El stock se descuenta automáticamente cuando se crea un pedido.
      </p>

      {msg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {msg}
        </div>
      )}

      {loading ? (
        <Loader text="Cargando inventario…" />
      ) : products.length === 0 ? (
        <EmptyState icon="fa-warehouse" title="Sin productos" message="No hay productos para gestionar el inventario." />
      ) : (
        <div className="space-y-6">
          {/* Stock bajo */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-extrabold text-red-600">
              <i className="fa-solid fa-exclamation-triangle mr-1" /> Stock bajo ({lowStock.length})
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">Todos los productos tienen stock suficiente. ✅</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr><th className="p-3">Producto</th><th className="p-3">Precios</th><th className="p-3">Stock</th><th className="p-3 text-right">Acción</th></tr>
                  </thead>
                  <tbody>{lowStock.map(renderRow)}</tbody>
                </table>
              </div>
            )}
          </div>

          {/* Todo el inventario */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-extrabold text-brand-green">Inventario completo ({products.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr><th className="p-3">Producto</th><th className="p-3">Precios</th><th className="p-3">Stock</th><th className="p-3 text-right">Acción</th></tr>
                </thead>
                <tbody>{inStock.map(renderRow)}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
