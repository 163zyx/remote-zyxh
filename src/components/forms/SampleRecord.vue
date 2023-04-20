<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>取样记录</el-breadcrumb-item>
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
        <el-table-column prop="servicename" label="公司名称"> </el-table-column>
        <el-table-column prop="contactinfo" label="电话"> </el-table-column>
        <el-table-column prop="weighttarget" label="重量目标">
        </el-table-column>
        <el-table-column prop="sampledate" label="取样时间"> </el-table-column>
        <el-table-column prop="remainingtimes" label="剩余次数">
        </el-table-column>
        <el-table-column prop="estimatedtimes" label="预计次数">
        </el-table-column>
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
      width="30vw"
      center
    >
      <el-form label-position="top" :model="form" :rules="rules" ref="form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="servicename" required>
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
              label="电话"
              style="margin-left: 10px"
              prop="contactinfo"
            >
              <el-input
                v-model="form.contactinfo"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item
              label="重量目标"
              style="margin-left: 10px"
              prop="weighttarget"
            >
              <el-input
                v-model="form.weighttarget"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="取样时间"
              style="margin-left: 10px"
              prop="sampledate"
            >
              <el-input
                v-model="form.sampledate"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="剩余次数" prop="remainingtimes">
              <el-input
                v-model="form.remainingtimes"
                type="number"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="预计次数"
              style="margin-left: 10px"
              prop="estimatedtimes"
            >
              <el-input
                v-model="form.estimatedtimes"
                type="number"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="备注" prop="note">
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
        samplerecorid: "",
        servicename: "",
        contactinfo: "",
        weighttarget: "",
        sampledate: "",
        remainingtimes: "",
        estimatedtimes: "",
        note: "",
      },

      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数

      titleMap: {
        addSensor: "新增取样记录", //根据自己内容定义名字
        eidtSensor: "编辑取样记录", //根据自己内容定义名字
      },

      //新增和编辑弹框标题
      dialogStatus: "",

      rules: {
        //表单验证验证规则
        servicename: [
          { required: true, message: "请选择一个公司", trigger: "change" },
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

    // 获取数据
    async getServicePriceData() {
      var that = this;
      that.loading = true;

      that.servicesublist = await that.getServiceSubData();

      if (that.servicesublist) {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSamplerecord/selectByServiceid",
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

            this.$message.error("取样记录数据获取失败");
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
            samplerecorid: this.tableData[i].samplerecorid,
            servicename: this.getServiceNameByID(this.tableData[i].serviceid),
            contactinfo: this.tableData[i].contactinfo,
            weighttarget: this.tableData[i].weighttarget,
            sampledate: this.tableData[i].sampledate,
            remainingtimes: this.tableData[i].remainingtimes,
            estimatedtimes: this.tableData[i].estimatedtimes,
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

      this.form.contactinfo = "";
      this.form.weighttarget = "";
      this.form.sampledate = "";
      this.form.remainingtimes = "";
      this.form.estimatedtimes = "";
      this.form.note = "";

      this.dialogStatus = "addSensor";
      this.dialogVisible = true;
    },

    //编辑传感器参数
    editProQuality(row) {
      this.form.samplerecorid = row.samplerecorid;
      this.form.servicename = row.servicename;
      this.form.contactinfo = row.contactinfo;
      this.form.weighttarget = row.weighttarget;
      this.form.sampledate = row.sampledate;
      this.form.remainingtimes = row.remainingtimes;
      this.form.estimatedtimes = row.estimatedtimes;
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
            var postData = that.$qs.stringify({
              serviceid: that.getServiceIDByName(that.form.servicename),
              contactinfo: that.form.contactinfo,
              weighttarget: that.form.weighttarget,
              sampledate: that.form.sampledate,
              remainingtimes: that.form.remainingtimes,
              estimatedtimes: that.form.estimatedtimes,
              note: that.form.note,
            });
            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfSamplerecord/insert",
                postData
              )
              .then((res) => {
                that.$message({
                  message: "成功新增一条取样记录！",
                  type: "success",
                });
                that.dialogVisible = false;

                that.reload(); //刷新页面
              })
              .catch((err) => {
                that.$message.error("新增取样记录出错！请认真核对表单信息");
                console.log(err);
              });
          } else if (this.dialogStatus == "eidtSensor") {
            var postData = that.$qs.stringify({
              samplerecorid: that.form.samplerecorid,
              serviceid: that.getServiceIDByName(that.form.servicename),
              contactinfo: that.form.contactinfo,
              weighttarget: that.form.weighttarget,
              sampledate: that.form.sampledate,
              remainingtimes: that.form.remainingtimes,
              estimatedtimes: that.form.estimatedtimes,
              note: that.form.note,
            });
            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfSamplerecord/update",
                postData
              )
              .then((res) => {
                that.$message({
                  message: "修改取样记录成功！",
                  type: "success",
                });
                that.dialogVisible = false;

                that.reload(); //刷新页面
              })
              .catch((err) => {
                that.$message.error("修改取样记录出错！请认真核对表单信息");
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
            id: row.samplerecorid,
          };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfSamplerecord/deleteById",
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
          "公司名称",
          "电话",
          "重量目标",
          "取样时间",
          "剩余次数",
          "预计次数",
          "备注",
        ];
        var filterVal = [
          "servicename",
          "contactinfo",
          "weighttarget",
          "sampledate",
          "remainingtimes",
          "estimatedtimes",
          "note",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "取样记录表"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("../addBatchSampleRecord");
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

.customWidth {
  width: 20%;
}
</style>