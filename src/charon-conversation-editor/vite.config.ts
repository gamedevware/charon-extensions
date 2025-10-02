import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    minify: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  }
})
