<template>
  <scroll
    class="listview"
    ref="listview"
    :listenScroll="listenScroll"
    :probe-type="probeType"
    @scroll="scroll"
  >
    <ul>
      <!-- group部分 -->
      <li class="list-group" v-for="group in data" :key="group.title" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selatcItem(item)" class="list-group-item" v-for="item in group.items" :key="item.id">
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart.stop.prevent="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <!-- 锚点部分 -->
        <li
          v-for="(item, index) in shortcutList"
          :key="item"
          class="item"
          :data-index="index"
          :class="{'current':currentIndex===index}"
        >{{ item }}</li>
      </ul>
    </div>
    <!-- 浮动头部 -->
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <!-- 加载提示 -->
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>
<script>
import Scroll from "@/base/scroll";
import { getData } from "@/common/js/dom.js";
import Loading from "@/base/loading";

//页面右侧菜单的每个锚点的高度，和css定义的同步
const ANCHOR_HEIGHT = 18;
//group头部高度
const TITLE_HEIGHT = 30;

export default {
  name: "listView",
  created() {
    //在created定义属性的好处：
    //这个属性只是单纯的作为当前组件的共享属性而已
    //并不需要具备vue的其它功能，例如vue data()里定义属性的计算方法和监听方法
    //这样更加高效
    this.touch = {}; //触摸的值
    this.listenScroll = true; //是否监听滚动
    this.probeType = 3; //设置better-scroll的probeType属性
    this.listHeight = []; //存放group的上下限高度数组
  },
  data() {
    return {
      scrollY: -1, //实时监测滚动的距离
      currentIndex: 0, //哪个锚点高亮
      diff: -1 //group的title偏移量
    };
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() { //锚点的data
      return this.data.map(group => {
        return group.title.substr(0, 1);
      });
    },
    fixedTitle() { //浮动title的data
        //如果滚动是超过顶部就为空
      if (this.scrollY > 0) {
        return "";
      }
      //异步请求的data有改变，就通过锚点高度的currentIndex
      //来给浮动title赋值
      return this.data[this.currentIndex]
        ? this.data[this.currentIndex].title
        : "";
    }
  },
  components: {
    Scroll,
    Loading
  },
  methods: {
    selatcItem(item){
      this.$emit('select', item)
    },
    refresh(){
      this.$refs.listview.refresh()
    },
    onShortcutTouchStart(e) {
      //获取data-index的值
      //e.target永远获取的是被点击的元素
      //不管点击的方法定义在哪里
      //getData返回的是string
      //获取被点击的锚点
      let anchorIndex = parseInt(getData(e.target, "index"));

      //获取触摸的位置
      //e.touches[0]返回的是pageX和pageY
      let firstTouch = e.touches[0];
      //赋值给共享的touch.y1，也就是触摸开始的位置
      this.touch.y1 = firstTouch.pageY;
      //记录刚开始点击的是哪个锚点
      this.touch.anchorIndex = anchorIndex;

      this._scrollTo(anchorIndex);
    },
    onShortcutTouchMove(e) {
      //获取触摸的位置
      //e.touches[0]返回的是pageX和pageY
      let firstTouch = e.touches[0];
      //赋值给共享的touch.y2，也就是触摸end的位置
      this.touch.y2 = firstTouch.pageY;

      //原理：通过 触摸滑动的距离 / 锚点的高度 = 滑动经过了几个锚点
      // | 0这个表达式的意思是，取整同时转成数值型
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;

      //刚开始点击的锚点 + 滑动经过了几个锚点 = 获取当前锚点
      let anchorIndex = this.touch.anchorIndex + delta;

      this._scrollTo(anchorIndex);
    },
    scroll(pos) {
      //滚动的距离
      this.scrollY = pos.y;
    },
    _calculateHeight() {
        //获取每个group的高度
        //全部放到this.listHeight

        //这里要重置this.listHeight
        //否则重新计算就会把以前的数据也保存下来
      this.listHeight = [];
      //获取所有的group
      const list = this.$refs.listGroup;
      //开头第一个group的上限也有一个，也就是0
      let height = 0;

      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight;
        this.listHeight.push(height);
      }
      
    },
    _scrollTo(index) {
      //list-shortcut元素顶部上下有个padding-top和padding-bottom
      //点击上下顶部是不用触发滚动的
      // !index 当点击上下顶部时，index为null
      // index !== 0 index有时会为0，!index会返回true
      if (!index && index !== 0) {
        return;
      }
      //触摸滑动到顶部和尾部操作时，做处理
      //滑动到顶部index会小于0
      //滑动到底部index会大于锚点的总数
      //this.listHeight.length - 2: listHeight本来多一个
      //所以要获取锚点的数量，就是在 listHeight-1 的基础上再减去一个
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2;
      }

      //点击滚动到指定的listGroup元素
      //0 代表的是滚动动画执行的时长
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);

        //获取Scroll组件中引用的better-scroll的scroll属性
    //this.scrollY = this.$refs.listview.scroll.y;
    },
    _caculateHeight() {}
  },
  watch: {
    data() {
      setTimeout(() => {
          //如果异步请求的data发生变化
          //重洗计算 group 的上下限高度数组this.listHeight
        this._calculateHeight();
      }, 20);
    },
    scrollY(newY) {
      const listHeight = this.listHeight;
      // 当滚动到顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 在中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i];
        let height2 = listHeight[i + 1];
        //滚动距离 -newY 大于 group 的上限
        //小于 group 的下限
        //就说明，滚动到当前的group
        if (-newY >= height1 && -newY < height2) {
            
          this.currentIndex = i;

          //计算浮动title需要偏移的距离
          this.diff = height2 + newY;
          return;
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2;
    },
    diff(newVal) {
        //diff改变时
        //浮动title开始偏移
      let fixedTop =
        newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0;

        //fixedTop为0，说明浮动title不需要偏移
        //减少对dom的操作
      if (this.fixedTop === fixedTop) {
          
        return;
      }
      //通过赋值this.fixedTop，判断浮动title是否对象当前的group
      this.fixedTop = fixedTop;
      
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
    }
  }
};
</script>
<style lang="stylus" scoped>
.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
