import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Routes are lazy-loaded in App.jsx, so the remaining split to make by hand
    // is the framework itself: it changes rarely and stays cached between
    // deploys instead of being re-downloaded with every app change.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (/[\\/]node_modules[\\/]react-router/.test(id)) {
            return 'router-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
