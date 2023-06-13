import { defineAsyncComponent } from 'vue'

export default {
  enhance: ({ app }) => {    
      app.component("Schedule-e1", defineAsyncComponent(() => import("E:/MY/It/project/isym-vue3-ui/docs/.vuepress/components/Schedule/e1.vue"))),
      app.component("Schedule-e2", defineAsyncComponent(() => import("E:/MY/It/project/isym-vue3-ui/docs/.vuepress/components/Schedule/e2.vue"))),
      app.component("E1", defineAsyncComponent(() => import("E:/MY/It/project/isym-vue3-ui/docs/.vuepress/components/Schedule/e1.vue")))
  },
}
