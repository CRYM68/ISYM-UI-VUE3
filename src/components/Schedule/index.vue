@author: 长歌; 
@lastEditTime: 2023.06.14 21:40; 
@Editorial content:
  1.修复多实例造成的hours_height, tbody变量污染问题。
  2.selectData双向数据绑定问题. 
  3.增加选择块增删改查api.
  4.修复因高度计算误差导致的块生成问题.
  5.修改class block，将部分关联操作集成到类处理。
  6.移除双击删除选择，增加双击事件。
  7.规范化，Date自定义方法转移到类CustomDate

<script>
import { customRef } from "vue";
// 开始的触摸点位置距离页面顶部高度
let start;
// 鼠标是否按下
let mouseDown = false;

// 选择块移动体验优化，当前操作的选择块数据
// let currentMoveSelectBlock = null;
let moveType = undefined;


class CustomDate extends Date {
  // 格式化时间
  formatTime(format = "YYYY/MM/DD HH:MM") {
    let month = this.getMonth() + 1;
    month = month < 10 ? "0" + month : month;

    let date = this.getDate();
    date = date < 10 ? "0" + date : date;

    let hours = this.getHours();
    hours = hours < 10 ? "0" + hours : hours;

    let minutes = this.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;

    switch (format) {
      case "YYYY/MM/DD HH:MM":
        return `${this.getFullYear()}/${month}/${date} ${hours}:${minutes}`;
        break;

      case "MM月DD日 HH:MM":
        return `${month}月${date}日 ${hours}:${minutes}`;
        break;

      case "YYYY-MM-DD":
        return `${this.getFullYear()}-${month}-${date}`;
        break;

      case "date":
      case "YYYY/MM/DD":
        return `${this.getFullYear()}/${month}/${date}`;
        break;

      case "MM月DD日":
        return `${month}月${date}日`;
        break;

      case "YYYY年MM月":
        return `${this.getFullYear()}年${month}月`;

      case "time":
      case "HH:MM":
        return `${hours}:${minutes}`;
    }
  }

  // 获取星期几文本
  getDayText(text = "星期") {
    switch (this.getDay()) {
      case 0:
        return text + "日";
        break;
      case 1:
        return text + "一";
        break;
      case 2:
        return text + "二";
        break;
      case 3:
        return text + "三";
        break;
      case 4:
        return text + "四";
        break;
      case 5:
        return text + "五";
        break;
      case 6:
        return text + "六";
        break;
    }
  }
}

class Block {
  #startDateObject;
  #endDateObject;
  #startTimeText;
  #endTimeText;
  #top;
  #dateText;
  #height;
  #handleTimeText;
  constructor(target, that) {
    this.#startDateObject = new CustomDate(target.start);
    this.#endDateObject = new CustomDate(target.end);
    // 校验时间有效性
    if (this.#startDateObject.toString() === "Invalid Date")
      throw new TypeError("Invalid attrbute start");
    if (this.#endDateObject.toString() === "Invalid Date")
      throw new TypeError("Invalid attrbute end");
    if (this.#endDateObject < this.#startDateObject)
      throw new TypeError(
        "Invalid data.The end time should be longer than the start time"
      );

    // 校验要考虑24：00的极限时间,开始时间不会更换日期
    this.#dateText = this.#startDateObject.formatTime("YYYY/MM/DD");
    if (this.#endDateObject - new CustomDate(this.#dateText) > 24 * 3600000)
      throw new Error(
        "Invalid data.The start time and end time should be the same day"
      );
    // 是否在time range内
    this.#startTimeText = this.#startDateObject.formatTime("HH:MM");
    this.#endTimeText = this.#endDateObject.formatTime("HH:MM");
    if (
      Number(this.#startTimeText.split(":").reduce((acc, e) => acc + e, "")) <
      Number(that.tableAttrs.timeRange[0].toString() + "00") ||
      Number(this.#endTimeText.split(":").reduce((acc, e) => acc + e, "")) >
      Number(that.tableAttrs.timeRange[1].toString() + "00")
    ) {
      throw new TypeError("Invalid data.Time is out of range.");
    }


    this.content = target.content || ""; // 课程名称（模块名称)
    this.#top = that.computeBlockTop(this.#startDateObject);
    this.#height = that.computeBlockHeight(
      this.#startDateObject,
      this.#endDateObject
    ); // 个体高度

    this.status = target.status;
    this.source = target; // 原数据

    this.#handleTimeText = (val, k) => {
      if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$|^24:00$/.test(val)) {
        const [h, m] = val.split(":");
        this["#" + k + "DateObject"].setHours(h);
        this["#" + k + "DateObject"].setMinutes(m);
        if ((k = "start")) {
          this.#top = that.computeTopByTime(val);
        }
        this.#height = that.computeBlockHeight();
        this["#" + k + "TimeText"] = val;
      }
    };
    this.top = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#top;
        },
        set: (val) => {
          trigger();
          this.#startTimeText = that.computeTimeByTop(val);
          this.#endTimeText = that.computeTimeByTop(val + this.#height);
          this.#top = val;
        },
      };
    });
    this.height = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#height;
        },
        set: (val) => {
          trigger();
          if (moveType === "top_move") {
            this.#startTimeText = that.computeTimeByTop(
              this.#top - val + this.#height
            );
          } else {
            this.#endTimeText = that.computeTimeByTop(this.#top + val);
          }
          this.#height = val;
        },
      };
    });
    this.startDateObject = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#startDateObject;
        },
      };
    });
    this.dateText = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#dateText;
        }
      };
    });
    this.endDateObject = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#endDateObject;
        },
      };
    });
    this.startTimeText = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#startTimeText;
        },
        set: (val) => {
          trigger();
          this.#handleTimeText(val, "start");
        },
      };
    });
    this.endTimeText = customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.#endTimeText;
        },
        set: (val) => {
          trigger();
          this.#handleTimeText(val, "end");
        },
      };
    });
    this.updateDateObject = function () {
      const [sh, sm] = this.startTimeText.split(':')
      this.startDateObject.setHours(sh);
      this.startDateObject.setMinutes(sm);
      const [eh, em] = this.endTimeText.split(':')
      this.endDateObject.setHours(eh);
      this.endDateObject.setMinutes(em);
    }
  }

}

class SelectBlock extends Block {
  constructor(target, that) {
    super(target, that);
    this.roof = target.roof;
    this.base = target.base;
    this.remove = function () {
      that.removeSelect(this);
    };
  }
}
export default {
  props: {
    // 表格的配置
    tableConfig: {
      type: Object,
      validator: function (value) {
        for (const key in value) {
          let target = value[key];
          switch (key) {
            case "startDate":
              if (!(target instanceof Date)) target = new CustomDate(target);
              if (new CustomDate(target).toString() == "Invalid Date")
                return false;
              break;
            case "days":
              if (typeof target !== "number") return false;
              break;
            case "timeRange":
              if (0 > target[0] && target[0] > target[1] && target[1] > 24)
                return false;
              break;
            case "select":
            case "selectCover":
              if (typeof target !== "boolean") return false;
              break;
            case "statusConfig":
              if (typeof target !== "object") return false;
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
    // 基础的块数据
    data: {
      type: Array,
      default: [],
    },
  },
  emits: ["update:selectData", "bclick", "sclick", "bdblclick", 'sdblclick'],

  data() {
    return {
      // a: new A(),
      table: [],
      currentMoveSelectBlock: null,
    };
  },

  computed: {
    tableAttrs() {
      const DV = {
        startDate: new CustomDate(), // 开始日期
        // 结束日期与显示天数有一个就行
        // endDate: "", // 结束日期
        days: 7, // 显示天数
        timeRange: [7, 24], // 时间范围
        select: false,
        // 选择模式下，选择块是否可以覆盖其他类型块
        selectCover: false,
        // 选择块数量限制
        selectNumberRestrict: -1,
        statusConfig: { defaultStatus: {} },
      };
      let c = this.tableConfig;
      return Object.assign(DV, c);
    },
    timestamp() {
      const [start, end] = this.tableAttrs.timeRange;
      const stamp = [];
      for (let i = 0; i < end - start; i++) {
        stamp.push(start + i);
      }
      return stamp;
    },
  },

  watch: {
    tableAttrs: {
      handler(newVal) {
        this.load();
      },
      deep: true,
    },
  },

  methods: {
    // 选择块的增删改查api
    createSelect(param) {
      /**
       * @param { param } { start: date string | Date, end: date string | Date }
       */
      const c = (p) => {
        const b = new SelectBlock(p, this);
        const i = this.table.findIndex((tl) => tl.dateText === b.dateText.value);
        const { base, roof } = this.computeRootAndBase(b, i);
        b.base = base;
        b.roof = roof;
        this.table[i].selectBlock?.push(b);
      };
      if (Array.isArray(param)) {
        param.forEach((e) => c(e));
      } else c(param);
    },

    removeSelect(param) {
      /**
       * @param {param} SelectBlock | SelectBlock[] | undefined
       */
      const r = (b) => {
        const tl = this.table.find((tl) => tl.dateText === b.dateText);
        const i = tl.selectBlock.findIndex(e => e === b);
        tl.selectBlock.splice(i, i + 1);
      };
      if (Array.isArray(param)) param.forEach((e) => r(e));
      else r(param);
    },

    getSelect() {
      return this._cp.sb;
    },
    /**
     * 块的计算与操作
     * */
    computeBlockHeight(start, end) {
      return Math.floor((end - start) / 60000) * (this._cp.ohh / 60);
    },
    // 计算某一时间与tbody的top
    computeBlockTop(start /**时间对象 */) {
      const timeRangeStart = this.tableAttrs.timeRange[0];
      let distanceHours = start.getHours() - timeRangeStart;
      return (distanceHours * 60 + start.getMinutes()) * (this._cp.ohh / 60);
    },
    // 计算一个时间块的上限下限位置(位置数据最好只用于展示，用于做时间计算容易有误差)
    computeRootAndBase(block, index) {
      // block 只要有top， height即可
      // 上方元素的底部top（元素的最大顶部top，下方元素的顶部top（元素底部最大top）
      let roof = 0,
        base = this._cp.tbh;

      const tl = this.table[index];
      // 总计此tl上的selectblock与block
      let target = tl.block.concat(tl.selectBlock || []);

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
      // let currentTime = new CustomDate();
      // currentTime.setHours(currentTime.getHours() + within_hours);

      // 上限位置转化为时间对象
      // let roof_Time = new CustomDate(
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
      let roofTime = new CustomDate(tl.dateText),
        baseTime = new CustomDate(tl.dateText);
      roofTime.setHours(this.tableAttrs.timeRange[0]);
      baseTime.setHours(this.tableAttrs.timeRange[1] + 1);
      tl.block.concat(tl.selectBlock).forEach((item) => {
        // 该块的顶部与底部top
        let itemRoof = item.startDateObject,
          itemBase = item.endDateObject;
        if (target > itemBase && roofTime < itemBase) roofTime = itemBase;
        else if (target < itemRoof && baseTime > itemRoof) baseTime = itemRoof;
      });
      return { roofTime, baseTime };
    },

    // 根据时间块时间计算时间块高度
    computeTopByTime(time) {
      // 根据时间计算高度
      let target = new CustomDate(time);
      let hours = target.getHours();
      let minute = target.getMinutes();
      minute = Math.ceil(minute / 10) * 10;

      if (minute === 60) {
        hours += 1;
        minute = 0;
      }
      return (this._cp.ohh / 60) * minute + (hours - 8) * this._cp.ohh;
    },

    // 根据时间块的top值计算top值所在位置的时间（存在误差）
    computeTimeByTop(top) {
      // 根据top(与tbody的距离)计算时间
      // 极限值判断
      if (top === this._cp.tbh) {
        let hours = this.tableAttrs.timeRange[1];
        if (hours === 24) hours = 0;
        return (hours < 10 ? "0" + hours : hours) + ":" + "00";
      }
      const timeRangeStart = this.tableAttrs.timeRange[0];
      const totalMinute = (top * 60) / this._cp.ohh; // 总分钟数
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
    // 添加普通选择块
    appendSelectBlock(event, tlIndex, index) {
      /**
       * @param { tlIndex } number tl索引
       * @param { index } number td索引
       */
      if (!this.tableAttrs.select) return; // 是否开启选择模式
      const dateText = this.table[tlIndex].dateText;
      const timeRangeStart = this.tableAttrs.timeRange[0];
      let obj = {};
      function time() {
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
        const target = this.computeTimeByTop(
          event.target.offsetTop + event.offsetY
        );
        const { roofTime, baseTime } = this.computeLeisureTime(
          new CustomDate(`${dateText} ${target}`),
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
        let tdsTime = new CustomDate(
          `${dateText} ${timeRangeStart + index}:00`
        );
        // 如果点击到的td有足够的高度,没有就要向上或向下偏移
        if (roofTime > tdsTime) {
          obj.start = roofTime;
          obj.end = new CustomDate(roofTime.getTime() + 3600 * 1000);
        } else if (baseTime - tdsTime < 60 * 60 * 1000) {
          obj.start = new CustomDate(baseTime.getTime() - 3600 * 1000);
          obj.end = baseTime;
        } else time();
      } else {
        time();
        obj.roof = 0;
        obj.base = this._cp.tbh;
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
    bottom_move(event, target = this.currentMoveSelectBlock) {
      if (!mouseDown) return;
      let change = event.pageY - start; // 正增负减
      let height = change + target.height; // height为最终高度
      if (height + target.top > target.base) {
        //	底线越界
        height = target.base - target.top;
      } else if (height <= this._cp.ohh) {
        // 改变后是否低于最小高度
        height = this._cp.ohh;
      }
      // target.endTimeText = this.computeTimeByTop(target.top + height);
      target.height = height;
      start = event.pageY;
    },

    // 选择块的上箭头移动
    top_move(event, target = this.currentMoveSelectBlock) {
      if (!mouseDown) return;
      let change = start - event.pageY; // 正增负减
      let height = change + target.height;
      let top = target.top - change;
      let limitTop = target.top + target.height - this._cp.ohh;
      if (top < target.roof) {
        top = target.roof;
        height = target.height + target.top - target.roof;
      } else if (top > limitTop) top = limitTop;

      if (height <= this._cp.ohh) {
        // 高度最小
        height = this._cp.ohh;
      }
      // target.startTimeText = this.computeTimeByTop(top);
      target.top = top;
      target.height = height;
      start = event.pageY;
    },

    start(event, item, tlIndex, mType) {
      mouseDown = true;
      this.currentMoveSelectBlock = item;
      moveType = mType;
      // 记录开始位置
      start = event.pageY;
      if (!this.tableAttrs.selectCover) this.computeRootAndBase(item, tlIndex);
    },

    move(event, target = this.currentMoveSelectBlock) {
      if (!mouseDown) return;
      let top = event.pageY - start + target.top; // 移动后，顶部距离tbody距离
      if (top < target.roof) {
        top = target.roof;
      } else if (target.base - target.height < top) {
        top = target.base - target.height;
      }
      target.top = top;
      // 更新最新位置
      start = event.pageY;
    },

    end(event, item = this.currentMoveSelectBlock) {
      if (!mouseDown) return;
      // 移动速度较快时会导致move触发间隔被拉出较大距离
      this.move(event);
      // 停止移动，位置记录清空
      mouseDown = false;
      start = 0;
      // currentMoveSelectBlock = null;
      // 更新数据
      item.updateDateObject()
      // item.startDateObject = new CustomDate(
      //   item.dateText + " " + item.startTimeText
      // );
      // item.endDateObject = new CustomDate(
      //   item.dateText + " " + item.endTimeText
      // );
    },

    // 创建表格基础数据结构
    createBaseConstruction() {
      let { startDate, days, select, timeRange } = this.tableAttrs;
      if (typeof startDate === "string") startDate = new CustomDate(startDate);
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
      this.table.splice(0, this.table.length);
      this.table.push(new tl(startDate));
      if (days) {
        for (let i = 1; i < days; i++) {
          const date = new CustomDate(startDate.getTime());
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
            e.top = this.computeBlockTop(e.startDateObject);
            e.height = this.computeBlockHeight(
              e.startDateObject,
              e.endDateObject
            ); // 个体高度
          });
        });
      });
    },
    // 更新tbody与hour的高度
    getElementHeight(fn) {
      this.$nextTick(() => {
        this._cp.tbh = document.querySelector("#tbody").offsetHeight;
        this._cp.ohh =
          this._cp.tbh /
          (this.tableAttrs.timeRange[1] - this.tableAttrs.timeRange[0]);
        fn && fn();
      });
    },

    // 初始化课表
    load() {
      if (this.tableAttrs.select) {
        this.$watch(
          "table",
          () => {
            this._cp.sb = this.table.reduce(
              (acc, tl) => acc.concat(tl.selectBlock),
              []
            );
            this.$emit("update:selectData", [...this._cp.sb]);
          },
          { deep: true }
        );
        this.$watch(
          "selectData",
          (newVal) => {
            this._cp.sb
              .filter((e) => !newVal.includes(e))
              .forEach((e) => {
                this.table.forEach((tl) => {
                  const i = tl.selectBlock.findIndex((s) => s === e);
                  if (i !== -1) tl.selectBlock.splice(i, 1);
                });
              });
          },
          { deep: true }
        );
      }
      // 计算days，生成基础架构
      this.createBaseConstruction();
      this.getElementHeight(() => {
        // 生成块数据并放置到对应tl(列表项)
        this.data.forEach((item) => {
          try {
            item = new Block(item, this);
            this.table.forEach((tl) => {
              if (tl.dateText === item.dateText.value) tl.block.push(item);
            });
          } catch (err) {
            console.error(err);
          }
        });
      });
    },
  },

  created() { },
  mounted() {
    this._cp = {
      // 1 小时的块高度
      ohh: 0,
      // tbody 高度
      tbh: 0,
    };
    window.addEventListener("resize", this.refresh);
    this.load();
  },
  unmounted() {
    window.removeEventListener("resize", this.refresh);
  },
};
</script>

<template>
  <p>{{ a.a }}</p>
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
    <div class="table" @mousemove.stop="selectBlockMoveType" @mouseup.stop="end" @mouseleave="end">
      <div class="tl" v-for="(item, tlIndex) of table" :key="tlIndex">
        <slot name="thead">
          <div class="thead">
            <text class="th center">{{ item.dayText }}</text>
            <text class="th center">{{ item.days }}日</text>
          </div>
        </slot>
        <div class="tbody" id="tbody">
          <div class="td center" v-for="(item, index) in timestamp.length" :key="index" id="td"
            @click="appendSelectBlock($event, tlIndex, index)"></div>
          <!-- 块 -->
          <!-- 纯展示 -->

          <div v-for="(b, i) in item.block" class="block" :key="i" :style="
            Object.assign(
              {
                height: b.height + 'px',
                top: b.top + 'px',
              },
              tableAttrs.statusConfig[b.status]
            )
          " @dblclick="$emit('bdblclick', item_1, $event)" @click="$emit('bclick', item_1, $event)">
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
          <div v-for="(item_1, i) in item.selectBlock || []"
            :class="['select', currentMoveSelectBlock === item_1 && 'current']" :key="i" :style="{
              height: item_1.height + 'px',
              top: item_1.top + 'px',
            }" @dblclick="$emit('sdblclick', item_1, $event)" @mousedown.stop="start($event, item_1, tlIndex, 'block')"
            @click.stop="$emit('sclick', item_1, $event)">
            <!-- 上移箭头 -->
            <div class="top_arrow" @mousedown.stop="start($event, item_1, tlIndex, 'topArrow')">
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
            <div class="bottom_arrow" @mousedown.stop="start($event, item_1, tlIndex, 'bottomArrow')">
              <div class="arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 表格 END -->
  </div>
</template>

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
          box-sizing: border-box;
          width: 100%;
          border-radius: 6px;
          color: #fff;
          font-size: 20px;

          .content {
            box-sizing: border-box;
            height: 100%;
            font-size: 12px;
            text-align: center;
            padding: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;

            div {
              &:first-child {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }

          &:hover {
            z-index: 20;
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
          opacity: 0.6;
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

          &.current {
            z-index: 24;
            opacity: 0.8;
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
