<script setup>
import { reactive } from "vue";
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import Schedule from "./components/Schedule/index.vue";
const sheduleAttrs = reactive({
  tableConfig: {
    startDate: new Date(), // 开始日期
    // 结束日期与显示天数有一个就行
    // endDate: "", // 结束日期
    days: 7, // 显示天数
    timeRange: [7, 23], // 时间范围
    select: true,
    // 选择模式下，选择块是否可以覆盖其他类型块
    selectCover: false,
    // 选择块数量限制
    selectNumberRestrict: -1,
    // 状态
    status: {
      1: { background: "linear-gradient(#ff00bb80, #cccccc80)" },
      2: { background: "linear-gradient(#a6ff0080, #cccccc80)" },
      3: { background: "linear-gradient(#006eff80, #cccccc80)" },
    },
  },
  data: [
    {
      content: "语文", // 显示内容
      start: new Date(), // 开始时间
      end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 结束时间
      status: 1,
    },
    {
      content: "生物", // 显示内容
      start: new Date(Date.now() + 16 * 60 * 60 * 1000), // 开始时间
      end: new Date(Date.now() + 18 * 60 * 60 * 1000), // 结束时间
      status: 2,
    },
    {
      content: "生物", // 显示内容
      start: new Date(Date.now() + 13 * 60 * 60 * 1000), // 开始时间
      end: new Date(Date.now() + 17 * 60 * 60 * 1000), // 结束时间
      status: 2,
    },
    {
      content: "元素导论", // 显示内容
      start: new Date(Date.now() + 48 * 60 * 60 * 1000), // 开始时间
      end: new Date(Date.now() + 51 * 60 * 60 * 1000), // 结束时间
      status: 3,
    },
  ],
  selectData: [],
});
</script>

<template>
  <header></header>

  <main>
    <Schedule
      v-bind="sheduleAttrs"
      class="schedule"
      v-model:select-data="sheduleAttrs.selectData"
    />
  </main>
</template>

<style scoped>
.schedule {
  width: 80vw;
  height: 100vh;
}
</style>
