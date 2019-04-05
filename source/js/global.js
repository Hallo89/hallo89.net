const html = document.documentElement;
const banner = document.getElementById('cookiebanner');
const modes = document.getElementById('modes');

function getCookie(name) {
  const list = document.cookie.match('(?:;\\s*|^)' + name + '=(.+?)(?:;|$)');
  return list != null ? list[1] : null;
}

//Set the theme according to the cookie 'theme' on startup (but only if cookies have been accepted)
(function() {
  const themeCookie = getCookie('theme');
  if (themeCookie && getCookie('acceptedCookies') == 'true') {
    toggleMode(themeCookie, true);
  }
})();

//Check whether cookies have already been accepted
(function() {
  if (getCookie('acceptedCookies') == 'true') {
    banner.classList.add('gone');
    banner.classList.remove('invisible');
  } else {
    banner.classList.remove('invisible');
  }
})();
function hideBanner() {
  banner.classList.add('removing');
  setTimeout(function() {
    banner.classList.add('removing2');
    setTimeout(function() {
      banner.classList.add('removing3');
      setTimeout(function() {
        banner.classList.add('gone');
      }, 200);
    }, 80);
  }, 450);
  document.cookie = 'acceptedCookies=true';
  if (!getCookie('theme')) {
    document.cookie = 'theme=dark';
  } else {
    toggleMode(getCookie('theme'), true);
  }
}

function toggleMode(mode, accepted) {
  if (mode) {
    if (mode == 'dark') html.classList.remove('light-mode');
    html.classList.add(mode + '-mode');
  } else {
    html.classList.toggle('light-mode');
  }
  if (accepted || getCookie('acceptedCookies') == 'true') {
    document.cookie = mode || html.classList.contains('light-mode') ? 'theme=light' : 'theme=dark';
  }
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
