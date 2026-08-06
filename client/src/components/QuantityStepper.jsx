import { useRef, useState } from 'react';

/**
 * Control de cantidad reutilizable con animación al cambiar.
 * `onDecrease` (qty > 1) y `onIncrease` son disparados por el padre.
 */
export default function QuantityStepper({ qty, onDecrease, onIncrease, size = 'md' }) {
  const [pulse, setPulse] = useState(0);
  const timer = useRef(null);

  const flash = () => {
    setPulse((p) => p + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPulse(0), 280);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    flash();
    onDecrease?.();
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    flash();
    onIncrease?.();
  };

  const btn = size === 'sm'
    ? 'h-8 w-8 text-sm'
    : 'h-9 w-9 text-base';

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-brand-beige2 p-1 shadow-sm transition focus-within:ring-2 focus-within:ring-brand-green/20">
      <button
        type="button"
        onClick={handleDecrease}
        aria-label="Disminuir cantidad"
        className={`${btn} inline-flex items-center justify-center rounded-full bg-white font-black text-brand-green shadow-sm transition duration-200 hover:bg-brand-green hover:text-white active:scale-90`}
      >
        −
      </button>
      <span
        key={`${qty}-${pulse}`}
        className="animate-qty-pop inline-block min-w-8 text-center text-base font-extrabold tabular-nums text-gray-900"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        aria-label="Aumentar cantidad"
        className={`${btn} inline-flex items-center justify-center rounded-full bg-brand-green font-black text-white shadow-sm transition duration-200 hover:bg-brand-dark active:scale-90`}
      >
        +
      </button>
    </div>
  );
}

