// vuepress^2.0.0
import Components from '../../src/components/index.js'
import { defineClientConfig } from '@vuepress/client'
import '../../src/common/date.js'
console.log(Components);
export default defineClientConfig({
  enhance({ app }) {
    for(const key in Components){
      console.log(key, Components.key);
      app.component(key, Components[key])
    }
  },
})