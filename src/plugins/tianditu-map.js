export default {
  init: function () {
    return new Promise((resolve, reject) => {
      if (typeof window.T !== 'undefined') {
        console.log('地图脚本初始化成功1111...')
        resolve(window.T)
        reject('地图加载失败')
        return true
      }
      window.onload = function () {
        console.log('地图脚本初始化成功...')
        // eslint-disable-next-line
        resolve(window.T)
        reject('地图加载失败')
      }
    })
  }
}