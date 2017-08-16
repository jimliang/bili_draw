const axios = require('axios')
const getPixels = require('get-pixels')
const config = require('./config')
const qs = require('querystring')

const cookie = config.cookie

const colorReMap = Object.keys(config.colorNames).reduce((map, key) => {
    map[config.colorNames[key]] = key
    return map
}, {})

module.exports = {

    async post(url, data = {}) {
        const resp = await axios.post(url, qs.stringify(data), {
            headers: {
                Host: 'api.live.bilibili.com',
                Referer: 'http://live.bilibili.com/pages/1702/pixel-drawing',
                Cookie: cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
            }
        })
        return resp.data
    },

    Hex2rgb(hex) {
        if (hex.lastIndexOf('#') > -1) {
            hex = hex.replace(/#/, '0x')
        } else {
            hex = '0x' + hex
        }
        if (hex.length === 5) {
            hex += hex.slice(-3)
        }
        var r = hex >> 16
        var g = (hex & 0x00FF00) >> 8
        var b = hex & 0x0000FF
        return [r, g, b]
    },
    rgb2Hex(red, green, blue) {
        const rgb = ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1)
        let hex = rgb.toString('16')

        if (hex.slice(0, 3) === hex.slice(3)) {
            hex = hex.slice(0, 3)
        }
        return '#' + hex
    },
    getPixelsData(file, ignoreColor) {
        return new Promise((resolve, reject) => {
            getPixels(file, (err, pixels) => {
                if (err) return reject(err)
                const result = []
                for (var i = 0; i < pixels.data.length; i += 4) {
                    const [r, g, b] = [
                        pixels.data[i],
                        pixels.data[i + 1],
                        pixels.data[i + 2]
                    ]
                    const hex = this.rgb2Hex(r, g, b)
                    if (hex === ignoreColor) continue
                    const colorName = colorReMap[hex]
                    var item = Math.floor(i / 4)
                    var y = Math.floor(item / 1280)
                    var x = Math.floor(item % 1280)
                    if (colorName) {
                        result.push([x, y, colorName])
                    } else {
                        console.warn('颜色不对应: ', x, y, hex)
                    }

                }
                resolve(result)
            })
        })
    },
    async getBitmap() {
        const data =  await this.post('http://api.live.bilibili.com/activity/v1/SummerDraw/bitmap')
        if (data.code === 0) {
            return data.data.bitmap
        }
        throw new Error('获取绘图失败：' + JSON.stringify(data))
    },
    drawData (x, y, color) {
        return this.post('http://api.live.bilibili.com/activity/v1/SummerDraw/draw', {
            x_min: x, x_max: x, y_min: y, y_max: y, color
        })
    }
}