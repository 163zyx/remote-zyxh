<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>销售台账</el-breadcrumb-item>
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
            @click="addOneSaleLedger()"
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

        <el-col :span="1.5">
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
          fixed
          prop="saleledgerindex"
          label="账单ID"
          width="80"
          v-if="false"
        >
        </el-table-column>
        <el-table-column prop="servicesubject" label="服务主体名称" width="150">
        </el-table-column>
        <el-table-column
          prop="saledate"
          label="日期"
          width="120"
          :formatter="formatDate"
        >
        </el-table-column>

        <el-table-column prop="ordernumber" label="批次单号" width="150">
          <!-- <template slot-scope="scope">
            <el-popover placement="right" width="40vw" trigger="click">
              <el-link slot="reference">{{ scope.row.ordernumber }}</el-link>
            </el-popover>
          </template> -->
        </el-table-column>

        <el-table-column prop="townvillage" label="镇村" width="150">
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100">
        </el-table-column>
        <el-table-column prop="contactinfo" label="联系方式" width="120">
        </el-table-column>
        <el-table-column prop="crop" label="作物" width="100">
        </el-table-column>

        <el-table-column prop="area" label="面积" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.area) }}
          </template>
        </el-table-column>

        <el-table-column
          label="地块位置"
          width="120"
          prop="landlocation"
          show-overflow-tooltip
        >
        </el-table-column>

        <el-table-column
          prop="subsidyunitprice"
          label="补贴单价（元/吨）"
          width="100"
        >
          <template slot-scope="scope">
            {{ fun(scope.row.subsidyunitprice) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="selffinanceunitprice"
          label="到户单价（元/吨）"
          width="100"
        >
          <template slot-scope="scope">
            {{ fun(scope.row.selffinanceunitprice) }}
          </template>
        </el-table-column>

        <el-table-column prop="materialname" label="物料名称" width="100">
        </el-table-column>

        <el-table-column prop="specifications" label="规格型号" width="100">
        </el-table-column>

        <el-table-column prop="amount" label="数量（吨）" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.amount) }}
          </template>
        </el-table-column>

        <el-table-column prop="subsidy" label="补贴（元）" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.subsidy) }}
          </template>
        </el-table-column>

        <el-table-column prop="selffinance" label="到户价（元）" width="120">
          <template scope="scope">{{ fun(scope.row.selffinance) }} </template>
        </el-table-column>

        <el-table-column prop="deliverytruck" label="送货人及车辆" width="120">
        </el-table-column>

        <el-table-column prop="" fixed="right" label="级联表" width="150">
          <template slot-scope="scope">
            <el-link slot="reference" @click="scanReceipt(scope.row)"
              >收货单</el-link
            >
            <el-link
              slot="reference"
              style="margin-left: 20px"
              @click="scanSupdetail(scope.row)"
              >供应明细</el-link
            >
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneSaleLedger(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="deleteOneSaleLedger(scope.row)"
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

    <!-- 收货单对话框 -->
    <el-dialog
      v-dialogDrag
      :visible.sync="receiptDialogVisible"
      :close-on-click-modal="false"
      width="40vw"
      center
    >
      <el-descriptions direction="vertical" :column="4" border center>
        <el-descriptions-item label="单号">{{
          receiptDec.ordernumber
        }}</el-descriptions-item>
        <el-descriptions-item label="农户">{{
          receiptDec.name
        }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{
          receiptDec.townvillage
        }}</el-descriptions-item>
        <el-descriptions-item label="物料名称" :span="2">{{
          receiptDec.materialname
        }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{
          receiptDec.specifications
        }}</el-descriptions-item>

        <el-descriptions-item label="数量（吨）">{{
          receiptDec.amount
        }}</el-descriptions-item>

        <el-descriptions-item label="实施面积（亩）">{{
          receiptDec.area
        }}</el-descriptions-item>

        <el-descriptions-item label="备注">{{
          receiptDec.landlocation
        }}</el-descriptions-item>

        <el-descriptions-item label="农户签字（盖章）">{{
          receiptDec.name
        }}</el-descriptions-item>

        <el-descriptions-item label="村委确认（盖章）"></el-descriptions-item>
        <el-descriptions-item label="送货人及车辆">{{
          receiptDec.deliverytruck
        }}</el-descriptions-item>

        <el-descriptions-item label="收货日期">{{
          receiptDec.saledate
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 供应明细对话框 -->
    <el-dialog
      v-dialogDrag
      :visible.sync="supDetailDialogVisible"
      :close-on-click-modal="false"
      width="50vw"
      center
    >
      <el-table
        :data="supDetailTable"
        v-loading="loading"
        cell-style="font-weight: 350;"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
      >
        <el-table-column prop="ordernumber" width="120" label="单号">
        </el-table-column>
        <el-table-column prop="town" width="100" label="乡镇">
        </el-table-column>
        <el-table-column prop="village" width="100" label="村">
        </el-table-column>
        <el-table-column prop="name" width="100" label="姓名">
        </el-table-column>
        <el-table-column prop="contactinfo" width="120" label="联系方式">
        </el-table-column>
        <el-table-column prop="crop" width="100" label="作物">
        </el-table-column>
        <el-table-column prop="area" width="120" label="施用面积（亩）">
        </el-table-column>
        <el-table-column prop="amount" width="120" label="施用量（吨）">
        </el-table-column>
        <el-table-column
          prop="landlocation"
          width="200"
          show-overflow-tooltip
          label="地块位置"
        >
        </el-table-column>
      </el-table>
    </el-dialog>

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
          <el-col :span="8">
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
          <el-col :span="8">
            <el-form-item label="日期" style="margin-left: 10px">
              <el-date-picker
                v-model="form.saledate"
                autocomplete="off"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col span="8">
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
          <el-col :span="8">
            <el-form-item label="镇村">
              <el-input
                v-model="form.townvillage"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="姓名" style="margin-left: 10px">
              <el-input v-model="form.name" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系方式" style="margin-left: 10px">
              <el-input
                v-model="form.contactinfo"
                autocomplete="off"
                type="text"
                maxlength="11"
                minlength="11"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="作物">
              <el-input
                v-model="form.crop"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="面积" style="margin-left: 10px">
              <el-input
                v-model="form.area"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="地块位置" style="margin-left: 10px">
              <el-input
                v-model="form.landlocation"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="补贴单价（元/吨）">
              <el-input
                v-model="form.subsidyunitprice"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="到户单价（元/吨）" style="margin-left: 10px">
              <el-input
                v-model="form.selffinanceunitprice"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料名称" style="margin-left: 10px">
              <el-input
                v-model="form.materialname"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="规格型号">
              <el-input
                v-model="form.specifications"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量（吨）" style="margin-left: 10px">
              <el-input
                v-model="form.amount"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="补贴（元）" style="margin-left: 10px">
              <el-input
                v-model="form.subsidy"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="到户价（元）">
              <el-input
                v-model="form.selffinance"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="送货人及车辆" style="margin-left: 10px">
              <el-input
                v-model="form.deliverytruck"
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

      successCount: 0,
      totalCount: 0,

      servicesublist: [],

      SaleLedgerRes: [],
      ServiceListRes: [], //服务主体列表
      currentServiceSubName: "", //当前选中的服务主体名称
      filterservice: [], //
      filterdaterange: "",
      dialogVisible: false, //新增编辑对话框
      receiptDialogVisible: false, //供货单对话框
      supDetailDialogVisible: false, //供应明细对话框
      batchImpDlVisible: false, //批量导入对话框
      selectSaleID: 0, //选中的记录ID，用于删除编辑等
      loading: false, //列表加载

      receiptDec: {
        ordernumber: "",
        name: "",
        townvillage: "",
        materialname: "",
        specifications: "",
        amount: 0.0,
        area: 0.0,
        landlocation: "",
        deliverytruck: "",
        saledate: null,
      },

      supDetailTable: [],

      form: {
        saleledgerindex: 0,
        servicesubject: "",
        saledate:
          new Date().getFullYear() +
          "-" +
          new Date().getMonth() +
          "-" +
          new Date().getDay(),
        ordernumber: 0, //批次单号
        materialname: "", //物料名称
        specifications: "", //规格型号

        townvillage: "",
        name: "",
        contactinfo: 0,
        crop: "",
        area: 0.0,
        landlocation: "",
        subsidyunitprice: 0.0, //补贴单价
        selffinanceunitprice: 0.0, //到户单价
        amount: 0.0, //数量
        subsidy: 0.0, //补贴
        selffinance: 0.0, //到户价
        deliverytruck: "", //送货人及车辆
      },
      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 10, // 每页的数据条数
      titleMap: {
        addEquipment: "新增销售记录", //根据自己内容定义名字
        editEquipment: "编辑销售记录", //根据自己内容定义名字
      },
      titleBatchImp: "批量导入销售台账",
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
              Date.parse(array.saledate) >= Date.parse(startdate) &&
              Date.parse(array.saledate) <= Date.parse(enddate)
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
     * 构建where查询条件（用户超管用户）
     */
    createWherein() {
      let serviceIdWherein = new Array();
      for (var i = 0; i < 100; i++) serviceIdWherein.push(i);
      return serviceIdWherein;
    },
    //拿到方法1与方法2的两个结果后，执行init方法
    async initTable() {
      this.tableData = [];
      this.servicesublist = [];

      this.loading = true;
      try {
        this.SaleLedgerRes = await this.querySaleLedger();
        this.ServiceListRes = await this.queryServiceList();
        //servicesublist填充数据
        for (var j = 0; j < this.ServiceListRes.length; j++) {
          this.servicesublist.push({
            serviceid: this.ServiceListRes[j].serviceid,
            servicename: this.ServiceListRes[j].servicename,
          });
        }

        for (var i = 0; i < this.SaleLedgerRes.length; i++) {
          var rowObj = {
            saleledgerindex: this.SaleLedgerRes[i].saleledgerindex,
            servicesubject: this.getServiceNameByID(
              this.SaleLedgerRes[i].servicesubject
            ),
            saledate: this.SaleLedgerRes[i].saledate,
            townvillage: this.SaleLedgerRes[i].townvillage,
            name: this.SaleLedgerRes[i].name,
            contactinfo: this.SaleLedgerRes[i].contactinfo,
            crop: this.SaleLedgerRes[i].crop,
            area: this.SaleLedgerRes[i].area,
            landlocation: this.SaleLedgerRes[i].landlocation,
            subsidyunitprice: this.SaleLedgerRes[i].subsidyunitprice, //补贴单价
            selffinanceunitprice: this.SaleLedgerRes[i].selffinanceunitprice, //到户单价
            materialname: this.SaleLedgerRes[i].materialname, //物料名称
            specifications: this.SaleLedgerRes[i].specifications, //规格型号

            amount: this.SaleLedgerRes[i].amount, //数量
            subsidy: this.SaleLedgerRes[i].subsidy, //补贴
            selffinance: this.SaleLedgerRes[i].selffinance, //到户价
            ordernumber: this.SaleLedgerRes[i].ordernumber, //批次单号
            deliverytruck: this.SaleLedgerRes[i].deliverytruck, //送货人及车辆
          };
          this.tableData.push(rowObj);
        }

        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
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
     * 获取销售表单
     */
    querySaleLedger() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/selectByServiceid",
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
     * 获取服务主体列表
     */
    queryServiceList() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
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

    /**刷新列表 */
    refreshTable() {
      this.loading = true;
      this.reload();
      this.loading = false;
    },

    /**
     * 新增单条销售记录
     */
    addOneSaleLedger() {
      this.form.saleledgerindex = null;
      this.form.servicesubject = "";
      this.form.saledate = new Date().toLocaleDateString().replace(/\//g, "/");
      this.form.ordernumber = "";
      this.form.townvillage = "";
      this.form.name = "";
      this.form.contactinfo = null;
      this.form.crop = "";
      this.form.area = null;
      this.form.landlocation = "";
      this.form.subsidyunitprice = null;
      this.form.selffinanceunitprice = null;
      this.form.amount = null;
      this.form.subsidy = null;
      this.form.selffinance = null;

      this.form.materialname = "";
      this.form.specifications = "";
      this.form.deliverytruck = "";

      this.currentServiceSubName = ""; //服务列表置空
      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;
    },

    /**
     * 编辑单条销售记录
     */
    editOneSaleLedger(row) {
      this.form.servicesubject = row.servicesubject;
      this.form.saledate = row.saledate.replaceAll("-", "/");
      this.form.townvillage = row.townvillage;
      this.form.name = row.name;
      this.form.contactinfo = row.contactinfo;
      this.form.crop = row.crop;
      this.form.area = row.area;
      this.form.landlocation = row.landlocation;
      this.form.subsidyunitprice = row.subsidyunitprice;
      this.form.selffinanceunitprice = row.selffinanceunitprice;
      this.form.amount = row.amount;
      this.form.subsidy = row.subsidy;
      this.form.selffinance = row.selffinance;
      this.form.ordernumber = row.ordernumber;
      this.selectSaleID = row.saleledgerindex;

      this.form.materialname = row.materialname;
      this.form.specifications = row.specifications;
      this.form.deliverytruck = row.deliverytruck;

      this.currentServiceSubName = row.servicesubject;

      this.dialogStatus = "editEquipment";
      this.dialogVisible = true;
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("/addBatchSaleRecord");
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
      that.$router.replace("/report_sales_main");
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
          servicesubject: that.form.servicesubject,
          saledate: that.form.saledate,
          townvillage: that.form.townvillage,
          name: that.form.name,
          contactinfo: that.form.contactinfo,
          crop: that.form.crop,
          area: that.form.area,
          landlocation: that.form.landlocation,
          subsidyunitprice: that.form.subsidyunitprice,
          selffinanceunitprice: that.form.selffinanceunitprice,
          amount: that.form.amount,
          subsidy: that.form.subsidy,
          selffinance: that.form.selffinance,
          ordernumber: that.form.ordernumber,
          materialname: that.form.materialname,
          specifications: that.form.specifications,
          deliverytruck: that.form.deliverytruck,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/insertSaleledger",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增一条销售记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("新增销售记录出错！请认真核对表单信息");
            console.log(err);
          });
      } else if (that.dialogStatus == "editEquipment") {
        //编辑

        var postData = that.$qs.stringify({
          saleledgerindex: that.selectSaleID,
          servicesubject: function () {
            //根据名称获取服务主体id
            var ssb = that.form.servicesubject;
            for (ss of that.servicesublist) {
              if (ss.servicename == that.form.servicesubject)
                ssb = ss.serviceId;
            }
            return ssb;
          },
          saledate: that.form.saledate,
          townvillage: that.form.townvillage,
          name: that.form.name,
          contactinfo: that.form.contactinfo,
          crop: that.form.crop,
          area: that.form.area,
          landlocation: that.form.landlocation,
          subsidyunitprice: that.form.subsidyunitprice,
          selffinanceunitprice: that.form.selffinanceunitprice,
          amount: that.form.amount,
          subsidy: that.form.subsidy,
          selffinance: that.form.selffinance,
          ordernumber: that.form.ordernumber,
          materialname: that.form.materialname,
          specifications: that.form.specifications,
          deliverytruck: that.form.deliverytruck,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/updateSaleledger",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功修改销售记录！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("修改销售记录出错！请认真核对表单信息");
          });
      }
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
     * 查看关联的产量确认表
     */
    scanSupdetail(row) {
      let that = this;

      var serviceId = this.getServiceIdByName(row.servicesubject);
      var url =
        "http://119.3.221.188:8808/tfDbOperator-2.0/tfSupdetail/selectByON?ordernumber=" +
        row.ordernumber +
        "&servicesubject=" +
        serviceId;
      that.$axios
        .get(url)
        .then((res) => {
          that.supDetailDialogVisible = true;
          that.supDetailTable = res.data;
        })
        .catch((err) => {});
    },

    scanReceipt(row) {
      this.receiptDialogVisible = true;
      this.receiptDec.ordernumber = row.ordernumber;
      this.receiptDec.name = row.name;
      this.receiptDec.townvillage = row.townvillage;
      this.receiptDec.materialname = row.materialname;
      this.receiptDec.specifications = row.specifications;
      this.receiptDec.amount = row.amount;
      this.receiptDec.area = row.area;
      this.receiptDec.landlocation = row.landlocation;
      this.receiptDec.deliverytruck = row.deliverytruck;
      this.receiptDec.saledate = row.saledate;
    },

    /**
     * 删除单条销售记录
     */
    deleteOneSaleLedger(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = { slid: row.saleledgerindex };
          this.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/deleteSaleledgerBy",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                var spliceID;
                for (var i = 0; i < that.tableData.length; i++) {
                  if (
                    row.saleledgerindex == that.tableData[i].saleledgerindex
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
          "服务主体名称",
          "日期",
          "批次单号",
          "镇村",
          "姓名",
          "联系方式",
          "作物",
          "面积",
          "地块位置",
          "补贴单价（元/吨）",
          "到户价（元/吨）",
          "物料名称",
          "规格型号",
          "数量（吨）",
          "补贴（元）",
          "到户价（元）",
          "送货人及车辆",
        ];
        var filterVal = [
          "servicesubject",
          "saledate",
          "ordernumber",
          "townvillage",
          "name",
          "contactinfo",
          "crop",
          "area",
          "landlocation",
          "subsidyunitprice",
          "selffinanceunitprice",
          "materialname",
          "specifications",
          "amount",
          "subsidy",
          "selffinance",
          "deliverytruck",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "销售台账"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
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
  height: 65vh;
  overflow: auto;
}

/deep/.el-table .warning-row {
  background: #ffe4b5;
}

/deep/.el-table .success-row {
  background: #90ee90;
}
/deep/.el-table .faild-row {
  background: #f08080;
}
</style>
