const path = require('path');
const fs = require('fs');

function extractValue(a) {
	const v = Array.isArray(a) ? a[1] : a;
	return v || 0;
}

function convert(fname) {
	if (!fname || !fs.existsSync(fname)) {
		console.error(`cannot open file '${fname}'`);
		process.exit(1);
	}

	let gpxData = fs.readFileSync(fname).toString();
	let out = [];
	const title = extractValue(gpxData.match(/<name>([^<]+)/i));
	out.push(`name: '${title}'`);
	out.push(`trail:`);
	
	const trackpts = gpxData.match(/<trkpt.*?<\/trkpt/igms);
	trackpts.forEach(ptD => {
		const latD = extractValue(ptD.match(/lat=["']?([^'"]+)/));
		const lngD = extractValue(ptD.match(/lon=["']?([^'"]+)/));
		const eleD = extractValue(ptD.match(/<ele>([^<]+)/));
		out.push(`- [${latD},${lngD},${eleD}]`);
	});
	fs.writeFileSync(fname.replace('.gpx','')+`.trail`,out.join('\n'));
}

let argv = process.argv.slice(2);
let fname;
while (fname = argv.shift()) {
	console.log(`converting ${fname}\n`);
	convert(fname);
}
