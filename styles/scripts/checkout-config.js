/* ==========================================================================
   SAN BERNARDO SPECIALTY COFFEE ESTATE — Configuración del Checkout
   ==========================================================================
   Este archivo centraliza TODA la configuración del sitio.
   ⚠️  NUNCA escribas credenciales del administrador aquí. El panel admin
       valida mediante Google Apps Script (hoja "Credenciales" con hash).
   ========================================================================== */

window.CHECKOUT_CONFIG = {

  /* ------------------------------------------------------------------
   * Google Apps Script (Web App)
   * 1. Abre tu proyecto de Apps Script (Code.gs)
   * 2. Implementar → Nueva implementación → Aplicación web
   * 3. Ejecutar como: Yo · Acceso: Cualquier persona
   * 4. Copia aquí la URL /exec
   * ------------------------------------------------------------------ */
  GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbw7JLfVoAC1hCgQ_ZYJ3sbqQLASI-zSypbOmayZataMBES0mjWOix8mqaBn1U0i0KE5/exec',

  /* ------------------------------------------------------------------
   * SINPE Móvil
   * Número, titular y entidad que aparecen al elegir SINPE Móvil.
   * ------------------------------------------------------------------ */
  SINPE: {
    numero: '8391-0511',                    // Número SINPE (sin +506 en el panel)
    numeroDisplay: '+506 8391-0511',        // Con código de país
    titular: 'NOMBRE DEL TITULAR SINPE',    // ✅ REEMPLAZA con el nombre exacto
    entidad: 'Banco Nacional de Costa Rica' // Entidad bancaria opcional
  },

  /* ------------------------------------------------------------------
   * WhatsApp de la tienda para el botón "Contactar por WhatsApp"
   * ------------------------------------------------------------------ */
  WHATSAPP: {
    numero: '50683910511'                   // Solo dígitos, con código de país
  },

  /* ------------------------------------------------------------------
   * Envío
   * ------------------------------------------------------------------ */
  ENVIO: {
    costo: 3000,                            // ₡3,000 por envío
    gratisDesde: 30000                      // Envío gratis ≥ ₡30,000
  },

  /* ------------------------------------------------------------------
   * Tienda (retiro en tienda)
   * ------------------------------------------------------------------ */
  TIENDA: {
    nombre: 'Tienda El Prado',
    direccion: '200 metros sureste del Recibidor de Coopetarrazú en San Lorenzo, Tienda El Prado, San Lorenzo, Tarrazú, San José, Costa Rica.',
    horario: 'Lun–Vie: 9am–6pm',
    tiempo: 'Normalmente está listo en 24 horas'
  },

  /* ------------------------------------------------------------------
   * Tiempos estimados de preparación (se muestran en la pantalla de éxito)
   * ------------------------------------------------------------------ */
  TIEMPOS: {
    envio:  '2 a 4 días hábiles',
    retiro: '24 horas (listo al día siguiente)'
  },

  /* ------------------------------------------------------------------
   * Panel de administración
   * ------------------------------------------------------------------ */
  ADMIN: {
    sesionHoras: 12,                        // Duración de la sesión (token)
    mensajeBienvenida: 'Bienvenido al panel de administración'
  }
};

