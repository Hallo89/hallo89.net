const html = document.documentElement;
var modes;

window.addEventListener('load', function() {
  if (hasAccepted != 'true') {
    banner.children[1].innerHTML = 'This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them!';
    banner.children[2].onclick = hideBannerThemes;
  }
  modes = document.getElementById('modes');
});

//Set the theme according to the cookie 'theme' on startup (but only if cookies have been accepted)
(function() {
  const themeCookie = getCookie('theme');
  if (themeCookie && hasAccepted == 'true') {
    toggleMode(themeCookie);
  }
})();

function hideBannerThemes() {
  hideBanner();
  if (!getCookie('theme')) {
    document.cookie = 'theme=' + (html.classList.contains('light-mode') ? 'light' : 'dark') + '; path=/';
  } else {
    toggleMode(getCookie('theme'));
  }
}

function toggleMode(mode) {
  if (mode) {
    if (mode == 'dark') html.classList.remove('light-mode');
    if (mode == 'light') html.classList.add('light-mode');
  } else {
    html.classList.toggle('light-mode');
  }
  if (!mode && getCookie('acceptedCookies') == 'true') {
    document.cookie = 'theme=' + (html.classList.contains('light-mode') ? 'light' : 'dark') + '; path=/';
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
