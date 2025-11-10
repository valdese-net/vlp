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

		let zooml = this._map.getZoom();

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
		let pathl = this._path.getTotalLength();
		let textl = 0;

		let textNode = L.SVG.create('text');
		textNode.classList.add('path-label');
		let fntsz = (zooml>13) ? (4 + (zooml-12)*2) : 4;
		textNode.setAttribute('font-size', fntsz + 'px');
		
		let color = this.options.color;
		if (color) textNode.setAttribute('stroke',color);
		
		this._textNode = textNode;
		svg.appendChild(textNode);

		for (let i=0; i<placement; i++) {
			let textPath = L.SVG.create('textPath');
			let style = (placement==2) ? placementStyles[i+1] : placementStyles[i];
			textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", '#'+id);
			textPath.setAttribute('startOffset', style[0]);
			textPath.setAttribute('text-anchor', style[1]);
			textPath.appendChild(document.createTextNode(text));
			textNode.appendChild(textPath);
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