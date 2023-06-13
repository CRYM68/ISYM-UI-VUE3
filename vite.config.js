import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'common': fileURLToPath(new URL('./src/common', import.meta.url)),
      'docs': fileURLToPath(new URL('./docs', import.meta.url)),
      'dcs': fileURLToPath(new URL('./docs/.vuepress/components', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
    }
  }
})
