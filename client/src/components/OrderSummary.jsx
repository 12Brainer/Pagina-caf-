import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatCRC } from '../api/client';
import CartItem from './CartItem';
import ConfirmModal from './ConfirmModal';

/**
 * Panel "Tu pedido": carrito interactivo estilo Shopify.
 * Controles de cantidad, eliminar con confirmación, totales en tiempo real
 * y estado de carrito vacío.
 *
 * Props:
 *  - shipping:   costo de envío ya calculado (0 si "recoger" o gratis)
 *  - between:    "envio" | "recoger" (para mostrar costo de envío)
 *  - onConfirm:  se invoca al presionar "Confirmar Pedido"
 *  - submitting: estado de envío del formulario
 */
export default function OrderSummary({ shipping = 0, entrega = 'recoger', onConfirm, submitting = false }) {
  const { cart, updateQty, removeItem, subtotal } = useCart();
  const [pendingIndex, setPendingIndex] = useState(null);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);
  const pendingItem = pendingIndex != null ? cart[pendingIndex] : null;

  const handleDecrease = (idx, qty) => {
    if (qty <= 1) {
      setPendingIndex(idx); // dispara modal de confirmación (no negativos)
      return;
    }
    updateQty(idx, qty - 1);
  };

  const handleIncrease = (idx, qty) => updateQty(idx, qty + 1);

  const confirmDelete = () => {
    if (pendingIndex != null) removeItem(pendingIndex);
    setPendingIndex(null);
  };

  return (
    <div className="card h-fit p-5">
      <h2 className="mb-4 font-display text-xl font-extrabold text-brand-green">Tu pedido</h2>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-brand-beige2 py-10 text-center">
          <span className="text-4xl">☕</span>
          <h3 className="font-display text-lg font-extrabold text-gray-700">Tu carrito está vacío</h3>
          <p className="max-w-xs text-sm text-gray-500">Explora nuestros cafés premium.</p>
          <Link to="/tienda" className="btn-outline mt-2 !px-5 !py-2 text-sm">
            ← Seguir comprando
          </Link>
        </div>
      ) : (
        <>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <CartItem
                key={`${item.productId}-${item.size}-${item.grind}`}
                item={item}
                onIncrease={() => handleIncrease(idx, item.qty)}
                onDecrease={() => handleDecrease(idx, item.qty)}
                onRemove={() => setPendingIndex(idx)}
              />
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold tabular-nums">{formatCRC(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="font-bold tabular-nums">
                {entrega === 'envio' ? (shipping === 0 ? 'GRATIS' : formatCRC(shipping)) : '—'}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-black">
              <span className="text-gray-900">Total</span>
              <span key={total} className="animate-qty-pop tabular-nums text-brand-green">
                {formatCRC(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            onClick={(e) => onConfirm?.(e)}
            disabled={submitting || cart.length === 0}
            className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Procesando…' : 'Confirmar Pedido'}
          </button>
          <p className="mt-2 text-center text-xs text-gray-500">
            Al confirmar, tu pedido quedará registrado y te contactaremos.
          </p>
        </>
      )}

      <ConfirmModal
        open={pendingIndex != null}
        title="¿Eliminar este producto del pedido?"
        message={pendingItem ? `${pendingItem.productName} ${pendingItem.size} g` : ''}
        onCancel={() => setPendingIndex(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
