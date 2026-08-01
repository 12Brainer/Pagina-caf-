import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sb_admin_token';
const USER_KEY = 'sb_admin_user';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (admin) localStorage.setItem(USER_KEY, JSON.stringify(admin));
    else localStorage.removeItem(USER_KEY);
  }, [admin]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.ok && res.data.token) {
        setToken(res.data.token);
        setAdmin(res.data.admin);
        return { ok: true, admin: res.data.admin };
      }
      return { ok: false, message: res.data?.message || 'No se pudo iniciar sesión.' };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || 'Error de conexión con el servidor.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
  };

  const value = { admin, token, loading, login, logout, isAuthenticated: !!token && !!admin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

