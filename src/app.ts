import express, { NextFunction, Request, Response } from 'express';
import { CONFIG_VARS } from './config/env';
import { Server } from 'http';
import { connectDB } from './config/db';
import { gracefulShutdown } from './config/shutdown';
import { authRoutes, userRoutes } from './routes';
import { formatMongooseError } from './utils';
import cookieParser from 'cookie-parser';

const app = express();

const { PORT } = CONFIG_VARS;

let server: Server | undefined;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { status, message } = formatMongooseError(err);
  res.status(status).json({ message });
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
