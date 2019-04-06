const html = document.documentElement;
var modes;

window.addEventListener('load', function() {
  banner.children[1].innerHTML = 'This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them!';
  banner.children[2].onclick = hideBannerThemes;
  modes = document.getElementById('modes');
});

//Set the theme according to the cookie 'theme' on startup (but only if cookies have been accepted)
(function() {
  const themeCookie = getCookie('theme');
  if (themeCookie && getCookie('acceptedCookies') == 'true') {
    toggleMode(themeCookie, true);
  }
})();

function hideBannerThemes() {
  hideBanner();
  if (!getCookie('theme')) {
    document.cookie = html.classList.contains('light-mode') ? 'theme=light' : 'theme=dark';
  } else {
    toggleMode(getCookie('theme'), true);
  }
}

function toggleMode(mode, accepted) {
  if (mode) {
    if (mode == 'dark') html.classList.remove('light-mode');
    if (mode == 'light') html.classList.add(mode + '-mode');
  } else {
    html.classList.toggle('light-mode');
  }
  if (accepted || getCookie('acceptedCookies') == 'true') {
    if (mode) {
      document.cookie = 'theme=' + mode;
    } else {
      document.cookie = html.classList.contains('light-mode') ? 'theme=light' : 'theme=dark';
    }
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
