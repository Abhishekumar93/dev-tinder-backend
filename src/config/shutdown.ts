import type { Server } from 'http';
import { disconnectDB } from './db';

export async function gracefulShutdown(
  server: Server | undefined,
  exitCode = 0
): Promise<never> {
  console.log('🛑 Shutting down application...');

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    await disconnectDB();
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  } finally {
    process.exit(exitCode);
  }
}
