require(["dojo/ready", "esri/map"],
    function (ready) {

        ready(function () {
            
            var options = {
                basemap: "streets", //streets | satellite | hybrid | topo | gray | oceans | national-geographic | osm.
                extent: new esri.geometry.Extent({ 
                    "xmin": -13094934.17795995,
                    "ymin": 3959049.5650010793,
                    "xmax": -12826640.20867888,
                    "ymax": 4053525.7319615935, 
                    "spatialReference": { "wkid": 102100} })
            };
            
            var map = new esri.Map("map", options);

            // Class to represent a bookmark
            function bookmarkEntry(name, extent) {
                var self = this;
                self.name = name;
                self.extent = extent;
            }

            // View model for bookmark
            function boomarksModelModel() {
                var self = this;

                var bookmarks = JSON.parse(localStorage.getItem("myMapBookmarks"));
                if (!bookmarks) bookmarks = [new bookmarkEntry("Overview", options.extent.toJson())];

                // Editable data
                self.bookmarks = ko.observableArray(bookmarks);

                // stores the value the user enters
                self.current = ko.observable();

                //listen for enter
                self.addBookmarkEnter = function (model, event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        self.addBookmark();
                    }
                    return true;
                };

                //add a new one
                self.addBookmark = function () {
                    self.bookmarks.push(new bookmarkEntry(self.current(), map.extent.toJson()));
                    self.current(''); //clear the current value
                    localStorage.setItem("myMapBookmarks", JSON.stringify(self.bookmarks()));
                };

                //zoom to it
                self.zoomBookmark = function (item) {
                    map.setExtent(new esri.geometry.Extent(item.extent));
                };

            }
            
            ko.applyBindings(new boomarksModelModel());

        });
    })