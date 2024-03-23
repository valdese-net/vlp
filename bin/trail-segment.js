const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

function p2pDist(p1,p2) { return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2); }
function findIntersect(t,p) {
	let m = {idx:-1, dist:99999999};
	for (let i=0; i<t.length; i++) {
		let d = p2pDist(t[i],p);
		if (d <= m.dist) {
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
let pt1 = argv[1].split(',').map((x) => parseFloat(x));
let pt2 = argv[2].split(',').map((x) => parseFloat(x));
let fc = fs.readFileSync(fname).toString();
let trailData = YAML.parse(fc);
let pts = trailData.trail;
let intersectSpot1 = findIntersect(pts, pt1);
let intersectSpot2 = findIntersect(pts, pt2);
let i1 = intersectSpot1.idx;
let i2 = intersectSpot2.idx;


if (i1 == i2)  {
	console.log('no segment');
} else {
	let t = pts.slice(Math.min(i1,i2),Math.max(i1,i2)+1);
	console.log('trail:');
	dumpPts(t);
}
