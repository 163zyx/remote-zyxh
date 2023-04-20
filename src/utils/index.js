import CommonUtil from "./Common/index";
const install = function(Vue, options) {
  Vue.$CommonUtil = Vue.prototype.$CommonUtil = CommonUtil;
};

export default {
  install,
};
