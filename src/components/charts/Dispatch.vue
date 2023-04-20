<template>
  <div class="com-container">
    <div class="com-chart" id="dispatch_list">
      <span class="title">▎实时价格</span>
      <div
        class="content"
        v-loading="loading"
        element-loading-text="正在加载实时价格数据"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <!-- <vue-seamless-scroll
          :data="listData"
          :class-option="classOption"
          class="seamless-warp"
        > -->
        <vue-seamless-scroll
          :data="listData"
          class="seamless-warp"
        >
          <ul class="item">
            <li v-for="item in listData" :key="item">
              <div class="line">
                <span class="item" v-text="item.servicename"></span>
                <span>|</span>
                <span class="item" v-text="item.price"></span>
                <span>|</span>
                <span class="item" v-text="item.pricedate"></span>
              </div>
              <!-- <span class="item" v-text="item.servicename"></span>
              <span> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; </span>
              <span class="item" v-text="item.price"></span>
              <span> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; </span>
              <span class="item" v-text="item.pricedate"></span> -->
            </li>
          </ul>
        </vue-seamless-scroll>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      listData: [],
      loading: false,
    };
  },

  created() {
    this.getServicePriceData();
  },

  mounted() {
    // 请求数据
  },

  methods: {
    /**
     * 构建where查询条件（用户超管用户）
     */
    createWherein() {
      let serviceIdWherein = new Array();
      for (var i = 0; i < 10000; i++) serviceIdWherein.push(i);
      return serviceIdWherein;
    },

    // 获取“服务主体”数据
    getServiceSubData() {
      var that = this;

      return new Promise((resolve, reject) => {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
            that.createWherein()
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // 获取“销售价格”数据
    async getServicePriceData() {
      var that = this;
      that.loading = true;

      try {
        that.servicesublist = await that.getServiceSubData();

        if (that.servicesublist) {
          const wherein = [];
          for (let i = 0; i < that.servicesublist.length; i++) {
            wherein.push(that.servicesublist[i].serviceid);
          }
          that.$axios
            .post(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfRealtimeprice/selectByServiceid",
              wherein
            )
            .then((res) => {
              that.listData = res.data;
              that.listData = that.mergePrice();
              that.listData.sort(function (a, b) {
                var value1 = a.serviceid;
                var value2 = b.serviceid;
                return value1 - value2; //升序排序
              });
              that.dateConvert(); //日期格式转换
              that.listData = that.dataReplaceSericeid(); //获取服务主体名
            })
            .catch((err) => {
              that.$message.error("销售价格数据获取失败");
            });
        } else {
          that.$message.error("服务主体数据获取失败");
        }
      } catch (error) {
      } finally {
        that.loading = false;
      }
    },

    /**
     * 获取服务主体最新价格
     */
    mergePrice() {
      let that = this;
      let arr = that.listData;

      let testArr = [];
      let resultArr = [];
      for (let i = 0; i < arr.length; i++) {
        if (testArr.indexOf(arr[i].serviceid) === -1) {
          resultArr.push({
            serviceid: arr[i].serviceid,
            price: arr[i].price,
            pricedate: arr[i].pricedate,
          });
          testArr.push(arr[i].serviceid);
        } else {
          for (let j = 0; j < resultArr.length; j++) {
            if (
              Date.parse(resultArr[j].pricedate) <
                Date.parse(arr[i].pricedate) &&
              resultArr[j].serviceid == arr[i].serviceid
            ) {
              resultArr[j].price = arr[i].price;
              break;
            }
          }
        }
      }

      return resultArr;
    },

    /**
     * 将服务主体id替换为服务主体名
     */
    dataReplaceSericeid() {
      let that = this;
      let newtable = [];
      for (var i = 0; i < that.listData.length; i++) {
        if (that.listData[i].serviceid != null) {
          let rowobj = {
            servicename: that.getServiceNameByID(that.listData[i].serviceid),
            price: that.listData[i].price + "元/吨",
            pricedate: that.listData[i].pricedate,
          };
          newtable.push(rowobj);
        }
      }
      return newtable;
    },

    /**
     * 根据服务主体ID获取名称
     */
    getServiceNameByID(serviceid) {
      let that = this;
      var servicename;
      //遍历查询服务主体名称
      for (var j = 0; j < that.servicesublist.length; j++) {
        if (that.servicesublist[j].serviceid == serviceid) {
          servicename = that.servicesublist[j].serviceshortnm;
          break;
        }
      }
      return servicename;
    },

    /**
     * 根据服务主体名称获取id
     */
    getServiceIDByName(servicename) {
      let that = this;
      var serviceid;
      //遍历查询服务主体名称
      for (var j = 0; j < that.servicesublist.length; j++) {
        if (that.servicesublist[j].servicename == servicename) {
          serviceid = that.servicesublist[j].serviceid;
          break;
        }
      }
      return serviceid;
    },

    //日期转换
    dateConvert() {
      let that = this;
      for (var i = 0; i < that.listData.length; i++) {
        if (that.listData[i].pricedate != null) {
          that.listData[i].pricedate = that.dateFormat(
            "YYYY-mm-dd", //范例：年-月-日 时:分 "YYYY-mm-dd HH:MM"
            new Date(that.listData[i].pricedate)
          );
        }
      }
    },

    //日期格式化
    dateFormat(fmt, date) {
      let ret;
      const opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      };
      for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
          fmt = fmt.replace(
            ret[1],
            ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
          );
        }
      }
      return fmt;
    },
  },
};
</script>



<style lang="less" scoped>
* {
  padding: 0;
  margin: 0;
}
#dispatch_list {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding-top: 0.936rem;
  padding-left: 1.56rem;
  .title {
    line-height: 45px;
    font-size: 1.56rem;
    font-weight: bolder;
  }
  .content {
    margin-top: 0.624rem;
    height: 100%;
    width: 90%;
  }
  .item {
    line-height: 1.87rem;

    font-weight: normal;
    color: #87cefa; /*文字颜色*/
  }
  ul {
    list-style-type: none;
  }
  .line {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
   
    overflow: hidden;
  }
  .seamless-warp {
    height: 100%;
    overflow: hidden;
  }
}
</style>