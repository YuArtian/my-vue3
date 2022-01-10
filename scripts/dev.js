// const minimist = require('minimist')//获取参数
// const execa = require('execa') //执行命令
/**
 * execa 新版本不支持 CommonJS
 * https://github.com/sindresorhus/execa/issues/481
 * https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
*/

import { execa } from 'execa'
import minimist from 'minimist'

const { _, f, s } = minimist(process.argv.slice(2))
// args { _: [ 'reactivity', 1, 2, 3 ], f: 'global', s: true }
const target = _.length ? _ : 'reactivity'
const formats = f || 'global'
const sourcemap = s || false

console.log('target, formats, sourcemap', target, formats, sourcemap)

execa('rollup', [
  '-wc', //watch config
  // https://rollupjs.org/guide/en/#--environment-values
  // 通过 process.ENV 将其他设置传递给配置文件
  '--environment',
  [
    `TARGET:${target}`,
    `FORMATS:${formats}`,
    `SOURCEMAP:${sourcemap}`,
  ].join(',')
], {
  stdio: 'inherit'
})