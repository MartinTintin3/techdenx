const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
