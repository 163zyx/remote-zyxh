<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>GPS设备控配置</el-breadcrumb-item>
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
            @click="addOneGPS()"
            icon="el-icon-circle-plus-outline"
            >新增GPS</el-button
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
        <el-table-column prop="servicename" label="服务主体名称" width="200">
        </el-table-column>

        <el-table-column prop="gpssn" label="GPS设备编码"> </el-table-column>

        <el-table-column prop="salesbatch" label="销售批次"> </el-table-column>

        <el-table-column prop="carattendant" label="随车人员">
        </el-table-column>

        <el-table-column prop="carattendantphone" label="联系电话">
        </el-table-column>

        <el-table-column prop="receiver" label="收货人"> </el-table-column>

        <el-table-column prop="receiverphone" label="收货人电话">
        </el-table-column>

        <el-table-column prop="receivingaddress" label="收货地址">
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneGPS(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >配置GPS设备</el-button
            >

            <el-button
              @click="deleteOnePrdcConfirm(scope.row)"
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
      <el-form
        label-position="top"
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务主体" required>
              <!-- <el-input v-model="form.servicesubject" autocomplete="off"></el-input> -->
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
              label="GPS设备编码"
              required
              style="margin-left: 20px"
            >
              <el-input
                v-model="form.gpssn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="销售批次">
              <el-input
                v-model="form.salesbatch"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="随车人员" style="margin-left: 20px">
              <el-input
                v-model="form.carattendant"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input
                v-model="form.carattendantphone"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="收货人" style="margin-left: 20px">
              <el-input
                v-model="form.receiver"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="收货人电话">
              <el-input
                v-model="form.receiverphone"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="收货地址" style="margin-left: 20px">
              <el-input
                v-model="form.receivingaddress"
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
      gpsTableData: [
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_001",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_002",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_003",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_004",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_005",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_006",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_007",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_008",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_009",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
        {
          servicename: "超润生物肥中心",
          gpssn: "CR_GPS_010",
          salesbatch: "20211209-001",
          carattendant: "韩剧问",
          carattendantphone: "13276483321",
          receiver: "张庆",
          receiverphone: "13567876545",
          receivingaddress: "苏村镇城子庄村",
        },
      ],
      filterservice: [],

      dialogVisible: false, //新增编辑对话框

      loading: false, //列表加载
      form: {
        servicename: "", //服务主体名称
        gpssn: "",
        salesbatch: "",
        carattendant: "",
        carattendantphone: "",
        receiver: "",
        receiverphone: "",
        receivingaddress: "",
      },

      titleMap: {
        addGPS: "新增GPS设备", //根据自己内容定义名字
        eidtGPS: "编辑GPS设备", //根据自己内容定义名字
      },

      //新增和编辑弹框标题
      dialogStatus: "",
      rules: {
        //表单验证验证规则
        servicename: [
          { required: true, message: "请选择一个企业", trigger: "change" },
        ],

        gpssn: [
          { required: true, message: "请输入GPS设备编码", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    this.initTable();
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
          filterRes = this.gpsTableData.filter((array) =>
            array.servicename.match(this.filterservice[i])
          );

          for (var j = 0; j < filterRes.length; j++) {
            resTable.push(filterRes[j]);
          }
        }
      } else {
        resTable = this.gpsTableData;
      }

      return resTable;
    },
  },

  methods: {
    /**
     * 加载数据表
     */
    async initTable() {
      this.tableData = [];
      this.servicesublist = [];
      this.loading = true;
      try {
        this.servicesublist = await this.queryServiceList();
        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },

    changeServiceSublist(serviceid) {
      this.form.serviceid = serviceid;
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

    // 刷新列表
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },

    addOneGPS() {
      this.form.servicename = "";
      this.form.gpssn = "";
      this.form.salesbatch = "";
      this.form.carattendant = "";
      this.form.carattendantphone = "";
      this.form.receiver = "";
      this.form.receiverphone = "";
      this.form.receivingaddress = "";
      this.dialogStatus = "addGPS";
      this.dialogVisible = true;
    },

    //编辑单条服务主体记录
    editOneGPS(row) {
      this.form.servicename = row.servicename;
      this.form.gpssn = row.gpssn;
      this.form.salesbatch = row.salesbatch;
      this.form.carattendant = row.carattendant;
      this.form.carattendantphone = row.carattendantphone;
      this.form.receiver = row.receiver;
      this.form.receiverphone = row.receiverphone;
      this.form.receivingaddress = row.receivingaddress;
      this.dialogStatus = "eidtGPS";
      this.dialogVisible = true;
    },

    // 提交表单
    formCommit() {
      let that = this;
      //编辑
      var postData = that.$qs.stringify({
        gpssn: that.form.gpssn,
        salesbatch: that.form.salesbatch,
        carattendant: that.form.carattendant,
        carattendantphone: that.form.carattendantphone,
        receiver: that.form.receiver,
        receiverphone: that.form.receiverphone,
        receivingaddress: that.form.receivingaddress,
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