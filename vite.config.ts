import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    // 개발 중 /api 요청은 로컬 API 서버(server/index.js)로 넘긴다.
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.PORT || 3001}`,
        changeOrigin: true
      }
    }
  }
})
