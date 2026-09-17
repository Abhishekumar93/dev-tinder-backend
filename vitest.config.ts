import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Load env vars before any source module is imported
    setupFiles: ['./tests/env.ts'],
    // Run each test file in a fresh process to avoid shared state
    pool: 'forks',
    // Run test files sequentially so they don't race on the in-memory MongoDB
    sequence: {
      shuffle: false,
    },
    // Only look for tests in the tests/ directory
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/app.ts', // bootstraps process signals — not unit-testable
        'src/config/shutdown.ts',
        'src/config/db.ts',
        'src/types/**',
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
});
