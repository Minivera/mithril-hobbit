const execSync = require('child_process').execSync;

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

console.log('\nBuilding hobbit.js ...');

exec('rollup -c -f umd -o umd/hobbit.js', {
    BABEL_ENV: 'umd',
    NODE_ENV: 'development',
});

console.log('\nBuilding hobbit.min.js ...');

exec('rollup -c -f umd -o umd/hobbit.min.js', {
    BABEL_ENV: 'umd',
    NODE_ENV: 'production',
});
