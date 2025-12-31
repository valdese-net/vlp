import { vlpSVGIcons } from '../lib/vlpIcons.ts';

export function createSVGIcon(icoName, options={}) {
	const svgText = vlpSVGIcons[icoName] || vlpSVGIcons['marker'];
	const el = L.DomUtil.create('i');
	el.innerHTML = svgText;

	let style = '';
	if (options.rotate) style += `--iconrotate:${options.rotate}deg;`;
	if (options.magnify) style += `--iconxer:${options.magnify};`;

	if (style) el.querySelector('svg').setAttribute('style', style);

	// iconSize must be cleared to ensure CSS sizing
	return L.divIcon({
		className: `vlp-icon vlp-icon-${icoName}`,
		html: el,
		iconSize: null,
		iconAnchor: null
	});
}
