//predefined file-global variables
var reader = new FileReader(); //The FileReader reading the file. Makes sense right?
var keyFile; //The initial variable having stored the not-human-readable file which has been chosen
var elements = []; //Array of the model elements via the parameter "elements" in the original file
var updateLock = true; //TODO improve this
var clickedX; //The X-coordinate of the point where a click has taken place in container3D in order to navigate
var clickedY; //The Y-coordinate of the point where a click has taken place in container3D in order to navigate
var transformRangeX = 20; //The absolute rotation of the x-coordinate
var transformRangeY = -20; //Same as above; Y-coordinate
var transformRangeZ = 0; //Same as above; Z-coordinate
var translateRangeX = 0; //Same as above for the absolute translation of the x-coordinate
var translateRangeY = 0; //Same as above; Y-coordinate
var rotateLockedX; //Adopting the current rotation of the x-coordinate when a click has taken place for the finalized navigation to add it's value to it
var rotateLockedY; // Same as above; Y-coordinate
var translateLockedX; //Same as above for the current translation of the x-coordnate
var translateLockedY; //Same as above; Y-coordinate
//var rangeScale = 50; //Something to do with the scale slider TODO pls improve all of this
var scaleFactor = 25 //The final value needed for updateScale() TODO pls improve all of this
var scaleRange = 1; //One of the hundred variables for the scale-mechanism, this one for the final scale() in updateCube()
/*var quantityScale = ''; //initally used for the same as above - needed??*/
/*var scaleLocked //needed???*/
var SliderLock = false; //Used to terminate the slider function via mouse dragging if the initial function via click has not taken place
var ScaleLock = false; //Same as above for the scale slider. Seems to be a thing with sliders
var navigateButton = -1; //A value adapting to the currently clicked mouse button, used in the navigation-mechanism
var rotateLock = ''; //A String for navigate() to check whether the x-axis should be the only rotate-able axis
var axesChoice = document.querySelector('.axisbutton .currentchoice'); //The current chosen choice at the first multiple-choice, "Axis-Restriction", button

//consts filled with elements which are used in this file
const fileInput = document.getElementById('input_json_model'); //The <input> which processes the file which has been.. well, input
const fileLabel = document.getElementById('json_model_label'); //The label of above, on which the user clicks

const buttonAxes = document.querySelector('.axesvisibility'); //The button which toggles the visibility of the centered axes
const buttonQuantity = document.querySelector('.qualityquantity'); //The button which toggles the 2-Dimensional boundary-aids
const buttonGrid = document.querySelector('.bottomgridvisibility'); //The button which causes inperformance (and toggles the 3D bottom grid-aid)
const buttonOutline = document.querySelector('.outlinebutton'); //The button which causes inperformance but only in combination with many other 3D-elements by anit-aliasing them but only in Firefox wow
const buttonFun = document.querySelector('.funbutton'); //The button which toggles fun

//const rotateSlider = document.querySelector('.slider.rotate'); //The slider which doesn't do anything (but formerly rotated the element)
//const rotateSliderKnob = document.querySelector('.slider.rotate .knob'); //The draggable knob of the slider which doesn't do anything
//const scaleSlider = document.querySelector('.slider.scale'); //The slider which scales the element but not for long anymore
//const scaleSliderKnob = document.querySelector('.slider.scale .knob'); //The knob of the slider which scales the element but not for long anymore

const choiceRestrictAxis = document.querySelector('.axisbutton'); //The button which formerly toggled the X axis. Now it's an axis restriction toggle
const choiceRestrictAxisKnob = document.querySelector('.axisbutton .knob'); //The knob for above
const restrictAxisChoiceNone = document.querySelector('.axisbutton .marker.none'); //The first mark for above - effectively doing nothing
const restrictAxisChoiceX = document.querySelector('.axisbutton .marker.axis.x'); //The second mark for above - limiting to the x axis
const restrictAxisChoiceY = document.querySelector('.axisbutton .marker.axis.y'); //The third mark for above - limiting to the y axis
const restrictAxisChoiceZ = document.querySelector('.axisbutton .marker.axis.z'); //The fourth mark for above - limiting to the z axis

const colorLegend = document.querySelector('.legend_container'); //The container containing the color-legend to the cardinal points of the model - to be enabled once a model has been loaded
const containerError = document.querySelector('.error_banner'); //The error container
const errorInput = document.querySelector('.error_banner .error'); //The container for the actual error message

const containerAxes = document.getElementById('axes_container'); //The container containg all of the centered visual axes
const containerAxesX = document.querySelector('#axes_container .axes_x'); //The container containg the visual X-axis
const containerAxesY = document.querySelector('#axes_container .axes_y'); //Same as above, Y-axis
const containerAxesZ = document.querySelector('#axes_container .axes_z'); //Same as above, Z-axis
const containerBounds = document.querySelector('.boundary_container'); //Container containing all of the 3-Dimensional boundary-aids
const containerBounds2D = document.querySelector('.boundary_container_2d'); //Container containing all of the 2-Dimensional boundary aids
const containerGrid = document.querySelector('.boundary_container .bottom_grid'); //The massively inperformant 3D boundary-aid which is a grid at the bottom
const containerElements = document.querySelector('.elements_container'); //The heart of the whole program. The container where everything takes place
const output3D = document.getElementById('function_2'); //The body containing the heart where every movement takes place
const container3D = document.getElementById('content_function_2'); //the body containg the body containg the heart where every boundary takes place

 //The separate boundary-aid elements, used in the scaling mechanism
  //The separate corners of the rectangle boundary-box
const boundaryCorner1 = document.querySelector('.boundary_container .corners .corner_1');
const boundaryCorner2 = document.querySelector('.boundary_container .corners .corner_2');
const boundaryCorner3 = document.querySelector('.boundary_container .corners .corner_3');
const boundaryCorner4 = document.querySelector('.boundary_container .corners .corner_4');
const boundaryCorner5 = document.querySelector('.boundary_container .corners .corner_5');
const boundaryCorner6 = document.querySelector('.boundary_container .corners .corner_6');
const boundaryCorner7 = document.querySelector('.boundary_container .corners .corner_7');
const boundaryCorner8 = document.querySelector('.boundary_container .corners .corner_8');
  //One boundary corner consists of 3 stripe-elements. Target all stripes stripe-specific in 3 consts
const boundaryStripes1 = document.querySelectorAll('.boundary_container .corners .stripe_1');
const boundaryStripes2 = document.querySelectorAll('.boundary_container .corners .stripe_2');
const boundaryStripes3 = document.querySelectorAll('.boundary_container .corners .stripe_3');
  //One boundary stripe consists of 6 faces. Target all faces face-specific in 6 consts
const boundaryFacesFront = document.querySelectorAll('.boundary_container .corners .front');
const boundaryFacesBehind = document.querySelectorAll('.boundary_container .corners .behind');
const boundaryFacesLeft = document.querySelectorAll('.boundary_container .corners .left');
const boundaryFacesRight = document.querySelectorAll('.boundary_container .corners .right');
const boundaryFacesTop = document.querySelectorAll('.boundary_container .corners .top');
const boundaryFacesBottom = document.querySelectorAll('.boundary_container .corners .bottom');

 //One axis consist of 6 faces. Target all faces face-specific in 6 consts
const axesFacesFront = document.querySelectorAll('#axes_container .front');
const axesFacesBehind = document.querySelectorAll('#axes_container .behind');
const axesFacesLeft = document.querySelectorAll('#axes_container .left');
const axesFacesRight = document.querySelectorAll('#axes_container .right');
const axesFacesTop = document.querySelectorAll('#axes_container .top');
const axesFacesBottom = document.querySelectorAll('#axes_container .bottom');

//Event-listeners which do stuff
fileInput.addEventListener('change', initializeJSON); //The brain of the program
window.addEventListener('mouseup', up); //reset various variables once the mouse has been released
window.addEventListener('mousemove', handleMousemove);  //movingScaleSlider);
//rotateSlider.addEventListener('mousedown', rotateSliderClick);
choiceRestrictAxis.addEventListener('mousedown', restrictAxisClick);
//scaleSlider.addEventListener('mousedown', scaleSliderClick);
container3D.addEventListener('contextmenu', handleContext); //preventing the context menu from showing up in the function's boundaries

//Functions
//Pre-brain. Handles one-time-per-input things after a file input
function initializeJSON() {
  keyFile = fileInput.files[0];
  fileLabel.innerHTML = 'Browse... ► ' + keyFile.name;
  handleJSON();
}

function handleJSON() {
  reader.readAsText(keyFile);
}

//Brain
reader.onload = function(e) {
  //oddly, this whole part executes last
  let fileContent = e.target.result;
  containerElements.innerHTML = '';
  if (fileContent.indexOf('parent') >= 0 && fileContent.indexOf('elements') < 0) {
    errorMessage('Error: missing elements; This model appears to be calling a parent. Parent feature coming soon');
    return;
  }
  if (fileContent.indexOf('parent') < 0 && fileContent.indexOf('elements') < 0) {
    errorMessage('Error: missing recognizable structures; This model appears not to be a valid json model format');
    return;
  }
  try {
    elements = JSON.parse(fileContent).elements;
  }
  catch (err) {
    let error = err.message;
    if (error.indexOf('JSON.parse: ') >= 0) {
      error = error.slice(error.indexOf('JSON.parse: ') + 'JSON.parse: '.length);
    }
    error = 'Error: ' + error;
    if (error.indexOf('expected') >= 0) {
      error = error.slice(0, error.indexOf('expected')) + ' missing' + error.slice(error.indexOf('expected') + 'expected'.length)
    }
    if (error.search(/\bat\b/) >= 0) {
      error = error.slice(0, error.search(/\bat\b/) + 'at'.length) + ' about' + error.slice(error.search(/\bat\b/) + 'at'.length);
    }
    errorMessage(error);
    return;
  }
  containerError.classList.add('nodisplay');
  for (var i = 0; i < elements.length; i++) {
    let height = elements[i].to[1] - elements[i].from[1];
    let width = elements[i].to[0] - elements[i].from[0];
    let depth = elements[i].to[2] - elements[i].from[2];
    let positionX = elements[i].from[0];
    let positionY = elements[i].from[1];
    let positionZ = elements[i].from[2];
    let rotationOriginX;
    let rotationOriginY;
    let rotationOriginZ;
    let rotationAxis;
    let rotationAngle;
    if (elements[i].rotation) {
      rotationOriginX = elements[i].rotation.origin[0];
      rotationOriginY = elements[i].rotation.origin[1];
      rotationOriginZ = elements[i].rotation.origin[2];
      rotationAxis = elements[i].rotation.axis;
      rotationAngle = elements[i].rotation.angle;
    }
    else {
      rotationOriginX = 8;
      rotationOriginY = 8;
      rotationOriginZ = 8;
      rotationAxis = "X";
      rotationAngle = 0;
    }
    //Axes: rotateX(180deg) translateX( + x + ) translateY( + (-)z + ) translateZ( + z + ) rotate + axis + ( + angle + ); whereas 8 = 0, 16 = max/2, 0 = -max/2
    let html = '<div class="element container_3d" id="cube_' + i + '" style="transform: rotate' + rotationAxis +'(' + rotationAngle + 'deg) translateX(' + (16 * scaleFactor - width * scaleFactor - positionX * scaleFactor) + 'px) translateY(' + -positionY * scaleFactor + 'px) translateZ(' + (16 * scaleFactor - depth * scaleFactor - positionZ * scaleFactor) + 'px); transform-origin: ' + (16 * scaleFactor - rotationOriginX * scaleFactor) + 'px ' + -(rotationOriginY * scaleFactor) + 'px ' + (16 * scaleFactor - rotationOriginZ * scaleFactor) + 'px">';
    let orientations = Object.getOwnPropertyNames(elements[i].faces);
    for (var n = 0; n < orientations.length; n++) {
      let basicStyle;
      let color;
      switch (orientations[n]) {
        case 'north':
          basicStyle = 'transform: translateZ(' + depth * scaleFactor + 'px) translateY(' + -height * scaleFactor + 'px); width: ' + width * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          color = 'color_north';
          break;
        case 'south':
          basicStyle = 'transform: translateY(' + -height * scaleFactor + 'px) rotateY(180deg); width: ' + width * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          color = 'color_south';
          break;
        case 'west':
          basicStyle = 'transform: rotateY(90deg) translateY(' + -height * scaleFactor + 'px) translateZ(' + -(depth/2 - width) * scaleFactor + 'px) translateX(' + -depth/2 * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          color = 'color_west';
          break;
        case 'east':
          basicStyle = 'transform: rotateY(90deg) translateY(' + -height * scaleFactor + 'px) translateZ(' + -depth/2 * scaleFactor + 'px) translateX(' + -depth/2 * scaleFactor + 'px) rotateY(180deg); width: ' + depth * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          color = 'color_east';
          break;
        case 'up':
          basicStyle = 'transform: rotateX(90deg) rotateZ(90deg) translateZ(' + (width/2 + height) * scaleFactor + 'px) translateX(' + depth/2 * scaleFactor + 'px) translateY(' + (depth/2 - width/2) * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + width * scaleFactor + 'px;';
          color = 'color_up';
          break;
        case 'down':
          basicStyle = 'transform: rotateX(90deg) rotateZ(90deg) translateZ(' + width/2 * scaleFactor + 'px) translateX(' + depth/2 * scaleFactor + 'px) translateY(' + (depth/2 - width/2) * scaleFactor + 'px) rotateY(180deg); width: ' + depth * scaleFactor + 'px; height: ' + width * scaleFactor + 'px;';
          color = 'color_down';
          break;
      }
      html += '<span class="face ' + orientations[n] + ' ' + color + '" style="'+ basicStyle + '"></span>'
    }
    html += '</div>'
    containerElements.innerHTML += html;
  }
  if (updateLock == true) { //Only refresh when necessary
    refreshCube();
    updateLock = false;
  }
  colorLegend.classList.remove('nodisplay');
}
//Heart
function updateCube() {
  output3D.style.transform = 'scale(' + scaleRange + ') translateX(' + translateRangeX + 'px) translateY(' + translateRangeY + 'px) rotateX(' + transformRangeY + 'deg) rotateY(' + transformRangeX + 'deg) rotateZ(' + transformRangeZ + 'deg)';
  //rotateSliderKnob.style.transform = 'translateX(' + range + 'px)';
}

//Beautification of the whole thing - Refreshes the element in order for toggled elements to show (Bug in various browsers)
function refreshCube() {
  scaleRange += .00001;
  updateCube();
  scaleRange -= .00001;
}


//Coordination of every mouse procedures
 //Termination of various function-global variables and procedures
function up() {
  SliderLock = false;
  ScaleLock = false;
  navigateButton = -1;
  document.body.classList.remove('noselect');
}

//display an error when one exists [-> getJSON()]
function errorMessage(error) {
  errorInput.innerHTML = error;
  containerError.classList.remove('nodisplay');
  updateLock = true;
}

//prevent context menu of showing up in the 3D-container for the purpose of mouse movement
function handleContext(e) {
  e.preventDefault();
}

function handleMousemove(e) {
// navigate()
  if (navigateButton >= 0) {
    let container3DRect = container3D.getBoundingClientRect();
    let distanceX = e.x - container3DRect.left - clickedX;
    let distanceY = e.y - container3DRect.top - clickedY;
    if (navigateButton == 0) {
      //Navigation methods set by the multiple-choice "Axis-restriction" button. Please don't use Z
      if (rotateLock == 'x') {
        transformRangeX = (distanceX / 3.4) + rotateLockedX;
      }
      else if (rotateLock == 'y') {
        transformRangeY = -(distanceY / 3.2) + rotateLockedY;
      }
      else if (rotateLock == 'z') {
        transformRangeZ = ((distanceX + -distanceY) / 3);
      }
      else {
        transformRangeX = (distanceX / 3.6) + rotateLockedX;
        transformRangeY = -(distanceY / 4.6) + rotateLockedY;
      }
    }
  /*  if (navigateButton == 1) {
      scaleRange = distanceX / 100 + 1;
    }*/
    if (navigateButton == 2) {
      if (buttonFun.classList.contains('active')) {
        translateRangeX += distanceX;
        translateRangeY += distanceY;
      }
      else {
        translateRangeX = distanceX / scaleRange + translateLockedX;
        translateRangeY = distanceY / scaleRange + translateLockedY;
      }
    }
    updateCube();
  }
//movingScaleSlider()
/*  else if (ScaleLock == true) {
    let currentScale = scaleFactor
    let scaleRect = scaleSlider.getBoundingClientRect();
    rangeScale = e.x - scaleRect.left - 12;
    if (rangeScale < 0) {
      rangeScale = 0;
    }
    else if (rangeScale > 100) {
      rangeScale = 100;
    }
    scaleSliderKnob.style.transform = 'translateX(' + rangeScale + 'px)';
    scaleFactor = ((rangeScale + 10) / 3).toFixed(3);
    quantityScale = 'scale(' + scaleFactor / currentScale + ')';
    //setTimeout(timeoutScale, 1000);
    updateScale();
  }*/
}

// navigation and territorial modification of the model via mouse buttons
 //initialization of mouse movement via click
function navigateMouseDown(e) {
  document.body.classList.add('noselect');
  let container3DRect = container3D.getBoundingClientRect();
  navigateButton = e.button;
  clickedX = e.x - container3DRect.left;
  clickedY = e.y - container3DRect.top;
  rotateLockedX = transformRangeX;
  rotateLockedY = transformRangeY;
  translateLockedX = translateRangeX;
  translateLockedY = translateRangeY;
}

 //zooming of the model via the scroll wheel
function navigateWheel(e) {
  //if either no scroll to the top or bottom has taken place or the ctrl-key is held (which would overlap with the browser-side page zoom), do nothing
  if (e.deltaY == 0 || e.ctrlKey == true) {
    return;
  }
  let scrollY = e.deltaY;
  if (scrollY > 1) {
    scaleRange -= 0.085;
  }
  else if (scrollY < 1) {
    scaleRange += 0.085;
  }
  if (scaleRange <= 0.1) {
    scaleRange = 0.1;
  }
  updateCube();
}
 //Applying the costy updateScale() function when the zooming-procedure has been finalized (via a drag-method)
/*function navigateMouseUp() {
  if (navigateButton == 1) {
    scaleFactor = scaleRange;
    updateScale();
  }
}*/

//various buttons
 //Toggle 2-Dimensional boundary aids as the 3D ones are costy
function toggleQuantity() {
  buttonQuantity.classList.toggle('active');
  containerBounds.classList.toggle('nodisplay');
  containerBounds2D.classList.toggle('nodisplay');
  containerAxes.classList.toggle('nodisplay');
}
 //Toggle the 3-Dimensional extremely costy grid-aid at the bottom of the element's space - TODO: remove? Default 2D
function toggleGrid() {
  buttonGrid.classList.toggle('active');
  containerGrid.classList.toggle('nodisplay');
}
 //Toggle anti-aliasing of 3D-objects in Firefox
function toggleOutline() {
  buttonOutline.classList.toggle('active');
}
 //Toggle extremely funny fun-mode haha
function toggleFun() {
  buttonFun.classList.toggle('active');
}
 //Toggle the visibility of the (3-Dimensional) axes centered at the element's space
function toggleAxes() {
  buttonAxes.classList.toggle('active');
  containerAxes.classList.toggle('nodisplay');
}
 //Functions of the first multiple-choice "Axis_Restriction" button
  //First choice which resets to default -> effectively does nothing
function choiceAxisNothing() {
  rotateLock = '';
}
  //Second choice which limits the rotation to the X-Axis
function choiceAxisX() {
  rotateLock = 'x';
}
  //Third choice which limits the rotation to the Y-Axis
function choiceAxisY() {
  rotateLock = 'y';
}
  //Fourth choice which limits the rotation to the Z-Axis
function choiceAxisZ() {
  rotateLock = 'z';
}


//Fomerly various sliders, now various initiating click events as the mousemove executions have been assembled into one event
 //Execution of the multiple-choice axis restriction procedure
function restrictAxisClick(e) {
  document.body.classList.add('noselect');
  let mark;
  if (e.target.classList.contains('currentchoice') || e.target.classList.contains('knob')) {
    return;
  }
  else if (e.target.classList.contains('marker')) {
    mark = e.target.children[0];
  }
  else {
    mark = e.target;
  }
  choiceRestrictAxisKnob.style.transform = 'translateX(' + (mark.offsetLeft - 14 - (choiceRestrictAxisKnob.offsetWidth - mark.offsetWidth) / 2) + 'px)';
  axesChoice.classList.remove('currentchoice');
  axesChoice = mark;
  axesChoice.classList.add('currentchoice');
  switch (axesChoice.parentNode) {
    case restrictAxisChoiceNone:
      choiceAxisNothing();
      break;
    case restrictAxisChoiceX:
      choiceAxisX();
      break;
    case restrictAxisChoiceY:
      choiceAxisY();
      break;
    case restrictAxisChoiceZ:
      choiceAxisZ();
      break;
  }
}
 //The first of it's kind - a slider to rotate the element, pretty much deprecated as well - TODO: What to make out of this?
 //TODO: fine-tuning!
  //Both initialization of mouse dragging and standalone execution of the rotation procedure
/*function rotateSliderClick(e) {
  let rotateRect = rotateSlider.getBoundingClientRect();
  document.body.classList.add('noselect');
  SliderLock = true;
  range = e.x - rotateRect.left - 12;
  if (range < 0) {
    range = 0;
  }
  else if (range > 360) {
    range = 360;
  }
  updateCube();
}*/
  //The execution of the rotating procedure via mouse dragging after the mouse has initialized it by clicking
/*function movingRotateSlider(e) {
  if (SliderLock == false) {
    return;
  }
  let rotateRect = rotateSlider.getBoundingClientRect();
  range = e.x - rotateRect.left - 12;
  if (range < 0) {
    range = 0;
  }
  else if (range > 360) {
    range = 360;
  }
  updateCube();
}*/
 //A slider to scale the element - will most likely be replaced by a mouse navigation
  //Both initialization of mouse dragging and standalone execution of the scale procedure
/*function scaleSliderClick(e) {
  document.body.classList.add('noselect');
  ScaleLock = true;
  let currentScale = scaleFactor
  let scaleRect = scaleSlider.getBoundingClientRect();
  rangeScale = e.x - scaleRect.left - 12;
  if (rangeScale < 0) {
    rangeScale = 0;
  }
  else if (rangeScale > 100) {
    rangeScale = 100;
  }
  scaleSliderKnob.style.transform = 'translateX(' + rangeScale + 'px)';
  scaleFactor = ((rangeScale + 10) / 3).toFixed(3);
  scaleRange = scaleFactor / currentScale;
  updateScale();
  //setTimeout(timeoutScale, 1000);
}*/

//~A very costy~ An extremely massively vehemently resource intensive way of resizing the element which is unfortunately necessary for good visuals
function updateScale() {
  let boundaryScale = scaleFactor * 8;
  let stripesScale = scaleFactor * 2;
  let stripesWidth = stripesScale * 2;
  let axesScale = scaleFactor * 7;
  let axesWidth = axesScale * 2;

  containerElements.style.transform = 'translateX(' + -boundaryScale + 'px) translateZ(' + -boundaryScale + 'px) translateY(' + boundaryScale + 'px)';

  if (buttonQuantity.classList.contains('active')) {
    boundaryCorner1.style.transform = 'translateX(' + -boundaryScale + 'px) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateX(90deg)';
    boundaryCorner2.style.transform = 'rotateX(180deg) translateX(' + -boundaryScale + 'px) rotateY(180deg) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateY(180deg)';
    boundaryCorner3.style.transform = 'rotateZ(180deg) translateX(' + -boundaryScale + 'px) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateX(90deg)';
    boundaryCorner4.style.transform = 'rotateY(180deg) translateX(' + -boundaryScale + 'px) rotateY(180deg) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateY(180deg)';
    boundaryCorner5.style.transform = ' rotateX(180deg) translateX(' + -boundaryScale + 'px) rotateZ(180deg) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateY(180deg)';
    boundaryCorner6.style.transform = 'translateX(' + -boundaryScale + 'px) rotateX(180deg) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateX(90deg)';
    boundaryCorner7.style.transform = 'rotateZ(180deg) translateX(' + -boundaryScale + 'px) rotateY(180deg) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateY(180deg)';
    boundaryCorner8.style.transform = 'rotateZ(180deg) translateX(' + -boundaryScale + 'px) rotateX(180deg) translateY(' + boundaryScale + 'px) translateZ(' + boundaryScale + 'px) rotateX(90deg)';

    for (var i = 0; i < boundaryStripes1.length; i++) {
      boundaryStripes1[i].style.transform = 'translateZ(' + stripesScale + 'px)';
      boundaryStripes2[i].style.transform = 'rotateX(90deg) translateZ(' + stripesScale + 'px)';
      boundaryStripes3[i].style.transform = 'rotateY(90deg) translateZ(' + stripesScale + 'px)';
    }

    for (var i = 0; i < boundaryFacesFront.length; i++) {
      boundaryFacesFront[i].style.transform = 'rotateZ(180deg) translateZ(' + stripesScale + 'px) translateX(1px) translateY(1px)';
      boundaryFacesBehind[i].style.transform = 'rotateX(180deg) rotateZ(90deg) translateZ(' + stripesScale + 'px) translateX(1px) translateY(1px)';
      boundaryFacesLeft[i].style.transform = 'rotateY(90deg) translateY(-1px) translateZ(' + -stripesScale + 'px) rotateX(180deg) translateZ(1px)';
      boundaryFacesRight[i].style.transform = 'rotateY(90deg) translateY(-1px) translateZ(' + -(stripesScale - 1) + 'px)';
      boundaryFacesTop[i].style.transform = 'rotateX(90deg) rotateZ(90deg) translateZ(2px) translateY(' + stripesScale + 'px)';
      boundaryFacesBottom[i].style.transform = 'rotateX(90deg) rotateZ(90deg) translateZ(1px) rotateY(180deg) translateZ(1px) translateY(' + stripesScale + 'px)';
      boundaryFacesLeft[i].style.width = stripesWidth + 'px';
      boundaryFacesRight[i].style.width = stripesWidth + 'px';
      boundaryFacesTop[i].style.width = stripesWidth + 'px';
      boundaryFacesBottom[i].style.width = stripesWidth + 'px';
    }

    for (var i = 0; i < axesFacesFront.length; i++) {
      axesFacesFront[i].style.transform = 'rotateZ(180deg) translateZ(' + axesScale + 'px) translateX(1px) translateY(1px)';
      axesFacesBehind[i].style.transform = 'rotateX(180deg) rotateZ(90deg) translateZ(' + axesScale + 'px) translateX(1px) translateY(1px)';
      axesFacesLeft[i].style.transform = 'rotateY(90deg) translateY(-1px) translateZ(' + -axesScale + 'px) rotateX(180deg) translateZ(1px)';
      axesFacesRight[i].style.transform = 'rotateY(90deg) translateY(-1px) translateZ(' + -(axesScale - 1) + 'px)';
      axesFacesTop[i].style.transform = 'rotateX(90deg) rotateZ(90deg) translateZ(2px) translateY(' + axesScale + 'px)';
      axesFacesBottom[i].style.transform = 'rotateX(90deg) rotateZ(90deg) translateZ(1px) rotateY(180deg) translateZ(1px) translateY(' + axesScale + 'px)';
      axesFacesLeft[i].style.width = axesWidth + 'px';
      axesFacesRight[i].style.width = axesWidth + 'px';
      axesFacesTop[i].style.width = axesWidth + 'px';
      axesFacesBottom[i].style.width = axesWidth + 'px';
    }
  }

  if (containerElements.innerHTML != '') {
    containerElements.innerHTML = '';
    for (var i = 0; i < elements.length; i++) {
      let height = elements[i].to[1] - elements[i].from[1];
      let width = elements[i].to[0] - elements[i].from[0];
      let depth = elements[i].to[2] - elements[i].from[2];
      let positionX = elements[i].from[0];
      let positionY = elements[i].from[1];
      let positionZ = elements[i].from[2];
      let html = '<div class="element container_3d" id="cube_' + i + '" style="transform: translateX(' + positionX * scaleFactor + 'px) translateY(' + -positionY * scaleFactor + 'px) translateZ(' + positionZ * scaleFactor + 'px)">';
      let orientations = Object.getOwnPropertyNames(elements[i].faces);
      for (var n = 0; n < orientations.length; n++) {
        let basicStyle;
        let color;
        switch (orientations[n]) {
          case 'north':
              basicStyle = 'transform: translateZ(' + depth * scaleFactor + 'px) translateY(' + -height * scaleFactor + 'px); width: ' + width * scaleFactor + 'px; height: ' + height * scaleFactor + 'px; background-color: #A84E4E;';
              color = 'color_north';
            break;
          case 'south':
              basicStyle = 'transform: translateY(' + -height * scaleFactor + 'px); width: ' + width * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
              color = 'color_south';
            break;
          case 'east':
            basicStyle = 'transform: rotateY(90deg) translateY(' + -height * scaleFactor + 'px) translateZ(' + -(depth/2 - width) * scaleFactor + 'px) translateX(' + -depth/2 * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
            color = 'color_east';
            break;
          case 'west':
              basicStyle = 'transform: rotateY(90deg) translateY(' + -height * scaleFactor + 'px) translateZ(' + -depth/2 * scaleFactor + 'px) translateX(' + -depth/2 * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
              color = 'color_west';
            break;
          case 'up':
              basicStyle = 'transform: rotateX(90deg) rotateZ(90deg) translateZ(' + (width/2 + height) * scaleFactor + 'px) translateX(' + depth/2 * scaleFactor + 'px) translateY(' + (depth/2 - width/2) * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + width * scaleFactor + 'px;';
              color = 'color_up';
            break;
          case 'down':
              basicStyle = 'transform: rotateX(90deg) rotateZ(90deg) translateZ(' + width/2 * scaleFactor + 'px) translateX(' + depth/2 * scaleFactor + 'px) translateY(' + (depth/2 - width/2) * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + width * scaleFactor + 'px;';
              color = 'color_down';
            break;
        }
        html += '<span class="face ' + orientations[n] + ' ' + color + '" style="'+ basicStyle + '"></span>'
      }
      html += '</div>'
      containerElements.innerHTML += html;
    }
  }
}
