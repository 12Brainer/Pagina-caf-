// Multer: subida de comprobantes SINPE (imágenes)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta de subida (desde backend/.env o por defecto backend/uploads)
const UPLOAD_DIR = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');

// Asegurar que la carpeta existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || '.jpg').toLowerCase();
    cb(null, `comprobante-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  return cb(new Error('Formato de archivo no permitido. Usa JPG, PNG, WEBP o PDF.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB máximo
});

module.exports = { upload, UPLOAD_DIR };

