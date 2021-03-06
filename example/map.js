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
	var standard = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
		});

	var mapnikde = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
		});

	var esriWorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' 
		});

	// set initial map center and zoom
	var zoom = 7;
	var lat = 51.58;
	var lon = 10.1;

	// initialize the map
	map = L.map('map', {
		center: new L.LatLng(lat, lon),
		zoom: zoom,
		layers: [mapnikde]
	});
	map.attributionControl.setPrefix("");

	// add BeeControl to the map
	var beeControl = L.control.beeControl({markerimage: '../beemarker.png'}).addTo(map);

	// list all layers to use in the layer control
	var baseMaps = {
		"OpenStreetMap.de": mapnikde
		, "OpenStreetMap": standard
	//	, "Esri WorldImagery": esriWorldImagery
	};

	// add LayerControl to the map
	var layerControl = L.control.layers(baseMaps, {}, {collapsed: false}).addTo(map);
	// add permalink to the map
	map.addControl(new L.Control.Permalink({layers: layerControl, useAnchor: false, position: 'bottomright', beeControl: beeControl}));
	// add a flattr button
	map.addControl(L.flattrButton({ flattrId: '1171821' }));

	// patch layerControl to add titles
	var patch = L.DomUtil.create('div', 'beecontrol-header');
	patch.innerHTML = 'Kartenstil';
	layerControl._form.children[0].parentNode.insertBefore(patch, layerControl._form.children[0]);

	// let BeeControl show an initial marker in the center of the map, asking for geolocation
	beeControl.initMarker();
}

