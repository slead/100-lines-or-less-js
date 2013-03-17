dojo.require("esri.map");
var map, canvas, btnC, cdot, leapOutput, prevGesture, lastX, lastY, 
  pauseGestureProcessing=false, controllerOptions={enableGestures: true},
  calib={left:-60, top:300, right:60, bottom:100}, isZooming=false, 
  calibTimeout = 2250, showPointables=true, msgTimeout;
dojo.ready(function (){
  map = new esri.Map("mapDiv", { center: [-84, 32], zoom: 5, basemap: "gray" });
  dojo.connect(map, "onZoomStart", zoomStartHandler);
  dojo.connect(map, "onZoomEnd", zoomEndHandler);
  canvas = document.getElementById("canvasLayer");
  canvas.setAttribute("width", window.innerWidth);
  canvas.setAttribute("height", window.innerHeight);
  btnC = document.getElementById("btnCalibrate");
  btnC.onclick = calibrateScreen;
  cdot = document.getElementById("cdot");
  leapOutput = document.getElementById("leapOutput");
});
function zoomStartHandler(extent, zoomFactor, anchor, level){
  isZooming = true;
  canvas.setAttribute("style", "display:none");
}
function zoomEndHandler(extent, zoomFactor, anchor, level){
  isZooming = false;
  canvas.setAttribute("style", "display:block");
}
function calibrateScreen() {
  alert("Point at the calibration dots:\n1. Top left\n2. Bottom right");
  showPointables = false;
  calib = {left:9999, top:-9999, right:-9999, bottom:9999};
  tempPauseGestures(calibTimeout*2/1000);
  calibrateDot(1);
  setTimeout (function(){calibrateDot(2);}, calibTimeout);
  setTimeout (function(){
      showPointables=true;
      cdot.setAttribute("class","");
  }, calibTimeout*2);
}
function calibrateDot(count) {
  cdot.setAttribute("class","cdot_pos" + count);
  setTimeout (function(){
    calib.left = Math.min(calib.left, lastX);
    calib.right = Math.max(calib.right, lastX);
    calib.bottom = Math.min(calib.bottom, lastY);
    calib.top = Math.max(calib.top, lastY);
  }, calibTimeout-500);
}
function drawCircle(x, y, radius, color, alpha) {
  var context = canvas.getContext('2d');
  context.globalAlpha = alpha;
  context.beginPath();
  context.arc(x, y, radius, 0, 2*Math.PI, false);
  context.fillStyle = color;
  context.fill();
}
function toScreen(px, py) {
  return {x:map.width*(px-calib.left)/(calib.right-calib.left),
    y:map.height-map.height*(py-calib.bottom)/(calib.top-calib.bottom)};
}
function drawPointable(p) {
  var cp = toScreen(p.tipPosition[0], p.tipPosition[1]);
  drawCircle(cp.x, cp.y,10, '#f00', .5);
}
Leap.loop(controllerOptions, function(frame) {
  if (frame.pointables.length > 0) {
    lastX = frame.pointables[0].tipPosition[0];
    lastY = frame.pointables[0].tipPosition[1];
    if(showPointables) {
      canvas.setAttribute("style", "display:block");
      canvas.getContext("2d").clearRect(0, 0, map.width, map.height);
      for (var i = 0; i < frame.pointables.length; i++) {
        drawPointable(frame.pointables[i]);
      }
    }
  } else {
    canvas.setAttribute("style", "display:none");
  }
  if (frame.gestures !== undefined && frame.gestures.length > 0) {
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i], type = gesture.type;
      if(prevGesture !== undefined && prevGesture.id === gesture.id) break;
      prevGesture = gesture;
      if(pauseGestureProcessing || isZooming) continue;
      if(type == "circle") {
        handleCircle(gesture);
      } else if (type == "swipe") {
        handleSwipe(frame, gesture);
      } else if (type == "screenTap" || type == "keyTap" ) {
        handleTap(gesture);
      }
    }
  }
});
function handleCircle(gest) {
  if(gest.radius < 5) return;
  var r = gest.radius, c = gest.center;
  var tl = map.toMap(toScreen(c[0]-r, c[1]+r));
  var br = map.toMap(toScreen(c[0]+r, c[1]-r));
  map.setExtent(new esri.geometry.Extent(tl.x, br.y, br.x, tl.y, map.spatialReference));
  outputGestureMessage("...zooming to extent...");
}
function handleSwipe(frame, gesture) {
  var startPos = gesture.startPosition;
  if(frame.fingers.length <= 2) {
    outputGestureMessage("...panning...");
    map.centerAt(map.toMap(toScreen(startPos[0], startPos[1])));
  } else {
    var zoomLevels = frame.fingers.length - 2
    map.setLevel(map.getLevel() - zoomLevels);
    outputGestureMessage("...zooming out (" + zoomLevels + " levels)...");
  }
}
function handleTap(gesture) {
  map.centerAt(map.toMap(toScreen(gesture.position[0], gesture.position[1])));
  outputGestureMessage("...centering map...");
}
function outputGestureMessage(msg) {
  tempPauseGestures(1.5);
  leapOutput.innerHTML = msg;
  if(msgTimeout !== undefined) clearTimeout(msgTimeout);
  msgTimeout = setTimeout(function(){leapOutput.innerHTML = "&nbsp;"}, 3000);
}
function tempPauseGestures(seconds) {
  pauseGestureProcessing = true;
  setTimeout(function(){pauseGestureProcessing = false;}, seconds * 1000);
}