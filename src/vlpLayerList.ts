import {type mapLayerListSpec} from './lib/lib-maplibre';

export const vlpLayerList: mapLayerListSpec = [
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
		lineWidth: ["let","roadwidth",["case",["has","name"],500,220],["interpolate",["exponential", 2],["zoom"],12,1,22,["var","roadwidth"]]],
		lineColor:"#c0c0c0",
		lineGapWidth: 0.4
	}
}],
["trails","line",{
	filter: ["==",["get","style"],"solid"],
	layout: {
		lineSortKey: ["get","weight"]
	},
	paint: {
		lineWidth: ["interpolate",["exponential", 2],["zoom"],10,1,22,["*",["get","weight"],50]],
		lineColor:["get","color"]
	}
}],
["trails","line",{
	filter: ["==",["get","style"],"dot"],
	layout: {
		lineSortKey: ["get","weight"]
	},
	paint: {
		lineWidth: 1,
		lineColor: ["get","color"],
		lineDasharray: ["literal", [2, 2]]
	}
}],
["trails","symbol",{
	filter: ["all",
		["has", "name"],
		[">",["get","label"],0],
		["==",["get","style"],"solid"]
	],
	layout: {
		symbolPlacement: "line",
		symbolSpacing:["step",["zoom"],250,17,400],
		textField: ["get","name"],
		textMaxAngle:100,
		textSize: ["step",["zoom"],8,12,10,16,16,17,22]
	},
	paint: {
		textColor: ["case",["in","Rostan",["get","name"]],"#000",["in","Tributary",["get","name"]],"#000","#fff"],
		textHaloColor: ["get","color"],
		textHaloWidth: ["match",["get","style"],"dot",0,3]
	}
}],
["features","fill",{
	layout: {
		fillSortKey: ["match",["get","class"],"pavilion",5,"stage",9,"bridge",9,1]
	},
	paint: {
		fillColor: ["get","color"],
		fillOutlineColor: "transparent"
	}}
],
["poi","symbol",{
	layout: {
		symbolPlacement: "point",
		iconSize: ["interpolate",["exponential", 2],["zoom"],10,["*",["get","size"],1.2*0.00390625/16],22,["*",["get","size"],1.2*0.5]],
		iconImage: ["get","icon"],
		iconRotate: ["case",["has","rotate"],["get","rotate"],0],
		iconRotationAlignment: "map", // data expressions not supported! ["case",["has","rotate"],"map","auto"],
		iconKeepUpright: false,
		iconPitchAlignment: "map",
		iconAllowOverlap: true
	}
}],
["trails","symbol",{
	filter: ["all",
		["has", "name"],
		[">",["get","label"],0],
		["==",["get","style"],"dot"]
	],
	layout: {
		symbolPlacement: "line",
		symbolSpacing: ["step",["zoom"],350,17,400],
		textField: ["get","name"],
		textMaxAngle: 60,
		textSize: ["step",["zoom"],8,12,10,17,14]
	},
	paint: {
		textColor:"#000"
	}

}],
["roads","symbol",{
	filter: ["all", ["has", "name"]],
	layout: {
		symbolPlacement: "line",
		symbolSpacing: ["step",["zoom"],250,17,400],
		textField: ["get","name"],
		textMaxAngle: 75,
		textSize: ["step",["zoom"],8,12,10,16,16,17,22]
	},
	paint: {
		textColor: "#000",
		textHaloColor: "hsl(0, 0%, 80%)",
		textHaloWidth: 2
	}
}]
];
