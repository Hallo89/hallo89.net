//oh gott roman
const reader = new FileReader();
var keyFile; //The initial variable having stored the not-human-readable file which has been chosen
var images = {}; //An object containing all imported images with their according name
var initialLock = false; //A lock for preventing the initial codeMirror load from calling buildJSON() again
var firstInputsWidth; //The total length of all items of the first input_container + compact_container
var secondInputsWidth = 370; //The total length of all items inside the second input_container; static due to knowing the beginning width
var clickedX; //The X-coordinate of the point where a click has taken place in container3D in order to navigate
var clickedY; //The Y-coordinate of above
var transform = {
  rotateX: 20,
  rotateY: -20,
  rotateZ: 0,
  translateX: 0,
  translateY: 0,
  scale: 1
};
transform.locked = { //Adopting the current transformation when a click has taken place, for a finished navigation to add its value to
  rotateX: transform.rotateX,
  rotateY: transform.rotateY,
  translateX: transform.translateX,
  translateY: transform.translateY
};
const scaleFactor = 25; //The factor every value is multiplied with in buildJSON
var resizeLock = false; //If resizing = true, afterwards = false
var resizeClicked; //The absolute position (e.x) of the mouse when a resize process has been started
var preResize; //The width of the code area before an expand button has been clicked
var preResizeOverflow; //The width of the code area before it expanded due to a smaller viewport
var codeWidthClick; //The width of the code area at the time of a started resize process
var prePopoutScale; //The scale of the model in the non-popout state
var navigateButton = -1; //A value adapting to the currently clicked mouse button, used in the navigation-mechanism
var rotateLock = ''; //A String for navigate() to check whether the x-axis should be the only rotate-able axis
var codeTimer; //The setTimeout instance of the code area


const thisBox = document.querySelector('.box');

const sectionCode = thisBox.querySelector('.code_container'); //The code container
const sectionExe = thisBox.querySelector('.execute_container'); //the execute container

const thisHeader = sectionExe.querySelector('.box-header');

const fileInput = document.getElementById('input_json_model'); //The json file <input> element
const fileLabel = document.getElementById('json_model_label'); //The label of above, which the user interacts with

const imageInput = document.getElementById('input_images'); //The image files <input>

const choiceButtons = thisBox.querySelectorAll('.multiple .input'); //All multiple-choice buttons

const btnRefresh = sectionExe.querySelector('.refresh'); //The refresh button refreshing refreshful refresh refresh
const btnAxes = sectionExe.querySelector('.axesvisibility'); //Toggling the visibility of the centered axes
const btnQuantity = sectionExe.querySelector('.qualityquantity'); //Toggling the 2-Dimensional boundary-aids
const btnGrid = sectionExe.querySelector('.bottomgridvisibility'); //Toggling the 3D bottom grid-aid
const btnExpandExecute = sectionExe.querySelector('.floating_button.expand_execute'); //Expanding execute to its full extent
const btnRestoreExecute = sectionExe.querySelector('.floating_button.restore_execute'); //Same as above but even more magically (same amount of magic) with an even more magic element (other window)
const btnExpandCode = sectionCode.querySelector('.floating_button.expand_code'); //The button which magically expands the code area to its full extent but without magic
const btnRestoreCode = sectionCode.querySelector('.floating_button.restore_code'); //The button which magically reverts the split windows' position to its pre-magic-button-pressed state

//The different choice-markers for the axis restriction choice button
const choiceAxis = sectionExe.querySelector('.axischoice');
const choiceAxisNone = choiceAxis.querySelector('.marker.none');
const choiceAxisX = choiceAxis.querySelector('.marker.axis.x');
const choiceAxisY = choiceAxis.querySelector('.marker.axis.y');
const choiceAxisZ = choiceAxis.querySelector('.marker.axis.z');

//The multiple-choice popout mode input and its markers
const choicePopout = sectionCode.querySelector('.popoutchoice');
const choicePopoutNone = choicePopout.querySelector('.marker.default');
const choicePopoutOpaque = choicePopout.querySelector('.marker.opaque');
const choicePopoutCollapsed = choicePopout.querySelector('.marker.collapsed');
const choicePopoutGone = choicePopout.querySelector('.marker.disabled');

const codeResizer = sectionCode.querySelector('.code_container .resize_bar'); //the (invisible) bar to resize the code area

const colorLegend = sectionExe.querySelector('.legend_container'); //The container containing the color-legend to the cardinal points of the model - to be enabled once a model has been loaded
const containerError = sectionExe.querySelector('.error_banner'); //The error container
const errorInput = sectionExe.querySelector('.error_banner .error'); //The container for the actual error message

const containersInputExecute = sectionExe.querySelectorAll('.execute_container .input_container:not(.compactor)');
const containerInputCode = sectionCode.querySelector('.code_container .input_container');
const containerCompact = sectionExe.querySelector('.compact_container'); //The container inside the first input_container containing both header and utility buttons
const containerAxes = document.getElementById('axes_container'); //The container containg all of the centered visual axes
const containerBounds = sectionExe.querySelector('.boundary_container'); //Container containing all of the 3-Dimensional boundary-aids
const containerBounds2D = sectionExe.querySelector('.boundary_container_2d'); //Container of the 2-Dimensional boundary aids
const containerGrid = containerBounds.querySelector('.bottom_grid'); //The somewhat heavy 3D boundary-aid bottom grid
const containerAxes2D = containerBounds2D.querySelector('.axes'); //The 2D axes container
const containerElements = sectionExe.querySelector('.elements_container'); //The heart of the whole program; The container where everything takes place
const output3D = document.getElementById('output'); //The body containing the heart where every movement takes place
const container3D = document.getElementById('output_container'); //the body containg the body containg the heart where every boundary takes place

fileInput.addEventListener('change', initializeJSON);
imageInput.addEventListener('change', handleImages);
codeResizer.addEventListener('mousedown', resizeMouseDown);
container3D.addEventListener('mousedown', navigateMouseDown);
container3D.addEventListener('wheel', navigateScroll);
container3D.addEventListener('contextmenu', function(e) {
  e.preventDefault(); //Prevent the context menu from showing up
});
btnExpandExecute.addEventListener('click', expandExecute);
btnExpandCode.addEventListener('click', expandCode);
btnRestoreExecute.addEventListener('click', restoreExecute);
btnRestoreCode.addEventListener('click', restoreCode);
btnRefresh.addEventListener('click', handleJSON);
btnAxes.addEventListener('click', function() {
  btnQuantity.classList.contains('active') ? containerAxes.classList.toggle('nodisplay') : containerAxes2D.classList.toggle('nodisplay');
});
btnGrid.addEventListener('click', function() {
  containerGrid.classList.toggle('nodisplay');
});
btnQuantity.addEventListener('click', function() {
  containerBounds.classList.toggle('nodisplay');
  containerBounds2D.classList.toggle('nodisplay');
  if (btnQuantity.classList.contains('active') && !btnAxes.classList.contains('active') || !btnQuantity.classList.contains('active') && !btnAxes.classList.contains('active')) {
    containerAxes.classList.add('nodisplay');
    containerAxes2D.classList.add('nodisplay');
  } else if (btnQuantity.classList.contains('active') && btnAxes.classList.contains('active')) {
    containerAxes.classList.remove('nodisplay');
    containerAxes2D.classList.add('nodisplay');
  } else if (!btnQuantity.classList.contains('active') && btnAxes.classList.contains('active')) {
    containerAxes2D.classList.remove('nodisplay');
    containerAxes.classList.add('nodisplay');
  }
});
for (i = 0; i < choiceButtons.length; i++) {
  choiceButtons[i].addEventListener('mousedown', choiceButtonsClick);
}
buttonMinimize.addEventListener('click', function() {
  let bodyWidth = document.body.clientWidth;
  codeMirror.style.width = (bodyWidth * 0.8) / (bodyWidth / codeMirror.clientWidth) + 'px';
});
buttonMaximize.addEventListener('click', function() {
  let codeRatio = thisBox.clientWidth / codeMirror.clientWidth;
  setTimeout(function() {
    codeMirror.style.width = thisBox.clientWidth / codeRatio + 'px';
  }, 250);
});
window.addEventListener('resize', function() { //escaping the event
  adaptToResize(true);
});
window.addEventListener('mouseup', up); //reset various variables once the mouse has been released
window.addEventListener('mousemove', handleMousemove);
window.onload = function() {
  adaptToResize();
  codeArea.refresh();
};

reader.onload = function(e) {
  if (keyFile[0].type == 'application/json') {
    codeArea.setValue(e.target.result);
    buildJSON(e.target.result);
    colorLegend.classList.remove('nodisplay');
  } else {
    errorMessage('Error: A non-compatible file has been chosen. Only a .json file is valid');
  }
}

computeFirstInputsWidth();

//initializing the third-party text-editor
const codeArea = CodeMirror(sectionCode, {
  mode: 'application/json',
  theme: 'neoncube-json',
  lineWrapping: true,
  lineNumbers: true,
  scrollbarStyle: 'overlay',
  indentUnit: 4
});
//On change, run a construct that only calls buildJSON if the user has stopped to modify the code for 850ms
codeArea.on('change', function() {
  if (!initialLock) {
    clearTimeout(codeTimer);
    codeTimer = setTimeout(function() {
      buildJSON(codeArea.getValue());
    }, 800);
  }
});

const codeMirror = document.querySelector('.CodeMirror');
codeMirror.style.width = thisBox.clientWidth / 2.3 + 'px';

function handleImages() {
  const keyImages = imageInput.files;
  for (var i = 0; i < keyImages.length; i++) {
    const it = i;
    const thisReader = new FileReader();
    thisReader.readAsDataURL(keyImages[i]);
    thisReader.onload = function(e) {
      images[keyImages[it].name.slice(0, -4)] = e.target.result;
    }
  }
}

//Handles one-time-per-input things after a file input
function initializeJSON() {
  keyFile = fileInput.files;
  fileLabel.innerHTML = 'Browse... ► ' + keyFile[0].name;
  handleJSON();
  computeFirstInputsWidth();
  adaptToResize();
}

function handleJSON() {
  initialLock = true;
  reader.readAsText(keyFile[0]);
}

function buildJSON(fileContent) {
  if (!containerError.classList.contains('nodisplay')) containerError.classList.add('nodisplay');
  containerElements.innerHTML = '';

  try {
    var contentArray = JSON.parse(fileContent);
  } catch (err) {
    let error = err.message;
    if (error.indexOf('JSON.parse: ') != -1) {
      error = error.slice(error.indexOf('JSON.parse: ') + 12);
    }
    error = 'Error: ' + error;
    if (error.indexOf('/\bexpected\b/') != -1) {
      error = error.slice(0, error.indexOf('expected')) + ' missing' + error.slice(error.indexOf('expected') + 8)
    }
    if (error.search(/\bat\b/) != -1) {
      error = error.slice(0, error.search(/\bat\b/) + 2) + ' about' + error.slice(error.search(/\bat\b/) + 2);
    }
    errorMessage(error);
    return;
  }

  if (fileContent.indexOf('parent') != -1 && fileContent.indexOf('elements') == -1) {
    errorMessage('Error: missing elements; This model appears to be calling a parent. Parent feature coming soon');
    return;
  } else if (fileContent.indexOf('parent') == -1 && fileContent.indexOf('elements') == -1) {
    errorMessage('Error: missing recognizable structures; This model appears not to be a valid json model format');
    return;
  }

  const loadedTextures = Object.keys(images).length != 0;
  if (fileContent.indexOf('textures') != -1) {
    if (loadedTextures) {
      var textures = {};
      const texturesValues = Object.values(contentArray.textures);
      for (var i = 0; i < texturesValues.length; i++) {
        textures[Object.keys(contentArray.textures)[i]] = texturesValues[i].slice(texturesValues[i].indexOf('/') + 1);
      }
    }
  } else {
    errorMessage('Warning: missing parameter "texture". Even if empty, this should be present with at least the paramater "particle" unless the model is a sole parent');
  }

  const elements = contentArray.elements;
  for (var i = 0; i < elements.length; i++) {
    const height = (elements[i].to[1] - elements[i].from[1]) * scaleFactor;
    const width = (elements[i].to[0] - elements[i].from[0]) * scaleFactor;
    const depth = (elements[i].to[2] - elements[i].from[2]) * scaleFactor;
    const size = 16 * scaleFactor;
    const positionX = elements[i].from[0] * scaleFactor;
    const positionY = elements[i].from[1] * scaleFactor;
    const positionZ = elements[i].from[2] * scaleFactor;
    const hasRotation = !!elements[i].rotation;
    if (hasRotation) {
      var rotationOriginX = elements[i].rotation.origin[0] * scaleFactor;
      var rotationOriginY = elements[i].rotation.origin[1] * scaleFactor;
      var rotationOriginZ = elements[i].rotation.origin[2] * scaleFactor;
      var rotationAxis = elements[i].rotation.axis;
      var rotationAngle = elements[i].rotation.angle;
    }
    const html = document.createElement('div');
    html.classList.add('element');
    html.classList.add('container_3d');
    html.setAttribute('id', 'cube_' + i);
    if (hasRotation) {
      html.setAttribute('style', 'transform: rotate' + rotationAxis + '(' + rotationAngle + 'deg) translateX(' + (size - width - positionX) + 'px) translateY(' + -positionY + 'px) translateZ(' + (size - depth - positionZ) + 'px); transform-origin: ' + (size - rotationOriginX) + 'px ' + -(rotationOriginY) + 'px ' + (size - rotationOriginZ) + 'px');
    } else {
      html.setAttribute('style', 'transform: translateX(' + (size - width - positionX) + 'px) translateY(' + -positionY + 'px) translateZ(' + (size - depth - positionZ) + 'px)');
    }

    const orientations = Object.getOwnPropertyNames(elements[i].faces);
    for (var n = 0; n < orientations.length; n++) {
      if (loadedTextures) {
        const texture = elements[i].faces[orientations[n]].texture.slice(1);
        var texturePath = images[textures[texture]];
        var textureStartX = elements[i].faces[orientations[n]].uv[0];
        var textureStartY = elements[i].faces[orientations[n]].uv[1];
        var textureWidthX = elements[i].faces[orientations[n]].uv[2] - textureStartX;
        var textureWidthY = elements[i].faces[orientations[n]].uv[3] - textureStartY;
      }
      let spanStyle;
      switch (orientations[n]) {
        case 'north':
          spanStyle = 'transform: translateZ(' + depth + 'px) translateY(' + -height + 'px); width: ' + width + 'px; height: ' + height + 'px;';
          break;
        case 'south':
          spanStyle = 'transform: translateY(' + -height + 'px) rotateY(180deg); width: ' + width + 'px; height: ' + height + 'px;';
          break;
        case 'west':
          spanStyle = 'transform: rotateY(90deg) translateY(' + -height + 'px) translateZ(' + -(depth/2 - width) + 'px) translateX(' + -depth/2 + 'px); width: ' + depth + 'px; height: ' + height + 'px;';
          break;
        case 'east':
          spanStyle = 'transform: rotateY(90deg) translateY(' + -height + 'px) translateZ(' + -depth/2 + 'px) translateX(' + -depth/2 + 'px) rotateY(180deg); width: ' + depth + 'px; height: ' + height + 'px;';
          break;
        case 'up':
          spanStyle = 'transform: rotateX(90deg) rotateZ(180deg) translateZ(' + (depth/2 + height) + 'px) translateY(' + -depth/2 + 'px); width: ' + width + 'px; height: ' + depth + 'px;';
          break;
        case 'down':
          spanStyle = 'transform: rotateX(90deg) rotateY(180deg) translateZ(' + -depth/2 + 'px) translateY(' + depth/2 + 'px); width: ' + width + 'px; height: ' + depth + 'px;';
          break;
      }
      const htmlSpan = document.createElement('span');
      htmlSpan.classList.add('face');
      htmlSpan.classList.add(orientations[n]);
      htmlSpan.classList.add('color_' + orientations[n]);
      htmlSpan.setAttribute('style', spanStyle + (loadedTextures && texturePath != null ? 'background-image: url(' + texturePath + '); background-size: ' + (1600/textureWidthX).toFixed(3) + '% ' + (1600/textureWidthY).toFixed(3) + '%; background-position:' + (textureStartX/(16 - textureWidthX) * 100).toFixed(3) + '% ' + (textureStartY/(16 - textureWidthY) * 100).toFixed(3) + '%;' : ''));
      html.appendChild(htmlSpan);
    }
    containerElements.appendChild(html);
  }
  initialLock = false;
}
/* //Beautification of the whole thing - Refreshes the element in order for toggled elements to show (Bug in various browsers)
function refreshCube() {
  updateCube({scale: transform.scale + 0.00001});
  transform.scale -= 0.00001;
} */

function updateCube(values = {}) {
  if (values.translateX != null) transform.translateX = values.translateX;
  if (values.translateY != null) transform.translateY = values.translateY;
  if (values.scale != null) transform.scale = values.scale;
  if (values.rotateX != null) transform.rotateX = values.rotateX;
  if (values.rotateY != null) transform.rotateY = values.rotateY;
  if (values.rotateZ != null) transform.rotateZ = values.rotateZ;
  output3D.setAttribute('style', 'transform: translateX(' + transform.translateX + 'px) translateY(' + transform.translateY + 'px) scale(' + transform.scale + ') rotateX(' + transform.rotateY + 'deg) rotateY(' + transform.rotateX + 'deg) rotateZ(' + transform.rotateZ + 'deg)');
}

//Coordination of every mouse procedures -> Termination of various script-global variables and procedures
function up() {
  if (resizeLock == true) {
    codeArea.refresh();
    resizeLock = false;
  }
  navigateButton = -1;
  document.body.classList.remove('noselect');
}

//Display an error when one exists
function errorMessage(error) {
  errorInput.innerHTML = error;
  containerError.classList.remove('nodisplay');
  // updateLock = true;
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

function togglePopout(popoutState) {
  if (popoutState == 'remove') {
    container3D.classList.remove('popout');
    containerInputCode.classList.add('nodisplay');
    updateCube({scale: prePopoutScale});
  } else if (popoutState == 'add') {
    container3D.classList.add('popout');
    containerInputCode.classList.remove('nodisplay');
    prePopoutScale = transform.scale;
    updateCube({scale: 0.6});
  } else {
    console.warn('Error: togglePopout: argument \'popoutState\' is an invalid ' + typeof popoutState + ': "' + popoutState + '". It needs to be either "remove" or "add". Execution skipped.');
  }
}

//Adapting diverse features when various events take place which is triggered by resizing the window and code area but also by other tasks
function adaptToResize(thisWidth = sectionExe.clientWidth) {
  //thisWidth: the final width of container3D. If a transition is present, a computed final width has to be parsed
  //if the first argument (thisWidth) is true, enable codeLock and assign thisWidth to its normal value again
  let codeLock = false;
  if (thisWidth == true) {
    codeLock = true;
    thisWidth = sectionExe.clientWidth;
  }

  //If container3D is shrunk to a given extent, the second input container is hidden
  if (thisWidth > secondInputsWidth) {
    containersInputExecute[1].classList.remove('nodisplay');
  } else if (thisWidth <= secondInputsWidth && !containersInputExecute[1].classList.contains('nodisplay')) {
    containersInputExecute[1].classList.add('nodisplay');
  }

  //If the width of the first inputs exceeds the width of container3D, hide the header inside the compact_container
  if (firstInputsWidth >= thisWidth) {
    thisHeader.classList.add('nodisplay');
  } else if (firstInputsWidth < thisWidth) {
    thisHeader.classList.remove('nodisplay');
  }

  //Expand the code area if the width of the code container exceeds the total tool width and restore it if it's width expands again
  if (codeLock) {
    if (sectionCode.clientWidth >= thisBox.clientWidth - 15 && codeMirror.getAttribute('style').slice(-3, -1) != 'vw' && codeMirror.clientWidth != 0) {
      preResizeOverflow = sectionCode.clientWidth;
      preResize = preResizeOverflow;
      handleResize('expandCode');
      togglePopout('add');
    } else if (thisBox.clientWidth - 15 >= preResizeOverflow && codeMirror.getAttribute('style').slice(-3, -1) == 'vw' && preResizeOverflow) {
      handleResize('restoreCode', preResizeOverflow);
      preResizeOverflow = null;
    }
  }

  //Overrides if CSS Grid is not supported (erf)
  //Disabled until the big tools design rework
/*   if (!CSS.supports('display', 'grid')) {
    container3D.classList.add('nogrid');
    if (thisWidth <= 369) {
      containersInputExecute[1].classList.add('nodisplay');
      container3D.style.top = '184px';
    } else if (thisWidth <= 583) {
      container3D.style.top = '278px';
    } else if (thisWidth <= 729) {
      container3D.style.top = '215px';
    } else if (thisWidth > 583 ) {
      container3D.style.top = null;
    }
  } */
}

//Different procedures executed by moving the mouse (on the whole window)
function handleMousemove(e) {
  //Model navigation
  if (navigateButton >= 0) {
    const container3DRect = container3D.getBoundingClientRect();
    const distanceX = e.x - container3DRect.left - clickedX;
    const distanceY = e.y - container3DRect.top - clickedY;
    if (navigateButton == 0) {
      //Navigation methods (also set by the multiple-choice "Axis-restriction" button). Please don't use Z
      switch (rotateLock) {
        case 'x':
          updateCube({rotateX: (distanceX / 3.6) + transform.locked.rotateX});
          break;
        case 'y':
          updateCube({rotateY: -(distanceY / 4.6) + transform.locked.rotateY});
          break;
        case 'z':
          updateCube({rotateZ: ((distanceX + -distanceY) / 3)});
          break;
        default:
          updateCube({rotateX: (distanceX / 3.6) + transform.locked.rotateX, rotateY: -(distanceY / 4.6) + transform.locked.rotateY});
      }
    } else if (navigateButton == 2) {
      updateCube({translateX: distanceX + transform.locked.translateX, translateY: distanceY + transform.locked.translateY});
    }
  }
  //Resizing, snapping and releasing of the code area
  else if (resizeLock == true) {
    const codeWidth = codeMirror.clientWidth;
    const width = codeWidthClick + (e.x - resizeClicked);
    if (width <= 15) {
      preResize = codeWidthClick;
      handleResize('expandExe');
      codeMirror.classList.add('nodisplay');
    } else if (width >= thisBox.clientWidth - 15) {
      preResize = codeWidthClick;
      handleResize('expandCode');
      togglePopout('add');
    } else if (codeMirror.clientWidth == 0 && width > 15) {
      codeMirror.classList.remove('nodisplay');
      handleResize('restoreExe', width);
      setTimeout(function() {
        codeArea.refresh();
      }, 10);
    } else if (codeMirror.getAttribute('style').slice(-3, -1) == 'vw' && width < thisBox.clientWidth - 15) {
      handleResize('restoreCode', width);
    } else if (width > 15 && width < thisBox.clientWidth - 15) {
      handleResize('', width);
      adaptToResize();
    }
  }
}

//Initialization of mouse movement via click
function navigateMouseDown(e) {
  document.body.classList.add('noselect');
  const container3DRect = container3D.getBoundingClientRect();
  navigateButton = e.button;
  clickedX = e.x - container3DRect.left;
  clickedY = e.y - container3DRect.top;
  transform.locked.rotateX = transform.rotateX;
  transform.locked.rotateY = transform.rotateY;
  transform.locked.translateX = transform.translateX;
  transform.locked.translateY = transform.translateY;
}

//zooming of the model via the scroll wheel
function navigateScroll(e) {
  //Scroll needs to be vertical and the ctrl key mustn't be pressed
  if (e.deltaY && !e.ctrlKey) {
    const scrollY = e.deltaY;
    if (scrollY > 0 && transform.scale > 0.1) {
      updateCube({scale: transform.scale - 0.085 * (0.17 * (transform.scale - 3.2) + 1)});
    } else if (scrollY < 0) {
      updateCube({scale: transform.scale + 0.085 * (0.17 * (transform.scale - 3.2) + 1)});
    }
  } else if (e.deltaX && !e.ctrlKey) { //Translate the cube when scrolled in horizontal directions
    const scrollX = e.deltaX;
    transform.locked.translateX = scrollX / Math.abs(scrollX) * 10 + transform.translateX;
    updateCube({translateX: transform.locked.translateX});
  }
}

//initialization of the procedure resizing the code area by dragging
function resizeMouseDown(e) {
  document.body.classList.add('noselect');
  codeMirror.classList.remove('resizing');
  resizeLock = true;
  resizeClicked = e.x;
  codeWidthClick = codeMirror.clientWidth;
}

//Floating buttons at the bottom corners of the code/execute area
function expandExecute() {
  preResize = codeMirror.clientWidth;
  codeMirror.classList.add('resizing');
  // container3D.style.top = null;
  handleResize('expandExe');
  adaptToResize(thisBox.clientWidth);
  setTimeout(function() {
    codeMirror.classList.add('nodisplay');
    codeMirror.classList.remove('resizing');
  }, 220);
}
function expandCode() {
  preResize = codeMirror.clientWidth;
  codeMirror.classList.add('resizing');
  handleResize('expandCode');
  setTimeout(function() {
    togglePopout('add');
    codeArea.refresh();
    codeMirror.classList.remove('resizing');
  }, 220);
}
function restoreExecute() {
  codeMirror.classList.remove('nodisplay');
  codeMirror.classList.add('resizing');
  //Fallback if the window has gotten smaller
  handleResize('restoreExe', preResize > thisBox.clientWidth - 15 ? thisBox.clientWidth / 2.3 : preResize);
  adaptToResize(thisBox.clientWidth - preResize);
  setTimeout(function() {
    codeArea.refresh();
    codeMirror.classList.remove('resizing');
  }, 220);
}
function restoreCode() {
  codeMirror.classList.add('resizing');
  //Fallback if the window has gotten smaller
  handleResize('restoreCode', preResize > thisBox.clientWidth - 15 ? thisBox.clientWidth / 2.3 : preResize);
  adaptToResize(thisBox.clientWidth - preResize);
  preResizeOverflow = null;
  setTimeout(function() {
    codeArea.refresh();
    codeMirror.classList.remove('resizing');
  }, 220);
}

function handleResize(type, width) {
  switch (type) {
    case 'expandExe':
      btnExpandExecute.classList.add('hidden');
      btnRestoreExecute.classList.remove('hidden');
      sectionCode.classList.add('docked');
      sectionCode.classList.add('left');
      width = 0;
      break;
    case 'expandCode':
      btnExpandCode.classList.add('hidden');
      btnRestoreCode.classList.remove('hidden');
      thisHeader.classList.add('nodisplay');
      sectionCode.classList.add('docked');
      sectionCode.classList.add('right');
      width = document.body.classList.contains('fullscreen') ? '100vw' : '80vw';
      break;
    case 'restoreExe':
      btnRestoreExecute.classList.add('hidden');
      btnExpandExecute.classList.remove('hidden');
      sectionCode.classList.remove('docked');
      sectionCode.classList.remove('left');
      break;
    case 'restoreCode':
      togglePopout('remove');
      btnRestoreCode.classList.add('hidden');
      btnExpandCode.classList.remove('hidden');
      sectionCode.classList.remove('docked');
      sectionCode.classList.remove('right');
      break;
  }
  if (type != 'expandCode') width += 'px';
  codeMirror.setAttribute('style', 'width: ' + width + ';');
}

//Execution of any multiple-choice procedure
function choiceButtonsClick(e) {
  document.body.classList.add('noselect');
  if (e.target.classList.contains('currentchoice') || e.target.classList.contains('knob') || !e.target.classList.contains('mark') && e.target.children[0].classList.contains('currentchoice')) {
    return;
  } else if (e.target.classList.contains('marker')) {
    var mark = e.target.children[0];
  } else {
    var mark = e.target;
  }
  if (mark.parentNode.parentNode.parentNode.classList.contains('popoutchoice') && !container3D.classList.contains('popout')) {
    console.warn('Warning: Tried to allocate popout-related options to container3D without popout mode being present. Execution terminated');
    return;
  }
  const knob = mark.parentNode.parentNode.parentNode.children[0];
  const choices = mark.parentNode.parentNode.children;
  knob.style.transform = 'translateX(' + (mark.offsetLeft - 14 - (knob.offsetWidth - mark.offsetWidth) / 2) + 'px)';
  for (var i = 0; i < choices.length; i++) {
    if (choices[i].classList.contains('currentchoice')) choices[i].classList.remove('currentchoice');
  }
  mark.parentNode.classList.add('currentchoice');
  switch (mark.parentNode) {
    case choiceAxisNone:
      rotateLock = '';
      break;
    case choiceAxisX:
      rotateLock = 'x';
      break;
    case choiceAxisY:
      rotateLock = 'y';
      break;
    case choiceAxisZ:
      rotateLock = 'z';
      break;
    case choicePopoutNone:
      popoutMode('default');
      break;
    case choicePopoutOpaque:
      popoutMode('opaque');
      break;
    case choicePopoutCollapsed:
      popoutMode('collapsed');
      break;
    case choicePopoutGone:
      popoutMode('disabled');
      break;
  }
}
 //Functions for the second multiple-choice "popout mode" button;
function popoutMode(activeChoice) {
  container3D.classList.add(activeChoice);
  if (activeChoice != 'default') container3D.classList.remove('default');
  if (activeChoice != 'opaque') container3D.classList.remove('opaque');
  if (activeChoice != 'collapsed') container3D.classList.remove('collapsed');
  if (activeChoice != 'disabled') container3D.classList.remove('disabled');
}
//du bist mal wieder so unreif
