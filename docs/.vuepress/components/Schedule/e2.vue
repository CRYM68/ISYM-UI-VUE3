<template>
  <Schedule v-bind="sheduleAttrs" ref="sdvm" style="height: 1000px" @sdblclick="remove" />
  <div class="mt-5">
    <!-- <el-button type="danger" @click="updateSelectBlock">修改选择块数据</el-button> -->
    <el-button type="primary" @click="appendSelectBlock">增加选择块数据</el-button>
    <el-button type="danger" @click="removeAll">删除所有</el-button>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
const sheduleAttrs = reactive({
  tableConfig: {
    startDate: "2023/06/13",
    select: true,
  },
  data: [
    {
      content: "语文", // 显示内容
      start: "2023/06/13 13:00", // 开始时间
      end: "2023/06/13 16:00", // 结束时间
      status: 1,
    },
    {
      content: "元素导论 - 2", // 显示内容
      start: new Date("2023/06/16 09:00"), // 开始时间
      end: new Date("2023/06/16 15:00"), // 结束时间
      status: 3,
    },
  ],
  
});


const sdvm = ref(null);

const removeAll = () => {
  sdvm.value.removeSelect(sdvm.value.getSelect());
};
const remove = function (t) {
  t.remove();
};

const appendSelectBlock = function () {
  sdvm.value.createSelect([
    { start: "2023/06/15 9:00", end: "2023/06/15 14:00" },
    { start: "2023/06/15 18:00", end: "2023/06/15 19:00" },
    { start: "2023/06/18 15:00", end: "2023/06/18 18:00" },
  ]);
};
</script>

<style lang="scss" scoped></style>
