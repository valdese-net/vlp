import path from 'node:path';
import * as fs from 'node:fs';
import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import {sassPlugin} from 'esbuild-sass-plugin';
import { generateSW } from 'workbox-build';
import { createRequire } from "module";
import {createEnvironment,createArrayLoader,createFilesystemLoader,createChainLoader } from 'twing';
import { marked } from 'marked';
import YAML from 'yaml'

const require = createRequire(import.meta.url);
const pkg_json = require('maplibre-gl/package.json');
const gzipPlugin = require('./esbuild-plugin-gzip.js');

let devmode = process.argv[2] === 'dev';
const outFolder = devmode ? 'out' : 'build';
fs.readdirSync(outFolder).forEach(f => fs.rmSync(`${outFolder}/${f}`));

async function twigIt(data, context) {
	const loader1 = createArrayLoader({'twig.main': data});
	const loader2 = createFilesystemLoader(fs);
	loader2.addPath('./src');
	const loader = createChainLoader([loader1, loader2]);   
	let twing = createEnvironment(loader, {autoescape:false});

	let response = await twing.render('twig.main', context);
	return response;
}

const mdYAMLHeader = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3}\s+)?([\w\W]*)*/;
const htmYAMLHeader = /^(<!--YAML--(?:\n|\r)([\w\W]+?)(?:\n|\r)-{2}>\s+)?([\w\W]*)*/;
function parseFrontMatter(text, re=mdYAMLHeader) {
	let results = re.exec(text)
		, out = [{},results[3] || '']
		, yamlOrJson;

	if ((yamlOrJson = results[2])) {
		// yaml does not allow tabs, but we do, thus this is needed
		yamlOrJson = yamlOrJson.replace(/\t/g,'   ');
		if (yamlOrJson.charAt(0) === '{') {
			out[0] = JSON.parse(yamlOrJson);
		} else {
			out[0] = YAML.parse(yamlOrJson,{indent:4,schema:'core',prettyErrors:true});
		}
	}

	return out;
}

function genSortKey(a) {
	// empty setting triggers tildes, which are highest character code < 127, forcing those
	// pages to the end of the sort
	let nav = a.nav || '~~~~~';
	return `${nav}:${a.id}`;
}

function loadYamlFile(f) {
	if (!fs.existsSync(f)) return {};
	let rawd = fs.readFileSync(f,'utf8');
	let yd = YAML.parse(rawd.replace(/\t/g,'   '));
	return yd;
}

async function buildMarkdownPage(ifolder,pgid,context) {
	let md = fs.readFileSync(`./src/${ifolder}/${pgid}.md`).toString();
	let mdSplit = parseFrontMatter(md);
	let c2 = Object.assign({},context,{page:mdSplit[0]});
	let mdp = await twigIt(mdSplit[1],c2);
	let html = marked.parse(mdp);
	let match = null;
	let title = (match = /^#\s*(.+)$/m.exec(mdp)) ? match[1] : pgid;

	const infoObj = Object.assign({class:'info',title:title},mdSplit[0],{id: pgid, html: html, _src: md});

	return infoObj;
}

async function load_twig_env() {
	let plginfo = require('../package.json');
	let appd = require('../src/appd.json');
	let bldd = require('../src/build.json');
	let c = {};

	appd.appver = plginfo.version;
	c.appd = appd;

	let icons = {};
	bldd.fvrIcons.forEach(k => icons[k] = `<i class="fvricon fvricon-${k}"></i>`);
	c.icon = icons;

	let pageFolders = bldd.pageIncludes || ['pages'];
	let pages = [];
	let ids = [];

	// We load all `md` and `twig` files in the first folder. We then iterate over
	// other folders, but only include those files with a new unique id. This gives
	// custom folders priority over the main, if they are enabled.
	for (const folder of pageFolders) {
		let flist = fs.readdirSync(path.resolve(`./src/${folder}`),{withFileTypes:true});

		// wait while we asynchronously process all of the pages
		for (const file of flist) {
			if (!file.isFile) continue;

			let match = /^([^.]+)\.(map|md)/.exec(file.name);
			if (!(match && match[2])) continue;
			
			let pgid = match[1];
			let pgtype = match[2];

			// this hook and its matching push must be kept together and called synchronously
			if (ids.includes(pgid)) return;
			ids.push(pgid);

			let pg_r = {ignore: true};
			if (pgtype == 'map') {
				let mapdata = loadYamlFile(`./src/${folder}/${file.name}`);
				pg_r = Object.assign({class:'map',title:pgid},mapdata,{id: pgid});
			} else if (pgtype == 'md') {
				pg_r = await buildMarkdownPage(folder,pgid,c);
			}

			if (!pg_r.ignore) {
				pg_r.sortkey = genSortKey(pg_r);
				pages.push(pg_r);
			}
		}
	}

	pages.sort((a,b) => (a.sortkey < b.sortkey) ? -1 : 1);

	c.pages = pages;

	c.pageids = [];
	pages.forEach(r => c.pageids.push(r.id));
	return c;
}

const assetNamePattern = devmode ? '[name]' : '[name]-[hash]';
const bldo = {
    entryPoints: ['src/index.twig'],
	outdir: outFolder,
	assetNames: assetNamePattern,
	chunkNames: assetNamePattern,
	bundle: true,
	treeShaking: true,
	minify: !devmode,
	sourcemap: devmode,
	write: devmode,
	target: 'chrome99',
	dropLabels: devmode ? ['PRODUCTIONMODE'] : ['DEVELOPMENTMODE', 'TEST'],
	loader: {
		'.pmtiles': 'file',
		'.png': 'file',
		'.jpg': 'file',
		'.svg': 'dataurl',
		'.ttf': 'dataurl',
		'.woff': 'dataurl'
	},
    plugins: [
        htmlPlugin({
			modulesTarget:'chrome99',
			scriptsTarget:'chrome99',
            extensions: ['.html', '.twig'],
            preprocess: async (html, path) => {
				// the await is needed across the board to ensure async operations complete in a serialized manner
				let c_env = await load_twig_env();
				return await twigIt(html,c_env);
            },
        }),
		sassPlugin()
    ],
};

if (devmode) {
	console.log('dev mode');

	let ctx = await esbuild.context(bldo);
	await ctx.serve({servedir: outFolder, port: 1337});
} else {
	console.log('production mode');

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
