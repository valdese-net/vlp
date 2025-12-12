import { rmSync } from 'fs';
import { execSync } from 'node:child_process';

let pmtilefile = 'src/geo/vlp.pmtiles';
rmSync(pmtilefile,{force: true});

execSync(`
	tippecanoe -Z10 -z16 --coalesce-densest-as-needed --simplify-only-low-zooms -f -o ${pmtilefile} \
	--named-layer='burke:./src/geo/burke-boundary-simplified.geo.json' \
	--named-layer='water:./src/geo/lake-rhodhiss-simplified.geo.json' \
	--named-layer='parcels:./src/geo/parcels.geo.json' \
	--named-layer='roads:./src/geo/roads.geo.json' \
	--named-layer='creeks:./src/geo/creeks.geo.json' \
	--named-layer='trails:./src/geo/trails.geo.json' \
	--named-layer='brt:./src/geo/brt.geo.json' \
	--named-layer='features:./src/geo/features.geo.json' \
	--named-layer='poi:./src/geo/poi.geo.json' \
`);
