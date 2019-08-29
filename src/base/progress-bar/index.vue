<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.stop.prevent="progressTouchStart"
        @touchmove.stop.prevent="progressTouchMove"
        @touchend.stop.prevent="progressTouchEnd"
        >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import {prefixStyle} from '@/common/js/dom'

const transform = prefixStyle('transform')
const progressBtnWidth = 16

export default {
    name: 'progressBar',
    props: {
        percent: {
            type: Number,
            default: 0
        }
    },
    created(){
        this.barWidth = 0 //确定最大进度
        this.touch = {
            initiaed: false //先设置判断是否在拖动或点击，false就不是
        }
    },
    methods: {
        setProgressOffset(percent){
            //计算出偏移量
            if(percent >= 0 && !this.touch.initiaed){
                //如果this.touch.initiaed是true在触摸滑动或者点击，不继续触发自动滚动
                const barWidth = this.barWidth //最大进度
                const offsetWidth = percent * barWidth
                this._offset(offsetWidth)
            }
        },
        progressTouchStart(e){
            this.touch.initiaed = true //是否在拖动
            this.touch.startX = e.touches[0].pageX //开始的位置
            this.touch.left = this.$refs.progress.clientWidth
        },
        progressTouchMove(e){
            if(!this.touch.initiaed){
                return
            }
            const deltaX = e.touches[0].pageX - this.touch.startX //拖动的距离
            const countX = deltaX + this.touch.left //拖动的距离+已经播放的进度 = 偏移量
            const barWidth = this.barWidth //最大进度
            const offsetWidth = Math.min(barWidth, Math.max(0, countX))
            this._offset(offsetWidth)
        },
        progressTouchEnd(){
            this._triggerPersent()
        },
        progressClick(e){
            //点击改变进度条
            this._offset(e.offsetX)
            this.touch.initiaed = true
            this._triggerPersent()
        },
        _offset(offsetWidth){
            //设置进度条和圆按钮偏移
            
            this.$refs.progress.style.width = `${offsetWidth}px`
            this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        },
        _triggerPersent(){
            //计算percent，去触发父组件的播放进度
            const barWidth = this.barWidth //最大进度
            const percent = this.$refs.progress.clientWidth / barWidth
            this.touch.initiaed = false //不是在触摸或者点击

            this.$emit('percentChange', percent)
        }
    },
    watch: {
        percent(newPercent){
            //当store的fullScreen为false，播放界面收起时
            //this.$refs.progressBar.clientWidth就会获取错误
            //这里是预防由于上面的原因，导致最大的进度计算错误
            if(this.barWidth <= 0){
                this.barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
            }

            //歌曲播放触发进度
            this.setProgressOffset(newPercent)
        }
    }
}
</script>
<style lang="stylus" scoped>
.progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid #9bc9ef
          border-radius: 50%
          background: $color-theme
</style>


