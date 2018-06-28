var randomNumbers = '';
var mouseState = 0;
var x = 1;
var y = 1;
var z = 1;
var range = 325;
var rangeScale = 50;
var scaleFactor = ((rangeScale + 10) / 3).toFixed(3);
var cubeState;
var lockedRangeX;
var lockedRangeY;
var lockedRangeZ;
var lockedRangeNav;
var reader = new FileReader();
var indexMarker1 = 0;
var indexMarker2;
var currentLength;
var elements = [];
var updateLock = true;
var transformsPlusX = '';
var transformsPlusY = '';
var transformsPlusZ = '';
var quantityScale = '';
var translates = '';
var SliderLock = false;
var ScaleLock = false;
var mouseStateNav = -1;
var clickedX;
var clickedY;
var distanceX;
var distanceY;
var translateX = 0;
var translateY = 0;
var boxesArray = [];
const masterContainer = document.getElementById('containers');

const boxes = document.querySelectorAll('.box');

const amount = document.getElementById('figures_amount');
const start = document.getElementById('figures_start');
const end = document.getElementById('figures_end');
const aftercomma = document.getElementById('figures_aftercomma');

const buttonAppend = document.getElementById('figures_append');

const buttonAxisX = document.querySelector('.axisbutton.x');
const buttonAxisY = document.querySelector('.axisbutton.y');
const buttonAxisZ = document.querySelector('.axisbutton.z');
const buttonAxes = document.querySelector('.axesvisibility');
const buttonQuantity = document.querySelector('.qualityquantity');
const buttonGrid = document.querySelector('.bottomgridvisibility');
const buttonFun = document.querySelector('.funbutton');
const rotateSlider = document.querySelector('.slider.rotate');
const rotateSliderKnob = document.querySelector('.slider.rotate .knob');
const rotateSliderKnobX = document.querySelector('.slider.rotate .knob.rotate_knob.x');
const rotateSliderKnobY = document.querySelector('.slider.rotate .knob.rotate_knob.y');
const rotateSliderKnobZ = document.querySelector('.slider.rotate .knob.rotate_knob.z');
const scaleSlider = document.querySelector('.slider.scale');
const scaleSliderKnob = document.querySelector('.slider.scale .knob');

const containerError = document.querySelector('.error_banner');
const errorInput = document.querySelector('.error_banner .error');

const fileInput = document.getElementById('input_json');
const fileLabel = document.getElementById('input_json_label');

const boundaryCorner1 = document.querySelector('.boundary_container .corners .corner_1');
const boundaryCorner2 = document.querySelector('.boundary_container .corners .corner_2');
const boundaryCorner3 = document.querySelector('.boundary_container .corners .corner_3');
const boundaryCorner4 = document.querySelector('.boundary_container .corners .corner_4');
const boundaryCorner5 = document.querySelector('.boundary_container .corners .corner_5');
const boundaryCorner6 = document.querySelector('.boundary_container .corners .corner_6');
const boundaryCorner7 = document.querySelector('.boundary_container .corners .corner_7');
const boundaryCorner8 = document.querySelector('.boundary_container .corners .corner_8');
const boundaryStripes1 = document.querySelectorAll('.boundary_container .corners .stripe_1');
const boundaryStripes2 = document.querySelectorAll('.boundary_container .corners .stripe_2');
const boundaryStripes3 = document.querySelectorAll('.boundary_container .corners .stripe_3');
const boundaryFacesFront = document.querySelectorAll('.boundary_container .corners .front');
const boundaryFacesBehind = document.querySelectorAll('.boundary_container .corners .behind');
const boundaryFacesLeft = document.querySelectorAll('.boundary_container .corners .left');
const boundaryFacesRight = document.querySelectorAll('.boundary_container .corners .right');
const boundaryFacesTop = document.querySelectorAll('.boundary_container .corners .top');
const boundaryFacesBottom = document.querySelectorAll('.boundary_container .corners .bottom');

const axesFacesFront = document.querySelectorAll('#axes_container .front');
const axesFacesBehind = document.querySelectorAll('#axes_container .behind');
const axesFacesLeft = document.querySelectorAll('#axes_container .left');
const axesFacesRight = document.querySelectorAll('#axes_container .right');
const axesFacesTop = document.querySelectorAll('#axes_container .top');
const axesFacesBottom = document.querySelectorAll('#axes_container .bottom');

const containerAxesX = document.querySelector('#axes_container .axes_x');
const containerAxesY = document.querySelector('#axes_container .axes_y');
const containerAxesZ = document.querySelector('#axes_container .axes_z');
const containerAxes = document.getElementById('axes_container');
const containerBounds = document.querySelector('.boundary_container');
const containerBounds2D = document.querySelector('.boundary_container_2d');
const containerElements = document.querySelector('.elements_container');
const containerGrid = document.querySelector('.boundary_container .bottom_grid');
const container3D = document.getElementById('content_function_2');
const figuresOutput = document.getElementById('function_1');
const output3D = document.getElementById('function_2');

const rotateRect = rotateSlider.getBoundingClientRect();
const container3DRect = container3D.getBoundingClientRect();
window.addEventListener('mousedown', down);
window.addEventListener('mouseup', up);
window.addEventListener('mousemove', movingRotateSlider);
window.addEventListener('mousemove', movingScaleSlider);
container3D.addEventListener('mousemove', navigate);
container3D.addEventListener('mousedown', navigateMouseDown);
container3D.addEventListener('contextmenu', handleContext);
rotateSlider.addEventListener('mousedown', rotateSliderClick);
scaleSlider.addEventListener('mousedown', scaleSliderClick);
fileInput.addEventListener('change', getJSON);
for (i = 0; i < boxes.length; i++) { //ForEach not valid due to IE support
  boxes[i].addEventListener('mousedown', choseItem);
}
function choseItem() {
  let thisRect = this.getBoundingClientRect();
  let styles = window.getComputedStyle(masterContainer);
// convert nodeList of all boxes to an array
  for (i = 0; i < boxes.length; i++) {
    boxesArray.push(boxes[i]);
  }
  if (boxesArray.indexOf(this) >= -1) {
    boxesArray.splice(boxesArray.indexOf(this), 1);
  }
//end of converting
  for (i = 0; i < boxesArray.length; i++) {
    boxesArray[i].classList.add('nodisplay');
  }
  this.classList.add('active_item')
  //setTimeout(function() {
  //  document.body.classList.remove('info_mode');
  //}, 400);
  document.body.classList.remove('info_mode');
}
function handleContext(e) {
  e.preventDefault();
}
function navigateMouseDown(e) {
  mouseStateNav = e.button;
  clickedX = e.x - container3DRect.left;
  clickedY = e.y - container3DRect.top;
  lockedRangeNav = range;
  document.body.classList.add('noselect');
}
function navigate(e) {
  if (mouseState <= 0 || mouseStateNav < 0) {
    return;
  }
  distanceX = e.x - container3DRect.left - clickedX;
  distanceY = e.y - container3DRect.top - clickedY;
  if (mouseStateNav == 0) {
    if (buttonFun.classList.contains('active')) {
      transformsPlusY = 'rotate3d(0, 1, 0, ' + (lockedRangeNav - distanceX) + 'deg)';
      transformsPlusX = 'rotate3d(1, 0, 0, ' + (lockedRangeNav - distanceY) + 'deg)';
    }
    else {
      range = lockedRangeNav - distanceX;
    }
  }
  if (mouseStateNav == 2) {
    if (buttonFun.classList.contains('active')) {
      translateX += distanceX;
      translateY += distanceY;
      translates = 'translateX(' + translateX + 'px) translateY(' + translateY + 'px)';
    }
    else {
      translates = 'translateX(' + distanceX + 'px) translateY(' + distanceY + 'px)';
    }
  }
  updateCube();
}
function getJSON() {
  let keyFile = fileInput.files[0];
  fileLabel.innerHTML = 'Browse... ➤ ' + keyFile.name;
  reader.readAsText(keyFile);
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
/*        //minify it
    while (fileContent.indexOf('\n') >= 0) {
      fileContent = fileContent.replace('\n', '');
    }
    while (fileContent.indexOf('	') >= 0) {
      fileContent = fileContent.replace('	', '');
    }
    while (indexMarker1 >= 0) {
      indexMarker2 = fileContent.indexOf('"', indexMarker1 + 1);
      let fragContent = fileContent.slice(indexMarker1 + 1, indexMarker2);
      let startContent = fileContent.slice(0, indexMarker1 + 1);
      let endContent = fileContent.slice(indexMarker2);
      while (fragContent.indexOf(' ') >= 0) {
        fragContent = fragContent.replace(' ', '');
      }
      currentLength = (startContent + fragContent).length;
      fileContent = startContent + fragContent + endContent;
      indexMarker1 = fileContent.indexOf('"', currentLength + 1);
    }*/
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
    if (updateLock == true) {
      range++;
      updateCube();
      updateLock = false;
    }
    mouseState = 0; //normalize mouseState because it detects a button constantly pressed after a file is chosen (¯\_(ツ)_/¯)
  }
}
function down() {
  mouseState++;
}
function up() {
  mouseState--;
  SliderLock = false;
  ScaleLock = false;
  mouseStateNav = -1;
  document.body.classList.remove('noselect');
}
function randomNumber() {
  let valueAmount = parseInt(amount.value);
  let valueStart = parseInt(start.value);
  let valueEnd = parseInt(end.value);
  let valueAftercomma = parseInt(aftercomma.value);
  let valueLength = valueEnd - valueStart;
  if (!buttonAppend.classList.contains('active')) {
    randomNumbers = "";
    figuresOutput.innerHTML = '';
  }
  for (var i = 0; i < valueAmount; i++) {
    randomNumbers += '<span>' + (valueLength*Math.random() + valueStart).toFixed(valueAftercomma) + '</span>';
  }
  figuresOutput.innerHTML = randomNumbers;
}
function toggleRandomMode() {
  buttonAppend.classList.toggle('active');
}
function toggleAxisX() {
  lockedRangeX = range;
  buttonAxisX.classList.toggle('active');
  containerAxesX.classList.toggle('nodisplay');
  if (!buttonAxisX.classList.contains('active')) {
    //rotateSliderKnobX.style.transform = 'translateX(' + lockedRangeX + 'px)';
    rotateSliderKnobX.style.transform = 'translateX(0)';
  }
  rotateSliderKnobX.classList.toggle('nodisplay');
  //transformsPlusX = 'rotate3d(1, 0, 0, ' + lockedRangeX + 'deg)';
  if (buttonAxisX.classList.contains('active')) {
    transformsPlusX = '';
  }
  x = switch01(x);
  updateCube();
}
function toggleAxisY() {
  lockedRangeY = range;
  buttonAxisY.classList.toggle('active');
  containerAxesY.classList.toggle('nodisplay');
  if (!buttonAxisY.classList.contains('active')) {
    //rotateSliderKnobY.style.transform = 'translateX(' + lockedRangeY + 'px)';
    rotateSliderKnobY.style.transform = 'translateX(3px)';
  }
  rotateSliderKnobY.classList.toggle('nodisplay');
  //transformsPlusY = 'rotate3d(0, 1, 0, ' + lockedRangeY + 'deg)';
  if (buttonAxisX.classList.contains('active')) {
    transformsPlusY = '';
  }
  y = switch01(y);
  updateCube();
}
function toggleAxisZ() {
  lockedRangeZ = range;
  buttonAxisZ.classList.toggle('active');
  containerAxesZ.classList.toggle('nodisplay');
  if (!buttonAxisZ.classList.contains('active')) {
    //rotateSliderKnobZ.style.transform = 'translateX(' + lockedRangeZ + 'px)';
    rotateSliderKnobZ.style.transform = 'translateX(6px)';
  }
  rotateSliderKnobZ.classList.toggle('nodisplay');
  //transformsPlusZ = 'rotate3d(0, 0, 1, ' + lockedRangeZ + 'deg)';
  if (buttonAxisX.classList.contains('active')) {
    transformsPlusZ = '';
  }
  z = switch01(z);
  updateCube();
}
function toggleAxes() {
  buttonAxes.classList.toggle('active');
  containerAxes.classList.toggle('nodisplay');
  if (buttonAxes.classList.contains('active')) {
    range++;
    updateCube();
  }
}
function toggleQuantity() {
  buttonQuantity.classList.toggle('active');
  containerBounds.classList.toggle('nodisplay');
  containerBounds2D.classList.toggle('nodisplay');
}
function toggleGrid() {
  buttonGrid.classList.toggle('active');
  containerGrid.classList.toggle('nodisplay');
}
function toggleFun() {
  buttonFun.classList.toggle('active');
}
function errorMessage(error) {
  errorInput.innerHTML = error;
  containerError.classList.remove('nodisplay');
  mouseState = 0;
  updateLock = true;
}
//function toggleTranslucentAxes() {
//  document.body.classList.toggle('translucentaxes');
//}
function movingRotateSlider(e) {
  if (mouseState <= 0 || SliderLock == false) {
    return;
  }
  range = e.x - rotateRect.left - 12;
  if (range < 0) {
    range = 0;
  }
  else if (range > 360) {
    range = 360;
  }
  updateCube();
}
function rotateSliderClick(e) {
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
}
function movingScaleSlider(e) {
  if (mouseState <= 0 || ScaleLock == false) {
    return;
  }
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
  updateScale();
  //setTimeout(timeoutScale, 1000);
}
function scaleSliderClick(e) {
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
  quantityScale = 'scale(' + scaleFactor / currentScale + ')';
  updateScale();
  //setTimeout(timeoutScale, 1000);
}
function timeoutScale() {
  quantityScale = '';
  updateCube();
  updateScale();
}
function updateCube() {
  output3D.style.transform = quantityScale + transformsPlusX + transformsPlusY + transformsPlusZ + translates + ' rotate3d(' + x + ', ' + y + ', ' + z + ', ' + range + 'deg)';
  rotateSliderKnob.style.transform = 'translateX(' + range + 'px)';
}
function updateScale() {
  let boundaryScale = scaleFactor * 8;
  let stripesScale = scaleFactor * 2;
  let stripesWidth = stripesScale * 2;
  let axesScale = scaleFactor * 7;
  let axesWidth = axesScale * 2;

  containerElements.style.transform = 'translateX(' + -boundaryScale + 'px) translateZ(' + -boundaryScale + 'px) translateY(' + boundaryScale + 'px)';

  if (!buttonQuantity.classList.contains('active')) {
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
function switch01(value) {
  if (value == 1) {
    return value = 0;
  }
  else {
    return value = 1;
  }
}
