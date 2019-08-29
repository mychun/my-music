//这些插件在vue项目已经都有
const express = require('express')
const path = require('path')
const axios = require('axios')
const app = express()

app.use('/public', express.static(path.join(__dirname, './static')))

//引入post的body数据解析插件
const bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.get('/api/getDiscList', (req, res)=>{

    //这是别人使用的反向代理，我这里是再反向代理
    const url = 'http://ustbhuangyi.com/music/api/getDiscList'

    axios.get(url, {
        params: req.query
    }).then((response)=>{
        res.json(response.data)
    }).catch((e)=>{
        console.log('err: ', e)
    })
})

app.get('/api/getCdInfo', (req, res)=>{

    const url = 'http://ustbhuangyi.com/music/api/getCdInfo'

    axios.get(url, {
        params: req.query
    }).then((response)=>{
        res.json(response.data)
    }).catch((e)=>{
        console.log('err: ', e)
    })
})

app.post('/api/getPurlUrl', (req, res)=>{
    const url = 'http://ustbhuangyi.com/music/api/getPurlUrl'

    axios.post(url, req.body).then((response)=>{
        res.json(response.data)
    }).catch((e)=>{
        console.log('err: ', e)
    })
})

app.get('/api/search', (req, res)=>{

    const url = 'http://ustbhuangyi.com/music/api/search'

    axios.get(url, {
        params: req.query
    }).then((response)=>{
        res.json(response.data)
    }).catch((e)=>{
        console.log('err: ', e)
    })
})


app.get('/api/lyric', (req, res)=>{

    const url = 'http://ustbhuangyi.com/music/api/lyric'

    axios.get(url, {
        params: req.query
    }).then((response)=>{
        res.json(response.data)
    }).catch((e)=>{
        console.log('err: ', e)
    })
})

app.listen(3000, ()=>{
    console.log('server start')
})