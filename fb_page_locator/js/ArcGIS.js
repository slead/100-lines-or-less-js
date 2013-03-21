dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.Geocoder");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TooltipDialog");
dojo.require("esri.layers.osm");

var map;

function init() {
  map = new esri.Map("map", {center: [-96.986, 37.238],zoom: 15});
  osmLayer = new esri.layers.OpenStreetMapLayer();
  map.addLayer(osmLayer);
  autoResize(map)
}

function autoResize(map) {
	dojo.connect(map, 'onLoad', function (map) {
		dojo.connect(window, 'resize', map, map.resize);
	});
	dojo.connect(map, 'onResize',  function(extent, width, height) { 
		map.__resizeCenter = map.extent.getCenter();
		setTimeout(function() {
			map.centerAt(map.__resizeCenter);
		}, 200);
	});
}

dojo.addOnLoad(init)