require(["dojo/ready", "esri/map"],
    function (ready) {

        ready(function () {
            var options = {
                basemap: "streets", //streets | satellite | hybrid | topo | gray | oceans | national-geographic | osm.
                center: [-79.40, 43.55],
                zoom: 9
            };
            var map = new esri.Map("map", options);

            // Class to represent a bookmark
            function bookmarkEntry(name, extent) {
                var self = this;
                self.name = name;
                self.extent = extent;
            }

            // Overall view model for this screen, along with initial state
            function boomarksModelModel() {
                var self = this;

                var bookmarks = JSON.parse(localStorage.getItem("myMapBookmarks"));
                if (!bookmarks) bookmarks = [new bookmarkEntry("Overview", null)];

                // Editable data
                self.bookmarks = ko.observableArray(bookmarks);

                // stores the value the user enters
                self.current = ko.observable();

                self.addBookmarkEnter = function (model, event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        self.addBookmark();
                    }
                    return true;
                };

                self.addBookmark = function () {
                    self.bookmarks.push(new bookmarkEntry(self.current(), map.extent.toJson()));
                    self.current(''); //clear the current value
                    localStorage.setItem("myMapBookmarks", JSON.stringify(self.bookmarks()));
                };
            }
            ko.applyBindings(new boomarksModelModel());

        });
    })