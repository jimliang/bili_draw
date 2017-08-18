
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
            log('用户无效')
        }
    }))
    clients = clients.filter(c => !!c)
    if (clients.length === 0) {
        log('无有效用户')
        return
    }
    log('正在加载图片模板')
    const pd = await getPixelsData(src, ignoreColor)
    log('图片模板加载完成，需要校正的色块有： ', pd.length)

    clients.forEach(check)

    async function check(client) {
        try {
            log(client.name, '校正中...')
            const bitmap = await getBitmap()
            pd.sort(() => Math.random())
            for (const [x, y, colorName] of pd) {
                const bn = bitmap[x + y * 1280]
                if (bn !== colorName) {
                    log(client.name, `需要校正${x}, ${y} ${bn} --> ${colorName}`)
                    const result = await client.drawData(x, y, colorName)
                    if (result.code === 0) {
                        log(client.name, `校正成功，下次校正时间为${result.data.time}秒后`)
                    } else {
                        log(client.name, '校正失败: ', result)
                    }

                    if (result.data && result.data.time) {
                        setTimeout(check, (result.data.time + 1) * 1000, client)
                    } else {
                        setTimeout(check, 180 * 1000, client)
                    }
                    return
                }
            }
            log(client.name, '完全匹配！')
            setTimeout(check, 60 * 1000, client)
        } catch (error) {
            console.warn(error)
            setTimeout(check, 1000, client)
        }
    }
}

module.exports = coverImage