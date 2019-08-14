<template>
  <scroll class="suggest" ref="suggest" :pullup="pullup" @scrollToEnd="searchMore" :beforeScroll="beforeScroll" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li class="suggest-item" @click="selectItem(item)" v-for="(item,index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading title="" v-show="hasMore"></loading>   
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>
<script>
import { search } from "@/api/search";
import { ERR_OK } from "@/api/config";
import { createSong, isValidMusic, processSongsUrl } from "@/common/js/song";
import Scroll from "@/base/scroll";
import Loading from '@/base/loading'
import Singer from '@/common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import NoResult from '@/base/no-result'

const TYPE_SINGER = "singer";
const perpage = 20;
export default {
  name: "suggest",
  components: {
    Scroll,
    Loading,
    NoResult
  },
  props: {
    showSinger: {
      type: Boolean,
      default: true
    },
    query: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      result: [],
      page: 1,
      pullup: true,
      hasMore: true, //是否还有下拉加载的数据
      beforeScroll: true
    };
  },
  methods: {
    search() {
      //搜索输入后第一次搜索
      this.page = 1; //重置page为1
      this.hasMore = true;
      this.$refs.suggest.scrollTo(0, 0); //要返回头部
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = result
          })

          this._checkMore(res.data);
        }
      });
    },
    searchMore() {
        //下拉加载
      if (!this.hasMore) {
          //到末尾就返回
        return;
      }
      this.page++;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result)=>{
            this.result = this.result.concat(result)
          })
        }
      });
    },
    listScroll() {
        this.$emit('listScroll')
      },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return "icon-mine";
      } else {
        return "icon-music";
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername;
      } else {
        return `${item.name}-${item.singer}`;
      }
    },
    selectItem(item){
      if(item.type === TYPE_SINGER){
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.setSinger(singer)
        this.$router.push({
          path: `/search/${singer.id}`
        })
      }else {
        this.insertSong(item)
      }
      this.$emit('select', item)
    },
    refresh(){
      this.$refs.suggest.refresh()
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ]),
    _genResult(data) {
      let ret = []
      
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    },
    _checkMore(data) {
        //判断是否到数据末尾
      const song = data.song;
      if (
        !song.list.length ||
        song.curnum + (song.curpage - 1) * perpage >= song.totalnum
      ) {
        this.hasMore = false;
      }
    }
  },
  watch: {
    query(newQuery) {
      this.search(newQuery);
    }
  }
};
</script>
<style lang="stylus" scoped>
.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

