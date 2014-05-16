/**
 * This file is licensed under Creative Commons Zero (CC0)
 * http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Author: http://www.openstreetmap.org/user/Zartbitter
 */

var map; // global variable named "map" holding the instance created by L.map() is needed by beecontrol

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
	var beeControl = L.control.beeControl({markerimage: '../beemarker.png'}).addTo(map);

	// list all layers to use in the layer control
	var baseMaps = {
		"Mapquest Open": mapquest
		, "OpenStreetMap.de": mapnikde
		, "OpenStreetMap": standard
	};

	// add LayerControl to the map
	var layerControl = L.control.layers(baseMaps, {}, {collapsed: false}).addTo(map);
	// add permalink to the map
	map.addControl(new L.Control.Permalink({layers: layerControl, useAnchor: false, position: 'bottomright'}));

	// patch layerControl to add titles
	var patch = L.DomUtil.create('div', 'beecontrol-header');
	patch.innerHTML = 'Kartenstil';
	layerControl._form.children[0].parentNode.insertBefore(patch, layerControl._form.children[0]);

	// let BeeControl show an initial marker in the center of the map, asking for geolocation
	beeControl.initMarker();
}

