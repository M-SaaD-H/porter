import { defineConfig } from 'vite';
import { resolve } from 'path';

// Content scripts injected via manifest can't be ES modules — needs a single IIFE bundle
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve('src/content.ts'),
      output: {
        entryFileNames: 'content.js',
        format: 'iife',
        name: 'PorterContent',
        inlineDynamicImports: true,
      },
    },
  },
});
