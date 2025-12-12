import { copyFileSync, readdirSync, rmSync } from 'fs';
import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import { sassPlugin } from 'esbuild-sass-plugin';
import { generateSW } from 'workbox-build';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const gzipPlugin = require('./esbuild-plugin-gzip.js');
const pkg_json = require('maplibre-gl/package.json');

let devmode = process.argv[2] === 'dev';

const outFolder = devmode ? 'out' : 'build';

// clean the out folder
readdirSync(outFolder).forEach(f => rmSync(`${outFolder}/${f}`));

const assetNamePattern = devmode ? '[name]' : '[name]-[hash]';
const bldo = {
	entryPoints: ['src/index.html'],
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
		'.pbf': 'file',
		'.pmtiles': 'file',
		'.png': 'file',
		'.svg': 'dataurl',
		'.ttf': 'dataurl',
		'.woff': 'dataurl'
	},
	dropLabels: devmode ? ['PRODUCTIONMODE'] : ['DEVELOPMENTMODE', 'TEST'],
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

	await generateSW({
		swDest: `${outFolder}/sw.js`,
		globDirectory: `${outFolder}/`,
		globPatterns: ['**/*.{js,css,html,pmtiles,svg,png,ico,woff,webmanifest,json}'],
		sourcemap: false,
		maximumFileSizeToCacheInBytes: 3000000,
		cleanupOutdatedCaches: true,
		//navigationPreload: true,
		runtimeCaching: [{
			urlPattern: /https:\/\/my\.friendsofthevaldeserec\.org\/api\//,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'my-fvr',
				expiration: { maxEntries: 16 },
			},
		}]				
	});
}

console.log('done');
