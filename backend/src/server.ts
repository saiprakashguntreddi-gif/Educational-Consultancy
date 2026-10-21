import { createApp } from './app';
import { config } from './config/env';
import { logger } from './shared/utils/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(` Superconsciousness Backend API Service`);
  logger.info(` Environment: ${config.env}`);
  logger.info(` Listening on: http://localhost:${config.port}`);
  logger.info(` Health Check: http://localhost:${config.port}/api/health`);
  logger.info(` Module 1 (Profile Intake): /api/v1/profile`);
  logger.info(`=======================================================`);
});

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server gracefully`);
  server.close(() => {
    logger.info('HTTP server closed cleanly');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
