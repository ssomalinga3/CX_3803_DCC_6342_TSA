import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp();

const server = app.listen(config.port, () => {
  // Operational log only. Per docs/security.md, never log GPS coordinates or
  // credentials; keep startup logging limited to non-sensitive values.
  console.log(`backend listening on port ${config.port} (${config.nodeEnv})`);
});

function shutdown(signal: string): void {
  console.log(`received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
