<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/image/yinan_login_logo.png"
             alt="" />
      </div>
      <!-- 右上角用户+退出 -->
      <div class="dropdown">
        <h1><i class="el-icon-user-solid"></i></h1>
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ jurisdiction[sessionstorage_userInfo.authority]}} | {{sessionstorage_userInfo.username}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item><span @click="go_dashboard">数据大屏</span></el-dropdown-item>
            <el-dropdown-item divided><span @click="logout">退出登录</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 主体内容 -->
      <el-main>
        <div style="width: 100%; height: 100%">
          <!-- 视频播放窗体 -->
          <el-dialog title="车载视频监控"
                     :visible.sync="vediodialogVisible"
                     center
                     :append-to-body="false"
                     :lock-scroll="false"
                     :modal="false">
            <video id="videoElement"
                   controls
                   autoplay
                   muted
                   width="100%"
                   height="500px"></video>
          </el-dialog>

          <!-- 车辆轨迹时间选择框 -->
          <el-dialog title="请选择轨迹时间范围"
                     :visible.sync="trackdialogVisible"
                     center
                     :append-to-body="false"
                     :lock-scroll="false"
                     :modal="false"
                     width="30vw">
            <el-date-picker v-model="trackStarttime"
                            type="datetime"
                            placeholder="选择起始时间"
                            :picker-options="start_Date"
                            format="yyyy-MM-dd HH:mm:ss"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            class="trackTimeStyle">
            </el-date-picker>

            <el-date-picker v-model="trackEndtime"
                            type="datetime"
                            placeholder="选择结束时间"
                            :picker-options="end_Date"
                            format="yyyy-MM-dd HH:mm:ss"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            class="trackTimeStyle">
            </el-date-picker>
            <span slot="footer">
              <el-button @click="carTrackConfirm()">确定</el-button>
              <el-button @click="carTrackCancel()">取消</el-button>
            </span>
          </el-dialog>
          <div id="map"
               style="width: 100%; height: 100%">
            <!-- 地图框 -->
            <div id="mapDiv"
                 class="mapDiv"
                 ref="mapDiv"></div>
          </div>

          <div class="opencarsBtn"
               @click="fadeCarDiv()">
            <!-- <el-button  @click="fadeCarDiv()">车队列表</el-button> -->
            <img :src="carlistIcon_url"
                 alt="..." />
          </div>

          <transition name="carfade">
            <!-- 车辆信息框 -->
            <div id="carsDiv"
                 class="carsDiv"
                 ref="carsDiv"
                 v-if="carDivshow">
              <!-- 车辆状态选择下拉列表 -->
              <div style="
                  width: 100%;
                  font-size: 12px;
                  color: #708090;
                  margin-top: 10px;
                  text-align: center;
                ">
                <el-select v-model="casStatus"
                           clearable
                           placeholder="请选择"
                           style="width: 90%; margin-top: 10px"
                           @change="changeCarlist">
                  <el-option v-for="(item, index) in carStatusOptions"
                             :key="index"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <!-- 分割线 -->
              <el-divider content-position="left">设备列表</el-divider>
              <!-- 设备列表 -->
              <div class="carsList"
                   id="carsList">
                <ul>
                  <li v-for="(list, index) in carlists"
                      v-bind:key="list.id"
                      style="margin-top: 10px; margin-right: 5px; font-size: 12px">
                    {{ list.title }}
                    <el-button type="car"
                               class="carBtn"
                               @click="playCarVideo(index)">视频</el-button>
                    <el-button type="car"
                               class="carBtn"
                               @click="showTrackDialog()">轨迹</el-button>
                    <el-button type="car"
                               class="carBtn"
                               @click="getCarPosBeforeToken()">定位</el-button>
                  </li>
                </ul>
              </div>

              <!-- 分割线 -->
              <el-divider content-position="left">设备数量</el-divider>

              <div style="margin-left: 20px; margin-right: 20px; top: 0px">
                设备共计
                <span style="color: blue">{{ allCarlists.length }}</span>
                台。其中
                <span style="color: green">{{ count_driving }}</span>
                台处于行驶状态，
                <span style="color: red">{{ count_stop }}</span>
                台处于静止状态，
                <span style="color: lightgrey">{{ count_offline }}</span>
                台处于离线状态。
              </div>
            </div>
          </transition>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>
 
<script>
import TiandituMap from '@/plugins/tianditu-map.js'

// import flvjs from "flv.js";
import flvjs from 'flv.js/dist/flv.min.js'
import Axios from 'axios'

import zkIcon from '../assets/image/zkCarlist.png'
import sqIcon from '../assets/image/sqCarlist.png'
import carIcon from '../assets/image/car.png'
var map, points, line

export default {
  components: {},
  data() {
    return {
      zoom: '20',

      line: '',
      T: '',
      lay: '',

      drivingRoute: '',
      startIcon: '',
      endIcon: '',
      config: '',
      iconMaker: [],
      myIcon: '',

      jurisdiction: {
        //权限分类
        enterpriseadmin: '企业用户',
        superadmin: '超级管理员',
      },
      sessionstorage_userInfo: {
        //session存储用户
        username: window.sessionStorage.getItem('username'), //用户名
        authority: window.sessionStorage.getItem('jurisdiction'), //权限
      },

      carStatusOptions: [
        //车辆状态列表
        {
          value: 'car_all',
          label: '全部',
        },
        {
          value: 'car_driving',
          label: '行驶',
        },
        {
          value: 'car_offline',
          label: '离线',
        },
        {
          value: 'car_stop',
          label: '静止',
        },
      ],
      casStatus: '全部',

      carIndex: 0,
      carnum: '鲁Q34892',
      allCarlists: [
        //所有设备列表
        { id: 0, title: '鲁Q34892', status: 'car_driving' },
        { id: 1, title: '鲁Q45892', status: 'car_offline' },
        { id: 2, title: '鲁Q98945', status: 'car_offline' },
        { id: 3, title: '鲁Q38996', status: 'car_offline' },
        { id: 4, title: '鲁Q1289M', status: 'car_stop' },
        { id: 5, title: '鲁Q45892', status: 'car_stop' },
        { id: 6, title: '鲁Q7789P', status: 'car_stop' },
        { id: 7, title: '鲁Q00892', status: 'car_stop' },
      ],

      carlists: [], //当前车队列表（多用于根据下拉列表切换当前数组）

      nextTodoId: 9,
      newAddText: '鲁Q34892',

      cdgjToken: '', //车队管家token
      carRoutepoints: [], //车辆路径上的点
      carPositon: null, //车辆当前位置
      carTrack: null, //车辆跟踪路径
      carTrackArr: [],
      trackdialogVisible: false, //控制车辆轨迹时间选择框显示
      trackStarttime: '', //车辆轨迹起始时间
      trackEndtime: '', //车辆轨迹结束时间
      start_Date: {
        //定义时间选择器格式
        disabledDate: (time) => {
          if (this.trackEndtime != '') {
            return (
              time.getTime() > Date.now() || time.getTime() > this.trackEndtime
            )
          } else {
            return time.getTime() > Date.now()
          }
        },
      },
      end_Date: {
        //定义时间选择器格式
        disabledDate: (time) => {
          return (
            time.getTime() < this.trackStarttime || time.getTime() > Date.now()
          )
        },
      },

      flvPlayer: null, //flv播放器
      vediodialogVisible: false, //控制播放器窗口显示

      carlistIcon_url: sqIcon, //车队列表显示隐藏按钮icon
      carDivshow: true, //车队列表显示隐藏控制
      carNumStatistic: '',
      count_driving: 0, //行驶中个数
      count_stop: 0, //静止中个数
      count_offline: 0, //离线中个数
    }
  },
  created() {
    this.startIcon = 'http://lbs.tianditu.gov.cn/images/bus/start.png'
    this.endIcon = 'http://lbs.tianditu.gov.cn/images/bus/end.png'
    this.myIcon = 'http://lbs.tianditu.gov.cn/images/bus/end.png'
    this.carlists = this.allCarlists
    this.getcarNumStatistic()
  },
  mounted() {
    this.initMap()
  },
  watch: {
    $route: '',
  },
  methods: {
    //退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转登录页面
      this.$router.push('/login')
    },

    //返回数据大屏
    go_dashboard() {
      this.$router.push('/screen')
    },

    /**
     * 加载天地图
     */
    initMap() {
      window.onload = function () {
        console.log(11111)
      }
      TiandituMap.init()
        .then((T) => {
          this.T = T
          this.zoom = 12
          var imageURL =
            'http://t0.tianditu.gov.cn/vec_c/wmts?' +
            'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles' +
            '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=3e6299f68d3fbfd38e2439c8aa782944'

          // 创建自定义图层对象
          this.lay = new T.TileLayer(imageURL, { minZoom: 1, maxZoom: 18 })
          var config = { layers: [this.lay] }
          map = new T.Map(this.$refs.mapDiv, config) // 初始化地图对象

          map.centerAndZoom(new T.LngLat(118.47061, 35.55131), this.zoom) // 设置显示地图的中心点和级别
          var ctrl = new T.Control.MapType({ position: T_ANCHOR_TOP_RIGHT }) // 初始化地图类型选择控件
          map.addControl(ctrl) //添加地图选择控件

          //创建缩放平移控件对象
          var control = new T.Control.Zoom({ position: T_ANCHOR_TOP_RIGHT })
          //添加缩放平移控件
          map.addControl(control)

          map.setStyle('black')

          //this.getCarPosiont(); //获取车辆位置
        })
        .catch((error) => {
          console.log(error)
        })
    },

    /**
     * 车辆路径跟踪
     */
    runCarRoute() {
      var startIcon = 'http://lbs.tianditu.gov.cn/images/bus/start.png' //起点图标
      var endIcon = 'http://lbs.tianditu.gov.cn/images/bus/end.png' //终点图标

      var startMarker = new T.Marker(new T.LngLat(116.306533, 39.890581), {
        icon: new T.Icon({
          iconUrl: startIcon,
          iconSize: new T.Point(44, 34),
          iconAnchor: new T.Point(12, 31),
        }),
      })
      map.addOverLay(startMarker)
      var endMarker = new T.Marker(new T.LngLat(116.789025, 39.869762), {
        icon: new T.Icon({
          iconUrl: endIcon,
          iconSize: new T.Point(44, 34),
          iconAnchor: new T.Point(12, 31),
        }),
      })
      map.addOverLay(endMarker)

      // 创建图片对象
      var icon = new T.Icon({
        iconUrl: 'http://api.tianditu.gov.cn/img/map/markerA.png',
        iconSize: new T.Point(19, 27),
        iconAnchor: new T.Point(10, 25),
      })

      this.carRoutepoints = []
      this.carRoutepoints.push(
        new T.LngLat(116.306533, 39.890581),
        new T.LngLat(116.403694, 39.91582),
        new T.LngLat(116.475558, 39.962733),
        new T.LngLat(116.555472, 39.916706),
        new T.LngLat(116.629025, 39.869762),
        new T.LngLat(116.699025, 39.869762),
        new T.LngLat(116.749025, 39.869762),
        new T.LngLat(116.759025, 39.869762),
        new T.LngLat(116.769025, 39.869762),
        new T.LngLat(116.779025, 39.869762),
        new T.LngLat(116.789025, 39.869762)
      )
      var pts = this.carRoutepoints //通过驾车实例，获得一系列点的数组
      var paths = pts.length //获得有几个点

      var carMk = new T.Marker(pts[0], { icon: icon }) //地图添加自定义标识
      map.addOverLay(carMk)
      // var carInfoWin = new T.InfoWindow("信息窗口");
      // carMk.openInfoWindow(carInfoWin);
      // map.addOverLay(carInfoWin);

      points = [pts[0], pts[1]]
      line = new T.Polyline(points, {
        color: '#2C64A7',
        width: 5,
        opacity: 0.7,
        // strokeStyle: 'dashed' //边线的样式，solid或dashed。
      }) //创建线对象

      map.addOverLay(line) //添加到地图中
      carMk.setLngLat(pts[1])

      function resetMkPoint(i) {
        carMk.setLngLat(pts[i])
        points = [pts[i - 1], pts[i]]
        line = new T.Polyline(points, {
          color: '#2C64A7',
          width: 5,
          opacity: 0.7,
          //strokeStyle: 'dashed'
        }) //创建线对象
        map.addOverLay(line) //添加到地图中
        if (i < paths) {
          setTimeout(function () {
            i++
            resetMkPoint(i)
          }, 500)
        }
      }
      setTimeout(function () {
        resetMkPoint(2)
      }, 1000)
    },

    /**
     * 显示车辆轨迹对话框
     */
    showTrackDialog() {
      this.trackdialogVisible = true
    },

    /**
     * 先获取token再获取车辆轨迹
     */
    getCarLngLatsAfterToken() {
      var that = this
      var starttime = that.trackStarttime
      var endtime = that.trackEndtime
      var vehicleId = 'd6e4f62cada'
      Axios.get(
        'https://api.cheoa.cn/interface?method=user.pcLogin&userName=18622960127&password=wlzj4839484&store=pc'
      )
        .then(function (response) {
          if (response.data.code == 100) {
            var tk = response.data.data.token
            var getCarTackUrl =
              'https://api.cheoa.cn/interface?method=monitor.getRangeLngLats&token=' +
              tk +
              '&vehicleId=' +
              vehicleId +
              '&startTime=' +
              starttime +
              '&endTime=' +
              endtime
            Axios.get(getCarTackUrl)
              .then(function (carresponse) {
                if (carresponse.data.code == -1) {
                  that.$message.error(
                    '获取车辆轨迹失败：' + carresponse.data.msg
                  )
                } else {
                  if (carresponse.data.code == 100) {
                    var lnglats = carresponse.data.data.lngLats
                    that.createRoute(lnglats)
                    that.createMoveRoute(lnglats)
                  } else {
                    that.$message.error(
                      '获取车辆轨迹失败：' + carresponse.data.msg
                    )
                  }
                }
              })
              .catch(function (error) {
                // handle error
                // error;
              })
              .then(function () {
                // always executed
              })
          }
        })
        .catch(function (error) {
          // handle error
          // error;
        })
        .then(function () {
          // always executed
        })
    },

    // 创建线对象
    createRoute(lnglats) {
      //创建线对象

      var that = this

      var carRoutepoints = []
      carRoutepoints.push(new T.LngLat(lnglats[0].lng, lnglats[0].lat))

      for (var i = 0; i < lnglats.length - 1; i++) {
        var startpt = new T.LngLat(lnglats[i].lng, lnglats[i].lat)
        var endpt = new T.LngLat(lnglats[i + 1].lng, lnglats[i + 1].lat)

        carRoutepoints.push(endpt)

        //继续细分成四等分，优化路线效果
        var dx = parseFloat((lnglats[i + 1].lng - lnglats[i].lng) / 4) //x轴间隔
        var dy = parseFloat((lnglats[i + 1].lat - lnglats[i].lat) / 4) //y轴间隔
        var ds = parseFloat((lnglats[i + 1].speed - lnglats[i].speed) / 4) //平均加速度

        for (var j = 0; j < 4; j++) {
          var secStart = new T.LngLat(
            parseFloat(startpt.lng + parseFloat(j * dx)),
            parseFloat(startpt.lat + parseFloat(j * dy))
          )
          var secEnd = new T.LngLat(
            parseFloat(startpt.lng + parseFloat((j + 1) * dx)),
            parseFloat(startpt.lat + parseFloat((j + 1) * dy))
          )
          var secSpeed = parseFloat(lnglats[i].speed) + parseFloat((j + 1) * ds)
          var sec = [secStart, secEnd]

          var seccolor = that.getRouteColorBySpeed(secSpeed)
          var secline = new T.Polyline(sec, {
            color: seccolor,
            weight: 5,
            opacity: 0.9,
          })
          //向地图上添加线
          map.addOverLay(secline)
        }
      }

      //让所有点在视野范围内
      map.setViewport(carRoutepoints)
    },
    // 移动轨迹
    createMoveRoute(lnglats) {
      // this.carTrackArr.forEach((item) => {
      //   item.clear();
      // });

      // map.clear();
      // this.carTrack.clear();
      this.carTrack = new T.CarTrack(map, {
        interval: 100,
        speed: 20,
        dynamicLine: true,
        Datas: lnglats,
        polylinestyle: { color: '#FFF', width: 8, opacity: 0.7 },
      })
      this.carTrack.start()
      // this.carTrackArr.push(this.carTrack);
    },

    /**
     * 获取车队管家的token
     */
    getToken() {
      return new Promise((resolve, reject) => {})
    },

    /**
     * 获取车载视频
     */
    getCarVedio() {
      var that = this
      if (that.isNull(that.cdgjToken)) {
        that.playCarVedioAfterToken()
      } else {
        that.playCarVedioBeforeToken()
      }
    },

    /**
     * 先获取token再播放
     */
    playCarVedioAfterToken() {
      var that = this
      that.getToken().then(() => {
        that.playCarVedioBeforeToken()
      })
    },

    /**
     * 直接播放
     */
    playCarVedioBeforeToken() {
      var that = this
      var getVideoUrl =
        'https://api.cheoa.cn/interface?method=video.playRealtime&token=' +
        that.cdgjToken +
        '&channelId=1&imei=600036143827&videoType=2&streamType=1'
      Axios.get(getVideoUrl)
        .then(function (response) {
          if (response.data.code == -1) {
            //code=-1表示token已过期，重新获取
            that.playCarVedioAfterToken()
          } else {
            if (flvjs.isSupported()) {
              var videoElement = document.getElementById('videoElement')
              that.flvPlayer = flvjs.createPlayer({
                type: 'flv',
                isLive: true,
                hasAudio: true,
                url: response.data.data,
              })
              that.flvPlayer.attachMediaElement(videoElement)
              that.flvPlayer.load()
              that.flvPlayer.play()
            }
          }
        })
        .catch(function (error) {
          // handle error
          // error;
        })
        .then(function () {
          // always executed
        })
    },

    /**
     * 获取车辆坐标
     */
    getCarPosiont() {
      var that = this
      that.getCarPosBeforeToken()
      setTimeout(function () {
        that.getCarPosiont()
      }, 500)
    },

    /**
     * 获取车辆坐标
     */
    getCarPosBeforeToken() {
      var that = this
      Axios.get(
        'https://api.cheoa.cn/interface?method=user.pcLogin&userName=18622960127&password=wlzj4839484&store=pc'
      )
        .then(function (response) {
          if (response.data.code == 100) {
            var tk = response.data.data.token
            var getCarPosUrl =
              'https://api.cheoa.cn/interface?method=monitor.getAllLngLats&token=' +
              tk +
              '&status=&type='
            Axios.get(getCarPosUrl)
              .then(function (response) {
                if (response.data.code == 100) {
                  var carLng = response.data.data[0].lng
                  var carLat = response.data.data[0].lat
                  if (that.carPositon == null) {
                    that.carPositon = new T.Marker(
                      new T.LngLat(carLng, carLat),
                      {
                        icon: new T.Icon({
                          iconUrl: carIcon,
                          iconSize: new T.Point(40, 25),
                          iconAnchor: new T.Point(10, 25),
                        }),
                      }
                    ) //地图添加自定义标识

                    map.addOverLay(that.carPositon)
                  } else {
                    that.carPositon.setLngLat(new T.LngLat(carLng, carLat))
                  }
                  var pos = that.carPositon.getLngLat()
                  map.centerAndZoom(new T.LngLat(pos.lng, pos.lat), 18)
                } else {
                }
              })
              .catch(function (error) {
                // handle error
                console.log(error)
              })
              .then(function () {
                // always executed
              })
          }
        })
        .catch(function (error) {
          // handle error
          // error;
        })
        .then(function () {
          // always executed
        })
    },

    /**
     * 播放随车视频
     * carindex 数组索引
     */
    playCarVideo(carindex) {
      this.vediodialogVisible = true
      //根据carindex解析出carVideoUrl
      this.getCarVedio()

      //this.getToken().then(this.playCarVedioBeforeToken()); //获取车队管家token后播放视频

      // for (var j = 0, len = this.allCarlists.length; j < len; j++) {
      //   if (carindex == j) {
      //     this.carnum = this.allCarlists[j].title;

      //     //此处放根据carnum获取carVideoUrl的代码
      //     /**
      //      * ----------------
      //      * ----------------
      //      * ----------------
      //      * ----------------
      //      * ----------------
      //      */
      //     carVideoUrl = "https://video.cheoa.cn/live/600036143827-1.flv";
      //     player.stop();
      //     // 切换为直播
      //     player.play({
      //       url: carVideoUrl,
      //     });
      //   }
      // }
    },

    /**
     * 判断是否null
     * @param data
     */
    isNull(data) {
      return data == '' || data == undefined || data == null ? true : false
    },

    /*
     *根据速度获取颜色
     */
    getRouteColorBySpeed(speed) {
      var color = ''

      if (speed >= 0 && speed < 10) {
        color = '#8B0000	'
      } else if (speed >= 10 && speed < 20) {
        color = '#FF6600'
      } else if (speed >= 20 && speed < 30) {
        color = '#FF9900'
      } else if (speed >= 30 && speed < 40) {
        color = '#FFCC00'
      } else if (speed >= 40 && speed < 50) {
        color = '#CCFF00'
      } else if (speed >= 50 && speed < 60) {
        color = '#CCFF00'
      } else if (speed >= 60 && speed < 70) {
        color = '#99FF00'
      } else if (speed >= 70 && speed < 80) {
        color = '#99FF00'
      } else if (speed >= 80) {
        color = '#2E8B57'
      } else {
        console.log(speed + '未获取到颜色')
      }
      return color
    },

    carTrackConfirm() {
      this.trackdialogVisible = false
      this.getCarLngLatsAfterToken()
    },

    carTrackCancel() {
      this.trackdialogVisible = false
    },

    /**
     *车队列表显示与隐藏
     */
    fadeCarDiv() {
      if (this.carDivshow == false) {
        this.carDivshow = true
        this.carlistIcon_url = sqIcon
      } else if (this.carDivshow == true) {
        this.carDivshow = false
        this.carlistIcon_url = zkIcon
      }
    },

    /**
     * 根据状态切换设备列表
     */
    changeCarlist(status) {
      if (status == 'car_all') {
        this.carlists = this.allCarlists
      } else {
        this.carlists = []
        this.allCarlists.forEach((val) => {
          if (val.status == status) {
            this.carlists.push(val)
          }
        })
      }
    },

    /**
     * 统计设备状态（行驶、离线、静止）
     */
    getcarNumStatistic() {
      this.allCarlists.forEach((val) => {
        if (val.status == 'car_driving') {
          this.count_driving++
        }
        if (val.status == 'car_offline') {
          this.count_offline++
        }
        if (val.status == 'car_stop') {
          this.count_stop++
        }
      })
    },
  },
}
</script>
 
<style lang="less" scoped>
.mapDiv {
  width: 100%;
  height: 100%;
  padding: 0;
}

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

.opencarsBtn {
  width: 25px;
  height: 25px;
  /* border-radius: 100px; */
  border-style: none;
  left: 100px;
  top: 90px;
  background-color: transparent;
  position: absolute;
  z-index: 500;
  display: flex;
  /* justify-content: flex-start; */
}

/* //使用图片来替换
//before属性中的content文本是用来占位的,必须有
//可以设置字体大小来确定大小
//使用visibility: hidden;来隐藏文字 */
.el-icon-my-export {
  background: url(/imgs/arrow.png) center no-repeat;
  background-size: cover;
}
.el-icon-my-export:before {
  content: '替';
  font-size: 16px;
  visibility: hidden;
}

.carsDiv {
  width: 360px;
  height: 550px;
  left: 50px;
  top: 100px;
  font-size: 10px;
  font-weight: 500;
  color: #333946;
  border-radius: 10px;
  box-shadow: 5px 5px 2px rgba(0, 0, 0, 0.3);
  background-color: white;
  margin: auto;
  flex-direction: row;
  justify-content: space-between;
  position: absolute;
  z-index: 400;
  align-items: center;
  text-align: center;
}

.carsList {
  overflow-y: auto;
  width: 100%;
  height: 60%;
}

/* 更改element-UI按钮样式 */
.el-button--car {
  color: #fff;
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}
.el-button--car:hover {
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}
.el-button--car:focus {
  background-color: rgb(42, 48, 62);
  border-color: rgb(42, 48, 62);
}

.carBtn {
  align-content: left;
  font-size: 12px;
  width: 65px;
  height: 25px;
  padding-left: 15px;
  padding-top: 6px;
  margin-left: 10px;
}

.trackDialog {
  width: 60vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.trackTimeStyle {
  margin-left: 20px;
  /* width: 10%; */
  display: inline-block;
}

/* 可以设置不同的进入和离开动画 */
/* 设置持续时间和动画函数 */
.carfade-enter-active,
.carfade-leave-active {
  transition: all 0.5s;
}
.carfade-enter /* .fade-leave-active, 2.1.8 版本以下 */ {
  opacity: 0;
  transform: translateY(-30px);
}
.carfade-leave-to /* .fade-leave-active, 2.1.8 版本以下 */ {
  opacity: 0;
  transform: translateY(-30px);
}

.home-container {
  height: 100%;
}
.el-header {
  background-color: rgb(42, 48, 62);
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div {
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