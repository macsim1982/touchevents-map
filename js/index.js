
var useDebounce      = true, // Boolean : activate or desactivate debounce animation
    debounceDistance = 50,    // Max distance of debounce if useDebounce is set to true
    debounceFactor   = 50,    // Force of Debounce distance amplify
    debounceDuration = 1,     // Duration of the debounce if useDebounce is set to true

    gotoViewDuration = 0.8,   // Duration of animation on switch view event
    zoomFactor       = 1,     // This is the default current zoomFactor
    minZoomFactor    = 0,     // minZoomFactor is set dynammically to fill draggable content
    maxZoomFactor    = 2,     // This is the default Max Zoom Level

    previousTouches = [],
    distance = {x: 0, y: 0},
    startView = {x: 2000, y: 1500, w: 1042, h: 604},

    obj = document.getElementById('content'),
    el = document.getElementById("container"),
    zone1 = document.getElementById("zone1");
    next = document.getElementById("next");



startup();

function startup() {
  gotoView(startView, 2, true);
  
  zone1.addEventListener('click', handleClick, false);
  next.addEventListener('click', handleClick, false);

  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchmove", handleMove, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchleave", handleLeave, false);
}
function handleClick(evt) {
  if (evt.target.getAttribute("data-cible")) {
    gotoView(JSON.parse(evt.target.getAttribute("data-cible")), gotoViewDuration);
  }
}
function handleStart(evt) {
  // console.log(evt.type, evt.touches);
  // evt.preventDefault();

  previousTouches.push({touches: evt.touches});
}

function handleMove(evt) {
  evt.preventDefault();

  distance.x -= previousTouches[0].touches[0].pageX - evt.touches[0].pageX;
  distance.y -= previousTouches[0].touches[0].pageY - evt.touches[0].pageY;

  distance = getBoundDistance(distance, useDebounce);
  TweenMax.set(obj, {scale: zoomFactor, x: distance.x, y: distance.y});


  if (previousTouches.length > 1) {
    previousTouches.splice(0, 1);
  }

  previousTouches.push({touches: evt.touches});
  
}

function handleEnd(evt) {
  if (previousTouches.length > 1) {
    evt.preventDefault();

    distance.x -= (previousTouches[0].touches[0].pageX - previousTouches[1].touches[0].pageX) * debounceFactor;
    distance.y -= (previousTouches[0].touches[0].pageY - previousTouches[1].touches[0].pageY) * debounceFactor;

    distance = getBoundDistance(distance, false);
    TweenMax.to(obj, debounceDuration, {scale: zoomFactor, x: distance.x, y: distance.y, ease: Power4.easeOut, overwrite: 1});
  }

  previousTouches = []; // Reset previousTouches
}

function handleCancel(evt) {
}

function handleLeave(evt) {
}

function getZoomFactorFromView(view) {
  return (el.offsetWidth / el.offsetHeight < view.w / view.h) ? (el.offsetWidth / view.w) : (el.offsetHeight / view.h);
}

function getMinZoomFactor() {
  return (obj.offsetWidth / obj.offsetHeight < el.offsetWidth / el.offsetHeight) ? (el.offsetWidth / obj.offsetWidth) : (el.offsetHeight / obj.offsetHeight);
}

function getBoundZoom(zoom) {
  minZoomFactor = getMinZoomFactor();

  return Math.min(maxZoomFactor, Math.max(minZoomFactor, zoom));
}

function getDistanceBetweenTwoPoints(p1, p2) {
  return Math.sqrt( Math.pow( Math.abs( p1.x - p2.x ) , 2 ) + Math.pow( Math.abs( p1.y - p2.y ) , 2 ) );
}

function getDistanceBetweenTwoTouches(touches) {
  return getDistanceBetweenTwoPoints({x: touches[0].pageX, y: touches[0].pageY}, {x: touches[1].pageX, y: touches[1].pageY});
}

function getBoundDistance(distance, useDebounce) {
  var debounceFactor = useDebounce ? debounceDistance : 0;

  distance.x = Math.min(debounceFactor, Math.max(distance.x, el.offsetWidth - (obj.offsetWidth * zoomFactor) - debounceFactor));
  distance.y = Math.min(debounceFactor, Math.max(distance.y, el.offsetHeight - (obj.offsetHeight * zoomFactor) - debounceFactor));

  return distance;
}

function gotoView(view, duration, start) {
  zoomFactor = getBoundZoom(getZoomFactorFromView(view));

  view.x -= ((el.offsetWidth / zoomFactor) - (view.w )) / 2;
  view.y -= ((el.offsetHeight / zoomFactor) - (view.h )) / 2;

  distance = getBoundDistance({x: - view.x * zoomFactor, y: - view.y * zoomFactor}); // Update distance

  if (start) {
    el.style.opacity = 1;
    obj.style.transform = "scale(" + maxZoomFactor + ")";
    obj.style.transformOrigin = "top left";
  }

  TweenMax.to(obj, duration, {scale: zoomFactor, x: distance.x, y: distance.y, ease: Power4.easeinout});
}

// function findIndexById(array, idToFind) {
//   for (var i = 0; i < array.length; i++) {
//     var id = array[i].identifier;
    
//     if (id === idToFind) {
//       return i;
//     }
//   }

//   return -1;    // toucher non trouvé
// }