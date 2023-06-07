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
    <div
      class="table"
      @mousemove.stop="selectBlockMoveType"
      @mouseup.stop="end"
      @mouseleave="end"
    >
      <div class="tl" v-for="(item, tlIndex) of table" :key="tlIndex">
        <slot name="thead">
          <div class="thead">
            <text class="th center">{{ item.dayText }}</text>
            <text class="th center">{{ item.days }}日</text>
          </div>
        </slot>
        <div class="tbody" id="tbody">
          <div
            class="td center"
            v-for="(item, index) in timestamp.length"
            :key="index"
            id="td"
            @click="appendSelectBlock($event, tlIndex, index)"
          ></div>
          <!-- 块 -->
          <!-- 纯展示 -->

          <div
            v-for="(b, i) in item.block"
            :class="['block', 'class', 'center']"
            :key="i"
            :style="
              Object.assign(
                {
                  height: b.height + 'px',
                  top: b.top + 'px',
                },
                tableAttrs.statusConfig[b.status]
              )
            "
          >
            <slot name="block-content">
              <div class="content">
                <div>{{ b.content }}</div>
                <div>
                  {{ `(${b.startTimeText} - ${b.endTimeText})` }}
                </div>
              </div>
            </slot>
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
            @dblclick="removeSelectBlock(tlIndex, i)"
            @mousedown.stop="start($event, item_1, tlIndex, 'block')"
            @longpress="remove(1, tlIndex, i)"
          >
            <!-- 上移箭头 -->
            <div
              class="top_arrow"
              @mousedown.stop="start($event, item_1, tlIndex, 'topArrow')"
            >
              <div class="arrow"></div>
            </div>

            <slot name="select-block-content">
              <div class="show-time">
                <div class="i">{{ item_1.startTimeText }}</div>
                <div class="icon i">-</div>
                <div class="i">{{ item_1.endTimeText }}</div>
              </div>
            </slot>

            <!-- 下移箭头 -->
            <div
              class="bottom_arrow"
              @mousedown.stop="start($event, item_1, tlIndex, 'bottomArrow')"
            >
              <div class="arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 表格 END -->
  </div>
</template>

<script>
// --- 计算项

// 1 小时的块高度
let hours_height = 0;

// tbody 高度
let tbody = 0;

// 开始的触摸点位置距离页面顶部高度
let start;
// 鼠标是否按下
let mouseDown = false;

// 选择块移动体验优化，当前操作的选择块数据
let currentMoveSelectBlock = null;
let moveType = undefined;

// 代表已有选择块数量 ( 选择块计数器 )
// let number = 0;

// 供选择选择快中选择快数量 ( 计数器 )
// let assign_number = 0;

// --- 限制项（linmit）

// 距离当前时间多少小时才可以进行预约和时间选择
// let within_hours = 0;

// 选择块最小时间（小时）
// let min_time = 1;

const Block = function (target, that) {
  this.startTimeDateObject = new Date(target.start);
  this.endTimeDateObject = new Date(target.end);
  if (this.startTimeDateObject.toString() === "Invalid Date")
    throw new TypeError("Invalid attrbute start");
  if (this.endTimeDateObject.toString() === "Invalid Date")
    throw new TypeError("Invalid attrbute end");
  if (this.endTimeDateObject < this.startTimeDateObject)
    throw new TypeError(
      "Invalid data.The end time should be longer than the start time"
    );
  // 校验要考虑24：00的极限时间,开始时间不会更换日期
  this.dateText = this.startTimeDateObject.formatTime("YYYY/MM/DD");
  if (this.endTimeDateObject - new Date(this.dateText) > 24 * 3600000)
    throw new Error(
      "Invalid data.The start time and end time should be the same day"
    );
  this.content = target.content || ""; // 课程名称（模块名称)
  this.startTimeText = this.startTimeDateObject.formatTime("HH:MM");
  this.endTimeText = this.endTimeDateObject.formatTime("HH:MM");

  this.top = that.computeBlockTop(this.startTimeDateObject);
  this.height = that.computeBlockHeight(
    this.startTimeDateObject,
    this.endTimeDateObject
  ); // 个体高度

  this.status = target.status;
  this.source = target; // 原数据
};

class SelectBlock extends Block {
  constructor(target, that) {
    super(target, that);
    this.roof = target.roof;
    this.base = target.base;
  }
}

export default {
  props: {
    tableConfig: {
      type: Object,
      validator: function (value) {
        for (const key in value) {
          const target = value[key];
          switch (key) {
            case "startDate":
              if (
                !(
                  target instanceof Date ||
                  new Date(target).toString() == "Invalid Date"
                )
              )
                return false;
              break;
            case "days":
            case "selectNumberRestrict":
              if (!(typeof target === "number")) return false;
              break;
            case "timeRange":
              if (!(0 < target[0] && target[0] < target[1] && target[1] < 24))
                return false;
              break;
            case "select":
            case "selectCover":
              if (!(typeof target === "boolean")) return false;
              break;
            case "statusConfig":
              if (!(typeof target === "object")) return false;
              break;
          }
        }
        return true;
      },
    },
    // 双向绑定选择块数据
    selectData: {
      type: Array,
      default: [],
    },

    data: {
      type: Array,
      default: [
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
        {
          content: "元素导论", // 显示内容
          start: new Date(Date.now() + 60 * 60 * 60 * 1000), // 开始时间
          end: new Date(Date.now() + 63 * 60 * 60 * 1000), // 结束时间
          status: 3,
        },
        {
          content: "元素导论", // 显示内容
          start: new Date(Date.now() + 50 * 60 * 60 * 1000), // 开始时间
          end: new Date(Date.now() + 53 * 60 * 60 * 1000), // 结束时间
          status: 3,
        },
        {
          content: "语文", // 显示内容
          start: new Date(), // 开始时间
          end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 结束时间
        },
        {
          content: "Error", // 显示内容
          start: "jkl", // 开始时间
          end: "2023/05/27 12:00", // 结束时间
        },
        {
          content: "语文", // 显示内容
          start: "2023/06/03 11:30", // 开始时间
          end: "2023/06/03 13:00", // 结束时间
        },
        {
          content: "数学", // 显示内容
          start: "2023/05/29 09:30", // 开始时间
          end: "2023/05/29 12:40", // 结束时间
        },
        {
          content: "生物", // 显示内容
          start: "2023/05/28 13:00", // 开始时间
          end: "2023/05/28 14:00", // 结束时间
        },
        {
          content: "地理", // 显示内容
          start: "2023/05/30 14:00", // 开始时间
          end: "2023/05/30 15:00", // 结束时间
        },
        {
          content: "提瓦特元素类型与相关反应", // 显示内容
          start: "2023/05/31 16:00", // 开始时间
          end: "2023/05/31 20:00", // 结束时间
        },
      ],
    },

    // 选择块数量限制
    // select_number: {
    //   type: Number,
    //   default: -1,
    // },

    // 已经存在的选择块
    // select_existed: {
    //   type: Array,
    //   default: [],
    // },
  },
  emits: ["update:selectData"],

  data() {
    return {
      table: [],
    };
  },

  computed: {
    tableAttrs() {
      return Object.assign(
        {
          startDate: new Date(), // 开始日期
          // 结束日期与显示天数有一个就行
          // endDate: "", // 结束日期
          days: 7, // 显示天数
          timeRange: [7, 23], // 时间范围
          select: true,
          // 选择模式下，选择块是否可以覆盖其他类型块
          selectCover: true,
          // 选择块数量限制
          selectNumberRestrict: -1,
          statusConfig: { defaultStatus: {} },
        },
        this.tableConfig
      );
    },
    timestamp() {
      const [start, end] = this.tableAttrs.timeRange;
      const stamp = [];
      for (let i = 0; i <= end - start; i++) {
        stamp.push(start + i);
      }
      return stamp;
    },
  },
  watch: {
    table: {
      handler(newVal) {
        this.$emit(
          "update:selectData",
          newVal.reduce((acc, e) => acc.concat(e.selectBlock), [])
        );
      },
      deep: true,
    },
  },

  methods: {
    blockStyle(blockItem) {
      return Object.assign(
        {
          height: blockItem.height + "px",
          top: blockItem.top + "px",
          zIndex: 2,
        },
        this.tableConfig.statusConfig[blockItem.status]
      );
    },
    /**
     * 块的计算与操作
     * */
    computeBlockHeight(start, end) {
      return Math.floor((end - start) / 60000) * (hours_height / 60);
    },
    // 计算以tboby为父元素的top
    computeBlockTop(start) {
      const timeRangeStart = this.tableAttrs.timeRange[0];
      let distanceHours = start.getHours() - timeRangeStart;
      return (distanceHours * 60 + start.getMinutes()) * (hours_height / 60);
    },
    // 计算一个时间块的上限下限位置(位置数据最好只用于展示，用于做时间计算容易有误差)
    computeRootAndBase(block, index) {
      // block 只要有top， height即可
      // 上方元素的底部top（元素的最大顶部top，下方元素的顶部top（元素底部最大top）
      let roof = 0,
        base = tbody;

      const tl = this.table[index];
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
      block.roof = roof;
      block.base = base;
      return { roof, base };
    },
    // 计算一个元素上限到下限的时间长度
    computeLeisureTime(target, index) {
      const tl = this.table[index];
      // 块的默认顶部底部位置
      let roofTime = new Date(tl.dateText),
        baseTime = new Date(tl.dateText);
      roofTime.setHours(this.tableAttrs.timeRange[0]);
      baseTime.setHours(this.tableAttrs.timeRange[1] + 1);
      tl.block.concat(tl.selectBlock).forEach((item) => {
        // 该块的顶部与底部top
        let itemRoof = item.startTimeDateObject,
          itemBase = item.endTimeDateObject;
        if (target > itemBase && roofTime < itemBase) roofTime = itemBase;
        else if (target < itemRoof && baseTime > itemRoof) baseTime = itemRoof;
      });
      return { roofTime, baseTime };
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

    // 根据时间块的top值计算top值所在位置的时间（存在误差）
    computeTimeByTop(top) {
      // 根据top(与tbody的距离)计算时间
      // 极限值判断
      if (top === tbody) {
        let hours = this.tableAttrs.timeRange[1] + 1;
        if (hours === 24) hours = 0;
        return (hours < 10 ? "0" + hours : hours) + ":" + "00";
      }
      const timeRangeStart = this.tableAttrs.timeRange[0];
      const totalMinute = (top * 60) / hours_height; // 总分钟数
      let hours = Math.floor(totalMinute / 60) + timeRangeStart; // 求出小时
      let minute = Math.floor(totalMinute % 60); // 求出分钟
      /**
       * 计算误差处理方式
       * 1. 判断是否是生成元素，是，就直接将分钟设为00（也是缩小误差范围的做法）
       * 2. 生成元素不使用该方法，直接通过td元素index判断时间（比较好的做法，已经实现）
       * 3. 为了完善2方法， 给computeTimeByTop添加极限值判断
       */
      // 直接以十分钟作为基础单位，干掉小数导致的误差问题(极端情况下依旧会出现误差)
      // 拉大分钟区间， 减小误差出现几率
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
    // 移除可操作的时间块 1 select类型 2 assign类型
    removeSelectBlock(tlIndex, index) {
      this.table[tlIndex].selectBlock.splice(index, 1);
    },

    // 添加普通选择块
    appendSelectBlock(event, tlIndex, index) {
      if (!this.tableAttrs.select) return; // 是否开启选择模式
      let top = event.target.offsetTop + event.offsetY; // 点击位置与tbody距离
      const dateText = this.table[tlIndex].dateText;
      const timeRangeStart = this.tableAttrs.timeRange[0];
      let obj = {};
      function time() {
        // 会有误差出现
        // startTime: dateText + " " + this.computeTimeByTop(top),
        // endTime: dateText + " " + this.computeTimeByTop(hours_height + top),
        // 干脆直接，堪比干脆面
        obj.start = (function () {
          let hours = timeRangeStart + index;
          return `${dateText} ${hours < 10 ? "0" + hours : hours}:00`;
        })();
        obj.end = (function () {
          let hours = timeRangeStart + index + 1;
          return `${dateText} ${hours < 10 ? "0" + hours : hours}:00`;
        })();
      }

      if (!this.tableAttrs.selectCover) {
        const target = this.computeTimeByTop(top);
        const { roofTime, baseTime } = this.computeLeisureTime(
          new Date(`${dateText} ${target}`),
          tlIndex
        );
        // 时间区间条件判断
        if (baseTime - roofTime < 60 * 60 * 1000) {
          window.alert("该时间段不足以生成选择快");
          return;
        }
        const { roof, base } = this.computeRootAndBase(
          { top, height: 0 },
          tlIndex
        );
        obj = { roof, base };
        let offsetTop = event.target.offsetTop;
        // 如果点击到的td有足够的高度
        if (base - offsetTop >= hours_height) time();
        else {
          obj.start = `${dateText} ${this.computeTimeByTop(
            base - hours_height
          )}`;
          obj.end = `${dateText} ${this.computeTimeByTop(base)}`;
        }
      } else {
        time();
        obj.roof = 0;
        obj.base = tbody;
      }
      this.table[tlIndex].selectBlock.push(new SelectBlock(obj, this));
    },

    // 选择块移动方式移动方式判断
    selectBlockMoveType(event, target) {
      switch (moveType) {
        case "block":
          this.move(event, target);
          break;
        case "topArrow":
          this.top_move(event, target);
          break;
        case "bottomArrow":
          this.bottom_move(event, target);
          break;
      }
    },

    // 选择块的下箭头移动
    bottom_move(event, target = currentMoveSelectBlock) {
      if (!mouseDown) return;
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
    top_move(event, target = currentMoveSelectBlock) {
      if (!mouseDown) return;
      let change = start - event.pageY; // 正增负减
      let height = change + target.height;
      let top = target.top - change;
      let limitTop = target.top + target.height - hours_height;
      if (top < target.roof) {
        top = target.roof;
        height = target.height + target.top - target.roof;
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

    start(event, item, tlIndex, mType) {
      mouseDown = true;
      currentMoveSelectBlock = item;
      moveType = mType;
      // 记录开始位置
      start = event.pageY;
      if (!this.tableAttrs.selectCover) this.computeRootAndBase(item, tlIndex);
    },

    move(event, target = currentMoveSelectBlock) {
      if (!mouseDown) return;
      let top = event.pageY - start + target.top; // 移动后，顶部距离tbody距离
      if (top < target.roof) {
        top = target.roof;
      } else if (target.base - target.height < top) {
        top = target.base - target.height;
      }
      target.startTimeText = this.computeTimeByTop(top); // 开始时间计算
      target.endTimeText = this.computeTimeByTop(top + target.height); // 结束时间计算
      target.top = top;
      // 更新最新位置
      start = event.pageY;
    },

    end(event, item = currentMoveSelectBlock) {
      if (!mouseDown) return;
      // 移动速度较快时会导致move触发间隔被拉出较大距离
      this.move(event);
      // 停止移动，位置记录清空
      mouseDown = false;
      start = 0;
      currentMoveSelectBlock = null;
      // 更新数据
      item.startTimeDateObject = new Date(
        item.dateText + " " + item.startTimeText
      );
      item.endTimeDateObject = new Date(item.dateText + " " + item.endTimeText);
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
        if (select) this.selectBlock = [];
        this.dayText = date.getDayText("星期");
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
    // 刷新数据
    refresh() {
      this.getElementHeight(() => {
        this.table.forEach((tl) => {
          tl.block.concat(tl.selectBlock).forEach((e) => {
            e.top = this.computeBlockTop(e.startTimeDateObject);
            e.height = this.computeBlockHeight(
              e.startTimeDateObject,
              e.endTimeDateObject
            ); // 个体高度
          });
        });
      });
    },
    // 更新tbody与hour的高度
    getElementHeight(fn) {
      this.$nextTick(() => {
        tbody = document.querySelector("#tbody").offsetHeight;
        hours_height =
          tbody /
          (this.tableAttrs.timeRange[1] - this.tableAttrs.timeRange[0] + 1);
        fn && fn();
      });
    },

    // 初始化课表
    load() {
      // 计算七天时间，生成基础架构
      this.createBaseConstruction();
      this.getElementHeight(() => {
        // 生成块数据并放置到对应tl(列表项)
        this.data.forEach((item) => {
          try {
            item = new Block(item, this);
            this.table.forEach(tl => {
              if (tl.dateText === item.dateText) tl.block.push(item);
            });
          } catch (err) {
            console.error(err);
          }
        });
      });
    },
  },

  created() {},
  mounted() {
    window.addEventListener("resize", this.refresh);
    this.load();
  },
  unmounted() {
    window.removeEventListener("resize", this.refresh);
  },
};
</script>

<style lang="scss">
.classSchedule {
  --line-color: #e8e8e8;
  display: flex;
  width: 750px;
  height: 100%;
  border: 1px solid var(--line-color);
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
      font-size: 12px;
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
    height: 100%;
    overflow: hidden;
    display: flex;

    .tl {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--line-color);

      .thead {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-bottom: 1px solid var(--line-color);
        font-size: 14px;
        text-align: center;
      }

      .tbody {
        flex: 13;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        overflow: hidden;

        .td {
          width: 100%;
          flex: 1;
          border-bottom: 1px solid var(--line-color);
        }

        .block {
          position: absolute;
          left: 0;
          overflow: hidden;
          background-image: linear-gradient(#ff00bb80, #cccccc80);
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
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;

          .top_arrow,
          .bottom_arrow {
            height: 12px;
            background: #2ffff880;
            text-align: center;
            flex-shrink: 0;
            display: none;
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

          &:hover {
            .top_arrow,
            .bottom_arrow {
              display: flex;
            }
          }

          .show-time {
            flex: 1;
            overflow: hidden;
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
        }
      }
    }
  }
}
</style>
