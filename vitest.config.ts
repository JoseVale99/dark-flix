import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    // Excluir el spec del scaffold de Angular (usa ng test, no Vitest)
    exclude: ['**/node_modules/**', 'src/app/app.spec.ts'],
  },
});
