<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>传感器设置</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card style="height: 85vh">
      <!-- 搜索与添加 -->
      <el-row :gutter="10">
        <el-col :span="4.5">
          <el-select
            v-model="filterservice"
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
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            @click="addOneServicePrice()"
            icon="el-icon-circle-plus-outline"
            >新增记录</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            @click="refreshTable()"
            >刷新</el-button
          >
        </el-col>
      </el-row>

      <el-table
        :data="this.tables"
        height="70vh"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
      >
        <el-table-column prop="servicename" label="服务主体/抽检用户">
        </el-table-column>
        <el-table-column prop="price" label="权限">
          <template slot-scope="scope">
            {{ fun(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="pricedate"
          label="传感器型号"
          :formatter="formatDate"
        >
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneServicePrice(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="deleteOneServicePrice(scope.row)"
              type="danger"
              size="small"
              icon="el-icon-remove-outline"
              >删除</el-button
            >
          </template></el-table-column
        >
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-dialogDrag
      :title="titleMap[dialogStatus]"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="20vw"
      center
    >
      <el-form label-position="top" :model="form" ref="form">
        <el-form-item label="服务主体">
          <el-select v-model="form.servicename" collapse-tags :disabled="false">
            <el-option
              v-for="item in servicesublist"
              :key="item.servicename"
              :label="item.servicename"
              :value="item.servicename"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="销售价格（元/吨）">
          <el-input
            v-model="form.price"
            type="number"
            autocomplete="off"
          ></el-input>
        </el-form-item> -->
        <el-form-item label="权限">
          <el-select v-model="form.servicename" collapse-tags :disabled="false">
            <el-option
              v-for="item in servicesublist"
              :key="item.servicename"
              :label="item.servicename"
              :value="item.servicename"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="更新时间">
          <el-date-picker
            v-model="form.pricedate"
            autocomplete="off"
          ></el-date-picker>
        </el-form-item> -->
        <el-form-item label="传感器">
          <el-input
            v-model="form.price"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formCommit('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { TLSSocket } from "tls";
import { tmpdir } from "os";
export default {
  inject: ["reload"], //刷新时注入reload方法
  data() {
    return {
      tableData: [],
      servicesublist: [],
      filterservice: [],
      search: "",
      dialogVisible: false, //新增编辑对话框
      loading: false, //列表加载
      form: {
        realtimeindex: "", //索引
        servicename: "", //服务主体名称
        price: null,
        pricedate: null,
      },

      dialogStatus: "",

      titleMap: {
        add: "新增传感器", //根据自己内容定义名字
        edit: "编辑传感器", //根据自己内容定义名字
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

    // 获取“销售价格”数据
    async getServicePriceData() {
      var that = this;
      that.loading = true;

      that.servicesublist = await that.getServiceSubData();

      if (that.servicesublist) {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfRealtimeprice/selectByServiceid",
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

            this.$message.error("销售价格数据获取失败");
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
            realtimeindex:this.tableData[i].realtimeindex,
            servicename: this.getServiceNameByID(this.tableData[i].serviceid),
            price: this.tableData[i].price,
            pricedate: this.tableData[i].pricedate,
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

    //新增单条服务主体记录
    addOneServicePrice() {
      this.form.servicename = "";
      this.form.price = null;
      this.form.pricedate = new Date(); //时间;

      this.dialogStatus = "add";
      this.dialogVisible = true;
    },

    //编辑传感器参数
    editOneServicePrice(row) {
      this.form.realtimeindex = row.realtimeindex;
      this.form.servicename = row.servicename;
      this.form.price = row.price;
      this.form.pricedate = new Date(row.pricedate);

      this.dialogStatus = "edit";
      this.dialogVisible = true;
    },

    // 提交表单
    formCommit2() {
      let that = this;

      if (that.form.pricedate) {
        var startyear = that.form.pricedate.getFullYear();
        var startmonth = that.form.pricedate.getMonth() + 1;
        var startday = that.form.pricedate.getDate();

        //新增
        var postData = that.$qs.stringify({
          serviceid: that.serviceidSelect,
          price: that.form.price,
          pricedate: startyear + "/" + startmonth + "/" + startday,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfRealtimeprice/insert",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增一条销售价格记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新页面
          })
          .catch((err) => {
            that.$message.error("新增销售价格记录出错！请认真核对表单信息");
            console.log(err);
          });
      } else {
        that.$message.error("更新时间格式错误");
      }
    },

    // 提交表单
    formCommit(formName) {
      let that = this;

      that.$refs[formName].validate((valid) => {
        if (valid) {
          if (that.dialogStatus == "add") {
            if (that.form.pricedate) {
              var startyear = that.form.pricedate.getFullYear();
              var startmonth = that.form.pricedate.getMonth() + 1;
              var startday = that.form.pricedate.getDate();

              //新增
              var postData = that.$qs.stringify({
                serviceid: that.getServiceIDByName(that.form.servicename),
                price: that.form.price,
                pricedate: startyear + "/" + startmonth + "/" + startday,
              });
              that.$axios
                .post(
                  "http://119.3.221.188:8808/tfDbOperator-2.0/tfRealtimeprice/insert",
                  postData
                )
                .then((res) => {
                  that.$message({
                    message: "成功新增一条销售价格记录！",
                    type: "success",
                  });
                  that.dialogVisible = false;

                  that.reload(); //刷新页面
                })
                .catch((err) => {
                  that.$message.error(
                    "新增销售价格记录出错！请认真核对表单信息"
                  );
                  console.log(err);
                });
            } else {
              that.$message.error("更新时间格式错误");
            }
          } else if (this.dialogStatus == "edit") {
            if (that.form.pricedate) {
              var startyear = that.form.pricedate.getFullYear();
              var startmonth = that.form.pricedate.getMonth() + 1;
              var startday = that.form.pricedate.getDate();

              //新增
              var postData = that.$qs.stringify({
                realtimeindex:that.form.realtimeindex,
                serviceid: that.getServiceIDByName(that.form.servicename),
                price: that.form.price,
                pricedate: startyear + "/" + startmonth + "/" + startday,
              });
              that.$axios
                .post(
                  "http://119.3.221.188:8808/tfDbOperator-2.0/tfRealtimeprice/update",
                  postData
                )
                .then((res) => {
                  that.$message({
                    message: "成功修改一条销售价格记录！",
                    type: "success",
                  });
                  that.dialogVisible = false;

                  that.reload(); //刷新页面
                })
                .catch((err) => {
                  that.$message.error(
                    "修改销售价格记录出错！请认真核对表单信息"
                  );
                  console.log(err);
                });
            } else {
              that.$message.error("更新时间格式错误");
            }
          }
        } else {
          return false;
        }
      });
    },

    // 删除单条记录记录
    deleteOneServicePrice(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = {
            id: row.realtimeindex,
          };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfRealtimeprice/deleteById",
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