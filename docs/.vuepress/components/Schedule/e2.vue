<template>
  <el-row>
    <el-col>
      <Schedule
        v-bind="sheduleAttrs"
        v-model:selectData="sheduleAttrs.selectData"
        style="height: 800px"
      />
    </el-col>
  </el-row>
  <el-row class="mt-4">
    <el-col :span="12" :offset="0"></el-col>
    <el-col :span="12" :offset="0">
      <el-button type="danger" @click="removeFirst">删除首个选择数据</el-button>
    </el-col>
  </el-row>
</template>

<script setup>
import { reactive } from "vue";
const sheduleAttrs = reactive({
  tableConfig: {
    // select: false,
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
const removeFirst = () => {
  console.log(sheduleAttrs.selectData);
  sheduleAttrs.selectData.splice(0, 1)
};
</script>

<style lang="scss" scoped></style>
