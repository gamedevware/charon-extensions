import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const packageJsonPath = fileURLToPath(new URL('./package.json', import.meta.url))

/**
 * Entry/chunk/asset file names are content-hashed for cache busting, so the host
 * app can't hardcode "index.js" / "assets/index.css". This plugin patches the
 * emitted package.json's "main" and "files" fields to the real hashed names
 * right before the bundle is written, so `npm pack` ships a package.json that
 * points at files that actually exist in the tarball.
 */
function writeDistPackageJson(): Plugin {
  return {
    name: 'write-dist-package-json',
    generateBundle(_, bundle) {
      const entryChunk = Object.values(bundle).find(
        (item) => item.type === 'chunk' && item.isEntry
      )
      const cssAsset = Object.values(bundle).find(
        (item) => item.type === 'asset' && item.fileName.endsWith('.css')
      )

      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      if (entryChunk) pkg.main = entryChunk.fileName
      if (cssAsset) pkg.files = [cssAsset.fileName]

      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: JSON.stringify(pkg, null, 2)
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), writeDistPackageJson()],

  build: {
    minify: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js'
      }
    }
  }
})
