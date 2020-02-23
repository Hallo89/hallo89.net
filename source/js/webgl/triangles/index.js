var lineMode = false;
var legacyMode = false;
var tipLock = false;
var rgbTimer;

var screenWidth;
var screenHeight;
var drawWidth;
var drawHeight;
var amountX;
var amountY;
var fixedColors; //The array containing the fixed lightness data for the legacy method

// ------- Conversion functions -------
function checkHex(hex) {
  const prefixed = hex.includes('#');
  const prefix = !hex.includes('#') ? '#' : '';
  if (!/[\dA-Fa-f]{3}|[\dA-Fa-f]{6}/.test(prefix + hex)) {
    return null;
  } else if (hex.length + !prefixed == 7) {
    return prefix + hex;
  } else if (hex.length + !prefixed == 4) {
    return prefix + hex;
  } else {
    return null;
  }
}
function checkRgb(rgb) {
  rgb = {
    r: parseInt(rgb.r),
    g: parseInt(rgb.g),
    b: parseInt(rgb.b)
  };
  //Regex is not made for range validation
  if (rgb.r >= 0 && rgb.r <= 255 && rgb.r != null && rgb.g >= 0 && rgb.g <= 255 && rgb.g != null && rgb.b >= 0 && rgb.b <= 255 && rgb.b != null) {
    return rgb;
  } else {
    return null;
  }
}

function hexToRgb(hex) {
  //Security items theoretically not needed as checkHex exists, but this way it is possible to do hexToRgb without doing checkHex
  const prefix = !hex.includes('#');
  if (hex.length + prefix == 7) {
    return {
      r: parseInt(hex.slice(1 - prefix, 3 - prefix), 16),
      g: parseInt(hex.slice(3 - prefix, 5 - prefix), 16),
      b: parseInt(hex.slice(5 - prefix, 7 - prefix), 16),
    };
  } else if (hex.length + prefix == 4) {
    return {
      r: parseInt(hex.slice(1 - prefix, 2 - prefix) + hex.slice(1 - prefix, 2 - prefix), 16),
      g: parseInt(hex.slice(2 - prefix, 3 - prefix) + hex.slice(2 - prefix, 3 - prefix), 16),
      b: parseInt(hex.slice(3 - prefix, 4 - prefix) + hex.slice(3 - prefix, 4 - prefix), 16),
    };
  } else {
    return null;
  }
}
function rgbToHex(rgb) {
  const hex = {
    r: parseInt(rgb.r),
    g: parseInt(rgb.g),
    b: parseInt(rgb.b)
  };
  const fill = {
    r: hex.r < 16 ? '0' : '',
    g: hex.g < 16 ? '0' : '',
    b: hex.b < 16 ? '0' : ''
  };
  return '#' + fill.r + (hex.r).toString(16) + fill.g + (hex.g).toString(16) + fill.b + (hex.b).toString(16);
}

// ------- Hash functions -------
function handleHash() {
  const hash = location.hash;
  //Check for a (valid) presence of each parameter and return the value or false if not valid or present
  const params = {
    color: hash.includes('color') ? checkHex(getHashParam('color')) : null,
    size: hash.includes('size') && getHashParam('size') > 0 ? getHashParam('size') : null,
    width: hash.includes('width') && getHashParam('width') > 0 ? getHashParam('width') : null,
    height: hash.includes('height') && getHashParam('height') > 0 ? getHashParam('height') : null,
    lightness: hash.includes('lightness') ? getHashParam('lightness') : null,
    threshold: hash.includes('threshold') ? getHashParam('threshold') : null,
    linemode: hash.includes('linemode') && (getHashParam('linemode') == 'true' || getHashParam('linemode') == 'false') ? (getHashParam('linemode') == 'true' ? true : false) : null
  };
  if (!params.size && !params.width && !params.height) {
    params.size = inputSize.value;
    params.width = null;
    params.height = null;
  } else if (params.width || params.height) {
    document.body.classList.add('decoupledsize');
    if (params.size) inputSize.value = params.size;
    if (!params.width) params.width = inputSize.value;
    if (!params.height) params.height = inputSize.value;
    params.size = null;
  }

  //complete the hash with the missing valid parameters
  updateHash({
    color: params.color != null ? params.color.slice(1) : inputHEX.value.slice(1),
    size: params.size,
    width: params.width,
    height: params.height,
    lightness: params.lightness != null ? params.lightness : sliderLightness.value,
    threshold: params.threshold != null ? params.threshold : sliderThreshold.value,
    linemode: params.linemode != null ? params.linemode : lineMode
  });

  updateInputs(params);
}

function updateHash(values = {}) {
  values = {
    color: values.color != null ? values.color : getHashParam('color'),
    size: !document.body.classList.contains('decoupledsize') ? (values.size != null ? values.size : getHashParam('size')) : null,
    width: document.body.classList.contains('decoupledsize') ? (values.width != null ? values.width : getHashParam('width')) : null,
    height: document.body.classList.contains('decoupledsize') ? (values.height != null ? values.height : getHashParam('height')) : null,
    lightness: values.lightness != null ? values.lightness : getHashParam('lightness'),
    threshold: values.threshold != null ? values.threshold : getHashParam('threshold'),
    linemode: values.linemode != null ? values.linemode : getHashParam('linemode')
  }
  let params = '';
  const valueNames = Object.keys(values);
  for (let i = 0; i < valueNames.length; i++) {
    if (values[valueNames[i]] != null) params += '#' + valueNames[i] + '=' + values[valueNames[i]];
  }
  location.replace(location.href.includes('#') ? location.href.slice(0, location.href.indexOf('#')) + params : location.href + params);
}

function getHashParam(param) {
  const hash = location.hash;
  const indexParam = hash.indexOf(param);
  const suffix = hash.slice(indexParam).indexOf('#');
  return suffix >= 0 ? hash.slice(indexParam + param.length + 1, suffix + indexParam) : hash.slice(indexParam + param.length + 1);
}

// ------- WebGL functions -------
function generate() {
  //Set the hash according to the input values for an instant update
  updateHash({
    color: inputHEX.value.slice(1),
    size: !document.body.classList.contains('decoupledsize') ? inputSize.value : null,
    width: document.body.classList.contains('decoupledsize') ? inputWidth.value : null,
    height: document.body.classList.contains('decoupledsize') ? inputHeight.value : null,
    linemode: lineMode
  });

  if (legacyMode) {
    computeSizes();
    if (!sizeAlert.classList.contains('active') && amountX + amountY >= 1200) {
      sizeAlert.classList.add('active');
    } else if (!sizeAlert.classList.contains('active') && amountX + amountY < 1200) {
      run(false);
    } else if (sizeAlert.classList.contains('active') && amountX + amountY < 1200) {
      hideWarning();
      //The timeout is necessary due to the warning not properly hiding before the generation starts
      setTimeout(function() {
        run(false);
      }, 20);
    }
  } else {
    if (sizeAlert.classList.contains('active')) hideWarning();
    run();
  }
}

function run(compution = true, fixed = false) {
  if (compution) {
    //Compute the final size of the triangles and how many it needs to generate
    computeSizes();
  }
  //Resize the canvas to the dimensions of the screen and pass it to WebGL
  resizeCanvas();
  //Wipe the canvas with a wet rag and paint it newly afterwards
  clearCanvas();
  //Build the array needed to draw and write it into the buffer
  createBuffer();
  draw(fixed);
}

function clearCanvas() {
  //As the previous buffer does not get preserved, meaning overriden by a fresh one, we need to clear the buffer manually
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function resizeCanvas() {
  //making the inner webgl pixel canvas size the size it is displayed as
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  //resize the actual inner webgl clipspace dimensions
  gl.viewport(0, 0, screenWidth, screenHeight);
  //Pass the resolution to the legacy vertex shader
  if (legacyMode) gl.uniform2f(uResolution, screenWidth, screenHeight);
}

function computeSizes() {
  //Define the width of the canvas (as canvas is always the dimensions of the viewport, the code below works)
  screenWidth = canvas.clientWidth;
  screenHeight = canvas.clientHeight;

  const isDecoupled = document.body.classList.contains('decoupledsize');
  const triangleWidth = parseInt(isDecoupled ? inputWidth.value : inputSize.value);
  const triangleHeight = parseInt(isDecoupled ? inputHeight.value : inputSize.value);

  //Compute how big the triangles need to be in order to fill the whole canvas
  drawWidth = triangleWidth + ((screenWidth % triangleWidth) / Math.floor(screenWidth/triangleWidth));
  drawHeight = triangleHeight + ((screenHeight % triangleHeight) / Math.floor(screenHeight/triangleHeight));
  amountX = Math.round(screenWidth / drawWidth);
  amountY = Math.round(screenHeight / drawHeight);
  //Set the uniforms needed for the shaders (if the new system is used)
  if (!legacyMode) {
    gl.uniform1f(uAmountX, amountX);
    gl.uniform2f(uDrawDims, drawWidth, drawHeight);
    gl.uniformMatrix3fv(uProjection, false, [
      2 / screenWidth, 0, 0,
      0, -2 / screenHeight, 0,
      -1, 1, 1
    ]);
  }
}

function createBuffer() {
  if (!legacyMode) {
    //set the attribute to a single triangle as it will get drawn repeatedly in an instanced draw
    const positions = new Float32Array([
      0, 0,
      0, drawHeight,
      drawWidth, 0
    ]);
    //ARRAY_BUFFER had been bound to `buffer`, so this is going into `buffer`
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  } else {
    let positions = new Array();
    for (let i = 0; i < amountY; i++) {
      for (let u = 0; u < amountX; u++) {
        const positionMethod = Math.round(Math.random());
        if (positionMethod == 0) {
          positions.push(
            drawWidth * u, drawHeight * i,
            drawWidth * u, drawHeight * (i+1),
            drawWidth * (u+1), drawHeight * i,
            drawWidth * (u+1), drawHeight * (i+1),
            drawWidth * u, drawHeight * (i+1),
            drawWidth * (u+1), drawHeight * i
          );
        } else {
          positions.push(
            drawWidth * u, drawHeight * i,
            drawWidth * (u+1), drawHeight * (i+1),
            drawWidth * (u+1), drawHeight * i,
            drawWidth * (u+1), drawHeight * (i+1),
            drawWidth * u, drawHeight * (i+1),
            drawWidth * u, drawHeight * i
          );
        }
      }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }
}

function draw(
  fixed = false,
  rgb = {
    r: document.querySelector('.input.r').value,
    g: document.querySelector('.input.g').value,
    b: document.querySelector('.input.b').value
  }
) {
  const drawMethod = lineMode ? gl.LINE_LOOP : gl.TRIANGLES;

  clearCanvas();

  if (!fixed) {
    sliderLightness.newValues({max: (amountX + amountY) * 3.2});
    sliderThreshold.newValues({max: amountX + amountY});
    updateHash({
      lightness: sliderLightness.value,
      threshold: sliderThreshold.value
    });
  }

  if (!legacyMode) {
    gl.uniform3f(uColor,
      rgb.r/255,
      rgb.g/255,
      rgb.b/255
    );

    gl.uniform1f(uLightness, sliderLightness.value);
    gl.uniform1f(uThreshold, sliderThreshold.value);

    if (!fixed) {
      gl.uniform2f(uRand, Math.random(), Math.random());
      gl.uniform2f(uRand90, Math.random(), Math.random());
    }

    gl.drawArraysInstanced(drawMethod, 0, 3, amountX * amountY * 2);
  } else {
    if(!fixed) fixedColors = new Float32Array(amountX*amountY*2);
    let iteration = 0;
    for (let i = 0; i < amountY; i++) {
      for (let u = 0; u < amountX; u++) {
        for (let n = 0; n < 2; n++) {
          const randomMethod = fixed ? fixedColors[iteration] : (Math.random() + 0.25) * 2;
          if(!fixed) fixedColors[iteration] = randomMethod;
          let lightness = randomMethod * (u + i + sliderLightness.value) / (sliderThreshold.value + 0.0001);
          gl.uniform4f(uColorFragAlt,
            (rgb.r/255 * lightness).toFixed(2),
            (rgb.g/255 * lightness).toFixed(2),
            (rgb.b/255 * lightness).toFixed(2),
            1
          );
          gl.drawArrays(drawMethod, iteration * 3, 3);
          iteration++;
        }
      }
    }
  }
}
