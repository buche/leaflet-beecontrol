/**
 * This file is licensed under Creative Commons Zero (CC0)
 * http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Author: http://www.openstreetmap.org/user/Zartbitter
 */

var map;
var beeControl;

/**
 * Get all parameters out of the URL.
 * @return Array List of URL parameters key-value indexed
 */
function getUrlParameters() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i=0; i<hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

/**
 * Show some information what this map does and what it doesn't.
 */
function toggleInfo() {
	var infodiv = document.getElementById("infodiv");
	if (infodiv.style.display == "block") {
		infodiv.style.display = "none";
	} else {
		setIframeContent();
		setLinkContent();
		infodiv.style.display = "block";
	}
}

/**
 * Add the bee marker after geolocation happened.
 */
function setMarkerAfterGeolocation() {
	map.off('moveend', setMarkerAfterGeolocation);
	beeControl.initMarker(false);
}

/**
 * Callback for error in geolocation.
 * @var msg errormessage
 */
function geolocationError(msg) {
	alert("Keine Ahnung, wo du steckst.\nDu musst die Biene leider selbst platzieren.");
	setMarkerAfterGeolocation();
}

/**
 * Callback for successful geolocation.
 * @var position Geolocated position
 */
function geolocationFound(position) {
	if (typeof map != "undefined") {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		map.on('moveend', setMarkerAfterGeolocation);
		map.setView(new L.LatLng(lat, lon), 13);
	}
}

/**
 * Geolocation is requested, do it.
 */
function doGeolocate() {
	if (typeof navigator.geolocation != "undefined") {
		navigator.geolocation.getCurrentPosition(geolocationFound, geolocationError);
	}
}

/**
 * Initialize the map.
 */
function initMap() {

	// initialize some map layers
	var mapquestUrl = "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png",
		mapquestSubDomains = ["otile1","otile2","otile3","otile4"],
		mapquestAttrib = 'Data, imagery and map information provided by '
			+ '<a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>, '
			+ '<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and '
			+ '<a href="http://wiki.openstreetmap.org/wiki/Contributors" target="_blank">contributors</a>. '
			+ 'Data: <a href="http://wiki.openstreetmap.org/wiki/Open_Database_License" target="_blank">ODbL</a>, '
			+ 'Map: <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>',
		mapquest = new L.TileLayer(mapquestUrl, {maxZoom: 19, attribution: mapquestAttrib, subdomains: mapquestSubDomains});

	var standard = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
		});

	var mapnikde = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
		});

	// set initial map center and zoom
	var zoom = 7;
	var lat = 51.58;
	var lon = 10.1;

	// initialize the map
	map = L.map('map', {
		center: new L.LatLng(lat, lon),
		zoom: zoom,
		layers: [mapquest]
	});
	map.attributionControl.setPrefix("");

	// add BeeControl to the map
	beeControl = L.control.beeControl().addTo(map);

	// list all layers to use in the layer control
	var baseMaps = {
		"Mapquest Open": mapquest
		, "OpenStreetMap.de": mapnikde
		, "OpenStreetMap": standard
	};

	// add LayerControl to the map
	var layerControl = L.control.layers(baseMaps, {}, {collapsed: false}).addTo(map);

	// patch layerControl to add titles
	var patch = L.DomUtil.create('div', 'beecontrol-header');
	patch.innerHTML = 'Kartenstil';
	layerControl._form.children[0].parentNode.insertBefore(patch, layerControl._form.children[0]);

	// let BeeControl show an initial marker in the center of the map, asking for geolocation
	beeControl.initMarker(true);
}

