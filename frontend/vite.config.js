// Vite build config for the channelstream landing frontend.
//
// Replaces the previous rollup.config.js. Two entry points are emitted with
// stable filenames so the Pyramid templates that reference them by name keep
// working: bundle-main.js (app code) and bundle-sass.js + bundle-sass.css
// (global stylesheet). Vendor packages and SVG assets that the templates load
// at runtime are copied verbatim into the build output.

import {defineConfig} from 'vite';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {viteStaticCopy} from 'vite-plugin-static-copy';

// __dirname is not defined in ESM; reconstruct it from import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Match the previous rollup behavior: write the build output to
// FRONTEND_ASSSET_ROOT_DIR (set by the Docker build) or fall back to the
// sibling ../static_build directory used during local development.
if (!process.env.FRONTEND_ASSSET_ROOT_DIR) {
    console.log(
        'env FRONTEND_ASSSET_ROOT_DIR not set, using default asset directory'
    );
}
const outDir = path.resolve(
    process.env.FRONTEND_ASSSET_ROOT_DIR ||
        path.join(__dirname, '..', 'static_build')
);
console.log('Destination directory:', outDir);

export default defineConfig({
    build: {
        outDir,
        // Don't wipe sibling files (e.g. svg/ copied by the static-copy plugin)
        // when re-running the build in --watch mode.
        emptyOutDir: false,
        // Modern browsers only — skip the legacy/Babel transform to keep
        // build times small.
        target: 'es2020',
        // We ship plain ES modules; no need for Vite's modulepreload helper.
        modulePreload: false,
        // Don't inline CSS into the JS bundle — we want bundle-sass.css as a
        // standalone file the templates link via <link rel="stylesheet">.
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                // The keys here become the entry filenames (see entryFileNames
                // below), so they must match what the Pyramid templates load.
                'bundle-main': path.resolve(__dirname, 'src/app.js'),
                'bundle-sass': path.resolve(__dirname, 'src/sass.js'),
            },
            output: {
                format: 'esm',
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
                // Keep the extracted bundle-sass.css filename stable; hash
                // any other emitted assets so they remain cache-safe.
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return '[name][extname]';
                    }
                    return '[name]-[hash][extname]';
                },
            },
        },
    },
    plugins: [
        // Mirror the rollup-plugin-copy targets: copy the unbundled vendor
        // packages, SVG assets, and (when present) the jsdoc HTML output into
        // the build directory so the templates can reference them at runtime.
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/@webcomponents/webcomponentsjs',
                    dest: 'node_modules/@webcomponents',
                },
                {
                    src: 'node_modules/@channelstream/channelstream',
                    dest: 'node_modules/@channelstream',
                },
                {
                    src: 'src/svg',
                    dest: '.',
                },
                // Glob form: silently does nothing if jsdoc_out doesn't exist
                // yet (i.e. when `npm run jsdoc` hasn't been run before build).
                {
                    src: 'jsdoc_out/*',
                    dest: 'jsdoc',
                },
            ],
        }),
    ],
});
