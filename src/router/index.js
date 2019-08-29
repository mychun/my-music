import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

//异步加载
const Recommend = () => import('@/components/recommend')
const Singer = () => import('@/components/singer')
const Rank = () => import('@/components/rank')
const Search = () => import('@/components/search')
const SingerDetail = () => import('@/components/singer-detail')
const Disc = () => import('@/components/disc')
const TopList = () => import('@/components/top-list')
const UserCenter = () => import('@/components/user-center')

export default new Router({
  mode: 'history',
  //设置根目录
  // base: process.env.BASE_URL, //开发环境目录
  base: 'mymusic', //服务器项目根目录
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
