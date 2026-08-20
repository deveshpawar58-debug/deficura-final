import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/assess': 'http://127.0.0.1:5000',
      '/history': 'http://127.0.0.1:5000',
      '/report': 'http://127.0.0.1:5000',
      '/nutrients': 'http://127.0.0.1:5000',
      '/health': 'http://127.0.0.1:5000'
    }
  }
})
