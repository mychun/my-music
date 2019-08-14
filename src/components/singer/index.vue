<template>
  <div class="singer" ref="singer">
      <listview :data="singers" @select='selectItem' ref="list"></listview>  
      <transition name="slide">
      <router-view></router-view>
      </transition>
  </div>
</template>
<script>
import { getSingerList } from "@/api/singer";
import { ERR_OK } from "@/api/config";

import Singer from "@/common/js/singer";

import Listview from '@/base/listview'

import {mapMutations} from 'vuex'
import {playlistMixin} from '@/common/js/mixin'

const HOT_NAME = "热门";
const HOT_SINGER_LEN = 10;

export default {
  name: "singer",
  mixins: [playlistMixin],
  data() {
    return {
      singers: []
    };
  },
  components:{
      Listview
  },
  created() {
    this._getSingerList();
  },
  methods: {
    handlePlaylist(playlist){
      //播放列表playlist有就是小型播放器的高度
      const bottom = playlist.length > 0 ? '60px' : ''

      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    selectItem(singer){
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      //把singer保存到state.singer
      this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normallizeSinger(res.data.list);
        }
      });
    },
    _normallizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };

      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(
            new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            })
          );
        }

        const key = item.Findex;
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(
          new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          })
        )
      })

      //排序
      let ret = []
      let hot = []
      for(let key in map){
          let val = map[key]
          if(val.title.match(/[a-zA-Z]/)){
              ret.push(val)
          }else if(val.title === HOT_NAME){
              hot.push(val)
          }
      }
      ret.sort((a, b)=>{
          //charCodeAt返回的是指定字符的Unicode编码，例如：H的Unicode编码为101
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }
};
</script>
<style lang="stylus" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>


