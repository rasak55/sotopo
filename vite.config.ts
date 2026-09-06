import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sotopo/',
  server: {
    port: 3000,
    proxy: {
      '/sotopo/backend': {
        target: 'http://localhost',
        changeOrigin: true
      },
      '/backend': {
        target: 'http://localhost/sotopo',
        changeOrigin: true
      }
    }
  }
})
