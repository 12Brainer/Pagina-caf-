import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-green">404</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-gray-900">Página no encontrada</h1>
      <p className="mt-3 text-gray-600">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="btn-primary mt-6">Volver al inicio</Link>
    </section>
  );
}

