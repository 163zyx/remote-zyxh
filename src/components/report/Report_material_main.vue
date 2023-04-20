<template>
  <div class="container">
    <!-- 返回按钮、表头 -->

    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/yl_incomes' }">原料进厂台账</el-breadcrumb-item>
      <el-breadcrumb-item>统计图表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row gutter="10">
      <el-col :span="12">
        <el-select
          v-model="valueservice"
          multiple
          collapse-tags
          placeholder="请选择服务主体"
          @change="onSelectedService"
        >
          <el-option
            v-for="item in router_servicesublist"
            :key="item.servicename"
            :label="item.servicename"
            :value="item.servicename"
          >
          </el-option>
        </el-select>

        <el-date-picker
          style="margin-left: 20px"
          v-model="materialdaterange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-col>

      <el-col :span="8">
        <el-button
          type="primary"
          icon="el-icon-pie-chart"
          @click="createChartdata"
        >统计</el-button>
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
            <span>原料总量统计</span>
          </div>
          <div
            id="pieChart"
            class="pieChart"
          >
            <ve-pie
              :data="pieData"
              :extend="piechartExtend"
            ></ve-pie>
          </div>
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
            :data="this.mainTable"
            border
            show-summary
            style="width: 100%; margin-top: 0px"
            v-loading="loading"
            element-loading-text="正在统计数据，请稍候..."
            element-loading-spinner="el-icon-loading"
          >
            <el-table-column
              prop="servicename"
              label="服务主体"
            >
            </el-table-column>
            <el-table-column
              prop="total"
              label="原料总量"
            >
              <template slot-scope="scope">
                {{ fun(scope.row.total) }}
              </template>
            </el-table-column>
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
      obj: {},
      router_tableData: '',
      router_servicesublist: [],

      // servicesublist: [], //服务主体列表
      mainTable: [], //主表
      // filterTable: [], //过滤后的表
      search: '', //过滤条件
      materialdaterange: null, //时间范围
      valueservice: [], //
      loading: false,
      // 饼图数据
      pieData: {
        columns: ['服务主体', '原料总量'],
        rows: []
      },

      piechartExtend: {
        legend: {
          type: 'scroll',
          orient: 'vertical',
          left: 'right',
          top: 'bottom'
        },
        series: {
          radius: '80%',
          center: ['50%', '50%']
        }
      }
    }
  },

  updated() {
    /**解决统计行不显示的问题 */
    this.$nextTick(() => {
      this.$refs['tableid'].doLayout()
    })
  },
  watch: {},
  created() {
    this.getquerytData()
    this.getmainTable(this.router_tableData)
    this.createPieData()
  },
  computed: {
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
          // if (index == 1) sums[index] = this.fun(sums[index]) + " 吨";
          sums[index] += '吨'
        } else {
          sums[index] = 'N/A'
        }
      })

      return sums
    }
  },
  mounted() {},
  methods: {
    //报表合计
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
          if (index == 1) sums[index] = this.fun(sums[index]) + ' 吨'
        } else {
          sums[index] = 'N/A'
        }
      })

      return sums
    },

    // 接收传参
    getquerytData() {
      this.router_tableData = this.$route.query.router_tableData //原料进厂数据
      this.router_servicesublist = this.$route.query.router_servicesublist //服务主体数据
      this.test01 = this.$route.query.test01
      // console.log(this.router_servicesublist, this.router_tableData);
    },

    /**
     * 根据服务主体ID获取名称
     */
    getServiceNameByID(serviceid) {
      var servicename
      //遍历查询服务主体名称
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].serviceid == serviceid) {
          servicename = this.ServiceListRes[j].servicename
          break
        }
      }
      return servicename
    },

    // 生成主表 服务主体：原料总量
    getmainTable(inputTable) {
      let newArry = []
      let temp = {}
      let num = 0

      for (var i in inputTable) {
        var key = inputTable[i].servicename
        if (temp[key]) {
          temp[key].servicename = inputTable[i].servicename
          temp[key].total += inputTable[i].materialquantity
        } else {
          temp[key] = {}
          temp[key].servicename = inputTable[i].servicename
          temp[key].total = inputTable[i].materialquantity
        }
      }
      for (var k in temp) {
        newArry.push(temp[k])
      }
      this.mainTable = newArry
    },

    createChartdata() {
      this.loading = true
      /** 过滤服务主体*/
      let servicefilterlist = new Array()
      if (this.valueservice.length > 0) {
        let filterRes = new Array()
        for (var i = 0; i < this.valueservice.length; i++) {
          filterRes = this.router_tableData.filter(array =>
            array.servicename.match(this.valueservice[i])
          )

          for (var j = 0; j < filterRes.length; j++) {
            servicefilterlist.push(filterRes[j])
          }
        }
      } else {
        servicefilterlist = this.router_tableData
      }

      /** 过滤时间*/
      let datefilterlist = new Array()
      if (this.materialdaterange)
        if (this.materialdaterange.length > 0) {
          var startdate = this.materialdaterange[0] //开始时间
          var enddate = this.materialdaterange[1] //结束时间

          let filterRes = new Array()

          filterRes = servicefilterlist.filter(
            array =>
              Date.parse(array.materialdate) >= Date.parse(startdate) &&
              Date.parse(array.materialdate) <= Date.parse(enddate)
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

      this.getmainTable(datefilterlist)
      this.createPieData()

      this.loading = false
    },

    /**
     * 构造饼图数据
     */
    createPieData() {
      this.pieData.rows = []
      for (var i = 0; i < this.mainTable.length; i++) {
        var obj = {
          服务主体: this.mainTable[i].servicename,
          原料总量: this.mainTable[i].total
        }
        this.pieData.rows.push(obj)
      }
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
  height: 100%;
  /* margin: 50px; */
}
</style>