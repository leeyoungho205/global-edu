import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 설정 — React 플러그인 사용
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // 개발 서버 실행 시 브라우저 자동 열기
  },
})
