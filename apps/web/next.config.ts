import type { NextConfig } from 'next';

/**
 * Every page is per-user and must show the latest approval status, so pages
 * render on each request. Cache Components is left off on purpose.
 */
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
