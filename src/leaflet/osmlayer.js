
import { PMTiles, FileSource } from "pmtiles";
import * as protomapsL from 'protomaps-leaflet';

function osmPaintRules() { return [
{
	dataLayer: "nc",
	symbolizer: new protomapsL.PolygonSymbolizer({fill:'#ccf5cc',doStroke:true,opacity:1,width:1}),
	filter: (zoom, feature) => { return true; }
},{
	dataLayer: "burke",
	symbolizer: new protomapsL.PolygonSymbolizer({fill:'#f5ffe9',doStroke:true,opacity:1,width:2}),
	filter: (zoom, feature) => { return true; }
},{
	dataLayer: "parcels",
	symbolizer: new protomapsL.PolygonSymbolizer({fill:'#90EE90',stroke:'#80AA80',doStroke:true,width:0.5,opacity:0.3}),
	filter: (zoom, feature) => { return true; }
},{
	dataLayer: "water",
	symbolizer: new protomapsL.PolygonSymbolizer({fill: 'steelblue'}),
	filter: (zoom, feature) => {
		if (feature.props.intermittent) return false;
		return true;
	}
},{
	dataLayer: "waterway",
	symbolizer: new protomapsL.LineSymbolizer({color: 'steelblue',width:2}),
	filter: (zoom, feature) => {
		if (feature.props.intermittent) return false;
		return true;
	}
},{
	dataLayer: "building",
	symbolizer: new protomapsL.PolygonSymbolizer({stroke: 'black', fill: '#666'}),
	filter: (zoom, feature) => {
		return true;
	}
},{
	dataLayer: "road",
	symbolizer: new protomapsL.LineSymbolizer({color: '#888',width:1}),
	filter: (zoom, feature) => {
		return true;
	}
},{
	dataLayer: "path",
	symbolizer: new protomapsL.LineSymbolizer({color: 'brown',width:1,dash:[3,3]}),
	filter: (zoom, feature) => {
		return true;
	}
}]}

function osmLabelRules() { return [{
	dataLayer: "label",
 	symbolizer: new protomapsL.LineLabelSymbolizer({fill:"black",stroke:"white",position:"center",labelProps:["name","ref"]})
},{
	dataLayer: "road",
 	symbolizer: new protomapsL.LineLabelSymbolizer({fill:"black",stroke:"white",position:"center",labelProps:["name","ref"]}),
	filter: (zoom, feature) => {
		return feature.props["name"] || feature.props["ref"];
	}
},{
	dataLayer: "waterway",
 	symbolizer: new protomapsL.LineLabelSymbolizer({fill:"black",stroke:"white",position:"center",labelProps:["name","ref"]}),
	filter: (zoom, feature) => {
		return (zoom > 18) && feature.props["name"];
	}
}]}

export function addProtomapLayer(map,layerControl,pmtiles_url) {
	fetch(pmtiles_url)
	.then(function(res) {
		return res.arrayBuffer();
	}).then(function(buf) {
		return new File([buf], 'map.pmtiles', { type:'application/vnd.pmtiles', lastModified:Date.now() });
	}).then(function(pmtfile) {
		let fsrc = new FileSource(pmtfile);
		let protolayer = protomapsL.leafletLayer({
			url: new PMTiles(fsrc),
			maxDataZoom: 14,
			maxZoom: 22,
			paintRules: osmPaintRules(),
			labelRules: osmLabelRules(),
			backgroundColor: '#ddd'
		});
		layerControl.addBaseLayer(protolayer,'Open Street Map - Offline');
		protolayer.addTo(map);
	});
}
