import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import path from 'path'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const resolve = (dir: string) => {
  return path.resolve(dirname, dir)
}

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
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
})
