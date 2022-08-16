const hasAcceptedCookies = getCookie('acceptedCookies');
const cookieBannerNode = (function() {
  const node = document.createElement('div');
  node.innerHTML =
    '<aside id="cookiebanner">' +
      '<span class="background"></span>' +
      '<div class="description">' +
        'This site uses cookies by Cloudflare and this very banner. By continuing to use it, you agree to them.' +
      '</div>' +
      '<button type="button" onclick="hideCookieBanner()">Alrighty!</button>' +
    '</aside>';
  return node.firstChild;
})();

window.addEventListener('load', function() {
  // Add a custom href to the buttons in component boxes (since anchors can't be nested)
  const componentBoxes = document.querySelectorAll('.gbl-box.gbl-components');
  for (var i = 0; i < componentBoxes.length; i++) {
    const quickLinkBtns = componentBoxes[i].querySelectorAll('.quick-links button');

    for (var n = 0; n < quickLinkBtns.length; n++) {
      quickLinkBtns[n].addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = this.dataset.href;
      });
    }
  }

  // Add the cookie banner if cookies haven't been accepted
  if (hasAcceptedCookies !== 'true') {
    document.body.insertBefore(cookieBannerNode, document.body.children[0]);
  }
});

function getCookie(name) {
  const list = document.cookie.match('(?:;\\s*|^)' + name + '=(.+?)(?:;|$)');
  return list != null ? list[1] : null;
}

function hideCookieBanner() {
  cookieBannerNode.classList.add('removing');
  setTimeout(function() {
    cookieBannerNode.classList.add('removing2');
    setTimeout(function() {
      cookieBannerNode.classList.add('removing3');
      setTimeout(function() {
        cookieBannerNode.classList.add('gone');
      }, 200);
    }, 100);
  }, 340);

  document.cookie = 'acceptedCookies=true; path=/; secure; SameSite=strict';

  this.removeEventListener('click', hideCookieBanner);
}
