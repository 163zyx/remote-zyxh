<template>
  <div class="com-container">
    <div
      style="
        right: 20px;
        top: 20px;
        margin: auto;
        flex-direction: row;
        position: absolute;
        z-index: 9999;
      "
    >
      <el-popover placement="right" width="400" trigger="click">
        <el-checkbox-group
          v-model="checkedService"
          :min="1"
          :max="5"
          size="mini"
          @change="handleCheckChange"
        >
          <el-checkbox-button
            v-for="serviceItem in servicesublist"
            :label="serviceItem.serviceshortnm"
            :key="serviceItem.serviceid"
            >{{ serviceItem.serviceshortnm }}</el-checkbox-button
          >
        </el-checkbox-group>
        <el-link type="primary" :underline="false" slot="reference"
          >企业筛选</el-link
        >
      </el-popover>
    </div>
    <div
      class="com-chart"
      ref="stockRef"
      v-loading="loading"
      element-loading-text="正在加载企业推广进度数据"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  // 库存和销量分析
  name: "Stock",
  data() {
    return {
      checkedService: [],
      servicesublist: [],

      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      chartData: [],
      // 当前显示数据的页数
      currentIndex: 1,
      // 定时器标识
      timerId: null,
      // 圆环坐标
      centerArr: [
        ["14%", "50%"],
        ["48%", "50%"],
        ["82%", "50%"],
        ["31%", "78%"],
        ["65%", "78%"],
      ],
      // 圆环渐变色
      colorArr: [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#5052EE", "#AB6EE5"],
        ["#23E5E5", "#2E72BF"],
      ],
      loading: false,
    };
  },

  watch: {
    theme() {
      //   console.log('主题切换了')
      //   // 销毁当前的图表

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
    let that = this;

    that.$axios
      .post(
        "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
        this.createWherein()
      )
      .then((res) => {
        that.servicesublist = res.data;
        const firtFive = []; //初始化加载前五个企业
        for (let i = 0; i < 5; i++) {
          firtFive.push(that.servicesublist[i].serviceid);
        }
        that.initChartdata(firtFive);

        window.addEventListener("resize", that.screenAdapter);
        // 主动触发 响应式配置
        that.screenAdapter(), console.log("screenadapter");
      })

      .catch((err) => {
        //that.$message.error("获取数据失败");
      });
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timerId);
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

    handleCheckChange(value) {
      // let checkedCount = value.length;
      // this.checkAll = checkedCount === this.cities.length;
      // this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
      let that = this;
      if (value) {
        let checklist = [];
        value.forEach((element) => {
          checklist.push(that.getServiceIDByName(element));
        });
        that.chartInstance.dispose();
        that.initChartdata(checklist);
      } else {
        that.$message({
          message: "请选择至少一个统计企业",
          type: "warning",
        });
      }
    },

    initChartdata(checklist) {
      let that = this;
      try {
        that.loading = true;
        that.checkedService = [];
        that.chartData = [];
        for (let i = 0; i < that.servicesublist.length; i++) {
          for (let j = 0; j < checklist.length; j++) {
            if (checklist[j] == that.servicesublist[i].serviceid) {
              that.checkedService.push(that.servicesublist[i].serviceshortnm);
              that.chartData.push({
                name: that.servicesublist[i].serviceshortnm,
                stock: that.servicesublist[i].prmtamountquota,
                sales: 0.0,
              });
            }
          }
        }

        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/selectByServiceid",
            checklist
          )

          .then((res) => {
            let SaleLedgerRes = res.data;
            for (let i = 0; i < that.chartData.length; i++) {
              SaleLedgerRes.forEach((saleelement) => {
                if (
                  saleelement.servicesubject ==
                  that.getServiceIDByName(that.chartData[i].name)
                ) {
                  that.chartData[i].sales += Number(saleelement.amount);
                  that.chartData[i].sales = parseInt(that.chartData[i].sales);
                }
              });
            }

            that.initChart();
            that.screenAdapter();
            that.updateChart();
            that.loading = false;
          })
          .catch((err) => {
            that.$message.error("获取数据失败");
            that.loading = false;
          });
      } catch (error) {
      } finally {
      }
    },

    /**
     * 根据服务主体名称获取id
     */
    getServiceIDByName(servicename) {
      let that = this;
      var serviceid;
      //遍历查询服务主体名称
      for (var j = 0; j < that.servicesublist.length; j++) {
        if (that.servicesublist[j].serviceshortnm == servicename) {
          serviceid = that.servicesublist[j].serviceid;
          break;
        }
      }
      return serviceid;
    },
    // 初始化图表的方法
    initChart() {
      let that = this;

      that.chartInstance = that.$echarts.init(that.$refs.stockRef, "dark");
      const initOption = {
        backgroundColor: "rgba(0,0,0,0.3)",
        title: {
          text: "▎企业推广进度（吨）",
          left: 20,
          top: 20,
        },
      };
      that.chartInstance.setOption(initOption);
    },

    // 更新图表配置项
    updateChart() {
      let that = this;
      // 真实显示的数据
      let seriesArr = that.chartData.map((item, index) => {
        const kc = item.stock - item.sales;
        return {
          type: "pie",
          // 设置成圆环图，外圆半径，内圆半径 在响应式处指定
          //radius: [70, 60],

          // 饼图的位置
          center: that.centerArr[index],
          // 关闭鼠标移入到饼图的动画效果
          hoverAnimation: false,
          // 隐藏指示线条
          labelLine: {
            show: false,
          },
          label: {
            position: "center",
            color: that.colorArr[index][0],
          },
          data: [
            // 销量
            {
              name: item.name + "\n\n" + item.sales,
              value: item.sales,
              itemStyle: {
                // 创建线性渐变的颜色 从下往上
                color: new that.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  // 0%
                  { offset: 0, color: that.colorArr[index][0] },
                  // 100%
                  { offset: 1, color: that.colorArr[index][1] },
                ]),
              },
              // 内部的提示框 c数值 d百分比
              tooltip: {
                formatter: `${item.name} <br/>销量：{c} <br/>占比：{d}%`,
              },
            },
            // 库存
            {
              name: item.name + "\n\n" + item.sales,
              value: kc,

              itemStyle: {
                color: "#bbb",
              },
              // 内部的提示框
              tooltip: {
                formatter: `${item.name} <br/>库存：{c} <br>占比：{d}%`,
              },
            },
          ],
        };
      });

      const dataOption = {
        tooltip: {
          // 这里为item 可以为内部的数据开启 单独的 tooltip
          trigger: "item",
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    // 不同分辨率的响应式
    screenAdapter() {
      let that = this;
      const titleFontSize = (that.$refs.stockRef.offsetWidth / 100) * 3.6;
      console.log("titleFontSize: ", titleFontSize);
      // 圆的内院半径和 外圆半径
      const innerRadius = titleFontSize * 2.8;
      const outerRadius = innerRadius * 1.2;
      console.log("outerRadius: ", outerRadius);

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: 25,
          },
        },
        series: [
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
        ],
      };
      that.chartInstance.setOption(adapterOption);
      that.chartInstance.resize();
    },
  },
};
</script>

<style scoped>
</style>