import { installPWAServiceWorker } from './app-workbox.js';
import { Map, NavigationControl, GeolocateControl, addProtocol } from 'maplibre-gl';
import { Protocol } from "pmtiles";
import {vlpStyle} from './vlp-style.js';

PRODUCTIONMODE: installPWAServiceWorker();

//window.NWMAPLIBRE = {Map, PMTiles, Protocol, FileSource};
var protocol = new Protocol({metadata: false});
addProtocol("pmtiles", protocol.tile);

const map = new Map({
    container: 'map',
    style: vlpStyle,
	maxBounds: [[-81.5782,35.7590], [-81.5384,35.7787]],
	hash: "show",
	attributionControl: false
});

map.addControl(new GeolocateControl()); // {positionOptions: {enableHighAccuracy: true},trackUserLocation: false}
map.addControl(new NavigationControl({showCompass:true,showZoom:true,visualizePitch:true,visualizeRoll:true}), 'top-right');

map.on('zoom', () => {
    console.log('Current zoom level:', map.getZoom());
});
