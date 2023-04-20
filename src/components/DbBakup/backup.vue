<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据安全</el-breadcrumb-item>
      <el-breadcrumb-item>数据备份</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card style="height: 85vh; overflow-y: auto">
      <div
        style="
          display: block;
          white-space: nowrap;
          width: 100%;
          margin-bottom: 10px;
        "
      >
        <el-upload
          class=""
          ref="upload"
          action="/"
          :on-change="importExcel"
          :auto-upload="false"
          multiple
          accept=".xlsx"
          style="display: inline-block; width: 20%; margin-left: 10px"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :limit="8"
          :on-exceed="handleExceed"
          :file-list="fileList"
        >
          <el-button
            slot="trigger"
            size="small"
            type="primary"
            icon="el-icon-folder-opened"
          >
            数据恢复
          </el-button>
          <el-button
            style="margin-left: 10px"
            size="small"
            type="success"
            @click="submitUpload"
            icon="el-icon-upload2"
            >上传到服务器</el-button
          >

          <el-button
            size="small"
            type="primary"
            icon="el-icon-download"
            style="display: inline-block; margin-left: 10px"
            @click="dbBackup"
          >
            数据备份
          </el-button>
          <el-button
            size="small"
            type="danger"
            icon="el-icon-warning-outline"
            @click="clearDb"
            style="display: inline-block"
          >
            一键清空
          </el-button>
        </el-upload>

        <!-- <el-button
          slot="trigger"
          size="small"
          type="warning"
          icon="el-icon-notebook-1"
          style="display: inline-block; width: 12%"
        >
          导出日志
        </el-button> -->
      </div>

      <div class="block" style="overflow-y: auto; height: 70vh; width: 80vw">
        <el-timeline>
          <el-timeline-item :timestamp="userDb.finishTime" placement="top">
            <el-card>
              <h4>用户数据表</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ userDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="userDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>
          <el-timeline-item :timestamp="serviceDb.finishTime" placement="top">
            <el-card>
              <h4>服务主体数据表</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ serviceDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="serviceDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>
          <el-timeline-item :timestamp="ylincomeDb.finishTime" placement="top">
            <el-card>
              <h4>原料进厂台账</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ ylincomeDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="ylincomeDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>

          <el-timeline-item
            :timestamp="prcdledgerDb.finishTime"
            placement="top"
          >
            <el-card>
              <h4>生产记录台账</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ prcdledgerDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="prcdledgerDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>
          <el-timeline-item :timestamp="prcdrecDb.finishTime" placement="top">
            <el-card>
              <h4>生产记录表</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ prcdrecDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="prcdrecDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>
          <el-timeline-item
            :timestamp="prcdconfirmDb.finishTime"
            placement="top"
          >
            <el-card>
              <h4>产量确认表</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ prcdconfirmDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="prcdconfirmDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>

          <el-timeline-item :timestamp="ffsaleDb.finishTime" placement="top">
            <el-card>
              <h4>销售台账</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ ffsaleDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="ffsaleDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>
          <el-timeline-item :timestamp="supdetailDb.finishTime" placement="top">
            <el-card>
              <h4>供应明细表</h4>
              <span>
                <div
                  style="margin-top: 10px; margin-left: 5px; margin-bottom: 5px"
                >
                  {{ supdetailDb.dbRes }}
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="15"
                  :percentage="supdetailDb.dbPercentage"
                ></el-progress>
              </span>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script>
import XLSX from "xlsx";

export default {
  data() {
    return {
      userDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      serviceDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      ylincomeDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      prcdledgerDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      prcdrecDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      prcdconfirmDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      ffsaleDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      supdetailDb: {
        dbPercentage: 0, //进度条
        dbRes: "", //备份结果说明文字
        finishTime: "2021/09/11", //完成时间
        table: null,
      },

      statusChanged: false,
      batImpStatus: "准备",
      successCount: 0,
      totalCount: 0,

      loading: false, //列表加载

      fileList: [],
    };
  },
  created() {},
  computed: {},

  methods: {
    clearDb() {
      var cmd = new ActiveXObject("WScript.Shell");

      /*

命令参数说明

cmd.exe /c dir 是执行完dir命令后关闭命令窗口。

cmd.exe /k dir 是执行完dir命令后不关闭命令窗口。

cmd.exe /c start dir 会打开一个新窗口后执行dir指令，原窗口会关闭。

cmd.exe /k start dir 会打开一个新窗口后执行dir指令，原窗口不会关闭。

*/

      //执行完cmd命令后不关闭命令窗口。

      //cmd.run("cmd.exe /k " + value);

      //执行完cmd命令后不关闭命令窗口。

      cmd.run("cmd.exe /c " + "");

      cmd = null;
    },
    //拿到方法1与方法2的两个结果后，执行init方法
    async initTable() {
      this.loading = true;
      try {
        this.userDb.table = await this.queryUserList();
        if (this.userDb.table != null) {
          this.exportExcel(this.userDb.table, "tf_users");
          this.userDb.finishTime = this.getCurrentDate();
          this.userDb.dbRes = "  用户数据已完成备份...";
          this.userDb.dbPercentage = 100;
        }

        this.serviceDb.table = await this.queryServiceList();
        if (this.serviceDb.table != null) {
          this.exportExcel(this.serviceDb.table, "tf_servicesubject");
          this.serviceDb.finishTime = this.getCurrentDate();
          this.serviceDb.dbRes = "  服务主体数据已完成备份...";
          this.serviceDb.dbPercentage = 100;
        }

        this.ylincomeDb.table = await this.querymaterialledger();
        if (this.ylincomeDb.table != null) {
          this.exportExcel(this.ylincomeDb.table, "tf_materialledger");
          this.ylincomeDb.finishTime = this.getCurrentDate();
          this.ylincomeDb.dbRes = "  原料进厂台账已完成备份...";
          this.ylincomeDb.dbPercentage = 100;
        }

        this.prcdledgerDb.table = await this.queryPrdLedgerData();
        if (this.prcdledgerDb.table != null) {
          this.exportExcel(
            this.prcdledgerDb.table,
            "tf_productionrecordledger"
          );
          this.prcdledgerDb.finishTime = this.getCurrentDate();
          this.prcdledgerDb.dbRes = "  生产记录台账已完成备份...";
          this.prcdledgerDb.dbPercentage = 100;
        }

        this.prcdrecDb.table = await this.queryPrdRecordData();
        if (this.prcdrecDb.table != null) {
          this.exportExcel(this.prcdrecDb.table, "tf_productionrecord");

          this.prcdrecDb.finishTime = this.getCurrentDate();
          this.prcdrecDb.dbRes = "  生产记录数据已完成备份...";
          this.prcdrecDb.dbPercentage = 100;
        }

        this.prcdconfirmDb.table = await this.queryPrdConfirmData();
        if (this.prcdconfirmDb.table != null) {
          this.exportExcel(this.prcdconfirmDb.table, "tf_productionconfirm");
          this.prcdconfirmDb.finishTime = this.getCurrentDate();
          this.prcdconfirmDb.dbRes = "  产量确认数据已完成备份...";
          this.prcdconfirmDb.dbPercentage = 100;
        }

        this.ffsaleDb.table = await this.querySaleLedger();
        if (this.ffsaleDb.table != null) {
          this.exportExcel(this.ffsaleDb.table, "tf_saleledger");
          this.ffsaleDb.finishTime = this.getCurrentDate();
          this.ffsaleDb.dbRes = "  粪肥销售数据已完成备份...";
          this.ffsaleDb.dbPercentage = 100;
        }

        this.supdetailDb.table = await this.querysupdetail();
        if (this.supdetailDb.table != null) {
          this.exportExcel(this.supdetailDb.table, "tf_supdetail");
          this.supdetailDb.finishTime = this.getCurrentDate();
          this.supdetailDb.dbRes = "  供应明细数据已完成备份...";
          this.supdetailDb.dbPercentage = 100;
        }

        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },

    dbBackup() {
      this.initTable();
    },

    exportExcel(tb, tbname) {
      var that = this;
      require.ensure([], () => {
        const { export_json_to_excel } = require("@/excel/export2Excel"); //这里必须使用绝对路径，使用@/+存放export2Excel的路径

        var filterVal = [];

        switch (tbname) {
          case "tf_users":
            filterVal = ["username", "password", "jurisdiction", "serviceid"];
            break;
          case "tf_servicesubject":
            filterVal = [
              "serviceid",
              "servicename",
              "serviceshortnm",
              "servicelng",
              "servicelag",
              "duiliaoqudn",
              "dibangqudn",
              "fajiaochidn",
              "chuchangqudn",
              "zhuanghuoquodn",
              "place",
              "materialkind",
              "disposal",
              "prmtamount",
              "director",
              "contactinfo",
              "note",
            ];
            break;
          case "tf_materialledger":
            filterVal = [
              "serviceid",
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
            break;
          case "tf_productionrecordledger":
            filterVal = [
              "rettingbatch",
              "serviceid",
              "rettingstartdate",
              "rettingplace",
              "materialweight",
              "rettingenddate",
              "outputweight",
              "productionprincipal",
              "contactinfo",
            ];
            break;
          case "tf_productionrecord":
            filterVal = [
              "rettingbatch",
              "serviceid",
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
            break;
          case "tf_productionconfirm":
            filterVal = [
              "rettingbatch",
              "serviceid",
              "productionconfirmdate",
              "productname",
              "volume",
              "moisture",
              "volumeweight",
              "convertweight",
            ];
            break;
          case "tf_saleledger":
            filterVal = [
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
            break;
          case "tf_supdetail":
            filterVal = [
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
            break;
        }

        const data = that.formatJson(filterVal, tb);

        export_json_to_excel(filterVal, data, tbname); // 导出的表格名称，根据需要自己命名
      });
    }, //格式转换，直接复制即可

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },

    getCurrentDate() {
      var myDate = new Date();
      myDate.getYear(); //获取当前年份(2位)
      myDate.getFullYear(); //获取完整的年份(4位,1970-????)
      myDate.getMonth(); //获取当前月份(0-11,0代表1月)
      myDate.getDate(); //获取当前日(1-31)
      myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
      myDate.getTime(); //获取当前时间(从1970.1.1开始的毫秒数)
      myDate.getHours(); //获取当前小时数(0-23)
      myDate.getMinutes(); //获取当前分钟数(0-59)
      myDate.getSeconds(); //获取当前秒数(0-59)
      myDate.getMilliseconds(); //获取当前毫秒数(0-999)

      myDate.toLocaleDateString(); //获取当前日期

      return myDate.toLocaleDateString() + myDate.toLocaleTimeString(); //获取当前时间

      //   return myDate.toLocaleString(); //获取日期与时间
    },
    /**
     * 获取用户表
     */
    queryUserList() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/selectAll?offset=0&limit=10000"
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
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectAllServiceSub?offset=0&limit=1000000"
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
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfMaterialledger/selectAll?offset=0&limit=10000000"
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

    // 获取“生产记录台账”数据
    queryPrdLedgerData() {
      let that = this;
      return new Promise((resolve, reject) => {
        that.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/selectAll?offset=0&limit=50000000"
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
    queryPrdRecordData() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecord/selectAll?offset=0&limit=50000000"
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
    queryPrdConfirmData() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionconfirm/selectAll?offset=0&limit=50000000"
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
     * 获取销售表单
     */
    querySaleLedger() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSaleledger/selectAllSaleledger?offset=0&limit=10000000"
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
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfSupdetail/selectAll?offset=0&limit=10000000"
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

    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 8 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },

    //导入

    submitUpload() {
      let that = this;
      for (var i = 0; i < that.fileList.length; i++) {
        var file = that.fileList[i];
        that.file2Xce(file).then((tabJson) => {
          if (tabJson && tabJson.length > 0) {
            for (var i = 0; i < tabJson[0].sheet.length; i++) {
              that.postToDb(file.name, tabJson[0].sheet);
            }
          }
        });
      }
    },

    /**
     * 插入数据
     */
    postToDb(tbnamne, datatable) {
      let that = this;
      if (tbnamne.indexOf("tf_users") > -1) {
        //用户表
        var successCount = 0;
        var totalCount = datatable.length;
        that.userDb.dbPercentage = 0;
        for (var i = 0; i < datatable.length; i++) {
          var postData = that.$qs.stringify({
            username: datatable[i].username,
            password: datatable[i].password,
            jurisdiction: datatable[i].jurisdiction,
            serviceid: datatable[i].serviceid,
          });

          that.$axios
            .post(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/insertUser",
              postData
            )
            .then((res) => {
              successCount++;
              that.userDb.dbPercentage = that.fun(
                (successCount / totalCount) * 100
              );

              that.userDb.dbRes = "已导入" + successCount + "条记录...";
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } else if (tbnamne.indexOf("tf_servicesubject") > -1) {
        //服务主体表

        var successCount = 0;
        var totalCount = datatable.length;
        that.serviceDb.dbPercentage = 0;
        for (var i = 0; i < datatable.length; i++) {
          var postData = that.$qs.stringify({
            serviceid: datatable[i].serviceid,
            servicename: datatable[i].servicename,
            serviceshortnm: datatable[i].serviceshortnm,
            servicelng: datatable[i].servicelng,
            servicelag: datatable[i].servicelag,
            duiliaoqudn: datatable[i].duiliaoqudn,
            dibangqudn: datatable[i].dibangqudn,
            fajiaochidn: datatable[i].fajiaochidn,
            chuchangqudn: datatable[i].chuchangqudn,
            zhuanghuoquodn: datatable[i].zhuanghuoquodn,
            place: datatable[i].place,
            materialkind: datatable[i].materialkind,
            disposal: datatable[i].disposal,
            prmtamount: datatable[i].prmtamount,
            director: datatable[i].director,
            contactinfo: datatable[i].contactinfo,
            note: datatable[i].note,
          });

          that.$axios
            .post(
              "http://119.3.221.188:9090/tfServicesubject/insertServiceSub",
              postData
            )
            .then((res) => {
              successCount++;
              that.serviceDb.dbPercentage = that.fun(
                (successCount / totalCount) * 100
              );

              that.serviceDb.dbRes = "已导入" + successCount + "条记录...";
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
      if (tbnamne.indexOf("tf_materialledger") > -1) {
        //原料进厂台账
      }
      if (tbnamne.indexOf("tf_productionrecordledger") > -1) {
        //生产记录台账
        var successCount = 0;
        var totalCount = datatable.length;
        that.prcdledgerDb.dbPercentage = 0;
        for (var i = 0; i < datatable.length; i++) {
          var postData = that.$qs.stringify({
            serviceid: datatable[i].serviceid,
            rettingbatch: datatable[i].rettingbatch,
            rettingstartdate: datatable[i].rettingstartdate
              .replaceAll("-", "/")
              .split("T")[0],
            rettingenddate: datatable[i].rettingenddate
              .replaceAll("-", "/")
              .split("T")[0],
            rettingplace: datatable[i].rettingplace,
            materialweight: datatable[i].materialweight,
            outputweight: datatable[i].outputweight,
            productionprincipal: datatable[i].productionprincipal,
            contactInfo: datatable[i].contactinfo,
          });

          that.$axios
            .post(
              "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/insert",
              postData
            )
            .then((res) => {
              successCount++;
              that.prcdledgerDb.dbPercentage = that.fun(
                (successCount / totalCount) * 100
              );

              that.prcdledgerDb.dbRes = "已导入" + successCount + "条记录...";
            })
            .catch((err) => {});
        }
      }
      if (tbnamne.indexOf("tf_productionrecord") > -1) {
        //生产记录表
      }
      if (tbnamne.indexOf("tf_productionconfirm") > -1) {
        //产量确认表
      }
      if (tbnamne.indexOf("tf_saleledger") > -1) {
        //销售台账
      }
      if (tbnamne.indexOf("tf_supdetail") > -1) {
        //供应明细表
      }
    },

    //导入
    importExcel(file, files) {
      let that = this;
      that.fileList = files;
    },

    file2Xce(file) {
      return new Promise(function (resolve) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = e.target.result;
          this.wb = XLSX.read(data, {
            type: "binary",
          });
          const result = [];
          this.wb.SheetNames.forEach((sheetName) => {
            result.push({
              sheetName: sheetName,
              sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName]),
            });
          });
          resolve(result);
        };
        reader.readAsBinaryString(file.raw);
      });
    },

    /**
     * 上传至数据库
     */
    async uploadtoDb() {
      let that = this;
      var totalCount = that.tableFromExcel.length;
      var successCount = 0;
      for (var i = 0; i < that.tableFromExcel.length; i++) {
        var _sid = that.getServiceIdByName(that.tableFromExcel[i].服务主体);
        if (_sid != null) {
          if (_sid != "") {
            //新增
            var postData = that.$qs.stringify({
              serviceid: _sid, //服务主体
              rettingbatch: that.tableFromExcel[i].堆沤批次, //堆沤批次
              rettingstartdate: that.tableFromExcel[i].堆沤开始日期,
              rettingenddate: that.tableFromExcel[i].堆沤结束日期,
              rettingplace: that.tableFromExcel[i].堆沤场所,
              materialweight: that.tableFromExcel[i].原材料辅料,
              outputweight: that.tableFromExcel[i].产量,
              productionprincipal: that.tableFromExcel[i].生产负责人,
              contactInfo: that.tableFromExcel[i].联系电话,
            });

            that.$axios
              .post(
                "http://119.3.221.188:8808/tfDbOperator-2.0/tfProductionrecordledger/insert",
                postData
              )
              .then((res) => {
                successCount++;
                that.batchImpPercentage = that.fun(
                  (successCount / totalCount) * 100
                );

                that.batchImpRes = "已导入" + successCount + "条记录...";
              })
              .catch((err) => {});
          } else {
            // that.tableFromExcel[i].状态 = "查询不到对应的服务主体";
            // that.statusChanged != that.statusChanged;
          }
        } else {
          // that.tableFromExcel[i].状态 = "查询不到对应的服务主体";
          // that.statusChanged != that.statusChanged;
        }
      }
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

.card {
  margin-left: 10px;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.el-row {
  margin-top: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  margin-left: 100px;
  border-radius: 4px;
}
</style>
