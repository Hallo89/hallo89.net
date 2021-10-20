const canvas = GLBoiler.getCanvasByTag();
const inputs = toolbar.querySelector('.inputs');

const controls = new Controls3D(canvas, draw);
controls.mod.tran = 1.75;
controls.assignNewState({
  tran: {
    z: -1000
  },
  rot: {
    x: 45,
    y: 45
  }
});


slider89.defaultValues({
  task: sliderMove,
  classList: ['input_box']
});
slider89.defaultValues({
  min: -360,
  max: 360,
  width: 180
});
const sldrRotateX = new Slider89(inputs, {
  caption: 'Rotate: X-axis'
});
const sldrRotateY = new Slider89(inputs, {
  caption: 'Rotate: Y-axis'
});
const sldrRotateZ = new Slider89(inputs, {
  caption: 'Rotate: Z-axis'
});

slider89.defaultValues({
  width: 120
});
const sldrTranslateX = new Slider89(inputs, {
  caption: 'Translate: X-axis',
  max: 1500,
  min: -1500
});
const sldrTranslateY = new Slider89(inputs, {
  caption: 'Translate: Y-axis',
  max: 1000,
  min: -1000
});
const sldrTranslateZ = new Slider89(inputs, {
  min: -2000,
  max: -200,
  caption: 'Translate: Z-axis'
});

slider89.defaultValues({
  max: 5,
  min: -5,
  comma: 2,
  width: 150,
  trimComma: false
});
const sldrScaleX = new Slider89(inputs, {
  caption: 'Scale: X-axis'
});
const sldrScaleY = new Slider89(inputs, {
  caption: 'Scale: Y-axis'
});
const sldrScaleZ = new Slider89(inputs, {
  caption: 'Scale: Z-axis'
});

const sldrFov = new Slider89(inputs, {
  min: 0,
  value: 90,
  comma: 0,
  trimComma: true,
  max: 360,
  width: 180,
  caption: 'Field of view'
});


const vertexShader = `#version 300 es

in vec4 position;
in vec3 color;

out vec4 fragColor;

uniform mat4 matPerspective;
uniform mat4 matOrigin;
uniform mat4 matTranslate;
uniform mat4 matRotateX;
uniform mat4 matRotateY;
uniform mat4 matRotateZ;
uniform mat4 matScale;

void main() {
    fragColor = vec4(color, 1);
    mat4 finalMatrix = matPerspective * matTranslate * matRotateX * matRotateY * matRotateZ * matScale * matOrigin;
    gl_Position = finalMatrix * position;
}
`;
const fragmentShader = `#version 300 es

precision mediump float;

in vec4 fragColor;
out vec4 fragOut;

void main() {
   fragOut = fragColor;
}
`;


const gl = GLBoiler.getContext(canvas);

GLBoiler.setDimensions(gl, canvas);

//creating a shader program from both shaders
const program = GLBoiler.createProgram(gl, vertexShader, fragmentShader);
//get the position of the "position" and "color" atrribute ("in")
const locationPosition = gl.getAttribLocation(program, 'position');
const locationColor = gl.getAttribLocation(program, 'color');

const matPerspective = gl.getUniformLocation(program, 'matPerspective');
const matOrigin = gl.getUniformLocation(program, 'matOrigin');
const matTranslate = gl.getUniformLocation(program, 'matTranslate');
const matRotateX = gl.getUniformLocation(program, 'matRotateX');
const matRotateY = gl.getUniformLocation(program, 'matRotateY');
const matRotateZ = gl.getUniformLocation(program, 'matRotateZ');
const matScale = gl.getUniformLocation(program, 'matScale');


gl.useProgram(program);


const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

//Creating a new buffer to be used for the position vertices
const bufferPosition = gl.createBuffer();
//Binding the just created buffer as the current ARRAY_BUFFER
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);

const positions = new Float32Array([
  //back
     0,    0, -300,
     0, -300, -300,
  -300, -300, -300,
     0,    0, -300,
  -300, -300, -300,
  -300,    0, -300,
  //left
     0,    0,    0,
     0, -300,    0,
     0,    0, -300,
     0,    0, -300,
     0, -300,    0,
     0, -300, -300,
  //bottom
     0, -300,    0,
  -300, -300,    0,
     0, -300, -300,
  -300, -300,    0,
  -300, -300, -300,
     0, -300, -300,
  //right
  -300,    0,    0,
  -300,    0, -300,
  -300, -300,    0,
  -300, -300,    0,
  -300,    0, -300,
  -300, -300, -300,
  //top
    0,     0,    0,
  -300,    0, -300,
  -300,    0,    0,
     0,    0,    0,
     0,    0, -300,
  -300,    0, -300,
  //front
     0,    0,    0,
  -300, -300,    0,
     0, -300,    0,
     0,    0,    0,
  -300,    0,    0,
  -300, -300,    0,
]);
//Writing data into that buffer
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.enableVertexAttribArray(locationPosition);
gl.vertexAttribPointer(locationPosition, 3, gl.FLOAT, false, 0, 0);


const bufferColor = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);

const colors = new Float32Array([
  20/255, 50/255, 75/255,
  20/255, 65/255, 90/255,
  20/255, 65/255, 90/255,
  20/255, 50/255, 75/255,
  20/255, 65/255, 90/255,
  20/255, 50/255, 75/255,

  10/255, 100/255, 110/255,
  10/255, 100/255, 110/255,
  10/255, 80/255, 90/255,
  10/255, 80/255, 90/255,
  10/255, 100/255, 110/255,
  10/255, 80/255, 90/255,

  80/255, 70/255, 110/255,
  80/255, 70/255, 110/255,
  60/255, 60/255, 95/255,
  80/255, 70/255, 110/255,
  60/255, 60/255, 95/255,
  60/255, 60/255, 95/255,

  10/255, 100/255, 85/255,
  10/255, 80/255, 70/255,
  10/255, 100/255, 85/255,
  10/255, 100/255, 85/255,
  10/255, 80/255, 70/255,
  10/255, 80/255, 70/255,

  70/255, 70/255, 115/255,
  50/255, 60/255, 100/255,
  70/255, 70/255, 115/255,
  70/255, 70/255, 115/255,
  50/255, 60/255, 100/255,
  50/255, 60/255, 100/255,

  20/255, 70/255, 100/255,
  25/255, 80/255, 120/255,
  25/255, 80/255, 120/255,
  20/255, 70/255, 100/255,
  20/255, 70/255, 100/255,
  25/255, 80/255, 120/255,
]);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.enableVertexAttribArray(locationColor);
gl.vertexAttribPointer(locationColor, 3, gl.FLOAT, false, 0, 0);

gl.enable(gl.CULL_FACE);
//gl.enable(gl.DEPTH_TEST);

draw();


function setSlidersFromControlsState() {
  sldrTranslateX.newValues({ value: controls.state.tran.x });
  sldrTranslateY.newValues({ value: controls.state.tran.y });
  sldrTranslateZ.newValues({ value: controls.state.tran.z });

  sldrRotateX.newValues({ value: controls.state.rot.x });
  sldrRotateY.newValues({ value: controls.state.rot.y });
  sldrRotateZ.newValues({ value: controls.state.rot.z });

  sldrScaleX.newValues({ value: controls.state.scale.x });
  sldrScaleY.newValues({ value: controls.state.scale.y });
  sldrScaleZ.newValues({ value: controls.state.scale.z });
}

function setControlsStateFromSliders() {
  // Slider89 is dumb and I have no way of knowing which slider invoked the event
  controls.state.tran.x = sldrTranslateX.value;
  controls.state.tran.y = sldrTranslateY.value;
  controls.state.tran.z = sldrTranslateZ.value;

  controls.state.rot.x = sldrRotateX.value;
  controls.state.rot.y = sldrRotateY.value;
  controls.state.rot.z = sldrRotateZ.value;

  controls.state.scale.x = sldrScaleX.value;
  controls.state.scale.y = sldrScaleY.value;
  controls.state.scale.z = sldrScaleZ.value;
}

function sliderMove() {
  setControlsStateFromSliders();
  draw(true);
}

function draw(skipSliderUpdate) {
  if (!skipSliderUpdate) {
    setSlidersFromControlsState();
  }

  GLBoiler.setMatrix(gl, 'origin', matOrigin, [150, 150, 150]);

  const perspective = Math.tan(Math.PI * 0.5 - 0.5 * (sldrFov.value * Math.PI / 180));
  GLBoiler.setMatrix(gl, 'perspective', matPerspective, [canvas, perspective, 1, 2000]);

  GLBoiler.setMatrix(gl, 'translate', matTranslate, Object.values(controls.state.tran));

  GLBoiler.setMatrix(gl, 'rotateX', matRotateX, [controls.state.rot.x]);
  GLBoiler.setMatrix(gl, 'rotateY', matRotateY, [controls.state.rot.y]);
  GLBoiler.setMatrix(gl, 'rotateZ', matRotateZ, [controls.state.rot.z]);

  GLBoiler.setMatrix(gl, 'scale', matScale, Object.values(controls.state.scale));

  //primitiveType, offsetExecute, count
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
//copy-paste: Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The 2nd time a_position.xy will be set to the 2nd two values. The last time it will be set to the last 2 values.
//= each time the vertex shader is executed (-> count, this case: 3 times), it will set 2 values (because size from above = 2) to the first 2 parameters of our vertex shader attribute. Every execution it is moving 2 onward; first time executing: first 2 values, second time: second 2 values, etc.
