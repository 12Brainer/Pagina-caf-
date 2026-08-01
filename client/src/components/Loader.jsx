export default function Loader({ text = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-green">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
      <p className="font-semibold">{text}</p>
    </div>
  );
}

export function EmptyState({ icon = 'fa-box-open', title = 'Sin datos', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center">
      <i className={`fa-solid ${icon} text-4xl text-gray-300`} />
      <h3 className="font-display text-xl font-bold text-gray-700">{title}</h3>
      {message && <p className="max-w-md text-sm text-gray-500">{message}</p>}
      {action}
    </div>
  );
}

