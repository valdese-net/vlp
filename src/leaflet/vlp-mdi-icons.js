import { mdiSVGPaths, mdiSVGIcons} from '../lib/vlpIcons.ts';

function buildIcon(icoName) {
	// make a duplicate of the mdiSVGIcons default object, then augment it
	// with values from the true mdiSVGIcons data
	var icon = Object.assign({},mdiSVGIcons._default,mdiSVGIcons[icoName]);

	var path = '<path';
	if (icon.strokeWidth > 0) {
		path += ` stroke="${icon.stroke}" stroke-width="${icon.strokeWidth}"`;
	}
	path += ` fill="${icon.fill}" d="${icon.path}"/>`;

	
	let style = '';
	if (icon.rotate) style += `--iconrotate:${icon.rotate}deg;`;
	if (icon.magnify) style += `--iconxer:${icon.magnify};`;

	// iconSize must be cleared to ensure CSS sizing
	return L.divIcon({
		className: `icon-mdi icon-mdi-${icoName}`,
		html: `<svg viewBox="0 0 24 24" style="${style}">${path}></svg>`,
		iconSize: null,
		iconAnchor: null
	});
}

var svgIconCache = {};
function createSVGIcon(i) {
	return svgIconCache[i] || (svgIconCache[i] = buildIcon(i));
}

export {createSVGIcon, mdiSVGPaths, mdiSVGIcons};
