<script setup>
import { reactive } from "vue";
const sheduleAttrs = reactive({
  tableConfig: {
    startDate: new Date(), // 开始日期
    // 结束日期与显示天数有一个就行
    // endDate: "", // 结束日期
    days: 7, // 显示天数
    timeRange: [7, 23], // 时间范围
    select: false,
    // 选择模式下，选择块是否可以覆盖其他类型块
    selectCover: false,
    // 选择块数量限制
    // 状态
    statusConfig: {
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
      start: new Date(Date.now() + 19 * 60 * 60 * 1000), // 开始时间
      end: new Date(Date.now() + 21 * 60 * 60 * 1000), // 结束时间
      status: 2,
    },
    {
      content: "元素导论 - 1", // 显示内容
      start: new Date(Date.now() + 48 * 60 * 60 * 1000), // 开始时间
      end: new Date(Date.now() + 51 * 60 * 60 * 1000), // 结束时间
    },
    {
      content: "元素导论 - 2", // 显示内容
      start: new Date(Date.now() + 60 * 60 * 60 * 1000), // 开始时间
      end: new Date(Date.now() + 63 * 60 * 60 * 1000), // 结束时间
      status: 3,
    },
  ],
  selectData: [],
});
</script>

<template>
  <el-row class="mb-5">
    <el-col>
      <Schedule
        v-bind="sheduleAttrs"
        class="schedule"
        v-model:select-data="sheduleAttrs.selectData"
      />
    </el-col>
  </el-row>
  <el-row class="mt-5">
    <el-col :span="10">
      <span>开始日期：</span>
      <el-date-picker
        v-model="sheduleAttrs.tableConfig.startDate"
        type="date"
        placeholder="Pick a day"
      />
    </el-col>

    <el-col :span="10" >
      <span>天数：</span>
      <el-select v-model="sheduleAttrs.tableConfig.days" placeholder="Select">
        <el-option
          v-for="item in 100"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-col>
  </el-row>
  <el-row class="mt-5">
    <el-col :span="10" :offset="0">
      <span>选择模式：</span>
      <el-switch v-model="sheduleAttrs.tableConfig.select" />
    </el-col>
    <el-col :span="10" :offset="0">
      <span>覆盖：</span>
      <el-switch v-model="sheduleAttrs.tableConfig.selectCover" />
    </el-col>
  </el-row>
  <el-row class="mt-5">
    <el-col :span="10">
      <span>时间范围：</span>
      <el-select
        v-model="sheduleAttrs.tableConfig.timeRange[0]"
        placeholder="Select"
      >
        <el-option
          v-for="item in 24"
          :key="item"
          :label="item - 1"
          :value="item - 1"
        />
      </el-select>
    </el-col>
    <el-col :span="1" :offset="0"> - </el-col>
  
    <el-col :span="10" :offset="0">
      <el-select
        v-model="sheduleAttrs.tableConfig.timeRange[1]"
        placeholder="Select"
      >
        <el-option
          v-for="item in 24 - sheduleAttrs.tableConfig.timeRange[0]"
          :key="item"
          :label="sheduleAttrs.tableConfig.timeRange[0] + item"
          :value="sheduleAttrs.tableConfig.timeRange[0] + item"
        /> </el-select
    ></el-col>
  </el-row>
</template>
<style scoped>
.schedule {
  height: 800px;
}
</style>
