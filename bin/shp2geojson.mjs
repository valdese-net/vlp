// This tool was written in April 2024 in order to create a parcel map layer.
// However, the parcels shape file coordinates used Lambert_Conformal_Conic
// projection, so a switch to gdal tools was required.

import fs from 'fs';
import {combine, parseShp, parseDbf} from 'shpjs';

let argv = process.argv.slice(1);
let cmd = argv.shift();
let shp_fn = argv.shift();
let dbf_fn = argv.shift();
let all_ok = shp_fn && fs.existsSync(shp_fn) && (!dbf_fn || fs.existsSync(dbf_fn));

if (!all_ok) {
	console.warn(`Usage: ${cmd} <shapefile> ?<dbffile>`);
	process.exit(99);
}

let gj = parseShp(fs.readFileSync(shp_fn));

if (dbf_fn) {
	let dbf_d = parseDbf(fs.readFileSync(dbf_fn));
	//fs.writeFileSync('out/dbfdata.json',JSON.stringify(dbf_d));
	gj = combine([gj, dbf_d]);
}

console.log(JSON.stringify(gj));
