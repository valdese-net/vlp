import {type mapLayerListSpec} from './lib/lib-maplibre';

export const burkeLayerList: mapLayerListSpec = [
["nc","line",{layout: {lineCap:"round",lineJoin:"round",visibility:"visible"},paint: {lineColor:"hsl(0, 0%, 60%)",lineWidth:{"base": 1.3, "stops": [[3, 0.5], [22, 15]]}}}],
["burke","fill",{minzoom:1,paint:{fillColor: "#17545A"}}],
["citylimits","fill",{paint:{fillColor:"#eeeeee",fillOpacity:0.1,fillOutlineColor:"#fdffdf"}}],
["citylimits","line",{paint:{lineColor:"#222",lineWidth:1,lineOpacity:0.5}}],
["park","fill",{paint:{fillColor:"#b7ffb7",fillOpacity:0.2}}],
["water","fill",{paint:{fillColor:"#8AD6F0"}}],
["waterway","line",{
	minzoom: 14,
	filter: ["all",["==", "$type", "LineString"],["!in", "brunnel", "tunnel", "bridge"],["!=", "intermittent", 1]],
	paint: {lineColor:"#8AD6F0",lineOpacity:1,lineWidth: {"base": 1.4, "stops": [[8, 1], [20, 8]]}}
}],
["path","line",{
	layout: {"line-cap": "round", "line-join": "round"},
	paint: {
		lineWidth: ["interpolate",["exponential", 2],["zoom"],12,0.1,14,1,22,50],
		lineColor: "#bbb"
	}
}],
["aero","line",{
	paint: {
		lineWidth: ["let","roadwidth",600,["interpolate",["exponential", 2],["zoom"],12,1,22,["var","roadwidth"]]],
		lineColor: "#666",
	}
}],
["rail","line",{
	paint: {
		lineWidth: ["let","roadwidth",40,["interpolate",["exponential", 2],["zoom"],12,1,22,["var","roadwidth"]]],
		lineColor: "#423600",
		lineDasharray: [2,1],
		lineGapWidth:0.75,
	}
}],
["road","line",{
	layout: {"line-cap": "round", "line-join": "round"},
	paint: {
		lineWidth: ["let","roadwidth",["match",["get","class"],"motorway",400,"primary",350,300],["interpolate",["exponential", 2],["zoom"],12,1,22,["var","roadwidth"]]],
		lineColor: ["match",["get","class"],"motorway","#eb7","primary","#888","#999"],
		lineGapWidth: ["match",["get","class"],"motorway",0.5,0]
	}
}],
["path","symbol",{
	filter: ["all",["has", "name"]],
	layout:	{symbolPlacement:"line",symbolSpacing:560,textField:"{name}",textRotationAlignment:"map",textSize:{"base": 1.4, "stops": [[10, 8], [20, 16]]}},
	paint:	{textColor: "#332103",textHaloColor:"#fff",textHaloWidth:3,textHaloBlur:3}
}],
["road","symbol",{
	filter: ["all",["has", "name"]],
	layout:	{symbolPlacement:"line",textField:"{name}",textRotationAlignment:"map",textSize:{"base": 1.4, "stops": [[10, 8], [20, 32]]}},
	paint:	{textColor:"#000",textHaloColor:"#fff",textHaloWidth:3,textHaloBlur:3}
}],
["manmade","fill",{paint:{fillColor: "brown",fillOpacity:0.8}}],
["building","fill-extrusion",{minzoom:15,paint:{fillExtrusionColor:"#70604b",fillExtrusionHeight:["number",["get","height"],5],fillExtrusionOpacity:1}}],
["aero","symbol",{
	filter: ["all",["has", "ref"]],
	minzoom:12,
	layout: {symbolPlacement:"line-center",symbolSortKey:1,iconImage:"airport",iconTextFit:"none",iconRotate:90,textField:"{ref}",textSize:14,textOffset:[8,0],textOptional:true},
	paint:	{textColor:"white"}
}],
["road","symbol",{
	filter: ["all",["has","ref"],["!", ["has", "name"]]],
	layout: {symbolPlacement:"line",symbolSpacing:400,symbolSortKey:1,iconImage:"default_1",iconTextFit:"both",iconTextFitPadding: [2,2,2,2],textField:"{ref}",iconRotationAlignment:'viewport',textRotationAlignment:'viewport',textSize:{base: 1, stops: [[3,6],[13,8],[20,22]]}},
	paint:	{textColor:"#000"}
}],
["label","symbol",{
	filter: ["all", ["==", "$type", "Point"], ["==", "class", "park"]],
	minzoom:12,
	layout:	{textField:"{name}",textSize: ["interpolate",["exponential",2],["zoom"],12,4, 16, 18]},
	paint:	{textColor: "#81f381",textHaloColor:"#000",textHaloWidth:2}
}],
["label","symbol",{
	filter: ["all", ["==", "$type", "Point"], ["==", "class", "place"],["!=", "subclass", "hamlet"]],
	layout:	{symbolSortKey:2,textField:"{name}",textSize:{base: 1.3, stops: [[3, 6],[9, 10],[18, 96]]},textAllowOverlap:true},
	paint:	{textColor:"#FBFCFC",textHaloColor:"#e4bd11bf",textHaloWidth:1}
}],
["label","symbol",{
	filter: ["all", ["==", "$type", "Point"], ["==", "class", "place"],["==", "subclass", "hamlet"]],
	minzoom:13,
	layout:	{symbolSortKey:2,textField:"{name}",textSize:{base: 1.3, stops: [[3, 10],[10, 10],[14, 20]]}},
	paint:	{textColor:"#000",textHaloColor:"#ffffffbf",textHaloWidth: 2}
}],
];
