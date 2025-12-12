import { installPWAServiceWorker } from './app-workbox.ts';
import { Map, LngLatBounds, NavigationControl, GeolocateControl, addProtocol } from 'maplibre-gl';
import { Protocol } from "pmtiles";
import { getSVGIcon } from './lib/vlpIcons.ts';
import { vlpLayers } from './vlpLayers.ts';

PRODUCTIONMODE: installPWAServiceWorker();

//window.NWMAPLIBRE = {Map, PMTiles, Protocol, FileSource};
var protocol = new Protocol({metadata: false});
addProtocol("pmtiles", protocol.tile);

let bbox = new LngLatBounds([-81.5782,35.7590],[-81.5384,35.7787]);
const map = new Map({
    container: 'map',
	bounds: bbox,
	center: bbox.getCenter(),
	minZoom:10,
	zoom:10,
	attributionControl: false
});

map.addLayer({
	type: "background",
	id: "background",
	paint: {"background-color": "#765d38"},
	layout: {visibility: "visible"},
});

vlpLayers(map);

map.addControl(new GeolocateControl({trackUserLocation:true})); // {positionOptions: {enableHighAccuracy: true},trackUserLocation: false}
map.addControl(new NavigationControl({showCompass:true,showZoom:true,visualizePitch:true,visualizeRoll:true}), 'top-right');
//map.fitBounds(bbox);

const existingImages = {};
// The styleimagemissing event is fired when a style requests an image that hasn't been added to the style's image sprite.
// Unfortunately, maplibre-gl generates a console error message in conjunction with firing this event.
map.on('styleimagemissing', async (e) => {
	let id = e.id;
	if (existingImages[id]) {return;}
	existingImages[id] = true;
	const svgText = getSVGIcon(id);
	const svgDataURL = 'data:image/svg+xml;base64,' + btoa(svgText);

	const img = new Image();
	img.addEventListener("load", () => { map.addImage(id, img);	});
	img.src = svgDataURL;
});

map.on('zoom', () => {
	console.log('Current zoom level:', map.getZoom());
});

map.on('load', () => {
	console.log(`map has loaded`);
});
