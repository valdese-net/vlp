
import { PMTiles, FileSource } from "pmtiles";
import * as protomapsL from 'protomaps-leaflet';

function protomapPaintRules() { return [
{
	dataLayer: "burke",
	symbolizer: new protomapsL.LineSymbolizer({color:'#606060',width:1}),
},{
	dataLayer: "parcels",
	symbolizer: new protomapsL.PolygonSymbolizer({fill:'#b8ebb8',stroke:'#606060',doStroke:true,width:0.5,opacity:1}),
},{
	dataLayer: "water",
	symbolizer: new protomapsL.PolygonSymbolizer({fill: 'steelblue'})
},{
	dataLayer: "creeks",
	symbolizer: new protomapsL.LineSymbolizer({color: 'steelblue',width:(z,f) => {return .06*2**Math.max(0,z-11);}}),
},{
	dataLayer: "roads",
	symbolizer: new protomapsL.LineSymbolizer({color: '#888',width:(z,f) => {return .15*2**Math.max(0,z-11);}}),
},{
	dataLayer: "roads",
	symbolizer: new protomapsL.LineSymbolizer({color: '#fff',width:0.5, dash:[2,3]}),
}]}

function getRoadFontOutline(z,f)  { return 2**Math.max(0,z-16); }
function getRoadFont(z,f)  { return `300 ${8*(2**Math.max(0,z-16))}px sans-serif`; }
function getCreekFont(z,f) { return `300 ${9*(2**Math.max(0,z-18))}px sans-serif`; }

function protomapLabelRules() { return [{
	dataLayer: "roads",
 	symbolizer: new protomapsL.LineLabelSymbolizer({font:getRoadFont,fill:"black",stroke:"#ccc",width:getRoadFontOutline,position:protomapsL.LineLabelPlacement.Center, labelProps:["name"]}),
	filter: (z, f) => { return f.props["name"]; }
},{
	dataLayer: "creeks",
 	symbolizer: new protomapsL.LineLabelSymbolizer({font:getCreekFont,fill:"gold",stroke:"white",position:protomapsL.LineLabelPlacement.Center,labelProps:["name"]}),
	filter: (z, f) => { return (z > 16) && f.props["name"];}
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
			attribution: false,
			maxDataZoom: 14,
			maxZoom: 22,
			paintRules: protomapPaintRules(),
			labelRules: protomapLabelRules(),
			backgroundColor: '#ddd'
		});
		layerControl.addBaseLayer(protolayer,'Park Boundaries');
		protolayer.addTo(map);
	});
}
