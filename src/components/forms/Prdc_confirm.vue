<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>产量确认表</el-breadcrumb-item>
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
            @click="addOneServiceSub()"
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
          <el-button type="primary" @click="report()" icon="el-icon-pie-chart"
            >统计报表</el-button
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
        <el-table-column prop="servicesub" label="服务主体名称" width="180">
        </el-table-column>
        <el-table-column prop="rettingbatch" label="堆沤批次" width="180">
        </el-table-column>
        <el-table-column
          prop="productionconfirmdate"
          :formatter="formatDate"
          label="日期"
          width="180"
        >
        </el-table-column>
        <el-table-column prop="productname" label="产品名称" width="180">
        </el-table-column>

        <el-table-column prop="volume" label="体积（m³）" width="180">
          <template slot-scope="scope">
            {{ fun(scope.row.volume) }}
          </template>
        </el-table-column>

        <el-table-column prop="moisture" label="水分（%）" width="180">
          <template slot-scope="scope">
            {{ fun(scope.row.moisture) }}
          </template>
        </el-table-column>

        <el-table-column prop="volumeweight" label="容重（kg/m³）" width="180">
          <template slot-scope="scope">
            {{ fun(scope.row.volumeweight) }}
          </template>
        </el-table-column>

        <el-table-column prop="convertweight" label="折算吨数" width="180">
          <template slot-scope="scope">
            {{ fun(scope.row.convertweight) }}
          </template>
        </el-table-column>

        <el-table-column prop="inspector" label="核查人员" width="180">
        </el-table-column>

        <el-table-column
          prop="servicedirector"
          label="服务主体负责人"
          width="180"
        >
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              @click.native="editOnePrdcConfirm(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
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
                :disabled="popForbid"
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
            <el-form-item label="堆沤批次" style="margin-left: 10px">
              <el-input
                v-model="form.rettingbatch"
                autocomplete="off"
                type="text"
                :disabled="popForbid"
              ></el-input>
            </el-form-item>

            <!-- <el-form-item label="堆沤批次" style="margin-left: 10px">
              <el-select
                v-model="form.rettingbatch"
                clearable
                filterable
                placeholder="请选择"
                @change="changeRettingbatchlist"
                :disabled="popForbid"
              >
                <el-option
                  v-for="rettingbatch in myrettingbatchlist"
                  :key="rettingbatch"
                  :label="rettingbatch"
                  :value="rettingbatch"
                >
                </el-option>
              </el-select> </el-form-item> -->
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="日期">
              <el-date-picker
                style="width: 100%"
                v-model="form.productionconfirmdate"
                autocomplete="off"
              ></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="产品名称" style="margin-left: 10px">
              <el-input
                v-model="form.productname"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="体积（m³）">
              <el-input
                v-model="form.volume"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="水分（%）" style="margin-left: 10px">
              <el-input
                v-model="form.moisture"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="容重（kg/m³）">
              <el-input
                v-model="form.volumeweight"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="折算吨数" style="margin-left: 10px">
              <el-input
                v-model="form.convertweight"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="核查人员">
              <el-input
                v-model="form.inspector"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务主体负责人" style="margin-left: 10px">
              <el-input
                v-model="form.servicedirector"
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
      servicesublist: [],
      // rettingbatchlist: [], //堆沤批次列表
      // myrettingbatchlist: [],
      filterservice: [], //
      filterdaterange: "",
      dialogVisible: false, //新增编辑对话框

      popForbid: false, //服务主体列表和堆沤批次列表不可用，用于编辑窗体

      loading: false, //列表加载
      form: {
        servicesub: "", //服务主体
        rettingbatch: "", //堆沤批次
        productionconfirmdate: null,
        productname: "",
        volume: "",
        moisture: "",
        volumeweight: "",
        convertweight: "",
        inspector: "",
        servicedirector: "",
      },
      titleMap: {
        addEquipment: "新增产量确认记录", //根据自己内容定义名字
        editEquipment: "编辑产量确认记录", //根据自己内容定义名字
      },
      //新增和编辑弹框标题
      dialogStatus: "",

      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数
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
          filterRes = this.tableData.filter((array) =>
            array.servicesub.match(this.filterservice[i])
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
              Date.parse(array.productionconfirmdate) >=
                Date.parse(startdate) &&
              Date.parse(array.productionconfirmdate) <= Date.parse(enddate)
          );
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
     * 加载数据表
     */
    async initTable() {
      this.tableData = [];
      this.servicesublist = [];
      this.loading = true;
      try {
        this.servicesublist = await this.queryServiceList();
        var prjRes = await this.getPrdConfirmData();
        for (var i = 0; i < prjRes.length; i++) {
          var rowObj = {
            servicesub: this.getServiceNameByID(prjRes[i].serviceid),
            rettingbatch: prjRes[i].rettingbatch,
            productionconfirmdate: prjRes[i].productionconfirmdate,
            productname: prjRes[i].productname,
            volume: prjRes[i].volume,
            moisture: prjRes[i].moisture,
            volumeweight: prjRes[i].volumeweight,
            convertweight: prjRes[i].convertweight,
            inspector: prjRes[i].inspector,
            servicedirector: prjRes[i].servicedirector,
          };
          this.tableData.push(rowObj);
        }

        // this.tableData = prjRes;
        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
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

    // 获取“产量确认”数据
    getPrdConfirmData() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/selectByServiceid",
            window.sessionStorage.getItem("jurisdiction") == "superadmin"
              ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
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

    // 获取“堆沤批次列表”数据
    // getRettingBatchData() {
    //   return new Promise((resolve, reject) => {
    //     this.$axios
    //       .get(
    //         "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/selectAll?offset=0&limit=50000000"
    //       )
    //       .then((res) => {
    //         resolve(res.data);
    //       })
    //       .catch((err) => {
    //         reject(err);
    //       });
    //   });
    // },

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

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("/addBatchPrdcConfirm");
    },

    /**
     * 切换服务主体列表事件
     */
    changeServiceSublist(serviceid) {
      this.form.servicesub = serviceid;
      // this.form.rettingbatch = "";
      // this.myrettingbatchlist = [];
      // for (var i = 0; i < this.rettingbatchlist.length; i++) {
      //   if (serviceid == this.rettingbatchlist[i].serviceid) {
      //     this.myrettingbatchlist.push(this.rettingbatchlist[i].rettingbatch);
      //   }
      // }
    },
    // /**
    //  * 切换堆沤批次事件
    //  */
    // changeRettingbatchlist(rettingbatch) {
    //   this.form.rettingbatch = rettingbatch;
    // },

    //新增单条服务主体记录
    async addOneServiceSub() {
      //获取堆沤批次列表

      // var rettingbatchRes = await this.getRettingBatchData();
      // for (var i = 0; i < rettingbatchRes.length; i++) {
      //   var rowObj = {
      //     rettingbatch: rettingbatchRes[i].rettingbatch, //id号
      //     serviceid: rettingbatchRes[i].serviceid, //id号
      //   };
      //   this.rettingbatchlist.push(rowObj);
      // }

      this.form.servicesub = ""; //服务主体
      this.form.rettingbatch = ""; //堆沤批次
      this.form.productionconfirmdate = new Date(); //时间
      this.form.productname = ""; //产品名称
      this.form.volume = 0; //体积
      this.form.moisture = 0; //水分
      this.form.volumeweight = 0; //容重
      this.form.convertweight = 0; //折算吨数
      this.form.inspector = ""; //核查人员
      this.form.servicedirector = ""; //服务主体负责人

      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;

      this.popForbid = false;
    },

    //编辑单条服务主体记录
    async editOnePrdcConfirm(row) {
      // var rettingbatchRes = await this.getRettingBatchData();
      // for (var i = 0; i < rettingbatchRes.length; i++) {
      //   var rowObj = {
      //     rettingbatch: rettingbatchRes[i].rettingbatch, //id号
      //     serviceid: rettingbatchRes[i].serviceid, //id号
      //   };
      //   this.rettingbatchlist.push(rowObj);
      // }

      this.form.servicesub = this.getServiceIDByName(row.servicesub); //服务主体
      this.form.rettingbatch = row.rettingbatch; //堆沤批次
      this.form.productionconfirmdate = new Date(row.productionconfirmdate); //时间
      this.form.productname = row.productname;
      this.form.volume = row.volume;
      this.form.moisture = row.moisture;
      this.form.volumeweight = row.volumeweight;
      this.form.convertweight = row.convertweight;

      this.form.inspector = row.inspector;
      this.form.servicedirector = row.servicedirector;

      this.dialogStatus = "editEquipment";
      this.dialogVisible = true;
      this.popForbid = true;
    },

    // 提交表单
    formCommit() {
      let that = this;

      if (that.dialogStatus == "addEquipment") {
        var startyear = that.form.productionconfirmdate.getFullYear();
        var startmonth = that.form.productionconfirmdate.getMonth() + 1;
        var startday = that.form.productionconfirmdate.getDate();

        //新增
        var postData = that.$qs.stringify({
          serviceid: that.form.servicesub, //服务主体
          rettingbatch: that.form.rettingbatch, //堆沤批次
          productionconfirmdate: startyear + "/" + startmonth + "/" + startday,
          productname: that.form.productname,
          volume: that.form.volume,
          moisture: that.form.moisture,
          volumeweight: that.form.volumeweight,
          convertweight: that.form.convertweight,
          inspector: that.form.inspector,
          servicedirector: that.form.servicedirector,
        });

        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/insert",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增一条产量确认记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("新增产量确认记录出错！请认真核对表单信息");
            console.log(err);
          });
      } else if (that.dialogStatus == "editEquipment") {
        var startyear = that.form.productionconfirmdate.getFullYear();
        var startmonth = that.form.productionconfirmdate.getMonth() + 1;
        var startday = that.form.productionconfirmdate.getDate();

        //新增
        var postData = that.$qs.stringify({
          serviceid: that.form.servicesub, //服务主体
          rettingbatch: that.form.rettingbatch, //堆沤批次
          productionconfirmdate: startyear + "/" + startmonth + "/" + startday,
          productname: that.form.productname,
          volume: that.form.volume,
          moisture: that.form.moisture,
          volumeweight: that.form.volumeweight,
          convertweight: that.form.convertweight,
          inspector: that.form.inspector,
          servicedirector: that.form.servicedirector,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/update",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功修改产量确认记录台账！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新页面
          })
          .catch((err) => {
            that.$message.error("修改产量确认记录台账出错！请认真核对表单信息");
          });
      }
    },

    // 删除单条记录记录
    deleteOnePrdcConfirm(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = {
            rettingbatch: row.rettingbatch,
            serviceid: that.getServiceIDByName(row.servicesub),
          };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/deleteById",
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
          "服务主体名称",
          "堆沤批次",
          "日期",
          "产品名称",
          "体积（m³）",
          "水分（％）",
          "容重（kg/m³）",
          "折算吨数",
          "核查人员",
          "服务主体负责人",
        ];
        var filterVal = [
          "servicesub",
          "rettingbatch",
          "productionconfirmdate",
          "productname",
          "volume",
          "moisture",
          "volumeweight",
          "convertweight",
          "inspector",
          "servicedirector",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "产量确认表"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /** 统计报表*/
    report() {
      var that = this;
      that.$router.replace("/Report_proconfirm_main");
    },

    /**
     * 保留1位小数
     */
    fun(val) {
      return Number(val).toFixed(1);
    },

    /**
     * 根据1、0返回是否
     */
    boolByString(val) {
      var boostr = "否";
      if (val == "1") boostr = "是";
      else if (val == "0") boostr = "否";
      return boostr;
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
  height: 48vh;

  overflow: auto;
}
</style>