#!/usr/bin/env node
import * as commander from 'commander';
import {translate} from './main';

const pkg = require('../package.json')
const program = new commander.Command();
program
  .version(pkg.version)
  .name('fy')
  .usage('<English>')
  .arguments('<English>')
  .action(function(english){
  // console.log('eng');
  translate(english)
})
program.parse(process.argv)