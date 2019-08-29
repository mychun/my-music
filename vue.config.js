const path = require('path')
module.exports = {
  //打包的根目录
  publicPath: '/mymusic',
  devServer: {
    proxy: {
      //跨域
      '/api': {
        // target: 'http://ustbhuangyi.com/music',
        target: 'http://192.168.1.102:3000', //记得开启反代理服务器
        changeOrigin: true,
        pathRewrite:{
            '^/api':'/api'
        }
      }
    }
  },
  //全局引用stylus
  css: {
    loaderOptions: {
      stylus: {
        import: [
          path.resolve(__dirname, './src/common/stylus/variable.styl'),
          path.resolve(__dirname, './src/common/stylus/mixin.styl')
        ]
      },
    }
  }
}