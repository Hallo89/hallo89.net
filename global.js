const html = document.documentElement;
const headline = document.getElementById('headline');
const nav = document.querySelector('.head_nav');
const modes = document.querySelector('.modes');

const headlineRect = headline.getBoundingClientRect();

const shiftCapX = 6;
const shiftCapY = 2;

headline.addEventListener('mousemove', navWiggle);

function navWiggle(e) {
  let left = e.x - headlineRect.left;
  let top = e.y - headlineRect.top;
  let shiftLeft = Math.round((left / headline.offsetWidth * shiftCapX) - (shiftCapX / 2));
  let shiftTop = Math.round((top / headline.offsetHeight * shiftCapY) - (shiftCapY / 2));
  nav.style.transform = 'translateX(' + -shiftLeft + 'px) translateY(' + -shiftTop + 'px)';
}
//theme changer
function toggleMode() {
  html.classList.toggle('dark-mode');
  html.classList.toggle('light-mode');
}
//expand/hide the headline
function toggleHeadline() {
  document.body.classList.toggle('headline_expanded');
}
//theme buttons dropdown
function toggleDropdown() {
  modes.classList.toggle('enabled');
}

window.onclick = function(e) {
  if (modes.classList.contains('enabled') && !e.target.matches([
    '.mode_gear',
    '.dropdown_box',
    '.dropdown_header',
    '.mode_switch'
  ])) {
    modes.classList.remove('enabled');
  }
}
