const defaultProps = {
  size: 50,
  color: '17469E',
  linemode: 'false',
  lightness: 8,
  threshold: 100
};
var lineMode = false;
var legacyMode = false;
var tipLock = false;

var screenWidth;
var screenHeight;
var drawWidth;
var drawHeight;
var amountX;
var amountY;
var fixedColors; //The array containing the fixed lightness data for the legacy method

// ------- Color functions -------
function checkHex(hex) {
  const prefixed = hex.includes('#');
  const prefix = !prefixed ? '#' : '';
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

// ------- URL search parameter functions -------
function handleSearchParams() {
  const values = {};
  if (location.search) {
    const params = new URL(location).searchParams;
    for (const [key, value] of params) {
      values[key] = value;
    }
  } else if (location.hash) { //Deprecated, but still valid (for old links)
    const params = location.hash.slice(1).split('#');
    for (const param of params) {
      const [key, value] = param.split('=');
      values[key] = value;
    }
    if (values.lightness) values.lightness = (parseInt(values.lightness) / ((amountX + amountY) * 3)) * 100;
    if (values.threshold) values.threshold = (parseInt(values.threshold) / (amountX + amountY)) * 100;
  }
  if (Object.keys(values).length > 0) {
    updateProperties(values);
    history.replaceState(null, 'Triangles - WebGL Experiments | Hallo89', 'triangles');
  }
}

// ------- WebGL functions -------
function generate() {
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

  const triangleSize = parseInt(inputSize.value);
  //Compute how big the triangles need to be in order to fill the whole canvas
  drawWidth = triangleSize + ((screenWidth % triangleSize) / Math.floor(screenWidth/triangleSize));
  drawHeight = triangleSize + ((screenHeight % triangleSize) / Math.floor(screenHeight/triangleSize));
  amountX = Math.round(screenWidth / drawWidth);
  amountY = Math.round(screenHeight / drawHeight);

  if (!legacyMode) {
    gl.uniform1i(uAmountX, amountX);
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

  const lightness = (amountX + amountY) * 3 * (sliderLightness.value / 100);
  const threshold = (amountX + amountY) * (sliderThreshold.value / 100);
  if (!legacyMode) {
    gl.uniform3f(uColor,
      rgb.r/255,
      rgb.g/255,
      rgb.b/255
    );

    gl.uniform1f(uLightness, lightness);
    gl.uniform1f(uThreshold, threshold);

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
          let lightnessMod = randomMethod * (u + i + lightness) / (threshold + 0.0001);
          gl.uniform4f(uColorFragAlt,
            (rgb.r/255 * lightnessMod).toFixed(2),
            (rgb.g/255 * lightnessMod).toFixed(2),
            (rgb.b/255 * lightnessMod).toFixed(2),
            1
          );
          gl.drawArrays(drawMethod, iteration * 3, 3);
          iteration++;
        }
      }
    }
  }
}
