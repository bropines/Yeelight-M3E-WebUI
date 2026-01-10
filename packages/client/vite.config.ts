import { defineConfig } from 'vite';
import path from 'path';

// Хелпер для сокращения путей к корню
const rootNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  resolve: {
    alias: {
      '@yeelight/shared': path.resolve(__dirname, '../shared/index.ts'),

      // --- M3E CORE SUB-MODULES FIX ---
      // Важно: Эти алиасы должны быть ВЫШЕ основного @m3e/core
      '@m3e/core/bidi': path.join(rootNodeModules, '@m3e/core/dist/bidi.js'),
      '@m3e/core/a11y': path.join(rootNodeModules, '@m3e/core/dist/a11y.js'),
      '@m3e/core/platform': path.join(rootNodeModules, '@m3e/core/dist/platform.js'),
      '@m3e/core/anchoring': path.join(rootNodeModules, '@m3e/core/dist/anchoring.js'),

      // --- MAIN ENTRIES ---
      '@m3e/core': path.join(rootNodeModules, '@m3e/core/dist/index.js'),
      '@m3e/theme': path.join(rootNodeModules, '@m3e/theme/dist/index.js'),
      '@m3e/card': path.join(rootNodeModules, '@m3e/card/dist/index.js'),
      '@m3e/button': path.join(rootNodeModules, '@m3e/button/dist/index.js'),
      '@m3e/icon': path.join(rootNodeModules, '@m3e/icon/dist/index.js'),
      '@m3e/slider': path.join(rootNodeModules, '@m3e/slider/dist/index.js'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});