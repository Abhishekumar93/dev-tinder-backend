import type { Server } from 'http';
import { disconnectDB } from './db';

export async function gracefulShutdown(
  server: Server | undefined,
  exitCode = 0
): Promise<never> {
  console.log('🛑 Shutting down application...');

  // Force exit after 2 seconds if graceful shutdown hangs (e.g. database disconnect hangs)
  setTimeout(() => {
    console.error('⚠️ Graceful shutdown timed out, forcing exit.');
    process.exit(exitCode);
  }, 2000).unref();

  try {
    if (server?.listening) {
      // Immediately destroy active/idle connections to prevent hanging (especially with HTTP Keep-Alive)
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      
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
