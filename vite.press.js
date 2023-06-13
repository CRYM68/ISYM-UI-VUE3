import { fileURLToPath, URL } from 'node:url'
import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from '@vuepress/cli'

export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {
      alias: {
        'components': fileURLToPath(new URL('./docs/.vuepress/components', import.meta.url)),
      }
    },
    vuePluginOptions: {},
  }),
})