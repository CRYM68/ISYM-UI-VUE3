import { containerPlugin } from '@vuepress/plugin-container'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { getDirname, path } from '@vuepress/utils'
import { fileURLToPath, URL } from 'node:url'
import { viteBundler } from 'vuepress'
import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from 'vuepress'
import theme from './theme/index.js'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineUserConfig({
  title: 'ISYM-UI',
  description: 'Just playing around',
  
  bundler: viteBundler({
    viteOptions: {
      css: {
        postcss: {
          plugins: [ tailwindcss, autoprefixer ]
        }
      },
      resolve: {
        alias: {
          'dcs': fileURLToPath(new URL('./components', import.meta.url)),
          'components': fileURLToPath(new URL('../../src/components', import.meta.url))
        }
      },  
    },
  }),
  
  plugins: [
    containerPlugin({
      // 配置项
      type: 'tipp',
      validate(params){
        return params.trim().match(/^tipp\s+(.*)$/)
      },
      /**
       * 
       * @param { object[] } tokens 文档处理后的数据
       * @param { number } index 
       * @param {*} options 
       * @param {*} env 
       * @param {*} self 
       * @returns 
       */
      render: (tokens, index, options, env, self) => {
        env.content = `'::: tipp whaha\n' + '我是一个tipp\n' + ':::\n'`;

        // console.log(options);
        // console.log(env);
        // console.log(self);
        if (tokens[index].nesting === 1) {
          // opening tag
          return `
          <div class="custom-container tipp">
        `
        } else {
          // closing tag
          return '</div>\n';
        }
        
      }
    }),
    // 组件注册
    registerComponentsPlugin({
      // components: {
      //   E1: path.resolve(__dirname, './components/Schedule/e1.vue'),
      // },
      componentsDir: path.resolve(__dirname, './components'),
      getComponentName: (filename) => {
        console.log(filename);
        return path.trimExt(filename.replace(/\/|\\/g, '-'))
      }


    }),
    
  ],
  theme: defaultTheme(theme),

  // dev
  open: false
})