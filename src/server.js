import 'dotenv/config';
import dns from 'node:dns';
import './utils/bigint.js';
import app from './app.js';
import prisma from './config/prisma.js';
import logger from './config/logger.js';

// Some hosts (Render included) advertise IPv6 but don't actually route it,
// so Node's default DNS ordering can pick an unreachable AAAA record for
// dual-stack hosts like smtp.gmail.com. Forcing ipv4first here fixes it at
// the process level - more reliable than passing `family: 4` per-connection,
// which nodemailer's transport wasn't honoring.
dns.setDefaultResultOrder('ipv4first');

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
