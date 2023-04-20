import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);
const router = new Router({
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    // {
    //   path: '/sellerpage',  // 测试
    //   component: () => import('../views/SellerPage.vue'),
    //   // meta:{title:'home'}
    // },
    {
      path: "/login", // 主页
      component: () => import("../views/Login.vue"),
      // meta:{title:'home'}
    },
    {
      path: "/screen", // 大屏页
      component: () => import("../views/ScreenPage.vue"),
      name: "screen",
      children: [],
    },
    // map和videos组件后期合并到screen的children下
    {
      path: "/map", // 大屏地图
      component: () => import("../views/Map.vue"),
      name: "map",
    },
    {
      path: "/videos", // 大屏视频
      component: () => import("../views/Videos.vue"),
      name: "videos",
    },
    {
      path: "/home", // 管理后台
      component: () => import("../views/Home.vue"),
      name: "home",
      redirect: "/welcome",
      children: [
        // 欢迎
        {
          path: "/welcome",
          component: () => import("../components/forms/Welcome.vue"),
          name: "Welcome",
        },
        // 原料进厂台账
        {
          path: "/yl_incomes",
          component: () => import("../components/forms/YL_incomes.vue"),
          name: "YL_incomes",
        },
        // 报表-原料进厂台账
        {
          path: "/report_material_main",
          component: () =>
            import("../components/report/Report_material_main.vue"),
          name: "Report_material_main",
        },
        // 导入-原料进厂台账
        {
          path: "/addBatchYLincome",
          component: () => import("../components/dialogForms/addBatchYLincome"),
          name: "addBatchYLincome",
        },

        // 生产记录台账
        {
          path: "/prdc_ledger",
          component: () => import("../components/forms/Prdc_ledger.vue"),
          name: "Prdc_ledger",
        },
        // 企业传感器数据
        {
          path: "/epsensor_data",
          component: () => import("../components/forms/epsensor_data.vue"),
          name: "epsensor_data",
        },
        // 报表-生产记录台账
        {
          path: "/report_proledger_main",
          component: () =>
            import("../components/report/Report_proledger_main.vue"),
          name: "Report_proledger_main",
        },
        // 导入-生产记录台账
        {
          path: "/addBatchPrdcledgerRecord",
          component: () =>
            import("../components/dialogForms/addBatchPrdcledgerRecord"),
          name: "addBatchPrdcledgerRecord",
        },

        // 生产记录
        {
          path: "/prdc_ledger",
          component: () => import("../components/forms/Prdc_ledger.vue"),
          name: "Prdc_ledger",
        },
        // 报表-生产记录
        {
          path: "/report_proledger_main",
          component: () =>
            import("../components/report/Report_proledger_main.vue"),
          name: "Report_proledger_main",
        },
        // 导入-生产记录台账
        {
          path: "/addBatchPrdcledgerRecord",
          component: () =>
            import("../components/dialogForms/addBatchPrdcledgerRecord"),
          name: "addBatchPrdcledgerRecord",
        },
        // 生产记录表
        {
          path: "/prdc_record",
          component: () => import("../components/forms/Prdc_record.vue"),
          name: "Prdc_record",
        },

        // 导入-生产记录表
        {
          path: "/addBatchPrdcRecord",
          component: () =>
            import("../components/dialogForms/addBatchPrdcRecord"),
          name: "addBatchPrdcRecord",
        },

        // 产量确认表
        {
          path: "/prdc_confirm",
          component: () => import("../components/forms/Prdc_confirm.vue"),
          name: "Prdc_confirm",
        },

        // 报表-产量确认表
        {
          path: "/report_proconfirm_main",
          component: () =>
            import("../components/report/Report_proconfirm_main.vue"),
          name: "Report_proconfirm_main",
        },
        // 导入-产量确认表
        {
          path: "/addBatchPrdcConfirm",
          component: () =>
            import("../components/dialogForms/addBatchPrdcConfirm"),
          name: "addBatchPrdcConfirm",
        },

        // 销售台账
        {
          path: "/ff_sales",
          component: () => import("../components/forms/FF_sales.vue"),
          name: "FF_sales",
        },

        // 报表-销售台账
        {
          path: "/report_sales_main",
          component: () => import("../components/report/Report_sales_main.vue"),
          name: "Report_sales_main",
        },
        // 导入-销售台账
        {
          path: "/addBatchSaleRecord",
          component: () =>
            import("../components/dialogForms/addBatchSaleRecord"),
          name: "addBatchSaleRecord",
        },

        // 供应明细表
        {
          path: "/supdetail",
          component: () => import("../components/forms/Supdetail.vue"),
          name: "Supdetail",
        },

        // 导入-供应明细表
        {
          path: "/addBatchSupdetail",
          component: () =>
            import("../components/dialogForms/addBatchSupdetail"),
          name: "addBatchSupdetail",
        },

        // 用户管理
        {
          path: "/userMGT",
          name: "userMGT",
          component: () => import("../components/user/Users.vue"),
        },

        // 数据安全
        // 数据备份和恢复
        {
          path: "/backup",
          component: () => import("../components/DbBakup/backup2.vue"),
          name: "backup",
        },
        // 企业管理
        {
          path: "/service_subject",
          component: () => import("../components/forms/Service_subject.vue"),
          name: "Service_subject",
        },

        // 监控视频配置
        {
          path: "/video_config",
          component: () => import("../components/forms/Video_Config.vue"),
          name: "Video_Config",
        },

        // 监控视频配置
        {
          path: "/gps_config",
          component: () => import("../components/forms/GPS_Config.vue"),
          name: "GPS_config",
        },

        // 传感器管理
        {
          path: "/sensor_config",
          component: () => import("../components/forms/sensor_config.vue"),
          name: "/sensor_config",
        },

        // 抽检用户管理
        {
          path: "/spot-check_config",
          component: () => import("../components/forms/spot-check_config.vue"),
          name: "/spot-check_config",
        },

        // 销售指标设定
        {
          path: "/sale_target",
          component: () => import("../components/forms/Sale_target.vue"),
          name: "Sale_target",
        },

        // 销售价格
        {
          path: "/serviceprice",
          component: () => import("../components/forms/ServicePrice.vue"),
          name: "serviceprice",
        },

        // 产品自检
        {
          path: "/prdc_quality",
          component: () => import("../components/forms/Prdc_quality.vue"),
          name: "Prdc_quality",
        },

        // 导入-产品自检
        {
          path: "/addBatchPrdcquality",
          component: () =>
            import("../components/dialogForms/addBatchPrdcquality"),
          name: "addBatchPrdcquality",
        },

        // 产品抽检
        {
          path: "/prdc_qualityspot",
          component: () => import("../components/forms/Prdc_qualityspot.vue"),
          name: "prdc_qualityspot",
        },
        // 导入-产品抽检
        {
          path: "/addBatchPrdcqualityspot",
          component: () =>
            import("../components/dialogForms/addBatchPrdcqualityspot"),
          name: "addBatchPrdcqualityspot",
        },

        // 第三方檢測
        {
          path: "/Prdc_qualitythird",
          component: () => import("../components/forms/Prdc_qualitythird.vue"),
          name: "Prdc_qualitythird",
        },
        // 导入-第三方檢測
        {
          path: "/addBatchPrdcqualitythird",
          component: () =>
            import("../components/dialogForms/addBatchPrdcqualitythird"),
          name: "addBatchPrdcqualitythird",
        },

        //取样记录
        {
          path: "/SampleRecord",
          component: () => import("../components/forms/SampleRecord"),
          name: "SampleRecord",
        },

        // 导入-取样记录
        {
          path: "/addBatchSampleRecord",
          component: () =>
            import("../components/dialogForms/addBatchSampleRecord"),
          name: "addBatchSampleRecord",
        },
      ],
    },
  ],
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行

  //获取token
  const tokenRes = window.sessionStorage.getItem("token");
  const rightRes = window.sessionStorage.getItem("jurisdiction");
  // 如果要访问的路径是'/login'，那么直接方形，不需要权限控制
  if (to.path === "/login") return next();
  // if (rightRes === 'superadmin') return next('/screen')
  if (!tokenRes) return next("/");
  next();
});

// const router = new VueRouter({
//   mode: 'hash',
//   routes
// })

export default router;
