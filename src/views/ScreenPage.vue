<template>
  <!-- 原本的style -->
  <!-- <div class="screen-container" :style="containerStyle"> -->
  <div class="screen-container">
    <!-- 头部 -->
    <header class="screen-header">
      <div class="header-buttons">
        <el-button @click="go_home" class="go_home">台账管理</el-button>
        <el-button @click="go_video" class="go_home">线上巡视</el-button>
        <el-button @click="go_car" class="go_home">运输监管</el-button>
      </div>
      <div class="title-mid">
        <img src="../assets/image/yinan_logo2.png" alt="" />
      </div>
      <div class="title-right">
        <el-button
          class="logout"
          icon="el-icon-full-screen"
          @click="clickFullscreen"
          >全屏</el-button
        >
        <el-button class="logout" @click="logout">退出</el-button>
      </div>
    </header>
    <!-- 主体 -->
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top">
          <!-- 图表左1 -->
          <seller ref="seller"></seller>
        </div>
        <div id="left-bottom">
          <!-- 图表左2 -->

          <stock ref="stock"></stock>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top">
          <!-- 视频弹窗 -->
          <el-dialog
            title="视频监控"
            ref="videoDg"
            :visible.sync="vediodialogVisible"
            center
            :append-to-body="false"
            :lock-scroll="false"
            :modal="true"
            width="750px"
            @close="closeDialog"
            draggable="true"
          >
            <div slot="footer" id="videoDiv"></div>
          </el-dialog>

          <!-- 在你的template代码中使用地图系列的组件 -->
          <div id="app">
            <amap
              :zoom="10.8"
              :center="centerposition"
              map-style="amap://styles/blue"
            >
              <amap-marker
                ref="markerref"
                v-for="marker in videomarkers"
                :key="marker.key"
                :position="marker.position"
                :label="{
                  content: marker.name,
                  direction: 'bottom',
                }"
                :extData="marker.devicelist"
                :icon="markerIcon"
                clickable
                @click="onMarkerClick"
              />

              <amap-info-window
                :position="clickpositon"
                :visible="showInfoWindow"
                :offset="[8, -32]"
                is-custom
              >
                <div class="info-window-content">
                  <el-button
                    type="primary"
                    icon="el-icon-video-play"
                    class="info-window-VdBtn-left"
                    @click="openduiliaoquVideo()"
                  >
                    堆料区</el-button
                  >

                  <el-button
                    type="success"
                    icon="el-icon-video-play"
                    class="info-window-VdBtn-top"
                    @click="openguobangquVideo"
                    >地磅区</el-button
                  >
                  <el-button
                    type="warning"
                    icon="el-icon-video-play"
                    class="info-window-VdBtn-right"
                    @click="openfajiaochiVideo"
                    >发酵池</el-button
                  >

                  <el-button
                    type="danger"
                    icon="el-icon-video-play"
                    class="info-window-VdBtn-bottom"
                    @click="openchuchangquVideo"
                    >出厂区</el-button
                  >
                  <el-button
                    type="info"
                    icon="el-icon-video-play"
                    class="info-window-VdBtn-bottom"
                    @click="openzhuanghuoquVideo"
                    >装货区</el-button
                  >
                </div>
              </amap-info-window>
            </amap>
          </div>

          <!-- 图表中1 -->
        </div>
        <div id="middle-bottom">
          <!-- 图表中2 -->
          <rank ref="rank"></rank>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top">
          <!-- 图表右1 -->
          <dispatch></dispatch>
        </div>
        <div id="right-bottom">
          <!-- 图表右2 -->
          <!-- 土肥产品质量分析表 -->
          <tf-pro-quality-vue ref="tfproq"></tf-pro-quality-vue>
        </div>
      </section>
    </div>

    <!-- 底部信息 -->
    <div class="screen-footer">技术支持@山东智墒农业科技有限公司</div>
  </div>
</template>

<script>
import Seller from "../components/charts/Seller.vue";
import Rank from "../components/charts/Rank.vue";
import Stock from "../components/charts/Stock.vue";
import Dispatch from "../components/charts/Dispatch.vue";
import TfProQualityVue from "../components/charts/TfProQuality.vue"; //土肥质量统计表

import Map from "./Map.vue";

import Videos from "./Videos.vue";

import markerIcon from "../assets/image/videoIcon.png";

import EZUIKit from "@/plugins/ezuikit.js"; //引入萤石视频播放插件
import screenfull from "screenfull"; //全屏插件
import qs from "qs";
export default {
  data() {
    return {
      isFullscreen: false, //全屏控制
      //centerposition: [118.47061, 35.55131],
      centerposition: [0, 0],
      showInfoWindow: false,
      videoPlayer: null,
      vediodialogVisible: false, //视频弹窗

      accesstoken: "", //一周更新，后期需用api获取
      VerificationCode: "Ys123456", //固定的统一验证码

      dibangquUrl: "", //地磅区视频url
      duiliaoquUrl: "", //堆料区视频url
      fajiaochiUrl: "", //发酵区视频url
      chuchangquUrl: "", //发酵区视频url
      zhuanghuoquUrl: "", //发酵区视频url
      markerIcon,

      videomarkers: [],
      clickpositon: [118.59866202, 35.62440318], //marker点击赋值
      serviceList: [], //服务主体列表
    };
  },

  components: {
    Seller,
    Rank,
    Stock,
    TfProQualityVue, //土肥质量统计表
    Dispatch,
    Map,
    Videos,
  },

  created() {
    this.dibangquUrl = "";
    this.duiliaoquUrl = "";
    this.fajiaochiUrl = "";
    this.chuchangquUrl = "";
    this.zhuanghuoquUrl = "";

    this.initServiceList();
  },
  mounted() {
    //this.initVideoPlayer();
    this.getToken();
    this.initServiceSujOnMap();
  },
  watch: {
    $route: "",
  },
  methods: {
    getToken() {
      let that = this;

      that.$axios
        .get(
          "http://119.3.221.188:8808/tfDbOperator-2.0/tfYstoken/selectOne?appname=tf"
        )
        .then((res) => {
          var expireTime = new Date(Number(res.data.expiretime));
          var nowTime = new Date();
          if (Date.parse(expireTime) >= Date.parse(nowTime)) {
            //比较时间
            //未过期直接从数据库中获取token
            that.accesstoken = res.data.accesstoken;
          } else {
            //过期重新获取token
            var postData = that.$qs.stringify({
              appKey: "fc32379c6546498eab48309a71e368f8", //授权码
              appSecret: "99ac666f444de1a36b603fe8a3e4d9e1", //设备号
            });

            that.$axios
              .post("https://open.ys7.com/api/lapp/token/get", postData)
              .then((res) => {
                var postData = that.$qs.stringify({
                  appname: "tf",
                  accesstoken: res.data.data.accessToken,
                  expiretime: res.data.data.expireTime,
                });
                that.$axios
                  .post(
                    "http://119.3.221.188:8808/tfDbOperator-2.0/tfYstoken/update",
                    postData
                  )
                  .then((res) => {
                    that.accesstoken = res.data.accesstoken;
                  })
                  .catch((err) => {});
              })
              .catch((err) => {});
          }
        })
        .catch((err) => {
          this.$message.error("数据库中找不到accesstoken");
        });
    },

    /**
     * 根据设备号获取播放地址
     */
    queryVideoUrl(deviceSR) {
      let that = this;
      var postData = qs.stringify({
        accessToken: that.accesstoken, //授权码
        deviceSerial: deviceSR, //设备号
        code: that.VerificationCode, //验证码
        quality: 2, //视频清晰度，1-高清（主码流）、2-流畅（子码流）
      });
      return new Promise((resolve, reject) => {
        that.$axios
          .post("https://open.ys7.com/api/lapp/v2/live/address/get", postData)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
            console.log(err);
          });
      });
    },

    //退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear();
      // 跳转登录页面
      this.$router.push("/login");
    },

    /**
     * 地图加载服务主体位置
     */
    go_home() {
      let routeUrl = this.$router.resolve({
        path: "/home",
      });
      window.open(routeUrl.href, "_blank");
    },

    go_video() {
      let routeUrl = this.$router.resolve({
        path: "/videos",
      });
      window.open(routeUrl.href, "_blank");
    },

    go_car() {
      let routeUrl = this.$router.resolve({
        path: "/map",
      });
      window.open(routeUrl.href, "_blank");
    },

    initServiceSujOnMap() {},

    async initServiceList() {
      this.loading = true;
      try {
        this.ServiceListRes = await this.queryServiceList();

        var averageLag = 0,
          averageLng = 0;

        for (var j = 0; j < this.ServiceListRes.length; j++) {
          let _diviceList = [];
          if (this.ServiceListRes[j].duiliaoqudn) {
            _diviceList.push({
              divicePlace: "堆料区",
              deviceSerial: this.ServiceListRes[j].duiliaoqudn,
            });
          }
          if (this.ServiceListRes[j].dibangqudn) {
            _diviceList.push({
              divicePlace: "地磅区",
              deviceSerial: this.ServiceListRes[j].dibangqudn,
            });
          }
          if (this.ServiceListRes[j].fajiaochidn) {
            _diviceList.push({
              divicePlace: "发酵池",
              deviceSerial: this.ServiceListRes[j].fajiaochidn,
            });
          }

          if (this.ServiceListRes[j].chuchangqudn) {
            _diviceList.push({
              divicePlace: "出厂区",
              deviceSerial: this.ServiceListRes[j].chuchangqudn,
            });
          }

          if (this.ServiceListRes[j].zhuanghuoquodn) {
            _diviceList.push({
              divicePlace: "装货区",
              deviceSerial: this.ServiceListRes[j].zhuanghuoquodn,
            });
          }

          if (
            this.ServiceListRes[j].servicelag &&
            this.ServiceListRes[j].servicelng
          ) {
            averageLag += parseFloat(this.ServiceListRes[j].servicelag);
            averageLng += parseFloat(this.ServiceListRes[j].servicelng);
            this.videomarkers.push({
              key: this.ServiceListRes[j].serviceid,
              name: this.ServiceListRes[j].serviceshortnm,
              position: [
                this.ServiceListRes[j].servicelng,
                this.ServiceListRes[j].servicelag,
              ],
              devicelist: _diviceList,
            });
          }
        }
        this.centerposition = [
          averageLng / this.videomarkers.length,
          averageLag / this.videomarkers.length,
        ];

        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },

    /**
     * 根获取服务主体列表
     */
    queryServiceList() {
      const params = { offset: 0, limit: 30 };
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfServicesubject/selectAllServiceSub",
            { params }
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // 点击全屏
    clickFullscreen() {
      if (!screenfull.isEnabled) {
        this.$message({
          message: "you browser can not work",
          type: "warning",
        });
        return false;
      }
      screenfull.toggle();
    },

    // 打开监控窗体
    async onMarkerClick(p) {
      this.clickpositon = [p.lnglat.lng, p.lnglat.lat];

      this.showInfoWindow = !this.showInfoWindow;
      var devicelist = p.target._opts.extData;

      this.duiliaoqudn = devicelist[0].deviceSerial;
      this.dibangqudn = devicelist[1].deviceSerial;
      this.fajiaochidn = devicelist[2].deviceSerial;
      this.chuchangqudn = devicelist[3].deviceSerial;
      this.zhuanghuoquodn = devicelist[4].deviceSerial;

      let dlqdata = await this.queryVideoUrl(this.duiliaoqudn);
      if (dlqdata.code == "200") {
        this.duiliaoquUrl = dlqdata.data.url;
      } else {
        this.duiliaoquUrl = "";
      }

      let dbqdata = await this.queryVideoUrl(this.dibangqudn);
      if (dbqdata.code == "200") {
        this.dibangquUrl = dbqdata.data.url;
      } else {
        this.dibangquUrl = "";
      }

      let fjcdata = await this.queryVideoUrl(this.fajiaochidn);
      if (fjcdata.code == "200") {
        this.fajiaochiUrl = fjcdata.data.url;
      } else {
        this.fajiaochiUrl = "";
      }

      let ccqdata = await this.queryVideoUrl(this.chuchangqudn);
      if (ccqdata.code == "200") {
        this.chuchangquUrl = ccqdata.data.url;
      } else {
        this.chuchangquUrl = "";
      }

      let zhqdata = await this.queryVideoUrl(this.zhuanghuoquodn);
      if (zhqdata.code == "200") {
        this.zhuanghuoquUrl = zhqdata.data.url;
      } else {
        this.zhuanghuoquUrl = "";
      }
    },

    /**
     * 打开堆料区视频窗体
     */
    openduiliaoquVideo() {
      let that = this;

      if (that.duiliaoquUrl) {
        that.vediodialogVisible = true;
        if (that.videoPlayer != null) {
          that.videoPlayer.stop().then(() => {
            that.videoPlayer.play(that.duiliaoquUrl);
          });
        } else {
          that.videoPlayer = new EZUIKit.EZUIKitPlayer({
            autoplay: true,
            id: "videoDiv",
            accessToken: that.accesstoken,
            url: that.duiliaoquUrl,
            template: "security", // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
            footer: ["broadcast", "fullScreen"],
            width: "700px",
            height: "500px",
          });
          that.videoPlayer.play();
        }
      } else {
        this.$message({
          showClose: true,
          message: "获取播放地址失败,请确认摄像头DN码配置正确",
          type: "warning",
        });
      }
    },

    /**
     * 打开地磅区视频窗体
     */
    openguobangquVideo() {
      let that = this;
      if (that.dibangquUrl) {
        that.vediodialogVisible = true;
        if (that.videoPlayer != null) {
          that.videoPlayer.stop().then(() => {
            that.videoPlayer.play(that.dibangquUrl);
          });
        } else {
          that.videoPlayer = new EZUIKit.EZUIKitPlayer({
            autoplay: true,
            id: "videoDiv",
            accessToken: that.accesstoken,
            url: that.dibangquUrl,
            template: "security", // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
            footer: ["broadcast", "fullScreen"],
            width: "700px",
            height: "500px",
          });
          that.videoPlayer.play();
        }
      } else {
        this.$message({
          showClose: true,
          message: "获取播放地址失败,请确认摄像头DN码配置正确",
          type: "warning",
        });
      }
    },
    /**
     * 打开发酵池视频窗体
     */
    openfajiaochiVideo() {
      let that = this;

      if (that.fajiaochiUrl) {
        that.vediodialogVisible = true;
        if (that.videoPlayer != null) {
          that.videoPlayer.stop().then(() => {
            that.videoPlayer.play(that.fajiaochiUrl);
          });
        } else {
          that.videoPlayer = new EZUIKit.EZUIKitPlayer({
            autoplay: true,
            id: "videoDiv",
            accessToken: that.accesstoken,
            url: that.fajiaochiUrl,
            template: "security", // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
            footer: ["broadcast", "fullScreen"],
            width: "700px",
            height: "500px",
          });
          that.videoPlayer.play();
        }
      } else {
        this.$message({
          showClose: true,
          message: "获取播放地址失败,请确认摄像头DN码配置正确",
          type: "warning",
        });
      }
    },

    openchuchangquVideo() {
      let that = this;

      if (that.chuchangquUrl) {
        that.vediodialogVisible = true;
        if (that.videoPlayer != null) {
          that.videoPlayer.stop().then(() => {
            that.videoPlayer.play(that.chuchangquUrl);
          });
        } else {
          that.videoPlayer = new EZUIKit.EZUIKitPlayer({
            autoplay: true,
            id: "videoDiv",
            accessToken: that.accesstoken,
            url: that.chuchangquUrl,
            template: "security", // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
            footer: ["broadcast", "fullScreen"],
            width: "700px",
            height: "500px",
          });
          that.videoPlayer.play();
        }
      } else {
        this.$message({
          showClose: true,
          message: "获取播放地址失败,请确认摄像头DN码配置正确",
          type: "warning",
        });
      }
    },

    openzhuanghuoquVideo() {
      let that = this;

      if (that.zhuanghuoquUrl) {
        that.vediodialogVisible = true;
        if (that.videoPlayer != null) {
          that.videoPlayer.stop().then(() => {
            that.videoPlayer.play(that.zhuanghuoquUrl);
          });
        } else {
          that.videoPlayer = new EZUIKit.EZUIKitPlayer({
            autoplay: true,
            id: "videoDiv",
            accessToken: that.accesstoken,
            url: that.zhuanghuoquUrl,
            template: "security", // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
            footer: ["broadcast", "fullScreen"],
            width: "700px",
            height: "500px",
          });
          that.videoPlayer.play();
        }
      } else {
        this.$message({
          showClose: true,
          message: "获取播放地址失败,请确认摄像头DN码配置正确",
          type: "warning",
        });
      }
    },

    //关闭弹框的事件
    closeDialog() {
      this.vediodialogVisible = false;
      if (this.videoPlayer != null) {
        this.videoPlayer.stop();
      }
    },
  },
};
</script>


<style lang="less" scoped>
// infowindow
.info-window-content {
  // position: relative;
  width: 300px;
  height: 50px;
  background-color: transparent;
}

// infowindow视频播放按钮样式上
.info-window-VdBtn-left {
  border-radius: 30px;
  align-content: left;
  font-size: 12px;
  width: 90px;
  height: 25px;
  padding-left: 15px;
  padding-top: 6px;
}

.info-window-VdBtn-top {
  border-radius: 30px;
  align-content: left;
  font-size: 12px;
  width: 90px;
  height: 25px;
  padding-left: 15px;
  padding-top: 6px;
  margin-top: 0px;
}
.info-window-VdBtn-right {
  border-radius: 30px;
  align-content: left;
  font-size: 12px;
  width: 90px;
  height: 25px;
  padding-left: 15px;
  padding-top: 6px;

  margin-top: 0px;
}
.info-window-VdBtn-bottom {
  border-radius: 30px;
  align-content: left;
  font-size: 12px;
  width: 90px;
  height: 25px;
  padding-left: 15px;
  padding-top: 6px;
  margin-top: 10px;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
// 全屏样式的定义

.screen-container {
  width: 100%;
  height: 100%;
  padding: 10px 20px;
  background-image: url("../assets/image/bg.jpg");
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  // background-color: #0b1d3c;
  // border-bottom: 2px solid #377cd4;
  position: relative;
  .title-mid {
    height: 100%;
    width: 60%;
    // background: url('../assets/image/yinan_login_logo.png') center center no-repeat;
    // position: absolute;
    // left: 50%;
    // top: 50%;
    // font-size: 20px;
    // transform: translate(-50%, -50%);
  }
  img {
    width: 55%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    position: absolute;
    right: 0px;
    top: 40px;
    transform: translateY(-50%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }

  // 全屏样式的定义
  .fullscreen {
    margin-left: 10px;
    margin-top: 30px;
    // background-image: url("../assets/image/fullscreen.png");
    // background-repeat: no-repeat;
    // background-size: 100% 100%;
    // -moz-background-size: 100% 100%;
    // background-color: white;

    .fullscreenbtn {
      background-color: transparent;
      font-size: 150%;
      border-color: transparent;
    }
  }

  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    a {
      text-decoration: none;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;

  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      width: 100%;
      height: 56%;
    }

    #left-bottom {
      height: 30%;
      margin-top: 15px;
    }
  }
  .screen-middle {
    height: 100%;
    width: 60%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
    }
    #middle-bottom {
      margin-top: 15px;
      width: 100%;
      height: 30%;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 56%;
    }
    #right-bottom {
      height: 30%;
      margin-top: 15px;
      // background-color: coral;
    }
  }
}

.screen-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 40px;
  background-color: transparent;
  text-align: center;
  font-size: 13px;
  color: #708090;
}

.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}

.header-buttons {
  // display: flex;
  position: absolute;

  top: 40px;
}

/deep/ .logout {
  color: #87cefa;
  border: 1px solid grey;
  background-color: rgba(255, 255, 255, 0.05);
}
.logout:hover {
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}
.logou:focus {
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}

/deep/ .go_home {
  width: 30%;
  color: #87cefa;
  border: 1px solid grey;
  background-color: rgba(255, 255, 255, 0.05);
  // position: absolute;

  transform: translateY(-50%);
}
.go_home:hover {
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}
.go_home:focus {
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}
</style>