<template>
  <div class="music-list">
    <div class="back">
      <i class="icon-back" @click="back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" ref="playBtn" v-show="songs.length > 0"  @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll
      class="list"
      ref="list"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
      @scroll="scroll"
    >
      <div class="song-list-wrapper">
        <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
          <loading></loading>   
      </div>
    </scroll>
  </div>
</template>
<script>
import Scroll from "@/base/scroll";
import SongList from "@/base/song-list";
import { prefixStyle } from "@/common/js/dom";
import Loading from "@/base/loading"
import {mapActions} from 'vuex'
import {playlistMixin} from '@/common/js/mixin'

const RESERVED_HEIGHT = 40;

//返回浏览器支持的style
const transform = prefixStyle("transform");
const backdrop = prefixStyle("backdrop-filter");

export default {
  name: "musicList",
  mixins: [playlistMixin],
  props: {
    bgImage: {
      type: String,
      default: ""
    },
    songs: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ""
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollY: 0
    };
  },
  created() {
    this.probeType = 3;
    this.listenScroll = true;
  },
  components: {
    Scroll,
    SongList,
    Loading
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight;

    //限制.bg-layer的上滑动最大值
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
    //让Scroll的top初始为bgImage的高度
    //由于this.$refs.list是vue组件来的
    //获取vue组件里的dom，要加上$el
    this.$refs.list.$el.style.top = `${this.imageHeight}px`;
  },
  methods: {
    handlePlaylist(playlist){
      //播放列表playlist有就是小型播放器的高度
      const bottom = playlist.length > 0 ? '60px' : ''

      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll(pos) {
      this.scrollY = pos.y;
    },
    back() {
      this.$router.back();
    },
    selectItem(item, index){
        // 接收传过来的是那首歌
        this.selectPlay({
            list: this.songs,
            index
        })
    },
    random(){
      //全部随机播放
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
        'selectPlay',
        'randomPlay'
    ])
  },
  watch: {
    //通过监听scrollY来改变.bg-layer的上滑动
    scrollY(newY) {
      //遮罩刚好就是bg-image的高度
      //由于上滑都是负值，所以取最大值
      let translateY = Math.max(this.minTranslateY, newY);
      this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`;

      let zIndex = 0;
      let scale = 1;
      let blur = 0;
      const percent = Math.abs(newY / this.imageHeight);
      if (newY > 0) {
        scale = 1 + percent;
        zIndex = 10;
      } else {
        blur = Math.min(20 * percent, 20);
      }
      //上滑模糊处理，只有ios有效果
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`;

      if (newY < this.minTranslateY) {
        zIndex = 10;
        this.$refs.bgImage.style.paddingTop = 0;
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;

        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingTop = "70%";
        this.$refs.bgImage.style.height = 0;

        this.$refs.playBtn.style.display = ''
      }
      //处理列表滚动溢出
      this.$refs.bgImage.style.zIndex = zIndex;
      //顶部下拉放大效果
      this.$refs.bgImage.style[transform] = `scale(${scale})`;
    }
  },
  computed: {
    bgStyle() {
      return `background-image: url(${this.bgImage})`;
    }
  }
};
</script>
<style lang="stylus" scoped>
.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;

    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;

    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;

      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;

        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }

        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
    }

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }

  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }

  .list {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;

    .song-list-wrapper {
      padding: 20px 30px;
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>

