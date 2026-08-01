import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend se sirve desde /client dentro de Pagina-caf.
// En desarrollo usa el puerto 5173. Las llamadas /api y /uploads se
// redirigen al backend Express (puerto 4000) mediante proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/assets': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});

