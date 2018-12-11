var tipTimer; //The timeout instance for the current active tooltip

const tooltipTrigger = document.querySelectorAll('.tipper'); //All elements which trigger a tooltip (which are '.input_box'es)
const tooltips = document.querySelectorAll('.tooltip.default'); //All (default) tooltips

//The crement buttons attached to input[type=number]
const buttonsChangeNumber = document.querySelectorAll('.buttons_change_number');
const buttonsIncrement = document.querySelectorAll('.change_number.increment');
const buttonsDecrement = document.querySelectorAll('.change_number.decrement');

//The utility buttons, meaning the window controls at the top right of the tool
const buttonMinimize = document.querySelector('.util_button.button_smallscreen');
const buttonMaximize = document.querySelector('.util_button.button_fullscreen');
const buttonClose = document.querySelector('.util_button.button_close');

const inputsToggle = document.querySelectorAll('.input.toggle'); //The common toggle switches

//Event-listeners which do stuff - ForEach not valid due to IE support
 //Procedure of tooltips showing and hiding when the mouse has entered or left the specified area
for (var i = 0; i < tooltipTrigger.length; i++) {
  tooltipTrigger[i].addEventListener('mouseenter', tooltipIn);
  tooltipTrigger[i].addEventListener('mouseleave', tooltipOut);
}

for (var i = 0; i < buttonsIncrement.length; i++) {
  buttonsIncrement[i].addEventListener('click', inputIncrement);
}
for (var i = 0; i < buttonsDecrement.length; i++) {
  buttonsDecrement[i].addEventListener('click', inputDecrement);
}
for (var i = 0; i < buttonsChangeNumber.length; i++) {
  buttonsChangeNumber[i].addEventListener('wheel', inputNumberScroll);
}

for (var i = 0; i < inputsToggle.length; i++) {
  inputsToggle[i].addEventListener('click', toggleSwitches);
}

buttonMinimize.addEventListener('click', minimizeTool);
buttonMaximize.addEventListener('click', maximizeTool);
buttonClose.addEventListener('click', closeTool);

 //Fires when the page is loaded, and unlike onload, also when it's loaded from cache
window.onpageshow = function() {
  if (document.body.classList.contains('closing')) document.body.classList.remove('closing');
}

//Iterating through every tooltip, attaching their clip-path properties which are based on their individual width
for (i = 0; i < tooltips.length; i++) {
  tooltips[i].style.clipPath = 'polygon(-5px 150%, 13px -50%, ' + (tooltips[i].offsetWidth + 5) + 'px -50%, ' + (tooltips[i].offsetWidth - 13) + 'px 150%)';
}

//Functions for the utility buttons
function minimizeTool() {
  if (!this.classList.contains('active')) {
    document.body.classList.remove('fullscreen');
  	buttonMaximize.classList.remove('active');
  	this.classList.add('active');
  }
}
function maximizeTool() {
  if (!this.classList.contains('active')) {
    document.body.classList.add('fullscreen');
    document.body.classList.add('delayfull');
  	buttonMinimize.classList.remove('active');
  	this.classList.add('active');
    setTimeout(function() {
      document.body.classList.remove('delayfull');
    }, 250);
  }
}
function closeTool() {
  document.body.classList.add('closing');
  setTimeout(function() {
    window.location = '..';
  }, 400);
}

//Tooltips when having hovered over specific elements (attached with `.tipper`) for a specific amount of time
function tooltipIn() {
  const target = this;
  tipTimer = setTimeout(function() {
    target.classList.add('active_tip');
  }, 700);
}
function tooltipOut() {
  clearTimeout(tipTimer);
  this.classList.remove('active_tip');
}

//Toggle inputs being activated/deactivated
function toggleSwitches() {
  this.classList.toggle('active');
}

//Increment / decrement of input[type=number] on the specific buttons - global for all input[type=number]
function inputIncrement() {
  const target = this.parentNode.parentNode.children[0];
  target.value++;
  target.focus();
}
function inputDecrement() {
  const target = this.parentNode.parentNode.children[0];
  target.value--;
  target.focus();
}
function inputNumberScroll(e) {
  const scrollY = e.deltaY;
  if (scrollY == 0) {
    return;
  }
  const target = this.parentNode.children[0];
  if (scrollY > 0) {
    target.value--;
  } else if (scrollY < 0) {
    target.value++;
  }
  target.focus();
}
