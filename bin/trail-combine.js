const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

function p2pDist(p1,p2) { return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2); }
function p2tMin(p1,t) { return Math.min(p2pDist(p1,t[0]),p2pDist(p1,t[t.length-1])); }
function trailMerge(t,t2) {
	if (t.length) {
		let t_first_l = p2tMin(t[0],t2);
		let t_last_l = p2tMin(t[t.length-1],t2);
		if (t_first_l < t_last_l) {
			t.reverse();
			t_last_l = t_first_l;
		}
		if (p2pDist(t[t.length-1],t2[0]) > t_last_l) t2.reverse();
	}

	return t.concat(t2);
}
let argv = process.argv.slice(2);
let trailPts = [];
let fname;
while (fname = argv.shift()) {
	let fc = fs.readFileSync(fname).toString();
	let trailData = YAML.parse(fc);
	if (trailData.trail2) {
		trailData.trail = trailMerge(trailData.trail,trailData.trail2);
	}
	trailPts = trailMerge(trailPts,trailData.trail);
}

trailPts.forEach(el => {
	console.log(`- [${el[0]},${el[1]}]`);
});
