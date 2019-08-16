<template>
  <div class="player" v-show="playlist.length > 0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend.prevent="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :src="currentSong.image" :class="cdCls" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" 
                  ref="lyricLine" 
                  v-for="(line, index) in currentLyric.lines" 
                  :key="index"
                  :class="{ 'current': currentLineNum === index }"
                  >{{ line.txt }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ 'active': currentShow === 'cd' }"></span>
            <span class="dot" :class="{ 'active': currentShow === 'lyric' }"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode" :class="disableCls">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" class="needsclick" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img width="40" height="40" :class="cdCls" :src="currentSong.image" />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :persent="percent">
            <i class="icon-mini" @click.stop="togglePlaying" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="showPlaylist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @playing="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    <playlist ref="playlist"></playlist>
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
//创建css3动画插件
import animations from "create-keyframe-animation";
//dom操作
import { prefixStyle } from "@/common/js/dom";
import { clearTimeout } from "timers";
import ProgressBar from '@/base/progress-bar'
import ProgressCircle from '@/base/progress-circle'
import { playMode } from '@/common/js/config'
import { shuffle } from '@/common/js/util'
import { getLyric } from '@/common/js/song'
import Lyric from 'lyric-parser'
import Scroll from '@/base/scroll'
import Playlist from '@/components/playlist'

const transform = prefixStyle("transform")
const transitionDuration = prefixStyle("transitionDuration")

export default {
  name: "player",
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  data(){
    return {
      songReady: false, //判断歌曲是否已加载
      currentTime: 0, //当前播放时间
      radius: 32, //小圆进度条的大小
      currentLyric: null,
      currentLineNum: 0, //哪一行歌词高亮
      currentShow: 'cd', //切换显示唱片和歌曲
      playingLyric: '' //当前歌词内容
    }
  },
  created(){
    this.touch = {}
  },
  computed: {
    ...mapGetters([
      "fullScreen", 
      "currentSong", 
      "playing", 
      'currentIndex', 
      'playlist',
      'mode',
      'sequenceList',
      'favoriteList'
    ]),
    playIcon() {
      return this.playing ? "icon-pause" : "icon-play";
    },
    miniIcon() {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    cdCls() {
      return this.playing ? "player" : "player pause";
    },
    disableCls() {
      // 歌曲未加载完成，不能点击相关操作
      return this.songReady ? '' : 'disable'
    },
    percent(){
      //计算当前播放的进度的百分比
      return this.currentTime / this.currentSong.duration
    },
    iconMode(){
      //播放模式样式
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  methods: {
    toggleFavorite(item){
      let index = this.favoriteList.findIndex((song) => {
        return song.id === item.id
      })
      if(index < 0){
        this.saveFavoriteList(item)
      }else{
        this.deleteFavoriteList(item)
      }
    },
    getFavoriteIcon(item){
      //只有vue的属性有改变，这个方法都会触发
      //例如：点击toggleFavorite 触发 saveFavoriteList 修改到favoriteList的值
      //这个方法也会跟着触发
      let index = this.favoriteList.findIndex((song) => {
        return song.id === item.id
      })
      if(index >= 0){
        return 'icon-favorite'
      }else{
        return 'icon-not-favorite'
      }
    },
    showPlaylist(){
      this.$refs.playlist.show()
    },
    back() {
      this.setFullScreen(false);
    },
    open() {
      this.setFullScreen(true);
    },
    ...mapMutations({
      setFullScreen: "SET_FULL_SCREEN",
      setPlayingState: "SET_PLAYING_STATE",
      setCurrentIndex: "SET_CURRENT_INDEX",
      setPlayMode: "SET_PLAY_MODE",
      setPlayList :"SET_PLAYLIST"
    }),
    ...mapActions({
      saveFavoriteList: 'saveFavoriteList',
      deleteFavoriteList: 'deleteFavoriteList'
    }),
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      };
      animations.registerAnimation({
        name: "move",
        animation,
        presets: {
          duration: 400,
          easing: "linear"
        }
      });
      //done就是animations执行，进到下一个阶段，也就是afterEnter
      animations.runAnimation(this.$refs.cdWrapper, "move", done);
    },
    afterEnter() {
      //进去后去掉动画样式
      animations.unregisterAnimation("move");
      this.$refs.cdWrapper.style.animation = "";
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = "all 0.4s";
      const { x, y, scale } = this._getPosAndScale();
      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;

      //跟动画执行延迟400同步
      // const timer = setTimeout(done, 400)
      //监听transition动画结束事件
      this.$refs.cdWrapper.addEventListener("transitionend", () => {
        // clearTimeout(timer)
        done();
      });
    },
    afterLeave() {
      //离开后去掉动画样式
      this.$refs.cdWrapper.style.transition = "";
      this.$refs.cdWrapper.style[transform] = "";
    },
    togglePlaying() {
      //如果歌曲未加载
      if(!this.songReady){
        return
      }

      //更改state播放状态
      this.setPlayingState(!this.playing)

      //停止歌词滚动
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    end(){
      //播放结束
      
      if(this.mode === playMode.loop){
        //如果是单曲循环模式
        this.loop()
      } else{
        this.next()
      }
    },
    loop(){
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()

      //单曲循环播放完，歌曲跳回第一行
      if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
    },
    next(){
      //如果歌曲未加载
      if(!this.songReady){
        return
      }

      if(this.mode === playMode.loop){
        //如果是单曲循环模式
        this.loop()
      }else{
        let index = this.currentIndex + 1
        if(this.currentIndex === this.playlist.length){
          index = 0
        }
        //改变播放歌曲
        this.setCurrentIndex(index)
      }

      //把songReady设置为true，等待加载
        this.songReady = false
    },
    prev(){
      //如果歌曲未加载
      if(!this.songReady){
        return
      }
      if(this.mode === playMode.loop){
        //如果是单曲循环模式
        this.loop()
      }else{
        let index = this.currentIndex - 1
        if(this.currentIndex < 0){
          index = this.playlist.length - 1
        }
        //改变播放歌曲
        this.setCurrentIndex(index)
      }

      //把songReady设置为true，等待加载
      this.songReady = false
    },
    ready(){
      this.songReady = true
    },
    error(){
      //audio播放出现错误(例如当前这首歌网络错误)
      //这个方法可以预防出现错误，不能上下首和播放暂停不能操作
      this.songReady = true
    },
    updateTime(e){
      //同步当前播放时间
      this.currentTime = e.target.currentTime
    },
    format(interval){
      //对时间进行格式处理, 00:00格式
      interval = interval | 0 //取整
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    onProgressBarChange(percent){
      //子组件progress-bar拖动进度条，修改播放进度
      const currentTime = this.currentSong.duration * percent
      this.currentTime = this.$refs.audio.currentTime = currentTime

      //拖动进度条，歌词也跟着滚动
      if (this.currentLyric) {
        //当前歌曲播放时间 * 1000ms
          this.currentLyric.seek(currentTime * 1000)
        }

      // if(currentTime === this.currentSong.duration){
      //   //假如拉到歌曲尽头，就停止播放
      //   this.setPlayingState(false)
      //   return
      // }
      if(!this.playing){
        this.togglePlaying()
      }
    },
    changeMode(){
      //修改播放模式
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)

      //修改播放列表playlist
      let list = null
      if(this.mode === playMode.random){
        list = shuffle(this.sequenceList)
      }else{
        list = this.sequenceList
      }
      
      this.resetCurrentIndex(list)
      
      this.setPlayList(list)
    },
    resetCurrentIndex(list){
      //播放列表打乱后，currentIndex也要跟着改变，同步到当前歌曲在新列表的位置
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getLyric(){
      this.currentSong.getLyric().then((lyric) => {
        //new Liric对歌词进行处理插件
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if(this.playing){
          this.currentLyric.play()
        }
      }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
    },
    handleLyric({lineNum, txt}){
      //Lyric对象回调函数
      this.currentLineNum = lineNum

      //歌词滚动
      if(lineNum > 5){
        let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
      }else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }

      //当前歌词内容
      this.playingLyric = txt
    },
    middleTouchStart(e){
      this.initiated = true
      //用来判断是否是一次移动
      this.touch.moved = false
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e){
      if(!this.initiated){
        return
      }
      
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        //预防上下滑动
          return
        }

      if(!this.touch.moved){
        this.touch.moved = true
      }

      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd(){
      if(!this.touch.moved){
        return
      }

      let offsetWidth
      let opacity
      if(this.currentShow === 'cd'){
        if(this.touch.percent > 0.1){
          //滑动超过0.1才计算
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else{
        console.log(this.touch.percent)
        if(this.touch.percent < 0.9){
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        }else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }

      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      this.touch.initiated = false
    },
    _pad(num, n = 2){
      //对数字小于10，在前面补0
      //num：要处理的数字
      //n：补多少位
      let len = num.toString().length
      while(len < n){
        num = '0' + num
        len++
      }
      return num
    },
    _getPosAndScale() {
      //计算未放大时初始的位置，根据大长篇来计算出小唱片的位置
      const targetWidth = 40;
      const paddingLeft = 40;
      const paddingBottom = 30;
      const paddingTop = 80;
      const width = window.innerWidth * 0.8;
      const scale = targetWidth / width;
      //从大唱片先从屏幕向下移，再向左移到小唱片中心点来想
      //这样就可以得出x和y的算式
      //大唱片在屏幕左移，左移是减少偏移量的，所以是负数
      const x = -(window.innerWidth / 2 - paddingLeft);
      //大唱片在屏幕下移，下移是增加偏移量，所以是正数
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
      return {
        x,
        y,
        scale
      };
    }
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        //清空播放列表!newSong.url !newSong.id 
        //在删除一首歌会碰到newSong.id === oldSong.id
        return
      }

      //直接这样会报错
      //Uncaught (in promise) DOMException
      //因为currentSong改变还没有更新到dom，也没到dom的属性
      // this.$refs.audio.play()

      if (this.currentLyric) {
        this.currentLyric.stop()
      }

      this.$nextTick(() => {
        this.$refs.audio.play();
        this.setPlayingState(true)
        this.getLyric()
      });
    },
    playing(newPlaying) {
      this.$nextTick(() => {
        const audio = this.$refs.audio;
        newPlaying ? audio.play() : audio.pause();
      });
    }
  }
};
</script>
<style lang="stylus" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .player {
            animation: rotate 20s linear infinite;
          }

          .pause {
            animation-play-state: paused;
          }

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
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

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>


