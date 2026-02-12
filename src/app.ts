import express from 'express';
import { CONFIG_VARS } from './config/env';
import { Server } from 'http';
import { connectDB } from './config/db';
import { gracefulShutdown } from './config/shutdown';

const app = express();

const { PORT } = CONFIG_VARS;

let server: Server | undefined;

app.use('/admin', (_req, res, next) => {
  const token = 'abc';
  const isAuthenticated = token === 'abc';

  if (!isAuthenticated) {
    res.status(401).json({ message: 'Unauthorized' });
  } else {
    next();
  }
});

app.get('/admin', (_req, res) => {
  res.json({ message: 'Welcome to the admin panel!' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the main application!' });
});

async function bootstrap(): Promise<void> {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  gracefulShutdown(server, 0);
});

process.on('SIGTERM', () => {
  gracefulShutdown(server, 0);
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  gracefulShutdown(server, 1);
});

process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Rejection:', reason);
  gracefulShutdown(server, 1);
});

bootstrap();
