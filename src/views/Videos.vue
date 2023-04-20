<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/image/yinan_login_logo.png" alt="" />
      </div>
      <div>
        <!-- 右上角用户+退出 -->
        <div class="dropdown">
          <h1><i class="el-icon-user-solid"></i></h1>
          <el-dropdown>
            <span class="el-dropdown-link">
              {{ jurisdiction[sessionstorage_userInfo.authority] }} |
              {{ sessionstorage_userInfo.username
              }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                ><span @click="go_dashboard">数据大屏</span></el-dropdown-item
              >
              <el-dropdown-item divided
                ><span @click="logout">退出登录</span></el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" height="100vh">
        <!-- 侧边栏菜单区 -->
        <el-menu
          class="el-menu-vertical-demo"
          background-color="rgb(42, 48, 62)"
          text-color="#FFFFFF"
          active-text-color="#FFFFFF"
          default-openeds="[1]"
        >
          <!-- 功能4 数据管理-->
          <el-menu-item
            v-for="(item, index) in serviceList"
            :key="index"
            :name="item.servicename"
            :value="item.serviceid"
            :title="item.servicename"
            @click="changeService(item)"
          >
            <span slot="title">{{ item.servicename }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main>
        <div class="videoPlace">
          <div class="title">{{ currentservicename }}</div>
          <div class="video">
            <div id="duiliaoqu" class="quarter-div">堆料区</div>
            <div id="dibangqu" class="quarter-div">地磅区</div>
            <div id="fajiaochi" class="quarter-div">发酵池</div>
            <div id="zhuanghuoqu" class="quarter-div">装货区</div>
            <div id="chuchangqu" class="quarter-div">出厂区</div>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import EZUIKit from "@/plugins/ezuikit.js";
import qs from "qs";

export default {
  components: {},
  data() {
    return {
      accesstoken:
        "at.acjm73peayezyn796g2snkyw57tb2sp5-7avzxt59gu-09rkey6-j6gksxufv", //一周更新，后期需用api获取
      vedioPlayer: null, //视频播放器
      VerificationCode: "Ys123456", //固定的统一验证码
      serviceList: [],
      duiliaoquPlayer: null,
      dibangquPlayer: null,
      fajiaochiPlayer: null,
      zhuanghuoquPlayer: null,
      chuchangquPlayer: null,
      currentservicename: "",

      jurisdiction: {
        //权限分类
        enterpriseadmin: "企业用户",
        superadmin: "超级管理员",
      },
      sessionstorage_userInfo: {
        //session存储用户
        username: window.sessionStorage.getItem("username"), //用户名
        authority: window.sessionStorage.getItem("jurisdiction"), //权限
      },
    };
  },

  created() {},
  mounted() {
    this.getToken();
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
            this.initVideoUrlList();
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
                    this.initVideoUrlList();
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
    //退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear();
      // 跳转登录页面
      this.$router.push("/login");
    },

    //返回数据大屏
    go_dashboard() {
      this.$router.push("/screen");
    },

    /**
     * 获取视频播放地址并播放(默认播放第一个服务主体视频)
     */
    async initVideoUrlList() {
      let that = this;
      that.loading = true;
      try {
        that.serviceList = [];
        let serviceRes = await that.queryServiceList();

        for (var j = 0; j < serviceRes.length; j++) {
          let _diviceList = [];
          if (!!serviceRes[j].duiliaoqudn) {
            _diviceList.push({
              divicePlace: "堆料区",
              deviceSerial: serviceRes[j].duiliaoqudn,
            });
          }
          if (!!serviceRes[j].dibangqudn) {
            _diviceList.push({
              divicePlace: "地磅区",
              deviceSerial: serviceRes[j].dibangqudn,
            });
          }
          if (!!serviceRes[j].fajiaochidn) {
            _diviceList.push({
              divicePlace: "发酵池",
              deviceSerial: serviceRes[j].fajiaochidn,
            });
          }

          if (!!serviceRes[j].chuchangqudn) {
            _diviceList.push({
              divicePlace: "出厂区",
              deviceSerial: serviceRes[j].chuchangqudn,
            });
          }

          if (!!serviceRes[j].zhuanghuoquodn) {
            _diviceList.push({
              divicePlace: "装货区",
              deviceSerial: serviceRes[j].zhuanghuoquodn,
            });
          }

          that.serviceList.push({
            serviceid: serviceRes[j].serviceid,
            servicename: serviceRes[j].servicename,
            devicelist: _diviceList,
          });
        }

        //筛选出第一个服务主体视频序列号
        let playdeviceSerialList = [];
        for (let ss of that.serviceList) {
          if (ss.devicelist.length > 0) {
            that.currentservicename = ss.servicename;
            for (let dc of ss.devicelist) {
              playdeviceSerialList.push({
                deviceSerial: dc.deviceSerial,
                divicePlace: dc.divicePlace,
              });
            }
            break;
          }
          // if (playdeviceSerialList.length > 0) break;
        }

        for (let ds of playdeviceSerialList) {
          let _urldata = await that.queryVideoUrl(ds.deviceSerial);
          if (_urldata.code == "200") {
            if (ds.divicePlace == "堆料区") {
              if (that.duiliaoquPlayer != null) {
                that.duiliaoquPlayer.play(_urldata.data.url);
              } else {
                that.duiliaoquPlayer = new EZUIKit.EZUIKitPlayer({
                  autoplay: true,
                  id: "duiliaoqu",
                  accessToken: that.accesstoken,
                  url: _urldata.data.url,
                  template: "standard",
                });
              }
            } else if (ds.divicePlace == "发酵池") {
              if (that.fajiaochiPlayer != null) {
                that.fajiaochiPlayer.play(_urldata.data.url);
              } else {
                that.fajiaochiPlayer = new EZUIKit.EZUIKitPlayer({
                  autoplay: true,
                  id: "fajiaochi",
                  accessToken: that.accesstoken,
                  url: _urldata.data.url,
                  template: "standard",
                });
              }
            } else if (ds.divicePlace == "地磅区") {
              if (that.dibangquPlayer != null) {
                that.dibangquPlayer.play(_urldata.data.url);
              } else {
                that.dibangquPlayer = new EZUIKit.EZUIKitPlayer({
                  autoplay: true,
                  id: "dibangqu",
                  accessToken: that.accesstoken,
                  url: _urldata.data.url,
                  template: "standard",
                });
              }
            } else if (ds.divicePlace == "出厂区") {
              if (that.chuchangquPlayer != null) {
                that.chuchangquPlayer.play(_urldata.data.url);
              } else {
                that.chuchangquPlayer = new EZUIKit.EZUIKitPlayer({
                  autoplay: true,
                  id: "chuchangqu",
                  accessToken: that.accesstoken,
                  url: _urldata.data.url,
                  template: "standard",
                });
              }
            } else if (ds.divicePlace == "装货区") {
              if (that.zhuanghuoquPlayer != null) {
                that.zhuanghuoquPlayer.play(_urldata.data.url);
              } else {
                that.zhuanghuoquPlayer = new EZUIKit.EZUIKitPlayer({
                  autoplay: true,
                  id: "zhuanghuoqu",
                  accessToken: that.accesstoken,
                  url: _urldata.data.url,
                  template: "standard",
                });
              }
            }
          }
        }

        that.loading = false;
      } catch (error) {
        console.log(error);
        that.loading = false;
      }
    },

    /**
     * 服务主体切换
     */
    async changeService(item) {
      // console.log(item);
      // item.serviceid;
      // item.servicename;

      let that = this;
      that.currentservicename = item.servicename;

      if (that.duiliaoquPlayer != null) that.duiliaoquPlayer.stop();
      if (that.fajiaochiPlayer != null) that.fajiaochiPlayer.stop();
      if (that.dibangquPlayer != null) that.dibangquPlayer.stop();
      if (that.zhuanghuoquPlayer != null) that.zhuanghuoquPlayer.stop();
      if (that.chuchangquPlayer != null) that.chuchangquPlayer.stop();

      for (let ds of item.devicelist) {
        let _urldata = await that.queryVideoUrl(ds.deviceSerial);
        if (_urldata.code == "200") {
          if (ds.divicePlace == "堆料区") {
            if (that.duiliaoquPlayer != null) {
              that.duiliaoquPlayer.play(_urldata.data.url);
            } else {
              that.duiliaoquPlayer = new EZUIKit.EZUIKitPlayer({
                autoplay: true,
                id: "duiliaoqu",
                accessToken: that.accesstoken,
                url: _urldata.data.url,
                template: "standard",
              });
            }
          } else if (ds.divicePlace == "发酵池") {
            if (that.fajiaochiPlayer != null) {
              that.fajiaochiPlayer.play(_urldata.data.url);
            } else {
              that.fajiaochiPlayer = new EZUIKit.EZUIKitPlayer({
                autoplay: true,
                id: "fajiaochi",
                accessToken: that.accesstoken,
                url: _urldata.data.url,
                template: "standard",
              });
            }
          } else if (ds.divicePlace == "地磅区") {
            if (that.dibangquPlayer != null) {
              that.dibangquPlayer.play(_urldata.data.url);
            } else {
              that.dibangquPlayer = new EZUIKit.EZUIKitPlayer({
                autoplay: true,
                id: "dibangqu",
                accessToken: that.accesstoken,
                url: _urldata.data.url,
                template: "standard",
              });
            }
          } else if (ds.divicePlace == "出厂区") {
            if (that.chuchangquPlayer != null) {
              that.chuchangquPlayer.play(_urldata.data.url);
            } else {
              that.chuchangquPlayer = new EZUIKit.EZUIKitPlayer({
                autoplay: true,
                id: "chuchangqu",
                accessToken: that.accesstoken,
                url: _urldata.data.url,
                template: "standard",
              });
            }
          } else if (ds.divicePlace == "装货区") {
            if (that.zhuanghuoquPlayer != null) {
              that.zhuanghuoquPlayer.play(_urldata.data.url);
            } else {
              that.zhuanghuoquPlayer = new EZUIKit.EZUIKitPlayer({
                autoplay: true,
                id: "zhuanghuoqu",
                accessToken: that.accesstoken,
                url: _urldata.data.url,
                template: "standard",
              });
            }
          }
        }
      }
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

            console.log(res.data);
          })
          .catch((err) => {
            reject(err);
            console.log(err);
          });
      });
    },

    queryAccessToken() {
      let that = this;
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
     * 根获取服务主体列表
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
  },
};
</script>


<style lang="less" scoped>
.quarter-div {
  width: 32%;
  height: 48%;
  background-color: black;
  margin: 1px;
  margin-top: 10px;
  margin-left: 10px;
  float: left;
}

.videoPlace {
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 5px 5px 2px rgba(0, 0, 0, 0.3);
  /* padding: 5px; */
  text-align: center;
}

.title {
  width: 100%;
  height: 3%;
  display: inline-block;
  text-align: center;
  font-size: 20px;
  font-family: SimHei;
  padding-top: 10px;
}

.video {
  width: 100%;
  height: 95%;
  display: inline-block;
  background-color: white;
  /* padding: 5px; */
  text-align: center;
}

.home-container {
  height: 100%;
}

//右上角下拉
.dropdown {
  color: #52f8fd;
  .el-dropdown-link {
    cursor: pointer;
    color: #52f8fd;
  }
  .el-icon-user-solid {
    margin-right: 15px;
  }
}

.el-header {
  background-color: rgb(42, 48, 62);
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    align-items: center;
  }
}
.el-aside {
  background-color: rgb(42, 48, 62);
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: rgb(246, 246, 246);
}
</style>