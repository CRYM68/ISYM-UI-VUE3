<script setup>
import { reactive } from "vue";
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import Schedule from "./components/Schedule/index.vue";
const sheduleAttrs = reactive({
  tableConfig: {
    // startDate: new Date(), // 开始日期
    // 结束日期与显示天数有一个就行
    // endDate: "", // 结束日期
    // days: 7, // 显示天数
    // timeRange: [7, 23], // 时间范围
    // select: true,
    // 选择模式下，选择块是否可以覆盖其他类型块
    // selectCover: false,
    // 选择块数量限制
    // selectNumberRestrict: -1,
    // 状态
    // statusConfig: {
    //   1: { background: "linear-gradient(#ff00bb80, #cccccc80)" },
    //   2: { background: "linear-gradient(#a6ff0080, #cccccc80)" },
    //   3: { background: "linear-gradient(#006eff80, #cccccc80)" },
    // },
  },
  // selectData: [],
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
  height: 900px;
}
</style>
