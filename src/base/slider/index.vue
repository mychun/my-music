<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        :class="{active: currentPageIndex === index }"
        v-for="(item, index) in dots"
        :key="index"
      ></span>
    </div>
  </div>
</template>
<script>
//导入dom的操作
import { addClass } from "@/common/js/dom.js";
import BScroll from "better-scroll";
export default {
  name: "slider",
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    };
  },
  mounted() {
    //预防dom未渲染，数据变化到dom渲染通常有一个延时，延迟值是20秒最好
    //可以使用vue新版的nextTick方法
    setTimeout(() => { //在dom渲染后初始化silder的内容
      this._setSliderWidth();
      this._initDots(); //注意要放_setSliderWidth后面，否则this.children.length不是原来的
      this._initSlider();
        
      if (this.autoPlay) {
        this._play();
      }
    }, 20); 

    window.addEventListener("resize", () => {
      //监听屏幕大小变化
      if (!this.slider || !this.slider.enabled) {
        //如果slider未实例，或未启动，不操作
        return;
      }
      clearTimeout(this.resizeTimer); //清除定时器
      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          //判断当前 slider 是否处于滚动动画过程中
          this._onScrollEnd(); //如果是，改变currentPageIndex的值，同时滚动到下一个，完成滚动动画
        } else {
          if (this.autoPlay) {
            this._play(); //否则直接自动播放
          }
        }
        this.refresh(); //刷新slider，重新设置slider的item宽度和相关样式
      }, 60);
    });
  },
  activated() {
    //keep-alive 组件激活时调用(例如从其它路由切回到当前路由就是激活)，该钩子在服务器端渲染期间不被调用。

    //如果从其它路由切换回来，恢复切换到其它路由前的状态
    //（假如：切换路由前是第二张照片，那从其它路由切换回来，也slider也滚动到第二张照片）
    this.slider.enable(); //启用 better-scroll
    let pageIndex = this.slider.getCurrentPage().pageX; //获取切换路由前x的偏移值
    this.slider.goToPage(pageIndex, 0, 0); //跳转到指定的偏移值
    this.currentPageIndex = pageIndex; //重置当前的偏移值
    if (this.autoPlay) {
      //是否自动播放
      this._play();
    }
  },
  deactivated() {
    //keep-alive 组件停用时调用(例如从当前路由切换到其它路由就是停用)，该钩子在服务器端渲染期间不被调用

    this.slider.disable(); //slider禁用
    clearTimeout(this.timer); //清除自动播放的timer
  },
  beforeDestroy() {
    //实例销毁之前调用（也就是页面被关闭前）。在这一步，实例仍然完全可用。该钩子在服务器端渲染期间不被调用。
    this.slider.disable();
    clearTimeout(this.timer);
  },
  methods: {
    refresh() { //resize窗口调整大小刷新
      if (this.slider) {
        this._setSliderWidth(true);
        this.slider.refresh();
      }
    },
    _setSliderWidth(isResize) {
      this.children = this.$refs.sliderGroup.children;

      //计算所有children加起来的总宽度
      let width = 0;
      //获取slider的宽度
      let sliderWidth = this.$refs.slider.clientWidth;

      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        addClass(child, "slider-item");
        child.style.width = sliderWidth + "px";
        width += sliderWidth;
      }

      
      if (this.loop && !isResize) {
      //isResize是预防在窗口window调整大小时，children已经包含头尾两个了
      //这时不能再重新增加头尾两个宽度

      //页面刚加载时，better-scroll未触发，不会有前后两个
      //如果是循环就要头尾加多一个，总共两个children宽度
        width += 2 * sliderWidth;
      }
      this.$refs.sliderGroup.style.width = width + "px";
    },
    _initSlider() {
        //初始化slider
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true, //横向排序
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        }
      });
    
        //滚动开始之前，先清除掉自动滚动
        //这样做是让slider的滚动到一张照片，完全交给scrollEnd和touchend去操作
        //预防自动滚动还存在时，出现问题
      this.slider.on("beforeScrollStart", () => {
        if (this.autoPlay) {
          clearTimeout(this.timer);
        }
      });

        //滚动结束后，继续开始自动滚动，同时把当前x的偏移值重置给currentPageIndex
      this.slider.on("scrollEnd", this._onScrollEnd);

        //鼠标/手指离开，继续开始自动滚动，跟滚动结束后一样
        //如果没有这个，就不会自动滚动。better-scroll的scrollEnd事件不会触发touchend
      this.slider.on("touchend", () => {
        if (this.autoPlay) {
          this._play();
        }
      });

    },
    _onScrollEnd() {
      let pageIndex = this.slider.getCurrentPage().pageX; //获取当前x的偏移值
      this.currentPageIndex = pageIndex; //改变圆点的currentPageIndex值
      if (this.autoPlay) { 
          //继续自动滚动
          //如果没有这个，就不会自动滚动，因为滚动之前beforeScrollStart已经停止滚动
            this._play();
      }
    },
    _initDots() {
      this.dots = new Array(this.children.length); //创建一个长度为children.length的数组
    },
    _play() {
      clearTimeout(this.timer); //清除定时器
      this.timer = setTimeout(() => {
        this.slider.next(); //slider滑动到下一个
      }, this.interval);
    }
  }
};
</script>
<style lang="stylus" scoped>
.slider {
  min-height: 1px;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    transform: translateZ(1px);
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>


