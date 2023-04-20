import Vue from "vue";
import App from "./App.vue";
import router from "@/router/index.js"; //引入路由器

import "../src/assets/css/global.css";
import axios from "axios";
import echarts from "echarts";
import ElementUI, { Message } from "element-ui";
import particles from "vue-particles";
import scroll from "vue-seamless-scroll";
import "./plugins/element.js";
import VCharts from "v-charts";

import qs from "qs";
import AmapVue from "@amap/amap-vue";

import "./utils/dialog"; //可拖拽dialog
import myCommon from "./utils/index"; //引入自定义工具类
Vue.use(myCommon);
Vue.prototype.$message = Message;
//配全局属性配置，在任意组件内可以使用this.$qs获取qs对象
Vue.prototype.$echarts = echarts;
Vue.prototype.$qs = qs;
Vue.prototype.$axios = axios;
// 请求基准路径的配置
axios.defaults.baseURL = "http://127.0.0.1:8808/tfDbOperator-2.0/";
axios.defaults.baseURL = "/";
AmapVue.config.version = "2.0"; // 默认2.0，这里可以不修改
AmapVue.config.key = "538e31d1cb81ddaeb7d2f00de9b1f231";
AmapVue.config.plugins = [
  "AMap.ToolBar",
  "AMap.MoveAnimation",
  // 在此配置你需要预加载的插件，如果不配置，在使用到的时候会自动异步加载
];
Vue.use(AmapVue);
Vue.use(VCharts);

Vue.use(scroll);
Vue.use(ElementUI);
Vue.use(particles);

Vue.config.productionTip = false;

new Vue({
  router,

  render: function(h) {
    return h(App);
  },
}).$mount("#app");
