import { defineConfig } from 'vitest/config';
import { coverage } from './vitest.shared.js';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    setupFiles: ['./test/setup-env.ts'],
    // Test files share one database, so they run one at a time.
    fileParallelism: false,
    coverage: { ...coverage, reportsDirectory: 'coverage/e2e' },
  },
});
