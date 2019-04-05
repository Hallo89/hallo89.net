var banner;

function getCookie(name) {
  const list = document.cookie.match('(?:;\\s*|^)' + name + '=(.+?)(?:;|$)');
  return list != null ? list[1] : null;
}

//Check whether cookies have already been accepted
window.addEventListener('load', function() {
  banner = document.getElementById('cookiebanner');
  if (getCookie('acceptedCookies') == 'true') {
    banner.classList.add('gone');
    banner.classList.remove('invisible');
  } else {
    banner.classList.remove('invisible');
  }
});

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
}
