(function () {

let __onAdd = L.Polyline.prototype.onAdd,
    __onRemove = L.Polyline.prototype.onRemove,
    __updatePath = L.Polyline.prototype._updatePath,
    __bringToFront = L.Polyline.prototype.bringToFront;


let PolylinePathLabel = {

    onAdd: function (map) {
        __onAdd.call(this, map);
        this._textRedraw();
    },

    onRemove: function (map) {
        map = map || this._map;
        if (map && this._textNode && this._renderer._container)
            this._renderer._container.removeChild(this._textNode);
        __onRemove.call(this, map);
    },

    bringToFront: function () {
        __bringToFront.call(this);
        this._textRedraw();
    },

    _updatePath: function () {
        __updatePath.call(this);
        this._textRedraw();
    },

    _textRedraw: function () {
        let text = this._text,
            options = this._textOptions;
        if (text) {
            this.setPathLabel(null).setPathLabel(text, options);
        }
    },

    setPathLabel: function (text, options) {
        this._text = text;
        this._textOptions = options;

        if (!this._map) return this;

		let z = this._map.getZoom();
		let fntsz = 5*(2**Math.max(0,z-16));

		let defaults = { placement: 1 };
        options = L.Util.extend(defaults, options);

        if (!text) {
            if (this._textNode && this._textNode.parentNode) {
                this._renderer._container.removeChild(this._textNode);
                delete this._textNode;
            }
            return this;
        }

        let svg = this._renderer._container;
        let id = this._path.getAttribute('id');
		if (!id) {
			id = 'pathdef-' + L.Util.stamp(this);
	        this._path.setAttribute('id', id);
		}

		let placementStyles = [['50%','middle'],['10%','start'],['90%','end']];
		let placement = Math.min(options.placement,placementStyles.length);
		let weight = this.options.weight || 1;
		let add_halo = (weight > 1);
		let color = this.options.color;
		let pathl = this._path.getTotalLength();
		let textl = 0;

		let textNode = L.SVG.create('text');
		textNode.classList.add('leaflet-interactive','path-label');
	
		textNode.setAttribute('font-size', fntsz + 'px');
		
		if (color && add_halo) {
			textNode.classList.add('path-label-halo');
			textNode.style.setProperty('--halo-color', color);
		}
		
		this._textNode = textNode;
		svg.appendChild(textNode);

		for (let i=0; i<placement; i++) {
			let textPath = L.SVG.create('textPath');
			let style = (placement==2) ? placementStyles[i+1] : placementStyles[i];
			textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", '#'+id);
			//textPath.setAttribute('class', 'leaflet-interactive');
			textPath.setAttribute('startOffset', style[0]);
			textPath.setAttribute('text-anchor', style[1]);
			textPath.appendChild(document.createTextNode(text));
			textNode.appendChild(textPath);
			//textNode.addEventParent(this)

			if (!textl) {
				textl = textPath.getComputedTextLength();

				// only show one label for shorter paths, and force it to fit
				if ((2*placement*textl) > pathl) {
					let truncfit = Math.round(0.8*pathl);
					if (textl > truncfit) textPath.setAttribute('textLength',truncfit);
					break;
				}
			}
		}

        return this;
    }
};

L.Polyline.include(PolylinePathLabel);
})();