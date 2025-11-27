import { installPWAServiceWorker } from './app-workbox.js';
import * as g from './globals.js';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './app.scss';

import { closeModal } from './modal.js';
import { buildWhatsNew } from './whatsnew.js';
import Navigo from 'navigo';
import { vlpAppMap, vlpAddNotification } from './appmap.js';

function getSiteRootURL() {
	var r = window.location.href;
	var hi = r.search(/[#?]/);
	return (hi > 0) ? r.slice(0, hi) : r;
}

function buildNotifyList() {
	let showMessages = (g.locationErrors.length > 0) ? g.locationErrors : ['no errors'];
	let ul = document.createElement('ul');
	showMessages.forEach(v => {
		let li = document.createElement('li');
		li.innerText = v;
		ul.appendChild(li);
	});
	return ul;
}

function initLakesideParkApp() {
	const INFOSCREENID = 'id_AppInfoScreen';
	var currentInfoPageID = false;
	const map_elem = document.getElementById('id_Map');
	const infoscreen_elem = document.getElementById(INFOSCREENID);
	const router = new Navigo(getSiteRootURL(), true);
	const map = new vlpAppMap(map_elem, router);
	const ctrl_PageTitle = document.getElementById('id_AppPageTitle');
	const ctrl_PageTitleText = ctrl_PageTitle.querySelector('span:last-of-type');
	const ctrl_CloseBtn = document.getElementById('id_CloseAppInfoBtn');
	const menuscreen_elem = document.getElementById('win-mainmenu');
	var firstTime = true;

	function isBlock(e) { return e.style.display == 'block'; }
	function hideElem(e, doHide) { e.style.display = doHide ? 'none' : 'block'; }
	function replaceContent(block) {
		block.innerHTML = '';
		if (block.id == 'auto_whatsnew') {
			block.appendChild(buildWhatsNew());
		} else if (block.id == 'auto_notify') {
			block.appendChild(buildNotifyList());
		}
	}
	function isMenuOpen() { return isBlock(menuscreen_elem); }
	function openTheMenu(b) {
		hideElem(menuscreen_elem, !b);
		if (b) ctrl_PageTitle.classList.add('menu-active');
		else ctrl_PageTitle.classList.remove('menu-active');
	}
	function toggleMenu() { openTheMenu(menuscreen_elem.style.display == 'none'); }

	function setCurrentPage(rid) {
		let doAppInit = firstTime;
		let thisPageData = vlpApp.pages[rid];

		if (!thisPageData) return;

		let isMapPage = vlpApp.maps.includes(rid);
		let newTitle = thisPageData.title;

		firstTime = false;
		closeModal();
		openTheMenu(false);

		document.title = newTitle;
		ctrl_PageTitleText.innerHTML = newTitle;

		if (isMapPage) {
			hideElem(infoscreen_elem, true);

			if (vlpApp.activeMap != rid) {
				let oldMap = vlpApp.activeMap;
				vlpApp.activeMap = rid;
				map.showConfig(thisPageData,oldMap);
				router.updatePageLinks();
			}
		} else {
			let id = `pgid-${rid}`;
			let newpage = document.getElementById(id);

			newpage.querySelectorAll(".autorepl").forEach((item) => replaceContent(item));

			hideElem(infoscreen_elem, false);

			if (currentInfoPageID != id) {
				if (currentInfoPageID) {
					hideElem(document.getElementById(currentInfoPageID), true);
				}
				hideElem(newpage, false);
				currentInfoPageID = id;
			}
		}

		if (doAppInit) {
			openTheMenu(true);
		}
	}

	// clear 'map-tiles' cache from old versions
	// fails silently, so no need to check for existence, otherwise...
	// if caches.has('map-tiles') 
	caches.delete('map-tiles');

	ctrl_PageTitle.addEventListener("click", (e) => toggleMenu());
	menuscreen_elem.addEventListener("click", () => openTheMenu(false));
	document.getElementById('btnid-refresh').addEventListener('click', (e) => {
		e.stopPropagation();
		
		location.reload(true);
	});
	//document.getElementById('btnid-info').addEventListener('click', (e) => {
	//	e.stopPropagation();
	//	setCurrentPage('#notify');
	//});

	document.addEventListener('keydown', (e) => {
		if (e.keyCode == 27) {
			if (isMenuOpen()) openTheMenu(false);
			else if (isBlock(ctrl_CloseBtn)) router.navigate(vlpApp.activeMap || vlpApp.pageids[0]);
		}
	});
	infoscreen_elem.addEventListener("click", (e) => {
		if (e.target == infoscreen_elem) {
			router.navigate(vlpApp.activeMap || vlpApp.pageids[0]);
		}
	});
	ctrl_CloseBtn.addEventListener("click", (e) => { router.navigate(vlpApp.activeMap || vlpApp.pageids[0]); });

	vlpApp.pageids.forEach(pgid => router.on(pgid, () => setCurrentPage(pgid)).resolve());
	router.on('*', () => {
		setCurrentPage(vlpApp.pageids[0]);
	}).resolve();
}

PRODUCTIONMODE: installPWAServiceWorker();

initLakesideParkApp();