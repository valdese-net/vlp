import {type mapLayerListSpec} from './lib/lib-maplibre';

export const globeLayerList: mapLayerListSpec = [
["background","background",{paint: {"background-color":"steelblue"}}],
["countries","fill",{paint: {fillColor:"hsl(34, 81%, 18%)",fillOpacity:1}}],
["countries","line",{paint: {lineColor:"white"}}],
["parallels","line",{paint: {lineColor:"black",lineDasharray:[1,4]}}],
];
