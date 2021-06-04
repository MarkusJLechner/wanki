import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      pages: resolve(__dirname, '/src/pages'),
      components: resolve(__dirname, '/src/components'),
      plugins: resolve(__dirname, '/src/plugins'),
      router: resolve(__dirname, '/src/router'),
      store: resolve(__dirname, '/src/store'),
      assets: resolve(__dirname, '/src/assets'),
    },
  },

  plugins: [vue()],
})
