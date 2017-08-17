
const Jimp = require('jimp')
const colors = require('./colors')
const colorList = Object.keys(colors).map((key) => hex2rgb(colors[key]))
const colorReMap = Object.keys(colors).reduce((map, key) => {
    map[colors[key]] = key
    return map
}, {})

function hex2rgb(hex) {
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

function rgb2hsv(red, green, blue) {
    var rr, gg, bb,
        r = red / 255,
        g = green / 255,
        b = blue / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function (c) {
            return (v - c) / 6 / diff + 1 / 2;
        }

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return [
        Math.round(h * 360),
        Math.round(s * 100),
        Math.round(v * 100)
    ]
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
        const y = Math.floor(item / image.bitmap.width)
        const x = Math.floor(item % image.bitmap.width)
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
    const R = 100
    const angle = 30
    const h = R * Math.cos(angle / 180 * Math.PI)
    const r = R * Math.sin(angle / 180 * Math.PI)
    const colorHsv = rgb2hsv(...color)
    const x1 = r * colorHsv[2] * colorHsv[1] * Math.cos(colorHsv[0] / 180 * Math.PI)
    const y1 = r * colorHsv[2] * colorHsv[1] * Math.sin(colorHsv[0] / 180 * Math.PI)
    const z1 = h * (1-colorHsv[2])

    const ds = colorList.map((c, index) => {
        const cHsv = rgb2hsv(...c)    
        const x2 = r * cHsv[2] * cHsv[1] * Math.cos(cHsv[0] / 180 * Math.PI)
        const y2 = r * cHsv[2] * cHsv[1] * Math.sin(cHsv[0] / 180 * Math.PI)
        const z2 = h * (1- cHsv[2])
        return {
            index,
            dest: Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2) 
        }
    })
    ds.sort((a, b) => a.dest - b.dest)
    return colorList[ds[0].index]
}


const log = (...args) => console.log.apply(console, [new Date().toLocaleString(), ...args])

module.exports = {
    hex2rgb,
    rgb2Hex,
    rgb2hsv,
    getPixelsData,
    getNoMatchPixelsData,
    getClosestColor,
    log
}