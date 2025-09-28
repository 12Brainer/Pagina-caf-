const SPREADSHEET_ID = 'REEMPLAZA_CON_TU_SHEET_ID'; // <-- Pega aquí el ID de tu Google Sheet

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  return sh;
}

function jsonResponse(obj, code) {
  const out = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  if (code && out.setResponseCode) out.setResponseCode(code);
  return out;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');

    // Compatibilidad simple: { sheet, row }
    if (data.sheet && Array.isArray(data.row)) {
      const sh = getSheet(data.sheet);
      sh.appendRow(data.row);
      return jsonResponse({ success: true, mode: 'sheet-row' });
    }

    const action = (data.action || '').toLowerCase();

    if (action === 'guestpurchase') {
      // Hoja Compras: Nombre | Apellido | Correo | Teléfono | Dirección | Producto(s) | Monto | Fecha | Tipo de cliente
      const sh = getSheet('Compras');
      sh.appendRow([
        data.nombre || '',
        data.apellido || '',
        data.correo || '',
        data.telefono || '',
        data.direccion || '',
        data.productos || '',
        data.total || '',
        data.fecha || new Date().toISOString(),
        'Invitado'
      ]);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, message: 'Acción no soportada' }, 400);
  } catch (err) {
    return jsonResponse({ success: false, message: String(err) }, 500);
  }
}
