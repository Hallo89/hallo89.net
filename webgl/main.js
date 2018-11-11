slider89.defaultValues({
  task: draw,
  classList: ['input_box'],
});
slider89.defaultValues({
  max: 360,
  width: 180,
});
var sliderRotateX = new Slider89(inputs, {
  caption: 'Rotate: X-axis'
});
var sliderRotateY = new Slider89(inputs, {
  caption: 'Rotate: Y-axis'
});
var sliderRotateZ = new Slider89(inputs, {
  caption: 'Rotate: Z-axis'
});

slider89.defaultValues({
  max: 1000,
  min: -1000,
  value: 0,
  width: 120,
});
var sliderTranslateX = new Slider89(inputs, {
  caption: 'Translate: X-axis'
});
var sliderTranslateY = new Slider89(inputs, {
  caption: 'Translate: Y-axis'
});
var sliderTranslateZ = new Slider89(inputs, {
  min: -2000,
  max: 0,
  value: -1000,
  caption: 'Translate: Z-axis'
});

slider89.defaultValues({
  max: 5,
  min: -5,
  comma: 2,
  value: 1,
  width: 150,
  trimComma: false,
});
var sliderScaleX = new Slider89(inputs, {
  caption: 'Scale: X-axis'
});
var sliderScaleY = new Slider89(inputs, {
  caption: 'Scale: Y-axis'
});
var sliderScaleZ = new Slider89(inputs, {
  value: -1,
  caption: 'Scale: Z-axis'
});

var sliderFov = new Slider89(inputs, {
  min: 0,
  value: 90,
  comma: 0,
  trimComma: true,
  max: 360,
  width: 180,
  caption: 'Field of view'
});


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

var matrixPerspectivePosition = gl.getUniformLocation(program, 'matrixPerspective');
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
  0, 0, -250,
  -300, -400, -250,
  0, -400, -250,
  0, 0, -250,
  -300, 0, -250,
  -300, -400, -250,
  //left
  0, 0, 0,
  0, 0, -250,
  0, -400, 0,
  0, 0, -250,
  0, -400, -250,
  0, -400, 0,
  //bottom
  0, -400, 0,
  0, -400, -250,
  -300, -400, 0,
  -300, -400, 0,
  0, -400, -250,
  -300, -400, -250,
  //right
  -300, 0, 0,
  -300, -400, 0,
  -300, 0, -250,
  -300, -400, 0,
  -300, -400, -250,
  -300, 0, -250,
  //top
  0, 0, 0,
  -300, 0, 0,
  -300, 0, -250,
  0, 0, 0,
  -300, 0, -250,
  0, 0, -250,
  //front
  0, 0, 0,
  0, -400, 0,
  -300, -400, 0,
  0, 0, 0,
  -300, -400, 0,
  -300, 0, 0
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
/*
  2 / (right - left), 0, 0, 0,
  0, 2 / (top - bottom), 0, 0,
  0, 0, 2 / (near - far), 0,

  (left + right) / (left - right),
  (bottom + top) / (bottom - top),
  (near + far) / (near - far),
  1,
*//*
    gl.uniformMatrix4fv(matrixOrthoPosition, false, [
    2 / (canvas.width - 0), 0, 0, 0,
    0, 2 / (0 - canvas.height), 0, 0,
    0, 0, 2 / (-1000 - 1000), 0,
    (-canvas.width/2 + canvas.width)/(-canvas.width/2 - canvas.width), (canvas.height + -canvas.height/2)/(canvas.height - -canvas.height/2), (-1000 + 1000)/(-1000 - 1000), 1
  ]);
*/
/*
  f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  rangeInv = 1.0 / (near - far);

  f / aspect, 0, 0, 0,
  0, f, 0, 0,
  0, 0, (near + far) * rangeInv, -1,
  0, 0, near * far * rangeInv * 2, 0
*/
  gl.uniformMatrix4fv(matrixPerspectivePosition, false, [
    Math.tan(Math.PI * 0.5 - 0.5 * (sliderFov.value * Math.PI / 180)) * canvas.height / canvas.width, 0, 0, 0,
    0, Math.tan(Math.PI * 0.5 - 0.5 * (sliderFov.value * Math.PI / 180)), 0, 0,
    0, 0, (1 + 2000) * (1.0 / (1 - 2000)), -1,
    0, 0, (1 * 2000) * (1.0 / (1 - 2000)) * 2, 0
  ]);
  gl.uniformMatrix4fv(matrixTranslatePosition, false, [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    sliderTranslateX.value, sliderTranslateY.value, sliderTranslateZ.value, 1
  ]);
  gl.uniformMatrix4fv(matrixRotateXPosition, false, [
    1, 0, 0, 0,
    0, Math.cos(sliderRotateX.value * Math.PI / 180), -Math.sin(sliderRotateX.value * Math.PI / 180), 0,
    0, Math.sin(sliderRotateX.value * Math.PI / 180), Math.cos(sliderRotateX.value * Math.PI / 180), 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matrixRotateYPosition, false, [
    Math.cos(sliderRotateY.value * Math.PI / 180), 0, Math.sin(sliderRotateY.value * Math.PI / 180), 0,
    0, 1, 0, 0,
    -Math.sin(sliderRotateY.value * Math.PI / 180), 0, Math.cos(sliderRotateY.value * Math.PI / 180), 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matrixRotateZPosition, false, [
    Math.cos(sliderRotateZ.value * Math.PI / 180), -Math.sin(sliderRotateZ.value * Math.PI / 180), 0, 0,
    Math.sin(sliderRotateZ.value * Math.PI / 180), Math.cos(sliderRotateZ.value * Math.PI / 180), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matrixScalePosition, false, [
    sliderScaleX.value, 0, 0, 0,
    0, sliderScaleY.value, 0, 0,
    0, 0, sliderScaleZ.value, 0,
    0, 0, 0, 1
  ]);
  //primitiveType, offsetExecute, count
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
//copy-paste: Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The 2nd time a_position.xy will be set to the 2nd two values. The last time it will be set to the last 2 values.
//= each time the vertex shader is executed (-> count, this case: 3 times), it will set 2 values (because size from above = 2) to the first 2 parameters of our vertex shader attribute. Every execution it is moving 2 onward; first time executing: first 2 values, second time: second 2 values, etc.
