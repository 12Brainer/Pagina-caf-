import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-chart-pie' },
  { to: '/admin/productos', label: 'Productos', icon: 'fa-coffee' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'fa-truck' },
  { to: '/admin/clientes', label: 'Clientes', icon: 'fa-users' },
  { to: '/admin/inventario', label: 'Inventario', icon: 'fa-warehouse' },
  { to: '/admin/reportes', label: 'Reportes', icon: 'fa-file-lines' }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col bg-brand-green text-white md:flex">
        <div className="p-4">
          <img src="/assets/logo.png" alt="Logo" className="h-12 w-auto" />
          <p className="mt-2 text-xs font-bold tracking-wider uppercase opacity-80">
            Admin - {admin?.nombre || 'Admin'}
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 font-bold text-white transition ${isActive ? 'bg-brand-dark' : 'hover:bg-brand-dark/50'}`
              }
            >
              <i className={`fa-solid ${l.icon} w-5 text-center`} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-bold text-white/80 transition hover:bg-red-500 hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="Logo" className="h-8 w-auto" />
              <span className="font-display text-sm font-bold text-brand-green">Admin</span>
            </div>
            <button onClick={handleLogout} className="text-sm font-bold text-red-500">
              Salir
            </button>
          </div>
          <nav className="mt-2 flex gap-2 overflow-x-auto text-xs">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 font-bold ${isActive ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
