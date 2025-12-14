export function styleForGeoPath(feature) {
	let prop = feature.properties;
	let lstyle = {stroke:true,color:prop.color||'brown',weight:prop.weight||4,fill:false,opacity:0.6};
	if (!prop.class) {
		if (prop.style == 'dot') {
			lstyle.dashArray = '2 2';
			lstyle.opacity = 1;
			lstyle.weight = 1.0;
		}
	} else if (['parking'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'grey',color:'black',fill:true,weight:1,opacity:0.7};
	} else if (['pavilion'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'forestgreen',color:'black',fill:true,weight:1,opacity:0.7};
	} else if (['stairs','ramp'].includes(prop.class)) {
		lstyle.color = 'brown';
		lstyle.dashArray = '2 3';
		lstyle.opacity = 1;
		lstyle.weight = 1.0;
	} else if (['pier','stage'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'saddlebrown',color:'black',fill:true,weight:1,opacity:1}; // fillColor:'burlywood',
	} else if (['dogpark'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'green',color:'#c0c0c0',fill:true,weight:3,opacity:1}; // fillColor:'darkgreen',
	} else if (['bathroom'].includes(prop.class)) {
		lstyle = {stroke:true,fillColor:'#ccc',color:'black',fill:true,weight:1,opacity:1}; // fillColor:'darkblue',
	}

	if (lstyle.fill) { lstyle.fillOpacity = lstyle.opacity; }

	return lstyle;
}

export function setStyeAfterZoom(l,z) {
	let lw = .125 * (2 ** Math.max(0,z-14));
	let props = l.feature && l.feature.properties;
	if (props && props.weight && (props.weight > 1)) l.setStyle({weight: lw*props.weight});
}

export function styleForGeoPoints(feature) {
	return {stroke:true,color:feature.properties.color||'#00aa66',weight:8,fill:false,opacity:0.6};
}
