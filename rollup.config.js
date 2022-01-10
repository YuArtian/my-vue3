import path from 'path'

const { TARGET, FORMATS, SOURCEMAP } = process.env

const formats = FORMATS && FORMATS.split(',')
const sourcemap = SOURCEMAP
const target = TARGET

console.log('formats', formats)

const path_packages = path.resolve(__dirname, 'packages')
const path_target = path.resolve(path_packages, target)


