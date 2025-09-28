// server.js - Backend Express para guardar clientes en PostgreSQL
const express = require('express');
const path = require('path');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir estáticos desde la raíz del proyecto (HTML/CSS/JS)
app.use(express.static(path.join(__dirname)));

// Crear tabla si no existe
async function ensureSchema(){
  const sql = `
  CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    producto VARCHAR(100) NOT NULL,
    fecha TIMESTAMP DEFAULT NOW()
  );`;
  await pool.query(sql);
}

// Endpoint: guardar cliente
app.post('/guardarCliente', async (req, res) => {
  try {
    const { nombre, telefono, correo, producto } = req.body || {};
    if (!nombre || !telefono || !producto){
      return res.status(400).json({ ok:false, message: 'Faltan campos obligatorios (nombre, telefono, producto).' });
    }
    const insert = 'INSERT INTO clientes (nombre, telefono, correo, producto) VALUES ($1, $2, $3, $4) RETURNING id, fecha';
    const values = [nombre, telefono, correo || null, producto];
    const result = await pool.query(insert, values);
    return res.json({ ok:true, id: result.rows[0].id, fecha: result.rows[0].fecha });
  } catch (err) {
    console.error('Error en /guardarCliente:', err);
    return res.status(500).json({ ok:false, message: 'Error interno' });
  }
});

// Endpoint: listar clientes
app.get('/clientes', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, telefono, correo, producto, fecha FROM clientes ORDER BY fecha DESC');
    return res.json({ ok:true, data: result.rows });
  } catch (err) {
    console.error('Error en /clientes:', err);
    return res.status(500).json({ ok:false, message: 'Error interno' });
  }
});

// Start
ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error asegurando el esquema:', err);
    process.exit(1);
  });
