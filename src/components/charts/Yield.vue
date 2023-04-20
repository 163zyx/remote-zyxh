<template>
  <div class="com-container">
    <div class="com-chart" id="main" ref="yield_ref"></div>
  </div>
</template>


<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.myChart();
    window.addEventListener("resize", this.chartResize);
  },
  destroyed() {
    window.removeEventListener("resize", this.chartResize);
  },
  methods: {
    myChart() {
      var chartDom = document.getElementById("main");
      var myChart = this.$echarts.init(chartDom, "dark");
      var option;
      option = {
        title: {
          text: "▎原料、辅料产量对比",
          textStyle: {
            fontSize: 30,
          },
          left: 20,
          top: 5,
        },
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLable: true,
        },
        animation: true,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },

        legend: {},
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
        },
        yAxis: {
          type: "category",
          data: [
            "堆沤批次:100006",
            "堆沤批次:100005",
            "堆沤批次:100004",
            "堆沤批次:100003",
            "堆沤批次:100002",
            "堆沤批次:100001",
          ],
        },
        series: [
          {
            name: "原料、辅料（吨）",
            type: "bar",
            data: [1.8203, 2.3489, 2.9034, 1.0497, 1.31744, 6.3023],
            color: "#52f8fd",
          },

          {
            name: "产量（吨）",
            type: "bar",
            data: [1.9325, 2.3438, 3.1, 1.21594, 1.34141, 6.81807],
            color: "#397acf",
          },
        ],
      };

      option && myChart.setOption(option);
    },
    //屏幕适配
    chartResize() {
      let eleArr = [this.AreaPiecesChart, this.electricityChart];
      for (let i = 0; i < eleArr.length; i++) {
        //此处定时器是为了在页面存在多个图时，resize方法的调用时间微微错开，避免明显的卡顿
        setTimeout(function () {
          eleArr[i].resize();
        }, 200);
      }
    },
  },
};
</script>

<style scoped>
</style>