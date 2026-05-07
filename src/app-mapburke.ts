import { ControlPosition, MapOptions, Map, Marker, Popup, LngLat, LngLatBounds, NavigationControl, GeolocateControl, FullscreenControl } from 'maplibre-gl';
import { nwMapAddSource, nwMapAddLayers } from './lib/lib-maplibre';
import { globeLayerList } from './globeLayerList';
import { burkeLayerList } from './burkeLayerList';
import {startStoryMap} from './lib/storymap';
import {burkeMapSources} from './lib/mapsources';

export type burkeMapOpts = {
	preFetch?: boolean;
	addGlobe?: boolean;
	addControlsTo?: ControlPosition;
};

const mapSource = burkeMapSources();

export async function nwMakeBurkeMap(mapOpts: MapOptions, opts: burkeMapOpts): Promise<Map> {

	const geoBurke = new LngLat(-81.72,35.75); // Burke County, NC
	const map = new Map(mapOpts);

	map.setGlyphs(mapSource.glyphs);
	map.setSprite(mapSource.sprite);
	if (opts.addGlobe) {
		await nwMapAddSource(map,'globe',mapSource.globe,globeLayerList,'',opts.preFetch);
		map.setProjection({type: "globe"});
	}
	await nwMapAddSource(map,'burke',mapSource.burke,burkeLayerList,'<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',opts.preFetch);

	if (opts.addControlsTo) {
		map.addControl(new GeolocateControl({trackUserLocation:true}), opts.addControlsTo); // {positionOptions: {enableHighAccuracy: true},trackUserLocation: false}
		map.addControl(new NavigationControl({showCompass:true,showZoom:true,visualizePitch:true,visualizeRoll:true}), opts.addControlsTo);
		map.addControl(new FullscreenControl(), opts.addControlsTo);
	}
	return map;
}

if (!window.nwsw) window.nwsw = {};
window.nwsw.MAP = {Map, Marker, Popup, LngLat, LngLatBounds, NavigationControl, GeolocateControl, FullscreenControl, nwMapAddSource, nwMapAddLayers, nwMakeBurkeMap, startStoryMap, theMap: false};

const mapdiv = document.getElementById('the_map');
if (mapdiv && (mapdiv.getAttribute('data-autostart') == '1')) {
	nwMakeBurkeMap({container:'the_map',hash:true}, {preFetch:true,addGlobe:true,addControlsTo:'top-left'}).then((map) => {
		window.nwsw.MAP['theMap'] = map;
	});
}
