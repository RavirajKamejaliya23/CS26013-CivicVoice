import app from './app.js';
import { config } from './config/env.js';
import { testConnection } from './config/database.js';

const startServer = async () => {
  const PORT = config.port;

  // Verify PostgreSQL connection
  const dbCheck = await testConnection();
  if (dbCheck.ok) {
    console.log(`[DATABASE] Successfully connected to PostgreSQL at ${config.databaseUrl ? 'DATABASE_URL' : `${config.dbHost}:${config.dbPort}/${config.dbName}`}`);
    console.log(`[DATABASE] Server time: ${dbCheck.timestamp}`);
  } else {
    console.warn(`[DATABASE WARNING] Could not reach PostgreSQL: ${dbCheck.error}`);
    console.warn(`[DATABASE WARNING] Ensure PostgreSQL is running and .env has valid credentials.`);
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏛️  CivicVoice Backend API running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📡 Health:   http://localhost:${PORT}/api/health`);
    console.log(`🔒 RBAC:     CITIZEN | MUNICIPAL | ADMIN`);
    console.log(`====================================================`);
  });

  const handleShutdown = () => {
    console.log('[SERVER] Shutting down gracefully...');
    server.close(() => {
      console.log('[SERVER] Closed all active connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
};

startServer();
