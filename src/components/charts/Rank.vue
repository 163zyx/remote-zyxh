<template>
  <div class="com-container">
    <div
      class="com-chart"
      ref="rankRef"
      key=""
      v-loading="loading"
      element-loading-text="正在加载各乡镇推广面积数据"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
  </div>
</template>

<script>
export default {
  // 地区销量排行
  name: "Rank",
  data() {
    return {
      ydata: [
        {
          town: "辛集",
          totalamount: 0.0,
        },
        {
          town: "苏村",
          totalamount: 0.0,
        },
        {
          town: "依汶",
          totalamount: 0.0,
        },
        {
          town: "湖头",
          totalamount: 0.0,
        },
        {
          town: "砖埠",
          totalamount: 0.0,
        },
        {
          town: "蒲汪",
          totalamount: 0.0,
        },
        {
          town: "青坨",
          totalamount: 0.0,
        },
        {
          town: "杨坡",
          totalamount: 0.0,
        },
        {
          town: "双堠",
          totalamount: 0.0,
        },
        {
          town: "大庄",
          totalamount: 0.0,
        },
        {
          town: "界湖",
          totalamount: 0.0,
        },
        {
          town: "张庄",
          totalamount: 0.0,
        },
        {
          town: "岸堤",
          totalamount: 0.0,
        },
        {
          town: "马牧池",
          totalamount: 0.0,
        },
        {
          town: "孙祖",
          totalamount: 0.0,
        },
        {
          town: "铜井",
          totalamount: 0.0,
        },
      ],
      // 图表的实例对象
      chartInstance: null,

      loading: false,
    };
  },
  watch: {
    theme() {
      console.log("主题切换了");
      // 销毁当前的图表
      this.chartInstance.dispose();
      // 以最新主题初始化图表对象
      this.initChart();
      // 屏幕适配
      this.screenAdapter();
      // 渲染数据
      this.updateChart();
    },
  },
  mounted() {
    this.initChart();
    // this.getData()
    window.addEventListener("resize", this.screenAdapter);
    // 主动触发 响应式配置
    this.screenAdapter();
    this.updateChart();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, "dark");

      const initOption = {
        backgroundColor: "rgba(0,0,0,0.3)",
        title: {
          text: "▎各乡镇推广面积（亩）",
          left: 20,
          top: 20,
        },
        grid: {
          top: "25%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          // 把x轴和y轴纳入 grid
          containLabel: true,
        },
        tooltip: {
          show: true,
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          value: "value",
        },
        series: [
          {
            type: "bar",
            label: {
              show: true,
              position: "top",
              color: "white",
              rotate: 30,
            },
          },
        ],
      };
      this.chartInstance.setOption(initOption);
    },

    /**
     * 获取销售表单
     */
    querySaleLedger() {
      const params = { offset: 0, limit: 10000000 };
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/selectAllSaleledger",
            { params }
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // 更新图表配置项
    async updateChart() {
      let that = this;
      try {
        that.loading = true;
        let saleTable = await that.querySaleLedger();
        if (saleTable) {
          for (let i = 0; i < saleTable.length; i++) {
            for (let j = 0; j < that.ydata.length; j++) {
              if (saleTable[i].townvillage) {
                if (saleTable[i].townvillage.includes(that.ydata[j].town)) {
                  if (saleTable[i].amount)
                    that.ydata[j].totalamount += Number(saleTable[i].amount);
                }
              }
            }
          }

          let dataX = [];
          let dataY = [];

          for (let i = 0; i < that.ydata.length; i++) {
            dataX.push(that.ydata[i].town);
            dataY.push(that.fun(that.ydata[i].totalamount));
          }

          // 渐变色数组
          const colorArr = [
            ["#0BA82C", "#4FF778"],
            ["#2E72BF", "#23E5E5"],
            ["#5052EE", "#AB6EE5"],
          ];

          const dataOption = {
            xAxis: {
              data: dataX,
            },

            series: [
              {
                data: dataY,
                itemStyle: {
                  color: (arg) => {
                    let targetColorArr = null;

                    if (arg.value > 5000) {
                      targetColorArr = colorArr[0];
                    } else if (arg.value > 2000) {
                      targetColorArr = colorArr[1];
                    } else {
                      targetColorArr = colorArr[2];
                    }

                    return new that.$echarts.graphic.LinearGradient(
                      0,
                      0,
                      0,
                      1,
                      [
                        // 0%
                        { offset: 0, color: targetColorArr[0] },
                        // 100%
                        { offset: 1, color: targetColorArr[1] },
                      ]
                    );
                  },
                },
              },
            ],
          };
          that.chartInstance.setOption(dataOption);
          // that.loading = true;
        }
      } catch (error) {
      } finally {
        that.loading = false;
      }
    },
    // 根据图标容器的宽度 计算各属性、标签、元素的大小
    screenAdapter() {
      let that = this;
      const titleFontSzie = (that.$refs.rankRef.offsetWidth / 100) * 3.6;

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: 25,
          },
        },
        series: [
          {
            barWidth: titleFontSzie,
            itemStyle: {
              barBorderRadius: [titleFontSzie / 4, titleFontSzie / 4, 0, 0],
            },
          },
        ],
      };
      that.chartInstance.setOption(adapterOption);
      that.chartInstance.resize();
    },

    fun(val) {
      return Number(val).toFixed(0);
    },
  },
};
</script>

<style scoped></style>