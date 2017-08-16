
const lib = require('./lib')

async function main() {
    console.log('正在加载图片模板')
    const pd = await lib.getPixelsData('canvas.png', '#646')
    console.log('图片模板加载完成，需要校正的色块有： ', pd.length)
    console.log()
    check()
    async function check() {
        console.log('校正中...')
        const bitmap = await lib.getBitmap()
        for(const [x, y, colorName] of pd) {
            const bn = bitmap[x + y * 1280]
            if (bn !== colorName) {
                console.log(`需要校正${x}, ${y} ${bn} --> ${colorName}`)
                const result = await lib.drawData(x, y, colorName)
                if (result.code === 0) {
                    console.log(`校正成功，下次校正时间为${result.data.time}秒后`)
                    setTimeout(check, (result.data.time + 2) * 1000)
                } else {
                    console.log('校正失败: ', result)
                    if (result.data.time) {
                        setTimeout(check, (result.data.time + 2) * 1000)
                    } else {
                        setTimeout(check, 180 * 1000)
                    }
                }
                return
            }
        }
        console.log('完全匹配！')
        setTimeout(check, 60 * 1000)
    }
}

main()