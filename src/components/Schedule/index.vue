<template>
  <div class="classSchedule">
    <!-- 时间戳 -->
    <div class="timestamp">
      <div class="thead"></div>
      <div class="tbody">
        <text v-for="(item, index) in timestamp" :key="index" class="td">
          <text class="time">{{ item }}</text>
        </text>
      </div>
    </div>
    <!-- 时间戳 END -->
    <!-- 表格 -->
    <div class="table">
      <div class="tl" v-for="(item, tlIndex) of table" :key="tlIndex">
        <div class="thead">
          <text class="th center">{{ item.dayText }}</text>
          <text class="th center">{{ item.days }}日</text>
        </div>
        <div class="tbody" id="tbody" ref="tbody">
          <div
            class="td center"
            v-for="(item, index) in timestamp.length"
            :key="index"
            id="td"
            @click="appendSelectBlock($event, tlIndex)"
          ></div>
          <!-- 块 -->
          <!-- 纯展示 -->

          <div
            v-for="(blockItem, i) in item.block"
            :class="['block', 'class', 'center']"
            :key="i"
            :style="{
              height: blockItem.height + 'px',
              top: blockItem.top + 'px',
              'z-index': 2,
            }"
          >
            <div class="content">
              <div>{{ blockItem.content }}</div>
              <div>
                {{ `(${blockItem.startTimeText} - ${blockItem.endTimeText})` }}
              </div>
            </div>
          </div>

          <!-- 选择块 select -->
          <div
            v-for="(item_1, i) in item.selectBlock || []"
            :class="['select', 'center']"
            :key="i"
            :style="{
              height: item_1.height + 'px',
              top: item_1.top + 'px',
            }"
            @click.stop="target([tlIndex, i])"
            @mousedown.stop="start($event, [tlIndex, i])"
            @mousemove.stop="move($event, tlIndex, i)"
            @mouseup.stop="end"
            @mouseleave="end"
            @longpress="remove(1, tlIndex, i)"
          >
            <!-- 上移箭头 -->
            <div
              class="top_arrow"
              @mousedown.stop="_start"
              @mousemove.stop="top_move($event, tlIndex, i)"
              @mouseup.stop="end"
              @mouseleave="end"
            >
              <div class="arrow"></div>
            </div>

            <!-- v-if="targetIndex[0] === index && targetIndex[1] === i" -->
            <div class="show-time">
              <div class="i">{{ item_1.startTimeText }}</div>
              <div class="icon i">-</div>
              <div class="i">{{ item_1.endTimeText }}</div>
            </div>

            <!-- 下移箭头 -->
            <div
              class="bottom_arrow"
              @mousedown.stop="_start"
              @mousemove="bottom_move($event, tlIndex, i)"
              @mouseup="end"
              @mouseleave="end"
            >
              <div class="arrow"></div>
            </div>
            <!-- v-if="targetIndex[0] === index && targetIndex[1] === i" -->

           
            <!-- v-if="!(targetIndex[0] === index && targetIndex[1] === i)" -->
          </div>

          <!-- 供时间段块 assign -->
          <!-- <div
						v-if="assign"
						v-for="(item_1, index_1) of item.assign"
						:key="index_1"
						:class="['assign', 'center']"
						:style="{
							height: item_1.height + 'px',
							top: item_1.top + 'px'
						}"
						@tap.stop="appendTimeBlock($event, index, index_1)" >
						<div
							class="selected_time center"
							:style="{
								height: item_1.selected_time.height + 'px',
								top: item_1.selected_time.top + 'px'
							}"
							@touchstart="time_start"
							@touchmove.stop="time_move($event, index, index_1)"
							@touchend="end"
							@longpress="remove(2, index, index_1)"
							v-if="item_1.selected_time"
						>
							<div class="top_arrow" @touchstart.stop="_start" @touchmove.stop="time_top_move($event, index, index_1)" @touchend.stop="end">
								<div class="iconfont icon-jiantou"></div>
								<div class="time">{{ item_1.selected_time.startTime }}</div>
							</div>
							已选时间
							<div class="bottom_arrow" @touchstart.stop="_start" @touchmove.stop="time_bottom_move($event, index, index_1)" @touchend.stop="end">
								<div class="iconfont icon-jiantou"></div>
								<div class="time">{{ item_1.selected_time.endTime }}</div>
							</div>
						</div>
					</div> -->
        </div>
      </div>
    </div>
    <!-- 表格 END -->
  </div>
</template>

<script>
// let app = getApp();

// --- 计算项
let tbodyHeight = 0;
let tbody_pageY = 0;

// 1 小时的块高度
let hours_height = 0;

// tbody 高度
let tbody = 0;

// 开始的触摸点位置距离页面顶部高度
let start;
// 鼠标是否按下
let mouseDown = false;

// 代表已有选择块数量 ( 选择块计数器 )
let number = 0;

// 供选择选择快中选择快数量 ( 计数器 )
let assign_number = 0;

// --- 限制项（linmit）

// 距离当前时间多少小时才可以进行预约和时间选择
let within_hours = 0;

// 选择块最小时间（小时）
let min_time = 1;

const Block = function (target, that) {
  console.log(target);
  let height = (start, end) =>
    Math.floor((end - start) / 60000) * (hours_height / 60);

  // 计算以tboby为父元素的top
  let top = function (start) {
    const timeRangeStart = that.tableAttrs.timeRange[0];
    let distanceHours = start.getHours() - timeRangeStart;
    return (distanceHours * 60 + start.getMinutes()) * (hours_height / 60);
  };
  this.courseName = target.content || "无名"; // 课程名称（模块名称)
  this.startTimeDateObject = new Date(target.startTime);
  this.endTimeDateObject = new Date(target.endTime);
  this.startTimeText = this.startTimeDateObject.formatTime("HH:MM");
  this.endTimeText = this.endTimeDateObject.formatTime("HH:MM");
  this.dateText = this.startTimeDateObject.formatTime("YYYY/MM/DD");
  this.top = top(this.startTimeDateObject);
  this.height = height(this.startTimeDateObject, this.endTimeDateObject); // 个体高度
};

class SelectBlock extends Block {
  constructor(target, that, index) {
    super(target, that);
    const { roof, base } = that.computeRootAndBase(this, index)
    this.roof = roof;
    this.base = base;
  }
}

export default {
  props: {
    tableAttrs: {
      default: {
        startDate: new Date(), // 开始日期
        // 结束日期与显示天数有一个就行
        endDate: "", // 结束日期
        days: 9, // 显示天数
        timeRange: [7, 23], // 时间范围
        select: true,
        // 选择模式下，选择块是否可以覆盖其他类型块
        selectCover: false
      },
    },

    color: {
      default: "#000000",
    },

    data: {
      type: Array,
      default: [
        {
          content: "语文", // 显示内容
          startTime: "2023/05/27 09:00", // 开始时间
          endTime: "2023/05/27 12:00", // 结束时间
        },
        {
          content: "语文", // 显示内容
          startTime: "2023/05/27 11:30", // 开始时间
          endTime: "2023/05/27 13:00", // 结束时间
        },
        {
          content: "数学", // 显示内容
          startTime: "2023/05/29 09:30", // 开始时间
          endTime: "2023/05/29 12:40", // 结束时间
        },
        {
          content: "生物", // 显示内容
          startTime: "2023/05/28 13:00", // 开始时间
          endTime: "2023/05/28 14:00", // 结束时间
        },
        {
          content: "地理", // 显示内容
          startTime: "2023/05/30 14:00", // 开始时间
          endTime: "2023/05/30 15:00", // 结束时间
        },
        {
          content: "提瓦特元素类型与相关反应", // 显示内容
          startTime: "2023/05/31 16:00", // 开始时间
          endTime: "2023/05/31 20:00", // 结束时间
        },
      ],
    },

    time: {
      type: String,
      default: null,
    },
    // 课表展示对象的id
    // targetId: {
    // default: uni.getStorageSync('userId')
    // },
    // 课表类型 1 学员 2 教师
    type: {
      type: Number,
      default: 1,
    },

    // 选择模式
    select: {
      type: Boolean,
      default: false,
    },

    // 选择块数量限制
    select_number: {
      type: Number,
      default: -1,
    },

    // 已经存在的选择块
    select_existed: {
      type: Array,
      default: [],
    },

    // 供选择模式
    assign: {
      type: Boolean,
    },

    // 供选时间段数据
    assign_times: {
      type: Array,
      default: [],
    },

    // 供选时间块上选择时间块的数量限制
    assign_number: {
      type: Number,
      default: 1,
    },

    // 预约指定教师状态（开启点击空闲进入预约教师页面功能）
    reservation: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      table: [
        // // 主渲染变量
        // {
        //   day: "27",
        //   date: "27",
        //   // 原来课程
        //   plan: [
        //     {
        //       id: "", // 数据id
        //       courseName: "你好世界", // 课程名称（模块名称）
        //       height: 100, // 个体高度
        //       top: "", // 与顶部距离
        //       state: "", // 是否有老师接单（ 学生与讲师数据结构有差异 ）
        //       status: "", // 状态
        //     },
        //   ],
        //   // 选择块
        //   select: [
        //     // 一个选择块必有参数
        //     {
        //       height: 0,
        //       top: 0,
        //       startTime: "",
        //       endTime: "",
        //     },
        //   ],
        //   // 供选择块
        //   assign: [
        //     // 一个供选择块必有参数
        //     {
        //       // 一个供选择中的选择快必有参数
        //       selected_time: {
        //         top: "",
        //         height: "",
        //         startTime: "",
        //         endTime: "",
        //       },
        //     },
        //   ],
        // },
      ],

      // 关于时间选择的一些参数
      targetIndex: null,

      // 小时高度
      timestampItemHeight: 0,

      // 解决视图不更新问题
      update: false,
    };
  },

  computed: {
    timestamp() {
      const [start, end] = this.tableAttrs.timeRange;
      const stamp = [];
      for (let i = 0; i <= end - start; i++) {
        stamp.push(start + i);
      }
      return stamp;
    },
  },

  methods: {
    _tap(item) {
      if (this.select || this.assign) return; // 选择状态不执行任何操作
      console.log(item);
      let { id, status } = item;
      // 学生表
      if (this.type === 1) {
        // uni.navigateTo({
        // 	url: !status ? `../../pages/task_edit/task_edit?id=${ id }` : `../../pages/course_detail/course_detail?classId=${ id }`
        // });
      }
      // 教师表
      else if (this.type === 2) {
        if (this.reservation) {
          // uni.navigateTo({
          // 	url: '../../pages/task_create/task_create?type=3&teacherId=' + this.targetId
          // })
        } else {
          console.log(status);
          // uni.navigateTo({
          // 	url: !status ? `../../pages/appointment/appointment` : `../../pages/course_detail/course_detail?classId=${ id }`
          // });
        }
      }
    },

    /**
     * 可操作块的计算与操作
     * */

    // 移除可操作的时间块 1 select类型 2 assign类型
    remove(type = 1, index, index_1) {
      uni.showModal({
        title: "是否移除该时间段",
        success: (res) => {
          if (res.confirm) {
            // 1是普通选择块， 2是供选择时间上的选择块
            switch (type) {
              case 1:
                this.seven[index].select.splice(index_1, 1);
                number--;
                break;
              case 2:
                delete this.seven[index].assign[index_1].selected_time;
                assign_number--;
                this.update = !this.update;
                1;
                break;
            }
          }
        },
      });
    },

    // 计算一个时间块的上限下限位置
    computeRootAndBase(block, index) {
      console.log('block', block, index);
      // 上方元素的底部top（元素的最大顶部top，下方元素的顶部top（元素底部最大top）
      let roof = 0, base = tbody;
      if(this.tableAttrs.selectCover) return { roof, base };
      const tl = this.table[index]
      // 总计此tl上的selectblock与block
      let target = tl.block.concat(tl.selectBlock);

      // 块的默认顶部底部位置
      let blockRoof = block.top,
          blockBase = block.top + block.height;
      target.forEach((item) => {
        // 该块的顶部与底部top
        let itemRoof = item.top,
          itemBase = item.top + item.height;
        // 生成块的底部在此块顶部之上
        if (blockBase <= itemRoof && base > itemRoof) base = itemRoof;
        // 生成块的顶部在该块的底部之下
        else if (blockRoof >= itemBase && roof < itemBase) roof = itemBase;
      });

      // 不可选时间段的限制
      // let currentTime = new Date();
      // currentTime.setHours(currentTime.getHours() + within_hours);

      // 上限位置转化为时间对象
      // let roof_Time = new Date(
      //   `${this.seven[index].date} ${this.computeTimeByTop(roof)}`
      // );

      // // 若是在限制时间内
      // if (+currentTime > +roof_Time) {
      //   roof = this.computeTopByTime(+currentTime);
      // }
      return { roof, base };
    },
    
    // 根据时间块时间计算时间块高度
    computeTopByTime(time) {
      // 根据时间计算高度
      let target = new Date(time);
      let hours = target.getHours();
      let minute = target.getMinutes();
      minute = Math.ceil(minute / 10) * 10;

      if (minute === 60) {
        hours += 1;
        minute = 0;
      }
      return (hours_height / 60) * minute + (hours - 8) * hours_height;
    },

    // 根据时间块的top值计算top值所在位置的时间
    computeTimeByTop(top) {
      // 根据top(与tbody的距离)计算时间
      // console.log('top', top);
      const timeRangeStart = this.tableAttrs.timeRange[0];
      const totalMinute = (top * 60) / hours_height; // 总分钟数
      let hours = Math.floor(totalMinute / 60) + timeRangeStart; // 求出小时
      let minute = Math.floor(totalMinute % 60); // 求出分钟
      // minute = Math.ceil(minute / 10) * 10;
      // if (minute === 60) {
      //   (hours += 1), (minute = 0);
      // }
      return (
        (hours < 10 ? "0" + hours : hours) +
        ":" +
        (minute < 10 ? "0" + minute : minute)
      );
    },

    /**
     * select 模式
     * */

    // 添加普通选择块
    appendSelectBlock(event, index) {
      console.log("appendSelectBlock", event, index);
      if (!this.tableAttrs.select) return; // 是否开启选择模式
      let top = event.target.offsetTop; // 点击元素与tbody距离
      const dateText = this.table[index].dateText;
      
      let obj = new SelectBlock(
        {
          startTime: dateText + " " + this.computeTimeByTop(top),
          endTime: dateText + " " + this.computeTimeByTop(hours_height + top),
        },
        this, index
      );
      // let {roof, base} = this.computeRootAndBase()
      this.table[index].selectBlock.push(obj)
      // let currentTime = new Date();
      // currentTime.setHours(currentTime.getHours() + within_hours); // 当前时间的12小时后

      // let targetTime = new Date(
      //   `${this.seven[index].date} ${this.computeTimeByTop(top)}`
      // );
      // if (+currentTime > +targetTime) {
      //   uni.showToast({
      //     title: `请选择距离当前时间${within_hours}小时外的时间`,
      //     icon: "none",
      //     duration: 2500,
      //   });
      //   return;
      // }

      // 选择块的限制区间计算
      // let roof = 0, // 上方元素的底部top（元素的最大顶部top）
      // 	base = tbody; // 下方元素的顶部top（元素底部最大top）
      // let obj = {
      //   height: hours_height,
      //   top: hours_height * hours,
      //   startTime: "",
      //   endTime: "",
      // };

      // target.forEach(item => {
      // 	let item_up = item.top,
      // 		item_down = item.top + item.height;
      // 	// console.log('循环块：' + item_up + ' ' + item_down);
      // 	if (top < item_up && base > item_up) {
      // 		// 再次元素上方(触摸点不可能在元素内，表面被块覆盖了)
      // 		base = item_up;
      // 	} else if (top > item_down && roof < item_down) {
      // 		// 在此元素下方
      // 		roof = item_down;
      // 	}
      // });
      // let { roof, base } = this.computeRootAndBase(
      //   { top: top, height: 0 },
      //   index
      // );
      // if (base - roof < hours_height) {
      //   // 区间小于一小时
      //   uni.showToast({
      //     title: "此区域可用时间不足1小时",
      //     icon: "none",
      //   });
      //   return;
      // }
      // number++; // 选择块数量加一

      // 点击的是不足一小时的格子
      // if (roof > hours * hours_height) {
      //   // 格子上方被部分占用被占用
      //   obj.top += roof - hours * hours_height;
      // } else if (base < (hours + 1) * hours_height) {
      //   // 格子下方被部分占用被占用
      //   obj.top -= (hours + 1) * hours_height - base;
      // }

      // let roof_Time = new Date(
      //   `${this.seven[index].date} ${this.computeTimeByTop(roof)}`
      // );
      // if (+currentTime > +roof_Time) roof = this.computeTopByTime(+currentTime);

      // obj.roof = roof;
      // obj.base = base;
      // obj.startTime = this.computeTimeByTop(obj.top);
      // obj.endTime = this.computeTimeByTop(obj.top + obj.height);
      // this.seven[index].select.push(obj);
      // this.targetIndex = [index, this.seven[index].select.length - 1];
    },

    _start(event) {
      mouseDown = true;
      start = event.pageY;
    },

    // 选择块的下箭头移动
    bottom_move(event, index, i) {
      if (!mouseDown) return;
      let target = this.table[index].selectBlock[i];
      let change = event.pageY - start; // 正增负减
      let height = change + target.height; // height为最终高度
      if (height + target.top > target.base) {
        //	底线越界
        height = target.base - target.top;
      } else if (height <= hours_height) {
        // 改变后是否低于最小高度
        height = hours_height;
      }
      target.endTimeText = this.computeTimeByTop(target.top + height);
      target.height = height;
      start = event.pageY;
    },

    // 选择块的上箭头移动
    top_move(event, index, i) {
      if (!mouseDown) return;
      let target = this.table[index].selectBlock[i];
      let change = start - event.pageY; // 正增负减
      let height = change + target.height;
      let top = target.top - change;
      let limitTop = target.top + target.height - hours_height;
      if (top < target.roof) {
        top = target.roof
        height = target.height + target.top - target.roof;
        console.log('height', height);
      } else if (top > limitTop) top = limitTop;

      if (height <= hours_height) {
        // 高度最小
        height = hours_height;
      }
      target.startTimeText = this.computeTimeByTop(top);
      target.top = top;
      target.height = height;
      start = event.pageY;
    },

    // 切换当前操作的目标选择块（普通）
    target(index) {
      this.targetIndex = index;
    },

    start(event, index) {
      mouseDown = true;
      console.log("start", event, index, mouseDown);
      // 记录开始位置
      start = event.pageY;
      // let result = this.computeRootAndBase(
      //   this.seven[index[0]].select[index[1]],
      //   index[0]
      // );
      // this.seven[index[0]].select[index[1]].roof = result.roof;
      // this.seven[index[0]].select[index[1]].base = result.base;
    },

    move(event, index, i) {
      if (!mouseDown) return;
      // console.log('move', event, index, i);
      let target = this.table[index].selectBlock[i];
      let top = event.pageY - start + target.top; // 移动后，顶部距离tbody距离
      console.log(top, target);
      if (top < target.roof) {
        top = target.roof;
        console.log("top", top);
      } else if (target.base - target.height < top) {
        top = target.base - target.height;
      }
      target.startTimeText = this.computeTimeByTop(top); // 开始时间计算
      target.endTimeText = this.computeTimeByTop(top + target.height); // 结束时间计算
      target.top = top;
      // 更新最新位置
      start = event.pageY;
    },

    end(event) {
      if (!mouseDown) return;
      mouseDown = false;
      console.log("end", event);
      // 停止移动，位置记录清空
      start = 0;
    },

    /**
     * assign 模式
     * */

    // 添加供选择时间块上的选择时间块
    appendTimeBlock(event, index, index_1) {
      // console.log(event);
      if (!this.assign) return;

      // 添加小时块（教师选择学生的预约时间）
      if (this.assign_number <= assign_number) {
        // uni.showToast({
        // 	title: `只能选择${this.assign_number}个时间段`,
        // 	icon: 'none'
        // });
        return;
      }
      const query = uni.createSelectorQuery().in(this);
      //获取#tbody上移高度与触摸点距离页面顶部距离
      query
        .select("#tbody")
        .fields({ rect: true })
        .selectdivport()
        .scrollOffset()
        .exec((res) => {
          // 生成目标的数据列
          let target = this.seven[index].assign[index_1];

          let tbody_pageY = res[0].top + res[1].scrollTop;

          let result = this.computeRootAndBase(
            { top: event.touches[0].pageY - tbody_pageY, height: 0 },
            index
          );

          let roof = 0,
            base = target.height;

          if (roof < result.roof - target.top) roof = result.roof - target.top;
          if (base > result.base - target.top) base = result.base - target.top;

          assign_number++; // 此位置符合条件，可以加一
          let top =
            event.touches[0].pageY -
            tbody_pageY -
            target.top -
            hours_height / 2;
          if (top < roof) {
            top = roof;
          } else if (top + hours_height > base) {
            top = base - hours_height;
          }
          let block = {
            top: top,
            height: hours_height * min_time,
            startTime: this.computeTimeByTop(top + target.top),
            endTime: this.computeTimeByTop(top + hours_height + target.top),
            roof: roof,
            base: base,
          };
          target.selected_time = block;
          this.update = !this.update;
        });
    },

    time_move(event, index, index_1) {
      // 当前目标快
      let target = this.seven[index].assign[index_1].selected_time;

      //
      let top = target.top + event.touches[0].pageY - start;
      if (top < target.roof) {
        top = target.roof;
      } else if (top > target.base - target.height) {
        top = target.base - target.height;
      }
      target.top = top;
      target.startTime = this.computeTimeByTop(
        top + this.seven[index].assign[index_1].top
      );
      target.endTime = this.computeTimeByTop(
        top + target.height + this.seven[index].assign[index_1].top
      );
      this.update = !this.update;
      start = event.touches[0].pageY;
    },

    time_start(event) {
      start = event.touches[0].pageY;
    },

    time_top_move(event, index, index_1) {
      let target = this.seven[index].assign[index_1].selected_time;
      // 该变量
      let change = event.touches[0].pageY - start;
      let top = target.top + change;
      let height = target.height - change;

      // 改变后top超出顶部限制
      if (target.roof > top) {
        top = target.roof;
        height = target.height + target.top - target.roof;
      }
      // 改变后top超出底部限制
      else if (top > target.top + target.height - hours_height * min_time) {
        top = target.top + target.height - hours_height * min_time;
        height = hours_height * min_time;
      }
      target.height = height;
      target.top = top;
      target.startTime = this.computeTimeByTop(
        target.top + this.seven[index].assign[index_1].top
      );
      this.update = !this.update;
      start = event.touches[0].pageY;
    },

    time_bottom_move(event, index, index_1) {
      let target = this.seven[index].assign[index_1].selected_time;
      let change = event.touches[0].pageY - start;
      let height = target.height + change;
      if (target.base < target.top + height) {
        height = target.base - target.top;
      } else if (height < hours_height) {
        height = hours_height;
      }
      target.height = height;
      target.endTime = this.computeTimeByTop(
        target.top + height + this.seven[index].assign[index_1].top
      );
      this.update = !this.update;
      start = event.touches[0].pageY;
    },

    /**
     * 初始化课表等相关操作
     * */

    // 判断块的显示颜色( 学生的预约是绿色，老师的空闲是绿色 )
    showColor(status, userType = 1) {
      if (this.assign || this.select) {
        return "grey";
      } else {
        if (userType === 1) {
          switch (status) {
            case 0:
              return "green";
              break;
            case 1:
            case 2:
              return "blue";
              break;
            case 3:
              return "yellow";
              break;
            case 4:
              return "red";
              break;
            default:
              return "grey";
              break;
          }
        } else if (userType === 2) {
          switch (status) {
            case 0:
              return "green";
              break;
            case 1:
            case 2:
              return "blue";
              break;
            case 3:
              return "yellow";
              break;
            case 4:
              return "red";
              break;
            default:
              return "grey";
              break;
          }
        }
      }
    },

    // 计算块信息（ 不会覆盖原有数据 ）
    computeBlock() {
      console.log("computeBlock", this.data);

      // 计算块高度
      // let height = (start, end) =>
      //   Math.floor((end - start) / 60000) * (hours_height / 60);

      // // 计算以tboby为父元素的top
      // let top = function (start) {
      //   const timeRangeStart = this.tableAttrs.timeRange[0];
      //   let distanceHours = start.getHours() - timeRangeStart;
      //   return (distanceHours * 60 + start.getMinutes()) * (hours_height / 60);
      // };

      // 计算select块
      // if (type === "select") {
      //   let select_block = function (target) {
      //     this.top = top(target.startTime);
      //     this.height = height(target.startTime, target.endTime);
      //     this.startTime = target.startTime.match(/\d{2}:\d{2}$/)[0];
      //     this.endTime = target.endTime.match(/\d{2}:\d{2}$/)[0];
      //   };
      //   data.forEach((item) => {
      //     this.seven.forEach((item_1) => {
      //       if (item_1.date === item.startTime.slice(0, 10)) {
      //         item_1.select.push(new select_block(item));
      //       }
      //     });
      //   });
      // }

      // 计算assign块
      // else if (type === "assign") {
      //   let assign_block = function (target) {
      //     let start = new Date(target.startTime);
      //     this.top =
      //       (((start.getHours() - 8) * 60 + start.getMinutes()) *
      //         hours_height) /
      //       60;
      //     this.height = height(target.startTime, target.endTime);
      //   };
      //   data.forEach((item) => {
      //     this.seven.forEach((item_1) => {
      //       if (item_1.date === item.startTime.slice(0, 10)) {
      //         item_1.assign.push(new assign_block(item));
      //       }
      //     });
      //   });
      // }

      // 计算plan块
      // else {
      // let block = function (target) {
      //   console.log("target", target);
      //   this.courseName = target.content || "无名"; // 课程名称（模块名称)
      //   this.startTimeDateObject = new Date(target.startTime);
      //   this.endTimeDateObject = new Date(target.endTime);
      //   this.startTimeText = this.startTimeDateObject.formatTime("HH:MM");
      //   this.endTimeText = this.endTimeDateObject.formatTime("HH:MM");
      //   this.dateText = this.startTimeDateObject.formatTime("YYYY/MM/DD");
      //   this.top = top(this.startTimeDateObject);
      //   this.height = height(this.startTimeDateObject, this.endTimeDateObject); // 个体高度
      // };

      this.data.forEach((item) => {
        item = Object.assign(item, new Block(item, this));
        this.table.forEach((e) => {
          if (e.dateText === item.dateText) e.block.push(item);
        });
      });
      console.log("data", this.data, this.table);
      // }
    },

    // 刷新课表数据
    refresh(targetId = this.targetId) {
      // 检查登录
      // if( getStorageSync('token') ){
      // 检查结构是否已生成， 防止外部调用刷新报错
      if (this.seven.length !== 7) return;
      console.log("结构生成", this.seven);
      this.tableData.forEach((e) => this.computeBlock(e.block));
      console.log(this.tableData);
      // 先清空原有数据
      // this.seven.forEach( item => item.plan = [] );

      //   if (this.type === 1) {
      // 学生类型
      // 获取七天内所有课程和课程预约
      // getStudentSchedule({
      // 	userId: targetId || uni.getStorageSync('userId'),
      // 	stime: this.seven[ 0 ].date + ' 00:00',
      // 	etime: this.seven[ 6 ].date + ' 23:59'
      // }).then(res => {
      // this.computeStudentData( [] );
      // });
      //   } else if (this.type === 2) {
      // 教师类型
      // getTeacherSchedule({
      // userId: targetId || uni.getStorageSync('userId')
      // }).then(res => {
      // let result = res.data.data || [];
      // // 开启了选择模式或供选模式，要去除掉空闲时间
      // if( this.assign || this.select ){
      // 	result.forEach((item, index) => {
      // 		if ( item.status === 0 ) result.splice(index, 1);
      // 	});
      // }
      // // 块颜色显示处理
      // result.forEach( item => item.showColor = this.showColor( item.status, 2 ) );
      // this.computeBlock( result );
      // });
      // }
      //   }
    },

    // 创建表格基础数据结构
    createBaseConstruction() {
      let { startDate, days, select } = this.tableAttrs;
      if (typeof startDate === "string") startDate = new Date(startDate);
      // 行数据的工厂函数
      const tl = function (date /* date是一个时间对象 */) {
        if (!date) throw new Error();
        this.days = date.getDate();
        this.dateText = date.formatTime("YYYY/MM/DD");
        // 便面后面push数据报错，这里先定义
        this.block = [];
        if(select) this.selectBlock = [];
        // this.assign = [];
        this.dayText = date.getDayText("周");
      };
      this.table.push(new tl(startDate));
      if (days) {
        for (let i = 1; i < days; i++) {
          const date = new Date(startDate.getTime());
          date.setDate(date.getDate() + i);
          this.table.push(new tl(date));
        }
      }
    },

    // 初始化课表
    load(targetId = this.targetId) {
      // 计算七天时间，生成基础架构
      this.createBaseConstruction();
      this.$nextTick(() => {
        hours_height = document.querySelector("#td").offsetHeight;
        tbody = document.querySelector("#tbody").offsetHeight;
        this.computeBlock();
        console.table(hours_height);
      });
    },
  },

  created() {},
  mounted() {
    this.load();
  },
  unmounted() {
    assign_number = 0;
    number = 0;
  },
};
</script>

<style lang="scss">
$BDC: #e8e8e8;

.classSchedule {
  display: flex;
  // height: 994px;
  width: 750px;
  height: 80vh;
  border: 1px solid $BDC;
  border-radius: 10px;
  background-color: #ffffff;
  user-select: none;
  // 时间戳
  .timestamp {
    width: 40px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .thead {
      flex: 1;
    }
    .tbody {
      flex: 13;
      display: flex;
      flex-direction: column;
    }
    .td {
      position: relative;
      flex: 1;
    }
    .time {
      color: #ccc;
      font-size: 20px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  // 时间戳 END

  .table {
    width: calc(100% - 40px);
    height: 80vh;
    overflow: hidden;
    display: flex;
    .tl {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-left: 1px solid $BDC;
      .thead {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-bottom: 1px solid $BDC;
        font-size: 14px;
        text-align: center;
      }
      .tbody {
        flex: 13;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        .td {
          width: 100%;
          flex: 1;
          border-bottom: 1px solid $BDC;
        }

        .block {
          position: absolute;
          left: 0;
          background: linear-gradient(#ff00bb80, #cccccc80);
          user-select: none;
          .content {
            font-size: 14px;
            text-align: center;
            padding: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            // -webkit-line-clamp: 6;
          }
        }

        // 教师学员块
        .class {
          box-sizing: border-box;
          width: 100%;
          border-radius: 6px;
          color: #fff;
          font-size: 20px;
          &.green {
            background-color: #18d78b;
          }
          &.blue {
            background-color: #2bbff8;
          }
          &.yellow {
            background-color: #ffb200;
          }
          &.red {
            background-color: #fa615c;
          }
          &.grey {
            background-color: #cccccc;
          }

          .text {
          }
        }

        // 选择块
        .select {
          position: absolute;
          left: 0;
          z-index: 10;
          width: 100%;
          border-radius: 6px;
          background-color: #2bbff8;
          opacity: 0.7;
          overflow: hidden;
          // color: #fff;
          // font-size: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          .top_arrow,
          .bottom_arrow {
            height: 12px;
            background: #2ffff880;
            text-align: center;
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            .arrow {
              width: 5px;
              height: 5px;
              border: 1px solid #fff;
              transform: rotate(45deg);
              border-right: 0;
              border-bottom: 0;
              // line-height: 12px;
            }
          }
          .bottom_arrow {
            .arrow {
              transform: rotate(225deg);
            }
          }
          // .icon-jiantou {
          //   background-color: rgba(0, 0, 0, 0.1);
          // }
          .show-time {
            flex: 1;
            overflow: hidden;
            margin: 5px 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            .icon {
              line-height: 12px;
              text-align: center;
            }
          }
          // .icon-cuo2 {
          //   position: absolute;
          //   top: -20px;
          //   left: -20px;
          //   z-index: 9;
          //   color: #333333;
          // }
        }

        // 供选择块
        .assign {
          width: 100%;
          border-radius: 6px;
          background-color: #18d78b;
          position: absolute;
          left: 0;
          color: #fff;
          font-size: 20px;

          .selected_time {
            width: 100%;
            position: absolute;
            left: 0;
            background-color: red;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .top_arrow,
            .bottom_arrow {
              width: 100%;
              text-align: center;
              position: relative;
              .time {
                position: absolute;
                left: -50px;
                top: 0;
                color: #333333;
              }
            }
            .bottom_arrow {
              .icon-jiantou {
                transform: rotate(180deg);
              }
            }
            .icon-jiantou {
              background-color: rgba(0, 0, 0, 0.1);
            }
            .show-time {
              margin: 5px 0;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              .icon {
                text-align: center;
              }
            }
            .icon-cuo2 {
              position: absolute;
              top: -20px;
              left: -20px;
              z-index: 9;
              color: #333333;
            }
          }
        }
      }
    }
  }
}
</style>
