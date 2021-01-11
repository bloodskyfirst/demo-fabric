import axios from 'axios'
import router from '../router'
import {
  USER
} from '../util/constant.js'
import env from './baseUrl.js'
import api from './api.js'
import { stringify, parse } from 'qs'


const host = window.location.host
let hostEnv
if (host.indexOf('cloud') > -1) {
  hostEnv = 'test'
}
const newAxios = axios.create({
  baseURL: env[hostEnv] || env.dev,
  timeout: 15000
})

const config = function(url, options = {}) {
  // needToken(接口是否需要token),handleResult(默认处理请求回来的数据),RESTful(适配RESTfulAPI,直接作为参数使用),resType(校验返回类型),last(请求结束执行的函数)
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
    resType
  } = options

  // check extreData
  headers = {
    'Content-Type': (headers && headers['Content-Type']) || 'application/json',
    needToken: needToken || true,
    handleResult: handleResult || true,
    last: last || '', //
    RESTful: RESTful || '',
    resType: resType || ''
  }


  // check url
  const urlArr = api[url].split(' ')
  const req = {
    headers
  }
  if (urlArr.length > 2) {
    req.baseURL = env[urlArr[3]]
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
  if (headers['Content-Type'] === 'application/json') {
    params = JSON.stringify(params)
  }
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && urlArr[0] == 'post') {
    params = stringify(params)
  }

  if (argLength < 3) { // get等类型
    const apiUrl = RESTful ? urlArr[1] + RESTful : urlArr[1]
    if (!RESTful) {
      req.params = params
    }
    return newAxios[urlArr[0]](apiUrl, req)
  } else { // post等类型
    return newAxios[urlArr[0]](urlArr[1], params, req)
  }
}

// 请求拦截
newAxios.interceptors.request.use(config => {
  const token = localStorage.getItem(USER.token)
  if (token != null && token !== '' && config.url !== '/login/loginIn') { // 判断token是否存在
    config.headers.Authorization = 'Bearer' + token // 将token设置成请求头
  }
  // const timestamp = new Date().getTime();
  // const nonce = Math.random().toString(36).substr(2);
  if (token) {
    config.headers.tokenId = token
  }
  if (config.headers.needToken && !token) {
    throw new Error('缺少token')
  }
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截
newAxios.interceptors.response.use(({ data, headers }) => {
  let errData, result
  if (data.status >= 500 || data.status === 404) { // 请求发生特殊异常时
    this.$message({
      message: '无法连接服务器',
      type: 'error',
      duration: 3000 // 时间
    })
    if (headers.last && typeof (headers.last) === 'function') {
      last(result)
    }
    // switch (response.status) { // 需要特殊码处理请启用这段代码
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
    return Promise.reject(result)
  }

  if (data && !data.resultCode) {
    if (data.message === USER.noToken) { // token失效
      router.push({
        path: '/login',
        query: {
          redirect: location.hostname
        }
      })
      // hideLoading()
      // return Promise.reject(d)
      // this.$message({
      // message:'',
      // type:'error'
      // })
      return false
    }
  } else {
    if (headers.handleResult) {
      if (!data.data) {
        errData = true
      }
      const handleData = JSON.parse(data.data)
      result = data
      if (headers.resType && data.data && (typeof (data.data) !== headers.resType)) {
        this.$message({
          message: '返回类型有误',
          type: 'error'
        })
        errData = true
      }
      if (((typeof (data.data) == 'object') && !Object.keys(data.data).length)) {
        errData = true
      }
    } else {
      result = data.data
    }
    if (headers.last && typeof (headers.last) === 'function') {
      last(result)
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
