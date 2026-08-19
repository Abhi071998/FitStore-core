import 'dotenv/config';
import './utils/bigint.js';
import app from './app.js';
import prisma from './config/prisma.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 4000;

// Connects to the database, then starts the HTTP server.
async function start() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
