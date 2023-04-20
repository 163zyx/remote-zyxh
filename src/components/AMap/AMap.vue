复制代码
<template>
  <div class="amap-page-container">
    <div :style="{ width: '100%', height: '100vh' }">
      <el-amap vid="amap">
      </el-amap>
    </div>


  </div>
</template>

<script>
export default {
  data() {
 
    return {
  
    };
  },


  // 初始化
MapInit () {
    let _this = this;
        let map = new AMap.Map("map", {
        center: [105.397428, 35.90923],
        mapStyle: "amap://styles/这里放入样式ID", //设置地图的显示样式
        resizeEnable: true,
        zoom: 5
    });
}







};
</script>

<style>
.amap-demo {
  height: 300px;
}
</style>