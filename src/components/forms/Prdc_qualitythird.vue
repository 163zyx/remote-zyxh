<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他数据</el-breadcrumb-item>
      <el-breadcrumb-item>第三方检测</el-breadcrumb-item>
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
        <el-table-column prop="servicename" label="企业名称" width="200px">
        </el-table-column>
        <el-table-column prop="insporg" label="检测机构" width="250px">
        </el-table-column>
        <el-table-column prop="clientorg" label="委托单位" width="200px">
        </el-table-column>
        <el-table-column prop="samplesubnum" label="送样编号" width="150px">
        </el-table-column>
        <el-table-column
          prop="sampledate"
          label="送检日期"
          :formatter="formatDate"
          width="120px"
        >
        </el-table-column>
        <el-table-column prop="tn" label="总氮（%）" width="100px">
        </el-table-column>
        <el-table-column prop="tp" label="总磷（%）" width="100px">
        </el-table-column>
        <el-table-column prop="tk" label="总钾（%）" width="100px">
        </el-table-column>
        <el-table-column prop="tnutrient" label="总养分" width="100px">
        </el-table-column>
        <el-table-column prop="water" label="水分（%）" width="100px">
        </el-table-column>
        <el-table-column prop="gi" label="种子发芽指数(GI，%)" width="200px">
        </el-table-column>
        <el-table-column prop="organic" label="有机质（烘干，%）" width="150px">
        </el-table-column>
        <el-table-column prop="ph" label="酸碱度" width="100px">
        </el-table-column>
        <el-table-column prop="drle" label="蛔虫卵死亡率（%）" width="150px">
        </el-table-column>
        <el-table-column prop="fcc" label="粪大肠菌群数（个/g）" width="200px">
        </el-table-column>
        <el-table-column prop="ta" label="总砷（mg/kg,干基）" width="200px">
        </el-table-column>
        <el-table-column prop="tc" label="总镉（mg/kg,干基）" width="200px">
        </el-table-column>
        <el-table-column prop="tl" label="总铅（mg/kg,干基）" width="200px">
        </el-table-column>
        <el-table-column prop="tch" label="总铬（mg/kg,干基）" width="200px">
        </el-table-column>
        <el-table-column prop="tm" label="总汞（mg/kg,干基）" width="200px">
        </el-table-column>
        <el-table-column prop="note" label="备注" width="100px">
        </el-table-column>
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
      <el-form label-position="top" :model="form" :rules="rules" ref="form">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row>
          <el-col :span="7">
            <el-form-item label="企业名称" prop="servicename" required>
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
          <el-col :span="7">
            <el-form-item
              label="检测机构"
              style="margin-left: 10px"
              prop="insporg"
              required
            >
              <el-input
                v-model="form.insporg"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item
              label="委托单位"
              style="margin-left: 10px"
              prop="clientorg"
              required
            >
              <el-input
                v-model="form.clientorg"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="7">
            <el-form-item label="送样编号" prop="samplesubnum" required>
              <el-input
                v-model="form.samplesubnum"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item
              label="送检日期"
              style="margin-left: 10px"
              prop="sampledate"
            >
              <el-date-picker
                style="width: 100%"
                v-model="form.sampledate"
                autocomplete="off"
              ></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="备注" style="margin-left: 10px" prop="note">
              <el-input
                v-model="form.note"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">检测数据</el-divider>
        <el-row>
          <el-col :span="4">
            <el-form-item label="总氮（%）" style="margin-left: 10px" prop="tn">
              <el-input
                v-model="form.tn"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label="总磷（%）" style="margin-left: 10px" prop="tp">
              <el-input
                v-model="form.tp"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="总钾（%）" style="margin-left: 10px" prop="tk">
              <el-input
                v-model="form.tk"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item
              label="总养分"
              style="margin-left: 10px"
              prop="tnutrient"
            >
              <el-input
                v-model="form.tnutrient"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item
              label="水分（%）"
              style="margin-left: 10px"
              prop="water"
            >
              <el-input
                v-model="form.water"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item
              label="种子发芽指数(GI，%)"
              style="margin-left: 10px"
              prop="gi"
            >
              <el-input
                v-model="form.gi"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item
              label="有机质（烘干，%）"
              style="margin-left: 10px"
              prop="organic"
            >
              <el-input
                v-model="form.organic"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label="酸碱度" style="margin-left: 10px" prop="ph">
              <el-input
                v-model="form.ph"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item
              label="蛔虫卵死亡率（%）"
              style="margin-left: 10px"
              prop="drle"
            >
              <el-input
                v-model="form.drle"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item
              label="粪大肠菌群数（个/g）"
              style="margin-left: 10px"
              prop="fcc"
            >
              <el-input
                v-model="form.fcc"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item
              label="总砷（mg/kg,干基）"
              style="margin-left: 10px"
              prop="ta"
            >
              <el-input
                v-model="form.ta"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item
              label="总镉（mg/kg,干基）"
              style="margin-left: 10px"
              prop="tc"
            >
              <el-input
                v-model="form.tc"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item
              label="总铅（mg/kg,干基）"
              style="margin-left: 10px"
              prop="tl"
            >
              <el-input
                v-model="form.tl"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item
              label="总铬（mg/kg,干基）"
              style="margin-left: 10px"
              prop="tch"
            >
              <el-input
                v-model="form.tch"
                type="text"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item
              label="总汞（mg/kg,干基）"
              style="margin-left: 10px"
              prop="tm"
            >
              <el-input
                v-model="form.tm"
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
import { TLSSocket } from "tls";
import { tmpdir } from "os";

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
        servicename: "",
        insporg: "",
        clientorg: "",
        samplesubnum: "",
        sampledate: "",
        tn: "",
        tp: "",
        tk: "",
        tnutrient: "",
        water: "",
        gi: "",
        organic: "",
        ph: "",
        drle: "",
        fcc: "",
        ta: "",
        tc: "",
        tl: "",
        tch: "",
        tm: "",

        note: "", //备注
      },

      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数

      titleMap: {
        addSensor: "新增第三方检测记录", //根据自己内容定义名字
        eidtSensor: "编辑第三方检测记录", //根据自己内容定义名字
      },

      //新增和编辑弹框标题
      dialogStatus: "",

      rules: {
        //表单验证验证规则
        servicename: [
          { required: true, message: "请选择一个企业", trigger: "change" },
        ],

        rettingbatch: [
          { required: true, message: "请输入生产编号", trigger: "blur" },
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
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualitythird/selectByServiceid",
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

            this.$message.error("第三方检测数据获取失败");
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
            servicename: this.getServiceNameByID(this.tableData[i].serviceid),
            insporg: this.tableData[i].insporg,
            clientorg: this.tableData[i].clientorg,
            samplesubnum: this.tableData[i].samplesubnum,
            sampledate: this.tableData[i].sampledate,
            tn: this.tableData[i].tn,
            tp: this.tableData[i].tp,
            tk: this.tableData[i].tk,
            tnutrient: this.tableData[i].tnutrient,
            water: this.tableData[i].water,
            gi: this.tableData[i].gi,
            organic: this.tableData[i].organic,
            ph: this.tableData[i].ph,
            drle: this.tableData[i].drle,
            fcc: this.tableData[i].fcc,
            ta: this.tableData[i].ta,
            tc: this.tableData[i].tc,
            tl: this.tableData[i].tl,
            tch: this.tableData[i].tch,
            tm: this.tableData[i].tm,
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
      this.form.insporg = "";
      this.form.clientorg = "";
      this.form.samplesubnum = "";
      this.form.sampledate = new Date(); //时间;
      this.form.tn = "";
      this.form.tp = "";
      this.form.tk = "";
      this.form.tnutrient = "";
      this.form.water = "";
      this.form.gi = "";
      this.form.organic = "";
      this.form.ph = "";
      this.form.drle = "";
      this.form.fcc = "";
      this.form.ta = "";
      this.form.tc = "";
      this.form.tl = "";
      this.form.tm = "";
      this.form.tch = "";
      this.form.note = "";

      this.dialogStatus = "addSensor";
      this.dialogVisible = true;
    },

    //编辑传感器参数
    editProQuality(row) {
      this.form.servicename = row.servicename;
      this.form.insporg = row.insporg;
      this.form.clientorg = row.clientorg;
      this.form.samplesubnum = row.samplesubnum;
      this.form.sampledate = new Date(row.sampledate);
      this.form.tn = row.tn;
      this.form.tp = row.tp;
      this.form.tk = row.tk;
      this.form.tnutrient = row.tnutrient;
      this.form.water = row.water;
      this.form.gi = row.gi;
      this.form.organic = row.organic;
      this.form.ph = row.ph;
      this.form.drle = row.drle;
      this.form.fcc = row.fcc;
      this.form.ta = row.ta;
      this.form.tc = row.tc;
      this.form.tl = row.tl;
      this.form.tch = row.tch;
      this.form.tm = row.tm;
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
            var startyear = that.form.sampledate.getFullYear();
            var startmonth = that.form.sampledate.getMonth() + 1;
            var startday = that.form.sampledate.getDate();
            var postData = that.$qs.stringify({
              serviceid: that.getServiceIDByName(that.form.servicename),
              insporg: that.form.insporg,
              clientorg: that.form.clientorg,
              samplesubnum: that.form.samplesubnum,
              sampledate: startyear + "/" + startmonth + "/" + startday,
              tn: that.form.tn,
              tp: that.form.tp,
              tk: that.form.tk,
              tnutrient: that.form.tnutrient,
              water: that.form.water,
              gi: that.form.gi,
              organic: that.form.organic,
              ph: that.form.ph,
              drle: that.form.drle,
              fcc: that.form.fcc,
              ta: that.form.ta,
              tc: that.form.tc,
              tl: that.form.tl,
              tch: that.form.tch,
              tm: that.form.tm,
              note: that.form.note,
            });
            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualitythird/insert",
                postData
              )
              .then((res) => {
                that.$message({
                  message: "成功新增一条产品第三方检测记录！",
                  type: "success",
                });
                that.dialogVisible = false;

                that.reload(); //刷新页面
              })
              .catch((err) => {
                that.$message.error(
                  "新增产品第三方检测记录出错！请认真核对表单信息"
                );
                console.log(err);
              });
          } else if (this.dialogStatus == "eidtSensor") {
            var startyear = that.form.sampledate.getFullYear();
            var startmonth = that.form.sampledate.getMonth() + 1;
            var startday = that.form.sampledate.getDate();

            var postData = that.$qs.stringify({
              serviceid: that.getServiceIDByName(that.form.servicename),
              insporg: that.form.insporg,
              clientorg: that.form.clientorg,
              samplesubnum: that.form.samplesubnum,
              sampledate: startyear + "/" + startmonth + "/" + startday,
              tn: that.form.tn,
              tp: that.form.tp,
              tk: that.form.tk,
              tnutrient: that.form.tnutrient,
              water: that.form.water,
              gi: that.form.gi,
              organic: that.form.organic,
              ph: that.form.ph,
              drle: that.form.drle,
              fcc: that.form.fcc,
              ta: that.form.ta,
              tc: that.form.tc,
              tl: that.form.tl,
              tch: that.form.tch,
              tm: that.form.tm,
              note: that.form.note,
            });
            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualitythird/update",
                postData
              )
              .then((res) => {
                that.$message({
                  message: "成功修改产品第三方检测记录！",
                  type: "success",
                });
                that.dialogVisible = false;

                that.reload(); //刷新页面
              })
              .catch((err) => {
                that.$message.error(
                  "修改产品第三方检测记录出错！请认真核对表单信息"
                );
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
            id: row.samplesubnum,
          };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProqualitythird/deleteById",
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
          "检测机构",
          "委托单位",
          "送样编号",
          "送检日期",
          "总氮",
          "总磷",
          "总钾",
          "总养分",
          "水分",
          "种子发芽指数",
          "有机质",
          "酸碱度",
          "蛔虫卵死亡率",
          "粪大肠菌群数",
          "总砷",
          "总镉",
          "总铅",
          "总铬",
          "总汞",
          "备注",
        ];
        var filterVal = [
          "servicename",
          "insporg",
          "clientorg",
          "samplesubnum",
          "sampledate",
          "tn",
          "tp",
          "tk",
          "tnutrient",
          "water",
          "gi",
          "organic",
          "ph",
          "drle",
          "fcc",
          "ta",
          "tc",
          "tl",
          "tch",
          "tm",
          "note",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "产品第三方检测表"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("../addBatchPrdcqualitythird");
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
  width: 80%;
}

.el-dialog-div {
  overflow: auto;
}
</style>