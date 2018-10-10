//Content input by the user
var colorRGB = {
  'r': document.querySelector('.input.r').value,
  'g': document.querySelector('.input.g').value,
  'b': document.querySelector('.input.b').value
}

var triangleWidth;
var triangleHeight;

//The absolute legend being the code for the vertex shader which is the one computing the position and stuff for one object
var vertexSource = `#version 300 es

in vec2 position;
uniform vec2 resolution;

void main() {
    //convert from 0->1 to 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = (position/resolution) * 2.0 - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

//The absolute legend being the code for the fragment shader which is the one computing the color for every vertex processed
var fragmentSource = `#version 300 es

precision highp float;

uniform vec4 color;
out vec4 fragOut;

void main() {
   fragOut = color;
}
`;

var screenWidth = canvas.clientWidth;
var screenHeight = canvas.clientHeight;

var fixedColors //Float32Array for the fixed lightness of the colors

//set the variables containing how big the triangles need to be in order to fill the whole canvas
var drawWidth;
var drawHeight;
var amountX;
var amountY;

//creating a shader program from both shaders
var program = createProgram();

//get the position of the 'position' attribute ("in") in the program
var locationPosition = gl.getAttribLocation(program, 'position');
//get the position of the color and resolution uniforms in the program
var colorPosition = gl.getUniformLocation(program, 'color');
var resolutionPosition = gl.getUniformLocation(program, 'resolution');

//Create a new buffer
var bufferPosition = gl.createBuffer();
//we bind the bufferPosition buffer to ARRAY_BUFFER which is a static something which can only hold one buffer at a time
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);

//creating a collection of attribute states -> Vertex Array Object
var vertexArray = gl.createVertexArray();
//we bind the just created vertex array as the current vertex array (not needed as we only use one but it would be bad code if we let it out)
gl.bindVertexArray(vertexArray);

//we enable the 'position' attribute -> it would be a constant otherwise
gl.enableVertexAttribArray(locationPosition);

var size = 2;          // 2 components per iteration
var type = gl.FLOAT;   // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0;        // start at the beginning of the buffer

//vertexAttribPointer does also bind to the buffer which is bound to ARRAY_BUFFER, in our case bufferPosition, so that ARRAY_BUFFER is free and we can bind another buffer to it as it's purpose, transferring to vertexAttribPointer, is done
gl.vertexAttribPointer(locationPosition, size, type, normalize, stride, offset);

//Tell WebGL to use our program which is called 'program'
gl.useProgram(program);

resizeCanvas();
computeSizes();
inputLightness.dataset.value = 10;
inputLightness.dataset.maxValue = (amountX + amountY) * 3.2;
inputThreshold.dataset.value = amountX + amountY;
inputThreshold.dataset.maxValue = amountX + amountY;
for (var i = 0; i < inputsSlider.length; i++) {
  syncSlider(inputsSlider[i]);
}

generate();

function generate() {
  computeSizes();
  if (!document.body.classList.contains('size_warning') && amountX + amountY >= 1200) {
    document.body.classList.add('size_warning');
  } else if (!document.body.classList.contains('size_warning') && amountX + amountY < 1200) {
    resizeCanvas();
    createBuffer();
    draw();
  } else if (document.body.classList.contains('size_warning') && amountX + amountY < 1200) {
    hideWarning();
    //The timeout is necessary due to the warning not properly hiding before the generation starts
    setTimeout(function () {
      resizeCanvas();
      createBuffer();
      draw();
    }, 20);
  }
}

function run() {
  //Resize the canvas to the dimensions of the screen and pass it to WebGL
  resizeCanvas();
  //Compute the final size of the triangles and how many it needs to generate
  computeSizes();
  //Build the array needed to draw and write it into the buffer
  createBuffer();
  //Draw.
  draw();
}

function clearColor() {
  colorRGB = {
    'r': document.querySelector('.input.r').value,
    'g': document.querySelector('.input.g').value,
    'b': document.querySelector('.input.b').value
  }
  //setting the canvas background color
  gl.clearColor(colorRGB.r/255, colorRGB.g/255, colorRGB.b/255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function resizeCanvas() {
  //making the inner webgl pixel canvas size the size it is displayed as
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  //resize the actual inner webgl clipspace dimensions
  gl.viewport(0, 0, screenWidth, screenHeight);

  //The resolution is set to convert pixel values to clipspace values in GLSL
  gl.uniform2f(resolutionPosition, screenWidth, screenHeight);
}

function computeSizes() {
  //Define the width of the canvas (as canvas is always the dimensions of the viewport, the code below works)
  screenWidth = canvas.clientWidth;
  screenHeight = canvas.clientHeight;

  if (document.body.classList.contains('decoupledsize')) {
    triangleWidth = parseInt(inputWidth.value);
    triangleHeight = parseInt(inputHeight.value);
  } else {
    triangleWidth = parseInt(inputSize.value);
    triangleHeight = parseInt(inputSize.value);
  }
  //Compute how big the triangles need to be in order to fill the whole canvas
  drawWidth = triangleWidth + ((screenWidth % triangleWidth) / Math.floor(screenWidth/triangleWidth));
  drawHeight = triangleHeight + ((screenHeight % triangleHeight) / Math.floor(screenHeight/triangleHeight));
  amountX = screenWidth / drawWidth;
  amountY = screenHeight / drawHeight;
}

function createBuffer() {
  let positions = [];

  for (i = 0; i < amountY; i++) {
    for (u = 0; u < amountX; u++) {
      let positionMethod = Math.round(Math.random());
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

  //ARRAY_BUFFER had been bound to bufferPosition, so this is going into bufferPosition
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

//copy-paste: vec4 is a 4 float value. In JavaScript you could think of it something like a_position = {x: 0, y: 0, z: 0, w: 0}. Above we set size = 2. Attributes default to 0, 0, 0, 1 so this attribute will get its first 2 values (x and y) from our buffer. The z, and w will be the default 0 and 1 respectively.
//= the value of size is the number of parameters we will customly define to the value of the GLSL variable. if vec4 = {x: 0, y: 0, z: 0, w: 0}, the first 2 parameters, which are defined by size = 2, will get written by our buffer, the remains are defaulted

function draw() {
  let drawMethod = document.body.classList.contains('linemode') ? gl.LINE_LOOP : gl.TRIANGLES;
  colorRGB = {
    'r': document.querySelector('.input.r').value,
    'g': document.querySelector('.input.g').value,
    'b': document.querySelector('.input.b').value
  };
  recomputeSlider(inputLightness, (amountX + amountY) * 3.2);
  recomputeSlider(inputThreshold, amountX + amountY);
  fixedColors = new Float32Array(amountX*amountY*2);
  let iteration = 0;
  for (i = 0; i < amountY; i++) {
    for (u = 0; u < amountX; u++) {
      for (n = 0; n < 2; n++) {
        let randomMethod = (Math.random() + 0.25) * 2;
        let lightness = randomMethod * (u + i + Number(inputLightness.dataset.value)) / Number(inputThreshold.dataset.value);
        fixedColors[iteration] = randomMethod;
        gl.uniform4f(colorPosition,
          (colorRGB.r/255 * lightness).toFixed(2),
          (colorRGB.g/255 * lightness).toFixed(2),
          (colorRGB.b/255 * lightness).toFixed(2),
          1
        );
        gl.drawArrays(drawMethod, iteration * 3, 3);
        iteration++;
      }
    }
  }
}

function fixedDraw(rgb) {
  if (!rgb) {
    rgb = {
      'r': document.querySelector('.input.r').value,
      'g': document.querySelector('.input.g').value,
      'b': document.querySelector('.input.b').value
    };
  }
  let drawMethod = document.body.classList.contains('linemode') ? gl.LINE_LOOP : gl.TRIANGLES;
  let iteration = 0;
  for (i = 0; i < amountY; i++) {
    for (u = 0; u < amountX; u++) {
      for (n = 0; n < 2; n++) {
        let lightness = fixedColors[iteration] * (u + i + Number(inputLightness.dataset.value)) / Number(inputThreshold.dataset.value);
        gl.uniform4f(colorPosition,
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

//copy-paste: Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The 2nd time a_position.xy will be set to the 2nd two values. The last time it will be set to the last 2 values.
//= each time the vertex shader is executed (-> count, this case: 3 times), it will set 2 values (because size from above = 2) to the first 2 parameters of our vertex shader attribute. Every execution it is moving 2 onward; first time executing: first 2 values, second time: second 2 values, etc.
