var boxesArray = []; //Holding the '.box' items after they have been converted from a nodeList to an array
var timeoutLock = true;

const boxes = document.querySelectorAll('.box'); //all boxes
const tooltipTrigger = document.querySelectorAll('.tipper'); //all elements which trigger a tooltip (which are '.input_box'es)
const tooltips = document.querySelectorAll('.tooltip'); //all tooltips

const containersInput = document.querySelectorAll('.input_container'); //all '.input_container's

const buttonsChangeNumber = document.querySelectorAll('.buttons_change_number'); //All containers for the increment/decrement buttons - used by scroll
const buttonsIncrement = document.querySelectorAll('.change_number.increment'); //All increment-buttons for input[type=number]
const buttonsDecrement = document.querySelectorAll('.change_number.decrement'); //All decrement-buttons for input[type=number]

//Event-listeners which do stuff - ForEach not valid due to IE support
 //Execution of the procedure of choosing an item in the main menu
for (i = 0; i < boxes.length; i++) {
  boxes[i].addEventListener('mousedown', choseItem);
}
 //Procedure of tooltips showing and hiding when the mouse has entered or left the specified area
for (i = 0; i < tooltipTrigger.length; i++ ) {
  tooltipTrigger[i].addEventListener('mouseenter', tooltipIn);
  tooltipTrigger[i].addEventListener('mouseleave', tooltipOut);
}
 //Incrementing the specific input after the increment button has been pressed
for (i = 0; i < buttonsIncrement.length; i++) {
  buttonsIncrement[i].addEventListener('mousedown', inputIncrement);
}
 //Decrementing the specific input after the decrement button has been pressed
for (i = 0; i < buttonsDecrement.length; i++) {
  buttonsDecrement[i].addEventListener('mousedown', inputDecrement);
}
 //Adding an eventListener for a trigger of the scroll wheel on the increment/decrement buttons
for (i = 0; i < buttonsChangeNumber.length; i++) {
  buttonsChangeNumber[i].addEventListener('wheel', inputNumberScroll);
}

//functions to execute on pageload
window.onload = function onload() {
  computeTooltips();
}

//activation of the clicked item in the main menu
function choseItem() {
// convert nodeList of all boxes to an array -> boxesArray
  for (i = 0; i < boxes.length; i++) {
    boxesArray.push(boxes[i]);
  }
  if (boxesArray.indexOf(this) >= -1) {
    boxesArray.splice(boxesArray.indexOf(this), 1);
  }
//end of converting
  document.body.classList.add('noselect');
  for (i = 0; i < boxesArray.length; i++) {
    boxesArray[i].classList.add('nodisplay');
  }
  this.classList.add('active_item');
  this.children[2].classList.add('nodisplay'); //info_description
  document.body.classList.remove('info_mode');

  container3D.addEventListener('mousemove', navigate);
  container3D.addEventListener('mousedown', navigateMouseDown);
  //container3D.addEventListener('mouseup', navigateMouseUp);
  container3D.addEventListener('wheel', navigateWheel);

  for (i = 0; i < boxes.length; i++) {
    boxes[i].removeEventListener('mousedown', choseItem);
  }
}

//Tooltips when having hovered over a specific element (most-likely every input_box) for a specific amount of time
 //Execution of the procedure once the mouse has entered the target
function tooltipIn() {
  timeoutLock = true;
  let eventTarget = this;
  setTimeout(function() {
    console.log(timeoutLock);
    if (timeoutLock == true) {
      console.log("true!");
      eventTarget.lastElementChild.classList.remove('nodisplay');
      eventTarget.classList.add('actual_tip');
    }
  }, 800);
}
 //Termination of the procedure once the mouse has exited the target
function tooltipOut() {
  timeoutLock = false;
  let eventTarget = this;
  this.lastElementChild.classList.add('nodisplay');
  setTimeout(function() {
    eventTarget.lastElementChild.classList.add('nodisplay');
    eventTarget.classList.remove('actual_tip');
  }, 800);
}

//computing the right corner of tooltips and placing them
function computeTooltips() {
  document.body.classList.remove('info_mode');
  for (i = 0; i < tooltips.length; i++) {
    tooltips[i].classList.remove('nodisplay');
    thisWidth = tooltips[i].offsetWidth;
    tooltips[i].style.clipPath = 'polygon(-5px 150%, 13px -50%, ' + (thisWidth + 5) + 'px -50%, ' + (thisWidth - 13) + 'px 150%)';
    tooltips[i].classList.add('nodisplay');
  }
  document.body.classList.add('info_mode');
}

//Increment / decrement of input[type=number] on the specific buttons - global for all input[type=number]
 //Execution via a click
function inputIncrement() {
  let thisInput = this.parentNode.parentNode.children[0];
  thisInput.value++;
}
function inputDecrement() {
  let thisInput = this.parentNode.parentNode.children[0];
  thisInput.value--;
}
 //Execution via a scroll wheel event
function inputNumberScroll(e) {
  let scrollY = e.deltaY;
  if (scrollY == 0) {
    return;
  }
  let thisInput = this.parentNode.children[0];
  if (scrollY > 0) {
    thisInput.value--;
  }
  else if (scrollY < 0) {
    thisInput.value++;
  }
  thisInput.focus();
}
