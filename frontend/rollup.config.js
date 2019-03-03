import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import postcssImport from 'postcss-import';

let path = require('path');
let devDestinationDir = path.join(__dirname, '..', 'static');

let destinationRootDir = process.env.FRONTEND_ASSSET_ROOT_DIR || devDestinationDir;
console.log('Root directory:', destinationRootDir);
let outputDir = path.resolve(destinationRootDir);


export default [
    {
        input: 'src/index.js',
        output: {
            file: path.resolve(outputDir, 'bundle-main.js'),
            format: 'esm'
        },
        plugins: [
            postcss({
                // Write all styles to the bundle destination where .js is replaced by .css
                inject: false
            }),
            nodeResolve(),
            commonjs()
        ]
    },
    {
        input: 'src/sass.js',
        output: {
            file: path.resolve(outputDir, 'bundle-sass.js'),
            format: 'esm'
        },
        plugins: [
            postcss({
                // Write all styles to the bundle destination where .js is replaced by .css
                extract: true,
                plugins: [postcssImport]
            }),
            copy({
                './node_modules/@webcomponents/webcomponentsjs': path.resolve(outputDir, 'node_modules/@webcomponents/webcomponentsj'),
                './src/svg': path.resolve(outputDir, 'svg'),
                './jsdoc_out': path.resolve(outputDir, 'jsdoc')
            })
        ]
    },

]
copy({
    "src/index.html": "dist/index.html",
    "node_modules/bootstrap/dist": "dist/vendor/bootstrap",
    "node_modules/font-awesome": "dist/vendor/font-awesome",
    verbose: true
})
