import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/home.vue'
import proManage from '../components/proManage.vue'
import proDetail from '../components/proDetail.vue'
import nodeManage from '../components/nodeManage.vue'
import nodeDetail from '../components/nodeDetail.vue'
import nodeEdit from '../components/nodeEdit.vue'
import flowQuery from  '../components/flowQuery.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'/',
      redirect : '/home',
    },
    {
    path: '/home',
    component: Home,
    children:[
      {
        path:'',
        component: proManage
      },
      {
        path:'proDetail',
        component: proDetail,
      },
      {
        path:'nodeManage',
        component: nodeManage
      },
      {
        path:'nodeDetail',
        component: nodeDetail
      },
      {
        path:'nodeEdit',
        component: nodeEdit
      },
      {
        path: 'flowQuery',
        component: flowQuery
      }
    ]
  }]
})
