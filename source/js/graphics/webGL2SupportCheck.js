(function() {
  const testCanvas = document.createElement('canvas');
  if (!testCanvas.getContext('webgl2') && !testCanvas.getContext('experimental-webgl2')) {
    const prompt = (function() {
      const alert = document.createElement('div');
      const alertCaption = document.createElement('h1');
      const alertHeader = document.createElement('h2');
      const alertInfo = document.createElement('p');

      alert.appendChild(alertCaption);
      alert.appendChild(alertHeader);
      alert.appendChild(alertInfo);

      let info = 'WebGL 2 is a modern graphics library for the web not supported by old browsers.<br>'
        + 'Please choose a modern desktop or mobile browser, e.g. the latest Firefox, to be able to see this content.';
      if (navigator.userAgent.indexOf('MSIE') != -1 || navigator.userAgent.indexOf('Trident') != -1) {
        info += '<br>You seem to be using Internet Explorer – '
          + 'This browser is a threat to security and individuality, please upgrade to a modern browser as fast as possible.';
      }
      alertCaption.textContent = 'No support for WebGL 2';
      alertHeader.textContent = 'This page uses WebGL 2, which is not supported by your browser';
      alertInfo.innerHTML = info;

      document.body.setAttribute('style',
        'margin: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;'
      );
      alert.setAttribute('style',
        'padding: 2em 2.5em; font-size: calc(.08vw + .02vh + 15.75px); font-family: sans-serif;' +
        'background-color: hsl(0, 0%, 16%); color: hsl(0, 0%, 86%); border: 10px solid hsl(0, 0%, 13.5%)'
      );
      alertCaption.setAttribute('style',
        'margin-top: 0;'
      );
      alertInfo.setAttribute('style',
        'margin-bottom: 0;'
      );

      return alert;
    })();
    document.body.textContent = '';
    document.body.appendChild(prompt);

    console.error('It seems like WebGL 2 is not supported.');
  }
}());

