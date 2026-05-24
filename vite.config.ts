/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { svgIcon } from './vite-plugin-svg-icon';
import { seoPlugin } from './vite-plugin-seo';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgIcon(),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    seoPlugin(),
  ],
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
