import pool from './database.js';

export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('[MIGRATION] Running additive backward-compatible database migrations...');

    // 1. Add google_id and make password_hash nullable in users
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);
    console.log('✅ users table updated with google_id and nullable password_hash');

    // 2. Create notification_logs table for email delivery auditing and idempotency
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
        recipient_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(150),
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'sent',
        preview_url TEXT,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_issue ON notification_logs(issue_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_event ON notification_logs(event_type);
    `);
    console.log('✅ notification_logs table created');

    console.log('[MIGRATION] All migrations applied successfully without data loss.');
  } catch (err) {
    console.error('[MIGRATION ERROR]', err);
    throw err;
  } finally {
    client.release();
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
