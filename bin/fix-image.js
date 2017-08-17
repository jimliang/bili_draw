/**
 * 对图片进行色板校正
 */
const program = require('commander')
const path = require('path')
const Jimp = require('jimp')

program
    .version('0.0.1')
    .usage('[options] <coverfile>')
    .option('-o, --out <file>', 'out file')
    .option('--ignore-color <color>', 'ignore color', '#646464')
    .parse(process.argv)

if (program.args.length === 0) {
    program.outputHelp()
    process.exit(0)
}


const { getNoMatchPixelsData, log, hex2rgb, getClosestColor } = require('../lib/tool')
const { getBitmap } = require('../lib/bili')
const { write } = require('../lib/bitmap')

const ignoreColor = program.ignoreColor
const cover = program.args[0]
const dist = program.out || (path.basename(cover) + '_new' + path.extname(cover))


async function fixImage(src, dest) {
    log('正在读取图片...')
    let [image, r] = await getNoMatchPixelsData(src, ignoreColor)

    log('待修复像素有： ' + r.length + '个')
    r = r.map(([x, y, color]) => [x, y, getClosestColor(color)])

    log('正在修复...')
    for (const [x, y, color] of r) {
        image.setPixelColor(Jimp.rgbaToInt(color[0], color[1], color[2], 255), x, y)
    }

    log('正在写入文件...')
    image.write(dest, err => {
        if (err) {
            throw err
        }
        log('已写入到', dest)
    })
}

fixImage(cover, dist)
    .catch(err => {
        throw err
    })