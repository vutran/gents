#!/usr/bin/env node

const mri = require('mri');
const gents = require('./lib').default;

const args = process.argv.slice(2);
const { _, interfaceName } = mri(args);
const url = _.shift();

if (!url) {
    console.error('Missing `url`');
    process.exit(9);
}

if (!interfaceName) {
    console.error('Missing `--interfaceName`');
    process.exit(9);
}

gents(url, interfaceName).then(resp => {
    console.log(resp);
});
