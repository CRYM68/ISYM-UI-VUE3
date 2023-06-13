// vuepress^2.0.0
import Components from 'components/index.js'
import { defineClientConfig } from '@vuepress/client'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '../../src/common/date.js'




export default defineClientConfig({
  enhance({ app }) {
    app.use(ElementPlus)
    for(const key in Components){
      app.component(key, Components[key])
    }
  },
})