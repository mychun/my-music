<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query">
      <div class="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" @click="addQuery(item.k)" v-for="item in hotKey" :key="item.n">
                <span>{{ item.k }}</span>
              </li>
            </ul>
          </div>
          <div class="search-history">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div class="search-result" v-show="query">
      <suggest :query="query" @select="saveSearch" @listScroll="blurInput"></suggest>
    </div>
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>
<script>
import SearchBox from "@/base/search-box";
import {getHotKey} from '@/api/search'
import {ERR_OK} from '@/api/config'
import Suggest from '@/components/suggest'
import {mapActions} from 'vuex'
export default {
  name: "search",
  components: {
    SearchBox,
    Suggest
  },
  created(){
      this._getHotKey()
  },
  data(){
      return {
          hotKey: [],
          query: ''
      }
  },
  methods: {
      addQuery(query){
          this.$refs.searchBox.setQuery(query)
      },
      onQueryChange(query){
          this.query = query
      },
      blurInput(){
        //上拉滚动时，让输入框失去焦点，关闭手机键盘
        this.$refs.searchBox.blur()
      },
      saveSearch(){
        this.saveSearchHistory(this.query)
      },
      _getHotKey(){
          getHotKey().then((res) => {
              if(res.code === ERR_OK){
                  this.hotKey = res.data.hotkey.slice(0, 10)
              }
          })
      },
      ...mapActions([
        'saveSearchHistory'
      ])
  }
};
</script>
<style lang="stylus" scoped>
.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
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
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>


