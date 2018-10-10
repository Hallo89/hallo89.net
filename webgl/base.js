var sliderLock = null;
var tipTimeout;


const crementButtonsUp = document.querySelectorAll('.crement.plus');
const crementButtonsDown = document.querySelectorAll('.crement.minus');
const crementContainer = document.querySelectorAll('.crement_buttons');

const inputsSlider = document.querySelectorAll('.input_box.slider .input.slider');
const inputsChecker = document.querySelectorAll('.input_box.checker .input.checker');


for (var i = 0; i < crementContainer.length; i++) {
  crementContainer[i].addEventListener('wheel', crementScroll);
}
for (var i = 0; i < crementButtonsUp.length; i++) {
  crementButtonsUp[i].addEventListener('click', increment);
}
for (var i = 0; i < crementButtonsDown.length; i++) {
  crementButtonsDown[i].addEventListener('click', decrement);
}
for (var i = 0; i < inputsChecker.length; i++) {
  inputsChecker[i].addEventListener('click', handleChecker);
}
for (var i = 0; i < inputsSlider.length; i++) {
  inputsSlider[i].addEventListener('mousedown', handleSlider);
  syncSlider(inputsSlider[i]);
}
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);


function handleMouseUp() {
  sliderLock = null;
  document.body.classList.remove('noselect');
}

function handleMouseMove(e) {
  if (e.y <= 90 && !document.body.classList.contains('expanded')) {
    document.body.classList.add('expanded');
  } else if (e.y > 90 && document.body.classList.contains('expanded')) {
    document.body.classList.remove('expanded');
  }
  if (sliderLock != null) {
    executeSlider(e.x);
  }
}

function syncSlider(target) {
  let value = Number(target.dataset.value);
  let maxValue = Number(target.dataset.maxValue);
  let minValue = Number(target.dataset.minValue);
  if (!value && value != 0 || !maxValue && maxValue != 0) {
    return;
  }
  let absoluteWidth = target.getBoundingClientRect().width - 14;
  let distance = !minValue ? absoluteWidth * value / maxValue : absoluteWidth * (value - minValue) / (maxValue - minValue);
  target.children[0].style.transform = 'translateX(' + distance + 'px)';
}

function recomputeSlider(target, newMax) {
  target.dataset.value = newMax / (Number(target.dataset.maxValue) / Number(target.dataset.value));
  target.dataset.maxValue = newMax;
}

function executeSlider(clickedX) {
  let rect = sliderLock.getBoundingClientRect();
  let tip = sliderLock.children[1];
  let endValue;
  let distance = clickedX - rect.left - 7;
  if (distance < 0) {
    distance = 0;
  } else if (distance > rect.width - 14) {
    distance = rect.width - 14;
  }
  clearTimeout(tipTimeout);
  tip.classList.remove('hidden');
  tipTimeout = setTimeout(function () {
    tip.classList.add('hidden');
  }, 250);
  distance = Math.round(distance);
  //set the slider knob
  sliderLock.children[0].style.transform = 'translateX(' + distance + 'px)';
  let value = Number(sliderLock.dataset.value);
  let maxValue = Number(sliderLock.dataset.maxValue);
  let minValue = Number(sliderLock.dataset.minValue);
  let comma = Number(sliderLock.dataset.comma);
  let funct = sliderLock.dataset.function;
  //compute the value based on the max value, min value, if specified, else 0, in the boundaries of the slider length
  endValue = !minValue ? maxValue * distance / (rect.width - 14) : (maxValue - minValue) * distance / (rect.width - 14) + minValue;
  //if a comma-data-attribute is specified, limit the figures after comma to this, else 1
  endValue = !comma && comma != 0 ? endValue.toFixed(1) : endValue.toFixed(comma);
  if (value == endValue) {
    return;
  }
  sliderLock.dataset.value = endValue;
  if (funct == 'triangledraw') {
    fixedDraw();
  } else if (funct == 'cubedraw') {
    draw();
  }
  tip.innerHTML = endValue;
  if (distance >= rect.width - tip.clientWidth - 14 && tip.classList.contains('right') || distance <= tip.clientWidth && tip.classList.contains('left')) {
    tip.classList.toggle('right');
    tip.classList.toggle('left');
  }
}

function handleSlider(e) {
  document.body.classList.add('noselect');
  if (e.target.classList.contains('slider_knob') || e.target.classList.contains('slider_tooltip')) {
    sliderLock = e.target.parentNode;
  } else {
    sliderLock = e.target;
  }
  executeSlider(e.x);
}

function handleChecker() {
  this.parentNode.classList.toggle('active');
}

function increment() {
  const input = this.parentNode.previousElementSibling;
  if (input.max != '' && parseInt(input.value) < parseInt(input.max)) {
    input.value++;
  } else if (input.max == '') {
    input.value++;
  }
  input.focus();
  if (input.classList.contains('rgb')) {
    rgbChange();
  }
}
function decrement() {
  const input = this.parentNode.previousElementSibling;
  if (input.min != '' && parseInt(input.value) > parseInt(input.min)) {
    input.value--;
  } else if (input.min == '') {
    input.value--;
  }
  input.focus();
  if (input.classList.contains('rgb')) {
    rgbChange();
  }
}
function crementScroll(e) {
  let scrollY = e.deltaY;
  if (scrollY != 0) {
    const input = this.parentNode.children[0];
    if (scrollY > 0) {
      if (input.min != '' && parseInt(input.value) > parseInt(input.min)) {
        input.value--;
      } else if (input.min == '') {
        input.value--;
      }
    } else if (scrollY < 0) {
      if (input.max != '' && parseInt(input.value) < parseInt(input.max)) {
        input.value++;
      } else if (input.max == '') {
        input.value++;
      }
    }
    input.focus();
    if (input.classList.contains('rgb')) {
      rgbChange();
    }
  }
}
