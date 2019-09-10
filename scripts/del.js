#!/usr/bin/env node

const argv = process.argv
if (argv.length <= 2) {
    console.log('Usage: node del.js targets')
    return
}
const targets = argv[2]

console.log("Try del " + targets + "\n\n")

var shelljs = require('shelljs');
var addCheckMark = require('./checkmark');
var path = require('path');

var cpy = path.join(__dirname, '../node_modules/del-cli/cli.js');

shelljs.exec('node ' + cpy + ' --force ' + targets, addCheckMark.bind(null, callback));

function callback() {
  console.log(' Deleted ' + targets + '\n\n');
}
