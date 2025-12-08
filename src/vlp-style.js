import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl';
import map_pmtiles from './img/vlp.pmtiles';

const vlpStyle = {
	version: 8,
	name: "VLP Map",
	//glyphs: 'https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf', // https://github.com/UNDP-Data/fonts
	sources: {
		vlp_tiles: {
			type: "vector",
			url: `pmtiles://${location.protocol}//${location.host}/${map_pmtiles}`
		}
	},
	layers: [
 	{
		id: "background",
		type: "background",
		paint: {"background-color": "#D8F2FF"},
		filter: ["all"],
		layout: {"visibility": "visible"},
		maxzoom: 24
    },{
		id: "nc",
		source: "vlp_tiles",
		"source-layer": "nc",
		type: "line",
		paint: {"line-color":"#d9d9ff"},
	},{
		id: "burke-boundary",
		source: "vlp_tiles",
		"source-layer": "burke",
		type: "fill",
		paint: {"fill-color":"#f5ffe9","fill-outline-color": "#80AA80","fill-opacity": 1.0},
	},{
		id: "parcels",
		source: "vlp_tiles",
		"source-layer": "parcels",
		type: "fill",
		paint: {"fill-color":"#90EE90","fill-outline-color": "#80AA80","fill-opacity": 0.3},
	},{
		id: "water",
		source: "vlp_tiles",
		"source-layer": "water",
		type: "fill",
		paint: {"fill-color":"steelblue","fill-outline-color": "blue","fill-opacity": 1.0},
	},{
		id: "waterway",
		source: "vlp_tiles",
		"source-layer": "waterway",
		type: "line",
		filter: [
			"all",
			["==",["geometry-type"],"LineString"],
			["!",["has", "intermittent"]]
		],
		paint: {"line-color":"steelblue","line-opacity":1.0},
	},{
		id: "road",
		source: "vlp_tiles",
		"source-layer": "road",
		type: "line",
		filter: ["==",["geometry-type"],"LineString"],
		paint: {
			"line-width": ["interpolate",["exponential", 2],["zoom"],12,1,22,900],
			"line-color":"#c0c0c0",
			"line-opacity":1.0
		},
	},{
		id: "city",
		source: "vlp_tiles",
		"source-layer": "city",
		type: "fill",
		maxzoom: 20,
		paint: {
			"fill-color": ["match", ["get","NAME"],
				"Glen Alpine","yellow","Morganton","orange","Drexel","green","Valdese","yellow","Rutherford College","orange","Connelly Springs","green",
				"Rhodhiss","yellow","Hildebran","orange","Long View","green","white"],
			"fill-outline-color": "white",
			"fill-opacity": 0.15
		}
	},{
		id: "city-labels",
		source: "vlp_tiles",
		"source-layer": "citynames",
		type: "symbol",
		maxzoom: 16,
		layout: {
			"symbol-sort-key": 1,
			"symbol-placement": "point",
			"text-anchor": "center",
			"text-field": "{name}",
			"text-font": ["Noto Sans Bold"],
			"text-size": ["interpolate",["exponential",1.4],["zoom"],8,10,16,44],
		},
		paint: {
			"text-color": "black",
			"text-halo-color": "hsl(0, 0%, 100%)",
			"text-halo-width": 1,
			"text-halo-blur": 0
		}
	},{
		id: "road-labels",
		source: "vlp_tiles",
		"source-layer": "road",
		filter: ["all", ["has", "name"]],
		type: "symbol",
		minzoom: 12,
		layout: {
			"symbol-sort-key": 33,
			"symbol-placement": "line",
			"text-field": "{name}",
			"text-size": ["interpolate",["exponential",1.4],["zoom"],8,9,20,40],
		},
		paint: {
			"text-color": "#000",
			"text-halo-color": "hsl(0, 0%, 80%)",
			"text-halo-width": 2,
			"text-halo-blur": 0
		}
	}],
}

export {vlpStyle}