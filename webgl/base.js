const inputs = document.querySelector('.inputs');

const crementButtonsUp = document.querySelectorAll('.crement.plus');
const crementButtonsDown = document.querySelectorAll('.crement.minus');
const crementContainer = document.querySelectorAll('.crement_buttons');

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
window.addEventListener('mousemove', handleMouseMove);


function handleMouseMove(e) {
  if (e.y <= 90 && !document.body.classList.contains('expanded')) {
    document.body.classList.add('expanded');
  } else if (e.y > 90 && document.body.classList.contains('expanded')) {
    document.body.classList.remove('expanded');
  }
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
