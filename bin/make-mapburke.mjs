import { copyFileSync, readdirSync, rmSync } from 'fs';
import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import { sassPlugin } from 'esbuild-sass-plugin';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const gzipPlugin = require('./esbuild-plugin-gzip.js');
const pkg_json = require('maplibre-gl/package.json');

const devmode = ['dev','remote'].indexOf(process.argv[2])+1;
const buildLabels = ['DEVELOPMENTMODE', 'DEVELOPMENTMODE', 'REMOTEDEV']; 
const dropLabels = buildLabels;
dropLabels.splice(devmode, 1); // drop the label for the current mode
const outFolder = devmode ? 'out' : 'build';

if (!devmode) dropLabels.push('TEST');

// clean the out folder
readdirSync(outFolder).forEach(f => rmSync(`${outFolder}/${f}`));

const assetNamePattern = devmode ? '[name]' : '[name]-v2605b';
const bldo = {
	entryPoints: ['src/burkemap.html'],
	outdir: outFolder,
	assetNames: assetNamePattern,
	chunkNames: assetNamePattern,
	bundle: true,
	treeShaking: true,
	minify: !devmode,
	sourcemap: devmode,
	write: devmode,
	target: 'esnext',
	loader: {
		'.pmtiles': 'dataurl',
		'.png': 'dataurl',
		'.svg': 'dataurl',
		'.ttf': 'dataurl',
		'.woff': 'dataurl'
	},
	dropLabels: dropLabels,
	plugins: [
		htmlPlugin({modulesTarget:'chrome99',scriptsTarget:'chrome99'}),
		sassPlugin()
	],
};

if (devmode) {
	console.log('dev mode');

	let ctx = await esbuild.context(bldo);
	await ctx.serve({servedir: 'out', port: 1337});
} else {
	console.log('build mode');

	bldo.plugins.push(gzipPlugin({uncompressed: true, gzip: ['.html', '.js', '.css', '.json', '.svg']}));
	await esbuild.build(bldo);
}

console.log('done');
