<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/prdc_confirm' }">产量确认表</el-breadcrumb-item>
      <el-breadcrumb-item>批量导入</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card style="height: 50vh">
      <div style="
          display: block;
          white-space: nowrap;
          width: 100%;
          margin-bottom: 10px;
        ">
        <el-upload
          class=""
          ref="upload"
          action="/"
          :show-file-list="false"
          :on-change="importExcel"
          :auto-upload="false"
          accept=".xlsx"
          style="display: inline-block"
        >
          <el-button
            slot="trigger"
            size="small"
            type="primary"
            icon="el-icon-upload2"
          >
            导入产量确认表
          </el-button>
        </el-upload>

        <el-button
          slot="trigger"
          size="small"
          type="danger"
          icon="el-icon-check"
          style="display: inline-block; width: 10%; margin-left: 10px"
          @click="findSameRecord"
        >
          数据查重
        </el-button>
        <el-button
          slot="trigger"
          size="small"
          type="danger"
          icon="el-icon-minus"
          style="display: inline-block; width: 10%; margin-left: 10px"
          @click="removeSameRow"
        >
          移除重复项
        </el-button>

        <el-button
          slot="trigger"
          size="small"
          type="success"
          icon="el-icon-coin"
          @click="uploadtoDb"
          style="display: inline-block; width: 10%"
        >
          执行入库
        </el-button>

        <!-- <el-button
          slot="trigger"
          size="small"
          type="warning"
          icon="el-icon-notebook-1"
          style="display: inline-block; width: 12%"
        >
          导出日志
        </el-button> -->
      </div>

      <el-row>
        <!-- 列表区 -->
        <el-table
          :data="tableFromExcel"
          :key="statusChanged"
          style="font-size: 12px"
          height="40vh"
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
        >
          <el-table-column
            label="序号"
            width="50px"
          >
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            prop="服务主体"
            label="服务主体"
            width="120"
          >
          </el-table-column>
          <el-table-column
            prop="堆沤批次"
            label="堆沤批次"
            width="120"
          >
          </el-table-column>

          <el-table-column
            prop="日期"
            label="日期"
            width="100"
            :formatter="formatDate"
          >
          </el-table-column>

          <el-table-column
            prop="产品名称"
            label="产品名称"
          > </el-table-column>

          <el-table-column
            prop="体积"
            label="体积"
          >
            <template slot-scope="scope">
              {{ fun(scope.row.体积) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="水分"
            label="水分"
          >
            <template slot-scope="scope">
              {{ fun(scope.row.水分) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="容重"
            label="容重"
          >
            <template slot-scope="scope">
              {{ fun(scope.row.容重) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="折算吨数"
            label="折算吨数"
          >
            <template slot-scope="scope">
              {{ fun(scope.row.折算吨数) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="核查人员"
            label="核查人员"
          > </el-table-column>

          <el-table-column
            prop="服务主体负责人"
            label="服务主体负责人"
          >
          </el-table-column>

          <el-table-column
            fixed="right"
            prop="状态"
            label="重复验证"
            width="80"
          >
            <template scope="scope">
              <span :style="classRowStatus(scope.row.状态)">{{
                scope.row.状态
              }}</span></template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="80"
          >
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deleteRow(scope.$index, tableFromExcel)"
                type="text"
                size="small"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>

    <el-card style="height: 30vh; margin-top: 20px">
      <div>处理结果</div>

      <el-input
        style="
          margin-top: 20px;
          margin-left: 5px;
          margin-bottom: 5px;
         
          background-color: lightgray;
          border: solid 1px gray;
        "
        type="textarea"
        :placeholder="logRes"
        v-model="textarea"
        :disabled="true"
        :rows="8"
      >
      </el-input>
    </el-card>
  </div>
</template>

<script>
import XLSX from 'xlsx'

export default {
  data() {
    return {
      tableFromExcel: [], //存储从excel导入的数据
      batchImpPercentage: 0, //批量导入进度条
      logRes: '', //批量导入结果
      statusChanged: false,
      batImpStatus: '准备',
      successCount: 0,
      totalCount: 0,
      servicesublist: [],
      ServiceListRes: [], //服务主体列表
      loading: false //列表加载
    }
  },
  created() {
    this.initTable(0, 10000)
  },
  computed: {
    /**
     * 根据状态改变文字颜色
     */
    classRowStatus() {
      return status => {
        if (status === '重复项') {
          return { color: 'red' }
        } else if (status === '未重复') {
          return { color: 'green' }
        } else if (status === '未验证') {
          return { color: 'orange' }
        } else if (status === '√') {
          return { color: 'green' }
        } else {
          return { color: 'red' }
        }
      }
    }
  },

  methods: {
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    //拿到方法1与方法2的两个结果后，执行init方法
    async initTable() {
      this.servicesublist = []
      this.loading = true
      try {
        this.ServiceListRes = await this.queryServiceList()
        //servicesublist填充数据
        for (var j = 0; j < this.ServiceListRes.length; j++) {
          this.servicesublist.push({
            serviceid: this.ServiceListRes[j].serviceid,
            servicename: this.ServiceListRes[j].servicename
          })
        }

        this.loading = false
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    },

    /**
     * 构建where查询条件（用户超管用户）
     */
    createWherein() {
      let serviceIdWherein = new Array()
      for (var i = 0; i < 100; i++) serviceIdWherein.push(i)
      return serviceIdWherein
    },
    /**
     * 获取服务主体列表
     */
    queryServiceList() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            'http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid',
            window.sessionStorage.getItem('jurisdiction') == 'superadmin'
              ? this.createWherein()
              : [window.sessionStorage.getItem('serviceID')]
          )
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err)
          })
      })
    },

    converExcelDate(exceldata) {
      let time = new Date(
        (exceldata - 25567) * 24 * 3600000 -
          5 * 60 * 1000 -
          43 * 1000 -
          24 * 3600000 -
          8 * 3600000
      )
      let year = time.getFullYear() + ''
      let month = time.getMonth() + 1 + ''
      let date = time.getDate() + ''
      return year + '/' + month + '/' + date
    },

    /**
     * 日期格式化
     * 2001-4-5
     */
    formatDate(row, column) {
      // 获取单元格数据
      let data = row[column.property]
      if (data == null) {
        return null
      }
      let dt = new Date(data)
      return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate()
    },

    //导入
    importExcel(file) {
      let that = this
      const types = file.name.split('.')[1]
      const fileType = ['xlsx', 'xls'].some(item => item === types)
      if (!fileType) {
        that.$message('格式错误！仅支持xlsx或xls文件')
        return false
      }
      that.tableFromExcel = []
      that.file2Xce(file).then(tabJson => {
        if (tabJson && tabJson.length > 0) {
          for (var i = 0; i < tabJson[0].sheet.length; i++) {
            var _sheet = tabJson[0].sheet
            var _row = {
              服务主体: _sheet[i].服务主体,
              堆沤批次: _sheet[i].堆沤批次,
              // 日期: that.converExcelDate(_sheet[i].日期),
              日期: that.$CommonUtil.converExcelDate(_sheet[i].日期),
              产品名称: _sheet[i].产品名称,
              体积: _sheet[i].体积,
              水分: _sheet[i].水分,
              容重: _sheet[i].容重,
              折算吨数: _sheet[i].折算吨数,
              核查人员: _sheet[i].核查人员,
              服务主体负责人: _sheet[i].服务主体负责人,
              状态: ''
            }
            that.tableFromExcel.push(_row)
          }
        }
      })
    },

    file2Xce(file) {
      return new Promise(function(resolve) {
        const reader = new FileReader()
        reader.onload = function(e) {
          const data = e.target.result
          this.wb = XLSX.read(data, {
            type: 'binary'
          })
          const result = []
          this.wb.SheetNames.forEach(sheetName => {
            result.push({
              sheetName: sheetName,
              sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName])
            })
          })
          resolve(result)
        }
        reader.readAsBinaryString(file.raw)
      })
    },

    /**
     * 数据查重
     */
    async findSameRecord() {
      let that = this
      let data = []

      that.logRes += '\n---正在执行数据查重...'

      that.tableFromExcel.forEach(element => {
        let result = that.isRecordExit(
          that.getServiceIdByName(element.服务主体),
          element.堆沤批次
        )
        data.push(result)
      })

      Promise.all(that.catchFun(data)).then(
        values => {
          console.log({ values })

          let sameCount = 0
          let errCount = 0
          for (let i = 0; i < values.length; i++) {
            if (values[i].status) {
              if (values[i].status == 200) {
                if (values[i].data == true) {
                  that.tableFromExcel[i].状态 = '重复项'
                  sameCount++
                }
              } else {
                that.tableFromExcel[i].状态 = '出错'
                errCount++
              }
            } else {
              that.tableFromExcel[i].状态 = '出错'
              errCount++
            }
          }

          that.logRes += '\n---数据查重结束...'
          that.logRes +=
            '\n---结果：重复项' + sameCount + '个，错误项' + errCount + '个。'
        },
        reason => {
          console.log({ reason }) // reject
        }
      )
    },

    /**
     * 是否为重复项（单条记录）
     */
    async isRecordExit(serviceid, rettingbatch) {
      let that = this
      return new Promise(function(resolve, reject) {
        if (that.$CommonUtil.isEmptyString(serviceid)) {
          reject('查询不到对应的企业')
        } else {
          that.$axios
            .get(
              'http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/isExist?rettingbatch=' +
                rettingbatch +
                '&serviceid=' +
                serviceid
            )
            .then(res => {
              resolve(res)
            })
            .catch(err => {
              reject(err)
            })
        }
      })
    },

    /**
     * 防止Promise.all其中一个失败
     */
    catchFun(items) {
      return items.map(item => item.catch(err => Promise.resolve(err)))
    },

    /**
     * 移除重复项
     */
    removeSameRow() {
      let that = this
      var newarr = []
      that.tableFromExcel.forEach(element => {
        if (element.状态 != '重复项') {
          newarr.push(element)
        }
      })
      that.tableFromExcel = newarr
    },

    /**
     * 执行入库
     */
    async uploadtoDb() {
      let that = this
      let data = []
      that.tableFromExcel.forEach(element => {
        let result = that.insertOneRecord(element)

        data.push(result)
      })

      Promise.all(that.catchFun(data)).then(
        values => {
          console.log({ values })
          that.logRes += '\n---正在执行数据入库...'
          let insertCount = 0
          let errCount = 0
          for (let i = 0; i < values.length; i++) {
            if (values[i].status) {
              if (values[i].status == 200) {
                that.tableFromExcel[i].状态 = '√'
                insertCount++
              } else {
                that.tableFromExcel[i].状态 = '出错'
                errCount++
              }
            } else {
              that.tableFromExcel[i].状态 = '出错'
              errCount++
            }
          }
          that.logRes += '\n---数据入库结束...'
          that.logRes +=
            '\n---结果：成功入库' +
            insertCount +
            '个，错误项' +
            errCount +
            '个。'
        },
        reason => {
          console.log({ reason }) // reject
        }
      )
    },

    async insertOneRecord(inputelment) {
      let that = this
      return new Promise(function(resolve, reject) {
        var _sid = that.getServiceIdByName(inputelment.服务主体)
        var postData = that.$qs.stringify({
          serviceid: _sid, //服务主体
          rettingbatch: inputelment.堆沤批次, //堆沤批次
          productionconfirmdate: inputelment.日期,
          productname: inputelment.产品名称,
          volume: inputelment.体积,
          moisture: inputelment.水分,
          volumeweight: inputelment.容重,
          convertweight: inputelment.折算吨数,
          inspector: inputelment.核查人员,
          servicedirector: inputelment.服务主体负责人
        })

        if (that.$CommonUtil.isEmptyString(_sid)) {
          reject('查询不到对应的企业')
        } else {
          that.$axios
            .post(
              'http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/insert',
              postData
            )
            .then(response => {
              resolve(response)
            })
            .catch(err => {
              reject(err)
            })
        }
      })
    },

    /**
     * 上传至数据库
     */
    async uploadtoDb2() {
      let that = this
      var totalCount = that.tableFromExcel.length
      var successCount = 0
      for (var i = 0; i < that.tableFromExcel.length; i++) {
        var _sid = that.getServiceIdByName(that.tableFromExcel[i].服务主体)
        if (_sid != null) {
          if (_sid != '') {
            //新增
            var postData = that.$qs.stringify({
              serviceid: _sid, //服务主体
              rettingbatch: that.tableFromExcel[i].堆沤批次, //堆沤批次
              productionconfirmdate: that.tableFromExcel[i].日期,
              productname: that.tableFromExcel[i].产品名称,
              volume: that.tableFromExcel[i].体积,
              moisture: that.tableFromExcel[i].水分,
              volumeweight: that.tableFromExcel[i].容重,
              convertweight: that.tableFromExcel[i].折算吨数,
              inspector: that.tableFromExcel[i].核查人员,
              servicedirector: that.tableFromExcel[i].服务主体负责人
            })

            var _url =
              'http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/insert'

            that.$axios
              .post(_url, postData)
              .then(res => {
                successCount++
                that.batchImpPercentage = that.fun(
                  (successCount / totalCount) * 100
                )
              })
              .catch(err => {})
          } else {
            // that.tableFromExcel[i].状态 = "查询不到对应的服务主体";
            // that.statusChanged != that.statusChanged;
          }
        } else {
          // that.tableFromExcel[i].状态 = "查询不到对应的服务主体";
          // that.statusChanged != that.statusChanged;
        }
      }
    },

    /**
     * 根据服务主体名获取ID
     */
    getServiceIdByName(servicename) {
      var serviceId
      //遍历查询服务主体名称
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].servicename == servicename) {
          serviceId = this.ServiceListRes[j].serviceid
          break
        }
      }
      return serviceId
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

    /**
     * 保留两位小数
     */
    fun(val) {
      return Number(val).toFixed(2)
    }
  }
}
</script>

<style lang="less" scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 480px;
}
</style>
