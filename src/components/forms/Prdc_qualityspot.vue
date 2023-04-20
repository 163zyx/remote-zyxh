<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>产品抽检</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card style="height: 85vh">
      <!-- 搜索与添加 -->
      <el-row :gutter="10">
        <el-col :span="4.5">
          <!-- <el-input placeholder="请输入搜索内容" v-model="search"> </el-input> -->
          <el-select
            v-model="filterservice"
            multiple
            collapse-tags
            placeholder="请选择企业"
          >
            <el-option
              v-for="item in servicesublist"
              :key="item.servicename"
              :label="item.servicename"
              :value="item.servicename"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            @click="addProQuality()"
            icon="el-icon-circle-plus-outline"
            >新增记录</el-button
          >
        </el-col>

        <el-col :span="1.5">
          <el-button type="primary" @click="addBatch()" icon="el-icon-upload2"
            >批量导入</el-button
          >
        </el-col>

        <el-col :span="1.5">
          <el-button
            type="primary"
            @click="exportExcel()"
            icon="el-icon-download"
            >导出报表</el-button
          >
        </el-col>

        <el-col :span="4">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            @click="refreshTable()"
            >刷新</el-button
          >
        </el-col>
      </el-row>

      <el-table
        :data="
          this.tables.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )
        "
        height="70vh"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
      >
        <el-table-column prop="servicename" label="企业名称"> </el-table-column>

        <el-table-column prop="rettingbatch" label="堆沤批次">
        </el-table-column>
        <el-table-column
          prop="monitordate"
          label="抽检日期"
          :formatter="formatDate"
        >
        </el-table-column>

        <el-table-column prop="temperature" label="温度（℃）">
        </el-table-column>

        <el-table-column prop="water" label="水分（%）"> </el-table-column>

        <el-table-column prop="oganic" label="气味"> </el-table-column>

        <el-table-column prop="monitorpeo" label="抽检人"> </el-table-column>
        <el-table-column prop="monitorunit" label="抽检单位"> </el-table-column>
        <el-table-column prop="note" label="备注"> </el-table-column>

        <el-table-column fixed="right" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              @click.native="editProQuality(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >

            <el-button
              @click="deleteOnePrcdQuality(scope.row)"
              type="danger"
              size="small"
              icon="el-icon-remove-outline"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="block" style="margin-top: 15px">
        <el-pagination
          align="center"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="this.tables.length"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-dialogDrag
      :title="titleMap[dialogStatus]"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      center
    >
      <el-form
        label-position="top"
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="企业名称" prop="servicename" required>
              <!-- <el-input
                v-model="form.servicename"
                autocomplete="off"
                type="text"
                :disabled="true"
              ></el-input> -->

              <el-select
                v-model="form.servicename"
                collapse-tags
                :disabled="false"
              >
                <el-option
                  v-for="item in servicesublist"
                  :key="item.servicename"
                  :label="item.servicename"
                  :value="item.servicename"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="堆沤批次"
              style="margin-left: 10px"
              prop="rettingbatch"
              required
            >
              <el-input
                v-model="form.rettingbatch"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="抽检日期" prop="monitordate">
              <el-date-picker
                style="width: 100%"
                v-model="form.monitordate"
                autocomplete="off"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="温度(℃)"
              style="margin-left: 10px"
              prop="temperature"
            >
              <el-input
                v-model="form.temperature"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="水分(%)" prop="water">
              <el-input
                v-model="form.water"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="气味"
              style="margin-left: 10px"
              prop="oganic"
            >
              <el-input
                v-model="form.oganic"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="抽检人" prop="monitorpeo">
              <el-input
                v-model="form.monitorpeo"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="monitorunit">
              <el-input
                v-model="form.monitorunit"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="备注" style="margin-left: 10px" prop="note">
              <el-input
                v-model="form.note"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formCommit('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  inject: ["reload"], //刷新时注入reload方法
  data() {
    return {
      tableData: [],
      filterservice: [],
      servicesublist: [],
      selectservicename: "",
      search: "",
      dialogVisible: false, //新增编辑对话框
      loading: false, //列表加载
      form: {
        proquaindex: "", //产品质量记录索引
        servicename: "", //服务主体名称
        rettingbatch: "", //生产编号
        monitordate: "", //抽检日期
        temperature: "", //温度
        water: "", //水分
        oganic: "", //有机质
        monitorpeo: "", //抽检人
        monitorunit: "", //抽检单位
        note: "", //备注
      },

      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数

      titleMap: {
        addSensor: "新增抽检记录", //根据自己内容定义名字
        eidtSensor: "编辑抽检记录", //根据自己内容定义名字
      },

      //新增和编辑弹框标题
      dialogStatus: "",

      rules: {
        //表单验证验证规则
        servicename: [
          { required: true, message: "请选择一个企业", trigger: "change" },
        ],

        rettingbatch: [
          { required: true, message: "请输入堆沤批次", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    this.getServicePriceData();
  },

  mounted() {
    // 请求数据
  },

  computed: {
    tables: function () {
      /** 过滤服务主体*/
      let resTable = new Array();
      if (this.filterservice.length > 0) {
        let filterRes = new Array();
        //过滤 null 和 undefined
        const target = this.tableData.filter((current) => {
          return (
            current.servicename !== null && current.servicename !== undefined
          );
        });

        for (var i = 0; i < this.filterservice.length; i++) {
          filterRes = target.filter((array) => {
            return array.servicename.match(this.filterservice[i]);
          });

          for (var j = 0; j < filterRes.length; j++) {
            resTable.push(filterRes[j]);
          }
        }
      } else {
        resTable = this.tableData;
      }

      return resTable;
    },
  },

  methods: {
    //每页条数改变时触发 选择一页显示多少行
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.currentPage = 1;
      this.pageSize = val;
      //this.initTable(this.currentPage * val, val);
    },
    //当前页改变时触发 跳转其他页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
      //this.initTable(this.pageSize * val, this.pageSize);
    },

    /**
     * 构建where查询条件（用户超管用户）
     */
    createWherein() {
      let serviceIdWherein = new Array();
      for (var i = 0; i < 100; i++) serviceIdWherein.push(i);
      return serviceIdWherein;
    },
    // 获取“服务主体”数据
    getServiceSubData() {
      this.loading = true;
      var that = this;
      return new Promise((resolve, reject) => {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
            window.sessionStorage.getItem("jurisdiction") == "superadmin"
              ? this.createWherein()
              : [window.sessionStorage.getItem("serviceID")]
          )
          .then((res) => {
            resolve(res.data);
            this.loading = false;
          })
          .catch((err) => {
            reject(err);
            this.loading = false;
          });
      });
    },

    // 获取“产品质量”数据
    async getServicePriceData() {
      var that = this;
      that.loading = true;

      that.servicesublist = await that.getServiceSubData();

      if (that.servicesublist) {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualityspot/selectByServiceid",
            window.sessionStorage.getItem("jurisdiction") == "superadmin"
              ? this.createWherein()
              : [window.sessionStorage.getItem("serviceID")]
          )
          .then((res) => {
            that.tableData = res.data;
            that.tableData.sort(function (a, b) {
              var value1 = a.serviceid;
              var value2 = b.serviceid;
              return value1 - value2; //升序排序
            });
            that.tableData = that.dataReplaceSericeid(); //获取服务主体名

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
    },

    /**
     * 将服务主体id替换为服务主体名
     */
    dataReplaceSericeid() {
      let newtable = [];
      for (var i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].serviceid != null) {
          let rowobj = {
            proquaindex: this.tableData[i].proquaindex,
            servicename: this.getServiceNameByID(this.tableData[i].serviceid),
            rettingbatch: this.tableData[i].rettingbatch,
            monitordate: this.tableData[i].monitordate,
            temperature: this.tableData[i].temperature,
            water: this.tableData[i].water,
            oganic: this.tableData[i].oganic,
            monitorpeo: this.tableData[i].monitorpeo,
            monitorunit: this.tableData[i].monitorunit,
            note: this.tableData[i].note,
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
     * 根据服务主体名称获取id
     */
    getServiceIDByName(servicename) {
      var serviceid;
      //遍历查询服务主体名称
      for (var j = 0; j < this.servicesublist.length; j++) {
        if (this.servicesublist[j].servicename == servicename) {
          serviceid = this.servicesublist[j].serviceid;
          break;
        }
      }
      return serviceid;
    },

    // 刷新列表
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },

    //新增传感器
    addProQuality() {
      this.form.servicename = "";

      this.form.rettingbatch = "";
      this.form.monitordate = new Date(); //时间;
      this.form.temperature = "";
      this.form.water = "";
      this.form.oganic = "";
      this.form.monitorpeo = "";
      (this.form.monitorunit = ""), (this.form.note = "");
      this.dialogStatus = "addSensor";
      this.dialogVisible = true;
    },

    //编辑传感器参数
    editProQuality(row) {
      this.form.proquaindex = row.proquaindex;
      this.form.servicename = row.servicename;
      this.form.rettingbatch = row.rettingbatch;
      this.form.monitordate = new Date(row.monitordate);

      this.form.temperature = row.temperature;
      this.form.water = row.water;
      this.form.oganic = row.oganic;
      this.form.monitorpeo = row.monitorpeo;
      this.form.monitorunit = row.monitorunit;
      this.form.note = row.note;
      this.dialogStatus = "eidtSensor";

      this.dialogVisible = true;
    },

    // 提交表单
    formCommit(formName) {
      let that = this;

      that.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.dialogStatus == "addSensor") {
            var startyear = that.form.monitordate.getFullYear();
            var startmonth = that.form.monitordate.getMonth() + 1;
            var startday = that.form.monitordate.getDate();

            var postData = that.$qs.stringify({
              serviceid: that.getServiceIDByName(that.form.servicename),

              rettingbatch: that.form.rettingbatch,
              monitordate: startyear + "/" + startmonth + "/" + startday,
              temperature: that.form.temperature,
              water: that.form.water,
              oganic: that.form.oganic,
              monitorpeo: that.form.monitorpeo,
              monitorunit: that.form.monitorunit,
              note: that.form.note,
            });
            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualityspot/insert",
                postData
              )
              .then((res) => {
                that.$message({
                  message: "成功新增一条产品抽检记录！",
                  type: "success",
                });
                that.dialogVisible = false;

                that.reload(); //刷新页面
              })
              .catch((err) => {
                that.$message.error("新增产品抽检记录出错！请认真核对表单信息");
                console.log(err);
              });
          } else if (this.dialogStatus == "eidtSensor") {
            var startyear = that.form.monitordate.getFullYear();
            var startmonth = that.form.monitordate.getMonth() + 1;
            var startday = that.form.monitordate.getDate();

            var postData = that.$qs.stringify({
              proquaindex: that.form.proquaindex,
              serviceid: that.getServiceIDByName(that.form.servicename),
              rettingbatch: that.form.rettingbatch,
              monitordate: startyear + "/" + startmonth + "/" + startday,
              temperature: that.form.temperature,
              water: that.form.water,
              oganic: that.form.oganic,
              monitorpeo: that.form.monitorpeo,
              monitorunit: that.form.monitorunit,
              note: that.form.note,
            });
            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualityspot/update",
                postData
              )
              .then((res) => {
                that.$message({
                  message: "成功修改产品抽检记录！",
                  type: "success",
                });
                that.dialogVisible = false;

                that.reload(); //刷新页面
              })
              .catch((err) => {
                that.$message.error("修改产品抽检记录出错！请认真核对表单信息");
                console.log(err);
              });
          }
        } else {
          return false;
        }
      });
    },

    // 删除单条记录记录
    deleteOnePrcdQuality(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = {
            id: row.proquaindex,
          };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualityspot/deleteById",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                that.reload();
                that.$message({
                  type: "success",
                  message: "删除成功!",
                });
              } else {
                that.$message.error("删除失败！");
              }
            })
            .catch(function (error) {
              // handle error
              // error;
            })
            .then(function () {
              that.dialogVisible = false;
            });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    exportExcel() {
      var that = this;
      require.ensure([], () => {
        const { export_json_to_excel } = require("@/excel/export2Excel"); //这里必须使用绝对路径，使用@/+存放export2Excel的路径
        const tHeader = [
          "企业名称",
          "堆沤批次",
          "抽检日期",
          "温度（℃）",
          "水分（％）",
          "气味",
          "抽检人",
          "抽检单位",
          "备注",
        ];
        var filterVal = [
          "servicename",
          "rettingbatch",
          "monitordate",
          "temperature",
          "water",
          "oganic",
          "monitorpeo",
          "monitorunit",
          "note",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "产品抽检表"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("../addBatchPrdcqualityspot");
    },

    /**
     * 日期格式化
     * 2001-4-5
     */
    formatDate(row, column) {
      // 获取单元格数据
      let data = row[column.property];
      if (data == null) {
        return null;
      }
      let dt = new Date(data);
      return dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
    },

    /**
     * 保留1位小数
     */
    fun(val) {
      return Number(val).toFixed(1);
    },
    /**
     * 保留4位小数
     */
    fun4(val) {
      return Number(val).toFixed(4);
    },
  },
};
</script>



<style lang='less' scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 480px;
}
/deep/.el-dialog {
  background-color: rgb(246, 246, 246);
  font-weight: bolder;
  border-radius: 5px;
}
/deep/.el-dialog .el-form {
  padding: 20px;
  background-color: white;
}
/deep/.el-dialog .el-form .el-form-item .el-select {
  width: 100%;
}

.el-dialog-div {
  overflow: auto;
}
</style>