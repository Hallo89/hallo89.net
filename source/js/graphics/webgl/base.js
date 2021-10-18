const toolbar = document.querySelector('.toolbar');

const crementBtnsUp = document.querySelectorAll('.crement.plus');
const crementBtnsDown = document.querySelectorAll('.crement.minus');
const crementContainer = document.getElementsByClassName('crement_buttons');

const inputsChecker = document.querySelectorAll('.input_box.checker .input.checker');


for (l of crementContainer) l.addEventListener('wheel', crementScroll);
for (l of crementBtnsUp) l.addEventListener('click', increment);
for (l of crementBtnsDown) l.addEventListener('click', decrement);
for (l of inputsChecker) l.addEventListener('click', handleChecker);

setTimeout(function() {
  window.addEventListener('mousemove', handleMouseMove);
}, 1000);


function handleMouseMove(e) {
  if (e.y <= toolbar.clientHeight + 20 && !document.body.classList.contains('expanded')) {
    document.body.classList.add('expanded');
  } else if (e.y > toolbar.clientHeight + 20 && document.body.classList.contains('expanded')) {
    document.body.classList.remove('expanded');
  }
}

function handleChecker() {
  this.parentNode.classList.toggle('active');
}

function increment() {
  const input = this.parentNode.previousElementSibling;
  if (input.max != '' && parseInt(input.value) < parseInt(input.max) || input.max == '') input.value++;
  input.focus();
  if (input.classList.contains('rgb')) rgbChange();
}
function decrement() {
  const input = this.parentNode.previousElementSibling;
  if (input.min != '' && parseInt(input.value) > parseInt(input.min) || input.min == '') input.value--;
  input.focus();
  if (input.classList.contains('rgb')) rgbChange();
}
function crementScroll(e) {
  const scrollY = e.deltaY;
  if (scrollY != 0) {
    const input = this.parentNode.children[0];
    if (scrollY > 0) {
      if (input.min != '' && parseInt(input.value) > parseInt(input.min) || input.min == '') input.value--;
    } else if (scrollY < 0) {
      if (input.max != '' && parseInt(input.value) < parseInt(input.max) || input.max == '') input.value++;
    }
    input.focus();
    if (input.classList.contains('rgb')) rgbChange();
  }
}
