const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const turf = require('@turf/turf');

let argv = process.argv.slice(2);
let fname;
let total = 0.0;
while (fname = argv.shift()) {
	let fc = fs.readFileSync(fname).toString();
	let trailData = YAML.parse(fc);
	const lnglatPath = trailData.trail.map(c => [c[1], c[0]]);
	let lsData = turf.lineString(lnglatPath);
	let miles = turf.length(lsData,{units:'miles'});
	console.log(`${fname}: \t${miles.toFixed(2)} Miles`);
	total += miles;
}
console.log(`Total: \t${total.toFixed(2)} Miles`);
