const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const turf = require('@turf/turf');

// six decimal places yields accuracy to 0.111 meters
function simplifyval(v) { return parseFloat(parseFloat(v).toFixed(6)); }

let argv = process.argv.slice(2);
let fname;
while (fname = argv.shift()) {
	let outname = fname.replace('.trail','')+'.geojson';
	let fc = fs.readFileSync(fname).toString();
	let trailData = YAML.parse(fc);
	const lnglatPath = trailData.trail.map(c => [simplifyval(c[1]), simplifyval(c[0])]);
	let props = {
		name:	trailData.name,
		color:	trailData.color || "#ccc"
	};
	props.style = 'solid';
	if (trailData.dash) props.style = 'dash';
	else if (trailData.antpath) props.style = 'antpath';
	//
	if (trailData.optional) props.optional = 1;

	let lsData = turf.featureCollection([turf.lineString(lnglatPath,props)]);

	fs.writeFileSync(outname,JSON.stringify(lsData));
}
