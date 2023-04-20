import Vue from 'vue'
import Router from 'vue-router'

import Seller from '../components/charts/Seller.vue'
import SellerPage from '../views/SellerPage.vue'
import Stock from '../components/charts/Stock.vue'
import StockPage from '../views/StockPage.vue'

import TfProQualityVue from '../components/charts/TfProQuality.vue'

// import Map from '../components/charts/Map.vue'
import Rank from '../components/charts/Rank.vue'
import RankPage from "../views/RankPage.vue"
// import MapPage from "../views/MapPage.vue"
import Dispatch from '../components/charts/Dispatch.vue'
import ScreenPage from "../views/ScreenPage.vue"
import Login from "../views/Login.vue"
import Map from "../views/Map.vue"
import Videos from "../views/Videos.vue"
import Home from "../views/Home.vue"

import Welcome from '../components/forms/Welcome.vue'
import Users from "../components/user/Users.vue"
import FF_sales from '../components/forms/FF_sales.vue'
import YL_incomes from '../components/forms/YL_incomes.vue'

import Report_sales_main from '../components/report/sales/Report_sales_main.vue'
import Report_material_main from '../components/report/sales/Report_material_main.vue'
import Report_proconfirm_main from '../components/report/sales/Report_proconfirm_main.vue'
import Report_proledger_main from '../components/report/sales/Report_proledger_main.vue'



import Service_subject from '../components/forms/Service_subject.vue'
import Prdc_ledger from '../components/forms/Prdc_ledger.vue'
import Prdc_record from '../components/forms/Prdc_record.vue'
import Prdc_confirm from '../components/forms/Prdc_confirm.vue'
import Supdetail from '../components/forms/Supdetail.vue'


import addBatchSaleRecord from '../components/dialogForms/addBatchSaleRecord.vue'
import addBatchPrdcledgerRecord from '../components/dialogForms/addBatchPrdcledgerRecord.vue'
import addBatchSupdetail from '../components/dialogForms/addBatchSupdetail.vue'
import addBatchPrdcRecord from '../components/dialogForms/addBatchPrdcRecord.vue'
import addBatchYLincome from '../components/dialogForms/addBatchYLincome.vue'
import addBatchPrdcquality from '../components/dialogForms/addBatchPrdcquality.vue'


import backup from '../components/DbBakup/backup.vue'


Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login', component: Login
    },
    {
      path: '/screen', component: ScreenPage
    },
    {
      path: '/map', component: Map
    },
    {
      path: '/videos', component: Videos
    },
    {
      path: '/home',
      component: Home,
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/yL_incomes', component: YL_incomes },
        { path: '/prdc_ledger', component: Prdc_ledger },
        { path: '/Prdc_record', component: Prdc_record },
        { path: '/prdc_confirm', component: Prdc_confirm },
        { path: '/ff_sales', component: FF_sales },
        { path: '/supdetail', component: Supdetail },
        { path: '/users', component: Users },
        { path: '/report_sales_main', component: Report_sales_main },
        { path: '/report_proconfirm_main', component: Report_proconfirm_main },
        { path: '/report_proledger_main', component: Report_proledger_main },
        { path: '/report_material_main', name: "Report_material_main", component: Report_material_main },
        { path: '/addBatchSaleRecord', component: addBatchSaleRecord },
        { path: '/addBatchPrdcledgerRecord', component: addBatchPrdcledgerRecord },
        { path: '/addBatchSupdetail', component: addBatchSupdetail },
        { path: '/addBatchPrdcRecord', component: addBatchPrdcRecord },
        { path: '/addBatchYLincome', component: addBatchYLincome },
        { path: '/addBatchPrdcquality', component: addBatchPrdcquality },
        { path: '/backup', component: backup },
        { path: '/service_subject', component: Service_subject },
      

      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行

  // 如果要访问的路径是'/login'，那么直接方形，不需要权限控制
  if (to.path === '/login') return next()
  // 获取token
  const tokenRes = window.sessionStorage.getItem('token')
  if (!tokenRes) return next('/')
  next()

})


// const router = new VueRouter({
//   mode: 'hash',
//   routes
// })

export default router
