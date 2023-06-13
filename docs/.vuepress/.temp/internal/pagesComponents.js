import { defineAsyncComponent } from 'vue'

export const pagesComponents = {
  // path: /one.html
  "v-4b4b8c2c": defineAsyncComponent(() => import(/* webpackChunkName: "v-4b4b8c2c" */"E:/MY/It/project/isym-vue3-ui/docs/.vuepress/.temp/pages/one.html.vue")),
  // path: /
  "v-8daa1a0e": defineAsyncComponent(() => import(/* webpackChunkName: "v-8daa1a0e" */"E:/MY/It/project/isym-vue3-ui/docs/.vuepress/.temp/pages/index.html.vue")),
  // path: /404.html
  "v-3706649a": defineAsyncComponent(() => import(/* webpackChunkName: "v-3706649a" */"E:/MY/It/project/isym-vue3-ui/docs/.vuepress/.temp/pages/404.html.vue")),
}
