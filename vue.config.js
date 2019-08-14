const path = require('path')
module.exports = {
  devServer: {
    proxy: {
      //跨域
      '/api': {
        target: 'http://ustbhuangyi.com/music',
        changeOrigin: true
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