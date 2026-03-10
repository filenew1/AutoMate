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
      '/api/proxy': {
        target: 'https://api.fgw.sz.gov.cn:9016',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '/modelgateway/compatible-model/v1'),
      },
      '/api/skills': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/skills/, '/api/skills'),
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
