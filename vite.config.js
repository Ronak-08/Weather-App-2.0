import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/index.html',
    },
    outDir: 'dist',
  },
});
