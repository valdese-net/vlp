import {mdiAlert, mdiTableFurniture, mdiFlagTriangle, mdiCamera, mdiCarMultiple, mdiParking, 
	mdiSailBoat, mdiBridge, mdiNature, mdiInformation, mdiWaves, mdiSawBlade,
	mdiBike, mdiFish, mdiShipWheel, mdiImageFilterHdr, mdiBeach, mdiCctv, mdiSofaSingle,
	mdiMapMarker, mdiGasStation, mdiSilverwareForkKnife, 
	mdiFood, mdiBeer, mdiGlassWine, mdiDelete, mdiLadder, mdiHelp, mdiDumpTruck, mdiMower,
	mdiBarley, mdiFireHydrant, mdiPaw, mdiAlertOctagon} from '@mdi/js';

// https://materialdesignicons.com

const mdiSVGPaths = {
	alert:		mdiAlert,
	beach:		mdiBeach,
	beer:		mdiBeer,
	bike:		mdiBike,
	boat:		mdiSailBoat,
	bridge:		mdiBridge,
	camera:		mdiCamera,
	cars:		mdiCarMultiple,
	cctv:		mdiCctv,
	construction:	mdiDumpTruck,
	ffood:		mdiFood,
	fish:		mdiFish,
	flag:		mdiFlagTriangle,
	food:		mdiSilverwareForkKnife,
	gas:		mdiGasStation,
	hydrant:	mdiFireHydrant,
	info:		mdiInformation,
	ladder:		mdiLadder,
	marker:		mdiMapMarker,
	mower:		mdiMower,
	nature:		mdiNature,
	parking:	mdiParking,
	picnic:		mdiTableFurniture,
	question:	mdiHelp,
	rock:		mdiImageFilterHdr,
	saw:		mdiSawBlade,
	sofa:	 	mdiSofaSingle,
	stop:		mdiAlertOctagon,
	trash:		mdiDelete,
	waves:		mdiWaves,
	weed:		mdiBarley,
	wheel:		mdiShipWheel,
	wildlife:	mdiPaw,
	wine:		mdiGlassWine,
}

const mdiSVGIcons = {
	_default: {
		path: mdiSVGPaths.marker,
		stroke: '#FFFFFF',
		strokeWidth: 0.5,
		fill: '#000000',
		anchor: [0.5,0.5]
	},
	alert:	{path: mdiSVGPaths.alert,fill:'#FF0000', stroke:'#FFFF00', strokeWidth: 1},
	beach:	{path: mdiSVGPaths.beach,fill:'#EEAB04',stroke:'#000000'},
	beer:	{path: mdiSVGPaths.beer,fill:'#d3c934',stroke:'#FFFFFF',strokeWidth: 1.2},
	bike:	{path: mdiSVGPaths.bike},
	blackw:	{path: mdiSVGPaths.wildlife, fill: '#000000'},
	bluew:	{path: mdiSVGPaths.wildlife, fill: '#20A2C6'},
	boat:	{path: mdiSVGPaths.boat,fill:'#A52A2A'},
	bridge:	{path: mdiSVGPaths.bridge,strokeWidth:0},
	brownw:	{path: mdiSVGPaths.wildlife, fill: '#775541'},
	camera:	{path: mdiSVGPaths.camera,fill:'#040421'},
	cars:	{path: mdiSVGPaths.cars,fill:'#A88C8C',stroke:'#000000'},
	cctv:	{path: mdiSVGPaths.cctv,strokeWidth:1,fill:'#7C8216'},
	construction:	{path: mdiSVGPaths.construction, fill: '#E1A911', stroke: '#000000', strokeWidth: 1.0},
	cyanw:	{path: mdiSVGPaths.wildlife, fill: '#00F7D6'},
	ffood:	{path: mdiSVGPaths.ffood,fill:'#f2eeb3',stroke:'#000000'},
	fish:	{path: mdiSVGPaths.fish,fill:'#F6E35B',stroke:'#000000',strokeWidth:1},
	flag:	{path: mdiSVGPaths.flag,fill:'#EF6C00',anchor:[0,1.0]},
	food:	{path: mdiSVGPaths.food,fill:'#ffffff',stroke:'#000000'},
	gas:	{path: mdiSVGPaths.gas,fill:'#400559',stroke:'#FFFFFF',strokeWidth:1.0},
	grayw:	{path: mdiSVGPaths.wildlife, fill: '#8E908B'},
	greenflag: {path: mdiSVGPaths.flag,fill:'#008800'},
	greenw:	{path: mdiSVGPaths.wildlife, fill: '#228A13'},
	hydrant:	{path: mdiSVGPaths.hydrant, fill: '#DD2E2E'},
	info:	{path: mdiSVGPaths.info,fill:'#0000AA', strokeWidth:1.0},
	ladder:	{path: mdiSVGPaths.ladder,fill:'#3F2812', stroke: '#FFFFFF'},
	limew:	{path: mdiSVGPaths.wildlife, fill: '#3FE114'},
	marker:	{path: mdiSVGPaths.marker,stroke:'#0000AA',fill:'#FFFFFF'},
	mower:	{path: mdiSVGPaths.mower, fill: '#45050F', stroke: '#FFFFFF'},
	nature:	{path: mdiSVGPaths.nature,fill:'#00AA00',anchor:[0.5,1.0]},
	orangew:	{path: mdiSVGPaths.wildlife, fill: '#FFAA00'},
	parking:	{path: mdiSVGPaths.parking,fill:'#0000AA'},
	picnic:	{path: mdiSVGPaths.picnic,fill:'#5C2F00'},
	pinkw:	{path: mdiSVGPaths.wildlife, fill: '#FF0093'},
	purplew:	{path: mdiSVGPaths.wildlife, fill: '#960A96'},
	question:	{path: mdiSVGPaths.question,fill:'#6D0E0E', stroke: '#B0891E'},
	redw:	{path: mdiSVGPaths.wildlife, fill: '#FF0000'},
	rock:	{path: mdiSVGPaths.rock,fill:'#70BB0A',stroke:'#000000'}, 
	saw:	{path: mdiSVGPaths.saw,fill:'#333333',stroke:'#000000'},
	sofa:	{path: mdiSVGPaths.sofa,fill:'#260D4E'},
	stop:	{path: mdiSVGPaths.stop,fill:'#FF0000', stroke:'#FFFF00', strokeWidth: 1.2},
	tanw:	{path: mdiSVGPaths.wildlife, fill: '#B6783F'},
	tealw:	{path: mdiSVGPaths.wildlife, fill: '#42806D'},
	trash:	{path: mdiSVGPaths.trash,fill:'#000000'},
	waves:	{path: mdiSVGPaths.waves,fill:'#000066'},
	weed:	{path: mdiSVGPaths.weed, fill: '#A3A113', stroke: '#FFFFFF'},
	wheel:	{path: mdiSVGPaths.wheel,fill:'#5C2F00'},
	whitew:	{path: mdiSVGPaths.wildlife, fill: '#FFFFFF'},
	wine:	{path: mdiSVGPaths.wheel,fill:'#9e0c35'},
	yelloww:	{path: mdiSVGPaths.wildlife, fill: '#DFF007'},
}

function buildIcon(icoName) {
	// make a duplicate of the mdiSVGIcons default object, then augment it
	// with values from the true mdiSVGIcons data
	var icon = Object.assign({},mdiSVGIcons._default);
	var i2 = mdiSVGIcons[icoName];
	if (i2) {
		for (var attrname in i2) { icon[attrname] = i2[attrname]; }
	}

	var path = '<path';
	if (icon.strokeWidth > 0) {
		path += ` stroke="${icon.stroke}" stroke-width="${icon.strokeWidth}"`;
	}
	path += ` fill="${icon.fill}" d="${icon.path}">`;

	// iconSize must be cleared to ensure CSS sizing
	return L.divIcon({
		className: `icon-mdi icon-mdi-${icoName}`,
		html: `<svg viewBox="0 0 24 24">${path}></svg>`,
		iconSize: null
	});
}

var svgIconCache = {};
function createSVGIcon(i) {
	return svgIconCache[i] || (svgIconCache[i] = buildIcon(i));
}

export {createSVGIcon, mdiSVGPaths, mdiSVGIcons};
