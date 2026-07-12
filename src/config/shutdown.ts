import type { Server } from 'http';
import { disconnectDB } from './db';

export async function gracefulShutdown(
  server: Server | undefined,
  exitCode = 0
): Promise<never> {
  console.log('🛑 Shutting down application...');

  try {
    if (server?.listening) {
      await new Promise<void>((resolve) => {
        server.close((err) => {
          if (err) {
            if ((err as NodeJS.ErrnoException).code !== 'ERR_SERVER_NOT_RUNNING') {
              console.error('❌ Error during shutdown:', err);
            }
          }
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
