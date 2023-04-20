<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="header_logo">
        <img src="../assets/image/yinan_login_logo.png" alt="" />
      </div>
      <!-- 右上角用户+退出 -->
      <div class="dropdown">
        <h1><i class="el-icon-user-solid"></i></h1>
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ jurisdiction[sessionstorage_userInfo.authority] }} |
            {{ sessionstorage_userInfo.username
            }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              ><span @click="go_dashboard">数据大屏</span></el-dropdown-item
            >
            <el-dropdown-item divided
              ><span @click="logout">退出登录</span></el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <!-- 侧边栏菜单区 -->
        <el-menu
          ref="cebianlan"
          :collapse="isCollapse"
          class="el-menu-vertical-demo"
          background-color="rgb(42, 48, 62)"
          text-color="#fff"
          collapse-transition
          default-active="2"
          :unique-opened="true"
          router
        >
          <!-- 功能1 台账管理 -->
          <myitem :data="this.menuArr"></myitem>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import myitem from "../components/myitem.vue"; //导入侧边菜单递归组件
export default {
  name: "Home",
  components: {
    myitem,
  },
  inject: ["reload"], //刷新时注入reload方法

  data() {
    return {
      menuArr: [],
      // activeIndex: this.$route.path,
      isCollapse: false,
      jurisdiction: {
        //权限分类
        enterpriseadmin: "企业用户",
        superadmin: "超级管理员",
      },
      sessionstorage_userInfo: {
        //session存储用户
        username: window.sessionStorage.getItem("username"), //用户名
        authority: window.sessionStorage.getItem("jurisdiction"), //权限
      },

      // 菜单数据
      menuMap: {
        // 超级用户
        admin: [
          // 台账管理
          {
            name: "台账管理",
            path: "/accountMGT",
            icon: "el-icon-notebook-1",
            children: [
              {
                name: "原料进厂台账",
                path: "/yl_incomes",
                children: [],
              },
              {
                name: "生产记录台账",
                path: "/prdc_ledger",
                children: [],
              },
              {
                name: "企业传感器数据",
                path: "/epsensor_data",
                children: [],
              },
              {
                name: "生产记录表",
                path: "/prdc_record",
                children: [],
              },
              {
                name: "产量确认表",
                path: "/prdc_confirm",
                children: [],
              },
              {
                name: "销售台账",
                path: "/ff_sales",
                children: [],
              },
              {
                name: "供应明细表",
                path: "/supdetail",
                children: [],
              },
            ],
          },
          // 用户管理
          {
            name: "用户管理",
            icon: "el-icon-user",
            path: "/userMGT",
            children: [],
          },
          // 数据安全
          {
            name: "数据安全",
            icon: "el-icon-lock",
            path: "/dataMGT",
            children: [
              {
                name: "数据备份与恢复",
                path: "/backup",
                children: [],
              },
            ],
          },
          // 其他数据
          {
            name: "其他数据",
            icon: "el-icon-document-copy",
            path: "/otherData",
            children: [
              
              {
                name: "产品自检",
                path: "/prdc_quality",
                children: [],
              },
              {
                name: "产品抽检",
                path: "/prdc_qualityspot",
                children: [],
              },
              {
                name: "取样记录",
                path: "/SampleRecord",
                children: [],
              },
               {
                name: "第三方检测",
                path: "/Prdc_qualitythird",
                children: [],
              },
            ],
          },

          // 设置
          {
            name: "设置",
            path: "/setting",
            icon: "el-icon-s-tools",
            children: [
              {
                name: "企业管理",
                path: "/service_subject",
                children: [],
              },
              {
                name: "销售指标设置",
                path: "/sale_target",
                children: [],
              },
              {
                name: "销售价格设置",
                path: "/serviceprice",
                children: [],
              },
              {
                name: "视频设备绑定",
                path: "/video_config",
                children: [],
              },
              {
                name: "GPS设备绑定",
                path: "/gps_config",
                children: [],
              },
              {
                name: "传感器管理",
                path: "/sensor_config",
                children: [],
              },
              {
                name: "抽检用户管理",
                path: "/spot-check_config",
                children: [],
              }
            ]
          }
        ],
        // 企业用户
        normal: [
          // 台账管理
          {
            name: "台账管理",
            path: "/accountMGT",
            children: [
              {
                name: "原料进厂台账",
                path: "/yl_incomes",
                children: [],
              },
              {
                name: "生产记录台账",
                path: "/prdc_ledger",
                children: [],
              },
              {
                name: "生产记录表",
                path: "/prdc_record",
                children: [],
              },
              {
                name: "产量确认表",
                path: "/prdc_confirm",
                children: [],
              },
              {
                name: "销售台账",
                path: "/ff_sales",
                children: [],
              },
              {
                name: "供应明细表",
                path: "/supdetail",
                children: [],
              },
            ],
          },
        ],
      },
    };
  },
  created() {
    this.getMenuList(); // 获取菜单权限
  },
  mounted() {
    // console.log(this);
  },
  methods: {
    // 菜单权限
    getMenuList() {
      if (this.sessionstorage_userInfo.authority === "superadmin") {
        this.menuArr = this.menuMap.admin;
      } else {
        this.menuArr = this.menuMap.normal;
      }
    },

    //退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear();
      // 跳转登录页面
      this.$router.push("/login");
    },
    //返回数据大屏
    go_dashboard() {
      this.$router.push("/screen");
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
//右上角下拉
.dropdown {
  color: #52f8fd;
  .el-dropdown-link {
    cursor: pointer;
    color: #52f8fd;
  }
  .el-icon-user-solid {
    margin-right: 15px;
  }
}

.el-header {
  background-color: rgb(42, 48, 62);
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
  }
}
.el-aside {
  background-color: rgb(42, 48, 62);
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: rgb(246, 246, 246);
}
</style>