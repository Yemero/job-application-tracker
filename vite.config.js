import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    open: true,
    port: 5173,      // ← always use this port
    strictPort: true, // ← fail instead of silently picking a different port
  },
})