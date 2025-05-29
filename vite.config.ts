import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const buildDate = new Date().toISOString().replace('T', ' ').slice(0, 16)

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
    target: ['last 2 versions'],
  },
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
