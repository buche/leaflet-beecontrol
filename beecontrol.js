L.Control.BeeControl = L.Control.extend({

	options: {
		position: "topright" // default position of control
		, r1: 3 // default radius of main area
		, r2: 5 // default radius of wide area
		, color: '#03f' // default color of areas
		, useGeolocation: true // flag to disable geolocation
		, instructiontext: "" // additional text for marker popup
		, markerimage: 'beemarker.png' // default marker image
		, markersize: [37, 65] // size of markerimage
		, markeranchor: [18, 63] // anchor of markerimgae
		, markerpopupanchor: [0, -63] // anchor of markerimage's popup
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._beeIcon = L.icon({
			iconUrl: this.options.markerimage
			, iconSize: this.options.markersize
			, iconAnchor: this.options.markeranchor
			, popupAnchor: this.options.markerpopupanchor
		});
		this._r1_list = [1, 2, 2.5, 3, 3.5];
		this._r2_list = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11];
		this._bees = {}; // holds all bee location data objects
	},

	onAdd: function(map) {
		this._countBees = 1;
		this._initMarkerCalled = false;
		this._initLayout();
		this._map.on('updatebeecontrol', this._update_beecontrol, this);
		this._map.on('locationfound', this._geolocationFound, this);
		this._map.on('locationerror', this._geolocationError, this);
		this._map.on('beecontroladdelement', this._addBeeElement, this);
		return this._container;
	},

	/**
	 * Initializes a structure holding all data of one bee location.
	 * @returns object
	 */
	_initBeeData: function() {
		var bee = {};
		bee.centerChecked = false;
		bee.center = null;
		bee.innerChecked = false;
		bee.innerRadius = this.options.r1;
		bee.innerColor = this.options.color;
		bee.innerCircle = null;
		bee.outerChecked = false;
		bee.outerRadius = this.options.r2;
		bee.outerColor = this.options.color;
		bee.outerCircle = null;
		bee.marker = null;
		return bee;
	},

	/**
	 * Create DOM for one beehive position in a compact way.
	 * @param object baseDiv container for new DOM elements
	 * @param integer counter consecutive number of beehive position elements
	 */
	_initElementCompact: function(baseDiv, counter) {
		// add checkbox for bee location
		var input = L.DomUtil.create('input', 'beecontrol-checkbox');
		input.type = 'checkbox';
		input.id = 'idBeeControlCenter_' + counter;
		baseDiv.appendChild(input);

		// add label for bee location
		var name = L.DomUtil.create('label', 'beecontrol-label');
		name.setAttribute('for', input.id);
		name.innerHTML = (counter > 1 ? '' + counter + '. ' : '') + 'Bienenstandort';
		baseDiv.appendChild(name);
		L.DomEvent.on(input, 'click', this._onInputClickPosition, this);
		L.DomUtil.create('br', '', baseDiv);

		// add checkbox for main area
		var input1 = L.DomUtil.create('input', 'beecontrol-checkbox');
		input1.type = 'checkbox';
		input1.id = 'idBeeControlInner_' + counter;
		baseDiv.appendChild(input1);
		L.DomEvent.on(input1, 'click', this._onInputClickRadius, this);

		// add radius for main area
		var select1 = L.DomUtil.create('select', 'beecontrol-select');
		select1.id = 'idBeeControlRI_' + counter;
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
		var input2 = L.DomUtil.create('input', 'beecontrol-checkbox');
		input2.type = 'checkbox';
		input2.id = 'idBeeControlOuter_' + counter;
		baseDiv.appendChild(input2);
		L.DomEvent.on(input2, 'click', this._onInputClickRadius, this);

		// add radius for wide area
		var select2 = L.DomUtil.create('select', 'beecontrol-select');
		select2.id = 'idBeeControlRO_' + counter;
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
		L.DomEvent.on(select2, 'change', this._onSelectRadius, this);
	},

	/**
	 * Create DOM for one beehive position in detail.
	 * @param object baseDiv container for new DOM elements
	 * @param integer counter consecutive number of beehive position elements
	 */
	_initElementDetailed: function(baseDiv, counter) {
		// add checkbox for bee location
		var input = L.DomUtil.create('input', 'beecontrol-checkbox');
		input.type = 'checkbox';
		input.id = 'idBeeControlCenter_' + counter;
		baseDiv.appendChild(input);

		// add label for bee location
		var name = L.DomUtil.create('label', 'beecontrol-label');
		name.setAttribute('for', input.id);
		name.innerHTML = (counter > 1 ? '' + counter + '. ' : '') + 'Bienenstandort';
		baseDiv.appendChild(name);
		L.DomEvent.on(input, 'click', this._onInputClickPosition, this);
		L.DomUtil.create('br', '', baseDiv);

		// add checkbox for main area
		var input1 = L.DomUtil.create('input', 'beecontrol-checkbox');
		input1.type = 'checkbox';
		input1.id = 'idBeeControlInner_' + counter;
		baseDiv.appendChild(input1);
		L.DomEvent.on(input1, 'click', this._onInputClickRadius, this);

		// add label for main area
		var name1 = L.DomUtil.create('label', 'beecontrol-label');
		name1.setAttribute('for', input1.id);
		name1.innerHTML = 'Hauptfluggebiet';
		baseDiv.appendChild(name1);
		L.DomUtil.create('br', '', baseDiv);

		// add radius for main area
		var dummy1 = L.DomUtil.create('input', 'beecontrol-checkbox', baseDiv);
		dummy1.type = 'checkbox';
		dummy1.style.visibility = 'hidden';
		var nameS1 = L.DomUtil.create('span', 'beecontrol-label');
		nameS1.innerHTML = 'Radius ';
		baseDiv.appendChild(nameS1);
		var select1 = L.DomUtil.create('select', 'beecontrol-select');
		select1.id = 'idBeeControlRI_' + counter;
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
		var input2 = L.DomUtil.create('input', 'beecontrol-checkbox');
		input2.type = 'checkbox';
		input2.id = 'idBeeControlOuter_' + counter;
		baseDiv.appendChild(input2);
		L.DomEvent.on(input2, 'click', this._onInputClickRadius, this);

		// add label for wide area
		var name2 = L.DomUtil.create('label', 'beecontrol-label');
		name2.setAttribute('for', input2.id);
		name2.innerHTML = 'Erreichbares Gebiet';
		baseDiv.appendChild(name2);
		L.DomUtil.create('br', '', baseDiv);

		// add radius for wide area
		var dummy2 = L.DomUtil.create('input', 'beecontrol-checkbox', baseDiv);
		dummy2.type = 'checkbox';
		dummy2.style.visibility = 'hidden';
		var nameS2 = L.DomUtil.create('span', 'beecontrol-label');
		nameS2.innerHTML = 'Radius ';
		baseDiv.appendChild(nameS2);
		var select2 = L.DomUtil.create('select', 'beecontrol-select');
		select2.id = 'idBeeControlRO_' + counter;
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
		L.DomEvent.on(select2, 'change', this._onSelectRadius, this);
	},

	/**
	 * Create DOM for one beehive position.
	 * @param object baseDiv container for new DOM elements
	 * @param integer counter consecutive number of beehive position elements
	 * @param boolean beCompact flag to use a compact view if true
	 */
	_initElement: function(baseDiv, counter, beCompact) {
		var beeElement = L.DomUtil.create('div', 'beecontrol-element', baseDiv);
		if (beCompact) {
			this._initElementCompact(beeElement, counter);
		} else {
			this._initElementDetailed(beeElement, counter);
		}
	},

	_addBeeElement: function() {
		// get the container
		var container = document.getElementById('idBeeElementContainer');
		// add a bee element
		this._initElement(container, this._countBees++, true);
		L.DomUtil.create('hr', 'beecontrol-hr', container);
	},

	_initLayout: function() {
		this._container = L.DomUtil.create('div', 'beecontrol');
		L.DomEvent.disableClickPropagation(this._container);

		var heading = L.DomUtil.create('div', 'beecontrol-header', this._container);
		heading.innerHTML = 'Flugbereich eines<br />Bienenvolkes';

		var beeElements = L.DomUtil.create('div', 'beecontrol-elements', this._container);
		beeElements.id = 'idBeeElementContainer';
		this._initElement(beeElements, this._countBees++, false);

		L.DomUtil.create('hr', 'beecontrol-hr', beeElements);
		var linkDiv = L.DomUtil.create('div', 'beecontrol-linkdiv', this._container);
		var addLine = L.DomUtil.create('label', 'beecontrol-line', linkDiv);
		var addLink = L.DomUtil.create('a', 'beecontrol-link');
		addLink.innerHTML = 'Zusätzlicher Standort';
		// global variable map is needed to fire an event
		addLink.onclick = function() { map.fire('beecontroladdelement'); return false; }
		addLink.setAttribute('href', 'index.html');
		addLine.appendChild(addLink);

		var resetLine = L.DomUtil.create('label', 'beecontrol-line', linkDiv);
		var resetLink = L.DomUtil.create('a', 'beecontrol-link');
		resetLink.innerHTML = 'Alles zurücksetzen';
		resetLink.setAttribute('href', 'index.html');
		resetLine.appendChild(resetLink);
	},

	/**
	 * A beehive position will be marked or unmarked as requested by user or programm.
	 * @param integer beenr the consecutive number of the beehive position
	 */
	_markPosition: function(beenr) {
		var bee = typeof this._bees['bee' + beenr] == 'undefined' ? this._initBeeData() : this._bees['bee' + beenr];
		var input = document.getElementById('idBeeControlCenter_' + beenr);
		if (input.checked) {
			bee.centerChecked = true;
			if (!bee.center) {
				bee.center = this._map.getCenter();
			}
			if (bee.marker && this._map.hasLayer(bee.marker)) {
				this._map.removeLayer(bee.marker);
			}
			if (typeof bee.marker == 'undefined' || !bee.marker) {
				bee.marker = L.marker(bee.center, {draggable: true, icon: this._beeIcon});
				bee.marker._beenr = beenr;
				bee.marker.bindPopup('Standort ' + beenr);
				bee.marker.on('dragend', this._onMarkerDragend, this);
			}
			bee.marker.addTo(this._map);
		} else {
			this._map.removeLayer(bee.marker);
			bee.marker = null;
			bee.centerChecked = false;
			if (!bee.innerCircle && !bee.outerCircle) {
				bee.center = null;
			}
		}
		this._bees['bee' + beenr] = bee;
	},

	/**
	 * Set or unset marker depending on input field change.
	 * @param object e event
	 */
	_onInputClickPosition: function(e) {
		var beenr = e.target.id.split('_')[1];
		this._markPosition(beenr);
		this._map.fire('beecontrolchanged');
	},

	_drawRadius: function(beenr) {
		var bee = this._bees['bee' + beenr];
		// clean up inner circle
		if (bee.innerCircle && this._map.hasLayer(bee.innerCircle)) {
			this._map.removeLayer(bee.innerCircle);
			bee.innerCircle = null;
		}
		// clean up outer circle
		if (bee.outerCircle && this._map.hasLayer(bee.outerCircle)) {
			this._map.removeLayer(bee.outerCircle);
			bee.outerCircle = null;
		}

		// add inner circle if requested
		if (!bee.center) {
			bee.center = this._map.getCenter();
		}
		var input = document.getElementById('idBeeControlInner_' + beenr);
		if (input && input.checked) {
			bee.innerCircle = L.circle(bee.center, bee.innerRadius*1000, {clickable: true}).addTo(this._map);
		}

		// add outer circle if requested
		input = document.getElementById('idBeeControlOuter_' + beenr);
		if (input && input.checked) {
			bee.outerCircle = L.circle(bee.center, bee.outerRadius*1000, {clickable: true}).addTo(this._map);
		}

		// clear center if it isn't needed any more
		if (!bee.marker && !bee.innerCircle && !bee.outerCircle) {
			bee.center = null;
		}
	},

	_onSelectRadius: function(e) {
		var beenr = e.target.id.split('_')[1];
		var bee = this._bees['bee' + beenr];
		var radiusType = e.target.id.split('_')[0];
		radiusType = radiusType.substr(radiusType.length -1, 1);
		if (radiusType == 'I') {
			bee.innerRadius = e.target.value;
		} else {
			bee.outerRadius = e.target.value;
		}
		this._drawRadius(beenr);
		this._map.fire('beecontrolchanged');
	},

	_onInputClickRadius: function(e) {
		var beenr = e.target.id.split('_')[1];
		this._drawRadius(beenr);
		this._map.fire('beecontrolchanged');
	},

	_onMarkerDragend: function(e) {
		var marker = e.target;
		var bee = this._bees['bee' + marker._beenr];
		bee.center = marker.getLatLng();
		this._drawRadius(marker._beenr);
		this._map.fire('beecontrolchanged');
	},

	_getBeeFromOldUrlParams: function(params) {
		// Example of old params: r1=1, r2=4, mlat=51.58, mlon=10.1, m=1, c1=1, c2=1
		var bee = this._initBeeData();
		var hasParams = false;

		// marker position
		if (params.mlat && params.mlon) {
			bee.center = L.latLng(params.mlat, params.mlon);
			hasParams = true;
		}

		// marker visibility
		if (params.m && params.m == '1' && params.mlat && params.mlon) {
			bee.centerChecked = true;
			hasParams = true;
		}

		// main area
		if (params.r1) {
			// only radius values of our list are valid
			for (var i=0; i<this._r1_list.length; i++) {
				if (this._r1_list[i] == params.r1) {
					bee.innerRadius = params.r1;
					hasParams = true;
					break;
				}
			}
		}
		if (!bee.innerRadius) {
			// no valid radius? use default
			bee.innerRadius = this.options.r1;
		}
		if (params.c1 && params.c1 == '1' && params.mlat && params.mlon) {
			bee.innerChecked = true;
			hasParams = true;
			document.getElementById('idBeeControlOuter_1').checked = true;
		}
		document.getElementById('idBeeControlRI_1').value = bee.innerRadius;

		// wide area
		if (params.r2) {
			// only radius values of our list are valid
			for (var i=0; i<this._r1_list.length; i++) {
				if (this._r2_list[i] == params.r2) {
					bee.outerRadius = params.r2;
					hasParams = true;
					break;
				}
			}
		}
		if (!bee.outerRadius) {
			// no valid radius? use default
			bee.outerRadius = this.options.r2;
		}
		if (params.c2 && params.c2 == '1' && params.mlat && params.mlon) {
			bee.outerChecked = true;
			hasParams = true;
			document.getElementById('idBeeControlInner_1').checked = true;
		}
		document.getElementById('idBeeControlRO_1').value = bee.outerRadius;

		return hasParams ? bee : null;

		/*
		if (e.params.r1) {
			for (var i=0; i<this._r1_list.length; i++) {
				if (this._r1_list[i] == e.params.r1) {
					this.options.r1 = e.params.r1;
					var elem1 = document.getElementById('idBeeControlRI_1');
					elem1.value = this.options.r1;
					elem1.selectedIndex = i;

					// This ugly code is needed for Internet Explorer to trigger <select> to change its display
					_s1idx = i; // global with intent
					window.setTimeout(function() {
						document.getElementById('idBeeControlRI_1').selectedIndex = _s1idx;
					}, 200)
				}
			}
		}
		if (e.params.r2) {
			for (var i=0; i<this._r2_list.length; i++) {
				if (this._r2_list[i] == e.params.r2) {
					this.options.r2 = e.params.r2;
					var elem2 = document.getElementById('idBeeControlRO_1');
					elem2.value = this.options.r2;
					elem2.selectedIndex = i;

					// This ugly code is needed for Internet Explorer to trigger <select> to change its display
					_s2idx = i; // global with intent
					window.setTimeout(function() {
						document.getElementById('idBeeControlRO_1').selectedIndex = _s2idx;
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
			this._drawRadius('1');
		}
		if (e.params.c2 && this.options.mlat && this.options.mlon) {
			this.options.c2 = 1;
			document.getElementById('idBeeControlOuter_1').checked = true;
			this._drawRadius('1');
		}
		if (e.params.m && this.options.mlat && this.options.mlon) {
			this.options.m = 1;
			document.getElementById('idBeeControlCenter_1').checked = true;
			this._markPosition('1');
		}
		*/
	},

	_getBeesFromUrlParams: function(params) {
		// TODO
	},

	/**
	 * Update beecontrol to use the provided url parameters.
	 * First check if old style parameters are used.
	 * If no oldstyle parameters are found check for new style parameters.
	 * @param object evnt event
	 */
	_update_beecontrol: function(evnt) {
		if (typeof L.UrlUtil == 'undefined') {
			// permalink is only available when permalink plugin is used
			return
		}

		// first check if we got some old URL parameters
		var bee = this._getBeeFromOldUrlParams(evnt.params);
		if (bee) {
			// some old bee data still there?
			if (typeof this._bees.bee1 != 'undefined' && this._bees.bee1.marker && this._map.hasLayer(this_bees.bee1.marker)) {
				this._map.removeLayer(this._bees.bee1.marker);
				this._bee.bee1.marker = null;
			}
			this._bees.bee1 = bee;
			this.initMarker(false, false);
			return; // finish now, do not mix oldstyle and newstyle parameters
		}

		// TODO: check if we got some new style URL parameters
		// TODO: use _getBeesFromUrlParams()
	},

	/**
	 * Set an initial marker. It is always bee1.
	 * @param boolean askGeolocation ask for geolocation if true
	 * @param boolean openPopup do not open a popup if false, defaults to true
	 */
	initMarker: function(askGeolocation, openPopup) {
		if (this._initMarkerCalled) {
			// do not accidentally init the marker again when it is already called by permalink
			return;
		}
		this._initMarkerCalled = true;
		var ask = typeof askGeolocation == 'undefined' ? true : !!askGeolocation;
		ask = this.options.useGeolocation && ask && typeof navigator.geolocation != "undefined";
		var open = typeof openPopup == 'undefined' ? true : !!openPopup;

		var bee = (typeof this._bees.bee1 == 'undefined') ? this._initBeeData() : this._bees.bee1;
		this._bees.bee1 = bee;
		if (bee.marker && this._map.hasLayer(bee.marker)) {
			this._map.removeLayer(bee.marker);
			bee.marker = null;
		}
		bee.centerChecked = true;
		document.getElementById('idBeeControlCenter_1').checked = true;

		this._markPosition('1');
		this._drawRadius('1');
		var markerText = "Zieh' mich dorthin,<br />wo deine Bienen stehen.<br />"
				// we still need the global variable "map" for starting geolocation
				+ ((ask && typeof map != 'undefined')
					? '(<a href="#" onClick="map.locate({timeout: 10000})">Oder lass mich heraus-<br />'
						+ 'finden, wo du gerade bist</a>)<br /><br />'
					: '')
				+ this.options.instructiontext;
		this._bees.bee1.marker.bindPopup(markerText);
		if (open) {
			this._bees.bee1.marker.openPopup();
		}
	},

	/**
	 * Set an initial marker after calling geolocation. Don't ask for geolocation again.
	 */
	setMarkerAfterGeolocation: function() {
		this._initMarkerCalled = false; // force re-initializing of the existing marker
		this.initMarker(false);
	},

	/**
	 * Geolocation returned with an error.
	 * Set marker in the center of the map without asking again for geolocation.
	 */
	_geolocationError: function(msg) {
		alert("Keine Ahnung, wo du steckst.\nDu musst den Bienenkorb leider selbst platzieren.");
		this.setMarkerAfterGeolocation();
	},

	/**
	 * Geolocation returned with a position. Center the map on this position
	 * and set a marker when position is changed.
	 * @param object location data
	 */
	_geolocationFound: function(data) {
		if (typeof this._map != "undefined") {
			if (typeof this._bees.bee1 != 'undefined') {
				this._bees.bee1.center = data.latlng;
			}
			this._map.addOneTimeEventListener('moveend', this.setMarkerAfterGeolocation, this)
			this._map.setView(data.latlng, 13);
		}
	}

});

/**
 * Shortcut function for creating an instance of BeeControl.
 */
L.control.beeControl = function(options) {
	return new L.Control.BeeControl(options);
}

