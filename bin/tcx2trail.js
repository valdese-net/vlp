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

	let tcxData = fs.readFileSync(fname).toString();
	let out = [];
	const title = extractValue(tcxData.match(/<Name>([^<]+)/i));
	out.push(`name: '${title}'`);
	out.push(`trail:`);
	
	const pospts = tcxData.match(/<Position>.*?<\/Position/igms);
	pospts.forEach(ptD => {
		const latD = extractValue(ptD.match(/<LatitudeDegrees>([^<]+)/));
		const lngD = extractValue(ptD.match(/<LongitudeDegrees>([^<]+)/));
		out.push(`- [${latD},${lngD}]`);
	});
	fs.writeFileSync(fname.replace('.tcx','')+`.trail`,out.join('\n'));
}

let argv = process.argv.slice(2);
let fname;
while (fname = argv.shift()) {
	console.log(`converting ${fname}\n`);
	convert(fname);
}
