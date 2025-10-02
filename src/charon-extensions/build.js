const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'browser',
  target: 'es6',
  outfile: 'dist/index.js',
  format: 'esm',
  sourcemap: true,
  external: [] // add any external dependencies here
}).catch(() => process.exit(1));