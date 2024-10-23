import {unlink} from 'fs';
import esbuild from 'esbuild';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg_json = require('../package.json')

// kill any past gz version
unlink('out/maplibre.js.gz',(err) => {});

const bldo = {
	entryPoints: ['src/maplibre.js'],
	bundle: true,
	treeShaking: true,
	minify: true,
	sourcemap: true,
	target: 'es2019', // maplibre uses same in tsconfig
	outdir: 'out',
	loader: {
		'.ttf': 'dataurl'
	},
}

console.log('build mode');
await esbuild.build(bldo);
