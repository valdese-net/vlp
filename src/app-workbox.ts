import { Workbox } from 'workbox-window';

export function installPWAServiceWorker() {
	if ('serviceWorker' in navigator) {
		const wb = new Workbox('/sw.js');
		console.log('adding service worker...');

		const showSkipWaitingPrompt = async (event) => {
			wb.addEventListener('controlling', () => { window.location.reload(); });
			const updateAccepted = true;
			console.log('upgrading...');
			if (updateAccepted) { wb.messageSkipWaiting(); }
		};

		wb.addEventListener('waiting', (event) => { showSkipWaitingPrompt(event); });
		wb.register();
	}
}
