const headline = document.getElementById('headline');
const nav = document.getElementById('head_nav');
//but why
//The solution for the hack to position a relative element vertically centered, which is top: 50%; transform: translateY(-50%); -> checks whether css grid is supported, if it's not (which is when the hack should be active), replace the modular translateY with the static one for the hack
//Tho I am experimentally using a static top value
//const checkCSSGrid = document.createElement('div');
//checkCSSGrid.style.display = 'grid';
const shiftCapX = 6;
const shiftCapY = 2;
headline.addEventListener('mousemove', navWiggle);
function navWiggle(e) {
  const rect = this.getBoundingClientRect();
  let left = e.x - rect.left;
  let top = e.y - rect.top;
  let shiftLeft = Math.round((left / headline.offsetWidth * shiftCapX) - (shiftCapX / 2));
  let shiftTop = Math.round((top / headline.offsetHeight * shiftCapY) - (shiftCapY / 2));
  /*if (checkCSSGrid.style.display == 'grid') {*/
    nav.style.transform = 'translateX(' + -shiftLeft + 'px) translateY(' + -shiftTop + 'px)';
/*  }
  else {
    nav.style.transform = 'translateX(' + -shiftLeft + 'px) translateY(-50%)';
    console.log("ok2");
  }*/
}
//theme changer
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
}
//expand/hide the headline
function toggleHeadline() {
  document.body.classList.toggle('headline_expanded');
}
//theme buttons dropdown
function toggleDropdown() {
  document.getElementById('modes').classList.toggle('enabled');
  window.onclick = function(event) {
    if (!event.target.matches (
      [
        '.mode_gear',
        '.dropdown_box',
        '.dropdown_header',
        '.dropdown_header_text',
        '.mode_switch'
      ]
    ))
    {
      if (document.getElementById('modes').classList.contains('enabled')) {
        document.getElementById('modes').classList.remove('enabled');
      }
    }
  }
}
