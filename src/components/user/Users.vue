<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card style="">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="10">
        <el-col :span="4">
          <el-button type="primary" @click="addOneUserSub()"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->

      <el-table
        :data="this.tableData"
        style="width: 100%"
        height="70vh"
        border
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
      >
      <el-table-row>大撒大声地三大</el-table-row>
        <el-table-column
          label="服务主体名称"
          prop="servicename"
        ></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="密码" prop="password"></el-table-column>
        <el-table-column label="权限" prop="jurisdiction"></el-table-column>
        <el-table-column  label="操作" fixed="right" width="300">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneUserSub(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >修改密码</el-button
            >
            <el-button
              @click="deleteOneUserSub(scope.row)"
              type="danger"
              size="small"
              icon="el-icon-remove-outline"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="20vw"
      center
    >
      <el-form label-position="top" :model="form">
        <el-form-item label="服务主体">
          <el-select v-model="serviceidSelect" placeholder="请选择">
            <el-option
              v-for="item in ServiceListRes"
              :key="item.serviceid"
              :label="item.servicename"
              :value="item.serviceid"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户权限">
          <el-select v-model="value" placeholder="请选择">
            <el-option
              v-for="item in jurisdiction_options"
              :key="item.value"
              :label="item.lable"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formCommit_add">提交</el-button>
      </div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      :visible.sync="dialogVisible_edit"
      :close-on-click-modal="false"
      width="20vw"
      center
    >
      <el-form label-position="top" :model="form">
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            disabled
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible_edit = false">取 消</el-button>
        <el-button type="primary" @click="formCommit_edit">提交</el-button>
      </div>
    </el-dialog>

    <!-- <div class="block" style="margin-top: 15px">
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
      </div> -->
  </div>
</template>


<script>
export default {
  inject: ["reload"], //刷新时注入reload方法
  data() {
    return {
      UserListRes: [],
      tableData: [],
      ServiceListRes: [],
      ServicesubList: [],
      serviceidSelect: "",
      total: 0,
      form: {
        username: "",
        password: "",
        serviceid: "",
        jurisdiction: "",
      },
      //权限选择
      value: "",
      jurisdiction_options: [
        { value: "enterpriseadmin", lable: "企业用户" },
        { value: "superadmin", lable: "超级管理员" },
      ],
      // dialogVisible: { editpPwd: false, addOneUser: false, delOneUser: false }, //修改、新增、删除对话框可见
      dialogVisible: false,
      dialogVisible_edit: false,
    };
  },
  created() {
    this.initTable();
  },
  methods: {
    // 初始化数据
    async initTable() {
      let that = this;
      that.ServicesubList = [];

      that.loading = true;
      try {
        that.UserListRes = await that.getUserList();
        that.ServiceListRes = await that.queryServiceList();

        //ServicesubList填充数据
        for (var j = 0; j < that.ServiceListRes.length; j++) {
          that.ServicesubList.push({
            serviceid: that.ServiceListRes[j].serviceid,
            servicename: that.ServiceListRes[j].servicename,
          });
        }

        for (var i = 0; i < that.UserListRes.length; i++) {
          var rowObj = {
            servicename: that.getServiceNameByID(that.UserListRes[i].serviceid), //服务主体
            username: that.UserListRes[i].username, //堆沤批次
            password: that.UserListRes[i].password, //开始时间
            jurisdiction: that.UserListRes[i].jurisdiction, //结束时间
          };
          that.tableData.push(rowObj);
        }

        // for (var i = 0; i < this.UserListRes.length; i++) {
        //   this.UserListRes[i].servicename = this.getServiceNameByID(
        //     this.UserListRes[i].serviceid
        //   );
        // }

        that.loading = false;
      } catch (error) {
        console.log(error);
        that.loading = false;
      }
    },

    // 刷新列表
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },
    //请求服务主体数据
    queryServiceList() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectAllServiceSub?offset=0&limit=10000000"
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    //根据服务主体ID获取名称
    getServiceNameByID(serviceid) {
      var servicename;

      if (serviceid == 0) servicename = "全部";
      else {
        //遍历查询服务主体名称
        for (var j = 0; j < this.ServiceListRes.length; j++) {
          if (this.ServiceListRes[j].serviceid == serviceid) {
            servicename = this.ServiceListRes[j].servicename;
            break;
          }
        }
      }

      return servicename;
    },

    // 请求用户信息
    getUserList() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/selectAll?offset=0&limit=100"
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // 新增用户信息
    addOneUserSub() {
      this.dialogVisible = true;
      this.form.username = "";
      this.form.password = "";
      this.form.serviceid = "";
      this.form.jurisdiction = "";
    },

    // 提交表单-新增用户
    formCommit_add() {
      let that = this;
      var postData = that.$qs.stringify({
        username: that.form.username,
        password: that.form.password,
        jurisdiction: that.value,
        serviceid: that.serviceidSelect,
      });
      that.$axios
        .post(
          "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/insertUser",
          postData
        )
        .then((res) => {
          that.$message({
            message: "成功新增一条用户记录",
            type: "success",
          });
          that.dialogVisible = false;
          that.reload();
          // that.reload() //刷新列表
        })
        .catch((err) => {
          that.$message.error("新增一条用户记录出错！请认真核对表单信息");
          console.log(err);
        });
    },

    // 请求修改用户信息
    editOneUserSub(row) {
      this.dialogVisible_edit = true;
      this.form.username = row.username;
      this.form.password = row.password;
      this.form.serviceid = row.serviceid;
      this.form.jurisdiction = row.jurisdiction;
    },

    // 提交表单-修改密码
    formCommit_edit() {
      let that = this;
      var postData = that.$qs.stringify({
        username: that.form.username,
        password: that.form.password,
        jurisdiction: that.form.jurisdiction,
        serviceid: that.form.serviceid,
      });
      that.$axios
        .post(
          "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/update",
          postData
        )
        .then((res) => {
          that.$message({
            message: "密码修改成功",
            type: "success",
          });
          that.dialogVisible_edit = false;
          console.log("成功");
          that.reload();
        })
        .catch((err) => {
          that.$message.error("密码修改错误！请认真核对表单信息");
          console.log(err);
        });
    },

    // 请求删除用户
    deleteOneUserSub(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = { username: row.username };
          this.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/deleteBy",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                var spliceID;
                for (var i = 0; i < that.UserListRes.length; i++) {
                  if (row.username == that.UserListRes[i].username) {
                    spliceID = i;
                  }
                }
                that.UserListRes.splice(spliceID, 1);

                that.$message({
                  type: "success",
                  message: "删除成功!",
                });

                that.reload();
              } else {
                that.$message.error("删除失败");
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
  }, // method 尾
}; // export default 尾
</script>


<style lang ="less" scoped>
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
  height: 70vh;
  overflow: auto;
}
</style>