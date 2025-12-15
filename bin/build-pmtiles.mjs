import { rmSync } from 'fs';
import { execSync } from 'node:child_process';

let target = process.argv[2]??'maplibre';

let pmtilefile = target == 'maplibre' ? 'src/geo/vlp.pmtiles' : 'src/img/vlp.pmtiles';
rmSync(pmtilefile,{force: true});

let layers = {
	burke: 'burke-boundary-simplified',
	water: 'lake-rhodhiss-simplified',
	parcels: 'parcels',
	roads: 'roads',
	creeks: 'creeks'
};

if (target == 'maplibre') Object.assign(layers, {
	trails: 'trails',
	brt: 'brt',
	features: 'features',
	poi: 'poi'
});

const tl = Object.entries(layers).map(([k,v])=>`--named-layer='${k}:./src/geo/${v}.geo.json'`).join(' ');
execSync(`tippecanoe -Z10 -z16 --coalesce-densest-as-needed --simplify-only-low-zooms -f -o ${pmtilefile} ${tl}`);
