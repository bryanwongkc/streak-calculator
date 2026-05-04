import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('firebase')) return 'firebase'
          if (id.includes('qrcode') || id.includes('jsqr')) return 'qr-tools'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor'
          return 'vendor'
        },
      },
    },
  },
})
