import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    commonjsOptions: {
      include: [/pdfjs-dist/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.js',
    },
    conditions: ['development', 'browser'],
  },
  optimizeDeps: {
    exclude: ['drizzle-orm', '@neondatabase/serverless'],
  },
});