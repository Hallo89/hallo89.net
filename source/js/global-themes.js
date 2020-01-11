const html = document.documentElement;
var modes;
var modeChildren;

window.addEventListener('load', function() {
  if (hasAccepted != 'true') {
    banner.children[1].innerHTML = 'This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them!';
    banner.children[2].onclick = hideBannerThemes;
  }
  modes = document.getElementById('modes');
  modeChildren = enlistChildren(modes);
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
  if (!modes.classList.contains('enabled')) window.removeEventListener('click', hideDropdown);
  else if (modes.classList.contains('enabled')) window.addEventListener('click', hideDropdown);
}

function hideDropdown(e) {
  if (modeChildren.indexOf(e.target) == -1) {
    modes.classList.remove('enabled');
    window.removeEventListener('click', hideDropdown);
  }
}

function enlistChildren(node, arr) {
  if (arr == null) arr = new Array();
  for (var i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    arr.push(child);
    if (child.children.length) arr = enlistChildren(child, arr);
  }
  return arr;
}
