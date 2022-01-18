import path from 'path'
import typescript2 from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const { TARGET, FORMATS, SOURCEMAP } = process.env

// const sourcemap = SOURCEMAP

const path_packages = path.resolve(__dirname, 'packages')
const path_target = path.resolve(path_packages, TARGET)
const resolve = p => path.resolve(path_target, p)

const pkg = require(resolve('package.json'))

// 输出配置
const output_config = {
  'esm-bundler': {
    sourcemap: SOURCEMAP,
    file: resolve(`dist/${TARGET}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    sourcemap: SOURCEMAP,
    file: resolve(`dist/${TARGET}.cjs.js`),
    format: 'cjs'
  },
  'iife': {
    name: pkg.buildOptions.name,
    sourcemap: SOURCEMAP,
    file: resolve(`dist/${TARGET}.global.js`),
    format: 'iife'
  },
}

// 格式解析
const formats = (FORMATS && FORMATS.split(',')) || pkg.buildOptions.formats
console.log('formats', formats)

export default formats.map(format => {
  let external = []
  if(format !== 'iife') {
    external = [...Object.keys(pkg.dependencies)]
  }
  return {
    input: resolve('src/index.ts'),
    output: output_config[format],
    external,
    plugins: [
      json(), typescript2(), commonjs(), nodeResolve()
    ]
  }
})