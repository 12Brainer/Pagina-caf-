// db.js - Conexión a PostgreSQL usando pg
// Credenciales de ejemplo proporcionadas
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mi_tienda',
  password: '12345',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Error inesperado en cliente PG inactivo', err);
  process.exit(-1);
});

module.exports = { pool };
