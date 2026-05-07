import {createEl} from './html';
import { Map, Marker, LngLat, LngLatBounds } from 'maplibre-gl';

const inactiveMarkerOpacity = '0.3';

export type storyMapArticle = {latlng: [number,number], text: string, zoom?: number, rotate?: number, pitch?: number, link?: string};
export type storyMapArticleList = storyMapArticle[];

export function parseStoryMap(note: string): storyMapArticleList {
	const mx = /@\((-?[0-9.]+),(-?[0-9.]+)\):?\s*/;
	const plistx = /(\@[a-z]+)\(([^\)]*)\)\s*/;
	const ml = note.split(mx);
	let opts = {zoom: 11,rotate:0,pitch:0,link:''};
	let r = [];
	for (let i=0; i<ml.length;i+=3) {
		const latlng = i ? [parseFloat(ml[i-2]),parseFloat(ml[i-1])] : false;
		const rawtext = ml[i];
		const plist = rawtext.split(plistx);
		let text = '';
		while (plist.length > 0) {
			let token = plist.shift();
			if (token.startsWith('@')) {
				token = token.substring(1);
				let tokenval:number|string = plist.shift().trim();
				if (typeof opts[token] === 'number') tokenval = parseInt(tokenval);
				opts[token] = tokenval;
			} else if (token) {
				text += token;
			}
		}
		const main = {latlng,text};
		r.push({...opts, ...main});
	}

	return r;
}

function getStoryBounds(pts: storyMapArticleList): LngLatBounds {
	const p1 = pts.reduce((acc, p) => ([Math.min(acc[0],p.latlng[0]), Math.min(acc[1],p.latlng[1])]), [180,180]);
	const p2 = pts.reduce((acc, p) => ([Math.max(acc[0],p.latlng[0]), Math.max(acc[1],p.latlng[1])]), [-180,-180]);

	// W S E N
	return new LngLatBounds([p1[0],p2[1],p2[0],p1[1]]);
}

export function startStoryMap(the_map:Map, the_story: HTMLElement) {
	var activeNoteId = -1;
	const mapMarkers: Marker[] = [];
	var currentMarker = -1;

	const storymap = the_story.getAttribute('data-storymap');
	const mapcoords = parseStoryMap(storymap);
	const initmap = mapcoords.shift();

	if (!mapcoords) return;

	mapcoords.forEach((item, index: number) => {
		const indexLabel = (index + 1).toString();
		const newmark = createEl('article');
		item.latlng.reverse();
		newmark.setAttribute('data-geoid',index.toString());
		newmark.appendChild(createEl('h5',{text: indexLabel}));
		newmark.appendChild(createEl('p',{text:item.text}));
		the_story.appendChild(newmark);
	});

	const startbounds = getStoryBounds(mapcoords);
	const startcenter = startbounds.getCenter();
	the_map.fitBounds(startbounds, {padding:6,duration:5000});
	the_map.once('moveend', () => {
		if (initmap.rotate)	the_map.flyTo({center:startcenter, bearing:initmap.rotate,duration:3000});
	});

	function uiActivateNote(n:number,add:boolean=true) {
		let idString = (n+1).toString();
		the_story.querySelector(`article[data-geoid="${n}"]`).classList.toggle('active', add);
		document.querySelectorAll('div.nw-mapmark').forEach((el) => {
			if (el.textContent === idString) {
				el.classList.toggle('active', add);
			}
		});
		mapMarkers[n].setOpacity(add ? "1" : inactiveMarkerOpacity);
	}

	function geoNoteActivate(n:number) {
		if (currentMarker === n) return;
		let note = mapcoords[n];

		if (currentMarker >= 0) uiActivateNote(currentMarker,false);
		currentMarker = n;
		uiActivateNote(currentMarker,true);
		the_map.flyTo({center:note.latlng,zoom:note.zoom||17,bearing:note.rotate||0,pitch:note.pitch||0,duration:3000});
	}

	function geoNoteClick() {
		this.scrollIntoView({behavior:'smooth',block:'end'});
	}

	mapcoords.forEach((el,ki:number) => {
		const ki_label = (ki+1).toString();
		const element = createEl('div',{text:ki_label});
		const marker = new Marker({anchor:'center',className:'nw-mapmark',element})
			.setLngLat(el.latlng)
			.addTo(the_map);
		const el_note = the_story.querySelector(`article[data-geoid="${ki}"]`);
		marker.setOpacity(inactiveMarkerOpacity);
		mapMarkers[ki] = marker;
		marker.on('click',() => { geoNoteClick.call(el_note) });
	});

	the_story.querySelectorAll('article').forEach((el) => {
		el.addEventListener('click', geoNoteClick);
	});

	window.addEventListener('scroll', function() {
		let vh = window.innerHeight;
		let activateline = 0.80*vh;
		let lastInView = -1;
		the_story.querySelectorAll('article').forEach((el, n_i) => {
			let r = el.getBoundingClientRect();
			if (((r.top > 0) && (activateline > r.top)) || ((r.bottom > 0) && (r.bottom < vh)))  {
				let a_id = Number(el.getAttribute('data-geoid'));
				if (a_id > lastInView) lastInView = a_id;
			}
		});
		if (lastInView >= 0) geoNoteActivate(lastInView);
	});
}
