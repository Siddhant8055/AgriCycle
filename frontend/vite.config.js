import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // Vite handles plain CSS natively — no PostCSS config needed
    postcss: {
      plugins: [],
    },
  },
  server: {
    port: 5173,
    // Don't overlay build errors that block dev (use browser console instead)
    hmr: {
      overlay: true,
    },
  },
});
