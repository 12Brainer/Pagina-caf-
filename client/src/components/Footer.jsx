import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-black/10 bg-brand-cream pb-24 pt-10 text-gray-800">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        {/* Marca */}
        <div>
          <h3 className="font-display text-2xl font-bold text-brand-green">
            SAN BERNARDO
            <span className="block font-body text-sm font-extrabold tracking-wide text-brand-dark">
              SPECIALTY COFFEE ESTATE
            </span>
          </h3>
          <p className="mt-2 text-sm leading-relaxed">
            Café 100% arábica de Costa Rica. Tueste medio, micro-lotes y trazabilidad desde la finca.
          </p>
        </div>

        {/* Enlaces */}
        <div>
          <h4 className="mb-3 font-bold text-brand-green">Enlaces</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/tienda" className="hover:text-brand-dark">Tienda</Link></li>
            <li><Link to="/nosotros" className="hover:text-brand-dark">Sobre nosotros</Link></li>
            <li><Link to="/contacto" className="hover:text-brand-dark">Contacto</Link></li>
            <li><Link to="/seguimiento" className="hover:text-brand-dark">Seguimiento de pedidos</Link></li>
            <li><Link to="/admin" className="hover:text-brand-dark">Panel admin</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="mb-3 font-bold text-brand-green">Contacto</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2"><i className="fa-solid fa-phone w-4" /> +506 8391-0511</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-envelope w-4" /> fatucafe75@gmail.com</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-location-dot w-4" /> San José, Costa Rica</li>
            <li className="flex items-center gap-2"><i className="fa-regular fa-clock w-4" /> Lun–Vie: 9am–6pm</li>
          </ul>
        </div>

        {/* Redes */}
        <div>
          <h4 className="mb-3 font-bold text-brand-green">Síguenos</h4>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.facebook.com/NeopradoCoffee"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1877f2] px-4 py-2 text-sm font-bold text-white"
            >
              <i className="fab fa-facebook-f" /> San Bernardo Costa Rica
            </a>
            <a
              href="https://www.instagram.com/cafe_san_bernardo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 px-4 py-2 text-sm font-bold text-white"
            >
              <i className="fab fa-instagram" /> @cafe_san_bernardo
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-black/10 px-4 pt-4 text-center text-sm opacity-90">
        © 2025 SAN BERNARDO SPECIALTY COFFEE ESTATE · Hecho en Zona de los Santos, Costa Rica
      </div>
    </footer>
  );
}

