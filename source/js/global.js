function getCookie(name) {
  const list = document.cookie.match('(?:;\\s*|^)' + name + '=(.+?)(?:;|$)');
  return list != null ? list[1] : null;
}

const hasAccepted = getCookie('acceptedCookies');

//Create the banner element
const banner = (function() {
  const node = document.createElement('div');
  node.innerHTML = '<aside class="glb-box" id="cookiebanner"><b class="background"></b><div class="description box-text">This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them!</div><button type="button" onclick="hideBanner()">Alrighty!</button></aside>';
  return node.firstChild;
})();

if (hasAccepted != 'true') {
  //If no cookie saying that cookies have been accepted is present, append the banner to the body
  window.addEventListener('load', function() {
    document.body.insertBefore(banner, document.body.children[0]);
    setTimeout(function() {
      banner.classList.remove('invisible');
    }, 10);
  });
}

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
  document.cookie = 'acceptedCookies=true; path=/; secure; SameSite=strict';
  this.removeEventListener('click', hideBanner);
}
