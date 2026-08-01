import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl shadow-card">
          <img
            src="/assets/imagen-inicio.jpg"
            alt="SAN BERNARDO SPECIALTY COFFEE ESTATE"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-green">Somos una familia caficultora</h1>
          <p className="mt-4 leading-relaxed text-gray-700">
            En <strong>SAN BERNARDO SPECIALTY COFFEE ESTATE</strong> cultivamos y seleccionamos café
            100% arábica de Costa Rica, con amor y tradición familiar. Nuestra pasión por el café nos
            impulsa a ofrecer granos de alta calidad con un tueste balanceado y trazabilidad completa
            desde la finca.
          </p>
          <p className="mt-3 leading-relaxed text-gray-700">
            Queremos ser tus <strong>proveedores de confianza</strong>, llevándote un producto
            auténtico, lleno de aroma y sabor que representa nuestra tierra.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/tienda" className="btn-primary">Comprar café</Link>
            <Link to="/contacto" className="btn-outline">Contacto</Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 text-center sm:grid-cols-3">
          <div>
            <p className="font-display text-4xl font-extrabold text-brand-green">1,400</p>
            <p className="text-sm font-bold text-gray-500">m.s.n.m de altitud</p>
          </div>
          <div>
            <p className="font-display text-4xl font-extrabold text-brand-green">100%</p>
            <p className="text-sm font-bold text-gray-500">Arábica costarricense</p>
          </div>
          <div>
            <p className="font-display text-4xl font-extrabold text-brand-green">3</p>
            <p className="text-sm font-bold text-gray-500">Procesos: Honey, Lavado y Natural</p>
          </div>
        </div>
      </section>
    </>
  );
}

