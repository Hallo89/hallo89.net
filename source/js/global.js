const hasAccepted = getCookie('acceptedCookies');
const banner = (function() {
  const node = document.createElement('div');
  node.innerHTML = '<aside class="glb-box" id="cookiebanner"><b class="background"></b><div class="description box-text">This site uses cookies by Cloudflare, this banner and to save your preferenced theme color. By continuing to use it, you agree to them!</div><button type="button" onclick="hideBanner()">Alrighty!</button></aside>';
  return node.firstChild;
})();

window.addEventListener('load', function() {
  //add a custom href to the buttons in component boxes (since anchors can't be nested)
  const componentBoxes = document.querySelectorAll('.e-glb-box.glb-components');
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
    setTimeout(function() {
      banner.classList.remove('invisible');
    }, 10);
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
    }, 80);
  }, 450);
  document.cookie = 'acceptedCookies=true; path=/; secure; SameSite=strict';
  this.removeEventListener('click', hideBanner);
}
