import * as g from './globals.js';
import {vlpConfig} from './config.js';

import 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.featuregroup.subgroup';

import {createSVGIcon} from './leaflet/vlp-mdi-icons.js';

import {calcTrailDistance,processGeonote} from './leaflet/myfvrGeoNotes.js';
//import {GroupedLayersControl} from './leaflet/GroupedLayersControl.js';
import {addProtomapLayer} from  './leaflet/osmlayer.js';
import {YAHControl} from './leaflet/yahControl.js';
import {RotateImageLayer} from './leaflet/RotateImageLayer.js';
import {FVRWatermarkControl} from './leaflet/FVRWatermarkControl.js';
import './leaflet/PathLabel.js';
//import {AntPath, antPath} from 'leaflet-ant-path';

import img_parkcontours from './img/park-contour.png';
import map_pmtiles from './img/vlp.pmtiles';
//import geojson_water from './features/catawba-river.geo.json';
import geo_brtTrails from './features/brtTrails.geo.json';
import geo_vlpFeatures from './features/vlpFeatures.geo.json';
import geo_vlpLogging from './features/vlpLogging.geo.json';
import geo_vlpMaintenance from './features/vlpMaintenance.geo.json';
import geo_vlpTrails from './features/vlpTrails.geo.json';
import geo_vlpTrailfest10k from './features/vlpTrailfest10k.geo.json';

const vlpDebug = g.vlpDebug;
const geo_JSONS = {geo_brtTrails,geo_vlpFeatures,geo_vlpLogging,geo_vlpMaintenance,geo_vlpTrails,geo_vlpTrailfest10k};

L.Marker.prototype.options.icon = createSVGIcon('marker');

function styleForGeoPath(feature) {
	let prop = feature.properties;
	let lstyle = {stroke:true,color:prop.color||'brown',weight:prop.weight||4,fill:false,opacity:0.6};
	if (!prop.class) {
		if (prop.style == 'hint') {
			lstyle.dashArray = '2 3';
			lstyle.opacity = 1;
			lstyle.weight = 1.0;
		}
	} else if (['parking'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'grey',color:'black',fill:true,weight:1,opacity:0.7};
	} else if (['pavilion'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'forestgreen',color:'black',fill:true,weight:1,opacity:0.7};
	} else if (['stairs','ramp'].includes(prop.class)) {
		lstyle.color = 'brown';
		lstyle.dashArray = '2 3';
		lstyle.opacity = 1;
		lstyle.weight = 1.0;
	} else if (['pier','stage','bridge'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'burlywood',color:'black',fill:true,weight:1,opacity:1}; // fillColor:'saddlebrown',
	} else if (['dogpark'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'darkgreen',color:'#c0c0c0',fill:true,weight:3,opacity:1}; // fillColor:'green',
	} else if (['bathroom'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'grey',color:'black',fill:true,weight:1,opacity:1}; // fillColor:'darkblue',
	}

	if (lstyle.fill) { lstyle.fillOpacity = lstyle.opacity; }

	return lstyle;
}

function styleForGeoPoints(feature) {
	return {stroke:true,color:feature.properties.color||'#00aa66',weight:8,fill:false,opacity:0.6};
}

function createGeojsonMarker(geoJsonPt, latlng) {
	return L.marker(latlng,{icon:createSVGIcon(geoJsonPt.properties.icon)}).bindPopup(geoJsonPt.properties.tip);
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
	let osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxNativeZoom: 18,
		maxZoom: 22
	});
	
	function gps(latitude,longitude) { return new L.LatLng(latitude,longitude); }
	function routeToFVR(e) {
		e.stopPropagation();
		router.navigate('fvr');
	}
	function calcLatLngsLength(l) {
		let d = 0.03;
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
			if (nm && lbl) {
				let dist = calcLatLngsLength(layer.getLatLngs()).toFixed(1);
				if (dist > 0) {
					layer.bindTooltip(`${nm}<br><span class="mileage">(${dist} Miles)</span>`,{'sticky': true});
					layer.setPathLabel(nm,{placement:lbl});
				}
			}
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
	layerControl.addBaseLayer(osmTiles,'Open Street Map - Online Tiles');
	layerControl.addOverlay(contourLayer,'Contour Lines');

	map.on("zoomend", (ev) => {
		let z = map.getZoom();
		let c = map.getZoomScale(z, 19);
		let iconsz = Math.min(Math.max(Math.round(40*c),12),200);
		document.documentElement.style.setProperty('--mapiconsize', iconsz+'px');

		if (g.vlpDebugMode) console.log('zoom',z)
	});

	if (g.vlpDebugMode) {
		map.on('click',e => {
			vlpDebug('@('+e.latlng.lat.toFixed(6)+','+e.latlng.lng.toFixed(6)+'): ');
		});
	}
	
	/*
	function maketrail(grp,visible,opacity,weight,v) {
		let nlo = {color:v.color,opacity:opacity,weight:weight};

		if (v.dash) {
			nlo['dashArray'] = "1 3";
			nlo['weight'] = Math.min(1,weight);
		}

		let layerFG = [];
		let trailcounter = 0;
		while (++trailcounter < 10) {
			let polyname = 'trail';
			if (trailcounter > 1) polyname = polyname.concat(trailcounter);
			if (!v[polyname]) break;
			let vtrail = v[polyname];
			let polylineObj;
			if (v.antpath) {
				nlo.delay = 1600;
				nlo.dashArray = [10,20];
				polylineObj = new AntPath(vtrail, nlo);
			} else {
				polylineObj = L.polyline(vtrail, nlo);
			}
			layerFG.push(polylineObj);
		}

		if (!layerFG) return false;

		let newFG = L.featureGroup(layerFG);
		let tt = `<span style="color:${v.color}">${v.name} </span>`;
		if (v.miles) {tt += `<span class="mileage">(${v.miles} miles)</span>`; }
		newFG.bindTooltip(tt,{ 'sticky': true });

		return {group: grp, name: tt, layer: newFG, visible: !v.optional||visible};
	}
	*/

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