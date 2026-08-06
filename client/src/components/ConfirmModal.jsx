import { useEffect } from 'react';

/**
 * Modal elegante de confirmación con fondo oscuro y animación suave.
 * Cierra con Escape o al hacer clic fuera del modal.
 */
export default function ConfirmModal({ open, title = '', message = '', onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="animate-scale-in relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-black/5"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <i className="fa-solid fa-trash-can text-xl text-red-500" />
        </div>
        <h3 className="mt-4 font-display text-xl font-extrabold text-gray-900">
          {title || '¿Eliminar este producto del pedido?'}
        </h3>
        {message && (
          <p className="mt-2 text-sm font-bold text-brand-green">{message}</p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-5 py-2.5 font-bold text-white transition hover:bg-red-700 active:scale-95"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

