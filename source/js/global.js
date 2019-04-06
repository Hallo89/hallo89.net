function getCookie(name) {
  const list = document.cookie.match('(?:;\\s*|^)' + name + '=(.+?)(?:;|$)');
  return list != null ? list[1] : null;
}

//Create the banner element
const banner = (function() {
  const aside = document.createElement('aside');
  aside.classList.add('glb_box');
  aside.classList.add('invisible');
  aside.id = 'cookiebanner';
  const bg = document.createElement('b');
  bg.classList.add('background');
  const text = document.createElement('div');
  text.classList.add('description');
  text.classList.add('box_text');
  text.innerHTML = 'This site uses cookies by Cloudflare and this very banner. By continuing to use it, you agree to them!';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.onclick = hideBanner;
  btn.innerHTML = 'Alrighty!';
  aside.appendChild(bg);
  aside.appendChild(text);
  aside.appendChild(btn);
  return aside;
})();

//Check whether cookies have already been accepted
window.addEventListener('load', function() {
  document.body.insertBefore(banner, document.body.children[0]);
  setTimeout(function() {
    if (getCookie('acceptedCookies') == 'true') {
      banner.classList.add('gone');
      banner.classList.remove('invisible');
    } else {
      banner.classList.remove('invisible');
    }
  }, 10);
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
