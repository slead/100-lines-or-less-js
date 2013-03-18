dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.Geocoder");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TooltipDialog");
var map, dialog, selSym, hcs = [{"chartType":"column", "renderTo": "rainfall",
	"labels": {"title": "Monthly rainfall"},
	"flds": ["rainJan","rainFeb","rainMar","rainApr","rainMay","rainJun","rainJul",
		"rainAug","rainSep","rainOct","rainNov","rainDec"],
	"yAxis": {"title": {"text": "Average rainfall (mm)"}},
	"ttip": {"sfx": " mm/month"}
},{"chartType":"line", "renderTo": "minTemp",
	"labels": {"title": "Minimum temperature"},
	"flds": ["minJan","minFeb","minMar","minApr","minMay","minJun","minJul",
		"minAug","minSep","minOct","minNov","minDec"],
	"yAxis": {"title": {"text": "Average min temperature (C)"}},
	"ttip": {"sfx": " deg Celsius"}
},{"chartType":"line", "renderTo": "maxTemp",
	"labels": {"title": "Maximum temperature"},
	"flds": ["maxJan","maxFeb","maxMar","maxApr","maxMay","maxJun","maxJul",
		"maxAug","maxSep","maxOct","maxNov","maxDec"],
	"yAxis": {"title": {"text": "Average max temperature (C)"}},
	"ttip": {"sfx": " deg Celsius"}}];
var base = $("#source a")[0].dataset.baseurl; //base URL is a dataset attribute
function init() {
	map = new esri.Map("map", {center: [133.9, -25.8],zoom: 5,basemap: "gray",
		maxZoom: 10});
	selSym = new esri.symbol.SimpleMarkerSymbol().setStyle(
		esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new dojo.Color([255,255,0,1]));
	var ws = new esri.layers.FeatureLayer(
		"http://54.252.134.128:6080/arcgis/rest/services/climate/WeatherStations/MapServer/0",{
	    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,outFields: ["*"]});
	dojo.connect(map, "onLoad", function() {map.addLayer(ws);});
	dojo.connect(map, "onExtentChange", function() {dijit.popup.close();});
	dojo.connect(ws, "onClick", function(evt) {buildCharts(evt.graphic);});
	dojo.connect(ws, "onMouseOver", function(evt) {map.setMapCursor("pointer");
		dialog.setContent(evt.graphic.attributes["Site_name"]);
		dijit.popup.open({popup: dialog, x:evt.pageX,y:evt.pageY});});
	dojo.connect(ws, "onMouseOut", function(evt) {map.setMapCursor("default");});
	dojo.connect(ws,"onLoad", function() {
	    var query = new esri.tasks.Query(); //prime the charts with a random station
	    query.objectIds = [Math.floor(Math.random()*1417)]; //there are 1418 stations
	    query.outFields = ["*"];
	    ws.queryFeatures(query, function(featureSet) {buildCharts(featureSet.features[0]);});
	    dialog = new dijit.TooltipDialog({id: "tooltipDialog"});
	    dialog.startup();
	});
	var geocoder = new esri.dijit.Geocoder({ map: map,
		arcgisGeocoder: {placeholder: "Find a place", sourceCountry: "AUS"}}, "search");
    geocoder.startup();
}
function buildCharts(graphic) { //build charts from this feature's values
	var name = graphic.attributes["Site_name"];
	if(name.length > 27) {name = name.substring(name, 24) + "...";}
	$("#name").html(name);
	$("#source a").attr("href", base + graphic.attributes["Site"]);
	map.graphics.clear();
	var highlight = new esri.Graphic(graphic.geometry, selSym);
	map.graphics.add(highlight);
	for (var i = 0; i < hcs.length; i++) {
		hc = hcs[i];
	    var attr = graphic.attributes;
	    var series = new Array();
	    var flds = hc.flds;
	    var field = flds[0];
	    var data = new Array();
	    data[0] = attr[field];
	    var numFields = flds.length;
	    for (var x = 1; x < numFields; x++) {data[x] = attr[flds[x]];}
	    series[0] = new Object();
	    series[0].data = data;
	    var chart = new Highcharts.Chart({
	        chart: {renderTo: hc.renderTo,defaultSeriesType: hc.chartType},
	        legend: {enabled: false},title: {text: hc.labels.title},
	        xAxis: [{title: {text: "Month"},
	        	categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
	        }],
	        yAxis: hc.yAxis,
	        tooltip: {formatter: function () {
	        	return this.point.category+": "+this.point.y+hc.ttip.sfx;}},
	        series: series
	    });}
}
function toggleWelcomeDialog() {$("#wd").is(':visible') ? $("#wd").hide() : $("#wd").show();}
dojo.addOnLoad(init);