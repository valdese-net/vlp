declare module '*.pmtiles' {
	const src: string;
	export default src;
}

declare module '*.pbf' {
	const src: string;
	export default src;
}

interface Window {
	nwsw: {MAP?: object} | null;
}
