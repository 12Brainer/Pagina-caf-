import axios from 'axios';

// Cliente Axios centralizado para la API SAN BERNARDO.
// En desarrollo las llamadas /api se redirigen al backend (Vite proxy).
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: agrega el token JWT del admin a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si el token expira, limpiar sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      const isAuthRoute = err.config && err.config.url && err.config.url.includes('/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('sb_admin_token');
        localStorage.removeItem('sb_admin_user');
      }
    }
    return Promise.reject(err);
  }
);

// ---------- Utilidades de formato ----------
export const formatCRC = (value) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(value || 0);

export const formatDate = (iso) => {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );
};

export const shippingCost = (subtotal) => (subtotal >= 30000 ? 0 : 3000);

export default api;

