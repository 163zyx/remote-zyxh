import service from '@/axios'
import qs from "qs"
import { apiUrl } from '@/utils/basePath.js'
// get 请求
export function getData(params) {
  if(params.apiUrl){
    let fullUrl = params.apiUrl + params.subUrl
    if(params.headers){
      return service({
        method: 'get',
        headers: params.headers,
        url: fullUrl,
        cancelToken: params.cancelToken,
        signal: params.signal
      })
    }else{
      return service({
        method: 'get',
        url: fullUrl,
        cancelToken: params.cancelToken,
        signal: params.signal
      })
    }
  } else {
    let fullUrl = apiUrl + params.subUrl
    if(params.headers){
      return service({
        method: 'get',
        headers: params.headers,
        url: fullUrl,
        cancelToken: params.cancelToken,
        signal: params.signal
      })
    }else{
      return service({
        method: 'get',
        url: fullUrl,
        cancelToken: params.cancelToken,
        signal: params.signal
      })
    }
  }
}
// post请求
export function postData(params) {
  if(params.apiUrl){
    let fullUrl = params.apiUrl + params.subUrl
    if(params.headers){
      return service({
        method: 'post',
        headers: params.headers,
        url: fullUrl,
        data: JSON.stringify(params.data)
      })
    } else {
      return service({
        method: 'post',
        url: fullUrl,
        // data: qs.stringify(params.data)
        data: JSON.stringify(params.data)
        // data: params.data
      })
    }
  } else {
    let fullUrl = apiUrl + params.subUrl
    if(params.headers){
      return service({
        method: 'post',
        headers: params.headers,
        url: fullUrl,
        // data: qs.stringify(params.data)
        data: JSON.stringify(params.data)
      })
    }else{
      return service({
        method: 'post',
        url: fullUrl,
        // data: qs.stringify(params.data)
        data: JSON.stringify(params.data)
        // data: params.data
      })
    }
  }
}
// delete请求
export function deleteData(params) {
  let fullUrl = apiUrl + params.subUrl
  if(params.headers){
    return service({
      method: 'delete',
      headers: params.headers,
      url: fullUrl,
      data: qs.stringify(params.data)
    })
  }else{
    return service({
      method: 'delete',
      url: fullUrl,
      data: qs.stringify(params.data)
      // data: params.data
    })
  }
}