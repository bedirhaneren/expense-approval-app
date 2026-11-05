import type { ViteUserConfig } from 'vitest/config';

/** Coverage settings shared by the unit and e2e configs. */
export const coverage: NonNullable<ViteUserConfig['test']>['coverage'] = {
  provider: 'v8',
  include: ['src/**/*.ts'],
  exclude: ['src/generated/**', 'src/main.ts', 'src/**/*.spec.ts'],
  reporter: ['text-summary', 'text'],
};
