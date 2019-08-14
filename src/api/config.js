//放一些共用的参数

export const commonParams = {
  g_tk: 1928093487,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}
  
  export const options = {
    param: 'jsonpCallback',
    prefix: 'jp'
  }

//定义请求返回正常的状态
export const ERR_OK = 0