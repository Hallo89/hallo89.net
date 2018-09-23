//predefined file-global variables
var reader = new FileReader(); //The FileReader reading the file. Makes sense right?
var keyFile; //The initial variable having stored the not-human-readable file which has been chosen
var keyImages; //The initial variable having stored the not-human-readable images which have been chosen
var elements = []; //Array-Object of the model elements via the parameter "elements" in the original file
var textures = {}; //Object of the texture files expressed in their path via the parameter "textures" in the original file without anything before the '/'
var images = {};
var updateLock = true; //A lock stating whether the model has to be reloaded
var initialLock = true; //A lock for preventing the initial codeMirror load from calling buildJSON() again
var firstInputsWidth; //The total length of all items of the first input_container + compact_container
var secondInputsWidth = 370; //The total length of all items inside the second input_container; static due to knowing the beginning width
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
var scaleRange = 1; //One of the hundred variables for the scale-mechanism, this one is the ultra absolute scale the final scale() in updateCube()
//var quantityScale = ''; //initally used for the same as above - needed??
//var scaleLocked //needed???
//var SliderLock = false; //Used to terminate the slider function via mouse dragging if the initial function via click has not taken place
//var ScaleLock = false; //Same as above for the scale slider. Seems to be a thing with sliders
var resizeCodeLock = false;
var resizeOverflowLock = false;
var resizeCodeClicked;
var resizeButtonLock = {
  'code': null,
  'exe': null
};
var codeSizeLocked;
var prePopoutScale;
var navigateButton = -1; //A value adapting to the currently clicked mouse button, used in the navigation-mechanism
var rotateLock = ''; //A String for navigate() to check whether the x-axis should be the only rotate-able axis
/* var axesChoice = document.querySelector('.axischoice .currentchoice'); //The current chosen choice at the first multiple-choice, "Axis-Restriction", button */
var codeChangeInterval;
var codeChangeLock = true;


//consts filled with elements which are used in this file
const thisBox = document.querySelector('.box');

const thisHeader = document.querySelector('.box_header');

const fileInput = document.getElementById('input_json_model'); //The <input> which processes the file which has been.. well, input
const fileLabel = document.getElementById('json_model_label'); //The label of above, on which the user clicks

const imageInput = document.getElementById('input_images'); //The <input> which processes the images which have been input
const imageLabel = document.getElementById('images_label'); //The label of above, on which the user clicks

const buttonAxes = document.querySelector('.axesvisibility'); //The button which toggles the visibility of the centered axes
const buttonQuantity = document.querySelector('.qualityquantity'); //The button which toggles the 2-Dimensional boundary-aids
const buttonGrid = document.querySelector('.bottomgridvisibility'); //The button which causes inperformance (and toggles the 3D bottom grid-aid)
//const buttonOutline = document.querySelector('.outlinebutton'); //The button which yet doesn't do anything
const buttonFun = document.querySelector('.funbutton'); //The button which toggles fun
const buttonRestoreCode = document.querySelector('.floating_button.restore_code'); //The button which magically reverts the split windows' position to its pre-magic-button-pressed state
const buttonRestoreExecute = document.querySelector('.floating_button.restore_execute'); //Same as above but even more magically (same amount of magic) with an even more magic element (other window)
const buttonExpandCode = document.querySelector('.floating_button.expand_code'); //The button which magically expands the code area to its full extent but without magic
const buttonExpandExecute = document.querySelector('.floating_button.expand_execute'); //The button which executes a full resize of execute beep boop

//const rotateSlider = document.querySelector('.slider.rotate'); //The slider which doesn't do anything (but formerly rotated the element)
//const rotateSliderKnob = document.querySelector('.slider.rotate .knob'); //The draggable knob of the slider which doesn't do anything
//const scaleSlider = document.querySelector('.slider.scale'); //The slider which scales the element but not for long anymore
//const scaleSliderKnob = document.querySelector('.slider.scale .knob'); //The knob of the slider which scales the element but not for long anymore

const choiceButtons = document.querySelectorAll('.multiple .input'); //All multiple-choice buttons, an event listener to be applied

const restrictAxisChoiceNone = document.querySelector('.axischoice .marker.none'); //The first mark for the axis restriction choice - effectively doing nothing
const restrictAxisChoiceX = document.querySelector('.axischoice .marker.axis.x'); //The second mark for the axis restriction choice - limiting to the x axis
const restrictAxisChoiceY = document.querySelector('.axischoice .marker.axis.y'); //The third mark for the axis restriction choice - limiting to the y axis
const restrictAxisChoiceZ = document.querySelector('.axischoice .marker.axis.z'); //The fourth mark for the axis restriction choice - limiting to the z axis

const popoutChoiceBox = document.getElementById('popoutchoice_box'); //The input_box of the multiple-choice popout mode button
const popoutModeChoiceNone = document.querySelector('.popoutchoice .marker.default'); //The first mark for the popout mode choice - the default style
const popoutModeChoiceOpaque = document.querySelector('.popoutchoice .marker.opaque'); //The second mark for the popout mode choice - making the popout fully opaque
const popoutModeChoiceCollapsed = document.querySelector('.popoutchoice .marker.collapsed'); //The third mark for the choice - collapsing the popout
const popoutModeChoiceGone = document.querySelector('.popoutchoice .marker.disabled'); //The fourth mark for the popout mode choice - disabling the popout

const codeResizer = document.querySelector('.code_container .resize_bar'); //the (invisible) bar to resize the code area

const colorLegend = document.querySelector('.legend_container'); //The container containing the color-legend to the cardinal points of the model - to be enabled once a model has been loaded
const containerError = document.querySelector('.error_banner'); //The error container
const errorInput = document.querySelector('.error_banner .error'); //The container for the actual error message

const containerCode = document.querySelector('.code_container'); //The very well distinguishable container of a textarea which is not a textarea yet it is
const containerExecute = document.querySelector('.execute_container'); //The other very well distinguishable container of an inperformant model which is the reason why this const is here I should write less into comments lol
const containersInputExecute = document.querySelectorAll('.execute_container .input_container:not(.compactor)');
const containerInputCode = document.querySelector('.code_container .input_container');
const containerCompact = document.querySelector('.compact_container'); //The container inside the first input_container containing both header and utility buttons
const containerAxes = document.getElementById('axes_container'); //The container containg all of the centered visual axes
const containerAxesX = document.querySelector('#axes_container .axes_x'); //The container containg the visual X-axis
const containerAxesY = document.querySelector('#axes_container .axes_y'); //Same as above, Y-axis
const containerAxesZ = document.querySelector('#axes_container .axes_z'); //Same as above, Z-axis
const containerBounds = document.querySelector('.boundary_container'); //Container containing all of the 3-Dimensional boundary-aids
const containerBounds2D = document.querySelector('.boundary_container_2d'); //Container containing all of the 2-Dimensional boundary aids
const containerGrid = document.querySelector('.boundary_container .bottom_grid'); //The massively inperformant 3D boundary-aid which is a grid at the bottom
const containerElements = document.querySelector('.elements_container'); //The heart of the whole program. The container where everything takes place
const output3D = document.getElementById('output'); //The body containing the heart where every movement takes place
const container3D = document.getElementById('output_container'); //the body containg the body containg the heart where every boundary takes place

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
imageInput.addEventListener('change', handleImages); //Applying textures
window.addEventListener('mouseup', up); //reset various variables once the mouse has been released
window.addEventListener('mousemove', handleMousemove);
codeResizer.addEventListener('mousedown', resizeCodeClick);
for (i = 0; i < choiceButtons.length; i++) {
  choiceButtons[i].addEventListener('mousedown', choiceButtonsClick);
}
container3D.addEventListener('contextmenu', handleContext); //preventing the context menu from showing up in the function's boundaries
container3D.addEventListener('mousedown', navigateMouseDown);
container3D.addEventListener('wheel', navigateWheel);
window.addEventListener('resize', resizeContainer3D);
window.onload = function() {
  computeContainer3D();
  codeArea.refresh();
};

computeFirstInputsWidth();
console.log(firstInputsWidth);

//initializing the third-party text-editor
var codeArea = CodeMirror(containerCode, {
  mode: 'application/json',
  theme: 'neoncube-json',
  lineWrapping: true,
  undoDepth: 100,
  lineNumbers: true,
  scrollbarStyle: 'overlay',
  indentUnit: 4
});
//On change, run a construct that only calls buildJSON if the user has stopped to mofidy the code for 850ms
codeArea.on('change', function() {
  if (initialLock == true) {
    return;
  }
  if (codeChangeLock == false) {
    clearTimeout(codeChangeInterval)
  }
  codeChange();
});
function codeChange() {
  codeChangeLock = false;
  codeChangeInterval = setTimeout(function() {
    codeChangeLock = true;
      buildJSON(codeArea.getValue());
  }, 800);
}

const codeMirror = document.querySelector('.CodeMirror');
codeMirror.style.width = '500px';


//Functions
function handleImages() {
  keyImages = imageInput.files;
  for (var i = 0; i < keyImages.length; i++) {
    let thisIt = i;
    let thisReader = new FileReader();
    thisReader.readAsDataURL(keyImages[i]);
    thisReader.onload = function(e) {
      images[keyImages[thisIt].name.slice(0, -4)] = e.target.result;
    }
  }
}

//Pre-brain. Handles one-time-per-input things after a file input
function initializeJSON() {
  keyFile = fileInput.files;
  fileLabel.innerHTML = 'Browse... ► ' + keyFile[0].name;
  handleJSON();
  computeFirstInputsWidth();
  computeContainer3D();
  initialLock = true;
}

function handleJSON() {
  reader.readAsText(keyFile[0]);
}
//Brain
reader.onload = function(e) {
  if (keyFile[0].type == 'application/json') {
    codeArea.setValue(e.target.result);
    buildJSON(e.target.result);
    colorLegend.classList.remove('nodisplay');
  }
  else {
    errorMessage('Error: A non-compatible file has been chosen. Only a .json file is valid');
  }
}
/*  let index = 0;
  let index2 = 0;
  while (index < fileContent.lastIndexOf('\n')) {
    array[index2] = fileContent.slice(index).indexOf('\n') + index;
    index += fileContent.slice(index).indexOf('\n') + 1;
    index2++;
  }*/
function buildJSON(fileContent) {
  let contentArray;
  containerError.classList.add('nodisplay');
  containerElements.innerHTML = '';
  updateCube();
  try {
    contentArray = JSON.parse(fileContent);
  }
  catch (err) {
    let error = err.message;
    if (error.indexOf('JSON.parse: ') >= 0) {
      error = error.slice(error.indexOf('JSON.parse: ') + 'JSON.parse: '.length);
    }
    error = 'Error: ' + error;
    if (error.indexOf('/\bexpected\b/') >= 0) {
      error = error.slice(0, error.indexOf('expected')) + ' missing' + error.slice(error.indexOf('expected') + 'expected'.length)
    }
    if (error.search(/\bat\b/) >= 0) {
      error = error.slice(0, error.search(/\bat\b/) + 'at'.length) + ' about' + error.slice(error.search(/\bat\b/) + 'at'.length);
    }
    errorMessage(error);
    return;
  }
  if (fileContent.indexOf('parent') >= 0 && fileContent.indexOf('elements') < 0) {
    errorMessage('Error: missing elements; This model appears to be calling a parent. Parent feature coming soon');
    return;
  }
  if (fileContent.indexOf('parent') < 0 && fileContent.indexOf('elements') < 0) {
    errorMessage('Error: missing recognizable structures; This model appears not to be a valid json model format');
    return;
  }
  let texturesNames = Object.keys(contentArray.textures);
  let texturesValues = Object.values(contentArray.textures);
  for (var i = 0; i < texturesValues.length; i++) {
    textures[texturesNames[i]] = texturesValues[i].slice(texturesValues[i].indexOf('/') + 1);
  }
  if (textures == null) {
    errorMessage('Warning: missing parameter "texture". Even if empty, this should be present with at least the paramater "particle" unless the model is a sole parent');
  }
  /*  else if (Object.getOwnPropertyNames(textures).length == 0) {
    errorMessage('Warning: No texture defined. Consider giving the model a particle texture at least');
  }*/
  elements = contentArray.elements;
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
    let html = '<div class="element container_3d" id="cube_' + i + '" style="transform: rotate' + rotationAxis +'(' + rotationAngle + 'deg) translateX(' + (16 * scaleFactor - width * scaleFactor - positionX * scaleFactor) + 'px) translateY(' + -positionY * scaleFactor + 'px) translateZ(' + (16 * scaleFactor - depth * scaleFactor - positionZ * scaleFactor) + 'px); transform-origin: ' + (16 * scaleFactor - rotationOriginX * scaleFactor) + 'px ' + -(rotationOriginY * scaleFactor) + 'px ' + (16 * scaleFactor - rotationOriginZ * scaleFactor) + 'px">';
    let orientations = Object.getOwnPropertyNames(elements[i].faces);
    for (var n = 0; n < orientations.length; n++) {
      let texture = elements[i].faces[orientations[n]].texture.slice(1);
      let texturePath = images[textures[texture]];
      let textureStartX = elements[i].faces[orientations[n]].uv[0];
      let textureStartY = elements[i].faces[orientations[n]].uv[1];
      let textureWidthX = elements[i].faces[orientations[n]].uv[2] - textureStartX;
      let textureWidthY = elements[i].faces[orientations[n]].uv[3] - textureStartY;
      let basicStyle;
      let textureStyle;
      let color;
      switch (orientations[n]) {
        case 'north':
          basicStyle = 'transform: translateZ(' + depth * scaleFactor + 'px) translateY(' + -height * scaleFactor + 'px); width: ' + width * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          break;
        case 'south':
          basicStyle = 'transform: translateY(' + -height * scaleFactor + 'px) rotateY(180deg); width: ' + width * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          break;
        case 'west':
          basicStyle = 'transform: rotateY(90deg) translateY(' + -height * scaleFactor + 'px) translateZ(' + -(depth/2 - width) * scaleFactor + 'px) translateX(' + -depth/2 * scaleFactor + 'px); width: ' + depth * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          break;
        case 'east':
          basicStyle = 'transform: rotateY(90deg) translateY(' + -height * scaleFactor + 'px) translateZ(' + -depth/2 * scaleFactor + 'px) translateX(' + -depth/2 * scaleFactor + 'px) rotateY(180deg); width: ' + depth * scaleFactor + 'px; height: ' + height * scaleFactor + 'px;';
          break;
        case 'up':
          basicStyle = 'transform: rotateX(90deg) rotateZ(180deg) translateZ(' + (depth/2 + height) * scaleFactor + 'px) translateY(' + -depth/2 * scaleFactor + 'px); width: ' + width * scaleFactor + 'px; height: ' + depth * scaleFactor + 'px;';
          break;
        case 'down':
          basicStyle = 'transform: rotateX(90deg) rotateY(180deg) translateZ(' + -depth/2 * scaleFactor + 'px) translateY(' + depth/2 * scaleFactor + 'px); width: ' + width * scaleFactor + 'px; height: ' + depth * scaleFactor + 'px;';
          break;
      }
      color = 'color_' + orientations[n];
      textureStyle = texturePath != null ? 'background-image: url(' + texturePath + '); background-size: ' + (1600/textureWidthX).toFixed(3) + '% ' + (1600/textureWidthY).toFixed(3) + '%; background-position:' + (textureStartX/(16 - textureWidthX) * 100).toFixed(3) + '% ' + (textureStartY/(16 - textureWidthY) * 100).toFixed(3) + '%;' : '';
      html += '<span class="face ' + orientations[n] + ' ' + color + '" style="' + basicStyle + textureStyle + '"></span>';
    }
    html += '</div>'
    containerElements.innerHTML += html;
  }
  if (updateLock == true) { //Only refresh when necessary
    refreshCube();
    updateLock = false;
  }
  initialLock = false;
}
//Heart
function updateCube() {
  output3D.style.transform = 'translateX(' + translateRangeX + 'px) translateY(' + translateRangeY + 'px) scale(' + scaleRange + ') rotateX(' + transformRangeY + 'deg) rotateY(' + transformRangeX + 'deg) rotateZ(' + transformRangeZ + 'deg)';
  //rotateSliderKnob.style.transform = 'translateX(' + range + 'px)';
}

//Beautification of the whole thing - Refreshes the element in order for toggled elements to show (Bug in various browsers)
function refreshCube() {
  scaleRange += 0.00001;
  updateCube();
  scaleRange -= 0.00001;
}


//Coordination of every mouse procedures -> Termination of various function-global variables and procedures
function up() {
  //SliderLock = false;
  //ScaleLock = false;
  if (resizeCodeLock == true) {
    codeArea.refresh();
    resizeCodeLock = false;
  }
  navigateButton = -1;
  document.body.classList.remove('noselect');
}

//Display an error when one exists
function errorMessage(error) {
  errorInput.innerHTML = error;
  containerError.classList.remove('nodisplay');
  updateLock = true;
}

//Prevent context menu of showing up in the 3D-container for the purpose of mouse movement
function handleContext(e) {
  e.preventDefault();
}

//A function to compute the width of the items inside the first input container + compact_container
function computeFirstInputsWidth() {
  firstInputsWidth = 0;
  for (var i = 0; i < containersInputExecute[0].children.length; i++) {
    firstInputsWidth += containersInputExecute[0].children[i].clientWidth;
  }
  firstInputsWidth += containerCompact.clientWidth;
  firstInputsWidth += 70; //a simple margin
}

//To-be-called function to resize the code area
function resizeCode(width) {
  codeMirror.style.width = width + 'px';
}

function togglePopout(popoutState) {
  if (popoutState == 'removing') {
    container3D.classList.remove('popout');
    containerInputCode.classList.add('nodisplay');
    scaleRange = prePopoutScale;
  }
  else if (popoutState == 'adding') {
    container3D.classList.add('popout');
    containerInputCode.classList.remove('nodisplay');
    prePopoutScale = scaleRange;
    scaleRange = 0.6;
  }
  else {
    console.error('Error: popoutState containing not recognizable structures: ' + popoutState);
    return;
  }
  updateCube();
}

//The function called from the 'resize' event. Redirecting to the actual function to escape the event argument as the actual function needs an argument as well
function resizeContainer3D() {
  computeContainer3D();
}

//Adapting diverse features when various events take place which is triggered by resizing the window and code area but also by other tasks
function computeContainer3D(thisWidth = containerExecute.clientWidth) {
  //thisWidth: the final width of container3D. If a transition is present, a computed final width has to be parsed

  //If container3D is shrunk to a given extent, the second input container is hidden
  if (thisWidth > secondInputsWidth) {
    containersInputExecute[1].classList.remove('nodisplay');
  }
  else {
    containersInputExecute[1].classList.add('nodisplay');
  }

  //If the width of the first inputs exceeds the width of container3D, hide the header inside the compact_container
  if (firstInputsWidth >= thisWidth) {
    thisHeader.classList.add('nodisplay');
  }
  else if (firstInputsWidth < thisWidth) {
    thisHeader.classList.remove('nodisplay');
  }

  //If the width of containerCode exceeds the total width minus 8px resize_bar threshold, lock the size with an extremely convenient CSS value
  if (containerCode.clientWidth > thisBox.clientWidth - 8 && resizeOverflowLock == false && resizeButtonLock['code'] == null) {
    resizeButtonLock['code'] = containerCode.clientWidth;
    codeMirror.style.width = '100vw';
    buttonExpandCode.classList.add('hidden');
    buttonRestoreCode.classList.remove('hidden');
    resizeOverflowLock = true;
  }
  else if (thisBox.clientWidth - 8 >= resizeButtonLock['code'] && resizeOverflowLock == true) {
    resizeCode(resizeButtonLock['code']);
    buttonRestoreCode.classList.add('hidden');
    buttonExpandCode.classList.remove('hidden');
    resizeButtonLock['code'] = null;
    resizeOverflowLock = false;
  }

  //Overrides if CSS Grid is not supported (erf)
  if (!CSS.supports('display', 'grid')) {
    container3D.classList.add('nogrid');
    if (thisWidth <= 369) {
      containersInputExecute[1].classList.add('nodisplay');
      container3D.style.top = '184px';
    }
    else if (thisWidth <= 583) {
      container3D.style.top = '278px';
    }
    else if (thisWidth <= 729) {
      container3D.style.top = '215px';
    }
    else if (thisWidth > 583 ) {
      container3D.style.top = null;
    }
  }
}

function handleMousemove(e) {
// navigate()
  if (navigateButton >= 0) {
    let container3DRect = container3D.getBoundingClientRect();
    let distanceX = e.x - container3DRect.left - clickedX;
    let distanceY = e.y - container3DRect.top - clickedY;
    if (navigateButton == 0) {
      //Navigation methods (also set by the multiple-choice "Axis-restriction" button) Please don't use Z
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
        translateRangeX = distanceX + translateLockedX;
        translateRangeY = distanceY + translateLockedY;
      }
    }
    updateCube();
  }
//movingResizeCode()
  else if (resizeCodeLock == true) {
    let distance = e.x - resizeCodeClicked;
    let width = codeSizeLocked + distance;
    if (width <= 7) {
      if (resizeButtonLock['exe'] != null) {
        return;
      }
      width = 0;
      buttonExpandExecute.classList.add('hidden');
      buttonRestoreExecute.classList.remove('hidden');
      resizeButtonLock['exe'] = resizeCodeClicked;
    }
    else if (width >= thisBox.clientWidth - 8) {
      if (resizeButtonLock['code'] != null) {
        return;
      }
      codeMirror.style.width = '100vw';
      buttonExpandCode.classList.add('hidden');
      buttonRestoreCode.classList.remove('hidden');
      resizeButtonLock['code'] = resizeCodeClicked;
      togglePopout('adding');
      return;
    }
    else if (resizeButtonLock['exe'] != null) {
      resizeButtonLock['exe'] = null;
      codeMirror.classList.remove('nodisplay')
      buttonRestoreExecute.classList.add('hidden');
      buttonExpandExecute.classList.remove('hidden');
      setTimeout(function() {
        codeArea.refresh();
      }, 10);
    }
    else if (resizeButtonLock['code'] != null) {
      resizeButtonLock['code'] = null;
      togglePopout('removing');
      buttonRestoreCode.classList.add('hidden');
      buttonExpandCode.classList.remove('hidden');
    }
    resizeCode(width);
    computeContainer3D();
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

//Navigation and territorial modification of the model via mouse buttons
 //Initialization of mouse movement via click
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
    scaleRange -= 0.085 * (0.17 * (scaleRange - 3.2) + 1);
  }
  else if (scrollY < 1) {
    scaleRange += 0.085 * (0.17 * (scaleRange - 3.2) + 1);
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
function choiceAxis(lock) {
  rotateLock = lock;
}
 //Functions for the second multiple-choice "popout mode" button;
function choicePopout(choiceActive, choice2, choice3, choice4) {
  container3D.classList.add(choiceActive);
  container3D.classList.remove(choice2);
  container3D.classList.remove(choice3);
  container3D.classList.remove(choice4);
}

 //Floating buttons at the bottom corners of the specific areas
  //Expand the code area to its full extent
function expandCode() {
  codeMirror.classList.add('resizing');
  resizeButtonLock['code'] = parseInt(codeMirror.style.width.replace('px', ''));
  codeMirror.style.width = '100vw';
  buttonExpandCode.classList.add('hidden');
  buttonRestoreCode.classList.remove('hidden');
  thisHeader.classList.add('nodisplay');
  setTimeout(function() {
    togglePopout('adding');
    codeArea.refresh();
  }, 220);
}
  //Expand the execute area to its full extent
function expandExecute() {
  codeMirror.classList.add('resizing');
  resizeButtonLock['exe'] = parseInt(codeMirror.style.width.replace('px', ''));
  resizeCode(0);
  buttonExpandExecute.classList.add('hidden');
  buttonRestoreExecute.classList.remove('hidden');
  container3D.style.top = null;
  computeContainer3D(thisBox.clientWidth);
  setTimeout(function() {
    codeMirror.classList.add('nodisplay');
  }, 230);
}
  //Restore the pre-expanded state of the code area or if the code area has been expanded to its full extent, reset both windows to their defaults
function restoreCode() {
  let thisLock = resizeButtonLock['code'];
  togglePopout('removing');
  codeMirror.classList.add('resizing');
  if (thisLock > thisBox.clientWidth - 8) {
    resizeCode(thisBox.clientWidth / 2); //Fallback if the window has gotten smaller
  }
  else {
    resizeCode(thisLock);
  }
  buttonRestoreCode.classList.add('hidden');
  buttonExpandCode.classList.remove('hidden');
  computeContainer3D(thisBox.clientWidth - thisLock);
  resizeButtonLock['code'] = null;
  setTimeout(function() {
    codeArea.refresh();
  }, 230);
}
  //Restore the pre-expanded state of the execute area or if the code area has been collapsed to its full extent, reset everything back to normal
function restoreExecute() {
  let thisLock = resizeButtonLock['exe'];
  codeMirror.classList.remove('nodisplay');
  codeMirror.classList.add('resizing');
  if (thisLock > thisBox.clientWidth - 8) {
    resizeCode(thisBox.clientWidth / 2); //Fallback if the window has gotten smaller
  }
  else {
    resizeCode(thisLock);
  }
  buttonRestoreExecute.classList.add('hidden');
  buttonExpandExecute.classList.remove('hidden');
  computeContainer3D(thisBox.clientWidth - thisLock);
  resizeButtonLock['exe'] = null;
}

//Execution of any multiple-choice procedure
function choiceButtonsClick(e) {
  document.body.classList.add('noselect');
  let mark;
  if (e.target.classList.contains('currentchoice') || e.target.classList.contains('knob') || !e.target.classList.contains('mark') && e.target.children[0].classList.contains('currentchoice')) {
    return;
  }
  else if (e.target.classList.contains('marker')) {
    mark = e.target.children[0];
  }
  else {
    mark = e.target;
  }
  if (mark.parentNode.parentNode.parentNode.classList.contains('popoutchoice') && !container3D.classList.contains('popout')) {
    console.warn('Warning: Tried to allocate popout-related options to container3D without popout mode being present. Execution terminated');
    return;
  }
  let knob = mark.parentNode.parentNode.parentNode.children[0];
  knob.style.transform = 'translateX(' + (mark.offsetLeft - 14 - (knob.offsetWidth - mark.offsetWidth) / 2) + 'px)';
  for (var i = 0; i < mark.parentNode.parentNode.children.length; i++) {
    if (mark.parentNode.parentNode.children[i].classList.contains('currentchoice')) {
      mark.parentNode.parentNode.children[i].classList.remove('currentchoice');
    }
  }
  mark.parentNode.classList.add('currentchoice');
  switch (mark.parentNode) {
    case restrictAxisChoiceNone:
      choiceAxis('');
      break;
    case restrictAxisChoiceX:
      choiceAxis('x');
      break;
    case restrictAxisChoiceY:
      choiceAxis('y');
      break;
    case restrictAxisChoiceZ:
      choiceAxis('z');
      break;
    case popoutModeChoiceNone:
      choicePopout('default', 'opaque', 'collapsed', 'disabled');
      break;
    case popoutModeChoiceOpaque:
      choicePopout('opaque', 'default', 'collapsed', 'disabled');
      break;
    case popoutModeChoiceCollapsed:
      choicePopout('collapsed', 'opaque', 'default', 'disabled');
      break;
    case popoutModeChoiceGone:
      choicePopout('disabled', 'opaque', 'collapsed', 'default');
      break;
  }
}
 //initialization of the procedure resizing the code area by dragging
function resizeCodeClick(e) {
  document.body.classList.add('noselect');
  codeMirror.classList.remove('resizing');
  resizeCodeLock = true;
  resizeCodeClicked = e.x;
  if (codeMirror.style.width == '100vw') {
    codeSizeLocked = thisBox.clientWidth - 8;
  }
  else {
    codeSizeLocked = parseInt(codeMirror.style.width.replace('px', ''));
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
 //A slider to scale the element - will most likely be replaced by a mouse navigation TODO: fine tuning?
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

//~A very costy~ An extremely massively vehemently resource intensive way of resizing the element which I thought was necessary for good visuals but then I disabled outline. Wow.
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
