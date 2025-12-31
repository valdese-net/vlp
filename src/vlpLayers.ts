import { Map } from 'maplibre-gl';
import map_pmtiles from './geo/vlp.pmtiles'; // dynamically created from geojson files
import notoSansFont from './font/notosans.pbf';

const vlpLayerList = [
["nc","line",{paint: {"line-color":"#d9d9ff"}}],
["burke","line",{paint: {"line-color":"#d9d9ff"}}],
["water","fill",{paint: {"fill-color":"#3992c4"}}],
["parcels","fill",{paint: {"fill-color":"#33a02c"}}],
["creeks","line",{
	filter: [
		"all",
		["==",["geometry-type"],"LineString"],
		["!",["has", "intermittent"]]
	],
	paint: {"line-color":"#3992c4"}
}],
["roads","line",{
	filter: ["==",["geometry-type"],"LineString"],
	paint: {
		"line-width": ["let","roadwidth",["case",["has","name"],500,220],["interpolate",["exponential", 2],["zoom"],12,1,22,["var","roadwidth"]]],
		"line-color":"#c0c0c0",
		"line-gap-width": 0.4
	}
}],
["trails","line",{
	filter: ["==",["get","style"],"solid"],
	layout: {
		"line-sort-key": ["get","weight"]
	},
	paint: {
		"line-width": ["interpolate",["exponential", 2],["zoom"],10,1,22,["*",["get","weight"],50]],
		"line-color":["get","color"]
	}
}],
["trails","line",{
	filter: ["==",["get","style"],"dot"],
	layout: {
		"line-sort-key": ["get","weight"]
	},
	paint: {
		"line-width": 1,
		"line-color":["get","color"],
		"line-dasharray": ["literal", [2, 2]]
	}
}],
["features","fill",{
	layout: {
		"fill-sort-key": ["match",["get","class"],"pavilion",5,"stage",9,"bridge",9,1]
	},
	paint: {
		"fill-color":["get","color"],
		"fill-outline-color": "transparent"
	}}
],
["poi","symbol",{
	layout: {
		"symbol-placement": "point",
		"icon-size": ["interpolate",["exponential", 2],["zoom"],10,["*",["get","size"],1.2*0.00390625/16],22,["*",["get","size"],1.2*0.5]],
		"icon-image": ["get","icon"],
		"icon-rotate": ["case",["has","rotate"],["get","rotate"],0],
		"icon-rotation-alignment":"map", // data expressions not supported! ["case",["has","rotate"],"map","auto"],
		"icon-keep-upright": false,
		"icon-pitch-alignment": "map",
		"icon-allow-overlap": true
	}
}],
["trails","symbol",{
	filter: ["all",
		["has", "name"],
		[">",["get","label"],0],
		["==",["get","style"],"solid"]
	],
	layout: {
		"symbol-placement": "line",
		"symbol-spacing":["step",["zoom"],250,17,400],
		"text-field": ["get","name"],
		"text-max-angle":100,
		"text-size": ["step",["zoom"],8,12,10,16,16,17,22]
	},
	paint: {
		"text-color": ["case",["in","Rostan",["get","name"]],"#000",["in","Tributary",["get","name"]],"#000","#fff"],
		"text-halo-color": ["get","color"],
		"text-halo-width": ["match",["get","style"],"dot",0,3]
	}
}],
["trails","symbol",{
	filter: ["all",
		["has", "name"],
		[">",["get","label"],0],
		["==",["get","style"],"dot"]
	],
	layout: {
		"symbol-placement": "line",
		"symbol-spacing":["step",["zoom"],350,17,400],
		"text-field": ["get","name"],
		"text-max-angle":60,
		"text-size": ["step",["zoom"],8,12,10,17,14]
	},
	paint: {
		"text-color":"#000"
	}

}],
["roads","symbol",{
	filter: ["all", ["has", "name"]],
	layout: {
		"symbol-placement": "line",
		"symbol-spacing":["step",["zoom"],250,17,400],
		"text-field": ["get","name"],
		"text-max-angle":75,
		"text-size": ["step",["zoom"],8,12,10,16,16,17,22]
	},
	paint: {
		"text-color": "#000",
		"text-halo-color": "hsl(0, 0%, 80%)",
		"text-halo-width": 2
	}
}]
];

export function vlpLayers(map: Map): void {
	const srcid = 'vlp';
	const layers_n = {};

	const add = (layer,type,obj) => {
		let id = `${layer}-${type}`;

		if (id in layers_n) id += (++layers_n[id]);
		else layers_n[id] = 0;

		map.addLayer(Object.assign({type,id,source:srcid,"source-layer":layer}, obj));
	}

	map.addSource(srcid, {
		type: "vector",
		url: `pmtiles://${location.protocol}//${location.host}/${map_pmtiles}`
	});
	map.setGlyphs(`${location.protocol}//${location.host}/${notoSansFont}`+'?{fontstack}_{range}');
	
	vlpLayerList.forEach(([layer,type,obj]) => add(layer,type,obj));
}
