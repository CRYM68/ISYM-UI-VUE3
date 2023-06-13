import './assets/main.css'
import'common/date.js'
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Components from './components/index.js'

const app =createApp(App)
app.use(ElementPlus)
for(const key in Components){
  app.component(key, Components[key])
}
app.mount('#app')