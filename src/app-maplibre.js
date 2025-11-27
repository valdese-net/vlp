import { installPWAServiceWorker } from './app-workbox.js';
import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl';
import { PMTiles, Protocol, FileSource } from "pmtiles";

PRODUCTIONMODE: installPWAServiceWorker();

//window.NWMAPLIBRE = {Map, PMTiles, Protocol, FileSource};

const map = new Map({
    container: 'map', // container id
    style: 'https://demotiles.maplibre.org/globe.json', // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 1 // starting zoom
});

map.addControl(new GeolocateControl()); // {positionOptions: {enableHighAccuracy: true},trackUserLocation: false}
map.addControl(new NavigationControl({showCompass:true,showZoom:true,visualizePitch:true,visualizeRoll:true}), 'top-right');
