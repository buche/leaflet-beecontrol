L.Control.BeeControl = L.Control.extend({

	options: {
		position: "topright"
		, r1: 3
		, r2: 5
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._beeIcon = L.icon({
			iconUrl: 'images/beemarker.png'
			, iconSize: [37, 65]
			, iconAnchor: [18, 63]
			, popupAnchor: [0, -63]
		});
		this._r1_list = [1, 2, 2.5, 3, 3.5];
		this._r2_list = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11];
	},

	onAdd: function(map) {
		this._initLayout();
		this._map.on('updatebeecontrol', this._update_beecontrol, this);
		return this._container;
	},

	_initLayout: function() {
		var classname = 'beecontrol';
		this._container = L.DomUtil.create('div', classname);
		L.DomEvent.disableClickPropagation(this._container);
		var form = L.DomUtil.create('form', classname + '-form', this._container);

		var heading = L.DomUtil.create('div', classname + '-header', form);
		heading.innerHTML = 'Flugbereich eines<br />Bienenvolkes';

		var label = L.DomUtil.create('label', classname + '-line', form);
		var input = L.DomUtil.create('input');
		input.type = 'checkbox';
		input.id = 'idBeeControlCenter';
		label.appendChild(input);
		var name = L.DomUtil.create('span', classname + '-label');
		name.innerHTML = 'Bienenstandort';
		label.appendChild(name);
		L.DomEvent.on(input, 'click', this._onInputClickPosition, this);

		var label1 = L.DomUtil.create('label', classname + '-line', form);
		var input1 = L.DomUtil.create('input');
		input1.type = 'checkbox';
		input1.id = 'idBeeControlR1';
		label1.appendChild(input1);
		var name1 = L.DomUtil.create('span', classname + '-label');
		name1.innerHTML = 'Hauptfluggebiet';
		label1.appendChild(name1);
		L.DomEvent.on(input1, 'click', this._onInputClickRadius1, this);

		var labelS1 = L.DomUtil.create('label', classname + '-line ' + classname + '-select', form);
		var nameS1 = L.DomUtil.create('span', classname + '-label');
		nameS1.innerHTML = 'Radius ';
		labelS1.appendChild(nameS1);
		var select1 = L.DomUtil.create('select');
		select1.id = 'idBeeControlS1';
		for (var i=0; i<this._r1_list.length; i++) {
			var val = this._r1_list[i];
			var opt = document.createElement('option');
			opt.value = val;
			opt.innerHTML = (val + ' km').replace('.', ',');
			if (this.options.r1 == val) {
				opt.selected = true;
			}
			select1.appendChild(opt);
		}
		labelS1.appendChild(select1);
		L.DomEvent.on(select1, 'change', this._onSelectRadius1, this);

		var label2 = L.DomUtil.create('label', classname + '-line', form);
		var input2 = L.DomUtil.create('input');
		input2.type = 'checkbox';
		input2.id = 'idBeeControlR2';
		label2.appendChild(input2);
		var name2 = L.DomUtil.create('span', classname + '-label');
		name2.innerHTML = 'Erreichbares Gebiet';
		label2.appendChild(name2);
		L.DomEvent.on(input2, 'click', this._onInputClickRadius2, this);

		var labelS2 = L.DomUtil.create('label', classname + '-line ' + classname + '-select', form);
		var nameS2 = L.DomUtil.create('span', classname + '-label');
		nameS2.innerHTML = 'Radius ';
		labelS2.appendChild(nameS2);
		var select2 = L.DomUtil.create('select');
		select2.id = 'idBeeControlS2';
		for (var i=0; i<this._r2_list.length; i++) {
			var val = this._r2_list[i];
			var opt = document.createElement('option');
			opt.value = val;
			opt.innerHTML = (val + ' km').replace('.', ',');
			if (this.options.r2 == val) {
				opt.selected = true;
			}
			select2.appendChild(opt);
		}
		labelS2.appendChild(select2);
		L.DomEvent.on(select2, 'change', this._onSelectRadius2, this);

		var resetLine = L.DomUtil.create('label', classname + '-line', form);
		var resetLink = L.DomUtil.create('a', classname + '-link');
		resetLink.innerHTML = 'Einstellungen löschen';
		resetLink.setAttribute('href', 'index.html');
		resetLine.appendChild(resetLink);
	},

	_markPosition: function() {
		var input = document.getElementById('idBeeControlCenter')
		if (input.checked) {
			var center;
			if (this.options.mlat && this.options.mlon) {
				center = new L.LatLng(this.options.mlat, this.options.mlon);
			} else {
				center = this._map.getCenter();
			}
			if (this._marker && this._map.hasLayer(this._marker)) {
				this._map.removeLayer(this._marker);
			}
			this._marker = L.marker(center, {draggable: true, icon: this._beeIcon});
			this._marker.on('dragend', this._onMarkerDragend, this);
			this._marker.addTo(this._map);
			this.options.m = 1;
			this.options.mlat = this._marker.getLatLng().lat;
			this.options.mlon = this._marker.getLatLng().lng;
		} else {
			this._map.removeLayer(this._marker);
			this._marker = null;
			this.options.m = null;
			if (!this._circle1 && !this._circle2) {
				this.options.mlat = null;
				this.options.mlon = null;
			}
		}
	},

	_onInputClickPosition: function() {
		this._markPosition();
		this._map.fire('beecontrolchanged');
	},

	_drawRadius1: function() {
		// clean up first
		if (this._circle1 && this._map.hasLayer(this._circle1)) this._map.removeLayer(this._circle1);
		this._circle1 = null;
		this.options.c1 = null;

		// draw circle if needed
		var input = document.getElementById('idBeeControlR1')
		if (input.checked) {
			this.options.c1 = 1;
			var center;
			if (this.options.mlat && this.options.mlon) {
				center = new L.LatLng(this.options.mlat, this.options.mlon);
			} else {
				center = this._map.getCenter();
				this.options.mlat = center.lat;
				this.options.mlon = center.lng;
			}
			this._circle1 = L.circle(center, this.options.r1*1000, {clickable: true}).addTo(this._map);
		}

		if (!this._marker && !this._circle1 && !this._circle2) {
			this.options.mlat = null;
			this.options.mlon = null;
		}
	},

	_onInputClickRadius1: function() {
		this._drawRadius1();
		this._map.fire('beecontrolchanged');
	},

	_onSelectRadius1: function() {
		var select = document.getElementById('idBeeControlS1')
		this.options.r1 = select.value;
		this._onInputClickRadius1();
	},

	_drawRadius2: function() {
		// clean up first
		if (this._circle2 && this._map.hasLayer(this._circle2)) this._map.removeLayer(this._circle2);
		this._circle2 = null;
		this.options.c2 = null;

		// draw circle if needed
		var input = document.getElementById('idBeeControlR2')
		if (input.checked) {
			this.options.c2 = 1;
			var center;
			if (this.options.mlat && this.options.mlon) {
				center = new L.LatLng(this.options.mlat, this.options.mlon);
			} else {
				center = this._map.getCenter();
				this.options.mlat = center.lat;
				this.options.mlon = center.lng;
			}
			this._circle2 = L.circle(center, this.options.r2*1000, {clickable: true}).addTo(this._map);
		}

		if (!this._marker && !this._circle1 && !this._circle2) {
			this.options.mlat = null;
			this.options.mlon = null;
		}
	},

	_onInputClickRadius2: function() {
		this._drawRadius2();
		this._map.fire('beecontrolchanged');
	},

	_onSelectRadius2: function() {
		var select = document.getElementById('idBeeControlS2')
		this.options.r2 = select.value;
		this._onInputClickRadius2();
	},

	_onMarkerDragend: function(e) {
		var marker = e.target;
		this.options.mlat = marker.getLatLng().lat;
		this.options.mlon = marker.getLatLng().lng;
		this._drawRadius1();
		this._drawRadius2();
		this._map.fire('beecontrolchanged');
	},

	_update_beecontrol: function(e) {
		if (e.params.r1) {
			for (var i=0; i<this._r1_list.length; i++) {
				if (this._r1_list[i] == e.params.r1) {
					this.options.r1 = e.params.r1;
					var elem1 = document.getElementById('idBeeControlS1');
					elem1.value = this.options.r1;
					elem1.selectedIndex = i;

					// This ugly code is needed for Internet Explorer to trigger <select> to change its display
					_s1idx = i; // global with intent
					window.setTimeout(function() {
						document.getElementById('idBeeControlS1').selectedIndex = _s1idx;
					}, 200)
				}
			}
		}
		if (e.params.r2) {
			for (var i=0; i<this._r2_list.length; i++) {
				if (this._r2_list[i] == e.params.r2) {
					this.options.r2 = e.params.r2;
					var elem2 = document.getElementById('idBeeControlS2');
					elem2.value = this.options.r2;
					elem2.selectedIndex = i;

					// This ugly code is needed for Internet Explorer to trigger <select> to change its display
					_s2idx = i; // global with intent
					window.setTimeout(function() {
						document.getElementById('idBeeControlS2').selectedIndex = _s2idx;
					}, 210)
				}
			}
		}
		if (e.params.mlat) {
			this.options.mlat = e.params.mlat;
		}
		if (e.params.mlon) {
			this.options.mlon = parseFloat(e.params.mlon);
		}

		if (e.params.c1 && this.options.mlat && this.options.mlon) {
			this.options.c1 = 1;
			document.getElementById('idBeeControlR1').checked = true;
			this._drawRadius1();
		}
		if (e.params.c2 && this.options.mlat && this.options.mlon) {
			this.options.c2 = 1;
			document.getElementById('idBeeControlR2').checked = true;
			this._drawRadius2();
		}
		if (e.params.m && this.options.mlat && this.options.mlon) {
			this.options.m = 1;
			document.getElementById('idBeeControlCenter').checked = true;
			this._markPosition();
		}
	},

	initMarker: function(askGeolocation) {
		var askGeolocation = askGeolocation && typeof navigator.geolocation != "undefined";
		var center = this._map.getCenter();
		this.options.mlat = center.lat;
		this.options.mlon = center.lng;
		this.options.m = 1;
		document.getElementById('idBeeControlCenter').checked = true;
		this._markPosition();
		this._marker.bindPopup("Zieh' mich dorthin,<br />wo deine Bienen stehen.<br />"
				+ (askGeolocation ? '(<a href="#" onClick="doGeolocate()">Oder lass mich heraus-<br />'
				+ 'finden, wo du gerade bist</a>)<br /><br />' : '')
				+ "Weiteres steht in der<br />Anleitung oben links.").openPopup();
	}

});

L.control.beeControl = function(options) {
	return new L.Control.BeeControl(options);
}

