import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import fastclick from 'fastclick'
import router from '@/router'
import store from '@/store'

// Vue.config.productionTip = false

//导入全局index
//如果引用字体图标，使用这种方式
import '@/common/stylus/index.styl';

//应用到body下
fastclick.attach(document.body);

//图片懒加载
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload, {
  loading: require('@/common/image/default.png')
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')