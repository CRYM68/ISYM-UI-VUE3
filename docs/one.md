# Schedule

<Schedule />


|           key           | type             | default value           | des                      |
| :---------------------: | ---------------- | ----------------------- | ------------------------ |
|       tableConfig       | object           | {...}                   | 一个表格配置项集合       |
|  tableConfig.startDate  | Date             | new Date()              | 表格的开始时间           |
|    tableConfig.days     | number           | 7                       | 包含第一天在内的表格天数 |
|  tableConfig.timeRange  | [number, number] | [7, 23]                 | 时间表格范围             |
|   tableConfig.select    | boolean          | true                    | 是否允许生成选择块       |
| tableConfig.selectCover | boolean          | true                    | 允许块之间的相互覆盖     |
|   tableConfig.status    | object           | { status: styleObject } | 一个状态配置项           |
|                         |                  |                         |                          |
|                         |                  |                         |                          |

