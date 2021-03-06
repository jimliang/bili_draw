
const lib = require('./lib')

const log =  (...args) => console.log.apply(null, [new Date().toLocaleString(), ...args])

async function main() {
    log('正在加载图片模板')
    const pd = await lib.getPixelsData('canvas.png', '#646464')
    log('图片模板加载完成，需要校正的色块有： ', pd.length)
    check()
    async function check() {
        try {
            log('校正中...')
            pd.sort(() => Math.random())
            const bitmap = await lib.getBitmap()
            for(const [x, y, colorName] of pd) {
                const bn = bitmap[x + y * 1280]
                if (bn !== colorName) {
                    log(`需要校正${x}, ${y} ${bn} --> ${colorName}`)
                    const result = await lib.drawData(x, y, colorName)
                    if (result.code === 0) {
                        log(`校正成功，下次校正时间为${result.data.time}秒后`)
                        setTimeout(check, (result.data.time + 2) * 1000)
                    } else {
                        log('校正失败: ', result)
                        if (result.data.time) {
                            setTimeout(check, (result.data.time + 2) * 1000)
                        } else {
                            setTimeout(check, 180 * 1000)
                        }
                    }
                    return
                }
            }
            log('完全匹配！')
            setTimeout(check, 60 * 1000)
        } catch (error) {
            console.warn(error)
            check()
        }
    }
}

main()
