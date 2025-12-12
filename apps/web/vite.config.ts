import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@genshin-rotation-sim/sim-core': fileURLToPath(
        new URL('../packages/sim-core/src', import.meta.url)
      ),
    },
  },
});
