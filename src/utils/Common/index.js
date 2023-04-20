/**
 * 公共函数工具类
 * 时间格式判断、手机号验证、身份证验证等常用工具
 * 刘文龙 2022.05.03
 */
let CommonUtil = {
  /**
   * 判断是否为日期格式
   * @param {*} val
   * @returns
   */
  isRealDate: (val) => {
    var reg = /^[0-9,/:-\s]+$/;
    if (
      !isNaN(Date.parse(new Date(val.replace(/-/g, "/")))) &&
      isNaN(val) &&
      reg.test(val)
    ) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * 验证手机号是否合格
   * @param {*} phoneStr
   * @returns true  合格
   */
  isPhone: (phoneStr) => {
    let myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(phoneStr)) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * 验证身份证号是否合格
   * @param {*} idCardStr
   * @returns true 说明合格
   */
  isIdCard: (idCardStr) => {
    let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
    if (idcardReg.test(idCardStr)) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * 验证字符串是否为空
   * @param {*} string
   * @returns ture 说明为空  false 说明不为空
   */
  isEmptyString: (string) => {
    if (
      string == undefined ||
      typeof string == "undefined" ||
      !string ||
      string == null ||
      string == "" ||
      /^\s+$/gi.test(string)
    ) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * 判断数据类型
   * @param {any} val - 基本类型数据或者引用类型数据
   * @return {string} - 可能返回的结果有，均为小写字符串
   * number、boolean、string、null、undefined、array、object、function等
   */
  getType: (val) => {
    //判断数据是 null 和 undefined 的情况
    if (val == null) {
      return val + "";
    }
    return typeof val === "object"
      ? Object.prototype.toString
          .call(val)
          .slice(8, -1)
          .toLowerCase()
      : typeof val;
  },

  /**
   * 验证是否为数字
   * @param {*} n
   * @returns
   */
  isNumber: (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  /**
   * 是否为数组
   * @param {*} obj
   * @returns
   */
  isArray: (obj) => {
    return Object.prototype.toString.call(obj) === "[object Array]";
  },

  /**
   * 是否为空数组
   * @param {*} val
   * @returns
   */
  isArrayEmpty: (val) => {
    if (val && val instanceof Array && val.length > 0) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * 获取url参数字符串
   * @param {*} name
   * @returns 没有返回null
   */
  getQueryString: (name) => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  },

  /**
   * 函数防抖
   * @desc  函数防抖，用于将多次执行变为最后一次执行
   * @param {function} func - 需要使用函数防抖的被执行的函数。必传
   * @param {Number} wait - 多少毫秒之内触发，只执行第一次，默认1000ms。可以不传
   */
  debounce: (fn, delay) => {
    delay = delay || 1000; //默认1s后执行
    let timer = null;
    return function() {
      let context = this;
      let arg = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn.apply(context, arg);
      }, delay);
    };
  },

  /**
   * 节流函数, 用于将多次执行变为每隔一段时间执行
   * @param fn 事件触发的操作
   * @param delay 间隔多少毫秒需要触发一次事件
   */
  throttle2: (fn, delay) => {
    let timer = null;
    return function() {
      let context = this;
      let args = arguments;
      if (!timer) {
        timer = setTimeout(function() {
          fn.apply(context, args);
          clearTimeout(timer);
        }, delay);
      }
    };
  },

  /**
   * 将字符串时间转换为时间戳
   * @param {string} date
   */
  getDateTime: (date) => {
    let timestamp = "";
    if (date) {
      date = date.substring(0, 19);
      date = date.replace(/-/g, "/"); //必须把日期'-'转为'/'
      timestamp = new Date(date).getTime();
    }
    return timestamp;
  },

  /**
   * 获取年-月-日
   * @data {Any} 时间戳
   */
  getDates: (data) => {
    let timeObj = {};
    data = new Date(data);
    let y = data.getFullYear();
    let m =
      data.getMonth() + 1 < 10
        ? "0" + (data.getMonth() + 1)
        : data.getMonth() + 1;
    let d = data.getDate() < 10 ? "0" + data.getDate() : data.getDate();
    let w = data.getDay();
    switch (w) {
      case 1:
        w = "星期一";
        break;
      case 2:
        w = "星期二";
        break;
      case 3:
        w = "星期三";
        break;
      case 4:
        w = "星期四";
        break;
      case 5:
        w = "星期五";
        break;
      case 6:
        w = "星期六";
        break;
      case 7:
        w = "星期日";
        break;
    }
    let h = data.getHours() < 10 ? "0" + data.getHours() : data.getHours();
    let mi =
      data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes();
    let s =
      data.getSeconds() < 10 ? "0" + data.getSeconds() : data.getSeconds();
    timeObj = {
      year: y + "",
      month: m + "",
      day: d + "",
      week: w + "",
      hour: h + "",
      minute: mi + "",
      second: s + "",
    };
    return timeObj;
  },

  /**
   * Excel时间戳格式化
   * @param {*} exceldata
   * @returns
   */
  converExcelDate: (exceldata) => {
    let time = new Date(
      (exceldata - 25567) * 24 * 3600000 -
        5 * 60 * 1000 -
        43 * 1000 -
        24 * 3600000 -
        8 * 3600000
    );
    let year = time.getFullYear() + "";
    let month = time.getMonth() + 1 + "";
    let date = time.getDate() + "";
    return year + "/" + month + "/" + date;
  },
};

export default CommonUtil;
