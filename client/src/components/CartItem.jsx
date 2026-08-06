import { formatCRC } from '../api/client';
import QuantityStepper from './QuantityStepper';

/**
 * Tarjeta de producto dentro del carrito / resumen del pedido.
 * Cantidad en tiempo real, total por línea y botón "Eliminar".
 */
export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="animate-slide-up rounded-2xl border border-black/5 bg-white p-4 shadow-card transition duration-300 hover:shadow-lg">
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <div className="shrink-0 overflow-hidden rounded-xl bg-brand-beige2">
          <img
            src={item.image}
            alt={item.productName}
            className="h-20 w-20 object-contain p-1"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-base font-extrabold leading-snug text-gray-900">
            {item.productName}
          </h4>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            {item.size} g • {item.grind}
          </p>
          <p className="mt-1.5 inline-flex items-center rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-bold text-brand-green">
            {formatCRC(item.price)} c/u
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-gray-100 pt-3.5">
        <QuantityStepper qty={item.qty} onDecrease={onDecrease} onIncrease={onIncrease} />
        <div className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Total:
          </span>
          <span
            key={item.subtotal}
            className="animate-qty-pop block text-lg font-black tabular-nums text-gray-900"
          >
            {formatCRC(item.subtotal)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-red-500 transition duration-200 hover:bg-red-50 active:scale-95"
        >
          <i className="fa-solid fa-trash-can" /> Eliminar
        </button>
      </div>
    </div>
  );
}

