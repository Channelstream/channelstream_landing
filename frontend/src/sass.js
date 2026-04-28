// Bring the bare-css base files in via Vite's CSS pipeline. They used to be
// `@import 'sanitize.css'` lines inside main.scss, but Dart Sass treats a
// `.css` extension as a plain CSS @import (i.e. it does *not* inline the
// file the way node-sass did). Importing them from JS bundles them into the
// extracted bundle-sass.css output.
import './sass/sanitize.css';
import './sass/codehilite.css';
import './sass/main.scss';
import '../node_modules/codemirror/lib/codemirror.css';
import '../node_modules/codemirror/theme/darcula.css';
import "../node_modules/noty/lib/noty.css";
