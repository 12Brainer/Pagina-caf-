import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatCRC } from '../api/client';
import api from '../api/client';
import OrderSummary from '../components/OrderSummary';
import { EmptyState } from '../components/Loader';

const PROVINCIAS = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Puntarenas', 'Guanacaste', 'Limón'];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, shippingCost, clearCart } = useCart();
  const fileRef = useRef(null);

  const [entrega, setEntrega] = useState('recoger');
  const [metodoPago, setMetodoPago] = useState('SINPE Móvil');

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    pais: 'Costa Rica',
    direccion: '',
    linea2: '',
    provincia: '',
    ciudad: '',
    codigoPostal: ''
  });
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobanteUrl, setComprobanteUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  if (cart.length === 0 && !successOrder) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-brand-green">Checkout</h1>
        <EmptyState
          icon="fa-cart-shopping"
          title="No hay productos en el carrito"
          action={<Link to="/tienda" className="btn-primary mt-4">Ir a la tienda</Link>}
        />
      </section>
    );
  }

const shipping = entrega === 'envio' ? shippingCost(subtotal) : 0;
  const SINPE_NUMBER = '50683910511';

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComprobanteFile(file);
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('comprobante', file);
      const res = await api.post('/upload/comprobante', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComprobanteUrl(res.data.url);
    } catch (err) {
      setError('No se pudo subir el comprobante. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    if (!form.nombre.trim() || !form.apellidos.trim() || !form.telefono.trim()) {
      return 'Completa nombre, apellidos y teléfono.';
    }
    if (entrega === 'envio') {
      if (!form.direccion.trim() || !form.provincia || !form.ciudad.trim()) {
        return 'Para envío, completa dirección, provincia y ciudad.';
      }
    }
    if (metodoPago === 'SINPE Móvil' && !comprobanteUrl && !comprobanteFile) {
      return 'Adjunta el comprobante SINPE Móvil para continuar (o selecciona efectivo).';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMsg = validate();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }
    setError('');
    setSubmitting(true);

    const direccionCompleta =
      entrega === 'envio'
        ? `${form.direccion}${form.linea2 ? ', ' + form.linea2 : ''}, ${form.ciudad}, ${form.provincia}, ${form.pais}${form.codigoPostal ? ', CP ' + form.codigoPostal : ''}`
        : null;

    const items = cart.map((it) => ({
      productId: it.productId,
      productName: it.productName,
      size: it.size,
      grind: it.grind,
      qty: it.qty,
      price: it.price,
      subtotal: it.subtotal
    }));

    try {
      const res = await api.post('/orders', {
        items,
        cliente: {
          nombre: form.nombre,
          apellidos: form.apellidos,
          telefono: form.telefono,
          email: form.email
        },
        entrega,
        direccion: direccionCompleta,
        metodoPago,
        comprobante: comprobanteUrl || null
      });

      if (res.data && res.data.ok) {
        setSuccessOrder(res.data.data);
        clearCart();
      } else {
        setError(res.data?.message || 'No se pudo crear el pedido.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pantalla de éxito
  if (successOrder) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12">
        <div className="card p-8 text-center">
          <i className="fa-solid fa-circle-check text-6xl text-brand-green" />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-brand-green">
            ¡Pedido recibido!
          </h1>
          <p className="mt-2 text-gray-600">
            Tu número de pedido es <strong className="text-gray-900">{successOrder.orderNumber}</strong>.
            Te contactaremos al <strong>{successOrder.clienteTelefono}</strong> para confirmar.
          </p>
          <div className="mt-4 rounded-xl bg-brand-beige p-4 text-left text-sm">
            <p><strong>Método de pago:</strong> {successOrder.metodoPago}</p>
            <p><strong>Entrega:</strong> {successOrder.entrega === 'envio' ? 'Envío' : 'Recoger en tienda'}</p>
            <p><strong>Total:</strong> {formatCRC(successOrder.total)}</p>
            {successOrder.estado && <p><strong>Estado:</strong> {successOrder.estado}</p>}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/seguimiento" className="btn-outline">Seguir mi pedido</Link>
            <Link to="/tienda" className="btn-primary">Seguir comprando</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-brand-green">Checkout</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Método de entrega */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl font-extrabold text-brand-green">Método de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEntrega('envio')}
                className={`rounded-xl border-2 p-4 font-bold transition ${entrega === 'envio' ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 bg-white'}`}
              >
                🚚 Envío
              </button>
              <button
                type="button"
                onClick={() => setEntrega('recoger')}
                className={`rounded-xl border-2 p-4 font-bold transition ${entrega === 'recoger' ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 bg-white'}`}
              >
                🏠 Retiro en tienda
              </button>
            </div>

            {entrega === 'envio' ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold">País / Región</label>
                  <select
                    className="input-field"
                    value={form.pais}
                    onChange={(e) => setField('pais', e.target.value)}
                  >
                    <option>Costa Rica</option>
                    <option>Panamá</option>
                    <option>Nicaragua</option>
                    <option>Estados Unidos</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-bold">Dirección</label>
                  <input
                    className="input-field"
                    placeholder="Calle, número, referencia"
                    value={form.direccion}
                    onChange={(e) => setField('direccion', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-bold">Casa, apartamento, etc. (opcional)</label>
                  <input
                    className="input-field"
                    placeholder="Edificio, apartamento"
                    value={form.linea2}
                    onChange={(e) => setField('linea2', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold">Provincia</label>
                  <select
                    className="input-field"
                    value={form.provincia}
                    onChange={(e) => setField('provincia', e.target.value)}
                  >
                    <option value="">Selecciona…</option>
                    {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold">Ciudad</label>
                  <input
                    className="input-field"
                    value={form.ciudad}
                    onChange={(e) => setField('ciudad', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold">Código postal (opcional)</label>
                  <input
                    className="input-field"
                    value={form.codigoPostal}
                    onChange={(e) => setField('codigoPostal', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-brand-green/30 bg-emerald-50 p-4">
                <p className="font-bold text-brand-green">Retiro en tienda</p>
                <p className="text-sm text-gray-700">
                  200 metros sureste del Recibidor de Coopetarrazú en San Lorenzo,
                  Tienda El Prado, San Lorenzo, Tarrazú, San José, Costa Rica.
                </p>
                <p className="mt-1 text-xs font-bold text-gray-500">Normalmente listo en 24 horas · GRATIS</p>
              </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl font-extrabold text-brand-green">Método de pago</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodoPago('SINPE Móvil')}
                className={`rounded-xl border-2 p-4 font-bold transition ${metodoPago === 'SINPE Móvil' ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 bg-white'}`}
              >
                SINPE Móvil <i className="fa-solid fa-mobile-screen-button ml-1" />
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('Pago en Efectivo')}
                className={`rounded-xl border-2 p-4 font-bold transition ${metodoPago === 'Pago en Efectivo' ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 bg-white'}`}
              >
                Efectivo <i className="fa-solid fa-money-bill-wave ml-1" />
              </button>
            </div>

            {metodoPago === 'SINPE Móvil' && (
              <div className="mt-4 rounded-xl bg-brand-beige p-4">
                <p className="text-sm text-gray-700">
                  Realiza tu transferencia SINPE Móvil al número{' '}
                  <strong className="text-gray-900">{SINPE_NUMBER}</strong> y adjunta el comprobante.
                </p>
                <div className="mt-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-outline w-full !py-2 text-sm disabled:opacity-50"
                  >
                    {uploading ? 'Subiendo…' : comprobanteUrl ? '✓ Comprobante subido (cambiar)' : '📎 Subir comprobante'}
                  </button>
                  {comprobanteFile && (
                    <p className="mt-2 text-xs text-gray-600">{comprobanteFile.name}</p>
                  )}
                </div>
              </div>
            )}

            {metodoPago === 'Pago en Efectivo' && (
              <p className="mt-3 text-sm text-gray-600">
                Podrás pagar en efectivo al momento de retirar o recibir tu pedido.
              </p>
            )}
          </div>

          {/* Datos del cliente */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl font-extrabold text-brand-green">Tus datos</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold">Nombre *</label>
                <input className="input-field" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Apellidos *</label>
                <input className="input-field" value={form.apellidos} onChange={(e) => setField('apellidos', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Teléfono (WhatsApp) *</label>
                <input className="input-field" type="tel" value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Correo (opcional)</label>
                <input className="input-field" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

{/* Resumen interactivo "Tu pedido" */}
          <OrderSummary
          shipping={shipping}
          entrega={entrega}
          submitting={submitting}
          onConfirm={handleSubmit}
        />
      </form>
    </section>
  );
}

