import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const rootNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['lit', 'lit-html', 'lit-element', '@m3e/core'],
    alias: {
      '@yeelight/shared': path.resolve(__dirname, '../shared/index.ts'),
      'lit': path.join(rootNodeModules, 'lit'),
      'lit-html': path.join(rootNodeModules, 'lit-html'),
      'lit-element': path.join(rootNodeModules, 'lit-element'),
      '@m3e/core/layout': path.join(rootNodeModules, '@m3e/core/dist/layout.js'),
      '@m3e/core/bidi': path.join(rootNodeModules, '@m3e/core/dist/bidi.js'),
      '@m3e/core/a11y': path.join(rootNodeModules, '@m3e/core/dist/a11y.js'),
      '@m3e/core/platform': path.join(rootNodeModules, '@m3e/core/dist/platform.js'),
      '@m3e/core/anchoring': path.join(rootNodeModules, '@m3e/core/dist/anchoring.js'),
      '@m3e/core': path.join(rootNodeModules, '@m3e/core/dist/index.js'),
      '@m3e/theme': path.join(rootNodeModules, '@m3e/theme/dist/index.js'),
      '@m3e/card': path.join(rootNodeModules, '@m3e/card/dist/index.js'),
      '@m3e/button': path.join(rootNodeModules, '@m3e/button/dist/index.js'),
      '@m3e/icon': path.join(rootNodeModules, '@m3e/icon/dist/index.js'),
      '@m3e/icon-button': path.join(rootNodeModules, '@m3e/icon-button/dist/index.js'),
      '@m3e/slider': path.join(rootNodeModules, '@m3e/slider/dist/index.js'),
      '@m3e/switch': path.join(rootNodeModules, '@m3e/switch/dist/index.js'),
      '@m3e/segmented-button': path.join(rootNodeModules, '@m3e/segmented-button/dist/index.js'),
      '@m3e/fab': path.join(rootNodeModules, '@m3e/fab/dist/index.js'),
      '@m3e/dialog': path.join(rootNodeModules, '@m3e/dialog/dist/index.js'),
      '@m3e/form-field': path.join(rootNodeModules, '@m3e/form-field/dist/index.js'),
      '@m3e/nav-rail': path.join(rootNodeModules, '@m3e/nav-rail/dist/index.js'),
      '@m3e/nav-bar': path.join(rootNodeModules, '@m3e/nav-bar/dist/index.js'),
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