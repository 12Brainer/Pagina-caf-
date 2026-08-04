/* ==========================================================================
   SAN BERNARDO SPECIALTY COFFEE ESTATE — Backend Google Apps Script
   ==========================================================================
   Sistema de pedidos + panel de administración con:
   - Google Sheets como base de datos (hojas: Pedidos, Clientes, Credenciales, Control)
   - Google Drive para almacenar los comprobantes SINPE (carpeta "Comprobantes SINPE")
   - Autenticación del panel admin validada por Apps Script (credenciales con
     hash SHA-256 almacenadas SOLO en la hoja "Credenciales", nunca en el código)
   - Estados automáticos del pedido.

   ────────────────────────────────────────────────────────────────────────
   DEPENDENCIAS DEL PROYECTO DE GOOGLE APPS SCRIPT
   1. Servicios habilitados en "Editor del proyecto → Servicios":
      • DriveApp       (Drive API)
      • SpreadsheetApp (Google Sheets)
      • LockService / PropertiesService (incluidos en Apps Script)
   ────────────────────────────────────────────────────────────────────────
   Publicación (Web App):
   1. Implementar → Nueva implementación → Aplicación web
   2. Ejecutar como: Yo
   3. Quién tiene acceso: Cualquier persona
   4. Copia la URL /exec en styles/scripts/checkout-config.js → GAS_ENDPOINT
   ========================================================================== */

/***************************************************************
 * CONFIGURACIÓN (ajustar antes de publicar)
 ***************************************************************/
const CONFIG = {
  // ID de la hoja de cálculo. Se obtiene de la URL:
  // https://docs.google.com/spreadsheets/d/<AQUI_VA_EL_ID>/edit
  SPREADSHEET_ID: 'REEMPLAZA_CON_TU_SHEET_ID',

  // Clave secreta firmar tokens del panel admin (cámbiala por una larga y aleatoria).
  // ⚠️ Esta clave solo vive en el servidor de Apps Script; nunca en el HTML/JS.
  ADMIN_SECRET: 'SAN_BERNARDO_SECRETO_PANEL_2025',

  // Nombre exacto de la carpeta en Drive para los comprobantes SINPE
  CARPETA_COMPROBANTES: 'Comprobantes SINPE',

  // Hojas del libro
  SHEET_PEDIDOS: 'Pedidos',
  SHEET_CLIENTES: 'Clientes',
  SHEET_CREDENCIALES: 'Credenciales',
  SHEET_CONTROL: 'Control'
};

/* Estados válidos del pedido (orden lógico) */
const ESTADOS = [
  'Pago por verificar',
  'Pago aprobado',
  'Preparando pedido',
  'Enviado',
  'Listo para retirar',
  'Entregado',
  'Cancelado'
];

/* Columnas de la hoja "Pedidos" */
const COL_PEDIDOS = [
  'ID Pedido',
  'Fecha',
  'Nombre',
  'Apellidos',
  'WhatsApp',
  'Correo',
  'Método de entrega',
  'Dirección',
  'Método de pago',
  'Productos (JSON)',
  'Cantidades',
  'Peso seleccionado',
  'Proceso/Molienda',
  'Precio unitario',
  'Subtotal',
  'Envío',
  'Total',
  'Estado',
  'URL comprobante',
  'Nombre comprobante'
];

/* Columnas de la hoja "Clientes" */
const COL_CLIENTES = [
  'Nombre',
  'WhatsApp',
  'Correo',
  'Número de pedidos',
  'Total comprado',
  'Última compra'
];

/* Columnas de la hoja "Credenciales" (¡no exponer nunca al frontend!) */
const COL_CREDENCIALES = [
  'Usuario',
  'PasswordHash',
  'Nombre',
  'Rol',
  'Creado'
];

/***************************************************************
 * UTILIDADES
 ***************************************************************/

/** Respuesta JSON estándar (ContentService no soporta setResponseCode) */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok(data) { return json({ ok: true, data }); }
function fail(msg, code) { return json({ ok: false, message: msg, code: code || 400 }); }

/** Obtiene la hoja por nombre, creándola si no existe con sus encabezados */
function getOrCreateSheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Hash SHA-256 hex */
function sha256(str) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/** HMAC-SHA256 hex (para firmar tokens) */
function hmac(str, key) {
  const sig = Utilities.computeHmacSha256Signature(str, key, Utilities.Charset.UTF_8);
  return sig.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/** Fecha actual formateada en zona horaria local (Costa Rica) */
function fechaCR() {
  return Utilities.formatDate(new Date(), 'America/Costa_Rica', 'dd/MM/yyyy HH:mm:ss');
}

/** Parsea una fecha "dd/MM/yyyy HH:mm:ss" a Date */
function parseFechaCR(str) {
  if (!str) return null;
  const parts = str.split(/[\s/:\-]+/).map(Number); // d, m, y, h, min, s
  if (parts.length < 3) return null;
  const d = new Date(parts[2], parts[1] - 1, parts[0], parts[3] || 0, parts[4] || 0, parts[5] || 0);
  return isNaN(d.getTime()) ? null : d;
}

/** Obtiene la carpeta de comprobantes, creándola si hace falta */
function getCarpetaComprobantes_() {
  const it = DriveApp.getFoldersByName(CONFIG.CARPETA_COMPROBANTES);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(CONFIG.CARPETA_COMPROBANTES);
}

/** Consecutivo del pedido: SB-0001 con bloqueo para evitar duplicados */
function getNextOrderId_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sh = getOrCreateSheet(ss, CONFIG.SHEET_CONTROL, ['Clave', 'Valor']);
    // busca contador actual
    const data = sh.getDataRange().getValues();
    let num = 1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === 'contadorPedidos') {
        num = parseInt(data[i][1], 10) || 1;
        break;
      }
    }
    const id = 'SB-' + String(num).padStart(4, '0');
    // actualiza contador
    let updated = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === 'contadorPedidos') {
        sh.getRange(i + 1, 2).setValue(num + 1);
        updated = true;
        break;
      }
    }
    if (!updated) sh.appendRow(['contadorPedidos', num + 1]);
    return id;
  } finally {
    lock.releaseLock();
  }
}

/** Lee una hoja completa y la devuelve como array de objetos usando la fila 1 de encabezados */
function readSheet_(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = getOrCreateSheet(ss, name, name === CONFIG.SHEET_PEDIDOS ? COL_PEDIDOS : name === CONFIG.SHEET_CLIENTES ? COL_CLIENTES : COL_CREDENCIALES);
  const values = sh.getDataRange().getDisplayValues();
  if (!values.length) return [];
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(c => String(c).trim() === '')) continue; // fila vacía
    const obj = {};
    headers.forEach((h, ci) => obj[h.trim()] = row[ci] || '');
    rows.push(obj);
  }
  return rows;
}

/** Actualiza el estado de un pedido por su ID */
function setEstadoPedido_(orderId, nuevoEstado) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = getOrCreateSheet(ss, CONFIG.SHEET_PEDIDOS, COL_PEDIDOS);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(orderId)) {
      // columna Estado es la 18 (índice 17)
      sh.getRange(i + 1, 18).setValue(nuevoEstado);
      return true;
    }
  }
  return false;
}

/** Valida y decodifica el token del admin */
function validarToken_(token) {
  if (!token) return null;
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const [userB64, expB64, sig] = parts;
    const usuario = Utilities.newBlob(Utilities.base64Decode(userB64)).getDataAsString('UTF-8');
    const exp = parseInt(Utilities.newBlob(Utilities.base64Decode(expB64)).getDataAsString('UTF-8'), 10);
    const expected = hmac(usuario + '|' + exp, CONFIG.ADMIN_SECRET);
    if (expected !== sig) return null;
    if (Date.now() > exp) return null; // expirado
    return usuario;
  } catch (e) {
    return null;
  }
}

/***************************************************************
 * PUNTO DE ENTRADA PRINCIPAL (POST)
 ***************************************************************/
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      // Soporta JSON string o application/x-www-form-urlencoded
      try { data = JSON.parse(e.postData.contents); }
      catch (err) {
        data = Object.fromEntries(new URLSearchParams(e.postData.contents));
      }
    }
    return procesarAccion_(data);
  } catch (err) {
    return fail('Error interno: ' + err.message, 500);
  }
}

/** Punto de entrada GET (sirve para verificar que el web app está vivo) */
function doGet() {
  return json({ ok: true, servicio: 'SAN BERNARDO CHECKOUT API', version: '1.0' });
}

/***************************************************************
 * ENRUTADOR DE ACCIONES
 ***************************************************************/
function procesarAccion_(data) {
  const action = String(data.action || '');

  switch (action) {
    case 'createOrder':
      return crearPedido_(data);
    case 'adminLogin':
      return adminLogin_(data);
    case 'adminCheckToken':
      return adminCheckToken_(data);
    case 'getDashboard':
      return getDashboard_(data);
    case 'getOrders':
      return getOrders_(data);
    case 'getClients':
      return getClients_(data);
    case 'updateOrderStatus':
      return updateOrderStatus_(data);
    case 'getOrder':
      return getOrder_(data);
    default:
      return fail('Acción no soportada: ' + action, 400);
  }
}

/***************************************************************
 * CREAR PEDIDO (checkout público)
 ***************************************************************/
function crearPedido_(data) {
  const [
    idPedido, fechaOK
    ] = (function () {
      return [getNextOrderId_(), fechaCR()];
    })();

  // ---- Comprobante SINPE (opcional según el método de pago)
  let urlComprobante = '';
  let nombreComprobante = '';
  const metodoPago = String(data.metodoPago || '');
  const esSinpe = metodoPago.toLowerCase().includes('sinpe');

  if (esSinpe && data.comprobanteBase64) {
    try {
      const folder = getCarpetaComprobantes_();
      const bytes = Utilities.base64Decode(String(data.comprobanteBase64));
      const nombreArchivo = `${idPedido}_${String(data.comprobanteNombre || 'comprobante').replace(/[^\w.\-]+/g, '_')}`;
      const mime = String(data.comprobanteMime || 'application/pdf');
      const blob = Utilities.newBlob(bytes, mime, nombreArchivo);
      const file = folder.createFile(blob);
      // Intenta compartir con cualquiera que tenga el enlace (para verlo en el panel)
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* sin permiso en la cuenta */ }
      urlComprobante = file.getUrl();
      nombreComprobante = nombreArchivo;
    } catch (err) {
      return fail('No se pudo subir el comprobante a Google Drive: ' + err.message, 500);
    }
  }

  // ---- Normalizar productos / cantidades / pesos / procesos / precios
  const productos = Array.isArray(data.productos) ? data.productos : [];
  const cantidades  = productos.map(p => p.qty).join(', ');
  const pesos       = productos.map(p => p.peso).join(', ');
  const procesos    = productos.map(p => p.proceso).join(', ');
  const preciosU    = productos.map(p => (typeof p.precioUnitario === 'number' ? p.precioUnitario : Number(p.precioUnitario || 0))).join(', ');
  const productosJSON = JSON.stringify(productos);
  const subtotal = Number(data.subtotal || 0);
  const envio    = Number(data.envio || 0);
  const total    = Number(data.total || 0);

  const direccion = String(data.direccion || '');

  // ---- Escribir en la hoja Pedidos
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = getOrCreateSheet(ss, CONFIG.SHEET_PEDIDOS, COL_PEDIDOS);
  sh.appendRow([
    idPedido,
    fechaOK,
    String(data.nombre || '').trim(),
    String(data.apellidos || '').trim(),
    String(data.telefono || '').trim(),
    String(data.correo || '').trim(),
    String(data.entrega || '').trim(),
    direccion,
    metodoPago,
    productosJSON,
    cantidades,
    pesos,
    procesos,
    preciosU,
    subtotal,
    envio,
    total,
    'Pago por verificar',   // Estado inicial automático
    urlComprobante,
    nombreComprobante
  ]);

  // ---- Actualizar / crear cliente (Clientes)
  actualizarCliente_(data, total, fechaOK);

  // ---- Responder con el pedido creado (pantalla de éxito)
  const tiempoEstimado = String(data.entrega || '').toLowerCase().includes('env') ? CONFIG_T('envio') : CONFIG_T('retiro');

  return ok({
    idPedido,
    fecha: fechaOK,
    nombre: data.nombre,
    total,
    estado: 'Pago por verificar',
    tiempoEstimado,
    urlComprobante,
    metodoPago,
    entrega: data.entrega,
    productos: productosJSON
  });
}

function CONFIG_T(key) {
  return key === 'envio' ? '2 a 4 días hábiles' : '24 horas (listo al día siguiente)';
}

/** Registra o actualiza el cliente en la hoja "Clientes" */
function actualizarCliente_(data, total, fechaStr) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = getOrCreateSheet(ss, CONFIG.SHEET_CLIENTES, COL_CLIENTES);
  const dataR = sh.getDataRange().getValues();
  const whatsapp = String(data.telefono || '').trim();

  for (let i = 1; i < dataR.length; i++) {
    if (String(dataR[i][1]).trim() === whatsapp && whatsapp !== '') {
      // Cliente existente → sumar pedido y total, actualizar última compra
      const numPedidos = (parseInt(dataR[i][3], 10) || 0) + 1;
      const totalComprado = (parseFloat(String(dataR[i][4]).replace(/[₡,\s]/g, '')) || 0) + Number(total || 0);
      const nombreNuevo = String(data.nombre || '').trim() + ' ' + String(data.apellidos || '').trim();
      sh.getRange(i + 1, 1).setValue(nombreNuevo || dataR[i][0]);
      sh.getRange(i + 1, 3).setValue(String(data.correo || '').trim() || dataR[i][2]);
      sh.getRange(i + 1, 4).setValue(numPedidos);
      sh.getRange(i + 1, 5).setValue(totalComprado);
      sh.getRange(i + 1, 6).setValue(fechaStr);
      return;
    }
  }
  // Cliente nuevo
  sh.appendRow([
    String(data.nombre || '').trim() + ' ' + String(data.apellidos || '').trim(),
    whatsapp,
    String(data.correo || '').trim(),
    1,
    Number(total || 0),
    fechaStr
  ]);
}

/***************************************************************
 * ADMIN — AUTENTICACIÓN
 ***************************************************************/
function adminLogin_(data) {
  const usuario = String(data.usuario || '').trim();
  const pass = String(data.password || '');
  if (!usuario || !pass) return fail('Ingrese usuario y contraseña', 400);

  const creds = readSheet_(CONFIG.SHEET_CREDENCIALES);
  const found = creds.find(c => String(c['Usuario']).toLowerCase() === usuario.toLowerCase());
  if (!found) return fail('Credenciales inválidas', 401);

  const hashEsperado = String(found['PasswordHash'] || '').trim();
  const hashReal = sha256(pass);
  if (!hashReal || hashReal !== hashEsperado) return fail('Credenciales inválidas', 401);

  // Generar token firmado con expiración
  const exp = Date.now() + (Number(data.sesionHoras || 12) * 60 * 60 * 1000);
  const userB64 = Utilities.base64Encode(Utilities.newBlob(usuario).getBytes());
  const expB64 = Utilities.base64Encode(Utilities.newBlob(String(exp)).getBytes());
  const sig = hmac(usuario + '|' + exp, CONFIG.ADMIN_SECRET);
  const token = [userB64, expB64, sig].join('.');

  return ok({
    token,
    usuario,
    nombre: found['Nombre'],
    rol: found['Rol'],
    expiraEn: new Date(exp).toISOString()
  });
}

function adminCheckToken_(data) {
  const usuario = validarToken_(data.token);
  if (!usuario) return fail('Sesión inválida o expirada', 401);
  return ok({ usuario });
}

/***************************************************************
 * ADMIN — DASHBOARD
 ***************************************************************/
function getDashboard_(data) {
  if (!validarToken_(data.token)) return fail('Sesión inválida o expirada', 401);

  const pedidos = readSheet_(CONFIG.SHEET_PEDIDOS);
  const clientes = readSheet_(CONFIG.SHEET_CLIENTES);
  const now = new Date();

  const numPedidos = (p) => Number(String(p['Fecha'] ? p.Fecha : '').split(' ')[0].split('/')[0]);
  const numMes = (p) => Number(String(p.Fecha || '').split(' ')[0].split('/')[1]);
  const numAnio = (p) => Number(String(p.Fecha || '').split(' ')[0].split('/')[2]);
  const totalPedido = (p) => {
    const n = Number(String(p['Total'] || '').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const hoy = pedidos.filter(p => numAnio(p) === now.getFullYear() && numMes(p) === (now.getMonth() + 1) && numPedidos(p) === now.getDate());
  const mes = pedidos.filter(p => numAnio(p) === now.getFullYear() && numMes(p) === (now.getMonth() + 1));

  const ventasDia = hoy.reduce((sum, p) => sum + totalPedido(p), 0);
  const ventasMes = mes.reduce((sum, p) => sum + totalPedido(p), 0);

  const estado = (p) => String(p['Estado'] || '').trim();
  const pendientes   = pedidos.filter(p => estado(p) === 'Pago por verificar').length;
  const pagados      = pedidos.filter(p => ['Pago aprobado', 'Preparando pedido', 'Enviado', 'Listo para retirar', 'Entregado'].includes(estado(p))).length;
  const entregados   = pedidos.filter(p => estado(p) === 'Entregado').length;
  const cancelados   = pedidos.filter(p => estado(p) === 'Cancelado').length;
  const productosMasVendidos = {};

  pedidos.forEach(p => {
    try {
      const prods = JSON.parse(p['Productos (JSON)'] || '[]');
      prods.forEach(pr => {
        const key = `${pr.nombre || 'Producto'} (${pr.peso || '?'}g · ${pr.proceso || '?'})`;
        productosMasVendidos[key] = (productosMasVendidos[key] || 0) + (Number(pr.qty) || 0);
      });
    } catch (e) { /* JSON inválido */ }
  });

  return ok({
    totalPedidos: pedidos.length,
    ventasDia,
    ventasMes,
    pedidosPendientes: pendientes,
    pedidosPagados: pagados,
    pedidosEntregados: entregados,
    pedidosCancelados: cancelados,
    clientesRegistrados: clientes.length,
    ingresosTotales: pedidos.reduce((s, p) => s + totalPedido(p), 0),
    productosMasVendidos
  });
}

/***************************************************************
 * ADMIN — LISTAR PEDIDOS
 ***************************************************************/
function getOrders_(data) {
  if (!validarToken_(data.token)) return fail('Sesión inválida o expirada', 401);
  const pedidos = readSheet_(CONFIG.SHEET_PEDIDOS);
  // ordenar por fecha descendente (los más recientes primero)
  pedidos.sort((a, b) => {
    const da = parseFechaCR(String(a.Fecha || '')) || new Date(0);
    const db = parseFechaCR(String(b.Fecha || '')) || new Date(0);
    return db - da;
  });
  return ok(pedidos);
}

function getOrder_(data) {
  if (!validarToken_(data.token)) return fail('Sesión inválida o expirada', 401);
  const pedidos = readSheet_(CONFIG.SHEET_PEDIDOS);
  const order = pedidos.find(p => String(p['ID Pedido']).trim() === String(data.id || '').trim());
  if (!order) return fail('Pedido no encontrado', 404);
  return ok(order);
}

/***************************************************************
 * ADMIN — LISTAR CLIENTES
 ***************************************************************/
function getClients_(data) {
  if (!validarToken_(data.token)) return fail('Sesión inválida o expirada', 401);
  return ok(readSheet_(CONFIG.SHEET_CLIENTES));
}

/***************************************************************
 * ADMIN — CAMBIAR ESTADO DEL PEDIDO
 ***************************************************************/
function updateOrderStatus_(data) {
  if (!validarToken_(data.token)) return fail('Sesión inválida o expirada', 401);
  const id = String(data.id || '').trim();
  const nuevoEstado = String(data.estado || '').trim();
  if (!id) return fail('Falta el ID del pedido', 400);
  if (!ESTADOS.includes(nuevoEstado)) return fail('Estado no válido', 400);

  const actualizado = setEstadoPedido_(id, nuevoEstado);
  if (!actualizado) return fail('Pedido no encontrado: ' + id, 404);

  return ok({ id, estado: nuevoEstado, actualizado: true });
}

/* ==========================================================================
   HOJA DE CONFIGURACIÓN DE CREDENCIALES (instrucciones)
   ==========================================================================
   La hoja "Credenciales" debe tener estas columnas (fila 1):
   Usuario | PasswordHash | Nombre | Rol | Creado

   Para insertar el primer administrador:
   1. Crea la hoja con esos encabezados.
   2. Calcula el hash SHA-256 de la contraseña (puedes usar esta función
      una vez con `console.log(sha256('tuContraseña'))` desde el editor o
      cualquier calculadora SHA-256 online).
   3. Añade una fila:
      admin | <hash> | Nombre del Admin | Administrador | <fecha>

   Ejemplo con la contraseña "Admin123!":
   admin | 75b45bf3a653784b758ea76e4a0e67c42907cce0e5c5f92e3a3da2a7a6e0a0a0 | Admin | Administrador | 01/01/2025
   (el hash anterior es ilustrativo — usa el hash real de tu contraseña)
   ========================================================================== */

