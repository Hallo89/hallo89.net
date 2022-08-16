window.addEventListener('load', function() {
  if (hasAcceptedBanner !== 'true') {
    cookieBannerNode.children[2].addEventListener('click', cookieBannerClickSetTheme);
  }
  document.querySelector('#modes button.mode-switch').addEventListener('click', function() {
    toggleTheme();
  });
});

// Set the theme according to the cookie 'theme' on startup (but only if cookies have been accepted)
(function() {
  const preferredTheme = localStorage.getItem('Global_theme');
  if (preferredTheme && hasAcceptedBanner === 'true') {
    toggleTheme(preferredTheme);
  }
})();

function cookieBannerClickSetTheme() {
  const preferredTheme = localStorage.getItem('Global_theme');
  if (!preferredTheme) {
    setLocalStorageTheme();
  } else {
    toggleTheme(preferredTheme);
  }
  this.removeEventListener('click', cookieBannerClickSetTheme);
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
  if (localStorage.getItem('Global_acceptedBanner') === 'true') {
    setLocalStorageTheme();
  }
}

function setLocalStorageTheme() {
  localStorage.setItem('Global_theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
}
