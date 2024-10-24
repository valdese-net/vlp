import {unlink} from 'fs';
import esbuild from 'esbuild';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg_json = require('maplibre-gl/package.json')
const gzipPlugin = require('@luncheon/esbuild-plugin-gzip')


// kill any past gz version
//unlink('out/maplibre.js.gz',(err) => {});
//console.log(pkg_json);

const bldo = {
	entryPoints: ['src/maplibre.js'],
	entryNames: `[name]-${pkg_json.version}`,
	bundle: true,
	treeShaking: true,
	minify: true,
	sourcemap: true,
	write: false,
	target: 'es2019', // maplibre uses same in tsconfig
	outdir: 'out',
	loader: {
		'.ttf': 'dataurl'
	},
	plugins: [gzipPlugin({uncompressed:true,gzip:true,brotli:false})],
}

console.log('build mode');
await esbuild.build(bldo);
