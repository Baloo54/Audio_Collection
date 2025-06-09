// --- db/config.js ---
import pkg from 'pg';
import fs from 'fs';

const { Pool } = pkg;

function readSecret(path, fallback = '') {
  try {
    return fs.readFileSync(path, 'utf8').trim();
  } catch {
    return fallback;
  }
}

const pool = new Pool({
  user: readSecret('/run/secrets/db_user'),
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'mydb',
  password: readSecret('/run/secrets/db_password'),
  port: 5432,
});

export default pool;