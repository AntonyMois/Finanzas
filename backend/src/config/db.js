const { Pool } = require('pg');
require('dotenv').config();

let pool;

function buildConfigFromEnv() {
  const supabaseUrl = process.env.SUPABASE_URL;

  // Host
  let host = process.env.DB_HOST;
  if (!host && supabaseUrl) {
    try {
      const { hostname } = new URL(supabaseUrl);
      // Supabase suele usar db.<host> como hostname de Postgres
      host = `db.${hostname}`;
    } catch {
      // si falla el parseo, no pasa nada, se usará localhost como último recurso
    }
  }

  host = host || 'localhost';

  // Puerto
  const port = Number(process.env.DB_PORT) || 5432;

  // Usuario / base de datos
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const database = process.env.DB_NAME || 'postgres';

  // SSL: por defecto true si usamos Supabase
  let ssl = false;
  if (process.env.DB_SSL === 'true') {
    ssl = { rejectUnauthorized: false };
  } else if (process.env.DB_SSL === undefined && supabaseUrl) {
    ssl = { rejectUnauthorized: false };
  }

  const config = {
    host,
    port,
    user,
    password,
    database,
    ssl,
  };

  console.log('Configuración de conexión a PostgreSQL (sin password):', {
    host: config.host,
    port: config.port,
    database: config.database,
    ssl: !!config.ssl,
  });

  return config;
}

function initDb() {
  if (pool) return Promise.resolve(pool);

  const config = buildConfigFromEnv();

  pool = new Pool(config);

  return pool
    .connect()
    .then((client) => {
      client.release();
      console.log('Conectado a PostgreSQL');
      return pool;
    })
    .catch((err) => {
      console.error('Error de conexión a PostgreSQL:', err);
      throw err;
    });
}

function getDb() {
  if (!pool) {
    throw new Error('La base de datos no está inicializada. Llama a initDb primero.');
  }
  return pool;
}

module.exports = {
  initDb,
  getDb,
};

