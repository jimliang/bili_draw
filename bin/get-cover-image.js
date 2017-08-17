
/**
 * 根据图片对原绘图进行覆盖，生成最终的覆盖图
 */

const program = require('commander')
const path = require('path')

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

const { getPixelsData, log } = require('../lib/tool')
const { getBitmap } = require('../lib/bili')
const { write } = require('../lib/bitmap')
const ignoreColor = program.ignoreColor
const cover = program.args[0]
const dist = program.out || (path.basename(cover) + '_new' + path.extname(cover))

function replace(str, index, ch) {
    return str.slice(0, index) + ch + str.slice(index + 1)
}

async function getCoverImage(cover, dest) {
    log('正在获取填充图片...')
    const pd = await getPixelsData(cover, ignoreColor)
    log('正在获取绘图...')
    let bitmap = await getBitmap()
    log('正在覆盖图片...')
    for (const [x, y, colorName] of pd) {
        const bn = bitmap[x + y * 1280]
        if (bn !== colorName) {
            bitmap = replace(bitmap, x + y * 1280, colorName)
        }
    }
    log('正在生成图片...')
    await write(bitmap, dest, { width: 1280, height: 720 })
    console.log('write file to ' + dest)
}

getCoverImage(cover, dist)
    .catch(err => {
        throw err
    })