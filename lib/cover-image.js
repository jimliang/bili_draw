
// TODO

const { getPixelsData, log } = require('../lib/tool')
const { getBitmap, Client } = require('../lib/bili')

async function coverImage(src, ignoreColor, cookies) {
    let clients = await Promise.all(cookies.map(async c => {
        const client = new Client(c)
        try {
            const user = await client.getuserinfo()
            client.name = user.uname
            log('用户有效：' + name)
            return client
        } catch (error) {
            log('用户无效', error.message)
        }
    }))
    let list = clients.filter(c => !!c)
    if (list.length === 0) {
        log('无有效用户')
        return
    }

    log('正在加载图片模板')
    const pd = await getPixelsData(src, ignoreColor)
    log('图片模板加载完成，需要校正的色块有： ', pd.length)

    setInterval(async () => {
        if (list.length === 0) return
        const clients = list
        list = []
        log(client.name, '校正中...')
        const bitmap = await getBitmap()

        const pds = getNoMatch(bitmap, pd)
        if (pds.length === 0) {
            log('完美匹配!')
            pushList(clients, 1)
            return
        }
        log('待校正像素： ' + pds.length)

        clients.forEach(async client => {
            if (pds.length === 0) {
                return pushList(client, 0)
            }
            const [x, y, colorName] = pds.shift()
            log(client.name, `正在校正${x}, ${y} ${bn} --> ${colorName}`)
            try {
                const result = await client.drawData(x, y, colorName)
                if (result.code === 0) {
                    log(client.name, `校正成功，下次校正时间为${result.data.time}秒后`)
                } else {
                    log(client.name, '校正失败: ', result)
                }
                const time = (result.data && result.data.time) || 1
                pushList(client, time)
            } catch (error) {
                pushList(client, 0)
                log('绘图失败', error.message)
            }

        })
    }, 1000)

    function pushList(client, second = 0) {
        setTimeout(() => {
            if (Array.isArray(client)) {
                list = list.concat(client)
            } else {
                list.push(client)
            }
        }, second * 1000)
    }

}

function getNoMatch(bitmap, pixelsdata) {
    const r = []
    for (const data of pixelsdata) {
        const bn = bitmap[data.x + data.y * 1280]
        if (bn !== data.colorName) {
            r.push(data)
        }
    }
    return r
}

module.exports = coverImage