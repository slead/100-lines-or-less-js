require(["dojo/ready", "esri/map"],
    function (ready) {

        ready(function () {
            var options = {
                basemap: "streets", //streets | satellite | hybrid | topo | gray | oceans | national-geographic | osm.
                center: [-79.40, 43.55],
                zoom: 9
            };
            var map = new esri.Map("mapDiv", options);
        });
    })