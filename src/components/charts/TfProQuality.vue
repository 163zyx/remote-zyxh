<template>
  <div class="com-container">
    <div
      class="com-chart"
      id="main"
      ref="tfproq_ref"
      v-loading="loading"
      element-loading-text="正在加载土肥产品质量数据"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
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
  </div>
</template>


<script>
export default {
  data() {
    return {
      checkedService: [],
      servicesublist: [],
      chartInstance: null,
      tableData: [],
      loading: false,
    };
  },
  watch: {
    theme() {
      // console.log('主题切换了')
      // // 销毁当前的图表
      // this.chartInstance.dispose()
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
    console.log("初始化成功");
    this.updateChart();
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  // 实例销毁后触发
  destroyed() {
    clearInterval(this.timeID);
    // 在组件销毁的时候，把监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
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

    /**
     * 将服务主体id替换为服务主体名
     */
    dataReplaceSericeid() {
      let that = this;
      let newtable = [];
      for (var i = 0; i < that.tableData.length; i++) {
        if (that.tableData[i].serviceid != null) {
          let rowobj = {
            servicename: that.getServiceNameByID(that.tableData[i].serviceid),
            rettingbatch: that.tableData[i].rettingbatch,
            water: that.tableData[i].water,
            temperature: that.tableData[i].temperature,
            organic: that.tableData[i].organic,
            //monitordate: that.tableData[i].monitordate,
          };
          newtable.push(rowobj);
        }
      }
      //右下角图的数据
      // console.log("newtable",newtable)
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

    // step1：初始化图表
    initChart() {
      let that = this;
      that.chartInstance = that.$echarts.init(that.$refs.tfproq_ref, "dark");
      // 对图表初始化的配置
      const initOption = {
        backgroundColor: "rgba(0,0,0,0.3)",
        title: {
          text: "▎土肥产品质量分析",
          left: 20,
          top: 20,
        },
        grid: {
          top: "25%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          // 默认grid不包含坐标轴文字，改为true
          containLabel: true,
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          type: "value",
        },
        tooltip: {
          // 当鼠标移入axis(坐标轴)时展示 底层的背景色
          trigger: "axis",
          axisPointer: {
            // 展示的类型是线条类型
            type: "line",
            lineStyle: {
              color: that.axisPointerColor,
            },
            // 相等于 z-index 将层级调低
            z: 0,
          },
        },
      };
      that.chartInstance.setOption(initOption);
    },

    // step2：更新图表
    async updateChart() {
      var that = this;

      try {
        that.loading = true;

        that.servicesublist = await that.getServiceSubData();

        if (that.servicesublist) {
          const wherein = [];
          for (let i = 0; i < that.servicesublist.length; i++) {
            wherein.push(that.servicesublist[i].serviceid);
          }

          that.$axios
            .post(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProquality/selectByServiceid",
              wherein
            )
            .then((res) => {
              that.tableData = res.data;
              //这个地方是有数据的
              console.log("tableData",that.tableData)
              that.tableData.sort(function (a, b) {
                var value1 = a.serviceid;
                var value2 = b.serviceid;
                return value1 - value2; //升序排序
              });

              that.tableData = that.mergeQuality();

              that.dateConvert(); //日期格式转换
              that.tableData = that.dataReplaceSericeid(); //获取服务主体名

              let ydata = [],
                x1data = [],
                x2data = [],
                x3data = [];

              for (let i = 0; i < that.tableData.length; i++) {
                ydata.push(that.tableData[i].servicename);
                x1data.push(that.tableData[i].temperature);
                x2data.push(that.tableData[i].water);
                x3data.push(that.tableData[i].organic);
              }
              //将数据分组到这里显示在土肥铲平分析中
              // console.log("x1data",x1data)
              // console.log("x2data",x2data)
              // console.log("x3data",x3data)
              // console.log("ydata",ydata)
              const dataOption = {
                xAxis: {
                  data: ydata,
                },
                          // x轴拖动
          dataZoom: [
            {
              type: "slider",
              realtime: true, //拖动滚动条时是否动态的更新图表数据
              height: 6, //滚动条高度
              start: 0, //滚动条开始位置（共100等份）
              end: 70, //结束位置（共100等份）
              dataBackground: {
                lineStyle: {
                  color: 'red'
                },
                areaStyle: {
                  color: 'rgba(255, 255, 255, 1)'
                }
              },
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              fillerColor: 'rgba(255, 255, 255, 0.5)',
              bottom: "1%",
              textStyle: false,
            },
          ],
                series: [
                  {
                    name: "温度",
                    stack: "数据1",
                    type: "line",
                    data: x1data,
                    itemStyle: {
                      color: "#FF8C00",
                    },
                  },

                  {
                    name: "湿度",
                    stack: "数据1",
                    type: "line",
                    data: x2data,
                    itemStyle: {
                      color: "#1E90FF",
                    },
                  },
                  {
                    name: "有机质",
                    stack: "数据1",
                    type: "bar",
                    data: x3data,
                    itemStyle: {
                      color: "#3CB371",
                    },
                  },
                ],
              };
              this.chartInstance.setOption(dataOption);

              that.loading = false;
            })
            .catch((err) => {
              that.loading = false;

              this.$message.error("产品质量数据获取失败");
            });
        } else {
          that.loading = false;

          this.$message.error("服务主体数据获取失败");
        }
      } catch (error) {
      } finally {
      }
    },

    /**
     * 获取服务主体最新价格
     */
    mergeQuality() {
      let that = this;
      let arr = that.tableData;

      let testArr = [];
      let resultArr = [];
      for (let i = 0; i < arr.length; i++) {
        if (testArr.indexOf(arr[i].serviceid) === -1) {
          resultArr.push({
            serviceid: arr[i].serviceid,
            water: arr[i].water,
            temperature: arr[i].temperature,
            organic: arr[i].organic,
            monitordate: arr[i].monitordate,
          });
          testArr.push(arr[i].serviceid);
        } else {
          for (let j = 0; j < resultArr.length; j++) {
            if (
              Date.parse(resultArr[j].monitordate) <
                Date.parse(arr[i].monitordate) &&
              resultArr[j].serviceid == arr[i].serviceid
            ) {
              resultArr[j] = arr[i];

              break;
            }
          }
        }
      }

      return resultArr;
    },

    //日期转换
    dateConvert() {
      let that = this;
      for (var i = 0; i < that.tableData.length; i++) {
        if (that.tableData[i].monitordate != null) {
          that.tableData[i].monitordate = that.dateFormat(
            "YYYY-mm-dd", //范例：年-月-日 时:分 "YYYY-mm-dd HH:MM"
            new Date(that.tableData[i].monitordate)
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
    // step3：初始化图表
    screenAdapter() {
      let that = this;
      const titleFontSize = that.$refs.tfproq_ref.offsetWidth;
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
            //barWidth: 25,
            itemStyle: {
              //barBorderRadius: [0, titleFontSize / 4, titleFontSize / 4, 0],
            },
          },
        ],
      };
      that.chartInstance.setOption(adapterOption);
      // 手动调用图表的 resize 才能产生效果
      that.chartInstance.resize();
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
  },
};
</script>

<style scoped>
</style>