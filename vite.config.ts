import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this build configuration
  build: {
    target: 'esnext' // This allows the use of modern JavaScript features like BigInt
  },
  // And this configuration for the dev server
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext' // Match the build target
    }
  }
});
