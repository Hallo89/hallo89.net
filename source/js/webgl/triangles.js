//The absolute legend being the code for the vertex shader which is the one computing the position and stuff for one object
const vertex = `#version 300 es

in vec2 position;

uniform float amountX;
uniform float lightness;
uniform float threshold;
uniform mat3 projection;
uniform mat3 rotateZ;
uniform mat3 rotationOffset;
uniform mat3 rotateZ90;
uniform mat3 rotation90Offset;
uniform vec2 rands;
uniform vec2 rands90;
uniform vec2 drawDims;
uniform vec3 color;
mat3 translation;
mat3 scale90;

out vec3 fragColor;

//A pseudo-random function found on the internet (literally everywhere)
//(Math.sin(v[0] * 12.9898 + v[1] * 78.233) * 43758.5453) - Math.floor(Math.sin(v[0] * 12.9898 + v[1] * 78.233) * 43758.5453)
float rand(vec2 v) {
  return fract(sin(dot(v.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  //The current triangle iteration
  float id = float(gl_InstanceID);
  //On which grid and row the triangle batch is positioned
  vec2 currentGridPos = vec2(mod(floor(id / 2.0), amountX), floor(floor(id / 2.0) / amountX));

  //Taking two Math.random() from a uniform and doing some pre-compution for absolute randomness
  vec2 randMethod = rands * (sin(id + 1.0) * (id + 1.0));
  //The usual lightness compution
  float value = (0.55 + 2.0 * rand(randMethod)) * (currentGridPos.x + currentGridPos.y + lightness) / (threshold + 0.0001);

  //Constructing the translation matrix (which advances with the ID)
  translation[0] = vec3(1, 0, 0);
  translation[1] = vec3(0, 1, 0);
  translation[2] = vec3(drawDims * currentGridPos, 1);

  //Defining the matrix, start by adding the projection & translation matrix
  mat3 positionMatrix = projection * translation;

  //If the id is uneven, meaning the triangle's counterpart is to be drawn, rotate it
  if (mod(id, 2.0) == 1.0) {
    positionMatrix = positionMatrix * rotateZ * rotationOffset;
  }
  //If the rounded modulus of a random number equals 1, rotate the current triangle and its counterpart by 90 degrees
  vec2 randMethod90 = rands90 * (sin(ceil((id + 1.0) / 2.0)) * ceil((id + 1.0) / 2.0));
  if (round(rand(randMethod90)) == 1.0) {
    //Constructing the scaling matrix needed for 90° rotated triangles
    scale90[0] = vec3(drawDims.y / drawDims.x, 0, 0);
    scale90[1] = vec3(0, drawDims.x / drawDims.y, 0);
    scale90[2] = vec3(0, 0, 1);
    positionMatrix = positionMatrix * rotateZ90 * scale90 * rotation90Offset;
  }

  gl_Position = vec4((positionMatrix * vec3(position, 1)).xy, 0, 1);
  fragColor = color * value;
}
`;

//The absolute legend being the code for the fragment shader which is the one computing the color for every vertex processed
const fragment = `#version 300 es

precision mediump float;

in vec3 fragColor;

out vec4 fragOut;

void main() {
  fragOut = vec4(fragColor, 1);
}
`;

//The following shaders belong to the archived legacy program
const vertexLegacy = `#version 300 es

in vec2 position;
uniform vec2 resolution;

void main() {
  //convert from 0->1 to 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = (position/resolution) * 2.0 - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fragmentLegacy = `#version 300 es

precision mediump float;

uniform vec4 colorFrag;
out vec4 fragOut;

void main() {
  fragOut = colorFrag;
}
`;

var screenWidth = canvas.clientWidth;
var screenHeight = canvas.clientHeight;
var drawWidth;
var drawHeight;
var amountX;
var amountY;

var fixedColors; //The array containing the fixed lightness data for the legacy method

//creating two shader programs (2.0 and legacy) from both shaders
const program = webgl.constructProgram(vertex, fragment);
const programAlt = webgl.constructProgram(vertexLegacy, fragmentLegacy);

//get the position of the attributes ("in") in the programs
const aPosition = gl.getAttribLocation(program, 'position');
const aPositionAlt = gl.getAttribLocation(programAlt, 'position');
//get the position of the uniforms in the programs
const uRand = gl.getUniformLocation(program, 'rands');
const uRand90 = gl.getUniformLocation(program, 'rands90');
const uDrawDims = gl.getUniformLocation(program, 'drawDims');
const uAmountX = gl.getUniformLocation(program, 'amountX');
const uLightness = gl.getUniformLocation(program, 'lightness');
const uThreshold = gl.getUniformLocation(program, 'threshold');
const uRotateZ = gl.getUniformLocation(program, 'rotateZ');
const uRotationOffset = gl.getUniformLocation(program, 'rotationOffset');
const uRotateZ90 = gl.getUniformLocation(program, 'rotateZ90');
const uRotation90Offset = gl.getUniformLocation(program, 'rotation90Offset');
const uProjection = gl.getUniformLocation(program, 'projection');
const uColor = gl.getUniformLocation(program, 'color');
const uResolution = gl.getUniformLocation(programAlt, 'resolution');
const uColorFragAlt = gl.getUniformLocation(programAlt, 'colorFrag');

//creating a collection of attribute states -> Vertex Array Object
const vertexArray = gl.createVertexArray();
//we bind the just created vertex array as the current vertex array (not needed as we only use one but it would be bad code if we let it out)
gl.bindVertexArray(vertexArray);

//Create a new buffer
const bufferPosition = gl.createBuffer();
//we bind the bufferPosition buffer to ARRAY_BUFFER which is a static something which can only hold one buffer at a time
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);

//we enable the 'position' attribute -> it would be a constant otherwise
gl.enableVertexAttribArray(aPosition);

//atrribute, size, type, normalize, stride, offset
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

//Tell WebGL which program to use
if (legacyMode) {
  gl.useProgram(programAlt);
} else {
  gl.useProgram(program);
}

gl.uniformMatrix3fv(uRotateZ, false, [
  Math.cos(Math.PI), -Math.sin(Math.PI), 0,
  Math.sin(Math.PI), Math.cos(Math.PI), 0,
  0, 0, 1
]);
gl.uniformMatrix3fv(uRotateZ90, false, [
  Math.cos(Math.PI * -0.5), -Math.sin(Math.PI * -0.5), 0,
  Math.sin(Math.PI * -0.5), Math.cos(Math.PI * -0.5), 0,
  0, 0, 1
]);

resizeCanvas();
computeSizes();

slider89.defaultValues({
  trimComma: false,
  task: function() {
    draw(true);
  },
  classList: ['input_box'],
  replaceNode: true
});
const sliderLightness = new Slider89(document.getElementById('slider_lightness'), {
  value: ((amountX + amountY) * 3.2) / 16,
  max: (amountX + amountY) * 3.2,
  comma: 1,
  width: 120,
  taskMouseUp: function() {
    updateHash({lightness: sliderLightness.value});
  },
  caption: 'Lightness start'
});
const sliderThreshold = new Slider89(document.getElementById('slider_threshold'), {
  value: amountX + amountY,
  max: amountX + amountY,
  comma: 3,
  width: 160,
  taskMouseUp: function() {
    updateHash({threshold: sliderThreshold.value});
  },
  caption: 'Lightness threshold'
});

handleHash();
generate();

function handleHash() {
  const hash = location.hash;
  //Check for a (valid) presence of each parameter and return the value or false if not valid or present
  let params = {
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
    if (sizeAlert.classList.contains('active')) {
      hideWarning();
    }
    run();
  }
}

function run(compution = true) {
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
  //Draw.
  draw();
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
  let triangleWidth;
  let triangleHeight;
  //Define the width of the canvas (as canvas is always the dimensions of the viewport, the code below works)
  screenWidth = canvas.clientWidth;
  screenHeight = canvas.clientHeight;

  triangleWidth = parseInt(document.body.classList.contains('decoupledsize') ? inputWidth.value : inputSize.value);
  triangleHeight = parseInt(document.body.classList.contains('decoupledsize') ? inputHeight.value : inputSize.value);
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
    gl.uniformMatrix3fv(uRotationOffset, false, [
      1, 0, 0,
      0, 1, 0,
      -drawWidth, -drawHeight, 1
    ]);
    gl.uniformMatrix3fv(uRotation90Offset, false, [
      1, 0, 0,
      0, 1, 0,
      0, -drawHeight, 1
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

    //ARRAY_BUFFER had been bound to bufferPosition, so this is going into bufferPosition
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  } else {
    let positions = [];
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

function draw(fixed = false, rgb = {r: document.querySelector('.input.r').value, g: document.querySelector('.input.g').value, b: document.querySelector('.input.b').value}) {
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
