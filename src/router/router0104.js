const router = [
  {
    path: "/",
    component: (resolve) => require(["@/views/Login.vue"], resolve),
    redirect: "/login",
  },
  {
    path: "/screen",
    component: (resolve) => require(["@/views/ScreenPage.vue"], resolve),
    name: "screen",
    children: [],
  },
  // map和videos组件后期合并到screen的children下
  {
    path: "/map", // 大屏地图
    component: (resolve) => require(["@/views/Map.vue"], resolve),
    name: "map",
  },
  {
    path: "/videos", // 大屏视频
    component: (resolve) => require(["@/views/Videos.vue"], resolve),
    name: "videos",
  },
  {
    path: "/home", // 管理后台
    component: (resolve) => require(["@/views/Home.vue"], resolve),
    name: "home",
    children: [
      // 台账管理
      {
        path: "/accountMGT",
        name: "accountMGT",
        children: [
          // 原料进厂台账
          {
            path: "/accountMGT/yl_incomes",
            component: (resolve) =>
              require(["@/componets/forms/YL_incomes.vue"], resolve),
            name: "YL_incomes",
            children: [
              // 报表-原料进厂台账
              {
                path: "/accountMGT/report_material_main",
                component: (resolve) =>
                  require([
                    "@/componets/report/Report_material_main.vue",
                  ], resolve),
                name: "Report_material_main",
              },
              // 导入-原料进厂台账
              {
                path: "/accountMGT/addBatchYLincome",
                component: (resolve) =>
                  require(["@/componets/report/addBatchYLincome"], resolve),
                name: "addBatchYLincome",
              },
            ],
          },
          // 生产记录台账
          {
            path: "/accountMGT/prdc_ledger",
            component: (resolve) =>
              require(["@/componets/forms/Prdc_ledger.vue"], resolve),
            name: "Prdc_ledger",
            children: [
              // 报表-生产记录台账
              {
                path: "/accountMGT/report_proledger_main",
                component: (resolve) =>
                  require([
                    "@/componets/report/Report_proledger_main.vue",
                  ], resolve),
                name: "Report_proledger_main",
              },
              // 导入-生产记录台账
              {
                path: "/accountMGT/addBatchPrdcledgerRecord",
                component: (resolve) =>
                  require([
                    "@/componets/report/addBatchPrdcledgerRecord",
                  ], resolve),
                name: "addBatchPrdcledgerRecord",
              },
            ],
          },
          // 生产记录表
          {
            path: "/accountMGT/prdc_record",
            component: (resolve) =>
              require(["@/componets/forms/Prdc_record.vue"], resolve),
            name: "Prdc_record",
            children: [
              // 导入-生产记录表
              {
                path: "/accountMGT/addBatchPrdcRecord",
                component: (resolve) =>
                  require(["@/componets/report/addBatchPrdcRecord"], resolve),
                name: "addBatchPrdcRecord",
              },
            ],
          },
          // 产量确认表
          {
            path: "/accountMGT/prdc_confirm",
            component: (resolve) =>
              require(["@/componets/forms/Prdc_confirm.vue"], resolve),
            name: "Prdc_confirm",
            children: [
              // 报表-产量确认表
              {
                path: "/accountMGT/report_proconfirm_main",
                component: (resolve) =>
                  require([
                    "@/componets/report/Report_proconfirm_main.vue",
                  ], resolve),
                name: "Report_proconfirm_main",
              },
              // 导入-产量确认表
              {
                path: "/accountMGT/addBatchPrdcRecord",
                component: (resolve) =>
                  require(["@/componets/report/addBatchPrdcRecord"], resolve),
                name: "addBatchPrdcRecord",
              },
            ],
          },
          // 销售台账
          {
            path: "/accountMGT/ff_sales",
            component: (resolve) =>
              require(["@/componets/forms/FF_sales.vue"], resolve),
            name: "FF_sales",
            children: [
              // 报表-销售台账
              {
                path: "/accountMGT/report_sales_main",
                component: (resolve) =>
                  require([
                    "@/componets/report/Report_sales_main.vue",
                  ], resolve),
                name: "Report_sales_main",
              },
              // 导入-销售台账
              {
                path: "/accountMGT/addBatchSaleRecord",
                component: (resolve) =>
                  require(["@/componets/report/addBatchSaleRecord"], resolve),
                name: "addBatchSaleRecord",
              },
            ],
          },
          // 供应明细表
          {
            path: "/accountMGT/supdetail",
            component: (resolve) =>
              require(["@/componets/forms/Supdetail.vue"], resolve),
            name: "Supdetail",
            children: [
              // 导入-供应明细表
              {
                path: "/accountMGT/addBatchSupdetail",
                component: (resolve) =>
                  require(["@/componets/report/addBatchSupdetail"], resolve),
                name: "addBatchSupdetail",
              },
            ],
          },
        ],
      },
      // 用户管理
      {
        path: "/userMGT",
        name: "userMGT",
        children: [
          {
            path: "/userMGT/users",
            component: (resolve) =>
              require(["@/components/user/Users.vue"], resolve),
            name: "Users",
            children: [],
          },
        ],
      },
      // 数据安全
      {
        path: "/dataMGT",
        name: "dataMGT",
        children: [
          // 数据备份和恢复
          {
            path: "/dataMGT/backup",
            component: (resolve) =>
              require(["@/components/DbBackup/backup.vue"], resolve),
            name: "backup",
          },
        ],
      },
      // 其他数据
      {
        path: "/others",
        name: "others",
        children: [
          // 服务主体
          {
            path: "/others/service_subject",
            component: (resolve) =>
              require(["@/components/forms/Service_subject.vue"], resolve),
            name: "Service_subject",
          },

        
        ],
      },
    ],
  },
];
