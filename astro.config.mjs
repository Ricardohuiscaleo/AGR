import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'static', // Cambiar a static para estructura tradicional
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar React en su propio chunk
            'react-vendor': ['react', 'react-dom'],
            // Separar componentes grandes
            'chat-components': ['./src/components/ChatInterfaceDark.jsx'],
            // Separar utilidades
            'utils': ['./src/utils/']
          }
        }
      },
      chunkSizeWarningLimit: 2000 // Aumentar límite a 2MB para evitar warnings
    }
  }
});