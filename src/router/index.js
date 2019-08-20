import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '@/components/recommend'
import Singer from '@/components/singer'
import SingerDetail from '@/components/singer-detail'
import Rank from '@/components/rank'
import Search from '@/components/search'
import Disc from '@/components/disc'
import TopList from '@/components/top-list'
import UserCenter from '@/components/user-center'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
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
      children:[
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
    },
    {
      path: '/*', //当使用 /* 一定要放在最后，否则会报错
      redirect: '/recommend'
    }
  ]
})
