<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据安全</el-breadcrumb-item>
      <el-breadcrumb-item>数据备份</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card style="height: 85vh">
      <div
        style="
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        "
      >
        <!-- 卡片1：数据备份 -->
        <el-card class="box-card" style="width: 28vw">
          <div slot="header" class="clearfix">
            <span>数据备份</span>
          </div>
          <!-- <div class="grid-content bg-purple"> -->
          <div
            style="
              height: 30vh;
              border: 1px dashed #c0c4cc;
              border-radius: 5px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            "
          >
            <img
              style="width: 50px; height: 50px; margin: 0 auto 10px auto"
              src="../../../src/assets/icon/云端下载.png"
            />

            <el-link
              :underline="false"
              @click="dbBackup"
              v-loading.fullscreen.lock="fullscreenLoading"
              >下载数据库文件至本地</el-link
            >
          </div>
        </el-card>

        <!-- 卡片2：数据恢复 -->
        <el-card class="box-card" style="width: 28vw">
          <div slot="header" class="clearfix">
            <span>数据恢复</span>
          </div>
          <div style="height: 30vh">
            <el-upload
              drag
              action="#"
              :multiple="false"
              :show-file-list="true"
              :http-request="uploadHttpRequest"
              :file-list="fileList"
              :on-change="handleUploadChange"
              :before-upload="beforeUpload"
            >
              <div class="el-upload__text">
                <img
                  style="
                    width: 50px;
                    height: 50px;
                    max-width: 100%;
                    max-height: 100%;
                    margin: 0 auto 10px auto;
                  "
                  src="../../../src/assets/icon/云端上传.png"
                />
                <div>将文件拖到此处，或<em>点击浏览</em></div>
              </div>
            </el-upload>
          </div>
        </el-card>

        <!-- 卡片3：数据清空 -->
        <el-card class="box-card" style="width: 28vw">
          <div slot="header" class="clearfix">
            <span>数据清空</span>
          </div>
          <div
            style="
              height: 30vh;
              border: 1px dashed #c0c4cc;
              border-radius: 5px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            "
          >
            <img
              style="width: 50px; height: 50px; margin: 0 auto 10px auto"
              src="../../../src/assets/icon/删除.png"
            />

            <el-link
              :underline="false"
              @click="dbdelete"
              v-loading.fullscreen.lock="fullscreenLoading"
              >删除数据库</el-link
            >
          </div>
        </el-card>

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
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fullscreenLoading: false,
      remoteDbName: "tfdb",
      // 上传文件的列表
      fileList: [],
    };
  },
  created() {},
  computed: {},

  methods: {
    beforeUpload(file) {
      const fileType = file.name.substring(file.name.lastIndexOf("."));
      if (fileType.toLowerCase() != ".sql") {
        this.$message.error("文件必须为.sql类型");
        this.fileList = [];
        return false;
      }
    },
    // 覆盖element的默认上传文件
    uploadHttpRequest(data) {
      this.fullscreenLoading = true;
      let reader = new FileReader();
      let that = this;

      let formdata = new FormData();
      formdata.append("file", data.file);
      let localDbName = data.file.name.split(".")[0];
      that.$axios
        .post(
          "http://119.3.221.188:8808/tfDbOperator-2.0/dbbackup/upload",
          formdata,
          {
            headers: { "Content-Type": "multipart/form-data;" },
          }
        )
        .then((res) => {
          this.$axios
            .post(
              "http://119.3.221.188:8808/tfDbOperator-2.0/dbbackup/restore?name=" +
                localDbName
            )
            .then((res) => {
              this.fullscreenLoading = false;
              that.$message.success("数据库已恢复");
            })
            .catch((err) => {
              this.fullscreenLoading = false;
              this.$message.error("数据库恢复失败");
            });
        })
        .catch((err) => {
          this.fullscreenLoading = false;
          this.$message.error("数据库恢复失败");
        });

      reader.readAsText(data.file);
      reader.onload = function () {};
    },
    // 限制文件上传的个数只有一个，获取上传列表的最后一个
    handleUploadChange(file, fileList) {
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]; // 这一步，是 展示最后一次选择的文件
      }
    },

    dbBackup() {
      this.fullscreenLoading = true;
      this.$axios
        .post(
          "http://119.3.221.188:8808/tfDbOperator-2.0/dbbackup/backup?name=" +
            this.remoteDbName
        )
        .then((res) => {
          var blob = new Blob([], { type: "application/excel;charset=utf-8" });
          var downloadElement = document.createElement("a");
          var href = window.URL.createObjectURL(blob); //创建下载链接
          downloadElement.href =
            "http://119.3.221.188:8808/tfDbOperator-2.0/dbbackup/" +
            this.remoteDbName; // 此处可以通过拼接字符串的方式传递参数
          document.body.appendChild(downloadElement);
          downloadElement.click(); // 点击下载
          document.body.removeChild(downloadElement); // 下载完成之后移除元素
          window.URL.removeObjectURL(href); // 释放掉blob对象
        })
        .catch((err) => {
          this.fullscreenLoading = false;
          //this.$message.error("数据库备份失败");
        });
    },

    dbdelete() {
      let that = this;
      that.fullscreenLoading = true;

      try {
        that.$axios
          .post(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectByServiceid",
            window.sessionStorage.getItem("jurisdiction") == "superadmin"
              ? that.createWherein()
              : [window.sessionStorage.getItem("serviceID")]
          )
          .then((res) => {
            if (res.data) {
              res.data.forEach((element) => {
                const params = { serviceid: element.serviceid };
                that.$axios
                  .get(
                    "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/deleteServiceSubBy",
                    {
                      params,
                    }
                  )
                  .then(function (response) {
                    if (response.data == true) {
                    } else {
                    }
                  })
                  .catch(function (error) {})
                  .then(function () {});
              });
            }
          })
          .catch((err) => {});
      } catch (error) {
        // that.fullscreenLoading = false;
        that.$message.error("清空数据库失败，请联系管理员");
      } finally {
        that.fullscreenLoading = false;
        that.$message.success("数据库已清空");
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
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
/deep/ .el-upload {
  width: 100%;
}
/deep/ .el-upload-dragger {
  width: 100%;
  height: 30vh;
}
/deep/ .el-upload__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: calc(30vh-20px) auto;
}
// .bg-purple-dark {
//   background: white;
// }
// .bg-purple {
//   background: #white;
// }
// .bg-purple-light {
//   background: #white;
// }
.grid-content {
  border-radius: 4px;
  min-height: 36px;
  height: 150px;
  text-align: center;
  padding-top: 20px;
  border: 1px dashed darkgray;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
