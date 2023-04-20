<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>视频监控配置</el-breadcrumb-item>
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
        <el-table-column prop="servicename" label="服务主体名称" width="200">
        </el-table-column>

        <el-table-column prop="duiliaoqudn" label="堆料区DN码">
        </el-table-column>

        <el-table-column prop="dibangqudn" label="地磅区DN码">
        </el-table-column>

        <el-table-column prop="fajiaochidn" label="发酵池DN码">
        </el-table-column>

        <el-table-column prop="chuchangqudn" label="出厂区DN码">
        </el-table-column>

        <el-table-column prop="zhuanghuoquodn" label="装货区DN码">
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneServiceSub(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >配置视频监控</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑和新增对话框 -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      title="视频监控配置"
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
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="堆料区DN码" style="margin-left: 20px">
              <el-input
                v-model="form.duiliaoqudn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="地磅区DN码">
              <el-input
                v-model="form.dibangqudn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="发酵池DN码" style="margin-left: 20px">
              <el-input
                v-model="form.fajiaochidn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="出厂区DN码">
              <el-input
                v-model="form.chuchangqudn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="装货区DN码" style="margin-left: 20px">
              <el-input
                v-model="form.zhuanghuoquodn"
                autocomplete="off"
                type="text"
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
        duiliaoqudn: "",
        dibangqudn: "",
        fajiaochidn: "",
        chuchangqudn: "",
        zhuanghuoquodn: "",
      },
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

    //编辑单条服务主体记录
    editOneServiceSub(row) {
      this.form.servicename = row.servicename;
      this.form.duiliaoqudn = row.duiliaoqudn;
      this.form.dibangqudn = row.dibangqudn;
      this.form.fajiaochidn = row.fajiaochidn;
      this.form.chuchangqudn = row.chuchangqudn;
      this.form.zhuanghuoquodn = row.zhuanghuoquodn;
      this.selectServiceID = row.serviceid;
      this.dialogVisible = true;
    },

    // 提交表单
    formCommit() {
      let that = this;

      //编辑
      var postData = that.$qs.stringify({
        serviceid: that.selectServiceID,
        servicename: that.form.servicename,
        duiliaoqudn: that.form.duiliaoqudn,
        dibangqudn: that.form.dibangqudn,
        fajiaochidn: that.form.fajiaochidn,
        chuchangqudn: that.form.chuchangqudn,
        zhuanghuoquodn: that.form.zhuanghuoquodn,
      });
      that.$axios
        .post(
          "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/updateServiceSub",
          postData
        )
        .then((res) => {
          that.$message({
            message: "视频监控配置完成",
            type: "success",
          });
          that.dialogVisible = false;

          that.reload(); //刷新页面
        })
        .catch((err) => {
          that.$message.error("视频监控配置出错！请认真核对表单信息");
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
  overflow: auto;
}
</style>