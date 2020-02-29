import copy from 'rollup-plugin-copy';

let path = require('path');
let devDestinationDir = path.join(__dirname, '..', 'static_build');

if (!process.env.FRONTEND_ASSSET_ROOT_DIR) {
    console.log('env FRONTEND_ASSSET_ROOT_DIR not set, using default asset directory');
}
let destinationRootDir = process.env.FRONTEND_ASSSET_ROOT_DIR || devDestinationDir;
console.log('Destination directory:', destinationRootDir);
let outputDir = path.resolve(destinationRootDir);


export default [
    {
        input: "jsdoc.js",
        output: {
            format: 'esm'
        },
        plugins: [
            copy({
                './jsdoc_out': path.resolve(outputDir, 'jsdoc')
            })
        ]
    },

]
