/**
 * axios 配置
 */

import axios from 'axios'
import { passwordEncryption } from "../src/utils/encrpt"

const service = axios.create({
  timeout: 100000
})
// service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
service.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 设置全局的请求次数，请求的间隙
service.defaults.retry = 4
service.defaults.retryDelay = 500

// http request 拦截器
service.interceptors.request.use(
  config => {
    if (sessionStorage.getItem("access_token")) {
      config.headers.common['Authorization'] = "Bearer " + sessionStorage.getItem("access_token");
    }
    config.headers.common['appCode'] = 'survey';
    return config
  },
  err => {
    return Promise.reject(err)
  })

// http response 拦截器
service.interceptors.response.use(
  response => {
    //如果token过期跳转到登录页面
    if(response.data.code == '1002'){
      window.open('http://121.36.221.179:8105/login?redirect=' + passwordEncryption('http://123.249.5.156:1602/#/index/systemindex'), '_self')
    }
    if(response.data.code == '5009'){
      console.log("5009跳转登录页面啦")
      window.open('http://121.36.221.179:8105/login?redirect=' + passwordEncryption('http://123.249.5.156:1602/#/index/systemindex'), '_self')
    }
    return response
  },
  error => {
    if (axios.isCancel(error)) {
      return
    } else {
      console.log(error, '错误')
    }
    var config = error.config
    // If config does not exist or the retry option is not set, reject
    if (!config || !config.retry) return Promise.reject(error)

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0

    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
      // Reject with the error
      console.log(error) // console : Error: Request failed with status code 402
      return Promise.reject(error)
    }

    // Increase the retry count
    config.__retryCount += 1

    // Create new promise to handle exponential backoff
    var backoff = new Promise(function (resolve) {
      setTimeout(function () {
        resolve()
      }, config.retryDelay || 1)
    })

    // Return the promise in which recalls axios to retry the request
    return backoff.then(function () {
      return service(config)
    })
  })

export default service
