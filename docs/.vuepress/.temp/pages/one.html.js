export const data = JSON.parse("{\"key\":\"v-4b4b8c2c\",\"path\":\"/one.html\",\"title\":\"Schedule\",\"lang\":\"en-US\",\"frontmatter\":{},\"excerpt\":\"\",\"headers\":[],\"git\":{\"updatedTime\":1686157029000,\"contributors\":[{\"name\":\"天冷了\",\"email\":\"2312105913@qq.com\",\"commits\":1}]},\"filePathRelative\":\"one.md\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
