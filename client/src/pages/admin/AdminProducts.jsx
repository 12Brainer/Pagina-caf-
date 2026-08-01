import { useEffect, useState } from 'react';
import api, { formatCRC } from '../../api/client';
import Loader, { EmptyState } from '../../components/Loader';

const EMPTY_FORM = {
  name: '',
  slug: '',
  shortDesc: '',
  description: '',
  process: '',
  profile: '',
  altitude: '',
  variety: '',
  roast: '',
  image: '',
  price250: '',
  price500: '',
  category: 'Café de especialidad',
  stock: 50,
  active: true,
  featured: false
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMsg('');
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      shortDesc: p.shortDesc,
      description: p.description,
      process: p.process,
      profile: p.profile,
      altitude: p.altitude,
      variety: p.variety,
      roast: p.roast,
      image: p.image,
      price250: p.price250,
      price500: p.price500,
      category: p.category,
      stock: p.stock,
      active: p.active,
      featured: p.featured
    });
    setShowForm(true);
    setMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
        setMsg('Producto actualizado correctamente.');
      } else {
        await api.post('/products', form);
        setMsg('Producto creado correctamente.');
      }
      loadProducts();
      setShowForm(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { active: !p.active });
      loadProducts();
    } catch (err) {
      alert('No se pudo cambiar el estado.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Gestión de productos</h1>
        <button onClick={openCreate} className="btn-primary !py-2 text-sm">
          <i className="fa-solid fa-plus" /> Nuevo producto
        </button>
      </div>

      {msg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-extrabold text-brand-green">
              {editing ? `Editar: ${editing.name}` : 'Nuevo producto'}
            </h2>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Nombre *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Slug (URL)</label>
            <input className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generado si se deja vacío" />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-bold">Descripción corta</label>
            <input className="input-field" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-bold">Descripción</label>
            <textarea className="input-field min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Proceso</label>
            <input className="input-field" value={form.process} onChange={(e) => setForm({ ...form, process: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Tueste</label>
            <input className="input-field" value={form.roast} onChange={(e) => setForm({ ...form, roast: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Perfil de taza</label>
            <input className="input-field" value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Altitud</label>
            <input className="input-field" value={form.altitude} onChange={(e) => setForm({ ...form, altitude: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Variedad</label>
            <input className="input-field" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Imagen (ruta)</label>
            <input className="input-field" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/assets/honey.png" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Precio 250 g (₡)</label>
            <input className="input-field" type="number" value={form.price250} onChange={(e) => setForm({ ...form, price250: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Precio 500 g (₡)</label>
            <input className="input-field" type="number" value={form.price500} onChange={(e) => setForm({ ...form, price500: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Stock</label>
            <input className="input-field" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Categoría</label>
            <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Destacado
            </label>
          </div>
          <div className="lg:col-span-2 flex gap-3">
            <button className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : editing ? 'Actualizar' : 'Crear producto'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Loader text="Cargando productos…" />
      ) : products.length === 0 ? (
        <EmptyState
          icon="fa-coffee"
          title="Sin productos"
          message="Crea tu primer producto desde el catálogo."
          action={<button onClick={openCreate} className="btn-primary mt-4">Crear producto</button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Precios</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p>{formatCRC(p.price250)} / 250g</p>
                    <p>{formatCRC(p.price500)} / 500g</p>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(p)}>
                      <span className={`badge ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(p)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="ml-2 rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
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
