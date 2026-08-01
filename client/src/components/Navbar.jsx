import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const navLinks = [
  { to: '/', label: 'Comprar Café' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/nosotros', label: 'Sobre nosotros' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/seguimiento', label: 'Seguimiento' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Franja superior de envíos */}
      <div className="bg-brand-green py-2 text-center text-sm font-extrabold tracking-wide text-white">
        🛒 ENVÍOS GRATIS EN PEDIDOS MAYORES A ₡30,000 COLONES · 🚚 ENVÍOS A TODA COSTA RICA
      </div>

      <header className="sticky top-0 z-[100] border-b border-black/10 bg-brand-green shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          {/* Hamburger */}
          <button
            className="inline-flex h-10 w-10 flex-col items-center justify-center rounded-lg md:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`mb-1 block h-0.5 w-6 bg-white transition ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
            <span className={`mb-1 block h-0.5 w-6 bg-white transition ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Logo SAN BERNARDO SPECIALTY COFFEE ESTATE" className="h-14 w-auto rounded-lg" />
            <div className="leading-tight">
              <span className="block font-display text-lg font-bold text-white md:text-2xl">
                SAN BERNARDO
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-100 md:text-xs">
                Specialty Coffee Estate
              </span>
            </div>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `font-bold text-white transition hover:text-emerald-200 ${isActive ? 'underline underline-offset-4' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={() => navigate('/carrito')}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-900 shadow"
              aria-label="Abrir carrito"
            >
              <i className="fa-solid fa-cart-shopping" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[11px] font-extrabold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Menú móvil */}
        {open && (
          <nav className="border-t border-white/10 bg-brand-green px-4 pb-4 pt-2 md:hidden">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-3 font-bold text-white hover:bg-brand-dark ${isActive ? 'bg-brand-dark' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                navigate('/carrito');
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-3 font-bold text-gray-900"
            >
              <i className="fa-solid fa-cart-shopping" /> Carrito
              {totalItems > 0 && <span className="badge bg-red-500 text-white">{totalItems}</span>}
            </button>
          </nav>
        )}
      </header>
    </>
  );
}

