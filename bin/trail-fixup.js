const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const { exit } = require('process');

function p2pDist(p1,p2) { return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2); }
function findIntersect(t,p) {
	let m = {idx:-1, dist:99999999};
	for (let i=0; i<t.length; i++) {
		let d = p2pDist(t[i],p);
		if (d < m.dist) {
			m.dist = d;
			m.idx = i;
		}
	}
	return m;
}
function dumpPts(pts) {
	pts.forEach(el => {
		let l1 = parseFloat(el[0]);
		let l2 = parseFloat(el[1]);
		console.log(`- [${l1.toFixed(6)},${l2.toFixed(6)}]`);
	});
}

let argv = process.argv.slice(2);
let fname = argv[0];
let fc = fs.readFileSync(fname).toString();
let trailData = YAML.parse(fc);
let pts = trailData.trail;

console.log('trail:');
dumpPts(pts);
