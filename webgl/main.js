const inputRotateX = document.querySelector('.input_box.slider.rotateX .input');
const inputRotateY = document.querySelector('.input_box.slider.rotateY .input');
const inputRotateZ = document.querySelector('.input_box.slider.rotateZ .input');
const inputTranslateX = document.querySelector('.input_box.slider.translateX .input');
const inputTranslateY = document.querySelector('.input_box.slider.translateY .input');
const inputTranslateZ = document.querySelector('.input_box.slider.translateZ .input');
const inputScaleX = document.querySelector('.input_box.slider.scaleX .input');
const inputScaleY = document.querySelector('.input_box.slider.scaleY .input');
const inputScaleZ = document.querySelector('.input_box.slider.scaleZ .input');


//making the inner webgl pixel canvas size the size it is displayed as
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
//resize the actual inner webgl clipspace dimensions
gl.viewport(0, 0, canvas.width, canvas.height);

//setting the canvas background color
//gl.clearColor(0.2, 0.54, 0.3, 1);
//gl.clear(gl.COLOR_BUFFER_BIT);

//creating a shader program from both shaders
var program = createProgram();
//get the position of the "position" and "color" atrribute ("in")
var locationPosition = gl.getAttribLocation(program, 'position');
var locationColor = gl.getAttribLocation(program, 'color');

var matrixOrthoPosition = gl.getUniformLocation(program, 'matrixOrtho');
var matrixTranslatePosition = gl.getUniformLocation(program, 'matrixTranslate');
var matrixRotateXPosition = gl.getUniformLocation(program, 'matrixRotateX');
var matrixRotateYPosition = gl.getUniformLocation(program, 'matrixRotateY');
var matrixRotateZPosition = gl.getUniformLocation(program, 'matrixRotateZ');
var matrixScalePosition = gl.getUniformLocation(program, 'matrixScale');


gl.useProgram(program);


var vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

//Creating a new buffer to be used for the position vertices
var bufferPosition = gl.createBuffer();
//Binding the just created buffer as the current ARRAY_BUFFER
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);

var positions = new Float32Array([
  //back
  0, 0, 250,
  300, 400, 250,
  0, 400, 250,
  0, 0, 250,
  300, 0, 250,
  300, 400, 250,
  //left
  0, 0, 0,
  0, 0, 250,
  0, 400, 0,
  0, 0, 250,
  0, 400, 250,
  0, 400, 0,
  //bottom
  0, 400, 0,
  0, 400, 250,
  300, 400, 0,
  300, 400, 0,
  0, 400, 250,
  300, 400, 250,
  //right
  300, 0, 0,
  300, 400, 0,
  300, 0, 250,
  300, 400, 0,
  300, 400, 250,
  300, 0, 250,
  //top
  0, 0, 0,
  300, 0, 0,
  300, 0, 250,
  0, 0, 0,
  300, 0, 250,
  0, 0, 250,
  //front
  0, 0, 0,
  0, 400, 0,
  300, 400, 0,
  0, 0, 0,
  300, 400, 0,
  300, 0, 0
]);
//Writing data into that buffer
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.enableVertexAttribArray(locationPosition);
gl.vertexAttribPointer(locationPosition, 3, gl.FLOAT, false, 0, 0);


var bufferColor = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);

var colors = new Float32Array([
  20/255, 40/255, 60/255,
  20/255, 40/255, 60/255,
  20/255, 40/255, 60/255,
  20/255, 40/255, 60/255,
  20/255, 40/255, 60/255,
  20/255, 40/255, 60/255,

  80/255, 90/255, 100/255,
  80/255, 90/255, 100/255,
  80/255, 90/255, 100/255,
  80/255, 90/255, 100/255,
  80/255, 90/255, 100/255,
  80/255, 90/255, 100/255,

  20/255, 60/255, 100/255,
  20/255, 60/255, 100/255,
  20/255, 60/255, 100/255,
  20/255, 60/255, 100/255,
  20/255, 60/255, 100/255,
  20/255, 60/255, 100/255,

  200/255, 150/255, 100/255,
  200/255, 150/255, 100/255,
  200/255, 150/255, 100/255,
  200/255, 150/255, 100/255,
  200/255, 150/255, 100/255,
  200/255, 150/255, 100/255,

  100/255, 200/255, 150/255,
  100/255, 200/255, 150/255,
  100/255, 200/255, 150/255,
  100/255, 200/255, 150/255,
  100/255, 200/255, 150/255,
  100/255, 200/255, 150/255,

  10/255, 100/255, 50/255,
  10/255, 100/255, 50/255,
  10/255, 100/255, 50/255,
  10/255, 100/255, 50/255,
  10/255, 100/255, 50/255,
  10/255, 100/255, 50/255
]);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.enableVertexAttribArray(locationColor);
gl.vertexAttribPointer(locationColor, 3, gl.FLOAT, false, 0, 0);

gl.enable(gl.CULL_FACE);
//gl.enable(gl.DEPTH_TEST);

draw();
function draw() {
  /* 2 / (right - left), 0, 0, 0,
  0, 2 / (top - bottom), 0, 0,
  0, 0, 2 / (near - far), 0,

  (left + right) / (left - right),
  (bottom + top) / (bottom - top),
  (near + far) / (near - far),
  1, */
  gl.uniformMatrix4fv(matrixOrthoPosition, false, [
    2 / (canvas.width - 0), 0, 0, 0,
    0, 2 / (0 - canvas.height), 0, 0,
    0, 0, 2 / (-1000 - 1000), 0,
    (-canvas.width/2 + canvas.width)/(-canvas.width/2 - canvas.width), (canvas.height + -canvas.height/2)/(canvas.height - -canvas.height/2), (-1000 + 1000)/(-1000 - 1000), 1
  ]);
  gl.uniformMatrix4fv(matrixTranslatePosition, false, [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    inputTranslateX.dataset.value, inputTranslateY.dataset.value, inputTranslateZ.dataset.value, 1
  ]);
  gl.uniformMatrix4fv(matrixRotateXPosition, false, [
    1, 0, 0, 0,
    0, Math.cos(inputRotateX.dataset.value * Math.PI / 180), -Math.sin(inputRotateX.dataset.value * Math.PI / 180), 0,
    0, Math.sin(inputRotateX.dataset.value * Math.PI / 180), Math.cos(inputRotateX.dataset.value * Math.PI / 180), 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matrixRotateYPosition, false, [
    Math.cos(inputRotateY.dataset.value * Math.PI / 180), 0, Math.sin(inputRotateY.dataset.value * Math.PI / 180), 0,
    0, 1, 0, 0,
    -Math.sin(inputRotateY.dataset.value * Math.PI / 180), 0, Math.cos(inputRotateY.dataset.value * Math.PI / 180), 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matrixRotateZPosition, false, [
    Math.cos(inputRotateZ.dataset.value * Math.PI / 180), -Math.sin(inputRotateZ.dataset.value * Math.PI / 180), 0, 0,
    Math.sin(inputRotateZ.dataset.value * Math.PI / 180), Math.cos(inputRotateZ.dataset.value * Math.PI / 180), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matrixScalePosition, false, [
    inputScaleX.dataset.value, 0, 0, 0,
    0, inputScaleY.dataset.value, 0, 0,
    0, 0, inputScaleZ.dataset.value, 0,
    0, 0, 0, 1
  ]);
  //primitiveType, offsetExecute, count
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
//copy-paste: Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The 2nd time a_position.xy will be set to the 2nd two values. The last time it will be set to the last 2 values.
//= each time the vertex shader is executed (-> count, this case: 3 times), it will set 2 values (because size from above = 2) to the first 2 parameters of our vertex shader attribute. Every execution it is moving 2 onward; first time executing: first 2 values, second time: second 2 values, etc.
