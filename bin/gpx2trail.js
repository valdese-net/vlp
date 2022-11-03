const path = require('path');
const fs = require('fs');

function extractValue(a) {
	const v = Array.isArray(a) ? a[1] : a;
	return v || 0;
}

let fname = process.argv[2];

if (!fname || !fs.existsSync(fname)) {
	console.error(`cannot open file '${fname}'`);
	process.exit(1);
}

let gpxData = fs.readFileSync(fname).toString();

const title = extractValue(gpxData.match(/<name>([^<]+)/i));
console.log(`name: '${title}'`);
console.log(`trail:`);

const trackpts = gpxData.match(/<trkpt.*?<\/trkpt/igms);
trackpts.forEach(ptD => {
	const latD = extractValue(ptD.match(/lat=["']?([^'"]+)/));
	const lngD = extractValue(ptD.match(/lon=["']?([^'"]+)/));
	const eleD = extractValue(ptD.match(/<ele>([^<]+)/));
	console.log(`- [${latD},${lngD},${eleD}]`);
});
