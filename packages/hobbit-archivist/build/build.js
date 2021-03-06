const fs = require('fs');
const execSync = require('child_process').execSync;
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

const exec = (command, extraEnv) =>
    execSync(command, {
        stdio: 'inherit',
        env: Object.assign({}, process.env, extraEnv),
    });

console.log('Building CommonJS modules ...');

exec('babel src --out-dir . --ignore __tests__', {
    BABEL_ENV: 'cjs',
});

console.log('\nBuilding ES modules ...');

exec('babel src --out-dir es --ignore __tests__', {
    BABEL_ENV: 'es',
});

console.log('\nBuilding hobbit-archivist.js ...');

exec('rollup -c -f umd -o umd/hobbit-archivist.js', {
    BABEL_ENV: 'umd',
    NODE_ENV: 'development',
});

console.log('\nBuilding hobbit-archivist.min.js ...');

exec('rollup -c -f umd -o umd/hobbit-archivist.min.js', {
    BABEL_ENV: 'umd',
    NODE_ENV: 'production',
});

const size = gzipSize.sync(
    fs.readFileSync('umd/hobbit-archivist.min.js')
);

console.log('\ngzipped, the UMD build is %s', prettyBytes(size));
