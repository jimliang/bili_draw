
const Jimp = require('jimp')
const colors = require('./colors')
const colorList = Object.keys(colors).map((key) => hex2rgb(colors[key]))
const colorReMap = Object.keys(colors).reduce((map, key) => {
    map[colors[key]] = key
    return map
}, {})

function hex2rgb (hex) {
    if (hex.lastIndexOf('#') > -1) {
        hex = hex.replace(/#/, '0x')
    } else {
        hex = '0x' + hex
    }
    if (hex.length === 5) {
        hex += hex.slice(-3)
    }
    const r = hex >> 16
    const g = (hex & 0x00FF00) >> 8
    const b = hex & 0x0000FF
    return [r, g, b]
}

function rgb2Hex(red, green, blue) {
    const rgb = ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1)
    let hex = rgb.toString('16')

    if (hex.slice(0, 3) === hex.slice(3)) {
        hex = hex.slice(0, 3)
    }
    return '#' + hex
}

async function getPixelsData(file, ignoreColor) {
    const image = await Jimp.read(file)
    const result = []
    for (let i = 0; i < image.bitmap.data.length; i += 4) {
        const [r, g, b] = [
            image.bitmap.data[i],
            image.bitmap.data[i + 1],
            image.bitmap.data[i + 2]
        ]
        const hex = rgb2Hex(r, g, b)
        if (hex === ignoreColor) continue
        const colorName = colorReMap[hex]
        const item = Math.floor(i / 4)
        const y = Math.floor(item / 1280)
        const x = Math.floor(item % 1280)
        if (colorName) {
            result.push([x, y, colorName])
        } else {
            console.warn('颜色不对应: ', x, y, hex)
        }
    }
    return result
}


async function getNoMatchPixelsData(file, ignoreColor) {
    const image = await Jimp.read(file)
    const result = []
    for (let i = 0; i < image.bitmap.data.length; i += 4) {
        const [r, g, b] = [
            image.bitmap.data[i],
            image.bitmap.data[i + 1],
            image.bitmap.data[i + 2]
        ]
        const hex = rgb2Hex(r, g, b)
        if (hex === ignoreColor) continue
        const colorName = colorReMap[hex]
        const item = Math.floor(i / 4)
        const y = Math.floor(item / image.bitmap.width)
        const x = Math.floor(item % image.bitmap.width)
        if (!colorName) {
            result.push([x, y, [r, g, b]])
        }
    }
    return [image, result]
}

function getClosestColor(color) {
    const ds = colorList.map((c, index) => {
        return {
            index,
            dest: Math.pow(c[0] - color[0], 2) + Math.pow(c[1] - color[1], 2) + Math.pow(c[2] - color[2], 2)
        }
    })
    ds.sort((a, b) => a.dest - b.dest)
    return colorList[ds[0].index]
}


const log =  (...args) => console.log.apply(console, [new Date().toLocaleString(), ...args])

module.exports = {
    hex2rgb,
    rgb2Hex,
    getPixelsData,
    getNoMatchPixelsData,
    getClosestColor,
    log
}