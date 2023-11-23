export const vlpDebugMode = (location.href.indexOf('debug')>=0);
export var vlpDebug = function() {};
export var onIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
export var locationErrors = [];

if (vlpDebugMode) {
	vlpDebug = console.log;
	vlpDebug('Debug mode is activated for vlp app',location.href);
}
