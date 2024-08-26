const process = require('node:process');
const path = require('path');
const fs = require('fs');

let argv = process.argv.slice(2);
let fname;
let data = {"type":"FeatureCollection","features":[]};

while (fname = argv.shift()) {
	//console.log('processing',fname);
	let fc = JSON.parse(fs.readFileSync(fname).toString());
	fc.features.forEach((ftr) => data.features.push(ftr));
}
	
process.stdout.write(JSON.stringify(data));

