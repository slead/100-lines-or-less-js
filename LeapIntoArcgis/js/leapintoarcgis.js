dojo.require("esri.map");
var map, canvas, previousGesture, controllerOptions = {enableGestures: true};
function init(){
  map = new esri.Map("mapDiv", {
    center: [-84, 32],
    zoom: 5,
    basemap: "gray"
  });
  canvas = document.createElement("canvas");
  canvas.setAttribute("width", window.innerWidth);
  canvas.setAttribute("height", window.innerHeight);
  canvas.setAttribute("style", "position: absolute; x:0; y:0;");
  document.body.appendChild(canvas);
}
dojo.ready(init);

Leap.loop(controllerOptions, function(frame) {
  
  if (frame.pointables.length > 0) {
    var ctx = canvas.getContext("2d");
    for (var i = 0; i < frame.pointables.length; i++) {
      var p = frame.pointables[i];
      ctx.fillRect(p.tipPosition[0],p.tipPosition[1],10,10);
    }
  }
  
  if (frame.gestures !== undefined && frame.gestures.length > 0) {
  
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i];
      if(previousGesture !== undefined && previousGesture.id === gesture.id)
        break;
        
      switch (gesture.type) {
        case "circle":
          handleCircle(gesture);
          break;
        case "swipe":
          handleSwipe(gesture);
          break;
        case "screenTap":
        case "keyTap":
          handleTap(gesture);
          break;
      }
      previousGesture = gesture;
    }
  }
});

function handleCircle(gesture) {
    map.setLevel(map.getLevel() - 1);
    tempPauseGestures();
    outputLeapMessage("...zooming out...");
}
function handleSwipe(gesture) {
    outputLeapMessage("...swipe detected...");
}
function handleTap(gesture) {
    map.setLevel(map.getLevel() + 1);
    tempPauseGestures();
    outputLeapMessage("...zooming in...");
}

function tempPauseGestures() {
  controllerOptions.enableGestures = false;
  setTimeout(unpauseGestures, 1000);
}
function unpauseGestures(msg) {
  controllerOptions.enableGestures = true;
}
function outputLeapMessage(msg) {
  var leapOutput = document.getElementById("leapOutput");
  leapOutput.innerHTML = msg;
  setTimeout(function(){leapOutput.innerHTML = ""}, 1000);
}