<template><div><h1 id="schedule" tabindex="-1"><a class="header-anchor" href="#schedule" aria-hidden="true">#</a> Schedule</h1>
<Schedule /><table>
<thead>
<tr>
<th style="text-align:center">key</th>
<th>type</th>
<th>default value</th>
<th>des</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:center">tableConfig</td>
<td>object</td>
<td>{...}</td>
<td>一个表格配置项集合</td>
</tr>
<tr>
<td style="text-align:center">tableConfig.startDate</td>
<td>Date</td>
<td>new Date()</td>
<td>表格的开始时间</td>
</tr>
<tr>
<td style="text-align:center">tableConfig.days</td>
<td>number</td>
<td>7</td>
<td>包含第一天在内的表格天数</td>
</tr>
<tr>
<td style="text-align:center">tableConfig.timeRange</td>
<td>[number, number]</td>
<td>[7, 23]</td>
<td>时间表格范围</td>
</tr>
<tr>
<td style="text-align:center">tableConfig.select</td>
<td>boolean</td>
<td>true</td>
<td>是否允许生成选择块</td>
</tr>
<tr>
<td style="text-align:center">tableConfig.selectCover</td>
<td>boolean</td>
<td>true</td>
<td>允许块之间的相互覆盖</td>
</tr>
<tr>
<td style="text-align:center">tableConfig.status</td>
<td>object</td>
<td>{ status: styleObject }</td>
<td>一个状态配置项</td>
</tr>
<tr>
<td style="text-align:center"></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td style="text-align:center"></td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>
</div></template>


