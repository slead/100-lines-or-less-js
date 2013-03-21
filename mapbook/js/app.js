require(["dojo/ready", "dojo/on", "dojo/dom-class", "esri/map", "esri/dijit/Geocoder"],
    function (ready, on, domClass) {

        ready(function () {

            //Start map
            var options = {
                basemap: "streets", //streets | satellite | hybrid | topo | gray | oceans | national-geographic | osm.
                extent: new esri.geometry.Extent({
                    "xmin": -13094934.17795995,
                    "ymin": 3959049.5650010793,
                    "xmax": -12826640.20867888,
                    "ymax": 4053525.7319615935,
                    "spatialReference": { "wkid": 102100 }
                })
            };
            var map = new esri.Map("map", options);

            // Class to represent a bookmark
            function bookmarkEntry(name, extent) {
                this.name = name;
                this.extent = extent;
            }

            // View model for bookmark
            function boomarksModelModel() {

                var bookmarks = JSON.parse(localStorage.getItem("myMapBookmarks"));
                if (!bookmarks) bookmarks = [new bookmarkEntry("Overview", options.extent.toJson())];

                // Editable data
                this.bookmarks = ko.observableArray(bookmarks);

                // stores the value the user enters
                this.current = ko.observable();

                //listen for enter
                this.addBookmarkEnter = function (model, event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        this.addBookmark();
                    }
                    return true;
                };

                //add a new one
                this.addBookmark = function () {
                    this.bookmarks.push(new bookmarkEntry(this.current(), map.extent.toJson()));
                    this.current(''); //clear the current value
                    this.save();
                };

                //zoom to it. set up history
                this.zoomBookmark = function (item) {
                    map.setExtent(new esri.geometry.Extent(item.extent));
                    //Don't want to use #! and can't build urls because no control on back end
                    history.pushState(item.extent, document.title, url + "?" + item.name);
                };

                this.zoomBookmarkbyName = function (name) {
                    var bm = this.bookmarks().filter(function (item) {
                        return (item.name.toLowerCase() === name.toLowerCase());
                    });
                    if (!bm[0]) return;
                    this.zoomBookmark(bm[0]);
                };

                //remove it
                this.remove = function (item) {
                    this.bookmarks.remove(item);
                    this.save();
                };

                this.save = function () {
                    localStorage.setItem("myMapBookmarks", JSON.stringify(this.bookmarks()));
                };

            }

            //Create model and apply the bindings to the UI
            var bmModel = new boomarksModelModel();
            ko.applyBindings(bmModel);

            //Allow bookmarks to work with back/forward buttons
            //event for loading history
            window.addEventListener("popstate", function (evt) {
                if (evt.state) {
                    map.setExtent(new esri.geometry.Extent(evt.state));
                }
            });

            //insert polyfill here / get a better browser! 
            if (!history.pushState) {
                history.pushState = function () { };
                history.replaceState = function () { };
            }

            var url = [location.protocol, '//', location.host, location.pathname].join('');
            
            //don't use dojo.connect anymore. Map object now supports on. Undocumented?
            on(map, "load", function () {
                if (decodeURIComponent(document.location.search.slice(1).split(";")[0])) {
                    //this will cause a slight bug. when you load from a url you will have to hit back twice. This is because it should use replace state here
                    bmModel.zoomBookmarkbyName(decodeURIComponent(document.location.search.slice(1).split(";")[0]));
                } else {
                    history.replaceState(options.extent, document.title, url);     
                }
            });
            
            //add a geocoder because it looks really nice and is useful!
            // create the geocoder
            var geocoder = new esri.dijit.Geocoder({ map: map }, "search"); geocoder.startup();

            //Now lets make it responsive!
            on(dojo.byId('responsiveMenuSearch'), "click", function () {
                domClass.toggle(dojo.byId('search'), 'hide');
            });
            on(dojo.byId('responsiveMenuSearchBookmark'), "click", function () {
                domClass.toggle(dojo.byId('bookmarks'), 'hide');
            });

        });
    })
