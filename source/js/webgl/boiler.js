/*
  Boilerplate code for WebGL 2. For my purposes, importing a library is not needed, considering the fact that I would not learn about stuff this way
*/
const canvas = document.querySelector('canvas');

const gl = canvas.getContext('webgl2', {
  preserveDrawingBuffer: (typeof preserveBuffer != "undefined" ? preserveBuffer : false)
});
if (!gl) {
  console.error('It seems like WebGL2 is not supported');
  const prompt = (function() {
    const alertWrapper = document.createElement('div');
    const alert = document.createElement('div');
    const alertCaption = document.createElement('p');
    const alertHeader = document.createElement('p');
    const alertInfo = document.createElement('p');
    alertWrapper.classList.add('alert_wrapper');
    alertWrapper.classList.add('active');
    alert.classList.add('alert');
    alertCaption.classList.add('caption');
    alertHeader.classList.add('header');
    alertInfo.classList.add('info');
    const body = [alertCaption, alertHeader, alertInfo];
    for (let i = 0; i < body.length; i++) body[i].classList.add('text');

    const isIE = navigator.userAgent.indexOf('MSIE') != -1 || navigator.userAgent.indexOf('Trident') != -1;
    alertCaption.textContent = 'No support for WebGL 2';
    alertHeader.textContent = 'This page uses WebGL2 which is not supported by your browser';
    alertInfo.innerHTML = 'WebGL2 is a modern graphics library for the web not supported by old browsers.<br>      Please choose a modern desktop browser, e.g. the latest Firefox, or Firefox on mobile to be able to see this WebGL2 content.' + (isIE ? '<br>You seem to be using Internet Explorer - This browser is a threat to security and individuality, please upgrade to a modern browser as fast as possible.' : '');

    alertWrapper.appendChild(alert);
    for (let i = 0; i < body.length; i++) alert.appendChild(body[i]);
    return alertWrapper;
  })();
  document.body.innerHTML = '';
  document.body.appendChild(prompt);
}

const webgl = {
  //Creating a shader program from both needed shaders
  constructProgram: function(vertex, fragment) {
    const program = gl.createProgram();
    //Attaching both shaders to the empty program
    gl.attachShader(program, this.compileShader(vertex, gl.VERTEX_SHADER));
    gl.attachShader(program, this.compileShader(fragment, gl.FRAGMENT_SHADER));
    //Linking the program. I don't know what this does. I think it links, as in merges, both just-attached shaders together into the final thing
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error: Program failed to link: ' + gl.getProgramInfoLog(program));
    }
    return program;
  },
  //Compiling either one of the shaders, where 'shaderType' is either gl.FRAGMENT_SHADER or gl.VERTEX_SHADER
  compileShader: function(source, type) {
    //Creating a new empty 'shader hull'
    let shader = gl.createShader(type);
    //Linking the shader code to the just created empty shader and compiling it
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error: could not compile shader: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  }
}
