<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input class="box" ref="query" v-model="query" :placeholder="placeholder" />
    <i @click="clear" class="icon-dismiss" v-show="query"></i>
  </div>
</template>
<script>
import {debounce} from '@/common/js/util'
export default {
  name: "searchBox",
  props: {
    placeholder: {
      type: String,
      default: "搜索歌曲、歌手"
    }
  },
  data() {
    return {
      query: ""
    };
  },
  created() {
    //created的神奇功能:
    //在watch被解析时中debounce已自动被执行一遍了，
    //所以watch query监听的是debounce返回的函数
    //而且debounce里面的属性(timer)会被缓存起来
    this.$watch('query', debounce((newQuery) => {
      //预防输入太快重复请求search，提高性能
      this.$emit('query', newQuery)
    }, 200))
  },
  methods: {
    clear() {
      this.query = "";
    },
    setQuery(query) {
      this.query = query;
    },
    blur(){
      this.$refs.query.blur()
    }
  },
};
</script>
<style lang="stylus" scoped>
.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;

  .icon-search {
    font-size: 24px;
    color: $color-background;
  }

  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: 0;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>
