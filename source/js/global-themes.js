const html = document.documentElement;
var modes;

window.addEventListener('load', function() {
  if (hasAccepted != 'true') {
    banner.children[1].textContent = 'This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them!';
    banner.children[2].addEventListener('click', handleThemes);
  }
  modes = document.getElementById('modes');
  modes.addEventListener('click', toggleMode);
});

//Set the theme according to the cookie 'theme' on startup (but only if cookies have been accepted)
(function() {
  const themeCookie = getCookie('theme');
  if (themeCookie && hasAccepted == 'true') {
    toggleMode(themeCookie);
  }
})();

function handleThemes() {
  const themeCookie = getCookie('theme');
  if (!themeCookie) {
    setThemeCookie();
  } else {
    toggleMode(themeCookie);
  }
  this.removeEventListener('click', handleThemes);
}

function toggleMode(mode) {
  if (mode && mode != event) {
    if (mode == 'light') html.classList.add('light-mode');
    else if (mode == 'dark') html.classList.remove('light-mode');
  } else html.classList.toggle('light-mode');
  if (getCookie('acceptedCookies') == 'true') setThemeCookie();
}

function setThemeCookie() {
  document.cookie = 'theme=' + (html.classList.contains('light-mode') ? 'light' : 'dark') + '; path=/';
}
