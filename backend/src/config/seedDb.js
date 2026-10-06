import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDb() {
  console.log('[DB SEED] Verifying database connection...');
  const conn = await testConnection();
  if (!conn.ok) {
    console.error('[DB SEED] Could not connect to PostgreSQL:', conn.error);
    process.exit(1);
  }

  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
  console.log('[DB SEED] Reading seed data from:', seedPath);
  const sql = fs.readFileSync(seedPath, 'utf8');

  try {
    console.log('[DB SEED] Populating development seed data...');
    await pool.query(sql);
    console.log('[DB SEED] Seed data populated successfully!');
  } catch (err) {
    console.error('[DB SEED] Error executing seed.sql:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDb();
