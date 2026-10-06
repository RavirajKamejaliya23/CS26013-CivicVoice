import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  console.log('[DB INIT] Verifying database connection...');
  const conn = await testConnection();
  if (!conn.ok) {
    console.error('[DB INIT] Could not connect to PostgreSQL:', conn.error);
    console.error('[DB INIT] Please ensure PostgreSQL is running and credentials in .env are correct.');
    process.exit(1);
  }

  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  console.log('[DB INIT] Reading schema from:', schemaPath);
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('[DB INIT] Applying database schema...');
    await pool.query(sql);
    console.log('[DB INIT] Database schema created successfully!');
  } catch (err) {
    console.error('[DB INIT] Error executing schema.sql:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
