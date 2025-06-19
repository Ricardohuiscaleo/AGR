// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({}),
  experimental: {
    session: true,
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  server: {
    port: 4335,
    host: '0.0.0.0',
  },
  vite: {
    optimizeDeps: {
      include: ['framer-motion'],
    },
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
  integrations: [tailwind(), react()],
});
