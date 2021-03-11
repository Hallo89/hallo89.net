const hasAccepted = getCookie('acceptedCookies');
const banner = (function() {
  const node = document.createElement('div');
  node.innerHTML =
    '<aside id="cookiebanner">' +
      '<span class="background"></span>' +
      '<div class="description">' +
        'This site uses cookies by Cloudflare and this very banner. By continuing to use it, you agree to them.' +
      '</div>' +
      '<button type="button" onclick="hideBanner()">Alrighty!</button>' +
    '</aside>';
  return node.firstChild;
})();

window.addEventListener('load', function() {
  //add a custom href to the buttons in component boxes (since anchors can't be nested)
  const componentBoxes = document.querySelectorAll('.gbl-box.gbl-components');
  for (var i = 0; i < componentBoxes.length; i++) {
    const box = componentBoxes[i];
    const quickLinkBtns = box.querySelectorAll('.quick-links button');

    for (var n = 0; n < quickLinkBtns.length; n++) {
      const button = quickLinkBtns[n];
      button.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = this.dataset.href;
      });
    }
  }

  //add the cookie banner if cookies haven't been accepted
  if (hasAccepted != 'true') {
    document.body.insertBefore(banner, document.body.children[0]);
  }
});

function getCookie(name) {
  const list = document.cookie.match('(?:;\\s*|^)' + name + '=(.+?)(?:;|$)');
  return list != null ? list[1] : null;
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
    }, 100);
  }, 340);
  document.cookie = 'acceptedCookies=true; path=/; secure; SameSite=strict';
  this.removeEventListener('click', hideBanner);
}
