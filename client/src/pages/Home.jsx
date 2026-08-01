import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { formatCRC } from '../api/client';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products', { params: { active: 'true' } })
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const showProducts = featured.length > 0 ? featured : products.slice(0, 3);

  return (
    <>
      {/* Hero de café */}
      <section className="bg-brand-beige py-16 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-brand-green md:text-5xl">
            Café de Especialidad
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            Café de Especialidad. 100% Grano de Oro Costarricense
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/tienda" className="btn-primary">
              Ver tienda
            </Link>
            <Link to="/nosotros" className="btn-outline">
              Conócenos
            </Link>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center font-display text-3xl font-extrabold text-brand-green">
          Nuestros Productos
        </h2>

        {loading ? (
          <Loader text="Cargando productos…" />
        ) : showProducts.length === 0 ? (
          <p className="text-center text-gray-500">Próximamente más cafés de especialidad.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Franja de beneficios */}
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 text-center md:grid-cols-3">
          <div>
            <i className="fa-solid fa-truck-fast text-4xl text-brand-green" />
            <h3 className="mt-3 font-display text-xl font-bold">Envíos a todo el país</h3>
            <p className="mt-1 text-sm text-gray-600">Envío gratis en pedidos mayores a ₡30,000.</p>
          </div>
          <div>
            <i className="fa-solid fa-mountain-sun text-4xl text-brand-green" />
            <h3 className="mt-3 font-display text-xl font-bold">1,400 m.s.n.m</h3>
            <p className="mt-1 text-sm text-gray-600">Micro-lotes cultivados en San Lorenzo, Tarrazú.</p>
          </div>
          <div>
            <i className="fa-solid fa-mobile-screen-button text-4xl text-brand-green" />
            <h3 className="mt-3 font-display text-xl font-bold">Pago fácil</h3>
            <p className="mt-1 text-sm text-gray-600">SINPE Móvil o efectivo, con comprobante opcional.</p>
          </div>
        </div>
      </section>

      {/* Precio desde */}
      <section className="bg-brand-beige py-10 text-center">
        <p className="text-lg font-semibold text-gray-700">
          Todas nuestras bolsas desde <span className="font-extrabold text-brand-green">{formatCRC(3900)}</span> (250 g)
        </p>
        <Link to="/tienda" className="btn-primary mt-4">
          Comprar ahora
        </Link>
      </section>
    </>
  );
}

