
/**
 * 对某图片进行颜色板校正
 */

const Jimp = require('jimp')
const lib = require('./lib')

const colorMap = require('./config').colorNames
const colors = Object.keys(colorMap).map((key) => {
    return lib.Hex2rgb(colorMap[key])
})

async function main(src, dest) {
    const r = []
    await lib.getPixelsData(src, '#646464', ({ x, y, color }) => {
        r.push([x, y, getClosestColor(color)])
    })

    const image = await Jimp.read(src)

    for(let i in r) {
        const [x, y, color] = r[i]
        console.log('set', x, y, color, lib.rgb2Hex(...color))
        image.setPixelColor(Jimp.rgbaToInt(color[0], color[1], color[2], 255), x, y)
    }

    image.write(dest, err => {
        console.log('write', err)
    })
}

function getClosestColor (color) {
    const ds = colors.map((c, index) => {
        return {
            index,
            dest: Math.pow(c[0] - color[0], 2) + Math.pow(c[1] - color[1], 2) + Math.pow(c[2] - color[2], 2)
        }
    })
    ds.sort((a, b) => a.dest - b.dest)
    return colors[ds[0].index]
}

main('canvas.png', 'aaa2.png')
