# Schedule
## 表格的基本配置
**使用tableConfig配置表格的基本结构**

<Schedule-e1 />

@[code](./.vuepress/components/Schedule/e1.vue)

## 对选择块进行数据处理
:::tip
使用selectData属性，可以对选择数据进行双向绑定处理。
:::

<Schedule-e2 />

## Attributes
|           key           | type             | default value           | description                      |
| :---------------------: | ---------------- | ----------------------- | ------------------------ |
|       tableConfig       | object           | {...}                   | 一个表格配置项集合       |
|  tableConfig.startDate  | Date             | new Date()              | 表格的开始时间           |
|    tableConfig.days     | number           | 7                       | 包含第一天在内的表格天数 |
|  tableConfig.timeRange  | [number, number] | [7, 23]                 | 时间表格范围             |
|   tableConfig.select    | boolean          | true                    | 是否允许生成选择块       |
| tableConfig.selectCover | boolean          | true                    | 允许块之间的相互覆盖     |
|   tableConfig.status    | object           | { status: styleObject } | 一个状态配置项           |
## Events

| Event name | parameter |      |
| ---------- | --------- | ---- |
|            |           |      |
|            |           |      |
|            |           |      |



## Slots

|           name           | description  |
| :---------------------: | :--------------: |
|              | object           |
|  tableConfig.startDate  | Date             |
|  |  |
|  |  |
|  |  |