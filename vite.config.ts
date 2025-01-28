import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/controle_financeiro/',
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
})
