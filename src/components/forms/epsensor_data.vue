<template>
  <div class="container">
    <!-- 返回按钮、表头 -->
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>企业传感器数据</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row gutter="10">
      <el-col :span="12">
        <el-select
          v-model="valueservice"
          multiple
          collapse-tags
          placeholder="请选择服务主体"
        >
          <el-option
            v-for="item in servicesublist"
            :key="item.servicename"
            :label="item.servicename"
            :value="item.servicename"
          >
          </el-option>
        </el-select>
        <el-date-picker
          style="margin-left: 20px"
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
        >统计</el-button>
      </el-col>
      <el-col :span="1.1">
        <el-button
          type="primary"
          icon="el-icon-tickets"
          @click="exportExcel"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-row gutter="10">
      <el-col :span="16">
        <el-card class="box-card-left">
          <div slot="header">
            <span>温湿度统计图</span>
          </div>
          <div>
            <ve-line
                height="35vh"
                :colors="'red'"
                :data="pieData1"
                :extend="piechartExtend1"
              ></ve-line>
          </div>
          <div>
            <ve-line
                height="35vh"
                :colors="'#38B0DE'"
                :data="pieData2"
                :extend="piechartExtend2"
              ></ve-line>
          </div>
          <div>
          </div>
          <!-- <div slot="header">
            <span>原材料、产量统计</span>
          </div> -->
          <!-- <div
            id="pieChart"
            class="pieChart"
          > -->
          <!-- <ve-pie :extend="piechartExtend1"></ve-pie> -->
          <!-- <el-row>
              <el-col>
                <ve-pie
                  :data="pieData1"
                  :extend="piechartExtend1"
                ></ve-pie>
              </el-col>

              <el-col>
                <ve-pie
                  :data="pieData2"
                  :extend="piechartExtend2"
                ></ve-pie>
              </el-col>
            </el-row> -->
          <!-- <div style="height:50%;backgroundColor:grey;">

            </div>
            <div style="height:50%;backgroundColor:green;">
              <ve-pie
                :data="pieData2"
                :extend="piechartExtend2"
              ></ve-pie>
            </div> -->

          <!-- </div> -->
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card-right">
          <div slot="header">
            <span>统计报表</span>
          </div>
          <el-table
            id="tableid"
            ref="tableid"
            :data="this.filterTable"
            border
            :summary-method="getSummaries"
            show-summary="true"
            v-loading="loading"
            element-loading-text="正在统计数据，请稍候..."
            element-loading-spinner="el-icon-loading"
          >
            <el-table-column
              prop="servicesub"
              label="日期"
            >
            </el-table-column>
            <el-table-column
              prop="servicesub"
              label="时刻"
            >
            </el-table-column>
            <el-table-column
              prop="servicesub"
              label="温度"
            >
            </el-table-column>
            <el-table-column
              prop="servicesub"
              label="湿度"
            >
            </el-table-column>
            <!-- <el-table-column
              prop="servicesub"
              label="服务主体"
            >
            </el-table-column>

            <el-table-column
              prop="materialweight"
              label="原材料、辅料（吨）"
            >
              <template slot-scope="scope">
                {{ fun(scope.row.materialweight) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="outputweight"
              label="产量（吨）"
            >
              <template slot-scope="scope">
                {{ fun(scope.row.outputweight) }}
              </template>
            </el-table-column> -->
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 引入导出Excel表格依赖
import FileSaver from 'file-saver'
import XLSX from 'xlsx'

export default {
  data() {
    return {
      servicesublist: [], //服务主体列表
      mainTable: [], //主表
      filterTable: [], //过滤后的表
      search: '', //过滤条件
      saledaterange: null, //时间范围
      valueservice: [], //
      loading: false,

      seriesData: null,
      // 饼图数据
      pieData1: {
        columns: ['服务主体', '原材料辅料'],
        rows: []
      },
      pieData2: {
        columns: ['服务主体', '产量'],
        rows: []
      },
      piechartExtend1: {
        legend: {
          show: false
        },

        title: {
          text: '温度',
          left: 'center',
          textStyle: {
            //文字颜色
            // color: '#ccc',
            //字体风格,'normal','italic','oblique'
            fontStyle: 'normal',
            //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
            fontWeight: 'bold',
            //字体系列
            fontFamily: 'sans-serif',
            //字体大小
            fontSize: 15
          }
        },
        series: [{}]
      },

      piechartExtend2: {
        legend: {
          show: false
        },

        title: {
          text: '湿度',
          left: 'center',
          textStyle: {
            //文字颜色
            // color: '#ccc',
            //字体风格,'normal','italic','oblique'
            fontStyle: 'normal',
            //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
            fontWeight: 'bold',
            //字体系列
            fontFamily: 'sans-serif',
            //字体大小
            fontSize: 15
          }
        },
        series: [{}]
      }
    }
  },

  updated() {
    /**解决统计行不显示的问题 */
    this.$nextTick(() => {
      this.$refs['tableid'].doLayout()
    })
    //这里是存在数据的因为更新完了
    console.log("pieData1",self.pieData1)
    console.log("pieData2",self.pieData2)
    console.log("piechartExtend1",self.piechartExtend1)
    console.log("piechartExtend2",self.piechartExtend2)
  },
  watch: {},
  created() {
    this.serviceSelect()
    let self = this
  },

  mounted() {
    // 请求数据
  },

  computed: {
    // 模糊搜索
    tables: function() {
      const search = this.search
      if (search) {
        // filter() 方法创建一个新的数组，新数组中的元素是通过检查指定数组中符合条件的所有元素。
        // 注意： filter() 不会对空数组进行检测。
        // 注意： filter() 不会改变原始数组。
        return this.mainTable.filter(data => {
          // some() 方法用于检测数组中的元素是否满足指定条件;
          // some() 方法会依次执行数组的每个元素：
          // 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测;
          // 如果没有满足条件的元素，则返回false。
          // 注意： some() 不会对空数组进行检测。
          // 注意： some() 不会改变原始数组。
          return Object.keys(data).some(key => {
            // indexOf() 返回某个指定的字符在某个字符串中首次出现的位置，如果没有找到就返回-1；
            // 该方法对大小写敏感！所以之前需要toLowerCase()方法将所有查询到内容变为小写。
            return (
              String(data[key])
                .toLowerCase()
                .indexOf(search) > -1
            )
          })
        })
      }
      return this.mainTable
    }
  },
  mounted() {},
  methods: {
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          if (index == 1 || index == 2)
            sums[index] = this.fun(sums[index]) + ' 吨'
        } else {
          sums[index] = 'N/A'
        }
      })

      return sums
    },

    async serviceSelect() {
      let that = this
      that.loading = true
      that.servicesublist = []
      that.mainTable = []
      try {
        var ServiceListRes = await that.queryServiceList()
        var prdconfirmRes = await that.getPrdLedgerData()

        for (var j = 0; j < ServiceListRes.length; j++) {
          that.servicesublist.push({
            serviceid: ServiceListRes[j].serviceid,
            servicename: ServiceListRes[j].servicename
          })
        }

        for (var i = 0; i < prdconfirmRes.length; i++) {
          var rowObj = {
            servicesub: that.getServiceNameByID(prdconfirmRes[i].serviceid),
            rettingenddate: prdconfirmRes[i].rettingenddate,
            materialweight: prdconfirmRes[i].materialweight,
            outputweight: prdconfirmRes[i].outputweight
          }

          that.mainTable.push(rowObj)
        }
        that.filterTable = that.mergeConvertweight(that.mainTable)
        that.createPieData()

        that.loading = false
      } catch (error) {
        that.loading = false
        console.log(error)
      }
    },

    /**
     * 获取服务主体列表
     */
    queryServiceList() {
      const params = { offset: 0, limit: 30 }
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            'http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectAllServiceSub',
            { params }
          )
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err)
          })
      })
    },

    // 获取“生产记录台账”数据
    getPrdLedgerData() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            'http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/selectAll?offset=0&limit=50000000'
          )
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    /**
     * 根据服务主体ID获取名称
     */
    getServiceNameByID(serviceid) {
      var servicename
      //遍历查询服务主体名称
      for (var j = 0; j < this.servicesublist.length; j++) {
        if (this.servicesublist[j].serviceid == serviceid) {
          servicename = this.servicesublist[j].servicename
          break
        }
      }
      return servicename
    },

    //合并折算吨数
    mergeConvertweight(inputTable) {
      //处理重复项
      var map = {},
        dest = []
      for (var i = 0; i < inputTable.length; i++) {
        var ai = inputTable[i]
        if (!map[ai.servicesub]) {
          dest.push({
            servicesub: ai.servicesub,
            rettingenddate: ai.rettingenddate,
            materialweight: ai.materialweight,
            outputweight: ai.outputweight
          })
          map[ai.servicesub] = ai
        } else {
          for (var j = 0; j < dest.length; j++) {
            var dj = dest[j]
            if (dj.servicesub == ai.servicesub) {
              dj.materialweight =
                parseFloat(dj.materialweight) + parseFloat(ai.materialweight)
              dj.outputweight =
                parseFloat(dj.outputweight) + parseFloat(ai.outputweight)

              break
            }
          }
        }
      }
      return dest
    },

    createChartdata() {
      this.loading = true
      /** 过滤服务主体*/
      let servicefilterlist = new Array()
      if (this.valueservice.length > 0) {
        let filterRes = new Array()
        for (var i = 0; i < this.valueservice.length; i++) {
          filterRes = this.mainTable.filter(array =>
            array.servicesub.match(this.valueservice[i])
          )

          for (var j = 0; j < filterRes.length; j++) {
            servicefilterlist.push(filterRes[j])
          }
        }
      } else {
        servicefilterlist = this.mainTable
      }

      /** 过滤时间*/
      let datefilterlist = new Array()
      if (this.saledaterange)
        if (this.saledaterange.length > 0) {
          var startdate = this.saledaterange[0] //开始时间
          var enddate = this.saledaterange[1] //结束时间

          let filterRes = new Array()

          filterRes = servicefilterlist.filter(
            array =>
              Date.parse(array.rettingenddate) >= Date.parse(startdate) &&
              Date.parse(array.rettingenddate) <= Date.parse(enddate)
          )

          for (var j = 0; j < filterRes.length; j++) {
            datefilterlist.push(filterRes[j])
          }
        } else {
          datefilterlist = servicefilterlist
        }
      else {
        datefilterlist = servicefilterlist
      }

      this.filterTable = this.mergeConvertweight(datefilterlist)
      this.createPieData()

      this.loading = false
    },

    /**
     * 构造饼图数据
     */
    createPieData() {
      // this.pieData1.rows = []

      this.pieData1 = {
        columns: ['服务主体', '原材料辅料'],
        rows: []
      }
      this.pieData2 = {
        columns: ['服务主体', '产量'],
        rows: []
      }
      // this.pieData2.rows = []
      for (var i = 0; i < this.filterTable.length; i++) {
        var obj = {
          服务主体: this.filterTable[i].servicesub,
          原材料辅料: this.filterTable[i].materialweight
        }
        this.pieData1.rows.push(obj)

        var obj2 = {
          服务主体: this.filterTable[i].servicesub,
          产量: this.filterTable[i].outputweight
        }
        this.pieData2.rows.push(obj2)
      }

      this.seriesData = []
      this.seriesData.push(this.pieData1)
      this.seriesData.push(this.pieData2)
    },

    /**
     * 导出报表
     */
    exportExcel() {
      /* 从表生成工作簿对象 */
      var wb = XLSX.utils.table_to_book(document.querySelector('#tableid'))
      /* 获取二进制字符串作为输出 */
      var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      try {
        FileSaver.saveAs(
          //Blob 对象表示一个不可变、原始数据的类文件对象。
          //Blob 表示的不一定是JavaScript原生格式的数据。
          //File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
          //返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
          new Blob([wbout], { type: 'application/octet-stream' }),
          //设置导出文件名称
          'sheetjs.xlsx'
        )
      } catch (e) {
        if (typeof console !== 'undefined') console.log(e, wbout)
      }
      return wbout
    },

    /**
     * 保留两位小数
     */
    fun(val) {
      return Number(val).toFixed(2)
    }
  }
}
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
  height: 25vh;
}
.box-card-left {
  height: 75vh;
}
.box-card-right {
  height: 75vh;
}

.pieChart {
  height: 65vh;
  margin-top: 0px;
  margin-left: 100px;
  overflow-y: auto;
  overflow-x: auto;
  /* display: inline-block; */
}
</style>