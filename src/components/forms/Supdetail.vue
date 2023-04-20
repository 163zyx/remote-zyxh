<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>供应明细表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card style="height: 85vh">
      <!-- 搜索与添加 -->
      <el-row :gutter="10">
        <el-col :span="5.5">
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
        <el-col :span="5.5">
          <el-date-picker
            v-model="filterdaterange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            @click="addOneSupdetail()"
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
      <!-- 列表区 -->
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
        <el-table-column
          prop="supdetailid"
          label="id"
          fixed
          width="80"
          v-if="false"
        >
        </el-table-column>
        <el-table-column prop="servicesubject" label="服务主体名称" width="180">
        </el-table-column>
        <el-table-column prop="ordernumber" label="批次单号" width="120">
        </el-table-column>
        <el-table-column prop="town" label="乡镇" width="100">
        </el-table-column>
        <el-table-column prop="village" label="村" width="100">
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100">
        </el-table-column>
        <el-table-column prop="contactinfo" label="联系方式" width="120">
        </el-table-column>
        <el-table-column prop="crop" label="作物" width="100">
        </el-table-column>
        <el-table-column prop="area" label="施用面积（亩）" width="120">
        </el-table-column>
        <el-table-column prop="amount" label="施用量（吨）" width="120">
        </el-table-column>
        <el-table-column
          prop="landlocation"
          label="地块位置"
          width="200"
          show-overflow-tooltip
        >
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneSupdetail(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click.native="deleteOneSupdetail(scope.row)"
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
    <!-- 编辑和新增对话框 -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      :title="titleMap[dialogStatus]"
      :visible.sync="dialogVisible"
      width="40vw"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      center
    >
      <el-form label-position="top" :model="form" class="el-dialog-div">
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务主体">
              <!-- <el-input v-model="form.servicesubject" autocomplete="off"></el-input> -->
              <el-select
                v-model="form.servicesub"
                clearable
                filterable
                placeholder="请选择"
                @change="changeServiceSublist"
              >
                <el-option
                  v-for="item in servicesublist"
                  :key="item.serviceid"
                  :label="item.servicename"
                  :value="item.serviceid"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次单号" style="margin-left: 10px">
              <el-input
                v-model="form.ordernumber"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="乡镇">
              <el-input
                v-model="form.town"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="村" style="margin-left: 10px">
              <el-input
                v-model="form.village"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input
                v-model="form.name"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" style="margin-left: 10px">
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
            <el-form-item label="作物">
              <el-input
                v-model="form.crop"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="施用面积（亩）" style="margin-left: 10px">
              <el-input
                v-model="form.area"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="施用量（吨）">
              <el-input
                v-model="form.amount"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地块位置" style="margin-left: 10px">
              <el-input
                v-model="form.landlocation"
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
      filterservice: [], //
      filterdaterange: "",
      dialogVisible: false, //新增编辑对话框
      selectServiceID: 0, //选中的记录ID，用于删除编辑等
      selectSupdetailID: 0, //选中的记录ID
      loading: false, //列表加载
      ServiceListRes: [],
      SupdetailRes: [],
      form: {
        supdetailid: "",
        servicesub: "", //服务主体id
        ordernumber: "", //批次单号
        town: "", //乡镇
        village: "", //村
        name: "", //姓名
        contactinfo: null, //联系方式
        crop: "", //作物
        area: 0, //面积
        amount: 0, //数量
        landlocation: "", //地块位置
      },
      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数
      titleMap: {
        add: "新增供应明细记录", //根据自己内容定义名字
        edit: "编辑供应明细记录", //根据自己内容定义名字
      },
      //新增和编辑弹框标题
      dialogStatus: "",
    };
  },
  created() {
    this.initTable();
  },
  computed: {
    tables: function () {
      /** 过滤服务主体*/
      let resTable = new Array();
      if (this.filterservice.length > 0) {
        let filterRes = new Array();
        for (var i = 0; i < this.filterservice.length; i++) {
          filterRes = this.tableData.filter((array) =>
            array.servicesubject.match(this.filterservice[i])
          );

          for (var j = 0; j < filterRes.length; j++) {
            resTable.push(filterRes[j]);
          }
        }
      } else {
        resTable = this.tableData;
      }
      const filterdaterange = this.filterdaterange;
      if (filterdaterange)
        if (filterdaterange.length > 0) {
          var startdate = filterdaterange[0]; //开始时间
          var enddate = filterdaterange[1]; //结束时间

          resTable = resTable.filter(
            (array) =>
              Date.parse(array.rettingstartdate) >= Date.parse(startdate) &&
              Date.parse(array.rettingstartdate) <= Date.parse(enddate)
          );
        }

      return resTable;
    },
  },
  mounted() {},
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

    //拿到方法1与方法2的两个结果后，执行init方法
    async initTable() {
      this.tableData = [];
      this.servicesublist = [];

      this.loading = true;
      try {
        this.SupdetailRes = await this.querysupdetail();
        this.ServiceListRes = await this.queryServiceList();
        //servicesublist填充数据
        for (var j = 0; j < this.ServiceListRes.length; j++) {
          this.servicesublist.push({
            serviceid: this.ServiceListRes[j].serviceid,
            servicename: this.ServiceListRes[j].servicename,
          });
        }
        for (var i = 0; i < this.SupdetailRes.length; i++) {
          this.SupdetailRes[i].servicesubject = this.getServiceNameByID(
            this.SupdetailRes[i].servicesubject
          );
        }
        this.tableData = this.SupdetailRes;
        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },

    /**
     * 根据服务主体ID获取名称
     */
    getServiceNameByID(serviceid) {
      var servicename;
      //遍历查询服务主体名称
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].serviceid == serviceid) {
          servicename = this.ServiceListRes[j].servicename;
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
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].servicename == servicename) {
          serviceid = this.ServiceListRes[j].serviceid;
          break;
        }
      }
      return serviceid;
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

    /**
     * 获取原料进厂清单
     */
    querysupdetail() {
      // const params = { offset: ofs, limit: lmt };
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSupdetail/selectByServiceid",
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

    // 刷新列表
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },

    /**
     * 切换服务主体列表事件
     */
    changeServiceSublist(serviceid) {
      this.form.servicesub = serviceid;
    },

    //新增单条原料进厂记录
    addOneSupdetail() {
      this.form.servicesub = "";

      this.form.ordernumber = "";
      this.form.town = "";
      this.form.village = "";
      this.form.name = "";
      this.form.contactinfo = "";
      this.form.crop = "";
      this.form.area = 0.0;
      this.form.amount = 0.0;
      this.form.landlocation = "";

      this.dialogStatus = "add";
      this.dialogVisible = true;
    },

    //编辑单条原料进厂记录
    editOneSupdetail(row) {
      this.form.servicesub = this.getServiceIDByName(row.servicesubject);
      this.form.ordernumber = row.ordernumber;
      this.form.town = row.town;
      this.form.village = row.village;
      this.form.name = row.name;
      this.form.contactinfo = row.contactinfo;
      this.form.crop = row.crop;
      this.form.area = row.area;
      this.form.amount = row.amount;
      this.form.landlocation = row.landlocation;

      this.selectSupdetailID = row.supdetailid;

      this.dialogStatus = "edit";
      this.dialogVisible = true;
    },

    /** 统计报表*/
    report() {
      var that = this;
      that.$router.replace("/report_materials_main");
    },

    /**
     * 提交表单
     */
    formCommit() {
      let that = this;
      if (that.dialogStatus == "add") {
        //新增
        var postData = that.$qs.stringify({
          servicesubject: that.form.servicesub,
          ordernumber: that.form.ordernumber,
          town: that.form.town,
          village: that.form.village,
          name: that.form.name,
          contactinfo: that.form.contactinfo,
          crop: that.form.crop,
          area: that.form.area,
          amount: that.form.amount,
          landlocation: that.form.landlocation,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSupdetail/insertTfSupdetail",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增一条供应明细记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("新增供应明细记录出错！请认真核对表单信息");
            console.log(err);
          });
      } else if (that.dialogStatus == "edit") {
        //编辑

        var postData = that.$qs.stringify({
          supdetailid: that.selectSupdetailID,
          servicesubject: that.form.servicesub,
          ordernumber: that.form.ordernumber,
          town: that.form.town,
          village: that.form.village,
          name: that.form.name,
          contactinfo: that.form.contactinfo,
          crop: that.form.crop,
          area: that.form.area,
          amount: that.form.amount,
          landlocation: that.form.landlocation,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSupdetail/update",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功修改供应明细记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("修改供应明细记录出错！请认真核对表单信息");
          });
      }
    },

    // 删除单条记录记录
    deleteOneSupdetail(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = { supid: row.supdetailid };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfSupdetail/deleteBy",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                that.tableData.splice(row.supdetailid, 1);
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

    exportExcel() {
      var that = this;
      require.ensure([], () => {
        const { export_json_to_excel } = require("@/excel/export2Excel"); //这里必须使用绝对路径，使用@/+存放export2Excel的路径
        const tHeader = [
          "服务主体名称",
          "批次单号",
          "乡镇",
          "村",
          "姓名",
          "联系方式",
          "作物",
          "施用面积（亩）",
          "施用量（吨）",
          "地块位置",
        ];
        var filterVal = [
          "servicesubject",
          "ordernumber",
          "town",
          "village",
          "name",
          "contactinfo",
          "crop",
          "area",
          "amount",
          "landlocation",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "供应明细表"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("/addBatchSupdetail");
    },
  },
};
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