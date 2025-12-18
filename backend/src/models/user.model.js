const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');

const USER_TABLE = 'users';

/**
 * IMPORTANTE (Supabase):
 * La tabla `users` se gestiona desde Supabase. Aquí solo hacemos consultas
 * y actualizaciones, no creamos la tabla.
 *
 * Estructura esperada (resumen):
 * - id SERIAL PRIMARY KEY
 * - email VARCHAR UNIQUE NOT NULL
 * - password_hash VARCHAR NOT NULL
 * - name VARCHAR
 * - role VARCHAR DEFAULT 'user'
 * - two_factor_enabled BOOLEAN DEFAULT false
 * - two_factor_secret TEXT
 * - created_at TIMESTAMPTZ DEFAULT now()
 * - updated_at TIMESTAMPTZ DEFAULT now()
 */

async function createUser({ email, password, name, role = 'user' }) {
  const db = getDb();

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await db.query(
    `INSERT INTO ${USER_TABLE} (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, two_factor_enabled, created_at`,
    [email, passwordHash, name, role]
  );

  return result.rows[0];
}

async function findUserByEmail(email) {
  const db = getDb();

  const result = await db.query(
    `SELECT
       id,
       email,
       password_hash,
       name,
       role,
       two_factor_enabled,
       two_factor_secret,
       created_at,
       updated_at
     FROM ${USER_TABLE}
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const db = getDb();

  const result = await db.query(
    `SELECT
       id,
       email,
       password_hash,
       name,
       role,
       two_factor_enabled,
       two_factor_secret,
       created_at,
       updated_at
     FROM ${USER_TABLE}
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateTwoFactorData(userId, { enabled, secret }) {
  const db = getDb();

  const result = await db.query(
    `UPDATE ${USER_TABLE}
     SET
       two_factor_enabled = $1,
       two_factor_secret = $2,
       updated_at = NOW()
     WHERE id = $3
     RETURNING id, email, name, role, two_factor_enabled, created_at, updated_at`,
    [enabled, secret, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateTwoFactorData,
};

