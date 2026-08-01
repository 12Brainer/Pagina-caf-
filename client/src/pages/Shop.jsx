import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import Loader, { EmptyState } from '../components/Loader';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/products', { params: { active: 'true' } })
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-2 text-center font-display text-4xl font-extrabold text-brand-green">
        Nuestros Cafés
      </h1>
      <p className="mb-10 text-center text-gray-600">
        Café 100% arábica de Costa Rica. Micro-lotes de Tarrazú, tueste medio.
      </p>

      {loading ? (
        <Loader text="Cargando catálogo…" />
      ) : error ? (
        <EmptyState icon="fa-triangle-exclamation" title="Error" message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="fa-coffee"
          title="Sin productos"
          message="Activa el backend y ejecuta el seed para cargar el catálogo inicial."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

