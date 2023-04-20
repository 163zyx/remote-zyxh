<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>台账管理</el-breadcrumb-item>
      <el-breadcrumb-item>生产记录表</el-breadcrumb-item>
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
        <el-table-column prop="rettingbatch" label="堆沤批次" width="120">
        </el-table-column>
        <el-table-column
          prop="prcsdate"
          :formatter="formatDate"
          label="日期"
          width="100"
        >
        </el-table-column>

        <el-table-column prop="prcstemperatuream" label="上午温度" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.prcstemperatuream) }}
          </template>
        </el-table-column>

        <el-table-column prop="prcstemperaturepm" label="下午温度" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.prcstemperaturepm) }}
          </template>
        </el-table-column>

        <el-table-column prop="prcsisstir" label="是否翻抛" width="100">
          <template slot-scope="scope">
            {{ boolByString(scope.row.prcsisstir) }}
          </template>
        </el-table-column>
        <el-table-column prop="prcssmell" label="气味" width="100">
        </el-table-column>
        <el-table-column prop="prcsissampling" label="是否取样" width="100">
          <template slot-scope="scope">
            {{ boolByString(scope.row.prcsissampling) }}
          </template>
        </el-table-column>

        <el-table-column prop="prcsmoisture" label="水分" width="100">
          <template slot-scope="scope">
            {{ fun(scope.row.prcsmoisture) }}
          </template>
        </el-table-column>

        <el-table-column prop="materials1name" label="原料1名称" width="100">
        </el-table-column>
        <el-table-column prop="materials1amount" label="原料1用量" width="100">
          <template slot-scope="scope">
            {{ fun2(scope.row.materials1amount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="materials1sn"
          label="原料1相关证明序号"
          width="150"
        >
        </el-table-column>

        <el-table-column prop="materials2name" label="原料2名称" width="100">
        </el-table-column>
        <el-table-column prop="materials2amount" label="原料2用量" width="100">
          <template slot-scope="scope">
            {{ fun2(scope.row.materials2amount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="materials2sn"
          label="原料2相关证明序号"
          width="150"
        >
        </el-table-column>

        <el-table-column prop="materials3name" label="原料3名称" width="100">
        </el-table-column>
        <el-table-column prop="materials3amount" label="原料3用量" width="100">
          <template slot-scope="scope">
            {{ fun2(scope.row.materials3amount) }}
          </template></el-table-column
        >
        <el-table-column
          prop="materials3sn"
          label="原料3相关证明序号"
          width="150"
        >
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              @click.native="editOnePrdcRecord(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="deleteOnePrdcRecord(scope.row)"
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
          <el-col :span="8">
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
          <el-col :span="8">
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
              </el-select>
            </el-form-item> -->
          </el-col>
          <el-col :span="8">
            <el-form-item label="日期" style="margin-left: 10px">
              <el-date-picker
                v-model="form.prcsdate"
                autocomplete="off"
                :disabled="popForbid"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">
            <el-form-item label="上午温度">
              <el-input
                v-model="form.prcstemperatuream"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="下午温度）" style="margin-left: 10px">
              <el-input
                v-model="form.prcstemperaturepm"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="5">
            <el-form-item label="水分" style="margin-left: 10px">
              <el-input
                v-model="form.prcsmoisture"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="气味" style="margin-left: 10px">
              <el-input
                v-model="form.prcssmell"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="2">
            <el-form-item label="翻抛" style="margin-left: 10px">
              <el-switch
                v-model="form.prcsisstir"
                active-color="#409EFF"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
              >
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-form-item label="取样" style="margin-left: 10px">
              <el-switch
                v-model="form.prcsissampling"
                active-color="#409EFF"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
              >
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="原料1名称">
              <el-input
                v-model="form.materials1name"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原料1用量" style="margin-left: 10px">
              <el-input
                v-model="form.materials1amount"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原料1相关证明序号" style="margin-left: 10px">
              <el-input
                v-model="form.materials1sn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="原料2名称">
              <el-input
                v-model="form.materials2name"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原料2用量" style="margin-left: 10px">
              <el-input
                v-model="form.materials2amount"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原料2相关证明序号" style="margin-left: 10px">
              <el-input
                v-model="form.materials2sn"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="原料3名称">
              <el-input
                v-model="form.materials3name"
                autocomplete="off"
                type="text"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原料3用量" style="margin-left: 10px">
              <el-input
                v-model="form.materials3amount"
                autocomplete="off"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原料3相关证明序号" style="margin-left: 10px">
              <el-input
                v-model="form.materials3sn"
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
      myprcsisstir: "0", //翻抛switch
      myprcsissampling: "0", //取样switch
      popForbid: false, //服务主体列表和堆沤批次列表不可用，用于编辑窗体

      loading: false, //列表加载
      form: {
        servicesub: "", //服务主体
        rettingbatch: "", //堆沤批次
        prcsdate: null, //时间
        prcstemperatuream: 0, //上午温度
        prcstemperaturepm: 0, //下午温度
        prcsisstir: "1", //是否翻抛
        prcssmell: "", //气味
        prcsissampling: "1", //是否取样
        prcsmoisture: 0, //水分
        materials1name: "", //原料1名称
        materials1amount: 0, //原料1用量
        materials1sn: "", //原料1相关证明序号
        materials2name: "", //原料2名称
        materials2amount: 0, //原料2用量
        materials2sn: "", //原料2相关证明序号
        materials3name: "", //原料3名称
        materials3amount: 0, //原料3用量
        materials3sn: "", //原料3相关证明序号
      },
      titleMap: {
        addEquipment: "新增生产记录", //根据自己内容定义名字
        editEquipment: "编辑生产记录", //根据自己内容定义名字
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
              Date.parse(array.prcsdate) >= Date.parse(startdate) &&
              Date.parse(array.prcsdate) <= Date.parse(enddate)
          );
        }

      return resTable;
    },
  },

  methods: {
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
        var prjRes = await this.getPrdRecordData();
        for (var i = 0; i < prjRes.length; i++) {
          var rowObj = {
            servicesub: this.getServiceNameByID(prjRes[i].serviceid), //服务主体
            rettingbatch: prjRes[i].rettingbatch, //堆沤批次
            prcsdate: prjRes[i].prcsdate, //开始时间
            prcstemperatuream: prjRes[i].prcstemperatuream, //结束时间
            prcstemperaturepm: prjRes[i].prcstemperaturepm, //堆沤场所
            prcsisstir: prjRes[i].prcsisstir,
            prcssmell: prjRes[i].prcssmell, //产量（吨）
            prcsissampling: prjRes[i].prcsissampling, //负责人
            prcsmoisture: prjRes[i].prcsmoisture, //联系电话
            materials1name: prjRes[i].materials1name,
            materials1amount: prjRes[i].materials1amount,
            materials1sn: prjRes[i].materials1sn,
            materials2name: prjRes[i].materials2name,
            materials2amount: prjRes[i].materials2amount,
            materials2sn: prjRes[i].materials2sn,
            materials3name: prjRes[i].materials3name,
            materials3amount: prjRes[i].materials3amount,
            materials3sn: prjRes[i].materials3sn,
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

    // 获取“生产记录台账”数据
    getPrdRecordData() {
      return new Promise((resolve, reject) => {
        this.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecord/selectByServiceid",
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
      // this.form.rettingbatch = "";
      // this.myrettingbatchlist = [];
      // for (var i = 0; i < this.rettingbatchlist.length; i++) {
      //   if (serviceid == this.rettingbatchlist[i].serviceid) {
      //     this.myrettingbatchlist.push(this.rettingbatchlist[i].rettingbatch);
      //   }
      // }
    },
    /**
     * 切换堆沤批次事件
     */
    // changeRettingbatchlist(rettingbatch) {
    //   this.form.rettingbatch = rettingbatch;
    // },

    //新增单条服务主体记录
    async addOneServiceSub() {
      //获取堆沤批次列表

      this.form.servicesub = ""; //服务主体
      this.form.rettingbatch = ""; //堆沤批次
      this.form.prcsdate = new Date(); //时间
      this.form.prcstemperatuream = 0; //上午温度
      this.form.prcstemperaturepm = 0; //下午温度
      this.form.prcsisstir = 1; //是否翻抛
      this.form.prcssmell = ""; //气味
      this.form.prcsissampling = 1; //是否取样
      this.form.prcsmoisture = 0; //水分
      this.form.materials1name = ""; //原料1名称
      this.form.materials1amount = 0; //原料1用量
      this.form.materials1sn = ""; //原料1相关证明序号
      this.form.materials2name = ""; //原料2名称
      this.form.materials2amount = 0; //原料2用量
      this.form.materials2sn = ""; //原料2相关证明序号
      this.form.materials3name = ""; //原料3名称
      this.form.materials3amount = 0; //原料3用量
      this.form.materials3sn = ""; //原料3相关证明序号

      this.dialogStatus = "addEquipment";
      this.dialogVisible = true;

      this.popForbid = false;
    },

    //编辑单条服务主体记录
    async editOnePrdcRecord(row) {
      this.form.servicesub = this.getServiceIDByName(row.servicesub); //服务主体
      this.form.rettingbatch = row.rettingbatch; //堆沤批次
      this.form.prcsdate = new Date(row.prcsdate); //时间
      this.form.prcstemperatuream = row.prcstemperatuream; //上午温度
      this.form.prcstemperaturepm = row.prcstemperaturepm; //下午温度
      this.form.prcsisstir = row.prcsisstir; //是否翻抛
      this.form.prcssmell = row.prcssmell; //气味
      this.form.prcsissampling = row.prcsissampling; //是否取样
      this.form.prcsmoisture = row.prcsmoisture; //水分
      this.form.materials1name = row.materials1name; //原料1名称
      this.form.materials1amount = row.materials1amount; //原料1用量
      this.form.materials1sn = row.materials1sn; //原料1相关证明序号
      this.form.materials2name = row.materials2name; //原料2名称
      this.form.materials2amount = row.materials2amount; //原料2用量
      this.form.materials2sn = row.materials2sn; //原料2相关证明序号
      this.form.materials3name = row.materials3name; //原料3名称
      this.form.materials3amount = row.materials3amount; //原料3用量
      this.form.materials3sn = row.materials3sn; //原料3相关证明序号

      this.dialogStatus = "editEquipment";
      this.dialogVisible = true;
      this.popForbid = true;
    },

    // 提交表单
    formCommit() {
      let that = this;

      if (that.dialogStatus == "addEquipment") {
        var startyear = that.form.prcsdate.getFullYear();
        var startmonth = that.form.prcsdate.getMonth() + 1;
        var startday = that.form.prcsdate.getDate();

        //新增
        var postData = that.$qs.stringify({
          serviceid: that.form.servicesub, //服务主体
          rettingbatch: that.form.rettingbatch, //堆沤批次
          prcsdate: startyear + "/" + startmonth + "/" + startday,
          prcstemperatuream: that.form.prcstemperatuream,
          prcstemperaturepm: that.form.prcstemperaturepm,
          prcsisstir: that.form.prcsisstir,
          prcssmell: that.form.prcssmell,
          prcsissampling: that.form.prcsissampling,
          prcsmoisture: that.form.prcsmoisture,
          materials1name: that.form.materials1name,
          materials1amount: that.form.materials1amount,
          materials1sn: that.form.materials1sn,
          materials2name: that.form.materials2name,
          materials2amount: that.form.materials2amount,
          materials2sn: that.form.materials2sn,
          materials3name: that.form.materials3name,
          materials3amount: that.form.materials3amount,
          materials3sn: that.form.materials3sn,
        });

        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecord/insert",
            postData
          )
          .then((res) => {
            that.$message({
              message: "成功新增一条生产！",
              type: "success",
            });
            that.dialogVisible = false;

            that.reload(); //刷新列表
          })
          .catch((err) => {
            that.$message.error("新增生产记录出错！请认真核对表单信息");
            console.log(err);
          });
      } else if (that.dialogStatus == "editEquipment") {
        var startyear = that.form.prcsdate.getFullYear();
        var startmonth = that.form.prcsdate.getMonth() + 1;
        var startday = that.form.prcsdate.getDate();

        var postData = that.$qs.stringify({
          serviceid: that.form.servicesub, //服务主体
          rettingbatch: that.form.rettingbatch, //堆沤批次
          prcsdate: startyear + "/" + startmonth + "/" + startday,
          prcstemperatuream: that.form.prcstemperatuream,
          prcstemperaturepm: that.form.prcstemperaturepm,
          prcsisstir: that.form.prcsisstir,
          prcssmell: that.form.prcssmell,
          prcsissampling: that.form.prcsissampling,
          prcsmoisture: that.form.prcsmoisture,
          materials1name: that.form.materials1name,
          materials1amount: that.form.materials1amount,
          materials1sn: that.form.materials1sn,
          materials2name: that.form.materials2name,
          materials2amount: that.form.materials2amount,
          materials2sn: that.form.materials2sn,
          materials3name: that.form.materials3name,
          materials3amount: that.form.materials3amount,
          materials3sn: that.form.materials3sn,
        });
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecord/update",
            postData
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
    deleteOnePrdcRecord(row) {
      let that = this;
      that
        .$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          var prcsdate = row.prcsdate.split("T")[0].replace(/-/g, "/");

          const params = {
            rettingbatch: row.rettingbatch,
            serviceid: that.getServiceIDByName(row.servicesub),
            prcsdate: prcsdate,
          };

          that.$axios
            .get(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecord/deleteById",
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
                that.$message.error("删除失败！请联系管理员！");
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
          "上午温度",
          "下午温度",
          "是否翻抛",
          "气味",
          "是否取样",
          "水分",
          "原料1名称",
          "原料1用量",
          "原料1相关证明序号",
          "原料2名称",
          "原料2用量",
          "原料2相关证明序号",
          "原料3名称",
          "原料3用量",
          "原料3相关证明序号",
        ];
        var filterVal = [
          "servicesub",
          "rettingbatch",
          "prcsdate",
          "prcstemperatuream",
          "prcstemperaturepm",
          "prcsisstir",
          "prcssmell",
          "prcsissampling",
          "prcsmoisture",
          "materials1name",
          "materials1amount",
          "materials1sn",
          "materials2name",
          "materials2amount",
          "materials2sn",
          "materials3name",
          "materials3amount",
          "materials3sn",
        ];
        const data = that.formatJson(filterVal, that.tables);
        export_json_to_excel(tHeader, data, "生产记录表"); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    /**
     * 保留1位小数
     */
    fun(val) {
      return Number(val).toFixed(1);
    },

    /**
     * 保留2位小数
     */
    fun2(val) {
      return Number(val).toFixed(2);
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

    /**批量导入 */
    addBatch() {
      var that = this;
      that.$router.replace("/addBatchPrdcRecord");
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