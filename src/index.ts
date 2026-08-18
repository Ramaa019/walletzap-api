import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { Server } from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json({ limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WalletZap API running' });
});

/**
 * TODO: Add your routes here
 * We will add Auth, Accounts, and Transactions routes here later
 */
// ...

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Server boot ────────────────────────────────────────────────────
let server: Server | undefined;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL (Neon) established.');

    // We will uncomment this when we create the models
    // await sequelize.sync({ alter: false });
    // console.log('Models synchronized with the database.');

    server = app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
      );
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down server...`);
  try {
    if (server) {
      const server_instance = server;
      await new Promise<void>((resolve) => {
        server_instance.close(() => {
          resolve();
        });
      });
      console.log('HTTP server closed.');
    }
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
