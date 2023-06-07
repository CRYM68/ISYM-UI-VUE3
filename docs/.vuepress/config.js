import { containerPlugin } from '@vuepress/plugin-container'

module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around',
  plugins: [
    containerPlugin({
      // 配置项
      type: 'tipp',
      before:  info => `<div class="custom-container ${type}">${info ? `<p class="custom-container-title">${info}</p>` : ''}\n`,
      locales: {
        '/': {
          defaultInfo: 'TIPP',
        },
        '/zh/': {
          defaultInfo: '提示',
        },
      },
    }),
  ],
}