import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { formatCRC } from '../api/client';
import { useCart } from '../contexts/CartContext';
import Loader, { EmptyState } from '../components/Loader';

const SIZES = [
  { size: 250, label: '250 g', key: 'price250' },
  { size: 500, label: '500 g', key: 'price500' }
];

const GRINDS = ['Grano', 'Molido'];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSize, setSelectedSize] = useState(250);
  const [grind, setGrind] = useState('Grano');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.data);
        setSelectedSize(250);
        setGrind('Grano');
        setQty(1);
        setActiveImg(0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader text="Cargando producto…" />;
  if (error || !product)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState icon="fa-coffee" title="Producto no encontrado" message={error || 'No existe este café.'} />
        <div className="mt-4 text-center">
          <Link to="/tienda" className="btn-primary">Ver tienda</Link>
        </div>
      </div>
    );

  const priceKey = SIZES.find((s) => s.size === selectedSize)?.key || 'price250';
  const price = product[priceKey] || 0;
  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image];

  const handleAdd = (goCheckout) => {
    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      image: product.image,
      size: selectedSize,
      grind,
      qty,
      price,
      subtotal: price * qty
    });
    if (goCheckout) navigate('/checkout');
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-green">Inicio</Link> /{' '}
        <Link to="/tienda" className="hover:text-brand-green">Tienda</Link> /{' '}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Galería */}
        <div>
          <div className="card overflow-hidden bg-brand-beige2 p-6">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="mx-auto h-80 w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white ${i === activeImg ? 'border-brand-green' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-green">{product.name}</h1>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">{formatCRC(price)}</p>
          <p className="mt-1 text-xs text-gray-500">Los gastos de envío se calculan en la entrega.</p>
          <div className="mt-2 text-amber-500">★★★★★</div>

          <p className="mt-4 leading-relaxed text-gray-700">{product.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="card p-3"><span className="font-bold">Proceso:</span> {product.process}</div>
            <div className="card p-3"><span className="font-bold">Tueste:</span> {product.roast}</div>
            <div className="card p-3"><span className="font-bold">Altitud:</span> {product.altitude}</div>
            <div className="card p-3"><span className="font-bold">Variedad:</span> {product.variety}</div>
          </div>

          <p className="mt-4 text-sm text-gray-600"><strong>Perfil de taza:</strong> {product.profile}</p>

          {/* Selección de tamaño */}
          <div className="mt-5">
            <label className="mb-1 block font-bold">Tamaño:</label>
            <div className="flex gap-3">
              {SIZES.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSelectedSize(s.size)}
                  className={`rounded-xl border-2 px-5 py-2 font-bold transition ${selectedSize === s.size ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-brand-green'}`}
                >
                  {s.label} — {formatCRC(product[s.key])}
                </button>
              ))}
            </div>
          </div>

          {/* Molienda */}
          <div className="mt-4">
            <label className="mb-1 block font-bold">Molienda:</label>
            <div className="flex gap-3">
              {GRINDS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrind(g)}
                  className={`rounded-xl border-2 px-5 py-2 font-bold transition ${grind === g ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-brand-green'}`}
                >
                  {g === 'Grano' ? 'Grano / Whole Bean' : 'Molido / Ground'}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div className="mt-4">
            <label className="mb-1 block font-bold">Cantidad:</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 rounded-xl border border-gray-300 bg-white font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-11 w-20 rounded-xl border border-gray-300 text-center font-bold"
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 rounded-xl border border-gray-300 bg-white font-bold"
              >
                +
              </button>
            </div>
            {product.stock !== undefined && (
              <p className="mt-1 text-xs text-gray-500">
                Stock disponible: <span className={product.stock > 10 ? 'font-bold text-brand-green' : 'font-bold text-red-500'}>{product.stock}</span>
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => handleAdd(false)} className="btn-outline">
              Agregar al carrito
            </button>
            <button onClick={() => handleAdd(true)} className="btn-primary">
              Comprar ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

