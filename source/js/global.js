const html = document.documentElement;
const headline = document.getElementById('navbar');
const modes = document.getElementById('modes');

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
