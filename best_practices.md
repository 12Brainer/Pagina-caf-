# 📘 Project Best Practices

## 1. Project Purpose
NeoPrado Café es una aplicación web principalmente estática orientada a presentar y vender café de especialidad, con carrito persistido en localStorage y checkout vía WhatsApp. Además, incluye un backend mínimo con Express + PostgreSQL para registrar clientes (formulario en `styles/clientes.html`) y una integración opcional con Google Apps Script para registrar compras en Google Sheets.

## 2. Project Structure
- Raíz
  - `index.html`: Landing principal con productos destacados y enlaces a redes.
  - `README.md`: Instrucciones generales del proyecto.
  - `best_practices.md`: Este documento.
  - `server.js`: Servidor Express. Sirve estáticos y expone endpoints `/guardarCliente` y `/clientes`.
  - `db.js`: Conexión a PostgreSQL mediante `pg` (Pool). Mover credenciales a variables de entorno.
  - `.clasp.json`: Configuración de Google Apps Script local (CLASP).
- `assets/`: Imágenes del sitio (logo, empaques, finca, etc.).
- `styles/`
  - `style.css`: Hoja de estilos global.
  - Páginas: `about.html`, `products.html`, `contacto.html`, `Pedidos.html`, `clientes.html` (consume backend), `login.html` y `register.html` (redirigen a inicio).
  - `nav.html`: Fragmento de navegación cargado dinámicamente.
  - `scripts/`
    - `main.js`: Carga/inyección de `nav.html`, ajuste de rutas, header sticky y navegación móvil.
    - `products.js`: Modal de producto, carrito, checkout por WhatsApp, integración con Google Apps Script, carrusel e icono flotante de carrito.
    - `auth.js`: Archivo vacío para compatibilidad (autenticación eliminada).
- `src/`: Integración con Google Apps Script
  - `appsscript.json`: Configuración del proyecto GAS.
  - `Code.js`: `doPost` para registrar compras en Google Sheets (requerido `SPREADSHEET_ID`).

Notas de estructura y navegación
- Las páginas HTML internas viven en `styles/` y referencian recursos por rutas relativas (`../` hacia la raíz). Mantener consistencia en rutas relativas.
- `main.js` carga `nav.html` y corrige rutas automáticamente en `index.html` mediante `fixNavLinks`.
- El header y el footer están duplicados entre páginas. Mantenerlos sincronizados y válidos (estructura semántica, sin etiquetas mal cerradas). Validar HTML con un validador (W3C) antes de publicar.
- El servidor Express sirve archivos estáticos desde la raíz del proyecto para desarrollo local.

## 3. Test Strategy
Estado actual
- No hay framework de pruebas configurado (sitio estático + backend mínimo). Se realizan pruebas manuales (navegación, carrito, WhatsApp, responsividad y endpoints de clientes).

Buenas prácticas propuestas
- E2E (recomendado): Cypress o Playwright para flujos críticos:
  - Agregar al carrito, actualizar badge, cambiar método de entrega y totales, finalizar compra por WhatsApp.
  - Navegación entre páginas y corrección de rutas (`fixNavLinks`).
- Unit tests (frontend): Jest para funciones puras en `products.js` (cálculo de subtotal/total, costo de envío, formateo de moneda, serialización a WhatsApp). Mock de `localStorage`, `window.open`, `fetch` (GAS).
- Backend tests: Jest + Supertest para endpoints Express (`/guardarCliente`, `/clientes`). Usar una base de datos de pruebas (o `transaction` + rollback) y variables de entorno.
- Organización sugerida:
  - `tests/e2e/**/*.spec.(ts|js)` para escenarios de usuario.
  - `tests/unit/frontend/**/*.spec.(ts|js)` para utilidades puras del frontend.
  - `tests/unit/backend/**/*.spec.(ts|js)` para controladores/servicios de Express.
- Cobertura y filosofía:
  - Priorizar regresiones del carrito/localStorage, rutas relativas, composición de mensaje de WhatsApp y render del badge.
  - Backend: validación de payloads, errores de DB, y ordenamiento en `/clientes`.
- Mocking:
  - Frontend: `localStorage`, `window.open`, `fetch` a GAS.
  - Backend: mock del pool de `pg` o usar contenedor/DB efímera.

## 4. Code Style
HTML
- Semántico: usar `header`, `nav`, `main`, `section`, `footer` correctamente. Evitar contenido fuera de `<body>`.
- Accesibilidad: `alt` en imágenes, `aria-label` en iconos interactivos, labels asociadas a inputs, tamaño de toque suficiente.
- Cargar librerías externas una sola vez (evitar duplicados de Font Awesome o CSS externos).

CSS
- Variables en `:root` (ya presentes) para colores, radios, etc. Mantener una paleta consistente.
- Convención de nombres: preferir BEM o un esquema consistente (`.block__element--modifier`).
- Mobile-first y responsive: mantener media queries y layouts flex/grid.
- Evitar estilos inline y `!important`. Centralizar estilos en `style.css`.

JavaScript (Frontend, Vanilla)
- Declaraciones: usar `const`/`let`; evitar variables globales accidentales.
- Carga de scripts: preferir `<script src="..." defer>`. Evitar inyectar scripts después de `</html>`.
- Esperar al DOM: listeners tras `DOMContentLoaded` o con `defer`.
- Comprobaciones null-safe: proteger accesos a elementos (`document.getElementById(...)`).
- localStorage: parsear con `try/catch`; validar estructura y manejar corrupción de datos.
- UX de errores: preferir UI no bloqueante (toasts/banners) sobre `alert`.
- Separación de responsabilidades: aislar utilidades puras (cálculo de totales, formateo) de la manipulación del DOM para facilitar pruebas.
- Accesibilidad del modal: devolver foco al disparador, cerrar con `Esc`, usar `aria-modal="true"`, `role="dialog"` y `aria-labelledby` cuando aplique.

Node/Express (Backend)
- Configuración: usar variables de entorno para credenciales de DB (no hardcodear). Recomendado `dotenv` en desarrollo.
- Pooling: usar `pg.Pool` (ya implementado), manejar eventos de error del pool.
- Seguridad: agregar `helmet`, validación/sanitización de inputs (por ejemplo `express-validator`/`joi`), y rate-limiting en endpoints públicos.
- Errores: capturar y responder con JSON consistente; loguear con contexto, evitar trazar secretos.
- SQL: siempre usar consultas parametrizadas (ya aplicado con `$1..$n`).
- Estructura: separar `routes/`, `controllers/`, `db/` si crece el backend; mantener `ensureSchema()` idempotente para desarrollo.

## 5. Common Patterns
- Modal de producto: se puebla con `data-*` del botón `.btn-buy` (imagen, título, precio base) y permite seleccionar tamaño/molienda.
- Carrito persistente: se almacena en `localStorage` bajo la clave `cart`. El badge `.cart-badge` refleja el total de ítems.
- Checkout por WhatsApp: se construye un mensaje con items y datos del cliente y se abre `wa.me` en nueva pestaña.
- Carrusel: track deslizable con navegación por botones y drag/swipe, con `requestAnimationFrame` y `translateX`.
- Header sticky: añade/clase `hidden` al hacer scroll hacia abajo y `scrolled` después de cierto umbral.
- CSS variables: colores, radios y opacidades para coherencia visual.
- Navegación dinámica: `nav.html` se inyecta con `fetch` desde `main.js` y se corrigen rutas cuando se carga en `index.html` (raíz).
- Botones flotantes: carrito flotante que redirige a `styles/Pedidos.html` y acceso directo a WhatsApp con mensaje por defecto.
- Backend Express: endpoints `POST /guardarCliente` (insert) y `GET /clientes` (listado). `ensureSchema()` crea la tabla `clientes` si no existe.
- Google Apps Script: `Code.js` recibe `doPost` con `action=guestPurchase` y escribe en hoja `Compras`. Frontend usa `GAS_ENDPOINT` configurable.

## 6. Do's and Don'ts
Do
- Mantener rutas relativas correctas entre `styles/*.html` y recursos en raíz (`../index.html`, `../assets/*`).
- Validar el HTML para evitar etiquetas mal cerradas o contenido fuera de `<body>` (p. ej., asegurar que `<footer>` esté dentro del `<body>`).
- Incluir el span del carrito `<span class="cart-badge">` en todas las páginas de navegación para consistencia.
- Usar una sola referencia a Font Awesome/Google Fonts por página; remover duplicados.
- Enriquecer accesibilidad: `aria-label` en el icono del carrito, roles, foco en modales y cierre con `Esc`.
- Formatear precios con `Intl.NumberFormat('es-CR')` para el símbolo ₡ y agrupación.
- Controlar errores de `localStorage` con `try/catch` y fallback a `[]` si falla el parseo.
- Encapsular cálculos (subtotal, total, envío) en funciones puras reutilizables y testeables.
- Adjuntar listeners tras `DOMContentLoaded` o usando `defer`.
- Backend: usar variables de entorno para `PGUSER`, `PGHOST`, `PGDATABASE`, `PGPASSWORD`, `PGPORT` (o `DATABASE_URL`).
- Backend: validar/sanitizar inputs (`nombre`, `telefono`, `producto`) y limitar tasa de requests.
- Backend: separar configuración sensible y no commitear secretos (.env en `.gitignore`).
- GAS: configurar `SPREADSHEET_ID` en `src/Code.js` y `GAS_ENDPOINT` en `styles/scripts/products.js` desde una sola fuente de configuración.

Don't
- No duplicar `<link>` de Font Awesome en la misma página.
- No colocar contenido fuera de `<body>` ni cerrar `</body>` antes del footer.
- No asumir que elementos del DOM siempre existen; proteger con guardas.
- No construir strings de WhatsApp sin `encodeURIComponent` (ya se usa correctamente).
- No usar `alert` para casos de uso normales; preferir componentes de UI.
- No mezclar estilos inline con CSS global.
- No hardcodear credenciales de base de datos en `db.js` para entornos reales.
- No confiar en validaciones del cliente: revalidar en el servidor.
- No exponer endpoints sin protección básica si se escala (CORS/ratelimit/logs adecuados).

## 7. Tools & Dependencies
- Frontend (CDN):
  - Google Fonts (Playfair Display, Open Sans).
  - Font Awesome 6.x (iconos sociales y carrito).
- Frontend (Runtime):
  - Sin build system: sitio estático. Para desarrollo, abrir `index.html` o servir con el backend.
  - Scripts del proyecto: `styles/scripts/main.js` (header/nav/whatsapp) y `styles/scripts/products.js` (modal, carrito, carrusel, checkout, GAS).
- Backend:
  - Node.js + Express (`server.js`), `pg` para PostgreSQL (`db.js`).
  - Recomendado agregar `dotenv`, `helmet`, `cors` y `express-rate-limit` en producción.
  - Ejecución local (ejemplo):
    1) `npm init -y`
    2) `npm i express pg` (y opcionalmente `dotenv helmet cors express-rate-limit`)
    3) Configurar variables de entorno para PostgreSQL
    4) `node server.js` (será accesible en `http://localhost:3000`)
- Google Apps Script:
  - `src/Code.js` con `SPREADSHEET_ID` (hoja `Compras`).
  - Desplegar como Web App y usar la URL en `GAS_ENDPOINT` del frontend.
  - `.clasp.json` habilita flujos con `clasp` si se desea editar/implementar desde local.

## 8. Other Notes
- Idioma y dominio: contenido en español (es-CR). Mantener terminología consistente (Café, Proceso, Tueste, Molienda) y moneda CRC (₡).
- WhatsApp: usar el número `50683910511`. Mantener un único punto de contacto en configuración.
- Mapa: reemplazar `LATITUD,LONGITUD` con coordenadas reales en Contacto (Waze/Google Maps).
- Reutilización de layout: si se añade un generador estático/templating en el futuro, extraer header/footer a parciales.
- IDs únicos: asegurar que IDs de inputs/modales se mantengan únicos por página.
- Accesibilidad del modal: añadir foco al abrir, cerrar con `Esc`, y `aria-modal="true"` y `role="dialog"`.
- Seguridad: sanitizar/validar campos de formulario (teléfono/email) y manejar inputs vacíos. No registrar datos sensibles por WhatsApp.
- Compatibilidad: probar en navegadores móviles (Safari iOS/Chrome Android) por el uso de drag/swipe y `backdrop-filter`.
- Rendimiento: optimizar imágenes (`assets/`) y usar formatos modernos (WebP/AVIF) cuando sea posible.
- Rutas y despliegue: cuando sirvas `index.html` desde la raíz y páginas internas desde `styles/`, `main.js` corrige rutas del menú. Validar que los enlaces del nav/footer no dupliquen prefijos (`../`, `styles/`).
