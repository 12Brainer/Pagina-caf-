/* ==========================================================================
   SAN BERNARDO SPECIALTY COFFEE ESTATE — Lógica del Checkout y Panel Admin
   ==========================================================================
   Módulos:
     1. Estado global y utilidades
     2. Carrito (localStorage)
     3. Render de resumen y totales
     4. Toggles de entrega / pago + SINPE
     5. Upload del comprobante (drag & drop + selección)
     6. Validación en tiempo real
     7. Crear pedido (Apps Script) + pantalla de éxito
     8. Panel de administración (login, dashboard, pedidos, clientes, modal)
   ========================================================================== */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   1. ESTADO GLOBAL Y CONFIGURACIÓN
   ───────────────────────────────────────────────────────────────────────── */
const C = window.CHECKOUT_CONFIG || {};
const CFG = (key, dft) => (typeof C[key] !== 'undefined' ? C[key] : dft);

const GAS = CFG('GAS_ENDPOINT', '');
const SINPE = CFG('SINPE', { numero: '8391-0511', numeroDisplay: '+506 8391-0511', titular: 'SAN BERNARDO' });
const WHATSAPP = CFG('WHATSAPP', { numero: '50683910511' });
const ENVIO = CFG('ENVIO', { costo: 3000, gratisDesde: 30000 });
const TIENDA = CFG('TIENDA', { nombre: 'Tienda El Prado', tiempo: 'Normalmente listo en 24 horas' });

const ESTADOS_PEDIDO = [
  'Pago por verificar',
  'Pago aprobado',
  'Preparando pedido',
  'Enviado',
  'Listo para retirar',
  'Entregado',
  'Cancelado'
];

const ADMIN_TOKEN_KEY = 'sb_admin_token';
const ADMIN_USER_KEY = 'sb_admin_user';

let state = {
  cart: [],
  entrega: 'retiro',        // 'envio' | 'retiro'
  metodoPago: 'sinpe',       // 'sinpe' | 'efectivo'
  comprobanteFile: null,     // { file, url (objectURL local), size, type }
  pedidoGuardado: null,      // datos del pedido guardado (pantalla de éxito)
  adminAutenticado: false,
  adminUsuario: '',
  orders: [],
  clients: [],
  dashboard: null,
  filter: 'todos',
  search: ''
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CRC = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 });
const fmtM = (n) => CRC.format(Number(n) || 0);

function toast(msg, tipo = '') {
  const el = $('#coToast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'co-toast show ' + (tipo ? 'is-' + tipo : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'co-toast'; }, 3200);
}

function showLoader(on) {
  const l = $('#globalLoader');
  if (l) l.classList.toggle('show', !!on);
}

/* ─────────────────────────────────────────────────────────────────────────
   2. CARRITO (localStorage)
   ───────────────────────────────────────────────────────────────────────── */

/** Carga el carrito desde localStorage (clave 'cart' compatible con products.js) */
function loadCart() {
  try { state.cart = JSON.parse(localStorage.getItem('cart')) || []; }
  catch (e) { state.cart = []; }
  if (!Array.isArray(state.cart)) state.cart = [];
}

function saveCart() {
  try { localStorage.setItem('cart', JSON.stringify(state.cart)); }
  catch (e) { /* sin almacenamiento */ }
}

function cartCount() {
  return state.cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
}

function cartSubtotal() {
  return state.cart.reduce((s, it) => s + (Number(it.subtotal) || (Number(it.qty) * Number(it.price))), 0);
}

function shippingCost() {
  if (state.entrega !== 'envio') return 0;
  const sub = cartSubtotal();
  if (sub > 0 && sub >= ENVIO.gratisDesde) return 0; // Envío gratis
  return ENVIO.costo;
}

function cartTotal() {
  return cartSubtotal() + shippingCost();
}

/* ─────────────────────────────────────────────────────────────────────────
   3. RENDER DEL RESUMEN Y TOTALES
   ───────────────────────────────────────────────────────────────────────── */
function renderResumen() {
  const itemsEl = $('#summaryItems');
  const countEl = $('#summaryCount');
  if (!itemsEl) return;

  // Actualizar badge del carrito en la navegación (si existe)
  const totalItems = cartCount();
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = totalItems;
    b.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });

  if (state.cart.length === 0) {
    itemsEl.innerHTML = '<p style="color:var(--gris-500); font-size:0.85rem; padding:0.8rem 0;">Tu carrito está vacío.</p>';
    countEl.textContent = '0 artículos';
    $('#summarySubtotal').textContent = fmtM(0);
    $('#summaryShipping').textContent = fmtM(0);
    $('#summaryTotal').textContent = fmtM(0);
    return;
  }

  countEl.textContent = totalItems + (totalItems === 1 ? ' artículo' : ' artículos');

  itemsEl.innerHTML = state.cart.map((it, idx) => {
    const img = it.img || '../assets/logo.png';
    const name = it.product || it.productName || 'Café';
    const peso = it.size ? `${it.size}g` : (it.peso || '');
    const proceso = it.grind ? `${it.grind}` : (it.proceso || '');
    const price = Number(it.price) || 0;
    const sub = Number(it.subtotal) || (Number(it.qty) * price);
    return `
      <div class="co-summary__item">
        <img class="co-summary__img" src="${img}" alt="${name}" loading="lazy">
        <div>
          <div class="co-summary__name">${name}</div>
          <div class="co-summary__meta">${it.qty} × ${peso}${peso ? ' · ' : ''}${proceso}</div>
        </div>
        <span class="co-summary__price">${fmtM(sub)}</span>
      </div>`;
  }).join('');

  const sub = cartSubtotal();
  const ship = shippingCost();
  const total = cartTotal();

  $('#summarySubtotal').textContent = fmtM(sub);

  const shipRow = $('#summaryShippingRow');
  if (state.entrega === 'envio') {
    shipRow.style.display = 'flex';
    $('#summaryShipping').textContent = ship === 0 ? 'GRATIS' : fmtM(ship);
    $('#summaryShipping').className = ship === 0 ? 'co-summary__discount' : '';
  } else {
    shipRow.style.display = 'flex';
    $('#summaryShipping').textContent = '—';
  }

  $('#summaryTotal').textContent = fmtM(total);

  // Monto a pagar en SINPE
  const sinpeMonto = $('#sinpeMonto');
  if (sinpeMonto) sinpeMonto.textContent = fmtM(total);

  renderValidity();
}

/* ─────────────────────────────────────────────────────────────────────────
   4. TOGGLES ENTREGA / PAGO + SINPE
   ───────────────────────────────────────────────────────────────────────── */
function initToggles() {
  // Entrega
  $('#entregaEnvio').addEventListener('change', () => {
    state.entrega = 'envio';
    $('#panelEnvio').style.display = 'block';
    $('#panelRetiro').style.display = 'none';
    $('#envioTagLabel').textContent = fmtM(ENVIO.costo);
    renderResumen();
  });
  $('#entregaRecoger').addEventListener('change', () => {
    state.entrega = 'retiro';
    $('#panelEnvio').style.display = 'none';
    $('#panelRetiro').style.display = 'block';
    renderResumen();
  });

  // Pago
  $('#pagoSinpe').addEventListener('change', () => {
    state.metodoPago = 'sinpe';
    $('#panelSinpe').style.display = 'block';
    $('#panelEfectivo').style.display = 'none';
    renderResumen();
  });
  $('#pagoEfectivo').addEventListener('change', () => {
    state.metodoPago = 'efectivo';
    $('#panelSinpe').style.display = 'none';
    $('#panelEfectivo').style.display = 'block';
    renderResumen();
  });

  // Completar datos SINPE desde config
  if ($('#sinpeNumero')) $('#sinpeNumero').textContent = SINPE.numeroDisplay || SINPE.numero;
  if ($('#sinpeTitular')) $('#sinpeTitular').textContent = SINPE.titular || 'SAN BERNARDO';
  if ($('#sinpeReferencia')) $('#sinpeReferencia').textContent = (SINPE.titular || 'SAN BERNARDO').toUpperCase();
}

/* ─────────────────────────────────────────────────────────────────────────
   5. UPLOAD DEL COMPROBANTE (drag & drop + botón)
   ───────────────────────────────────────────────────────────────────────── */
function initUpload() {
  const zone = $('#uploadZone');
  const input = $('#comprobanteInput');
  const row = $('#uploadFileRow');
  const fname = $('#uploadFileName');
  const finfo = $('#uploadFileInfo');
  const ferr = $('#uploadError');
  const removeBtn = $('#removeFile');
  if (!zone || !input) return;

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];

  function valida(file) {
    if (!file) return 'Seleccioná un archivo.';
    if (!ALLOWED.includes(file.type) && !/(\.jpg|\.jpeg|\.png|\.pdf)$/i.test(file.name)) {
      return 'Formato no válido. Usá JPG, PNG o PDF.';
    }
    if (file.size > MAX_SIZE) return 'El archivo supera los 5 MB.';
    return '';
  }

  function setFile(file) {
    state.comprobanteFile = file ? { file, url: URL.createObjectURL(file), size: file.size, name: file.name } : null;
    if (file) {
      row.style.display = 'flex';
      fname.textContent = file.name;
      finfo.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      ferr.style.display = 'none';
      zone.querySelector('.upload-icon').style.color = '#16a34a';
      zone.querySelector('p').innerHTML = '<strong>Comprobante listo</strong> · Hacé clic para cambiar';
    } else {
      row.style.display = 'none';
      zone.querySelector('.upload-icon').style.color = '';
      zone.querySelector('p').innerHTML = '<strong>Arrastrá tu comprobante</strong> aquí o hacé clic para seleccionar';
    }
    renderResumen();
  }

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    const err = valida(file);
    if (err) { toast(err, 'error'); setFile(null); input.value = ''; return; }
    setFile(file);
  });

  // Drag & Drop
  ['dragenter', 'dragover'].forEach(ev => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('is-dragover'); }));
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    const err = valida(file);
    if (err) { toast(err, 'error'); setFile(null); return; }
    setFile(file);
  });

  removeBtn.addEventListener('click', () => { setFile(null); input.value = ''; });

  // Estado obligatorio: si SINPE y no hay comprobante, error visual
  const uploadBlock = $('#uploadBlock');
}

/* ─────────────────────────────────────────────────────────────────────────
   6. VALIDACIÓN EN TIEMPO REAL
   ───────────────────────────────────────────────────────────────────────── */
const FIELDS = [
  { id: 'nombre', msg: 'Ingresa tu nombre' },
  { id: 'apellidos', msg: 'Ingresa tus apellidos' },
  { id: 'telefono', msg: 'Ingresa tu WhatsApp' }
];

function validateField(id) {
  const el = $('#' + id);
  if (!el) return false;
  const wrap = $(`[data-field="${id}"]`);
  const val = (el.value || '').trim();
  let ok = val.length > 0;
  if (id === 'telefono') ok = /^[\d\s+\-]{8,}$/.test(val);
  if (id === 'correo' && val.length > 0) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  if (wrap) {
    wrap.classList.toggle('is-error', !ok && val.length > 0);
    wrap.classList.toggle('is-ok', ok);
    const msg = wrap.querySelector('.field-msg');
    if (msg) msg.textContent = id === 'correo' ? 'Ingresa un correo válido' : '';
  }
  return ok;
}

function validateDelivery() {
  if (state.entrega === 'retiro') return true;
  const req = ['pais', 'provincia', 'ciudad', 'direccion'];
  let ok = true;
  req.forEach(id => {
    const el = $('#' + id);
    if (!el) return;
    const has = (el.value || '').trim().length > 0;
    el.classList.toggle('is-invalid', !has);
    if (!has) ok = false;
  });
  return ok;
}

function validatePago() {
  if (state.metodoPago === 'efectivo') return true;
  return !!state.comprobanteFile;
}

/** Calcula cuántos bloques/reglas están completos (para la barra) */
function completeness() {
  let score = 0;
  const total = 8;
  if (validateField('nombre')) score++;
  if (validateField('apellidos')) score++;
  if (validateField('telefono')) score++;
  if (validateField('correo')) score++;
  if (state.entrega) score++;
  if (validateDelivery()) score++;
  if (state.metodoPago) score++;
  if (validatePago()) score++;
  return { score, total };
}

function renderValidity() {
  const fill = $('#validityFill');
  const count = $('#validityCount');
  if (!fill) return;
  const { score, total } = completeness();
  const pct = Math.round((score / total) * 100);
  fill.style.width = pct + '%';
  count.textContent = `${score} / ${total}`;
}

function initValidation() {
  ['nombre', 'apellidos', 'telefono', 'correo'].forEach(id => {
    const el = $('#' + id);
    if (!el) return;
    el.addEventListener('input', () => { if (el.value.trim()) el.classList.remove('is-invalid'); renderValidity(); });
    el.addEventListener('blur', () => { validateField(id); renderValidity(); });
  });
  ['pais', 'provincia', 'ciudad', 'direccion'].forEach(id => {
    const el = $('#' + id);
    if (!el) return;
    el.addEventListener('input', () => { el.classList.remove('is-invalid'); renderValidity(); });
    el.addEventListener('change', () => { el.classList.remove('is-invalid'); renderValidity(); });
  });
}

function allValid() {
  const c = completeness();
  return c.score >= c.total && state.cart.length > 0;
}

/* ─────────────────────────────────────────────────────────────────────────
   7. CREAR PEDIDO (Apps Script) + PANTALLA DE ÉXITO
   ───────────────────────────────────────────────────────────────────────── */
async function crearPedido() {
  if (!allValid()) {
    toast('Revisá los campos obligatorios (y el comprobante si pagás por SINPE).', 'error');
    // marcar inválidos visualmente
    ['nombre', 'apellidos', 'telefono'].forEach(id => { const el = $('#' + id); if (el && !(el.value||'').trim()) el.classList.add('is-invalid'); });
    return;
  }

  const btn = $('#btnConfirmarPedido');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando pedido...';
  showLoader(true);

  const entregaVal = $('#entregaEnvio').checked ? 'Envío por Correos de Costa Rica' : 'Retiro en tienda';

  const direccion = state.entrega === 'envio'
    ? `${$('#pais').value} | ${$('#provincia').value} | ${$('#ciudad').value} | ${$('#direccion').value.trim()}${$('#codigoPostal').value ? ' | CP: ' + $('#codigoPostal').value : ''}`
    : '';

  const productos = state.cart.map(it => ({
    nombre: it.product || it.productName || 'Café',
    peso: String(it.size || it.peso || ''),
    proceso: String(it.grind || it.proceso || ''),
    qty: Number(it.qty) || 1,
    precioUnitario: Number(it.price) || 0,
    subtotal: Number(it.subtotal) || (Number(it.qty) * Number(it.price))
  }));

  const payload = {
    action: 'createOrder',
    nombre: $('#nombre').value.trim(),
    apellidos: $('#apellidos').value.trim(),
    telefono: $('#telefono').value.trim(),
    correo: $('#correo').value.trim(),
    entrega: entregaVal,
    direccion,
    metodoPago: state.metodoPago === 'sinpe' ? 'SINPE Móvil' : 'Efectivo',
    productos,
    subtotal: cartSubtotal(),
    envio: shippingCost(),
    total: cartTotal(),
    // Si SINPE → adjuntar comprobante en Base64
    comprobanteBase64: state.metodoPago === 'sinpe' && state.comprobanteFile ? await fileToBase64(state.comprobanteFile.file) : '',
    comprobanteNombre: state.comprobanteFile && state.comprobanteFile.file ? state.comprobanteFile.file.name : '',
    comprobanteMime: state.comprobanteFile && state.comprobanteFile.file ? state.comprobanteFile.file.type : ''
  };

  try {
    if (!GAS || GAS.startsWith('REEMPLAZA_')) {
      throw new Error('Configurá GAS_ENDPOINT en checkout-config.js (ver GUIA_CONFIGURACION.md).');
    }
    const res = await fetch(GAS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Error guardando el pedido.');

    // Éxito → vaciar carrito y mostrar pantalla de éxito
    state.pedidoGuardado = data.data;
    state.cart = [];
    saveCart();

    // Textos de la pantalla de éxito
    const entregaTxt = state.pedidoGuardado.entrega || entregaVal;
    $('#successOrderNumber').textContent = state.pedidoGuardado.idPedido;
    $('#successDate').textContent = state.pedidoGuardado.fecha;
    $('#successTotal').textContent = fmtM(state.pedidoGuardado.total);
    $('#successPago').textContent = state.pedidoGuardado.metodoPago;
    $('#successEntrega').textContent = entregaTxt === 'Retiro en tienda' ? 'Retiro en tienda' : 'Envío';
    $('#successEta').innerHTML = '<i class="fa-solid fa-clock"></i> Tiempo estimado: <strong>' + (state.pedidoGuardado.tiempoEstimado || 'pronto') + '</strong>';

    // Cambiar vista
    $('#checkoutView').style.display = 'none';
    $('#successView').style.display = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Pedido guardado correctamente', 'success');
  } catch (err) {
    toast(err.message || 'No se pudo guardar el pedido.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar Pedido';
    showLoader(false);
  }
}

/** Convierte un archivo a base64 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // data:...;base64,....
      const idx = result.indexOf('base64,');
      resolve(idx >= 0 ? result.slice(idx + 7) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Convierte una URL de Google Drive a formato /preview para embeber */
function drivePreviewUrl(url) {
  if (!url) return '';
  const m = url.match(/\/d\/([a-zA-Z0-9\-_]+)/);
  if (m) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
  return url;
}

/** Muestra el resumen del pedido guardado en un modal elegante */
function mostrarResumenPedido() {
  const pedido = state.pedidoGuardado;
  if (!pedido) { toast('No hay un pedido reciente que mostrar.', 'error'); return; }

  let productos = [];
  try { productos = JSON.parse(pedido.productos || '[]'); } catch (e) { productos = []; }

  const productosHTML = productos.length
    ? productos.map(p => `
        <div class="product-line">
          <div>
            <div class="p-name">${p.qty} × ${p.nombre}</div>
            <div class="p-meta">${p.peso ? p.peso + 'g' : ''}${p.peso && p.proceso ? ' · ' : ''}${p.proceso || ''}</div>
          </div>
          <strong>${fmtM(p.subtotal || (p.precioUnitario * p.qty))}</strong>
        </div>`).join('')
    : '<div class="co-notice co-notice--gray">Sin productos registrados.</div>';

  $('#orderModalTitle').textContent = 'Resumen · Pedido ' + pedido.idPedido;
  $('#orderModalBody').innerHTML = `
    <div class="order-detail-grid">
      <div class="d-item full"><span class="k">Número de pedido</span><span class="v" style="font-size:1.3rem; color:var(--verde);">${pedido.idPedido}</span></div>
      <div class="d-item"><span class="k">Fecha</span><span class="v">${pedido.fecha || '—'}</span></div>
      <div class="d-item"><span class="k">Total</span><span class="v">${fmtM(pedido.total)}</span></div>
      <div class="d-item"><span class="k">Método de pago</span><span class="v">${pedido.metodoPago || '—'}</span></div>
      <div class="d-item"><span class="k">Entrega</span><span class="v">${pedido.entrega || '—'}</span></div>
      <div class="d-item full"><span class="k">Estado</span><span class="v">${badgeEstado(pedido.estado || 'Pago por verificar')}</span></div>
    </div>
    <div style="margin-top:1rem;">
      <div class="k" style="font-size:0.7rem; color:var(--gris-500); text-transform:uppercase; letter-spacing:0.03em; margin-bottom:0.4rem;">Productos</div>
      <div class="products-list">${productosHTML}</div>
    </div>`;

  $('#orderModal').classList.add('open');
}

function initSuccessActions() {
  $('#btnVerResumen').addEventListener('click', () => {
    mostrarResumenPedido();
  });

  $('#btnContactarWhatsApp').addEventListener('click', () => {
    const numeroPedido = state.pedidoGuardado ? state.pedidoGuardado.idPedido : '';
    const nombre = state.pedidoGuardado ? (state.pedidoGuardado.nombre || '') : '';
    const total = state.pedidoGuardado ? fmtM(state.pedidoGuardado.total) : '';
    const msg = `Hola, soy ${nombre}. Acabo de hacer el pedido *${numeroPedido}* por un total de *${total}*. Quedo atento/a a la confirmación. ¡Gracias!`;
    const url = `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   8. PANEL DE ADMINISTRACIÓN
   ───────────────────────────────────────────────────────────────────────── */
const Admin = {
  token: '',
  usuario: '',

  abrir() {
    $('#adminPanel').classList.add('open');
    document.body.style.overflow = 'hidden';
    if (this.token) {
      $('#adminLoginView').style.display = 'none';
      $('#adminMainView').style.display = '';
      const name = $('#adminUserName'); if (name) name.innerHTML = '<i class="fa-solid fa-user"></i> ' + this.usuario;
      this.cargarTodo();
    } else {
      $('#adminLoginView').style.display = '';
      $('#adminMainView').style.display = 'none';
    }
    window.scrollTo({ top: 0 });
  },

  cerrar() {
    $('#adminPanel').classList.remove('open');
    document.body.style.overflow = '';
  },

  async login() {
    const usuario = $('#adminUser').value.trim();
    const password = $('#adminPass').value;
    const errBox = $('#adminLoginError');
    errBox.style.display = 'none';
    if (!usuario || !password) { errBox.textContent = 'Ingresá usuario y contraseña.'; errBox.style.display = 'flex'; return; }

    const btn = $('#adminLoginBtn');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
    showLoader(true);
    try {
      const res = await this.gas({ action: 'adminLogin', usuario, password, sesionHoras: 12 });
      if (!res.ok) throw new Error(res.message || 'Credenciales inválidas');
      this.token = res.data.token;
      this.usuario = res.data.usuario || usuario;
      localStorage.setItem(ADMIN_TOKEN_KEY, this.token);
      localStorage.setItem(ADMIN_USER_KEY, this.usuario);
      toast('Bienvenido, ' + this.usuario, 'success');
      this.abrir();
    } catch (err) {
      errBox.textContent = err.message || 'Credenciales inválidas.';
      errBox.style.display = 'flex';
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Ingresar';
      showLoader(false);
    }
  },

  logout() {
    this.token = '';
    this.usuario = '';
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    toast('Sesión cerrada');
    this.cerrar();
  },

  /** Funciona con autenticación de sesión */
  async gas(data) {
    const res = await fetch(GAS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, token: this.token })
    });
    return await res.json();
  },

  async cargarTodo() {
    showLoader(true);
    try {
      const [dash, orders, clients] = await Promise.all([
        this.gas({ action: 'getDashboard' }),
        this.gas({ action: 'getOrders' }),
        this.gas({ action: 'getClients' })
      ]);
      if (!dash.ok) throw new Error(dash.message);
      if (!orders.ok) throw new Error(orders.message);
      if (!clients.ok) throw new Error(clients.message);
      state.dashboard = dash.data;
      state.orders = orders.data;
      state.clients = clients.data;
      this.pintarDashboard();
      this.pintarPedidos();
      this.pintarClientes();
    } catch (err) {
      if (String(err.message || '').toLowerCase().includes('sesión') || String(err.message).toLowerCase().includes('inválida')) {
        toast('Tu sesión expiró. Ingresá de nuevo.', 'error');
        this.token = ''; this.usuario = '';
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        this.abrir();
      } else {
        toast(err.message || 'Error cargando el panel', 'error');
      }
    } finally {
      showLoader(false);
    }
  },

  /* ---------- DASHBOARD ---------- */
  pintarDashboard() {
    const d = state.dashboard || {};
    const kpis = [
      { icon: 'fa-box', color: 'var(--verde)', label: 'Total de pedidos', value: d.totalPedidos || 0 },
      { icon: 'fa-sack-dollar', color: 'var(--dorado)', label: 'Ventas del día', value: fmtM(d.ventasDia) },
      { icon: 'fa-chart-line', color: '#0369a1', label: 'Ventas del mes', value: fmtM(d.ventasMes) },
      { icon: 'fa-hourglass-half', color: '#b91c1c', label: 'Pendientes (por verificar)', value: d.pedidosPendientes || 0 },
      { icon: 'fa-circle-check', color: '#16a34a', label: 'Pagados', value: d.pedidosPagados || 0 },
      { icon: 'fa-truck-ramp-box', color: '#7e22ce', label: 'Entregados', value: d.pedidosEntregados || 0 },
      { icon: 'fa-users', color: '#0d4e36', label: 'Clientes registrados', value: d.clientesRegistrados || 0 },
      { icon: 'fa-wallet', color: '#a8841d', label: 'Ingresos totales', value: fmtM(d.ingresosTotales) }
    ];
    $('#kpiGrid').innerHTML = kpis.map(k => `
      <div class="kpi">
        <div class="kpi__icon" style="background:${k.color}"><i class="fa-solid ${k.icon}"></i></div>
        <div class="kpi__value">${k.value}</div>
        <div class="kpi__label">${k.label}</div>
      </div>`).join('');

    const top = d.productosMasVendidos || {};
    const entries = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $('#topProducts').innerHTML = entries.length
      ? '<div style="display:grid; gap:0.5rem;">' + entries.map(([k, v]) => `
          <div style="display:flex; justify-content:space-between; padding:0.5rem 0.75rem; background:var(--gris-100); border-radius:8px;">
            <span style="font-weight:700;">${k}</span>
            <span style="font-weight:800; color:var(--verde);">${v} uds</span>
          </div>`).join('') + '</div>'
      : '<p style="color:var(--gris-500); font-size:0.85rem;">Sin datos todavía.</p>';
  },

  /* ---------- PEDIDOS ---------- */
  pintarPedidos() {
    const tbody = $('#ordersTableBody');
    let rows = [...state.orders];

    // Filtro por estado
    if (this.filterState && this.filterState !== 'todos') {
      rows = rows.filter(o => String(o['Estado'] || '').trim() === this.filterState);
    }

    // Búsqueda
    const q = state.search.toLowerCase().trim();
    if (q) {
      rows = rows.filter(o => {
        const id = String(o['ID Pedido'] || '').toLowerCase();
        const nom = String((o['Nombre'] || '') + ' ' + (o['Apellidos'] || '')).toLowerCase();
        const wa = String(o['WhatsApp'] || '').toLowerCase();
        return id.includes(q) || nom.includes(q) || wa.includes(q);
      });
    }

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--gris-500);">No hay pedidos.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(o => {
      const estado = String(o['Estado'] || '').trim();
      return `
        <tr>
          <td><strong style="color:var(--verde);">${o['ID Pedido']}</strong></td>
          <td>${o['Nombre'] || ''} ${o['Apellidos'] || ''}</td>
          <td>${o['WhatsApp'] || ''}</td>
          <td>${o['Método de pago'] || ''}</td>
          <td>${o['Método de entrega'] || ''}</td>
          <td><strong>${fmtM(o['Total'])}</strong></td>
          <td>${badgeEstado(estado)}</td>
          <td style="white-space:nowrap;">${o['Fecha'] || ''}</td>
          <td><button type="button" class="btn btn-outline btn-sm" data-ver="${o['ID Pedido']}"><i class="fa-solid fa-eye"></i> Ver</button></td>
        </tr>`;
    }).join('');

    // Delegación de clic en "Ver"
    tbody.querySelectorAll('[data-ver]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ver');
        const order = state.orders.find(x => String(x['ID Pedido']) === String(id));
        if (order) this.mostrarModal(order);
      });
    });
  },

  /** Modal elegante con la info completa del pedido */
  mostrarModal(order) {
    const body = $('#orderModalBody');
    const productos = JSON.parse(order['Productos (JSON)'] || '[]');
    const comprobante = order['URL comprobante'] || '';
    const nombre = `${order['Nombre'] || ''} ${order['Apellidos'] || ''}`.trim();
    const estado = String(order['Estado'] || '').trim();

    // Detectar tipo de archivo (imagen o PDF) → usar /preview de Drive para embeber
    let comprobanteHTML = '';
    if (comprobante) {
      const embed = drivePreviewUrl(comprobante);
      const esPdf = /\.pdf($|\?)/i.test(comprobante);
      const imgThumb = (c) => `<img src="${c}" alt="Comprobante" onerror="this.style.display='none'">`;
      comprobanteHTML = `
        <div class="comprobante-embed">
          ${esPdf
            ? `<iframe src="${embed}" title="Comprobante PDF"></iframe>`
            : imgThumb(embed)}
          <a class="comprobante-link" href="${comprobante}" target="_blank" rel="noopener">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir comprobante
          </a>
        </div>`;
    } else {
      comprobanteHTML = '<div class="co-notice co-notice--gray" style="margin-top:0.5rem;">Sin comprobante (pago en efectivo).</div>';
    }

    const estadoSelect = ESTADOS_PEDIDO.map(es => `<option ${es === estado ? 'selected' : ''}>${es}</option>`).join('');

    $('#orderModalTitle').textContent = 'Pedido ' + (order['ID Pedido'] || '');

    body.innerHTML = `
      <div class="order-detail-grid">
        <div class="d-item"><span class="k">Cliente</span><span class="v">${nombre}</span></div>
        <div class="d-item"><span class="k">WhatsApp</span><span class="v">${order['WhatsApp'] || ''}</span></div>
        <div class="d-item"><span class="k">Correo</span><span class="v">${order['Correo'] || '—'}</span></div>
        <div class="d-item"><span class="k">Fecha</span><span class="v">${order['Fecha'] || ''}</span></div>
        <div class="d-item"><span class="k">Entrega</span><span class="v">${order['Método de entrega'] || ''}</span></div>
        <div class="d-item"><span class="k">Dirección</span><span class="v">${order['Dirección'] || '—'}</span></div>
        <div class="d-item"><span class="k">Método de pago</span><span class="v">${order['Método de pago'] || ''}</span></div>
        <div class="d-item"><span class="k">Total</span><span class="v">${fmtM(order['Total'])}</span></div>
        <div class="d-item full"><span class="k">Estado del pedido</span>
          <div style="display:flex; gap:0.6rem; align-items:center; margin-top:0.3rem;">
            <select id="modalEstadoSelect">${estadoSelect}</select>
            <button type="button" class="btn btn-primary btn-sm" id="modalGuardarEstado"><i class="fa-solid fa-floppy-disk"></i> Actualizar</button>
          </div>
        </div>
      </div>

      <div style="margin-top:1rem;">
        <div class="k" style="font-size:0.7rem; color:var(--gris-500); text-transform:uppercase; letter-spacing:0.03em; margin-bottom:0.4rem;">Productos</div>
        <div class="products-list">
          ${productos.map(p => `
            <div class="product-line">
              <div>
                <div class="p-name">${p.qty} × ${p.nombre}</div>
                <div class="p-meta">${p.peso ? p.peso + 'g' : ''}${p.peso && p.proceso ? ' · ' : ''}${p.proceso || ''}</div>
              </div>
              <strong>${fmtM(p.subtotal || (p.precioUnitario * p.qty))}</strong>
            </div>`).join('') || '<div class="co-notice co-notice--gray">Sin productos registrados.</div>'}
        </div>
      </div>

      <div style="margin-top:1rem;">
        <div class="k" style="font-size:0.7rem; color:var(--gris-500); text-transform:uppercase; letter-spacing:0.03em; margin-bottom:0.4rem;">Comprobante</div>
        ${comprobanteHTML}
      </div>`;

    $('#orderModal').classList.add('open');

    // Acción actualizar estado
    $('#modalGuardarEstado').addEventListener('click', async () => {
      const nuevo = $('#modalEstadoSelect').value;
      const btn = $('#modalGuardarEstado');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
      try {
        const res = await this.gas({ action: 'updateOrderStatus', id: order['ID Pedido'], estado: nuevo });
        if (!res.ok) throw new Error(res.message);
        order['Estado'] = nuevo;
        toast('Estado actualizado: ' + nuevo, 'success');
        this.pintarPedidos();
        this.cargarTodo();
        this.cerrarModal();
      } catch (err) {
        toast(err.message || 'No se pudo actualizar el estado', 'error');
      } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Actualizar';
      }
    });
  },

  cerrarModal() {
    $('#orderModal').classList.remove('open');
  },

  /* ---------- CLIENTES ---------- */
  pintarClientes() {
    const tbody = $('#clientsTableBody');
    let rows = [...state.clients];

    const q = state.clientSearch.toLowerCase().trim();
    if (q) rows = rows.filter(c => String(c['Nombre'] || '').toLowerCase().includes(q) || String(c['WhatsApp'] || '').toLowerCase().includes(q));

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--gris-500);">No hay clientes.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(c => {
      const nombre = String(c['Nombre'] || '');
      const inicial = nombre.charAt(0).toUpperCase() || 'C';
      return `
        <tr>
          <td><span class="client-badge">${inicial}</span> <strong>${nombre}</strong></td>
          <td>${c['WhatsApp'] || ''}</td>
          <td>${c['Correo'] || '—'}</td>
          <td>${c['Número de pedidos'] || 0}</td>
          <td><strong>${fmtM(c['Total comprado'])}</strong></td>
          <td style="white-space:nowrap;">${c['Última compra'] || '—'}</td>
        </tr>`;
    }).join('');
  }
};

/* ---------- Helpers del admin ---------- */
function badgeEstado(estado) {
  const map = {
    'Pago por verificar': 'badge--dorado',
    'Pago aprobado': 'badge--verde',
    'Preparando pedido': 'badge--azul',
    'Enviado': 'badge--morado',
    'Listo para retirar': 'badge--gris',
    'Entregado': 'badge--verde',
    'Cancelado': 'badge--rojo'
  };
  const cls = map[estado] || 'badge--gris';
  return `<span class="badge ${cls}"><i class="fa-solid fa-circle" style="font-size:0.4rem;"></i> ${estado}</span>`;
}

function initAdminEvents() {
  // Abrir panel
  $('#adminBtnOpen').addEventListener('click', () => Admin.abrir());

  // Login
  $('#adminLoginBtn').addEventListener('click', () => Admin.login());
  $('#adminPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') Admin.login(); });
  $('#adminBackBtn').addEventListener('click', () => Admin.cerrar());

  // Logout
  $('#adminLogoutBtn').addEventListener('click', () => Admin.logout());

  // Cerrar modal
  $('#orderModalClose').addEventListener('click', () => Admin.cerrarModal());
  $('#orderModal').addEventListener('click', (e) => { if (e.target === $('#orderModal')) Admin.cerrarModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { Admin.cerrarModal(); } });

  // Tabs del panel
  $$('.admin-sidebar button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.admin-sidebar button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      $$('.admin-content__section').forEach(s => s.classList.remove('active'));
      $('#tab-' + tab).classList.add('active');
    });
  });

  // Filtros de pedidos
  $$('#orderFilterChips .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('#orderFilterChips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      Admin.filterState = chip.getAttribute('data-filter');
      Admin.pintarPedidos();
    });
  });

  // Búsqueda de pedidos
  $('#orderSearch').addEventListener('input', (e) => { state.search = e.target.value; Admin.pintarPedidos(); });
  $('#clientSearch').addEventListener('input', (e) => { state.clientSearch = e.target.value; Admin.pintarClientes(); });
}

/* ─────────────────────────────────────────────────────────────────────────
   INIT GENERAL
   ───────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Restaurar sesión admin
  const tok = localStorage.getItem(ADMIN_TOKEN_KEY);
  const usr = localStorage.getItem(ADMIN_USER_KEY);
  if (tok) { Admin.token = tok; Admin.usuario = usr || 'Admin'; }

  // Cargar carrito
  loadCart();
  if (state.cart.length === 0) {
    // Mostrar aviso de carrito vacío pero mantener la página funcional
  }

  // Init módulos
  initToggles();
  initUpload();
  initValidation();
  initSuccessActions();
  initAdminEvents();

  // Render
  renderResumen();

  // Botón confirmar pedido
  $('#btnConfirmarPedido').addEventListener('click', () => crearPedido());

  // Pequeña animación de entrada
  document.querySelectorAll('.co-card').forEach((c, i) => {
    c.style.animation = `fadeSlideIn 0.4s ease ${i * 0.08}s both`;
  });
});

