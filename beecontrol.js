L.Control.BeeControl = L.Control.extend({

	options: {
		position: "topright"
		, r1: 3
		, r2: 5
		, useGeolocation: true
		, instructiontext: ""
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._beeIcon = L.icon({
			iconUrl: 'beemarker.png'
			, iconSize: [37, 65]
			, iconAnchor: [18, 63]
			, popupAnchor: [0, -63]
		});
		this._r1_list = [1, 2, 2.5, 3, 3.5];
		this._r2_list = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11];
	},

	onAdd: function(map) {
		this._countBees = 1;
		this._initLayout();
		this._map.on('updatebeecontrol', this._update_beecontrol, this);
		this._map.on('locationfound', this._geolocationFound, this);
		this._map.on('locationerror', this._geolocationError, this);
		return this._container;
	},

	_initElementDetailed: function(baseDiv, counter) {
		// add checkbox for bee location
		var input = L.DomUtil.create('input');
		input.type = 'checkbox';
		input.id = 'idBeeControlCenter_' + counter;
		baseDiv.appendChild(input);

		// add label for bee location
		var name = L.DomUtil.create('label', 'beecontrol-label');
		name.setAttribute('for', input.id);
		name.innerHTML = 'Bienenstandort';
		baseDiv.appendChild(name);
		L.DomEvent.on(input, 'click', this._onInputClickPosition, this);
		L.DomUtil.create('br', '', baseDiv);

		// add checkbox for main area
		var input1 = L.DomUtil.create('input');
		input1.type = 'checkbox';
		input1.id = 'idBeeControlInner_' + counter;
		baseDiv.appendChild(input1);

		// add label for main area
		var name1 = L.DomUtil.create('label', 'beecontrol-label');
		name1.setAttribute('for', input1.id);
		name1.innerHTML = 'Hauptfluggebiet';
		baseDiv.appendChild(name1);
		L.DomEvent.on(input1, 'click', this._onInputClickRadius1, this);
		L.DomUtil.create('br', '', baseDiv);

		// add radius for main area
		var dummy1 = L.DomUtil.create('input', '', baseDiv);
		dummy1.type = 'checkbox';
		dummy1.style.visibility = 'hidden';
		var nameS1 = L.DomUtil.create('span', 'beecontrol-label');
		nameS1.innerHTML = 'Radius ';
		baseDiv.appendChild(nameS1);
		var select1 = L.DomUtil.create('select');
		select1.id = 'idBeeControlRM_' + counter;
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
		baseDiv.appendChild(select1);
		L.DomEvent.on(select1, 'change', this._onSelectRadius, this);
		L.DomUtil.create('br', '', baseDiv);

		// add checkbox for wide area
		var input2 = L.DomUtil.create('input');
		input2.type = 'checkbox';
		input2.id = 'idBeeControlOuter_' + counter;
		baseDiv.appendChild(input2);

		// add label for wide area
		var name2 = L.DomUtil.create('label', 'beecontrol-label');
		name2.setAttribute('for', input2.id);
		name2.innerHTML = 'Erreichbares Gebiet';
		baseDiv.appendChild(name2);
		L.DomEvent.on(input2, 'click', this._onInputClickRadius2, this);
		L.DomUtil.create('br', '', baseDiv);

		// add radius for wide area
		var dummy2 = L.DomUtil.create('input', '', baseDiv);
		dummy2.type = 'checkbox';
		dummy2.style.visibility = 'hidden';
		var nameS2 = L.DomUtil.create('span', 'beecontrol-label');
		nameS2.innerHTML = 'Radius ';
		baseDiv.appendChild(nameS2);
		var select2 = L.DomUtil.create('select');
		select2.id = 'idBeeControlRW_' + counter;
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
		baseDiv.appendChild(select2);
		L.DomEvent.on(select2, 'change', this._onSelectRadius2, this);
	},

	_initElement: function(baseDiv, counter, beCompact) {
		// beCompact is unused yet
		var beeElement = L.DomUtil.create('div', 'beecontrol-element', baseDiv);
		this._initElementDetailed(beeElement, counter);
	},

	_initLayout: function() {
		this._container = L.DomUtil.create('div', 'beecontrol');
		L.DomEvent.disableClickPropagation(this._container);

		var heading = L.DomUtil.create('div', 'beecontrol-header', this._container);
		heading.innerHTML = 'Flugbereich eines<br />Bienenvolkes';

		var beeElements = L.DomUtil.create('div', 'beecontrol-elements', this._container);
		this._initElement(beeElements, this._countBees++, false);

		var resetLine = L.DomUtil.create('label', 'beecontrol-line', this._container);
		var resetLink = L.DomUtil.create('a', 'beecontrol-link');
		resetLink.innerHTML = 'Einstellungen löschen';
		resetLink.setAttribute('href', 'index.html');
		resetLine.appendChild(resetLink);
	},

	_markPosition: function() {
		var input = document.getElementById('idBeeControlCenter_1'); // TODO: get current center
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

	_onInputClickPosition: function(evnt) {
		this._markPosition();
		this._map.fire('beecontrolchanged');
	},

	_drawRadius1: function() {
		// clean up first
		if (this._circle1 && this._map.hasLayer(this._circle1)) this._map.removeLayer(this._circle1);
		this._circle1 = null;
		this.options.c1 = null;

		// draw circle if needed
		var input = document.getElementById('idBeeControlInner_1')
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

	_onSelectRadius: function(evnt) {
		// TODO: generalize function for any radius selected
		var select = evnt.target;
		this.options.r1 = select.value;
		this._onInputClickRadius1();
	},

	_drawRadius2: function() {
		// clean up first
		if (this._circle2 && this._map.hasLayer(this._circle2)) this._map.removeLayer(this._circle2);
		this._circle2 = null;
		this.options.c2 = null;

		// draw circle if needed
		var input = document.getElementById('idBeeControlOuter_1')
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

	_onSelectRadius2: function(evnt) {
		var select = evnt.target;
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
					var elem1 = document.getElementById('idBeeControlRM_1');
					elem1.value = this.options.r1;
					elem1.selectedIndex = i;

					// This ugly code is needed for Internet Explorer to trigger <select> to change its display
					_s1idx = i; // global with intent
					window.setTimeout(function() {
						document.getElementById('idBeeControlRM_1').selectedIndex = _s1idx;
					}, 200)
				}
			}
		}
		if (e.params.r2) {
			for (var i=0; i<this._r2_list.length; i++) {
				if (this._r2_list[i] == e.params.r2) {
					this.options.r2 = e.params.r2;
					var elem2 = document.getElementById('idBeeControlRW_1');
					elem2.value = this.options.r2;
					elem2.selectedIndex = i;

					// This ugly code is needed for Internet Explorer to trigger <select> to change its display
					_s2idx = i; // global with intent
					window.setTimeout(function() {
						document.getElementById('idBeeControlRW_1').selectedIndex = _s2idx;
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
			document.getElementById('idBeeControlInner_1').checked = true;
			this._drawRadius1();
		}
		if (e.params.c2 && this.options.mlat && this.options.mlon) {
			this.options.c2 = 1;
			document.getElementById('idBeeControlOuter_1').checked = true;
			this._drawRadius2();
		}
		if (e.params.m && this.options.mlat && this.options.mlon) {
			this.options.m = 1;
			document.getElementById('idBeeControlCenter_1').checked = true;
			this._markPosition();
		}
	},

	initMarker: function(askGeolocation) {
		var ask = typeof askGeolocation == 'undefined' ? true : !!askGeolocation;
		ask = this.options.useGeolocation && ask && typeof navigator.geolocation != "undefined";
		var center = this._map.getCenter();
		this.options.mlat = center.lat;
		this.options.mlon = center.lng;
		this.options.m = 1;
		document.getElementById('idBeeControlCenter_1').checked = true;
		this._markPosition();
		var markerText = "Zieh' mich dorthin,<br />wo deine Bienen stehen.<br />"
				// TODO: fix usage of global variable map on next line
				+ (ask ? '(<a href="#" onClick="map.locate({timeout: 10000})">Oder lass mich heraus-<br />'
				+ 'finden, wo du gerade bist</a>)<br /><br />' : '')
				+ this.options.instructiontext;
		this._marker.bindPopup(markerText).openPopup();
	},

	setMarkerAfterGeolocation: function() {
		this.initMarker(false);
	},

	_geolocationError: function(msg) {
		alert("Keine Ahnung, wo du steckst.\nDu musst den Bienenkorb leider selbst platzieren.");
		this.setMarkerAfterGeolocation();
	},

	_geolocationFound: function(data) {
		if (typeof this._map != "undefined") {
			this._map.addOneTimeEventListener('moveend', this.setMarkerAfterGeolocation, this)
			this._map.setView(data.latlng, 13);
		}
	}

});

L.control.beeControl = function(options) {
	return new L.Control.BeeControl(options);
}

