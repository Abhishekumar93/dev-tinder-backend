/**
 * Sets required environment variables before any test module is imported.
 * This runs before src/config/env.ts loads so CONFIG_VARS doesn't throw.
 */
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '8001';
// MONGO_URI is overridden by mongodb-memory-server at runtime,
// but CONFIG_VARS requires it to be set at import time.
process.env['MONGO_URI'] =
  process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/dev-tinder-test';
process.env['JWT_SECRET'] =
  process.env['JWT_SECRET'] ?? 'test-jwt-secret-at-least-32-characters-long!!';
process.env['JWT_EXPIRES_IN'] = '86400';
process.env['FRONTEND_ORIGIN'] = 'http://localhost:3000';
