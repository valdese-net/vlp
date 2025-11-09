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

		// placement is bit set 1 -start, 2 - center, 4 - end
		let defaults = { placement: 1 };
        options = L.Util.extend(defaults, options);

        if (!text) {
            if (this._textNode && this._textNode.parentNode) {
                this._renderer._container.removeChild(this._textNode);
                delete this._textNode;
            }
            return this;
        }

        let id = 'pathdef-' + L.Util.stamp(this);
        let svg = this._renderer._container;
        this._path.setAttribute('id', id);

		let plamentStyles = [['10%','start'], ['50%','middle'], ['90%','end']];
		let textNode = L.SVG.create('text');
		textNode.classList.add('path-label');
		let fntsz = (zooml>13) ? (4 + (zooml-12)*2) : 4;
		textNode.setAttribute('font-size', fntsz + 'px');

		for (let i=0; i< 3; i++) {
			if (options.placement & (1 << i)) {
				let textPath = L.SVG.create('textPath');
				textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", '#'+id);
				textPath.setAttribute('startOffset', plamentStyles[i][0]);
				textPath.setAttribute('text-anchor', plamentStyles[i][1]);
				textPath.appendChild(document.createTextNode(text));
				textNode.appendChild(textPath);
			}
		}

		this._textNode = textNode;
		svg.appendChild(textNode);

        return this;
    }
};

L.Polyline.include(PolylinePathLabel);

L.LayerGroup.include({
    setPathLabel: function(text, options) {
        for (let layer in this._layers) {
            if (typeof this._layers[layer].setPathLabel === 'function') {
                this._layers[layer].setPathLabel(text, options);
            }
        }
        return this;
    }
});

})();