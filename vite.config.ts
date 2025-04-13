/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@styled-system': resolve(__dirname, './styled-system'),
    },
  },
  test: {
    environment: 'happy-dom',
    watch: false,
  },
});
