import fvrlogopng from '../img/fvrlogopng.png';

var FVRWatermarkControl = L.Control.extend({
	onAdd: function(map) {
		var link = L.DomUtil.create('a','fvrlink');
		var img = L.DomUtil.create('img','fvrlogo',link);

		img.src = fvrlogopng;

		return link;
	},

	onRemove: function(map) { }
});

export {FVRWatermarkControl};