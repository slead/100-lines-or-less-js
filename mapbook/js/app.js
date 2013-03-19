require(["dojo/ready", "esri/map"],
    function (ready) {

        ready(function () {
            var options = {
                basemap: "streets", //streets | satellite | hybrid | topo | gray | oceans | national-geographic | osm.
                center: [-79.40, 43.55],
                zoom: 9
            };
            var map = new esri.Map("mapDiv", options);

            // Class to represent a bookmark
            function bookmarkEntry(name, extent) {
                var self = this;
                self.name = name;
                self.extent = extent;
            }

            // Overall view model for this screen, along with initial state
            function boomarksModelModel() {
                var self = this;

                // Editable data
                self.bookmarks = ko.observableArray([
                    new bookmarkEntry("Overview", map.extent.toJson())
                ]);

                self.current = ko.observable();
                
                self.addBookmark = function () {
                    self.bookmarks.push(new bookmarkEntry(self.current(), map.extent.toJson()));
                    self.current(''); //clear the current value
                    localStorage.setItem("myMapBookmarks", self.bookmarks());
                    
                };
            }

            ko.applyBindings(new boomarksModelModel());

        });
    })