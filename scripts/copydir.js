#!/usr/bin/env node

const argv = process.argv
if (argv.length <= 3) {
    console.log('Usage: node copydir.js from to')
    return
}
const fromParam = argv[2]
const toParam = argv[3]

console.log("Try copy " + fromParam + " to " + toParam + "\n\n")

var copydir = require('copy-dir');

copydir.sync(fromParam, toParam, {
  utimes: true,  // keep add time and modify time
  mode: true,    // keep file mode
  cover: true    // cover file when exists, default is true
});

process.stdout.write(' Copied ' + fromParam + ' to the ' + toParam + ' \n\n');
