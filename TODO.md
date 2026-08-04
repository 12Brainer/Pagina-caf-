# ✅ TODO — Rediseño "Finalizar Compra" + Panel Admin con Google Sheets / Apps Script

## Estado: COMPLETO

### Archivos de configuración y backend
- [x] 1. Crear `styles/scripts/checkout-config.js` (configuración central: endpoint GAS, SINPE, WhatsApp, envío, tienda)
- [x] 2. Crear `src/Code.gs` (backend Google Apps Script: pedidos, comprobantes a Drive, clientes, login admin, dashboard, estados)
- [x] 3. Reemplazar `src/Code.js` por stub de compatibilidad (sin duplicar funciones)
- [x] 4. Actualizar `src/appsscript.json` (zona horaria Costa Rica)

### Frontend
- [x] 5. Crear `styles/checkout.css` (estilos premium Shopify: blanco, verde oscuro, dorado, responsive, animaciones)
- [x] 6. Rediseñar `styles/Pedidos.html` (checkout 2 columnas + pantalla de éxito + panel admin oculto)
- [x] 7. Crear `styles/scripts/checkout.js` (toda la lógica: carrito, validación, drag&drop, pago, admin)

### Documentación
- [x] 8. Crear `GUIA_CONFIGURACION.md` (Google Sheet, Web App, carpeta Drive, credenciales, GitHub Pages)

### Verificación
- [x] 9. Estructura de archivos verificada (checkout.css, checkout.js, checkout-config.js, Pedidos.html, Code.gs, GUIA)
- [ ] 10. Probar el flujo completo abriendo `styles/Pedidos.html` (requiere configurar GAS_ENDPOINT y las hojas)
- [ ] 11. Probar login admin y cambio de estados (requiere credenciales en la hoja "Credenciales")
