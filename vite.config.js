import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const resolve = (dir) => {
  return path.resolve(__dirname, dir)
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

  plugins: [vue()],

  build: {
    target: ['chrome87', 'edge88', 'es2020'],
  },
})
