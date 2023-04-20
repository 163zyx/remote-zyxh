<template>
  <div class="com-container">
    <div
      class="com-chart"
      id="main"
      ref="seller_ref"
      v-loading="loading"
      element-loading-text="正在加载土肥年推广数据"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      chartInstance: null,
      SaleLedgerRes: null, //销售台账

      PrcdLedgerRes: null, //生产记录台账
      loading: false,
    };
  },
  watch: {
    theme() {
      // console.log('主题切换了')
      // // 销毁当前的图表
      this.chartInstance.dispose();
      // // 以最新主题初始化图表对象
      this.initChart();
      // 屏幕适配
      this.screenAdapter();
      // 渲染数据
      this.updateChart();
    },
  },
  mounted() {
    this.initChart();
    this.updateChart();
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  // 实例销毁后触发
  destroyed() {
    clearInterval(this.timeID);
    // window.onresize = null;
    // 在组件销毁的时候，把监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    // step1：初始化图表
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, "dark");
      // 对图表初始化的配置
      const initOption = {
        backgroundColor: "rgba(0,0,0,0.3)",
        title: {
          text: "▎土肥年推广量统计（吨）",
          left: 20,
          top: 20,
        },
        grid: {
          top: "15%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          // 默认grid不包含坐标轴文字，改为true
          containLabel: true,
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
          inverse: true,
        },
        tooltip: {
          // 当鼠标移入axis(坐标轴)时展示 底层的背景色
          trigger: "axis",
          axisPointer: {
            // 展示的类型是线条类型
            type: "line",
            lineStyle: {
              color: this.axisPointerColor,
            },
            // 相等于 z-index 将层级调低
            z: 0,
          },
        },
        series: [],
      };
      this.chartInstance.setOption(initOption);
    },
    /**
     * 构建where查询条件（用户超管用户）
     */
    createWherein() {
      let serviceIdWherein = new Array();
      for (var i = 0; i < 10000; i++) serviceIdWherein.push(i);
      return serviceIdWherein;
    },

    // step2：更新图表
    async updateChart() {
      let that = this;

      try {
        that.loading = true;
        that.SaleLedgerRes = await that.querySaleLedger();
        that.PrcdLedgerRes = await that.getPrdLedgerData();
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
            that.createWherein()
          )
          .then((res) => {
            var seriesData = {
              yList: [], //服务主体名称
              x1List: [], //年推广量
              x2List: [], //销售量
              x3List: [], //库存
            };

            res.data.forEach((element) => {
              seriesData.yList.push(element.serviceshortnm);
              seriesData.x1List.push(Number(element.prmtamountquota).toFixed(2));
              let x2 = 0;
              if (that.SaleLedgerRes) {
                for (let i = 0; i < that.SaleLedgerRes.length; i++) {
                  if (
                    that.SaleLedgerRes[i].servicesubject == element.serviceid
                  ) {
                    x2 += Number(that.SaleLedgerRes[i].amount);
                  }
                }
              }
              let cl = 0; //产量统计
              if (that.PrcdLedgerRes) {
                for (let i = 0; i < that.PrcdLedgerRes.length; i++) {
                  if (that.PrcdLedgerRes[i].serviceid == element.serviceid) {
                    cl += Number(that.PrcdLedgerRes[i].outputweight);
                  }
                }
              }

              let x3 = Number(cl) - x2;
              if (x3 < 0) x3 = 0;

              seriesData.x2List.push(Number(x2).toFixed(2));
              seriesData.x3List.push(Number(x3).toFixed(2));
            });

            const dataOption = {
              yAxis: {
                data: seriesData.yList,
              },
              series: [
                {
                  name: "年推广量",

                  type: "bar",

                  data: seriesData.x1List,
                  itemStyle: {
                    color: "#3A5FCD",
                  },
                },

                {
                  name: "销售量",

                  type: "bar",

                  data: seriesData.x2List,
                  itemStyle: {
                    color: "#7FFFD4",
                  },
                },
                {
                  name: "库存",

                  type: "bar",

                  data: seriesData.x3List,
                  itemStyle: {
                    color: "#B0C4DE",
                  },
                },
              ],
            };
            that.chartInstance.setOption(dataOption);
          })
          .catch((err) => {});
      } catch (err) {
      } finally {
        that.loading = false;
      }
    },
    // step3：初始化图表
    screenAdapter() {
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
      // 浏览器分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: 25,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              // width: titleFontSize,
            },
          },
        },
        series: [
          {
            // barWidth: titleFontSize,
            itemStyle: {
              //barBorderRadius: [0, titleFontSize / 4, titleFontSize / 4, 0],
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      // 手动调用图表的 resize 才能产生效果
      this.chartInstance.resize();
    },

    /**
     * 获取销售表单
     */
    querySaleLedger() {
      let that = this;
      return new Promise((resolve, reject) => {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/selectByServiceid",
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

    // 获取“生产记录台账”数据
    getPrdLedgerData() {
      let that = this;
      return new Promise((resolve, reject) => {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/selectByServiceid",
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
  },
};
</script>

<style scoped>
</style>