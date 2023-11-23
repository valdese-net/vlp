import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {showModal} from './modal.js';

dayjs.extend(relativeTime);

export function buildWhatsNew() {
	let ul = document.createElement('ul');
	ul.className = 'whatsnew';
	vlpApp.appd.history.forEach(v => {
		let tstamp = 1000*Number(v[0]);
		let d = dayjs(tstamp).fromNow();
		let de = document.createElement('em');
		let li = document.createElement('li');
		de.innerText = d;
		li.innerText = v[1];
		li.appendChild(de);
		ul.appendChild(li);
	});

	let html = document.createElement('div');
	html.innerText = 'The Lakeside Park app has been updated. Recent changes to the app include:';
	html.appendChild(ul);
	return html;
}
