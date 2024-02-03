const hasAcceptedBanner = localStorage.getItem('Global_acceptedBanner');
const cookieBannerNode = (function() {
  const node = document.createElement('div');
  node.innerHTML =
    '<aside id="cookiebanner">' +
      '<span class="background"></span>' +
      '<div class="description">' +
        'This site runs on Cloudflare. It does NOT use any kind of tracking or cookies – preferences are only stored locally in localStorage.' +
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

  // Add the cookie banner if banner hasn't been accepted
  if (hasAcceptedBanner !== 'true') {
    document.body.insertBefore(cookieBannerNode, document.body.children[0]);
  }

  // NOTE This deletes potential cookies after the switch to LocalStorage (16/08/2022)
  // Remove this at some point
  document.cookie = 'acceptedCookies=; path=/; secure; SameSite=strict; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = 'theme=; path=/; secure; SameSite=strict; expires=Thu, 01 Jan 1970 00:00:01 GMT';
});

function hideCookieBanner() {
  cookieBannerNode.classList.add('removing');
  setTimeout(function() {
    cookieBannerNode.classList.add('removing2');
    setTimeout(function() {
      cookieBannerNode.classList.add('removing3');
      setTimeout(function() {
        cookieBannerNode.classList.add('gone');
        document.body.removeChild(cookieBannerNode);
      }, 200);
    }, 100);
  }, 340);

  this.removeEventListener('click', hideCookieBanner);

  localStorage.setItem('Global_acceptedBanner', 'true');
}
