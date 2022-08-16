window.addEventListener('load', function() {
  if (hasAcceptedCookies != 'true') {
    cookieBannerNode.children[1].textContent =
      'This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them.';
    cookieBannerNode.children[2].addEventListener('click', handleThemes);
  }
  document.querySelector('#modes button.mode-switch').addEventListener('click', function() {
    toggleTheme();
  });
});

//Set the theme according to the cookie 'theme' on startup (but only if cookies have been accepted)
(function() {
  const preferredTheme = getCookie('theme');
  if (preferredTheme && hasAcceptedCookies === 'true') {
    toggleTheme(preferredTheme);
  }
})();

function handleThemes() {
  const preferredTheme = getCookie('theme');
  if (!preferredTheme) {
    setThemeCookie();
  } else {
    toggleTheme(preferredTheme);
  }
  this.removeEventListener('click', handleThemes);
}

function toggleTheme(mode) {
  const rootNode = document.documentElement;

  if (mode != null) {
    if (mode === 'light') {
      rootNode.classList.add('light-mode');
    } else if (mode === 'dark') {
      rootNode.classList.remove('light-mode');
    }
  } else {
    rootNode.classList.toggle('light-mode');
  }
  if (getCookie('acceptedCookies') === 'true') {
    setThemeCookie();
  }
}

function setThemeCookie() {
  document.cookie =
    'theme=' + (document.documentElement.classList.contains('light-mode') ? 'light' : 'dark') + '; path=/; secure; SameSite=strict';
}
