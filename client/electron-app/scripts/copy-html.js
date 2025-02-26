// scripts/copy-html.js
const fs = require('fs')
const path = require('path')

const srcFile = path.resolve(__dirname, '../src/index.html')
const distFile = path.resolve(__dirname, '../dist/index.html')

fs.copyFileSync(srcFile, distFile)
console.log('Copied index.html to dist folder.')
