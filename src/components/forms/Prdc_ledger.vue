<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>生产记录台账</el-breadcrumb-item>
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
          <el-select v-model="value" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
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
          prop="prdledgindex"
          label="生产记录id"
          width="200"
          v-if="false"
        >
        </el-table-column>

        <el-table-column prop="servicesub" label="服务主体名称" width="180">
        </el-table-column>
        <el-table-column prop="rettingbatch" label="堆沤批次" width="150">
        </el-table-column>
        <el-table-column
          prop="rettingstartdate"
          label="堆沤开始日期"
          width="150"
          :formatter="formatDate"
        >
        </el-table-column>

        <el-table-column
          prop="rettingenddate"
          label="堆沤结束日期"
          :formatter="formatDate"
          width="150"
        >
        </el-table-column>
        <el-table-column prop="rettingplace" label="堆沤场所" width="150">
        </el-table-column>
        <el-table-column
          prop="materialweight"
          label="原材料、辅料（吨）"
          width="150"
        >
          <template slot-scope="scope">
            {{ fun(scope.row.materialweight) }}
          </template>
        </el-table-column>

        <el-table-column prop="outputweight" label="产量（吨）" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.outputweight) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="productionprincipal"
          label="生产负责人"
          width="120"
        >
        </el-table-column>
        <el-table-column prop="contactinfo" label="联系电话" width="120">
        </el-table-column>
        <el-table-column prop="contactinfo" label="状态" width="120">
        </el-table-column>

        <el-table-column prop="" fixed="right" label="级联表" width="160">
          <template slot-scope="scope">
            <el-link slot="reference" @click="scanPrdcrecord(scope.row)">
              生产记录
            </el-link>
            <el-link
              slot="reference"
              style="margin-left: 20px"
              @click="scanPrdcconfirm(scope.row)"
            >
              产量确认
            </el-link>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              @click.native="editOneServiceSub(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="deleteOneProLedger(scope.row)"
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
    
      :close-on-click-modal="false"
      :visible.sync="prcRecordDialogVisible"
      width="70vw"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      center
    >
      <el-descriptions
        direction="vertical"
        :column="9"
        size="small"
        border
        center
        style="margin-top: 5px"
        v-for="(item, i) in prdcrecordDes1"
        :key="i"
      >
        <el-descriptions-item label="日期" :formatter="formatDate">{{
          item.prcsdate.split("T")[0]
        }}</el-descriptions-item>
        <el-descriptions-item label="上午温度">{{
          item.prcstemperatuream
        }}</el-descriptions-item>
        <el-descriptions-item label="下午温度">{{
          item.prcstemperaturepm
        }}</el-descriptions-item>
        <el-descriptions-item label="是否翻抛">{{
          item.prcsisstir
        }}</el-descriptions-item>
        <el-descriptions-item label="气味">{{
          item.prcssmell
        }}</el-descriptions-item>

        <el-descriptions-item label="是否取样">{{
          item.prcsissampling
        }}</el-descriptions-item>

        <el-descriptions-item label="水分">{{
          item.prcsmoisture
        }}</el-descriptions-item>

        <el-descriptions-item label="原料1名称">{{
          item.materials1name
        }}</el-descriptions-item>

        <el-descriptions-item label="原料1用量">{{
          item.materials1amount
        }}</el-descriptions-item>

        <el-descriptions-item label="原料1相关证明序号">
          {{ item.materials1sn }}
        </el-descriptions-item>
        <el-descriptions-item label="原料2名称">{{
          item.materials2name
        }}</el-descriptions-item>

        <el-descriptions-item label="原料2用量">{{
          item.materials2amount
        }}</el-descriptions-item>

        <el-descriptions-item label="原料2相关证明序号">{{
          item.materials2sn
        }}</el-descriptions-item>

        <el-descriptions-item label="原料3名称">{{
          item.materials3name
        }}</el-descriptions-item>

        <el-descriptions-item label="原料3用量">{{
          item.materials3amount
        }}</el-descriptions-item>

        <el-descriptions-item label="原料3相关证明序号">{{
          item.materials3sn
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑和新增对话框 -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      :visible.sync="prcConfirmDialogVisible"
      width="40vw"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      center
    >
      <el-descriptions
        direction="vertical"
        :column="4"
        size="small"
        border
        center
      >
        <el-descriptions-item label="日期">{{
          prdcconfirmDes.productionconfirmdate
        }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{
          prdcconfirmDes.productname
        }}</el-descriptions-item>
        <el-descriptions-item label="体积（m³）">{{
          prdcconfirmDes.volume
        }}</el-descriptions-item>
        <el-descriptions-item label="水分（%）" :span="2">{{
          prdcconfirmDes.moisture
        }}</el-descriptions-item>
        <el-descriptions-item label="容重（kg/m³）">{{
          prdcconfirmDes.volumeweight
        }}</el-descriptions-item>
        <el-descriptions-item label="折算吨数">{{
          prdcconfirmDes.convertweight
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

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
      <el-form label-position="top" :model="form">
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
            <el-form-item label="堆沤批次" style="margin-left: 20px">
              <el-input
                v-model="form.rettingbatch"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="堆沤起止日期">
              <el-date-picker
                style="width: 100%"
                v-model="form.rettingstartend"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="堆沤场所" style="margin-left: 20px">
              <el-input
                v-model="form.rettingplace"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="原材料、辅料（吨）">
              <el-input
                v-model="form.materialweight"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产量（吨）" style="margin-left: 20px">
              <el-input
                v-model="form.outputweight"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="生产负责人">
              <el-input
                v-model="form.productionprincipal"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" style="margin-left: 20px">
              <el-input
                v-model="form.contactinfo"
                autocomplete="off"
                type="text"
                maxlength="11"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select v-model="value2" placeholder="请选择">
                <el-option
                  v-for="item in options2"
                  :key="item.value2"
                  :label="item.label"
                  :value2="item.value2">
                </el-option>
              </el-select>
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

      filterservice: [], //
      filterdaterange: "",
      dialogVisible: false, //新增编辑对话框
      prcRecordDialogVisible: false, //生产记录对话框
      prcConfirmDialogVisible: false, //产量确认对话框
      selectServiceID: 0, //选中的记录ID，用于删除编辑等
      currentServiceSubName: "", //当前选中的服务主体名称
      loading: false, //列表加载
      options: [{
          value: '选项1',
          label: '检测中'
        }, {
          value: '选项2',
          label: '待测算'
        }, {
          value: '选项3',
          label: '已完成'
        },],
        value: '',
      options2: [{
        value: '选项1',
        label: '检测中'
      }, {
        value: '选项2',
        label: '待测算'
      }, {
        value: '选项3',
        label: '已完成'
      },],
      value2: '',
      form: {
        servicesub: "", //服务主体
        rettingbatch: "", //堆沤批次
        rettingstartend: [], //堆沤起止日期
        rettingplace: "", //堆沤场地
        materialweight: 0.0, //原材料辅料（吨）
        outputweight: 0.0, //产量（吨）
        productionprincipal: "", //生产负责人
        contactinfo: "", //联系方式
      },
      prdcrecordDes1: [],
      prdcrecordDes: {
        //生产记录表
        prcsdate: null,
        prcstemperatuream: 0,
        prcstemperaturepm: 0,
        prcsisstir: "0",
        prcssmell: "",
        prcsissampling: "0",
        prcsmoisture: 0,
        materials1name: "",
        materials1amount: 0,
        materials1sn: "",
        materials2name: "",
        materials2amount: 0,
        materials2sn: "",
        materials3name: "",
        materials3amount: 0,
        materials3sn: "",
      },
      prdcconfirmDes: {
        //产量确认表单
        productionconfirmdate: null,
        productname: "",
        volume: 0,
        moisture: 0,
        volumeweight: 0,
        convertweight: 0,
      },
      titleMap: {
        addEquipment: "新增生产记录台账", //根据自己内容定义名字
        editEquipment: "编辑生产记录台账", //根据自己内容定义名字
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
    // 模糊搜索
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
              Date.parse(array.rettingstartdate) >= Date.parse(startdate) &&
              Date.parse(array.rettingstartdate) <= Date.parse(enddate)
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
        var prjRes = await this.getPrdLedgerData();
        for (var i = 0; i < prjRes.length; i++) {
          var rowObj = {
            prdledgindex: prjRes[i].prdledgindex, //id号
            servicesub: this.getServiceNameByID(prjRes[i].serviceid), //服务主体
            rettingbatch: prjRes[i].rettingbatch, //堆沤批次
            rettingstartdate: new Date(prjRes[i].rettingstartdate), //开始时间
            rettingenddate: new Date(prjRes[i].rettingenddate), //结束时间
            rettingplace: prjRes[i].rettingplace, //堆沤场所
            materialweight: prjRes[i].materialweight,
            outputweight: prjRes[i].outputweight, //产量（吨）
            productionprincipal: prjRes[i].productionprincipal, //负责人
            contactinfo: prjRes[i].contactinfo, //联系电话
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
      let that = this;
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
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // 获取“生产记录台账”数据
    getPrdLedgerData() {
      let that = this;
      return new Promise((resolve, reject) => {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/selectByServiceid",
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

    /**
     * 切换服务主体列表事件
     */
    changeServiceSublist(serviceid) {
      this.form.servicesub = serviceid;
    },

    //新增单条服务主体记录
    addOneServiceSub() {
      this.form.servicesub = "";
      this.form.rettingbatch = "";
      this.form.rettingstartend = [];
      this.form.rettingplace = "";
      this.form.materialweight = "";
      this.form.outputweight = "";
      this.form.productionprincipal = "";
      this.form.contactinfo = "";

      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;
    },

    //编辑单条服务主体记录
    editOneServiceSub(row) {
      this.form.prdledgindex = row.prdledgindex;
      this.form.servicesub = this.getServiceIDByName(row.servicesub);
      this.form.rettingbatch = row.rettingbatch;
      this.form.rettingstartend = [
        new Date(row.rettingstartdate),
        new Date(row.rettingenddate),
      ];
      this.form.rettingplace = row.rettingplace;
      this.form.materialweight = row.materialweight;
      this.form.outputweight = row.outputweight;
      this.form.productionprincipal = row.productionprincipal;
      this.form.contactinfo = row.contactinfo;

      //this.currentServiceSubName = "";

      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;
    },

    /**
     * 查看关联的生产记录表
     */
    scanPrdcrecord(row) {
      let that = this;

      var url =
        "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecord/selectByRidAndSid?rettingbatch=" +
        row.rettingbatch +
        "&serviceid=" +
        that.getServiceIDByName(row.servicesub);
      that.$axios
        .get(url)
        .then((res) => {
          that.prcRecordDialogVisible = true;

          that.prdcrecordDes1 = res.data;

          // var prdrecorddate = new Date(res.data.prcsdate)
          // var startyear = prdrecorddate.getFullYear()
          // var startmonth = prdrecorddate.getMonth() + 1
          // var startday = prdrecorddate.getDate()

          // that.prdcrecordDes.prcsdate =
          //   startyear + '/' + startmonth + '/' + startday
          // that.prdcrecordDes.prcstemperatuream = res.data.prcstemperatuream
          // that.prdcrecordDes.prcstemperaturepm = res.data.prcstemperaturepm
          // that.prdcrecordDes.prcsisstir = res.data.prcsisstir
          // that.prdcrecordDes.prcssmell = res.data.prcssmell
          // that.prdcrecordDes.prcsissampling = res.data.prcsissampling
          // that.prdcrecordDes.prcsmoisture = res.data.prcsmoisture
          // that.prdcrecordDes.materials1name = res.data.materials1name
          // that.prdcrecordDes.materials1amount = res.data.materials1amount
          // that.prdcrecordDes.materials1sn = res.data.materials1sn
          // that.prdcrecordDes.materials2name = res.data.materials2name
          // that.prdcrecordDes.materials2amount = res.data.materials2amount
          // that.prdcrecordDes.materials2sn = res.data.materials2sn
          // that.prdcrecordDes.materials3name = res.data.materials3name
          // that.prdcrecordDes.materials3amount = res.data.materials3amount
          // that.prdcrecordDes.materials3sn = res.data.materials3sn
        })
        .catch((err) => {});
    },

    /**
     * 查看关联的产量确认表
     */
    scanPrdcconfirm(row) {
      let that = this;
      var url =
        "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/selectOne?rettingbatch=" +
        row.rettingbatch +
        "&serviceid=" +
        that.getServiceIDByName(row.servicesub);
      that.$axios
        .get(url)
        .then((res) => {
          that.prcConfirmDialogVisible = true;
          var prdconfirmdate = new Date(res.data.productionconfirmdate);
          var startyear = prdconfirmdate.getFullYear();
          var startmonth = prdconfirmdate.getMonth() + 1;
          var startday = prdconfirmdate.getDate();

          that.prdcconfirmDes.productionconfirmdate =
            startyear + "/" + startmonth + "/" + startday;
          that.prdcconfirmDes.productname = res.data.productname;
          that.prdcconfirmDes.volume = res.data.volume;
          that.prdcconfirmDes.moisture = res.data.moisture;
          that.prdcconfirmDes.volumeweight = res.data.volumeweight;
          that.prdcconfirmDes.convertweight = res.data.convertweight;
        })
        .catch((err) => {});
    },

    // 提交表单
    formCommit() {
      let that = this;

      if (that.dialogStatus == "addEquipment") {
        var startyear = that.form.rettingstartend[0].getFullYear();
        var startmonth = that.form.rettingstartend[0].getMonth() + 1;
        var startday = that.form.rettingstartend[0].getDate();

        var endyear = that.form.rettingstartend[1].getFullYear();
        var endmonth = that.form.rettingstartend[1].getMonth() + 1;
        var endday = that.form.rettingstartend[1].getDate();

        //新增
        var postData = that.$qs.stringify({
          serviceid: that.form.servicesub, //服务主体
          rettingbatch: that.form.rettingbatch, //堆沤批次
          rettingstartdate: startyear + "/" + startmonth + "/" + startday,
          rettingenddate: endyear + "/" + endmonth + "/" + endday,
          rettingplace: that.form.rettingplace,
          materialweight: that.form.materialweight,
          outputweight: that.form.outputweight,
          productionprincipal: that.form.productionprincipal,
          contactInfo: that.form.contactinfo,
        });

        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/insert",
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
        //编辑prdledgindex
        var startyear = that.form.rettingstartend[0].getFullYear();
        var startmonth = that.form.rettingstartend[0].getMonth() + 1;
        var startday = that.form.rettingstartend[0].getDate();

        var endyear = that.form.rettingstartend[1].getFullYear();
        var endmonth = that.form.rettingstartend[1].getMonth() + 1;
        var endday = that.form.rettingstartend[1].getDate();

        //新增
        var postDataEdit = that.$qs.stringify({
          prdledgindex: that.form.prdledgindex,
          serviceid: that.form.servicesub, //服务主体
          rettingbatch: that.form.rettingbatch, //堆沤批次
          rettingstartdate: startyear + "/" + startmonth + "/" + startday,
          rettingenddate: endyear + "/" + endmonth + "/" + endday,

          // rettingstartdate: "2021/11/11",
          // rettingenddate: "2021/11/11",
          rettingplace: that.form.rettingplace,
          materialweight: that.form.materialweight,
          outputweight: that.form.outputweight,
          productionprincipal: that.form.productionprincipal,
          contactinfo: that.form.contactinfo,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/update",
            postDataEdit
          )
          .then((res) => {
            that.$message({
              message: "成功修改生产记录台账！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新页面
          })
          .catch((err) => {
            that.$message.error("修改生产记录台账出错！请认真核对表单信息");
          });
      }
    },

    // 删除单条记录记录
    deleteOneProLedger(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const params = { id: row.prdledgindex };
          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/deleteById",
              {
                params,
              }
            )
            .then(function (response) {
              if (response.data == true) {
                that.tableData.splice(row.prdledgindex, 1);
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
          "堆沤批次",
          "堆沤开始日期",
          "堆沤结束日期",
          "堆沤场所",
          "原材料、辅料（吨）",
          "产量（吨）",
          "生产负责人",
          "联系电话",
        ];
        var filterVal = [
          "servicesub",
          "rettingbatch",
          "rettingstartdate",
          "rettingenddate",
          "rettingplace",
          "materialweight",
          "outputweight",
          "productionprincipal",
          "contactinfo",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "生产记录台账"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /** 统计报表*/
    report() {
      var that = this;
      that.$router.replace("/Report_proledger_main");
    },

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("/addBatchPrdcledgerRecord");
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

.el-dialog-div {
  overflow: auto;
  height: 48vh;
}

/deep/.el-dialog {
  background-color: rgb(240, 240, 246);
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
</style>