// Ruta de subida de comprobantes SINPE (público, para checkout)
const express = require('express');
const path = require('path');
const { upload } = require('../middleware/upload');

const router = express.Router();

// POST /api/upload/comprobante
router.post('/comprobante', upload.single('comprobante'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No se recibió ningún archivo.' });
    }
    // Ruta accesible públicamente: /uploads/nombre
    const publicUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({ ok: true, url: publicUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Error subiendo comprobante:', err);
    return res.status(400).json({ ok: false, message: err.message || 'Error al subir el archivo.' });
  }
});

// GET /api/upload/test (verificar que la ruta responde)
router.get('/test', (_req, res) => {
  return res.json({ ok: true, message: 'Upload OK' });
});

module.exports = { router, UPLOAD_PUBLIC: '/uploads' };

