<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>原料进厂台账</el-breadcrumb-item>
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
            @click="addOneMaterialSub()"
            icon="el-icon-circle-plus-outline"
            >新增记录</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" @click="report()" icon="el-icon-pie-chart"
            >统计报表</el-button
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
        <el-col :span="2">
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
        <el-table-column prop="servicename" label="服务主体" width="180">
        </el-table-column>
        <el-table-column
          prop="materialdate"
          label="日期"
          width="120"
          :formatter="formatDate"
        >
        </el-table-column>
        <el-table-column prop="materialsource" label="原料来源地" width="120">
        </el-table-column>
        <el-table-column prop="materialtype" label="原料类型" width="120">
        </el-table-column>
        <el-table-column prop="materialquantity" label="数量（吨）" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.materialquantity) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="materialunitprice"
          label="单价（元/吨）"
          width="120"
        >
          <template slot-scope="scope">
            {{ fun(scope.row.materialunitprice) }}
          </template>
        </el-table-column>
        <el-table-column prop="materialamount" label="金额（元）" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.materialamount) }}
          </template>
        </el-table-column>
        <el-table-column prop="principal" label="负责人"> </el-table-column>
        <el-table-column prop="contactinfo" label="联系方式" width="120">
        </el-table-column>
        <el-table-column prop="note" label="备注"> </el-table-column>
        <el-table-column fixed="right" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneMaterialSub(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="deleteOneMaterialSub(scope.row)"
              type="danger"
              size="small"
              icon="el-icon-remove-outline"
              >删除</el-button
            >
          </template></el-table-column
        >
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
      :title="titleMap[dialogStatus]"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="40vw"
      center
    >
      <el-form label-position="top" :model="form" class="el-dialog-div">
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务主体">
              <!-- <el-input v-model="form.servicesubject" autocomplete="off"></el-input> -->
              <el-select
                v-model="currentServiceSubName"
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
            <el-form-item label="日期" style="margin-left: 10px; width: 400px">
              <el-date-picker
                v-model="form.materialdate"
                autocomplete="off"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="原料来源地">
              <el-input
                v-model="form.materialsource"
                autocomplete="off"
                type="text"
              ></el-input> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="原料类型" style="margin-left: 10px">
              <el-input
                v-model="form.materialtype"
                autocomplete="off"
                type="text"
              ></el-input> </el-form-item
          ></el-col>
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item label="数量(吨)">
              <el-input
                v-model="form.materialquantity"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元/吨)" style="margin-left: 10px">
              <el-input
                v-model="form.materialunitprice"
                autocomplete="off"
                type="number"
              ></el-input> </el-form-item
          ></el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="金额(元)">
              <el-input
                v-model="form.materialamount"
                autocomplete="off"
                type="number"
              ></el-input> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="负责人" style="margin-left: 10px">
              <el-input
                v-model="form.principal"
                autocomplete="off"
                type="text"
              ></el-input> </el-form-item
          ></el-col>
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item label="联系方式">
              <el-input
                v-model="form.contactinfo"
                autocomplete="off"
                type="number"
                maxlength="11"
                minlength="11"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" style="margin-left: 10px">
              <el-input
                v-model="form.note"
                autocomplete="off"
                type="text"
              ></el-input> </el-form-item
          ></el-col>
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
      servicesublist: [],
      currentServiceSubName: "", //当前选中的服务主体名称
      search: "",
      dialogVisible: false, //新增编辑对话框
      selectMaterialID: 0, //选中记录的ID，用于删除编辑等
      loading: false, //列表加载
      ServiceListRes: [],
      MaterialledgerRes: [],
      form: {
        materialledgerindex: "",
        serviceid: "", //服务主体id
        materialdate: "", //日期时间
        materialsource: "", //原料来源地
        materialtype: "", //原料类型
        materialquantity: "", //数量
        materialunitprice: "", //单价
        materialamount: "", //金额
        principal: "", //负责人
        contactinfo: 0, //联系电话
        note: "", //备注
      },
      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数
      titleMap: {
        addEquipment: "新增服务主体记录", //根据自己内容定义名字
        editEquipment: "编辑服务主体记录", //根据自己内容定义名字
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
            array.servicename.match(this.filterservice[i])
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
              Date.parse(array.materialdate) >= Date.parse(startdate) &&
              Date.parse(array.materialdate) <= Date.parse(enddate)
          );
        }

      return resTable;
    },
  },

  methods: {
    // 路由传参
    routerTo() {
      this.$router.push({
        name: "Report_material_main",
        query: {
          router_tableData: this.tableData,
          router_servicesublist: this.servicesublist,
        },
      });
      console.log("传参成功！");
    },

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
        this.MaterialledgerRes = await this.querymaterialledger();
        this.ServiceListRes = await this.queryServiceList();
        //servicesublist填充数据
        for (var j = 0; j < this.ServiceListRes.length; j++) {
          this.servicesublist.push({
            serviceid: this.ServiceListRes[j].serviceid,
            servicename: this.ServiceListRes[j].servicename,
          });
        }
        for (var i = 0; i < this.MaterialledgerRes.length; i++) {
          this.MaterialledgerRes[i].servicename = this.getServiceNameByID(
            this.MaterialledgerRes[i].serviceid
          );
        }

        this.tableData = this.MaterialledgerRes;

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
     * 根据服务主体名获取ID
     */
    getServiceIdByName(servicename) {
      var serviceId;
      //遍历查询服务主体名称
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].servicename == servicename) {
          serviceId = this.ServiceListRes[j].serviceid;
          break;
        }
      }
      return serviceId;
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
    querymaterialledger() {
      // const params = { offset: ofs, limit: lmt };
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfMaterialledger/selectByServiceid",
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

    // //日期格式化
    // dateFormat(fmt, date) {
    //   let ret;
    //   const opt = {
    //     "Y+": date.getFullYear().toString(), // 年
    //     "m+": (date.getMonth() + 1).toString(), // 月
    //     "d+": date.getDate().toString(), // 日
    //     "H+": date.getHours().toString(), // 时
    //     "M+": date.getMinutes().toString(), // 分
    //     "S+": date.getSeconds().toString(), // 秒
    //     // 有其他格式化字符需求可以继续添加，必须转化成字符串
    //   };
    //   for (let k in opt) {
    //     ret = new RegExp("(" + k + ")").exec(fmt);
    //     if (ret) {
    //       fmt = fmt.replace(
    //         ret[1],
    //         ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
    //       );
    //     }
    //   }
    //   return fmt;
    // },

    // //日期转换
    // dateConvert() {
    //   for (var i = 0; i < this.tableData.length; i++) {
    //     if (this.tableData[i].materialdate != null) {
    //       this.tableData[i].materialdate = this.dateFormat(
    //         "YYYY-mm-dd", //范例：年-月-日 时:分 "YYYY-mm-dd HH:MM"
    //         new Date(this.tableData[i].materialdate)
    //       );
    //     }
    //   }
    // },

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

    // 刷新列表
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },

    //新增单条原料进厂记录
    addOneMaterialSub() {
      this.form.servicesubject = "";
      this.form.materialdate = new Date()
        .toLocaleDateString()
        .replace(/\//g, "/");
      this.form.materialsource = "";
      this.form.materialtype = "";
      this.form.materialquantity = 0.0;
      this.form.materialunitprice = 0.0;
      this.form.materialamount = 0;
      this.form.rincipal = "";
      this.form.contactinfo = "";
      this.form.note = "";

      this.currentServiceSubName = ""; //服务列表置空
      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;
    },

    //编辑单条原料进厂记录
    editOneMaterialSub(row) {
      console.log(row.materialsource);
      this.form.serviceid = row.serviceid;
      this.form.materialdate = row.materialdate.replace(/-/g, "/");
      this.form.materialsource = row.materialsource;
      this.form.materialtype = row.materialtype;
      this.form.materialquantity = row.materialquantity;
      this.form.materialunitprice = row.materialunitprice;
      this.form.materialamount = row.materialamount;
      this.form.principal = row.principal;
      this.form.contactinfo = row.contactinfo;
      this.form.note = row.note;
      this.selectMaterialID = row.materialledgerindex;

      this.currentServiceSubName = row.serviceid;

      this.dialogStatus = "editEquipment";
      this.dialogVisible = true;
    },

    /**
     * 插入一条记录
     */
    insertRecord(postdata) {
      return new Promise((resolve, reject) => {});
    },

    /** 统计报表*/
    report() {
      var that = this;
      that.$router.replace("/report_material_main");
      this.routerTo();
    },

    /**
     * 切换服务主体列表事件
     */
    changeServiceSublist(serviceid) {
      this.form.servicesubject = serviceid;
    },

    /**
     * 提交表单
     */
    formCommit() {
      let that = this;
      if (that.dialogStatus == "addEquipment") {
        //新增
        var postData = that.$qs.stringify({
          serviceid: that.form.servicesubject,
          materialdate: that.form.materialdate,
          materialsource: that.form.materialsource,
          materialtype: that.form.materialtype,
          materialquantity: that.form.materialquantity,
          materialunitprice: that.form.materialunitprice,
          materialamount: that.form.materialamount,
          principal: that.form.principal,
          contactinfo: that.form.contactinfo,
          note: that.form.note,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfMaterialledger/insert",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增一条原料进厂记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("新增原料进厂记录出错！请认真核对表单信息");
            console.log(err);
          });
      } else if (that.dialogStatus == "editEquipment") {
        //编辑

        var postData = that.$qs.stringify({
          materialledgerindex: that.selectMaterialID,
          // servicesubject: function () {
          //   //根据名称获取服务主体id
          //   var ssb = that.form.servicesubject;
          //   for (ss of that.servicesublist) {
          //     if (ss.servicename == that.form.servicesubject)
          //       ssb = ss.serviceId;
          //   }
          //   return ssb;
          // },
          serviceid: that.form.serviceid,
          materialdate: that.form.materialdate,
          materialsource: that.form.materialsource,
          materialtype: that.form.materialtype,
          materialquantity: that.form.materialquantity,
          materialunitprice: that.form.materialunitprice,
          materialamount: that.form.materialamount,
          principal: that.form.principal,
          contactinfo: that.form.contactinfo,
          note: that.form.note,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfMaterialledger/update",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功修改原料进厂记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("修改原料进厂记录出错！请认真核对表单信息");
          });
      }
    },

    // 删除单条记录
    deleteOneMaterialSub(row) {
      console.log("启动删除");
      let that = this;
      that
        .$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = { tlid: row.materialledgerindex };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfMaterialledger/deleteById",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                var spliceID;
                for (var i = 0; i < that.tableData.length; i++) {
                  if (
                    row.materialledgerindex ==
                    that.tableData[i].materialledgerindex
                  ) {
                    spliceID = i;
                  }
                }
                that.tableData.splice(spliceID, 1);

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
          "服务主体",
          "日期",
          "原料来源地",
          "原料类型",
          "数量（吨）",
          "单位（元/吨）",
          "金额（元）",
          "负责人",
          "联系方式",
          "备注",
        ];
        var filterVal = [
          "servicename",
          "materialdate",
          "materialsource",
          "materialtype",
          "materialquantity",
          "materialunitprice",
          "materialamount",
          "principal",
          "contactinfo",
          "note",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "原料进厂台账"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("/addBatchYLincome");
    },

    /**
     * 保留两位小数
     */
    fun(val) {
      return Number(val).toFixed(2);
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
  overflow: auto;
}
</style>