import path from 'path';
import { fileURLToPath } from 'url';
import type { Config } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './typing-trainer-web/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./typing-trainer-web/src/test/setup.ts'],
    include: ['typing-trainer-web/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/archive/**',
    ],
    jsdom: {
      container: {
        window: {},
      },
    },
  },
} as Config;
