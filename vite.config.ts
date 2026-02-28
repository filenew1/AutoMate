import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api/chat/completions': {
        target: 'https://api.fgw.sz.gov.cn:9016',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/modelgateway/compatible-model/v1'),
      },
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['zustand'],
          'ui-vendor': ['lucide-react', 'react-markdown'],
        },
      },
    },
  },
})
