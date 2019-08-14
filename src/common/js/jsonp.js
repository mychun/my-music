import originJsonp from 'jsonp'

//封装一个jsonp
export default function jsonp(url, data, option) {
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
    return new Promise((resolve, reject) => {
        //接收三个参数
        //1、请求的jsonp链接，包括url参数
        //2、配置
        //3、回调函数
        originJsonp(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    });
}

//拼接data对象编程url的参数
function param(data) {
    let url = ''
    for (var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += '&' + k + '=' + encodeURIComponent(value)
    }
    //因为第一个是&所以要取第二个开始
    return url ? url.substring(1) : ''
}