import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import postcssImport from 'postcss-import';
import analyze from 'rollup-plugin-analyzer';

let path = require('path');
let devDestinationDir = path.join(__dirname, '..', 'static');

if (!process.env.FRONTEND_ASSSET_ROOT_DIR) {
    console.log('env FRONTEND_ASSSET_ROOT_DIR not set, using default asset directory');
}
let destinationRootDir = process.env.FRONTEND_ASSSET_ROOT_DIR || devDestinationDir;
console.log('Destination directory:', destinationRootDir);
let outputDir = path.resolve(destinationRootDir);


export default [
    {
        input: 'src/app.js',
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
                './node_modules/@channelstream/channelstream': path.resolve(outputDir, 'node_modules/@channelstream/channelstream'),
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
