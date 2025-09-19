# 📘 Project Best Practices

## 1. Project Purpose
NeoPrado Café es un sitio web estático, orientado a presentar y vender café de especialidad. Incluye páginas de información (Sobre nosotros, Contacto), un catálogo de productos con modal y carrusel, y un flujo de compra simple que utiliza WhatsApp y un carrito persistido en localStorage.

## 2. Project Structure
- Raíz
  - `index.html`: Página principal (landing con productos destacados y enlaces a redes sociales).
  - `README.md`: Instrucciones generales del proyecto.
  - `best_practices.md`: Este documento.
- `assets/`: Imágenes del sitio (logo, empaques, finca, etc.).
- `styles/`
  - `style.css`: Hoja de estilos global.
  - `about.html`, `products.html`, `contacto.html`, `Pedidos.html`: Páginas internas.
  - `scripts/`
    - `main.js`: Comportamiento del header (sticky/oculto al hacer scroll).
    - `products.js`: Lógica de modal, carrito, checkout por WhatsApp y carrusel.

Notas de estructura y navegación
- Las páginas HTML internas viven en `styles/` y referencian recursos por rutas relativas (`../` hacia la raíz). Mantener consistencia en rutas relativas.
- El header y el footer están duplicados entre páginas. Mantenerlos sincronizados y válidos (estructura semántica, sin etiquetas mal cerradas). Validar HTML con un validador (W3C) antes de publicar.

## 3. Test Strategy
Estado actual
- No hay framework de pruebas configurado en este proyecto (sitio estático). Se realizan pruebas manuales (navegación, carrito, WhatsApp, responsividad).

Buenas prácticas propuestas
- E2E (recomendado para futuro): Cypress o Playwright para flujos críticos (agregar al carrito, ver badge actualizarse, finalizar compra por WhatsApp, navegación entre páginas).
- Unit tests (si se separa la lógica): Jest para funciones puras (cálculo de totales, formateo de moneda, serialización a WhatsApp).
- Organización sugerida:
  - `tests/e2e/**/*.spec.(ts|js)` para escenarios de usuario.
  - `tests/unit/**/*.spec.(ts|js)` para utilidades puras.
- Cobertura y filosofía:
  - Priorizar pruebas de regresión para carrito/localStorage y rutas relativas entre páginas.
  - Foco en flujos de compra y renderizado del badge del carrito.
- Mocking:
  - Mock de `localStorage` en unit tests.
  - Stubs de `window.open` y URLs de WhatsApp en unit/E2E.

## 4. Code Style
HTML
- Semántico: usar `header`, `nav`, `main`, `section`, `footer` correctamente. Evitar contenido fuera de `<body>`.
- Accesibilidad: `alt` en imágenes, `aria-label` en iconos interactivos, etiquetas asociadas a inputs, tamaño de toque suficiente.
- Cargar librerías externas una sola vez (evitar duplicados de Font Awesome o CSS externos).

CSS
- Variables en `:root` (ya presentes) para colores, radios, etc. Mantener una paleta consistente.
- Convención de nombres: preferir estilo BEM o un esquema consistente (`.block__element--modifier`).
- Mobile-first y responsive: mantener media queries y layouts flex/grid.
- Evitar estilos inline y !important. Centralizar estilos en `style.css`.

JavaScript (Vanilla)
- Declaraciones: usar `const`/`let`; evitar variables globales accidentales.
- Carga de scripts: preferir `<script src="..." defer>` en el `<head>` o justo antes de `</body>`. Evitar inyectar scripts después de `</html>`.
- Esperar al DOM: adjuntar listeners tras `DOMContentLoaded` o con `defer`.
- Comprobaciones null-safe: antes de usar elementos (`document.getElementById(...)`) ya se usan guardas condicionales—mantener ese patrón.
- localStorage: parsear con try/catch; validar estructura y manejar corrupción de datos.
- Manejo de errores UX: reemplazar `alert` por UI no bloqueante (toasts, banners) cuando sea posible.
- Separación de responsabilidades: aislar utilidades puras (cálculo de totales, formateo) de la manipulación del DOM para facilitar pruebas.

## 5. Common Patterns
- Modal de producto: se puebla con `data-*` del botón `.btn-buy` (imagen, título, precio base) y permite seleccionar tamaño/molienda.
- Carrito persistente: se almacena en `localStorage` bajo la clave `cart`. El badge `.cart-badge` refleja el total de ítems.
- Checkout por WhatsApp: se construye un mensaje con items y datos del cliente y se abre `wa.me` en nueva pestaña.
- Carrusel: track deslizable con navegación por botones y drag/swipe, con `requestAnimationFrame` y `translateX`.
- Header sticky: añade/clase `hidden` al hacer scroll hacia abajo y `scrolled` después de cierto umbral.
- CSS variables: colores, radios y opacidades para coherencia visual.

## 6. Do's and Don'ts
Do
- Mantener rutas relativas correctas entre `styles/*.html` y recursos en raíz (`../index.html`, `../assets/*`).
- Validar el HTML para evitar etiquetas mal cerradas o contenido fuera de `<body>` (p. ej., asegurar que `<footer>` esté dentro del `<body>`).
- Incluir el span del carrito `<span class="cart-badge">` en todas las páginas de navegación para consistencia.
- Usar una sola referencia a Font Awesome/Google Fonts por página; remover duplicados.
- Enriquecer accesibilidad: `aria-label` en el icono del carrito, roles, foco en modales y cierre con `Esc`.
- Formatear precios con `Intl.NumberFormat('es-CR')` para el símbolo ₡ y agrupación.
- Controlar errores de `localStorage` con `try/catch` y fallback a `[]` si falla el parseo.
- Encapsular cálculos (subtotal, total) en funciones puras reutilizables y testeables.
- Adjuntar listeners tras `DOMContentLoaded` o usando `defer`.

Don't
- No duplicar `<link>` de Font Awesome en la misma página.
- No colocar contenido fuera de `<body>` ni cerrar `</body>` antes del footer.
- No asumir que elementos del DOM siempre existen; proteger con guardas.
- No construir strings de WhatsApp sin `encodeURIComponent` (ya se usa correctamente).
- No usar `alert` para casos de uso normales; preferir componentes de UI.
- No mezclar estilos inline con CSS global.

## 7. Tools & Dependencies
- Dependencias externas (CDN):
  - Google Fonts (Playfair Display, Open Sans).
  - Font Awesome 6.x (iconos sociales y carrito).
- Sin build system: sitio estático. Para desarrollo, abrir `index.html` en el navegador.
- Scripts del proyecto:
  - `styles/scripts/main.js` (header) y `styles/scripts/products.js` (modal, carrito, carrusel, checkout).
- Recomendaciones de carga:
  - Añadir `defer` a scripts para garantizar que el DOM esté listo y mejorar el rendimiento.

## 8. Other Notes
- Idioma y dominio: contenido en español (es-CR). Mantener terminología consistente (Café, Proceso, Tueste, Molienda) y moneda CRC (₡).
- WhatsApp: usar el número `50683910511`. Mantener un único punto de contacto en configuración si se extrae a constante.
- Mapa: reemplazar `LATITUD,LONGITUD` con coordenadas reales en Contacto (Waze/Google Maps).
- Reutilización de layout: si se añade un generador estático/templating en el futuro, extraer header/footer a parciales.
- IDs únicos: asegurar que los IDs de inputs/modales se mantengan únicos por página; evitar colisiones si se agregan más modales.
- Accesibilidad del modal: añadir foco al abrir, cerrar con `Esc`, y `aria-modal="true"` y `role="dialog"`.
- Seguridad: sanitizar/validar campos de formulario (teléfono/email) y manejar inputs vacíos.
- Compatibilidad: probar en navegadores móviles (Safari iOS/Chrome Android) por el uso de drag/swipe y `backdrop-filter`.
- Rendimiento: optimizar imágenes (`assets/`) y usar formatos modernos (WebP/AVIF) cuando sea posible.
