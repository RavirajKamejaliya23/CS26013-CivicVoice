import pkg from 'pg';
const { Pool } = pkg;
import { config } from './env.js';

let pool;

if (config.databaseUrl) {
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  pool = new Pool({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool.on('error', (err) => {
  console.error('[DATABASE ERROR] Unexpected idle client error:', err.message);
});

export const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('[DATABASE QUERY ERROR]', {
      query: text.replace(/\s+/g, ' ').trim(),
      error: error.message,
    });
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time');
    client.release();
    return { ok: true, timestamp: result.rows[0].current_time };
  } catch (error) {
    return {
      ok: false,
      error: `Database connection failed: ${error.message}. Please verify your PostgreSQL connection settings in backend/.env.`,
    };
  }
};

export default pool;
