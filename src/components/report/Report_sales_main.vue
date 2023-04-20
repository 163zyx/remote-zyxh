<template>
  <div class="container">
    <!-- 返回按钮、表头 -->
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/ff_sale' }"
        >销售台账</el-breadcrumb-item
      >
      <el-breadcrumb-item>统计图表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="out-card">
      <el-row gutter="10">
        <el-col :span="19">
          <el-select
            v-model="valueservice"
            multiple
            collapse-tags
            placeholder="请选择服务主体"
            style="width: 200px"
          >
            <el-option
              v-for="item in servicesublist"
              :key="item.servicename"
              :label="item.servicename"
              :value="item.servicename"
            >
            </el-option>
          </el-select>

          <el-select
            v-model="valuecrop"
            multiple
            collapse-tags
            style="margin-left: 10px; width: 150px"
            placeholder="请选择作物类型"
          >
            <el-option
              v-for="item in croplist"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>

          <!-- <el-select
          v-model="valuetown"
          multiple
          collapse-tags
         
          placeholder=""
        >
        </el-select> -->

          <el-input
            v-model="valuetown"
            style="margin-left: 10px; width: 150px"
            placeholder="请输入检索镇名"
          ></el-input>

          <el-input
            v-model="valuevillage"
            style="margin-left: 10px; width: 150px"
            placeholder="请输入检索村名"
          ></el-input>

          <!-- <el-select
          v-model="valuevillage"
          multiple
          collapse-tags
          style="margin-left: 10px; width: 150px"
          placeholder="请输入村"
        >
        </el-select> -->

          <el-date-picker
            style="margin-left: 10px; width: 250px"
            v-model="saledaterange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-col>

        <el-col :span="1.1">
          <el-button
            type="primary"
            icon="el-icon-pie-chart"
            @click="createChartdata"
            >统计</el-button
          >
        </el-col>
        <el-col :span="1.1">
          <el-button type="primary" icon="el-icon-tickets" @click="exportExcel"
            >导出</el-button
          >
        </el-col>
      </el-row>
      <!-- 柱状图 -->
      <el-row>
        <el-col :span="24">
          <el-card class="box-card-top">
            <div slot="header">
              <span>企业推广统计</span>
            </div>
            <div id="barChart">
              <ve-histogram
                :data="barData2"
                :extend="barchartExtend"
                height="32vh"
              ></ve-histogram>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row gutter="10">
        <el-col :span="10">
          <el-card class="box-card-left">
            <div slot="header">
              <span>乡镇面积统计</span>
            </div>
            <div id="pieChart" style="height: 30vh">
              <ve-pie
                :data="pieData"
                :settings="pieSettings"
                height="30vh"
                :extend="piechartExtend"
              ></ve-pie>
            </div>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card class="box-card-right">
            <div slot="header">
              <span>统计报表</span>
            </div>
            <el-table
              id="tableid"
              ref="tableid"
              :data="this.filterTable"
              border
              height="26vh"
              :summary-method="getSummaries"
              show-summary="true"
              style="width: 100%"
              v-loading="loading"
              element-loading-text="正在统计数据，请稍候..."
              element-loading-spinner="el-icon-loading"
            >
              <el-table-column
                prop="servicesubject"
                label="服务主体"
                width="180"
              >
              </el-table-column>
              <el-table-column prop="saledate" label="销售日期" width="180">
              </el-table-column>
              <el-table-column prop="townvillage" label="镇村">
              </el-table-column>
              <el-table-column prop="crop" label="作物"> </el-table-column>
              <el-table-column prop="area" label="面积（亩）">
                <template slot-scope="scope">
                  {{ fun(scope.row.area) }}
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="销量（吨）">
                <template slot-scope="scope">
                  {{ fun(scope.row.amount) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
// 引入导出Excel表格依赖
import FileSaver from "file-saver";
import XLSX from "xlsx";

export default {
  data() {
    return {
      servicesublist: [], //服务主体列表
      mainTable: [], //主表
      filterTable: [], //过滤后的表
      search: "", //过滤条件
      croplist: [], //农作物列表
      saledaterange: null, //时间范围
      townlist: [
        "辛集",
        "苏村",
        "依汶",
        "湖头",
        "砖埠",
        "蒲汪",
        "青坨",
        "杨坡",
        "双堠",
        "大庄",
        "界湖",
        "张庄",
        "岸提",
        "马牧池",
        "孙祖",
        "铜井",
      ], //镇列表

      valueservice: [], //
      valuecrop: [],
      valuetown: "",
      valuevillage: "",
      // 柱状图数据
      barData2: {
        columns: ["服务主体", "销量", "面积"],
        rows: [],
      },
      loading: false,
      barchartExtend: {
        // color: ["#5E6E8C"],
        // legend: {
        //   show: true,
        // },
        // tooltip: {
        //   show: true,
        // },
        // yAxis: {
        //   axisLabel: { show: true },
        //   splitLine: { show: false },
        //   axisLine: { show: false },
        //   axisTick: { show: true },
        //   splitArea: { show: false },
        //   type: "value",
        // },
        // xAxis: {
        //   axisLabel: {
        //     interval: 0,
        //     color: "rgba(48,48,48, .5)",
        //     fontSize: 10,
        //     fontFamily: "PingFangSC-Regular",
        //   },
        //   axisLine: {
        //     show: true,
        //     lineStyle: {
        //       fontSize: 14,
        //       color: "#DADADA", // 颜色
        //       width: 1, // 粗细
        //     },
        //   },
        // },
        series: {
          barWidth: 30,
          itemStyle: {
            barBorderRadius: [5, 5, 0, 0],
            // color: function (params) {
            //   if (params.data == "销量") return "#73A0FA";
            //   else return "#5E6E8C";
            // },
          },
          // label: {
          //   show: false,
          //   position: "top",
          //   fontFamily: "DINCondensed-Bold",
          //   color: function(params) {
          //       return _this.isMax(params.data) ? '#73A0FA' : '#5E6E8C';
          //   }
          // },
        },
        // grid: {
        //   top: 20,
        //   left: 10,
        //   right: 10,
        //   bottom: 0,
        // },
        // backgroundColor: 'red'
      },
      // 饼图设置
      pieSettings: {
        // radius: 60,
      },
      // 饼图数据
      pieData: {
        columns: ["乡镇", "面积"],
        rows: [],
      },
      //饼图扩展设置
      piechartExtend: {
        legend: {
          type: "scroll",
          orient: "vertical",
          right: 10,
          top: 10,
          bottom:20,
          
        },
        series: {
          radius: "60%",
          center: ["50%", "50%"],
        },
      },
    };
  },

  updated() {
    /**解决统计行不显示的问题 */
    this.$nextTick(() => {
      this.$refs["tableid"].doLayout();
    });
  },
  watch: {},
  created() {
    this.serviceSelect();
  },
  computed: {
    // 模糊搜索
    tables: function () {
      const search = this.search;
      if (search) {
        // filter() 方法创建一个新的数组，新数组中的元素是通过检查指定数组中符合条件的所有元素。
        // 注意： filter() 不会对空数组进行检测。
        // 注意： filter() 不会改变原始数组。
        return this.mainTable.filter((data) => {
          // some() 方法用于检测数组中的元素是否满足指定条件;
          // some() 方法会依次执行数组的每个元素：
          // 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测;
          // 如果没有满足条件的元素，则返回false。
          // 注意： some() 不会对空数组进行检测。
          // 注意： some() 不会改变原始数组。
          return Object.keys(data).some((key) => {
            // indexOf() 返回某个指定的字符在某个字符串中首次出现的位置，如果没有找到就返回-1；
            // 该方法对大小写敏感！所以之前需要toLowerCase()方法将所有查询到内容变为小写。
            return String(data[key]).toLowerCase().indexOf(search) > -1;
          });
        });
      }
      return this.mainTable;
    },
  },
  mounted() {},
  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总计";
          return;
        }
        const values = data.map((item) => Number(item[column.property]));
        if (!values.every((value) => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          if (index == 4) sums[index] = this.fun(sums[index]) + " 亩";
          if (index == 5) sums[index] = this.fun(sums[index]) + " 吨";
        } else {
          sums[index] = "N/A";
        }
      });

      return sums;
    },

    async serviceSelect() {
      this.loading = true;
      this.servicesublist = [];
      try {
        var ServiceListRes = await this.queryServiceList();

        var SaleLedgerRes = await this.querySaleLedger();

        for (var j = 0; j < ServiceListRes.length; j++) {
          this.servicesublist.push({
            serviceid: ServiceListRes[j].serviceid,
            servicename: ServiceListRes[j].servicename,
          });
        }

        for (var i = 0; i < SaleLedgerRes.length; i++) {
          //split时间格式
          var _saledate = SaleLedgerRes[i].saledate;
          if (SaleLedgerRes[i].saledate)
            if (SaleLedgerRes[i].saledate.indexOf("T") != -1)
              _saledate = SaleLedgerRes[i].saledate.split("T")[0];
          var rowObj = {
            servicesubject: this.getServiceNameByID(
              SaleLedgerRes[i].servicesubject
            ),
            saledate: _saledate,
            townvillage: SaleLedgerRes[i].townvillage,
            crop: SaleLedgerRes[i].crop,
            area: SaleLedgerRes[i].area,

            amount: SaleLedgerRes[i].amount, //数量
          };
          this.mainTable.push(rowObj);
        }

        this.filterTable = this.mainTable;

        this.createBarData();
        this.createPieData();

        this.initCroplist();

        // this.loading = false;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 构建where查询条件（用户超管用户）
     */
    createWherein() {
      let serviceIdWherein = new Array();
      for (var i = 0; i < 100; i++) serviceIdWherein.push(i);
      return serviceIdWherein;
    },
    /**
     * 获取服务主体列表
     */
    queryServiceList() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
            window.sessionStorage.getItem("jurisdiction") == "superadmin"
              ? this.createWherein()
              : [window.sessionStorage.getItem("serviceID")]
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
     * 获取销售表单
     */
    querySaleLedger() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/selectByServiceid",
            window.sessionStorage.getItem("jurisdiction") == "superadmin"
              ? this.createWherein()
              : [window.sessionStorage.getItem("serviceID")]
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
     * 根据服务主体ID获取名称
     */
    getServiceNameByID(serviceid) {
      var servicename;
      //遍历查询服务主体名称
      for (var j = 0; j < this.servicesublist.length; j++) {
        if (this.servicesublist[j].serviceid == serviceid) {
          servicename = this.servicesublist[j].servicename;
          break;
        }
      }
      return servicename;
    },

    /**
     * 加载作物列表
     */
    initCroplist() {
      this.croplist.push(this.mainTable[0].crop);

      for (var i = 1; i < this.mainTable.length; i++) {
        var isexist = false;
        for (var j = 0; j < this.croplist.length; j++) {
          if (this.croplist[j] == this.mainTable[i].crop) {
            isexist = true;
            break;
          }
        }

        if (isexist == false) {
          this.croplist.push(this.mainTable[i].crop);
        }
      }
    },

    createChartdata() {
      this.loading = true;

      try {
        /** 过滤服务主体*/
        let servicefilterlist = new Array();
        if (this.valueservice.length > 0) {
          let filterRes = new Array();
          for (var i = 0; i < this.valueservice.length; i++) {
            //先过滤空值，再匹配，否则报错
            let filterResExNull = this.mainTable.filter(
              (array) => array.servicesubject && array.servicesubject.trim()
            );

            filterRes = filterResExNull.filter((array) =>
              array.servicesubject.match(this.valueservice[i])
            );

            for (var j = 0; j < filterRes.length; j++) {
              servicefilterlist.push(filterRes[j]);
            }
          }
        } else {
          servicefilterlist = this.mainTable;
        }
        /**过滤农作物 */
        let cropfilterlist = new Array();
        if (this.valuecrop.length > 0) {
          let filterRes = new Array();

          for (var i = 0; i < this.valuecrop.length; i++) {
            //先过滤空值，再匹配，否则报错
            let filterResExNull = servicefilterlist.filter(
              (array) => array.crop && array.crop.trim()
            );

            filterRes = filterResExNull.filter((array) =>
              array.crop.match(this.valuecrop[i])
            );

            for (var j = 0; j < filterRes.length; j++) {
              cropfilterlist.push(filterRes[j]);
            }
          }
        } else {
          cropfilterlist = servicefilterlist;
        }

        /** 过滤镇*/
        let townfilterlist = new Array();
        if (this.valuetown) {
          //先过滤空值，再匹配，否则报错
          let filterResExNull = servicefilterlist.filter(
            (array) => array.townvillage && array.townvillage.trim()
          );

          let filterRes = filterResExNull.filter((array) =>
            array.townvillage.includes(this.valuetown)
          );

          for (var j = 0; j < filterRes.length; j++) {
            townfilterlist.push(filterRes[j]);
          }
        } else {
          townfilterlist = cropfilterlist;
        }

        /** 过滤村*/
        let villagefilterlist = new Array();
        if (this.valuevillage) {
          //先过滤空值，再匹配，否则报错
          let filterResExNull = servicefilterlist.filter(
            (array) => array.townvillage && array.townvillage.trim()
          );

          let filterRes = filterResExNull.filter((array) =>
            array.townvillage.includes(this.valuevillage)
          );

          for (var j = 0; j < filterRes.length; j++) {
            villagefilterlist.push(filterRes[j]);
          }
        } else {
          villagefilterlist = townfilterlist;
        }

        /** 过滤时间*/
        let datefilterlist = new Array();
        if (this.saledaterange)
          if (this.saledaterange.length > 0) {
            var startdate = this.saledaterange[0]; //开始时间
            var enddate = this.saledaterange[1]; //结束时间

            let filterRes = new Array();

            filterRes = villagefilterlist.filter(
              (array) =>
                Date.parse(array.saledate) >= startdate &&
                Date.parse(array.saledate) <= enddate
            );

            for (var j = 0; j < filterRes.length; j++) {
              datefilterlist.push(filterRes[j]);
            }
          } else {
            datefilterlist = villagefilterlist;
          }
        else {
          datefilterlist = villagefilterlist;
        }

        this.filterTable = datefilterlist;
        this.createBarData();
        this.createPieData();
      } catch (error) {
        this.$message.error("条件过滤发生错误！请联系管理员！");
      } finally {
        this.loading = false;
      }
    },

    /**
     * 构造柱状图数据
     */
    createBarData() {
      this.barData2.rows = [];
      for (var i = 0; i < this.filterTable.length; i++) {
        /**判断是否已存在服务主体 */
        var isServiceExist = false;
        var existIndex = 0; //存在位置
        for (var j = 0; j < this.barData2.rows.length; j++) {
          if (
            this.filterTable[i].servicesubject == this.barData2.rows[j].服务主体
          ) {
            isServiceExist = true;
            existIndex = j;
          }
        }

        if (isServiceExist) {
          this.barData2.rows[existIndex].销量 =
            parseFloat(this.barData2.rows[existIndex].销量) +
            parseFloat(this.filterTable[i].amount);
          this.barData2.rows[existIndex].面积 =
            parseFloat(this.barData2.rows[existIndex].面积) +
            parseFloat(this.filterTable[i].area);
        } else {
          var obj = {
            服务主体: this.filterTable[i].servicesubject,
            销量: this.filterTable[i].amount,
            面积: this.filterTable[i].area,
          };
          this.barData2.rows.push(obj);
        }
      }
    },

    /**
     * 构造饼图数据
     */
    createPieData() {
      this.pieData.rows = [];

      // 数据按照水果名称进行归类
      var nameContainer = {}; // 针对键name进行归类的容器
      this.filterTable.forEach((item) => {
        this.townlist.forEach((townname) => {
          if (item.townvillage)
            if (item.townvillage.indexOf(townname) != -1) {
              nameContainer[townname] = nameContainer[townname] || [];
              nameContainer[townname].push(item);
            }
        });
      });

      console.log(nameContainer); // 按照水果名称归类完成：{ apple: Array(2), banana: Array(2) }

      // 统计不同种类水果的数量
      var fruitName = Object.keys(nameContainer); // 获取水果种类：["apple", "banana"]

      fruitName.forEach((townname) => {
        let count = 0;
        nameContainer[townname].forEach((item) => {
          count += item.area; // 遍历每种水果中包含的条目计算总数
        });
        this.pieData.rows.push({ 乡镇: townname, 面积: count });
      });
    },

    /**
     * 导出报表
     */
    exportExcel() {
      /* 从表生成工作簿对象 */
      var wb = XLSX.utils.table_to_book(document.querySelector("#tableid"));
      /* 获取二进制字符串作为输出 */
      var wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array",
      });
      try {
        FileSaver.saveAs(
          //Blob 对象表示一个不可变、原始数据的类文件对象。
          //Blob 表示的不一定是JavaScript原生格式的数据。
          //File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
          //返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
          new Blob([wbout], { type: "application/octet-stream" }),
          //设置导出文件名称
          "sheetjs.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },

    /**
     * 保留两位小数
     */
    fun(val) {
      return Number(val).toFixed(2);
    },
  },
};
</script>



<style scoped>
.container {
  height: 100vh;
  background-color: rgb(245, 245, 245);
}
.el-card {
  margin-top: 10px;
}
span {
  font-weight: bolder;
}
.box-card-top {
  height: 35vh;
}
.box-card-left {
  height: 36vh;
}

.box-card-right {
  height: 36vh;
}

.out-card {
  height: 82vh;
}
</style>