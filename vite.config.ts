import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const buildDate = new Date().toISOString().replace('T', ' ').slice(0, 16)
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

const resolve = (dir: string): string => {
  return path.resolve(dirname, dir)
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': resolve('./src'),
      pages: resolve('./src/pages'),
      components: resolve('./src/components'),
      plugins: resolve('./src/plugins'),
      router: resolve('./src/router'),
      store: resolve('./src/store'),
      assets: resolve('./src/assets'),
    },
  },

  plugins: [vue(), tailwindcss()],
  build: {
    target: 'es2020',
  },
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
})
