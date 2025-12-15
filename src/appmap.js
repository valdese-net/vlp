import * as g from './globals.js';
import {vlpConfig} from './config.js';

import 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.featuregroup.subgroup';

import {createSVGIcon} from './leaflet/vlp-mdi-icons.js';
import {styleForGeoPath, setStyeAfterZoom, styleForGeoPoints} from './leaflet/geo.js';

import {calcTrailDistance,processGeonote} from './leaflet/myfvrGeoNotes.js';
//import {GroupedLayersControl} from './leaflet/GroupedLayersControl.js';
import {addProtomapLayer} from  './leaflet/protomap.js';
import {YAHControl} from './leaflet/yahControl.js';
import {RotateImageLayer} from './leaflet/RotateImageLayer.js';
import {FVRWatermarkControl} from './leaflet/FVRWatermarkControl.js';
import './leaflet/PathLabel.js';
//import {AntPath, antPath} from 'leaflet-ant-path';

import img_parkcontours from './img/park-contour.png';
import map_pmtiles from './img/vlp.pmtiles';
import geo_brtTrails from './geo/brt.geo.json';
import geo_vlpFeatures from './geo/features.geo.json';
import geo_vlpPOI from './geo/poi.geo.json';
import geo_vlpLogging from './geo/logging-trails.geo.json';
import geo_vlpMaintenance from './geo/maintenance.geo.json';
import geo_vlpTrails from './geo/trails.geo.json';

const vlpDebug = g.vlpDebug;
const geo_JSONS = {geo_brtTrails,geo_vlpFeatures,geo_vlpPOI,geo_vlpLogging,geo_vlpMaintenance,geo_vlpTrails};

L.Marker.prototype.options.icon = createSVGIcon('marker');

function createGeojsonMarker(geoJsonPt, latlng) {
	return L.marker(latlng,{icon:createSVGIcon(geoJsonPt.properties.icon)});
}

function vlpAppMap(targetDiv,router) {
	const burkeGISMap = 'https://gis.burkenc.org/default.htm?PIN=2744445905';
	let parkplan_bounds = new L.LatLngBounds(vlpConfig.gpsBoundsParkPlan);
	let valdese_area = new L.LatLngBounds(vlpConfig.gpsBoundsValdese);
	let gpsCenter = parkplan_bounds.getCenter();
	let map = L.map(targetDiv,{
		zoomControl: !L.Browser.mobile,
		center: gpsCenter,
		minZoom: vlpConfig.osmZoomRange[0],
		zoom: vlpConfig.osmZoomRange[0],
		zoomDelta: 0.5,
		zoomSnap: 0.5,
		maxZoom: vlpConfig.osmZoomRange[1],
		maxBounds: valdese_area
	});
	let scaleControl = L.control.scale({maxWidth:150,position:'bottomleft'}).addTo(map);
	let layerControl = L.control.layers({}, {},{sortLayers:true}).addTo(map);
	let geo_Layers = {};
	let extra_Layers = [];
	let fvrMark = new FVRWatermarkControl({position:'bottomleft'});	
	let yahBtn = new YAHControl({maxBounds: parkplan_bounds});
	let contourLayer = new RotateImageLayer(img_parkcontours, vlpConfig.gpsBoundsParkContour,{rotation:vlpConfig.gpsBoundsLayerRotate,attribution:`<a target="_blank" href="${burkeGISMap}">gis.burkenc</a>`});
	
	function gps(latitude,longitude) { return new L.LatLng(latitude,longitude); }
	function routeToFVR(e) {
		e.stopPropagation();
		router.navigate('fvr');
	}
	function calcLatLngsLength(l) {
		let d = 0.04;
		for (let i=0;i<l.length-1;i++) {
			d += map.distance(l[i],l[i+1]);
		}
		return d/1609.344;
	}

	function geojsonAfterAdd(feature, layer) {
		//console.log('geojsonAfterAdd',feature,layer);
		if (feature.geometry && (feature.geometry.type == 'LineString')) {
			let nm = feature.properties.name;
			let lbl = feature.properties.label;
			let dist = calcLatLngsLength(layer.getLatLngs()).toFixed(1);

			if (nm && lbl) { layer.setPathLabel(nm,{placement:lbl, calcDistance:`${dist} Miles`}); }
		}
	}

	map.attributionControl.setPrefix('');
	yahBtn.bindTo(map);
	fvrMark.addTo(map);
	map.attributionControl.addAttribution(`V${vlpApp.appd.appver}`);
	map.attributionControl.addAttribution('<a href="#fvr" data-navigo>FVR</a>');
	
	//.bindPopup(geoJsonPt.properties.tip);
	let infomark = L.marker([35.774083,-81.545630],{icon:createSVGIcon('info')});
	infomark.addTo(map);
	infomark.on('click', e => {
		//console.log('infomark clicked');
		router.navigate('about');
	});

	fvrMark.getContainer().addEventListener('click', routeToFVR);

	addProtomapLayer(map,layerControl,map_pmtiles);
	layerControl.addOverlay(contourLayer,'Contour Lines');

	map.on("zoomend", (ev) => {
		let z = map.getZoom();
		let iconsz = 1.75 * (2 ** Math.max(0,z-14));
		document.documentElement.style.setProperty('--mapiconsize', iconsz+'px');

		for (lgrp in geo_Layers) geo_Layers[lgrp].eachLayer((l) => {
			if (map.hasLayer(l)) setStyeAfterZoom(l,z);
		});

		if (g.vlpDebugMode) {
			console.log(`zoom ${z}`);
		}
	});

	if (g.vlpDebugMode) {
		map.on('click',(e) => vlpDebug(`@(${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}): zoom ${map.getZoom()}`));
	}
	
	this.showConfig = function(pagedata,oldmap) {
		let pageopts = pagedata.opts || {};
		let addlayers = pagedata.layers || [];
		let firstTime = !('geo_vlpFeatures' in geo_Layers);
		extra_Layers.forEach(layer => {
			map.removeLayer(layer);
		});
		extra_Layers = [];
		Object.entries(geo_JSONS).forEach(([layerid, json]) => {
			let existingLayer = geo_Layers[layerid];
			if (!addlayers.includes(layerid)) {
				if (existingLayer && map.hasLayer(existingLayer)) map.removeLayer(existingLayer);
			} else {
				// if needed, create layer, then add it
				if (!existingLayer) {
					existingLayer = geo_Layers[layerid] = L.geoJSON(json,{
						pointToLayer: createGeojsonMarker,
						style: styleForGeoPath,
						onEachFeature: geojsonAfterAdd
					});
				}
				map.addLayer(existingLayer);
			}
		});

		if (pageopts.geonoteURL) {
			let lgrp = L.layerGroup();
			console.log(`adding pageopts.geonoteURL ${pageopts.geonoteURL}`);

			fetch(pageopts.geonoteURL).then(r => r.json()).then(j => {
				processGeonote(lgrp,j);
				extra_Layers = [lgrp];
				lgrp.addTo(map);
			});
		}
		if (firstTime) map.fitBounds(parkplan_bounds);
	}
}

function vlpAddNotification(msg) {
	let oldcount = g.locationErrors.length + 1;
	while (oldcount-- > 99) g.locationErrors.pop();
	g.locationErrors.unshift(msg);
	let toolBtn = document.querySelector('#btnid-info');
	let toolBtnSup = toolBtn.querySelector('sup');
	if (toolBtn && !oldcount) { toolBtn.classList.add('active'); }
	if (toolBtnSup)	{
		toolBtnSup.textContent = g.locationErrors.length.toString();
	}
}

export {vlpAppMap,vlpAddNotification};