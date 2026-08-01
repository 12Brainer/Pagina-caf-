import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    const result = await login(email, password);
    if (result.ok) {
      navigate('/admin');
    } else {
      setError(result.message || 'Credenciales inválidas.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-beige p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-4 text-center">
          <img src="/assets/logo.png" alt="Logo" className="mx-auto h-16 w-auto" />
          <h1 className="mt-3 font-display text-xl font-extrabold text-brand-green">
            Panel Administrativo
          </h1>
          <p className="text-sm text-gray-500">SAN BERNARDO SPECIALTY COFFEE ESTATE</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold">Email</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Contraseña</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
