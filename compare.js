
/**
 * 原大图和覆盖后大图的对比
 * bitmap.png & bitmap_new.png
 */

const Jimp = require('jimp')
const lib = require('./lib')

const colorMap = require('./config').colorNames

async function main() {
    const t = +new Date()
    const pd = await lib.getPixelsData('canvas.png', '#646464')
    let bitmap = await lib.getBitmap()
    await write(bitmap, t+ '_bitmap.png')
    for (const [x, y, colorName] of pd) {
        const bn = bitmap[x + y * 1280]
        if (bn !== colorName) {
            bitmap = replace(bitmap, x + y * 1280, colorName)
        }
    }
    await write(bitmap, t+ '_bitmap_new.png')
}

function write(bitmap, file) {
    return new Promise((resolve, reject) => {
        const image = new Jimp(1280, 720, 0xFFFFFF)
        for (let i = 0; i < bitmap.length; i++) {
            const l = i * 4
            const color = colorMap[bitmap[i]]
            const [r, g, b] = lib.Hex2rgb(color)
            image.bitmap.data[l + 0] = r
            image.bitmap.data[l + 1] = g
            image.bitmap.data[l + 2] = b
            image.bitmap.data[l + 3] = 255
        }
        image.write(file, (err) => {
            // console.log('write ' + file + ' completed', err)
            err ? reject(err) : resolve()
        })
    })
}

function replace(str, index, ch) {
    return str.slice(0, index) + ch + str.slice(index + 1)
}

main()