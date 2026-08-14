import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './config/logger.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
