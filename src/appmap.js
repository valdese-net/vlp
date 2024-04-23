import * as g from './globals.js';
import {vlpConfig} from './config.js';

import 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.featuregroup.subgroup';
import 'leaflet-measure';

import {createSVGIcon} from './vlp-mdi-icons';

import {GroupedLayersControl} from './leaflet/GroupedLayersControl.js';
import {addProtomapLayer} from  './leaflet/osmlayer.js';
import {YAHControl} from './leaflet/yahControl.js';
import {RotateImageLayer} from './leaflet/RotateImageLayer.js';
import {FVRWatermarkControl} from './leaflet/FVRWatermarkControl.js';
import {AntPath, antPath} from 'leaflet-ant-path';

import './vlp-manifest-icons.js';
import blankImage from './img/blank.png';
import blankTile from './img/blankTile.png';
import img_parkcontours from './img/park-contour.png';
import map_pmtiles from './img/valdese-area.pmtiles';
import geo_vlp_parcels from './img/vlp-parcels.json';

const vlpDebug = g.vlpDebug;

L.Marker.prototype.options.icon = createSVGIcon('marker');

// Fix measure control for latest leaflet
// https://github.com/ljagis/leaflet-measure/issues/171
L.Control.Measure.include({
	// set icon on the capture marker
	_setCaptureMarkerIcon: function () {
		// disable autopan
		this._captureMarker.options.autoPanOnFocus = false;

		// default function
		this._captureMarker.setIcon(
			L.divIcon({
				iconSize: this._map.getSize().multiplyBy(2)
			})
		);
	},
});

function p2pDist(p1,p2) { return L.CRS.EPSG3857.distance(L.latLng(p1),L.latLng(p2)); }
function findIntersect(t,p) {
	let m = {idx:-1, dist:99999999};
	for (let i=0; i<t.length; i++) {
		let d = p2pDist(t[i],p);
		if (d <= m.dist) {
			m.dist = d;
			m.idx = i;
		}
	}
	return m;
}
function makeIntersectingTrail(t,p1,p2) {
	let i1 = findIntersect(t,p1);
	let i2 = findIntersect(t,p2);
	return (i1 == i2) ? [] : t.slice(Math.min(i1.idx,i2.idx),Math.max(i1.idx,i2.idx)+1);
}
function calcTrailDistance(t) {
	let d = 0.0;
	for (let i=t.length-1;i>0;i--) { d += p2pDist(t[i],t[i-1]);}
	return d/1609.0;
}

function vlpAppMap(targetDiv,router) {
	const burkeGISMap = 'http://gis.burkenc.org/default.htm?PIN=2744445905';
	let zoomRemoved = false;
	let parkplan_bounds = new L.LatLngBounds(vlpConfig.gpsBoundsParkPlan);
	let valdese_area = new L.LatLngBounds(vlpConfig.gpsBoundsValdese);
	let gpsCenter = parkplan_bounds.getCenter();
	let map = L.map(targetDiv,{
		zoomControl: !L.Browser.mobile,
		center: gpsCenter,
		minZoom: vlpConfig.osmZoomRange[0],
		zoom: vlpConfig.osmZoomRange[0],
		zoomDelta: .8,
		zoomSnap: 0.616, //Starting at 8
		maxZoom: vlpConfig.osmZoomRange[1],
		maxBounds: valdese_area
	});
	
	let fvrMark = new FVRWatermarkControl({position:'bottomleft'});	
	let yahBtn = new YAHControl({maxBounds: parkplan_bounds});
	let osmOnlyLayer = new L.ImageOverlay(blankImage, [[35.776043,-81.549904],[35.775486,-81.548724]],{opacity:0});
	let contourLayer = new RotateImageLayer(img_parkcontours, vlpConfig.gpsBoundsParkContour,{rotation:vlpConfig.gpsBoundsLayerRotate,attribution:`<a target="_blank" href="${burkeGISMap}">gis.burkenc</a>`});
	let parkBaseMaps = {"Open Street Map": osmOnlyLayer,"Contour": contourLayer};

	function gps(latitude,longitude) { return new L.LatLng(latitude,longitude); }
	function routeToFVR(e) {
		e.stopPropagation();
		router.navigate('fvr');
	}

	map.attributionControl.setPrefix('');
	yahBtn.bindTo(map);
	fvrMark.addTo(map);
	map.attributionControl.addAttribution(`V${vlpApp.appd.appver}`);
	map.attributionControl.addAttribution('<a href="#fvr" data-navigo>FVR</a>');
	
	fvrMark.getContainer().addEventListener('click', routeToFVR);

	addProtomapLayer(map, map_pmtiles);

	L.geoJSON(geo_vlp_parcels, {
		style: function (feature) { return {stroke:true,color:'#80AA80',weight:1,fill: true,fillColor:'#90EE90',opacity:0.3};	}
	}).addTo(map);

	if (g.vlpDebugMode) {
		map.on("zoomend", (ev) => { console.log('zoom',map.getZoom()) })
		map.on('click',e => {
			vlpDebug(e.latlng.lat.toFixed(6)+','+e.latlng.lng.toFixed(6));
		});
	}

	function maketrail(grp,visible,opacity,weight,v) {
		let nlo = {color:v.color,opacity:opacity,weight:weight};

		if (v.dash) {
			nlo['dashArray'] = "10";
			nlo['weight'] = Math.min(5,weight);
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

	// we are using the term layer here in a generic sense, as the layers can also be controls
	function mapHasLayer(g) {
		if (g instanceof L.Layer) return map.hasLayer(g);
		return true;
	}

	this.clearConfig = function(pagedata) {
		if (!pagedata.cache) return;
		let cache = pagedata.cache;
		let layers = cache.layers;

		cache.mapview.zoom = map.getZoom();
		cache.mapview.center = map.getCenter();

		for (let i=layers.length; i>0; i--) {
			let layer = layers[i-1];
			if (layer.visible = mapHasLayer(layer.layer)) {
				layer.layer.remove();
			}
		}
	}

	this.showConfig = function(pagedata) {
		let pageopts = pagedata.opts || {};
		let cache = pagedata.cache || {layers: []};
		let doCacheInit = !pagedata.cache;

		if (doCacheInit) {
			let maxBoundsRaw = vlpConfig.gpsBoundsValdese;
			let maxBoundsLL = new L.LatLngBounds(maxBoundsRaw);
			let yahBoundsLL =  new L.LatLngBounds(pageopts.yahBounds || maxBoundsRaw);
			let baselayers = {};

			cache.mapview = {
				maxBounds: maxBoundsLL,
				yahBounds: yahBoundsLL,
				zoom: (vlpConfig.osmZoomRange[0]+vlpConfig.osmZoomRange[1])/2,
				center: yahBoundsLL.getCenter()
			}

			if (pageopts.addParkOverlays) {
				baselayers = parkBaseMaps;
			}

			let basekeys = Object.keys(baselayers);
			if (basekeys) basekeys.forEach((k,ki) => cache.layers.push({name: k, layer: baselayers[k], visible: (ki == 0)}));

			if (pagedata.layers) pagedata.layers.forEach(layer => {
				let l_opacity = layer.opacity || 0.85;
				let l_weight = layer.weight || 3;
				let clusterGroup = null;
		
				layer.list.forEach(resname => {
					let ext = /[^.]+$/.exec(resname);
					let yamlData = vlpApp.layers[resname];
		
					if (!yamlData) return;
		
					if (ext == 'trail') {
						cache.layers.push(maketrail(layer.group,layer.visible,l_opacity,l_weight,yamlData));
					} else if (ext == 'mapmarks') {
						let markerPts = [];
		
						if (!yamlData.markers) return;
		
						yamlData.markers.forEach(v => {
							markerPts.push(L.marker(v[0],{icon:createSVGIcon(v[1])}).bindPopup(v[2]));
						});
		
						if (!clusterGroup) {
							clusterGroup = L.markerClusterGroup({maxClusterRadius:20});
							cache.layers.unshift({layer: clusterGroup, visible: true});
						}
						let fg = L.featureGroup.subGroup(clusterGroup, markerPts);
						cache.layers.push({group:layer.group, name: yamlData.name, layer: fg, visible: !yamlData.optional});
					}
				});
			});			
	
			if (cache.layers.length > 0) {
				let grpOverlays = {};
				// add the GroupedLayersControl to the cache
				cache.layers.forEach(v => {
					if (v.group) {
						if (!grpOverlays[v.group]) grpOverlays[v.group] = {};
						grpOverlays[v.group][v.name] = v.layer;
					}
				});

				let grpctl = new GroupedLayersControl(baselayers,grpOverlays);

				cache.layers.push({layer: grpctl, visible: true});
			}

			if (pageopts.addMeasureControl) {
				let measureControl = L.control.measure({
					position:'bottomright',
					primaryLengthUnit: 'miles',
					secondaryLengthUnit: 'feet',
					primaryAreaUnit: 'acres',
					activeColor: '#000000',
					completedColor: '#000000'
				});

				cache.layers.push({layer: measureControl, visible: true});
			}

			if (pageopts.geonoteURL) {
				let focustrail = vlpApp.layers['Hollipop.trail'].trail;
				let lgrp = L.layerGroup();
				let totalDist = 0.0;
				let infoText = '';
				cache.layers.push({layer: lgrp, visible: true});

				fetch(pageopts.geonoteURL).then(r => r.json()).then(j => {
					for (let i=0; i<j.length-1;i+=2) {
						let p1 = j[i];
						let p2 = j[i+1];
						let subtrail = makeIntersectingTrail(focustrail,p1.latlng,p2.latlng);
						if (subtrail.length > 1) {
							let subtrailDist = calcTrailDistance(subtrail);
							let subtrailDesc = `${subtrailDist.toFixed(2)} miles: ${p1.text}; ${p2.text}`;
							let tlayer = new AntPath(subtrail, {color:'#e4007c',opacity:1,weight:4,delay:1600,dashArray:[10,20]});
							tlayer.bindPopup(subtrailDesc);
							lgrp.addLayer(tlayer);
							totalDist += subtrailDist;
							infoText = `- ${subtrailDesc}<br>${infoText}`;
						}
					}
					infoText = `<b>Finished Trail: ${totalDist.toFixed(2)} miles</b><br>${infoText}`;
					lgrp.bindPopup(infoText);
					lgrp.addLayer(L.marker(j[j.length-1].latlng,{icon:createSVGIcon('info')}).bindPopup(infoText));
				});
			}
	
			pagedata.cache = cache;
		}
	
		if (map.zoomControl) {
			let z = map.zoomControl;
			if (pageopts.hideZoomControl) {
				zoomRemoved = true;
				z.remove();
			} else if (zoomRemoved) {
				zoomRemoved = false;
				z.addTo(map);
			}
		}

		yahBtn.options.maxBounds = cache.mapview.yahBounds;

		cache.layers.forEach(layer => {
			if (layer.visible) layer.layer.addTo(map);
		});

		// on first showing, we try to fit the view around the target area
		if (doCacheInit) map.fitBounds(pageopts.yahZoomStartup ? cache.mapview.yahBounds : cache.mapview.maxBounds);
		else map.setView(cache.mapview.center,cache.mapview.zoom);
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