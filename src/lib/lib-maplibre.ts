import { Map, SourceSpecification, VectorTileSource, LngLatBounds, NavigationControl, GeolocateControl, addProtocol } from 'maplibre-gl';
import { PMTiles, FileSource, Protocol } from "pmtiles";

// mapLayerSpec is a tuple of [layer name, layer type, layer options]
export type mapLayerSpec = [string, string, Record<string, any>];
export type mapLayerListSpec = mapLayerSpec[];

const toKebabCase = (str: string): string => str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
function toKebabObj(obj: Record<string, any>): Record<string, any> {
	return Object.fromEntries(Object.entries(obj).map(([key, v]) => [toKebabCase(key), ((typeof v === 'object') && !Array.isArray(v)) ? toKebabObj(v) : v]));
};

export function nwMapAddLayers(map: Map, srcid: string, layers: mapLayerListSpec) {
	const layers_n = {};

	const add = (layer,type,obj) => {
		let id = `${layer}-${type}`;

		if (id in layers_n) id += (++layers_n[id]);
		else layers_n[id] = 0;

		const x = Object.assign(toKebabObj(obj),{type,id,source:srcid,"source-layer":layer});
		map.addLayer(x);
	}

	layers.forEach(([layer,type,obj]) => add(layer,type,obj));
}

const pmtile_protocol = new Protocol();
addProtocol('pmtiles', pmtile_protocol.tile);

export async function nwMapAddSource(map: Map, srcid: string, url_pmtile: string, layers: mapLayerListSpec, attribution: string = '', prefetch: boolean = false) {
	const opts: SourceSpecification = {type:'vector',url:`pmtiles://${url_pmtile}`,attribution};
	if (prefetch) {
		const fname = `file_${srcid}.pmtiles`;
		await fetch(url_pmtile)
		.then((res) => res.arrayBuffer())
		.then((buf) => new File([buf], fname, {type:'application/vnd.pmtiles',lastModified:Date.now()}))
		.then((file) => {
			const p = new PMTiles(new FileSource(file));
			pmtile_protocol.add(p);
			opts['url'] = `pmtiles://${file.name}`;
		});
	}

	map.addSource(srcid,opts);
	nwMapAddLayers(map, srcid, layers);
}
