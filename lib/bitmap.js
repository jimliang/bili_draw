
const Jimp = require('jimp')
const { hex2rgb } = require('./tool')
const colors = require('./colors')

module.exports = {
    write(bitmap, file, { width, height }) {
        return new Promise((resolve, reject) => {
            const image = new Jimp(width, height, 0xFFFFFF)
            for (let i = 0; i < bitmap.length; i++) {
                const l = i * 4
                const color = colors[bitmap[i]]
                const [r, g, b] = hex2rgb(color)
                image.bitmap.data[l + 0] = r
                image.bitmap.data[l + 1] = g
                image.bitmap.data[l + 2] = b
                image.bitmap.data[l + 3] = 255
            }
            image.write(file, (err) => {
                err ? reject(err) : resolve()
            })
        })
    }
}