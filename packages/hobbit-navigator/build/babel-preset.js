const BABEL_ENV = process.env.BABEL_ENV;
const building = BABEL_ENV != undefined && BABEL_ENV !== 'cjs';

module.exports = {
    presets: [
        [ 
            'env', {
                loose: true,
                modules: building ? false : 'commonjs',
            },
        ],
        'stage-3',
    ],
    plugins: [
        'external-helpers',
    ],
};
