<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="clearConfirmHint">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll ref="listContent" class="list-content">
          <transition-group name="list" tag="ul">
            <li
              class="item"
              v-for="(item, index) in sequenceList"
              :key="item.id"
              @click="selectItem(item,index)"
              :id="item.id"
              ref="listItem"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text" v-html="item.name"></span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteSong(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div @click.stop="addSong" class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
        <confirm ref="confirm" text="是否清空播放列表" confirmBtnText="清空" @confirm="clearSongList"></confirm>
        <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Scroll from "@/base/scroll";
import { setTimeout } from "timers";
import { playMode } from "@/common/js/config";
import { shuffle } from "@/common/js/util";
import Confirm from '@/base/confirm'
import AddSong from '@/components/add-song'
import { types } from 'util';

const modeArr = [
  {
    modeText: "顺序播放",
    iconMode: "icon-sequence"
  },
  {
    modeText: "单曲循环",
    iconMode: "icon-loop"
  },
  {
    modeText: "随机播放",
    iconMode: "icon-random"
  }
];
export default {
  name: "playlist",
  components: {
    Scroll,
    Confirm,
    AddSong
  },
  data() {
    return {
      showFlag: false,
    };
  },
  computed: {
    iconMode(){
        //this.mode返回的是0/1/2
        return modeArr[this.mode].iconMode
    },
    modeText(){
        return modeArr[this.mode].modeText
    },
    ...mapGetters(["sequenceList", "currentSong", "mode", 'favoriteList', 'playing', 'playlist'])
  },
  methods: {
    addSong(){
      this.$refs.addSong.show()
    },
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
    clearConfirmHint(){
        this.$refs.confirm.show()
    },
    clearSongList(){
        this.deleteSongList()
    },
    deleteSong(item){
        this.deleteSong(item)
    },
    changeMode() {
      //修改播放模式
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);

      //修改播放列表playlist
      let list = null;
      if (this.mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }

      this.resetCurrentIndex(list);

      this.setPlayList(list);
    },
    resetCurrentIndex(list) {
      //播放列表打乱后，currentIndex也要跟着改变，同步到当前歌曲在新列表的位置
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    show() {
      this.showFlag = true;
      setTimeout(() => {
        this.$refs.listContent.refresh();
        this.scrollToCurrent(this.currentSong)
      }, 20);
    },
    hide() {
      this.showFlag = false;
    },
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return "icon-play";
      }
      return "";
    },
    selectItem(item,index) {

      if (this.mode === playMode.random) {
          index = this.playlist.findIndex(song => {
          return song.id === item.id;
        });
      }

      this.setPlayingState(true)
      this.setCurrentIndex(index);
    },
    scrollToCurrent(song){
      const index = this.$refs.listItem.findIndex((item)=> {
        return song.id === parseInt(item.id)
      })
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    ...mapMutations({
      setCurrentIndex: "SET_CURRENT_INDEX",
      setPlayList: "SET_PLAYLIST",
      setPlayMode: "SET_PLAY_MODE",
      setPlayingState: "SET_PLAYING_STATE"
    }),
    ...mapActions({
        deleteSongList: 'deleteSongList',
        deleteSong: 'deleteSong',
        saveFavoriteList: 'saveFavoriteList',
        deleteFavoriteList: 'deleteFavoriteList'
    })
  },
  watch: {
    currentSong(newSong, oldSong){
      if(!this.showFlag || newSong === oldSong){
        return
      }
      this.scrollToCurrent(newSong)
    }
  }
};
</script>
<style lang="stylus" scoped>
.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;

  &.list-fade-enter-active, &.list-fade-leave-active {
    transition: opacity 0.3s;

    .list-wrapper {
      transition: all 0.3s;
    }
  }

  &.list-fade-enter, &.list-fade-leave-to {
    opacity: 0;

    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }

  &.list-fade-enter, .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;

    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;

      .title {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .clear {
          extend-click();

          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }

    .list-content {
      max-height: 240px;
      overflow: hidden;

      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;

        &.list-enter-active, &.list-leave-active {
          transition: all 0.1s;
        }

        &.list-enter, &.list-leave-to {
          height: 0;
        }

        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .like {
          extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;

          .icon-favorite {
            color: $color-sub-theme;
          }
        }

        .delete {
          extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }

    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;

      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;

        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }

        .text {
          font-size: $font-size-small;
        }
      }
    }

    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>