<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
<script>
import BScroll from "better-scroll";
export default {
  name: "scroll",
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: false
    },
    data: {
      //预防通过ajax请求延迟，内容发生改变，对scroll进行刷新
      type: Array,
      default: null
    },
    listenScroll:{
      //是否监听滚动的位置
      type: Boolean,
      default: false
    },
    refreshDelay: {
      //刷新延迟，新版vue中不需要使用这个了
      type: Number,
      default: 20
    },
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    //预防dom未渲染，渲染完成后，手机屏幕就会刷新，值是20秒最好
    //可以使用vue新版的nextTick方法
    // setTimeout(() => {
    //   this._initScroll();
    // }, 20);

    this.$nextTick(()=>{
        this._initScroll();
    });
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) return;

      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });

      if(this.listenScroll){
        //实时监听scroll滚动
        let me = this;
        this.scroll.on('scroll', (pos)=>{
          //pos是滚动的位置
          me.$emit('scroll', pos)
        })
      }

      //下拉刷新
      if(this.pullup) {
        this.scroll.on('scrollEnd', ()=>{
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            this.$emit('scrollToEnd')
          }
        })
      }

      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    disable() {
      //禁止
      this.scroll && this.scroll.disable();
    },
    enable() {
      //启动
      this.scroll && this.scroll.enable();
    },
    refresh() {
      //刷新
      this.scroll && this.scroll.refresh();
    },
    scrollTo(){
      //滚动到指定位置
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement(){
      //滚动到指定的目标元素
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  watch: {
    data() {
        //预防通过ajax请求延迟，内容发生改变，对scroll进行刷新
        // 使用nextTick代替
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    }
  }
};
</script>

