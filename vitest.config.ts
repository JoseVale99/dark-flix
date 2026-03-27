import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core':          resolve(__dirname, 'src/app/core'),
      '@models':        resolve(__dirname, 'src/app/core/models/index.ts'),
      '@api':           resolve(__dirname, 'src/app/core/api'),
      '@services':      resolve(__dirname, 'src/app/core/services'),
      '@interceptors':  resolve(__dirname, 'src/app/core/interceptors'),
      '@shared':        resolve(__dirname, 'src/app/shared'),
      '@features':      resolve(__dirname, 'src/app/features'),
      '@env':           resolve(__dirname, 'src/environments/environment.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    exclude: ['**/node_modules/**', 'src/app/app.spec.ts'],
  },
});
