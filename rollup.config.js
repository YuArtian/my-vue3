import path from 'path'

const { TARGET, FORMATS, SOURCEMAP } = process.env

// const sourcemap = SOURCEMAP

const path_packages = path.resolve(__dirname, 'packages')
const path_target = path.resolve(path_packages, TARGET)
const resolve = p => path.resolve(path_target, p)

const pkg = require(resolve('package.json'))

const output_config = {
  'esm-bundler': {
    file: resolve(`dist/${TARGET}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${TARGET}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${TARGET}.global.js`),
    format: 'global'
  },
}

const formats = (FORMATS && FORMATS.split(',')) || pkg.buildOptions.formats
