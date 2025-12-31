import { installPWAServiceWorker } from './app-workbox';
import { Map, LngLatBounds, NavigationControl, GeolocateControl, addProtocol } from 'maplibre-gl';
import { Protocol } from "pmtiles";
import { vlpSVGIcons } from './lib/vlpIcons';
import { vlpLayers } from './vlpLayers';

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

async function addIcon(id:string)
{
	const svg = vlpSVGIcons[id];
	const img = new Image();
	const maxh = 100;
	//img.setAttribute('style',`max-height:${maxh}px;`);
	img.addEventListener("load", () => {
		// we need to standardize the size of the icons such that the symbol icon-size can be used to scale them appropriately
		let w = img.width;
		let h = img.height;
		img.height = maxh;
		img.width = w*(maxh/h);
		map.addImage(id, img);
	});
	img.src = svg;
}
//
for (const id of Object.keys(vlpSVGIcons)) addIcon(id);

vlpLayers(map);

map.addControl(new GeolocateControl({trackUserLocation:true})); // {positionOptions: {enableHighAccuracy: true},trackUserLocation: false}
map.addControl(new NavigationControl({showCompass:true,showZoom:true,visualizePitch:true,visualizeRoll:true}), 'top-right');
//map.fitBounds(bbox);

map.on('zoom', () => {
	console.log('Current zoom level:', map.getZoom());
});

map.on('load', () => {
	console.log(`map has loaded`);
});
