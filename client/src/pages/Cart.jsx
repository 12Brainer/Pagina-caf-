import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatCRC } from '../api/client';
import { EmptyState } from '../components/Loader';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeItem, subtotal, shippingCost, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-brand-green">
          Tu Carrito de Compras
        </h1>
        <EmptyState
          icon="fa-cart-shopping"
          title="Tu carrito está vacío"
          message="Agrega algunos cafés de especialidad para comenzar."
          action={
            <Link to="/tienda" className="btn-primary mt-4">
              Ir a la tienda
            </Link>
          }
        />
      </section>
    );
  }

  const shipping = shippingCost(subtotal);
  const total = subtotal + shipping;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-brand-green">
        Tu Carrito de Compras
      </h1>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Lista de productos */}
        <div className="space-y-3">
          {cart.map((item, idx) => (
            <div key={idx} className="card flex flex-wrap items-center gap-4 p-4">
              <img src={item.image} alt={item.productName} className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900">{item.productName}</h3>
                <p className="text-sm text-gray-500">
                  {item.size} g · {item.grind}
                </p>
                <p className="font-bold text-brand-green">{formatCRC(item.price)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(idx, item.qty - 1)}
                  className="h-9 w-9 rounded-lg border border-gray-300 bg-white font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{item.qty}</span>
                <button
                  onClick={() => updateQty(idx, item.qty + 1)}
                  className="h-9 w-9 rounded-lg border border-gray-300 bg-white font-bold"
                >
                  +
                </button>
              </div>
              <div className="w-24 text-right font-extrabold text-gray-900">{formatCRC(item.subtotal)}</div>
              <button
                onClick={() => removeItem(idx)}
                className="text-gray-400 transition hover:text-red-500"
                aria-label="Quitar producto"
              >
                <i className="fa-solid fa-trash-can" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="card h-fit p-5">
          <h2 className="mb-3 font-display text-xl font-extrabold text-brand-green">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">{formatCRC(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="font-bold">{subtotal >= 30000 ? 'GRATIS' : formatCRC(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-extrabold">
              <span>Total</span>
              <span>{formatCRC(total)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary mt-4 w-full">
            Finalizar compra
          </button>
          <Link to="/tienda" className="mt-2 block text-center text-sm text-brand-green hover:underline">
            Seguir comprando
          </Link>
          {totalItems > 0 && (
            <p className="mt-3 rounded-xl bg-red-50 p-2 text-center text-xs font-bold text-red-600">
              ⚠ Los productos no están reservados hasta confirmar el pedido.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

