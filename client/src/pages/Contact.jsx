export default function Contact() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl shadow-card">
        <img
          src="/assets/tienda-prado.png"
          alt="Tienda El Prado"
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-green">Contáctenos</h1>
        <div className="mt-4 space-y-2">
          <p>
            <a className="font-bold text-brand-green hover:underline" href="mailto:fatucafe75@gmail.com">
              fatucafe75@gmail.com
            </a>
          </p>
          <p>
            <a className="font-bold text-brand-green hover:underline" href="tel:+50683910511">
              +506 8391-0511
            </a>
          </p>
        </div>
        <p className="mt-4 text-gray-700">
          <strong>Nuestras instalaciones:</strong>
          <br />
          200 metros sureste del Recibidor de Coopetarrazú en San Lorenzo
          <br />
          Tienda El Prado, San Lorenzo, Tarrazú, San José, Costa Rica.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="btn-primary"
            href="https://www.waze.com/ul?ll=9.5772,84.0547&navigate=yes"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-waze" /> Waze
          </a>
          <a
            className="btn-outline"
            href="https://www.google.com/maps/search/?api=1&query=San+Lorenzo+Tarrazu+Costa+Rica"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-google" /> Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}

