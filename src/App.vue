<script setup>
import { onMounted, reactive } from "vue";

const data = reactive([
    {start: '2023/06/15 9:00', end: '2023/06/15 14:00'},
    {start: '2023/06/15 18:00', end: '2023/06/15 19:00'},
    {start: '2023/06/18 15:00', end: '2023/06/18 18:00'},
])

console.log(data);
  

</script>

<template>
  <Schedule :data="data" :tableConfig="{ select: true }" style="height: 1000px" />
</template>

<style scoped>

</style>
