const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

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
		console.log(`- [${el[0]},${el[1]}]`);
	});
}

let argv = process.argv.slice(2);
let fname = argv[0];
let atPt = [argv[1],argv[2]];
let fc = fs.readFileSync(fname).toString();
let trailData = YAML.parse(fc);
let pts = trailData.trail;
let intersectSpot = findIntersect(pts, atPt);
let i = intersectSpot.idx;

if (!i || (i>=(pts.length-1)))  {
	console.log('no intersect needed');
} else {
	let t1 = pts.slice(0,i+1);
	let t2 = pts.slice(i);
	console.log('trail:');
	dumpPts(t1);
	console.log('trail2:');
	dumpPts(t2);
}
