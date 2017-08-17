
const axios = require('axios')
const qs = require('querystring')

async function post(url, data = {}, { cookie = '' } = {}) {
    const resp = await axios.post(url, qs.stringify(data), {
        headers: {
            Host: 'api.live.bilibili.com',
            Referer: 'http://live.bilibili.com/pages/1702/pixel-drawing',
            Cookie: cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
        }
    })
    return resp.data
}

class Client {

    constructor(cookie) {
        this._cookie = cookie
    }
    _post(url, data) {
        return post(url, data, { cookie: this._cookie })
    }
    drawData (x, y, color) {
        return this._post('http://api.live.bilibili.com/activity/v1/SummerDraw/draw', {
            x_min: x, x_max: x, y_min: y, y_max: y, color
        })
    }
    async getuserinfo () {
        const data = await this._post('http://live.bilibili.com/user/getuserinfo')
        if (data.code !== 'REPONSE_OK') {
            console.log('getuserinfo error', data)
            throw new Error(data.msg)
        }
        // {
        //     "code": "REPONSE_OK",
        //     "msg": "ok",
        //     "data": {
        //     "uname": "景公子",
        //     "face": "http://i1.hdslb.com/bfs/face/693a94b5a4bd91e8853967805dcbac167015267a.jpg",
        //     "silver": 8744,
        //     "gold": 0,
        //     "achieve": 70,
        //     "vip": 0,
        //     "svip": 0,
        //     "user_level": 11,
        //     "user_next_level": 12,
        //     "user_intimacy": 212000,
        //     "user_next_intimacy": 800000,
        //     "user_level_rank": ">50000",
        //     "billCoin": 847
        //     }
        //     }
        return data.data
    }
}

module.exports = {
    post,
    Client,
    async getBitmap() {
        const data =  await post('http://api.live.bilibili.com/activity/v1/SummerDraw/bitmap')
        if (data.code === 0) {
            return data.data.bitmap
        }
        throw new Error('获取绘图失败：' + JSON.stringify(data))
    },
}