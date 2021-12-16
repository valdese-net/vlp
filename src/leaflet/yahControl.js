import {vlpDebug} from '../globals.js';

var enableCompassHeading = true;

// L.Marker must be extended to properly handle updating the svg element's rotation
var YAHMarker = L.Marker.extend({
	options: {heading: 90},
	initialize: function(latlng,options) {
		L.setOptions(this, options);
		L.Marker.prototype.initialize.call(this,latlng,options);
		this._heading = this.options.heading;
    },
	setHeading: function(h) {this._heading = h;},
	_updateHeading: function() {
		// point the walking persons head toward the heading
		if (this._icon) {
			let h = this._heading - 90;
			let fc = this._icon.firstChild;
			if (fc) {
				let scale = '';
				if (h<0) {h+=360;} else if (h > 360) {h = h % 360;}
				if ((h > 90) && (h <=270)) {
					h = 180 - h;
					scale = 'scaleX(-1) ';
				}
				
				fc.style.transform = `${scale}rotate(${h}deg)`;
			}
		}
	},
	update: function() {
		L.Marker.prototype.update.call(this);
		this._updateHeading();
	}
});

var YAHControl = L.Control.extend({
	options: {
		maxBounds: null,
		flyToInterval: 20000
	},
	initialize: function(options) {
		L.setOptions(this, options);
    },

	bindTo: function(map) {
		const options = this.options;
		const flyToInterval = options.flyToInterval;
		let lastVisibleLocationTime = 0;
		let btn = document.getElementById('btnid-yah');
		let yahIcon = L.divIcon({
			className: 'yah-divicon',
			html: '<i class="fvricon fvricon-walkptr" style="font-size:32px;background:rgba(255,255,0,0.70); border:0; padding: 6px; border-radius:50%; transform:rotate(0deg);"></i>',
			iconSize: [36, 36],
			iconAnchor: [18, 30]
		});
		let yahMarker = new YAHMarker([35.75640,-81.58016],{icon:yahIcon});
		yahMarker.bindTooltip('You are here');

		function is_yahActive() {return btn.classList.contains('active');}
		function setDeviceOrientation(e) {
			if (e.webkitCompassHeading) {
				// iOS
				yahMarker.setHeading(e.webkitCompassHeading);
			} else if (e.absolute && e.alpha) {
				// Android
				yahMarker.setHeading(360 - e.alpha)
			}
        }
		function yahActivate(b) {
			let b_c = is_yahActive();
			vlpDebug('yahActivate '+b);

			if (b == b_c) return;

			btn.classList.toggle('active');
			if (b) {
				lastVisibleLocationTime = 0;
				map.locate({watch: true, enableHighAccuracy:true, timeout:60000, maximumAge:5000});
				
				if (enableCompassHeading) {
					var oriAbs = 'ondeviceorientationabsolute' in window;

					if (oriAbs || ('ondeviceorientation' in window)) {
						var setup_deviceorientation = function () {
							L.DomEvent.on(window, oriAbs ? 'deviceorientationabsolute' : 'deviceorientation', setDeviceOrientation);
						};
						if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
							// ios uses a user permission prompt
							DeviceOrientationEvent.requestPermission().then(function (permissionState) {
								if (permissionState === 'granted') {
									setup_deviceorientation();
								}
							});
						} else {
							setup_deviceorientation();
						}
					}
				}
			} else {
				map.removeLayer(yahMarker);
				map.stopLocate();

				if (enableCompassHeading) {
					if ('ondeviceorientationabsolute' in window) {
						L.DomEvent.off(window, 'deviceorientationabsolute', setDeviceOrientation);
					} else if ('ondeviceorientation' in window) {
						L.DomEvent.off(window, 'deviceorientation', setDeviceOrientation);
					}
				}
				
				// enable the compass for next activation sequence for location services
				enableCompassHeading = true;
			}

			if (localStorage) {
				if (b) localStorage.yah = enableCompassHeading ? 2 : 1;
				else localStorage.removeItem('yah');
			}
		}

		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			yahActivate(!is_yahActive());
		});

		map.on('locationfound', function(e) {
			let map_bounds = options.maxBounds || map.options.maxBounds;
			let yahLatLng = e.latlng;
			let yahTime = e.timestamp;
			let firstLocationNotify = !map.hasLayer(yahMarker);
			vlpDebug('locate',yahLatLng);
		
			if (firstLocationNotify) {
				map.addLayer(yahMarker);
			}

			yahMarker.setLatLng(yahLatLng);

			// if user is in the park, flyTo their location if the map has not shown their location for more than
			// FLYTO_LOCATION_INTERVAL milliseconds
			if (!map_bounds || map_bounds.contains(yahLatLng)) {
				if (map.getBounds().contains(yahLatLng)) {
					// user is in the park, and location is shown on-screen
					lastVisibleLocationTime = yahTime;
				} else {
					// user is in the park, but location is currently off-screen
					if ((yahTime - lastVisibleLocationTime) >= flyToInterval) {
						vlpDebug('yah flying to location');
						lastVisibleLocationTime = yahTime;
						map.flyTo(yahLatLng);
					}
				}
			}
		});
		map.on('locationerror', function(e) {
			if (is_yahActive()) {
				yahActivate(false);
				alert(e.message);
			}
		});

		if (localStorage && localStorage.yah) {
			enableCompassHeading = (localStorage.yah  != 1);
			yahActivate(true);
		}
	},
});

export {YAHControl};