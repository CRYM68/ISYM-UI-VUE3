import { defineAsyncComponent } from 'vue'

export default {
  enhance: ({ app }) => {    
      app.component("Schedule-e1", defineAsyncComponent(() => import("E:/MY/IT/project/isym-vue3-ui/docs/components/Schedule/e1.vue")))
  },
}
