import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/__tests__/**',
        '**/example.ts',
        '**/AuthAgentButton.tsx',
        '**/react.tsx',
      ],
      include: [
        'src/common/**',
        'src/client/index.ts',
        'src/agent/**',
      ],
      thresholds: {
        lines: 74,
        functions: 70,
        branches: 85,
        statements: 74,
      },
    },
  },
});

