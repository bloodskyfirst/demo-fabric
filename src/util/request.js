import env from './baseUrl.js'
import api from './api.js'

const host = window.location.host
let hostEnv;
if (host.indexOf('cloud') > -1) {
    hostEnv = 'test'
}
const request = axios.create({
    baseURL: env[hostEnv] || env.dev,
    timeout: 15000,
});

const config = function(url, options = {}) {
    if (!url || !api[url] || typeof(url) !== 'string' || url.split(' ').length < 2) {
        throw Error('请检查url参数')
    }
    let {
        params,
        headers,
        needToken,
        handleResult,
        last,
        resfulApi,
        resType
    } = options

    // check extreData
    headers = {
        'Content-Type': (header && header['Content-Type']) || 'application/json',
        needToken: needToken || true, // 请求拦截使用
        handleResult: handleResult || true, // 响应拦截使用
        last: last || '', // 响应拦截使用
        resfulApi: resfulApi || '', // 请求拦截使用
        resType:resType || ''
    }
    if(headers['Content-Type']==='application/json'){
        params = JSON.stringify(params)
    }
    
    // check url
    const urlArr = url.split(' ')
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
        options: 2,
    }
    const argLength = methods[urlArr[0]]
    if (!argLength) {
        throw Error('传入正确的请求方式')
    }
    if (argLength < 3) {
        req.params = params
        return request[urlArr[0]](urlArr[1], req)
    } else {
        return request[urlArr[0]](urlArr[1], params, req)
    }
}

// 请求拦截
axios.interceptors.request.use( config => {
    return config;
}, err=> {
    return Promise.reject(error);
});

// 响应拦截
axios.interceptors.response.use( ({data,headers}) => {
    let errData,result;
    if(data && data.resultCode){
        // this.$message({
            // message:'',
            // type:'error'
        // })
        return false
    }else{
        if(headers.handleResult){
            if(!data.data){
                errData = true
            }
            const handleData = JSON.parse(data.data)
            result = data
            if( headers.resType && data.data && (typeof(data.data)!==headers.resType) ){
                this.$message({
                    message:'返回类型有误',
                    type:'error'
                })
                errData = true
            }
            if(( (typeof(data.data)=='object') && !Object.keys(data.data).length ) ){
                errData = true
            }
        }else{
            result = data.data
        }
        if(headers.last && typeof(headers.last)==='function'){
            last(result)
        }
    }
    return errData ? false : result
}, error => {
    // 对响应错误做点什么
    const { response } = error;

    switch (response.status){
        case 500:
            // 服务器异常
            response.status
            break;
        case 404:
            // 请求出错
        default:
            // this.$message({
            //     message:'请求失败,请稍后再试',
            //     type:'error'
            // })
            break;
    }
    // errorHandle(response.status, response.data.message);
    return Promise.reject(error);
})
