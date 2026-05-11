export function burkeMapSources() {
	let url = 'https://map.betterburke.com/r/';

	DEVELOPMENTMODE: url = 'https://s1-map.betterburke.com/r/';
	REMOTEDEV: url = 'http://localhost:8080/';

	const glyphs = url + 'notosans.pbf?{fontstack}_{range}';
	const sprite = url + 'sprites/osm-liberty';
	const globe  = url + 'globe-2605.pmtiles';
	const burke  = url + 'burke-2605a.pmtiles';
	
	return {glyphs,sprite,globe,burke};
}
