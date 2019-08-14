import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import mutations from './mutations'
import * as getters from './getters'
import * as actions from './actions'
//vuex下的调试记录器
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

//开发模式为true
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  strict: debug, //开发模式开始严格格式
  plugins: debug ? [createLogger()] : [] //开发模式使用调试记录器
})
