<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>企业管理</el-breadcrumb-item>
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
              v-for="item in tableData"
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
            @click="addOneServiceSub()"
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
        <el-table-column prop="servicename" label="服务主体名称" width="180">
        </el-table-column>
        <el-table-column prop="serviceshortnm" label="简称"> </el-table-column>

        <el-table-column prop="director" label="负责人"> </el-table-column>
        <el-table-column prop="contactinfo" label="联系方式"> </el-table-column>

        <el-table-column prop="place" label="地点"> </el-table-column>
        <el-table-column prop="materialkind" label="原料种类">
        </el-table-column>
        <el-table-column prop="disposal" label="处理模式"> </el-table-column>
        <el-table-column prop="servicelng" label="经度"> </el-table-column>
        <el-table-column prop="servicelag" label="纬度"> </el-table-column>

        <el-table-column fixed="right" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneServiceSub(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="deleteOneServiceSub(scope.row)"
              type="danger"
              size="small"
              icon="el-icon-remove-outline"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑和新增对话框 -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      :title="titleMap[dialogStatus]"
      :visible.sync="dialogVisible"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      center
    >
      <el-form label-position="top" :model="form" class="el-dialog-div">
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务主体名称">
              <el-input
                v-model="form.servicename"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="简称" style="margin-left: 20px">
              <el-input
                v-model="form.serviceshortnm"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-input
                v-model="form.director"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" style="margin-left: 20px">
              <el-input
                v-model="form.contactinfo"
                autocomplete="off"
                type="number"
                maxlength="11"
                minlength="11"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="地点">
              <el-input
                v-model="form.place"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="原料种类" style="margin-left: 20px">
              <el-input
                v-model="form.materialkind"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="处理模式">
              <el-input
                v-model="form.disposal"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度" style="margin-left: 20px">
              <el-input
                v-model="form.servicelng"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input
                v-model="form.servicelag"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formCommit">提交</el-button>
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
      search: "",
      dialogVisible: false, //新增编辑对话框
      selectServiceID: 0, //选中的记录ID，用于删除编辑等
      loading: false, //列表加载
      form: {
        servicename: "", //服务主体名称
        serviceshortnm: "",
        director: "", //负责人
        contactinfo: 0, //联系电话
        place: "", //地点
        materialkind: "", //原料种类
        disposal: "", //处理模式
        servicelng: 0, //经度
        servicelag: 0, //纬度
      },
      titleMap: {
        addEquipment: "新增企业数据", //根据自己内容定义名字
        editEquipment: "编辑企业数据", //根据自己内容定义名字
      },
      //新增和编辑弹框标题
      dialogStatus: "",
    };
  },

  created() {
    this.getServiceSubData();
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
        for (var i = 0; i < this.filterservice.length; i++) {
          filterRes = this.tableData.filter((array) =>
            array.servicename.match(this.filterservice[i])
          );

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
      for (var i = 0; i < 10000; i++) serviceIdWherein.push(i);
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
            this.tableData = res.data;

            resolve(res.data);
            this.loading = false;
          })
          .catch((err) => {
            reject(err);
            this.loading = false;
          });
      });
    },

    // 刷新列表
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },

    //新增单条服务主体记录
    addOneServiceSub() {
      this.servicename = "";
      this.director = "";
      this.contactinfo = null;
      this.place = "";
      this.materialkind = "";
      this.disposal = "";
      this.servicelng = null;
      this.servicelag = null;
      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;
    },

    //编辑单条服务主体记录
    editOneServiceSub(row) {
      this.form.servicename = row.servicename;
      this.form.serviceshortnm = row.serviceshortnm;
      this.form.director = row.director;
      this.form.contactinfo = row.contactinfo;
      this.form.place = row.place;
      this.form.materialkind = row.materialkind;
      this.form.disposal = row.disposal;
      this.form.servicelng = row.servicelng;
      this.form.servicelag = row.servicelag;
      this.selectServiceID = row.serviceid;
      this.dialogStatus = "editEquipment";
      this.dialogVisible = true;
    },

    // 提交表单
    formCommit() {
      let that = this;

      if (that.dialogStatus == "addEquipment") {
        //新增
        var postData = that.$qs.stringify({
          servicename: that.form.servicename,
          serviceshortnm: that.form.serviceshortnm,
          place: that.form.place,
          materialkind: that.form.materialkind,
          disposal: that.form.disposal,
          director: that.form.director,
          contactinfo: that.form.contactinfo,
          servicelng: that.form.servicelng,
          servicelag: that.form.servicelag,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/insertServiceSub",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增企业数据！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新页面
          })
          .catch((err) => {
            that.$message.error("新增企业数据出错！请认真核对表单信息");
            console.log(err);
          });
      } else if (that.dialogStatus == "editEquipment") {
        //编辑
        var postData = that.$qs.stringify({
          serviceid: that.selectServiceID,
          servicename: that.form.servicename,
          serviceshortnm: that.form.serviceshortnm,
          place: that.form.place,
          materialkind: that.form.materialkind,
          disposal: that.form.disposal,
          director: that.form.director,
          contactinfo: that.form.contactinfo,
          servicelng: that.form.servicelng,
          servicelag: that.form.servicelag,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/updateServiceSub",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功修改企业数据！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新页面
          })
          .catch((err) => {
            that.$message.error("修改企业数据出错！请认真核对表单信息");
          });
      }
    },

    // 删除单条记录记录
    deleteOneServiceSub(row) {
      let that = this;
      that
        .$confirm(
          "删除企业记录将级联删除该企业原料台账、销售台账、产量确认、生产记录、生产记录台账、产品质量、质量抽检、实时价格等记录, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
        .then(() => {
          const params = { serviceid: row.serviceid };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/deleteServiceSubBy",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                that.tableData.splice(row.serviceid, 1);
                that.reload();
                that.$message({
                  type: "success",
                  message: "删除成功!",
                });
              } else {
                that.$message({
                  type: "success",
                  message: "删除失败!",
                });
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
  // height: 70vh;
  overflow: auto;
}
</style>