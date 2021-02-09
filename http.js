import axios from 'axios'
import router from '../router'
import {
  USER
} from '../util/constant.js'
import env from './baseUrl.js'
import api from './api.js'
import { stringify, parse } from 'qs'

import {
  Message
} from 'element-ui'


let handleRefreshToken

const host = window.location.origin
let hostEnv
if (host.indexOf('.com') > -1) { // 自动适配环境
  // hostEnv = host + '/robotic'
  hostEnv = host
}
const newAxios = axios.create({
  baseURL: hostEnv || env.dev,
  timeout: 15000
})

const config = function(url, options = {}) {
  // needToken(接口是否需要token),handleResult(默认处理请求回来的数据),RESTful(适配RESTfulAPI,直接作为参数使用),resType(校验返回类型),last(请求结束执行的函数),headers包括对应的content-type
  if (!url || !api[url] || typeof (url) !== 'string' || api[url].split(' ').length < 2) {
    throw Error('请检查url参数')
  }
  let {
    params,
    headers,
    needToken,
    handleResult,
    last,
    RESTful,
    resType,
    noHandleOld,
    completeUrl, // 全地址
    initBaseUrl
  } = options
  // check extreData
  headers = {
    'Content-Type': (headers && headers['Content-Type']) || 'application/json',
    needToken: needToken !== undefined ? needToken : true,
    handleResult: handleResult !== undefined ? handleResult : true,
    last: last || '', //
    RESTful: RESTful || '',
    resType: resType || '',
    noHandleOld
  }

  // check url
  const urlArr = api[url].split(' ')
  const req = {
    headers
  }
  if (urlArr.length > 2) {
    req.baseURL = env[urlArr[2]]
    // if (urlArr[2] == 'new') { // 特定匹配新型api的接口
    //   req.baseURL = hostEnv ? hostEnv.replace(/\/robotic/g, '/api') : env.dev1
    // }
  }
  const methods = {
    get: 2,
    post: 3,
    delete: 2,
    head: 2,
    put: 3,
    patch: 3,
    options: 2
  }
  const argLength = methods[urlArr[0]]
  if (!argLength) {
    throw Error('传入正确的请求方式')
  }
  if (headers['Content-Type'] === 'application/json' && methods[urlArr[0]] !== 2) { // get请求默认不进行json格式化
    params = JSON.stringify(params)
  }
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && urlArr[0] == 'post') { // post请求如果设置特殊了,则默认走qs格式化
    params = stringify(params)
  }

  let apiUrl = RESTful ? urlArr[1] + RESTful : urlArr[1]
  // 当是完全地址的时候，则直接引用，例如这种 /user/v1/basic/user/{userId}/detail
  if (completeUrl) apiUrl = completeUrl
  if (initBaseUrl) {
    return newAxios({
      method: urlArr[0],
      baseURL: initBaseUrl,
      params: params
    })
  }
  console.log('这里初始化请求：', newAxios)
  if (argLength < 3) { // get等类型
    if (!RESTful) {
      req.params = params
    }
    return newAxios[urlArr[0]](apiUrl, req)
  } else { // post等类型
    return newAxios[urlArr[0]](apiUrl, params, req)
  }
}

// 请求拦截
newAxios.interceptors.request.use(config => {
  const token = localStorage.getItem(USER.accessToken)
  // if (token != null && token !== '' && config.url !== '/login') { // 判断token是否存在
  // }
  // const timestamp = new Date().getTime();
  // const nonce = Math.random().toString(36).substr(2);
  if (token && config.headers.needToken) {
    config.headers.Authorization = 'Bearer ' + token // 将token设置成请求头
    config.headers.tokenId = token
  }
  if (config.headers.needToken && !token) {
    throw new Error('缺少token')
  }
  if (config.headers.last) {
    let fun
    if (typeof (config.headers.last) === 'function') {
      fun = config.headers.last
    }
    config.transformResponse = res => {
      const newRes = JSON.parse(res)
      fun && fun(newRes)
      return newRes
    }
    delete config.headers.last
  }
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截
newAxios.interceptors.response.use(({ data, headers, status }) => {
  if (handleRefreshToken || headers.noHandleOld) {
    return data
  }
  // const { data, headers } = res
  // ({ data, headers })
  let errData, result, handleData
  if (status >= 500 || status === 404) { // 请求发生特殊异常时
    Message({
      message: '无法连接服务器',
      type: 'error',
      duration: 3000 // 时间
    })
    // switch (status) { // 需要特殊码处理请启用这段代码
    //   case 500:
    //     // 服务器异常
    //     // response.status
    //     break
    //   case 404:
    //     break
    //     // 请求出错
    //   default:
    //     break
    // }
    return Promise.reject(data)
  }
  // const data

  if (data && data.resultCode) {
    // data.message === USER.noToken ||
    if (data.resultCode === 20101) { // accessToken 无效
      const refreshToken = localStorage.getItem('robot_refreshToken')
      const accessToken = localStorage.getItem('robot_accessToken')
      if (refreshToken !== 'undefined' && accessToken !== 'undefined' && refreshToken && accessToken) {
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
        const params = {
          refreshToken: refreshToken,
          appId: 'marsWeb2021'
        }
        if (handleRefreshToken) {
          return data
        }
        handleRefreshToken = true
        config('refreshToken', { // 尝试刷新token
          headers,
          params,
          needToken: false
        }).then((data) => {
          handleRefreshToken = false
          if (data && !data.resultCode) { // 如果报错，检查后端是否有resultCode
            localStorage.setItem(USER.accessToken, data.data.accessToken)
            localStorage.setItem(USER.refreshToken, data.data.refreshToken)
            location.reload()
          } else {
            localStorage.removeItem(USER.accessToken)
            localStorage.removeItem(USER.refreshToken)
            router.push({
              path: '/login',
              query: {
                redirect: location.hostname
              }
            })
            Message({
              message: '凭证失效,请重新登录',
              type: 'error'
            })
          }
        }).catch(() => {
          handleRefreshToken = false
          localStorage.removeItem(USER.accessToken)
          localStorage.removeItem(USER.refreshToken)
          router.push({
            path: '/login',
            query: {
              redirect: location.hostname
            }
          })
          Message({
            message: '网络异常,请重新登录',
            type: 'error'
          })
        })
      }
      // hideLoading()
      // return Promise.reject(d)
      // this.$message({
      // message:'',
      // type:'error'
      // })
      return false
    } else {
      return Promise.reject(data.message)
    }
  } else {
    if (headers.handleResult) {
      if (!data.data) {
        errData = true
      }
      const handleData = (headers['Content-Type'] === 'application/json') ? JSON.parse(data.data) : data.data
      console.warn('此时contentType不是json')
      result = handleData
      if (headers.resType && (typeof (handleData) !== headers.resType)) {
        Message({
          message: '返回类型有误',
          type: 'error'
        })
        errData = true
      }
      if (((typeof (handleData) == 'object') && !Object.keys(handleData).length)) {
        errData = true
      }
    } else {
      result = data.data
    }
  }
  return errData ? false : result
}, error => {
  // 对响应错误做点什么
  const { response } = error
  // errorHandle(response.status, response.data.message);
  return Promise.reject(error)
})

export default config
