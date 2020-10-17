import * as g from './globals.js';
import {vlpConfig} from './config.js';

import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.featuregroup.subgroup';
import 'leaflet-measure';

import {createSVGIcon} from './vlp-mdi-icons';

import {GroupedLayersControl} from './leaflet/GroupedLayersControl.js';
import {ValdeseTileLayer} from './leaflet/ValdeseTileLayer.js';
import {YAHControl} from './leaflet/yahControl.js';
import {RotateImageLayer} from './leaflet/RotateImageLayer.js';
import {FVRWatermarkControl} from './leaflet/FVRWatermarkControl.js';
import {ZoomViewer} from './leaflet/ZoomViewer.js';

import './vlp-manifest-icons.js';
import * as blankTile from './img/blankTile.png';
import * as img_parkplan from './img/dbd-parkplan.png';
import * as img_photo from './img/park-satellite.png';
import * as img_parkcontours from './img/park-contour.png';

const vlpDebug = g.vlpDebug;

L.Marker.prototype.options.icon = createSVGIcon('marker');

function vlpAppMap(targetDiv) {
	const burkeGISMap = 'http://gis.burkenc.org/default.htm?PIN=2744445905';
	let parkplan_bounds = new L.LatLngBounds(vlpConfig.gpsBoundsParkPlan);
	let valdese_area = new L.LatLngBounds(vlpConfig.gpsBoundsValdese);
	let gpsCenter = parkplan_bounds.getCenter();

	let map = L.map(targetDiv,{
		zoomControl: !L.Browser.mobile,
		center: gpsCenter,
		minZoom: vlpConfig.osmZoomRange[0],
		zoom: vlpConfig.osmZoomRange[1],
		maxBounds: valdese_area
	});
	let mapTiles = new ValdeseTileLayer(vlpConfig.urlTileServer, {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		errorTileUrl: blankTile,
		crossOrigin: true,
		minZoom: vlpConfig.osmZoomRange[0],
		maxNativeZoom: vlpConfig.osmZoomRange[1]
		});
	let fvrMark = new FVRWatermarkControl({position:'bottomleft'});
	let yahBtn = new YAHControl({
		position:'topright',
		maxBounds: parkplan_bounds
	});
	let contourLayer = new RotateImageLayer(img_parkcontours, vlpConfig.gpsBoundsParkContour,{rotation:vlpConfig.gpsBoundsLayerRotate,attribution:`<a href="${burkeGISMap}">gis.burkenc</a>`});
	let photoLayer = new RotateImageLayer(img_photo,vlpConfig.gpsBoundsSatellite,{rotation:vlpConfig.gpsBoundsLayerRotate,attribution:`<a href="${burkeGISMap}">gis.burkenc</a>`});
	let parkplanLayer = new RotateImageLayer(img_parkplan,vlpConfig.gpsBoundsParkPlan,{rotation:vlpConfig.gpsBoundsLayerRotate,attribution:'<a href="https://dbdplanning.com/">Destination by Design</a>'});
	let parkBaseMaps = {"Contour": contourLayer,"Photo": photoLayer,"Projected Park Plan":parkplanLayer};

	function gps(latitude,longitude) { return new L.LatLng(latitude,longitude); }

	map.attributionControl.setPrefix('');
	mapTiles.addTo(map);
	yahBtn.addTo(map);
	fvrMark.addTo(map);
	map.attributionControl.addAttribution('<a href="https://friendsofthevaldeserec.org">FVR</a>');

	if (g.vlpDebugMode) {
		new ZoomViewer({position:'topleft'}).addTo(map);
		map.on('click',e => {
			vlpDebug(e.latlng.lat.toPrecision(8)+','+e.latlng.lng.toPrecision(8));
		});
	}

	function maketrail(grp,opacity,weight,v) {
		let nlo = {color:v.color,opacity:opacity,weight:weight};

		if (v.dash) {
			nlo['dashArray'] = "10";
			nlo['weight'] = Math.min(5,weight);
		}
		let newLayer = L.polyline(v.trail, nlo);
		let tt = `<span style="color:${v.color}">${v.name} </span>`;
		if (v.miles) {tt += `<span class="mileage">(${v.miles} miles)</span>`; }

		if (!v.dash) {
			var newLayer1 = newLayer;
			var newLayer2 = L.polyline(v.trail, {color:'#2C3050',weight:1});
			newLayer = L.featureGroup([newLayer1,newLayer2]);
		}
		newLayer.bindTooltip(tt,{ 'sticky': true });

		return {group: grp, name: tt, layer: newLayer, visible: !v.optional};
	}

	// we are using the term layer here in a generic sense, as the layers can also be controls
	function mapHasLayer(g) {
		if (g instanceof L.Layer) return map.hasLayer(g);
		return true;
	}

	this.clearConfig = function(pagedata) {
		let layers = pagedata.cache.layers;

		for (let i=layers.length; i>0; i--) {
			let layer = layers[i-1];
			if (layer.visible = mapHasLayer(layer.layer)) {
				layer.layer.remove();
			}
		}
	}

	this.showConfig = function(pagedata) {
		let pageopts = pagedata.opts || {};
		let maxBounds = new L.LatLngBounds(pageopts.maxBounds || vlpConfig.gpsBoundsValdese);
		let cache = pagedata.cache || {layers: []};

		if (!pagedata.cache) {
			let baselayers = {};

			if (pageopts.addParkOverlays) {
				baselayers = parkBaseMaps;
			}

			let basekeys = Object.keys(baselayers);
			if (basekeys) basekeys.forEach((k,ki) => cache.layers.push({name: k, layer: baselayers[k], visible: (ki == 0)}));

			if (pagedata.layers) pagedata.layers.forEach(layer => {
				let l_opacity = layer.opacity || 0.85;
				let l_weight = layer.weight || 9;
				let clusterGroup = null;
		
				layer.list.forEach(resname => {
					let ext = /[^.]+$/.exec(resname);
					let yamlData = vlpApp.layers[resname];
		
					if (!yamlData) return;
		
					if (ext == 'trail') {
						cache.layers.push(maketrail(layer.group,l_opacity,l_weight,yamlData));
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
	
			pagedata.cache = cache;
		}

		map.setMaxBounds(maxBounds);
		//map.fitBounds(vlpConfig.gpsBoundsParkPlan);

		cache.layers.forEach(layer => {
			if (layer.visible) layer.layer.addTo(map);
		});

		//L.rectangle(vlpConfig.gpsBoundsSatellite, {color: "#ff7800", weight: 1}).addTo(map);
	}
}

export {vlpAppMap};