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

    if (action === 'register') {
      // Espera: nombre, apellido, correo, telefono, direccion, password (hash)
      const sh = getSheet('Usuarios');
      // Asegurar cabecera: Nombre | Apellido | Correo | Teléfono | Dirección | Contraseña (encriptada)
      sh.appendRow([
        data.nombre || '',
        data.apellido || '',
        data.correo || '',
        data.telefono || '',
        data.direccion || '',
        data.password || ''
      ]);
      return jsonResponse({ success: true });
    }

    if (action === 'login') {
      // Espera: correo, password (hash)
      const sh = getSheet('Usuarios');
      const values = sh.getDataRange().getValues();
      if (values.length < 2) return jsonResponse({ success: false, message: 'Usuario no encontrado' });
      const header = values[0];
      const idxCorreo = header.indexOf('Correo');
      const idxNombre = header.indexOf('Nombre');
      const idxApellido = header.indexOf('Apellido');
      const idxTelefono = header.indexOf('Teléfono');
      const idxDireccion = header.indexOf('Dirección');
      const idxPass = header.indexOf('Contraseña (encriptada)');

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[idxCorreo]).trim().toLowerCase() === String(data.correo || '').trim().toLowerCase()) {
          if (String(row[idxPass] || '') === String(data.password || '')) {
            return jsonResponse({
              success: true,
              user: {
                nombre: row[idxNombre] || '',
                apellido: row[idxApellido] || '',
                correo: row[idxCorreo] || '',
                telefono: row[idxTelefono] || '',
                direccion: row[idxDireccion] || ''
              }
            });
          } else {
            return jsonResponse({ success: false, message: 'Contraseña incorrecta' });
          }
        }
      }
      return jsonResponse({ success: false, message: 'Usuario no encontrado' });
    }

    if (action === 'guestpurchase' || action === 'registeredpurchase') {
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
        data.tipoCliente || (action === 'guestpurchase' ? 'Invitado' : 'Registrado')
      ]);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, message: 'Acción no soportada' }, 400);
  } catch (err) {
    return jsonResponse({ success: false, message: String(err) }, 500);
  }
}
