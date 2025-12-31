import 'leaflet';
import {createSVGIcon} from './vlpLeafletIcons';
import {AntPath, antPath} from 'leaflet-ant-path';
//import geo_vlpTrails from '../features/vlpTrails.geo.json';

export function p2pDist(p1,p2) { return L.CRS.EPSG3857.distance(L.latLng(p1),L.latLng(p2)); }

export function findIntersect(t,p) {
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

export function makeIntersectingTrail(t,p1,p2) {
	let i1 = findIntersect(t,p1);
	let i2 = findIntersect(t,p2);
	return (i1 == i2) ? [] : t.slice(Math.min(i1.idx,i2.idx),Math.max(i1.idx,i2.idx)+1);
}

export function calcTrailDistance(t) {
	let d = 0.0;
	for (let i=t.length-1;i>0;i--) { d += p2pDist(t[i],t[i-1]);}
	return d/1609.0;
}

export function processGeonote(lgrp,j) {
	let focustrail = null;
	let focusinfomark = null;
	let focusinfotext = '';
	let coords = j.coords;
	let totalDist = 0.0;
	let infoText = '';
	let p1 = false;
	let p1a = false;
	
	if ((typeof j != 'object') || !j.share) return;
	
	if (j.focus) {
		let trailname = j.focus+'.trail';
		focustrail = vlpApp.layers[trailname];
		if (focustrail) focustrail = focustrail.trail;
	}

	//if (coords.length) {
		//className:'geonoteshare',
	//	L.marker([35.774320,-81.550033],{icon: L.divIcon({iconSize:null,html:`<span style="white-space:nowrap;font-size:15pt;">${j.share}</span>`})}).addTo(lgrp);
	//}

	for (let i=0; i<coords.length;i++) {
		let pn = coords[i];
		let isPtrNode = pn.text.startsWith('-') || !focustrail;
		if (!p1) {
			if (isPtrNode) {
				let icon_nm = pn.text.split(' ',1)[0];
				let poptxt = `<h5>${j.share}</h5>`+pn.text.substr(icon_nm.length+1);
				let marker = L.marker(pn.latlng,{icon:createSVGIcon(icon_nm.substring(1))});
				lgrp.addLayer(marker.bindPopup(poptxt));
				if (!focusinfomark) {
					focusinfomark = marker;
					focusinfotext = poptxt;
				}
			}
			else { p1 = p1a = pn; }
			continue;
		}

		let startnode = isPtrNode ? p1a : p1;
		let subtrail = makeIntersectingTrail(focustrail,startnode.latlng,pn.latlng);
		if (subtrail.length < 1) continue;
		let subtrailDist = calcTrailDistance(subtrail);
		if (isPtrNode) {
			infoText += `<br>(${subtrailDist.toFixed(2)} miles) ${pn.text}`;
			p1a = pn;
		} else {
			let subtrailDesc = `${subtrailDist.toFixed(2)} miles: ${startnode.text} ${pn.text}`;
			let tlayer = new AntPath(subtrail, {color:'#e4007c',opacity:1,weight:4,delay:1600,dashArray:[10,20]});
			tlayer.bindPopup(subtrailDesc);
			lgrp.addLayer(tlayer);
			totalDist += subtrailDist;
			infoText += `<br>${subtrailDesc}`;
			p1 = p1a = false;
		}
	}
	if (focustrail) {
		infoText = `<b>Current Trail: ${totalDist.toFixed(2)} miles</b><br>${infoText}`;
		lgrp.bindPopup(infoText);
		if (focusinfomark) { focusinfomark.bindPopup(`${focusinfotext}${infoText}`); }
	} 
}
