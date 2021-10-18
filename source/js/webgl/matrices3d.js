const canvas = GLBoiler.getCanvasByTag();
const inputs = toolbar.querySelector('.inputs');

canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
});

slider89.defaultValues({
  task: draw,
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
  value: 0,
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
  value: -1000,
  caption: 'Translate: Z-axis'
});

slider89.defaultValues({
  max: 5,
  min: -5,
  comma: 2,
  value: 1,
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
  value: -1,
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
  -300, -300, -300,
     0, -300, -300,
     0,    0, -300,
  -300,    0, -300,
  -300, -300, -300,
  //left
     0,    0,    0,
     0,    0, -300,
     0, -300,    0,
     0,    0, -300,
     0, -300, -300,
     0, -300,    0,
  //bottom
     0, -300,    0,
     0, -300, -300,
  -300, -300,    0,
  -300, -300,    0,
     0, -300, -300,
  -300, -300, -300,
  //right
  -300,    0,    0,
  -300, -300,    0,
  -300,    0, -300,
  -300, -300,    0,
  -300, -300, -300,
  -300,    0, -300,
  //top
    0,     0,    0,
  -300,    0,    0,
  -300,    0, -300,
     0,    0,    0,
  -300,    0, -300,
     0,    0, -300,
  //front
     0,    0,    0,
     0, -300,    0,
  -300, -300,    0,
     0,    0,    0,
  -300, -300,    0,
  -300,    0,    0
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
  20/255, 50/255, 75/255,
  20/255, 65/255, 90/255,

  10/255, 100/255, 110/255,
  10/255, 80/255, 90/255,
  10/255, 100/255, 110/255,
  10/255, 80/255, 90/255,
  10/255, 80/255, 90/255,
  10/255, 100/255, 110/255,

  80/255, 70/255, 110/255,
  60/255, 60/255, 95/255,
  80/255, 70/255, 110/255,
  80/255, 70/255, 110/255,
  60/255, 60/255, 95/255,
  60/255, 60/255, 95/255,

  10/255, 100/255, 85/255,
  10/255, 100/255, 85/255,
  10/255, 80/255, 70/255,
  10/255, 100/255, 85/255,
  10/255, 80/255, 70/255,
  10/255, 80/255, 70/255,

  70/255, 70/255, 115/255,
  70/255, 70/255, 115/255,
  50/255, 60/255, 100/255,
  70/255, 70/255, 115/255,
  50/255, 60/255, 100/255,
  50/255, 60/255, 100/255,

  20/255, 70/255, 100/255,
  25/255, 80/255, 120/255,
  25/255, 80/255, 120/255,
  20/255, 70/255, 100/255,
  25/255, 80/255, 120/255,
  20/255, 70/255, 100/255,
]);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.enableVertexAttribArray(locationColor);
gl.vertexAttribPointer(locationColor, 3, gl.FLOAT, false, 0, 0);

gl.enable(gl.CULL_FACE);
//gl.enable(gl.DEPTH_TEST);

//Mouse navigation
const mod = {
  scale: .275
};
var ctrlLock = false;
var clickedBtn;
const clickPos = {};

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('wheel', wheel); //TODO: support for mousewheela
window.addEventListener('mouseup', removeMouseMove);

draw();

function wheel(e) {
  if (e.ctrlKey) e.preventDefault();
  if (e.deltaY) {
    const direction = -1 * (e.deltaY / Math.abs(e.deltaY)); //either 1 or -1
    const current = {
      x: sldrScaleX.value,
      y: sldrScaleY.value,
      z: sldrScaleZ.value
    };
    let distance = {
      x: current.x + direction * mod.scale,
      y: current.y + direction * mod.scale,
      z: current.z - direction * mod.scale
    };
    const step = {};
    for (const axis in distance) {
      step[axis] = (Math.abs(current[axis] - distance[axis]) / 3.5) * direction;
    }
    const axis = e.ctrlKey && e.shiftKey ? 'z' : (e.ctrlKey ? 'y' : (e.shiftKey ? 'x' : ''));
    if (axis) distance = clearAxes(distance, axis);
    animateScale(current, distance, step, direction);
  }
}
function animateScale(distance, target, step, dir) {
  for (const axis in target) {
    distance[axis] += (axis == 'z' ? -1 : 1) * step[axis];
    if (dir > 0) {
      if (axis == 'z') {
        if (distance[axis] <= target[axis]) return;
      } else
        if (distance[axis] >= target[axis]) return;
    } else {
      if (axis == 'z') {
        if (distance[axis] >= target[axis]) return;
      } else
        if (distance[axis] <= target[axis]) return;
    }
  }
  if (distance.x) sldrScaleX.newValues({ value: distance.x });
  if (distance.y) sldrScaleY.newValues({ value: distance.y });
  if (distance.z) sldrScaleZ.newValues({ value: distance.z });
  draw();
  requestAnimationFrame(() => {
    animateScale(distance, target, step, dir);
  });
}

function mouseMove(e) {
  if (clickedBtn == 0 || clickedBtn == 2) {
    if (e.ctrlKey && !ctrlLock) {
      ctrlLock = true;
    } else if (!e.ctrlKey && ctrlLock) {
      mod.tran = 1.7 * (sldrTranslateZ.value / -1000);
      mod.rot = .44 * (sldrTranslateZ.value / -1000);
      ctrlLock = false;
    }
    if (clickedBtn == 0) {
      var distance;
      if (e.ctrlKey) {
        distance = (e.screenX - e.screenY) * 1.7 - ((clickPos.x - clickPos.y) * 1.7 - clickPos.tran.z);
      } else {
        distance = {
          x: e.screenX * mod.tran - (clickPos.x * mod.tran - clickPos.tran.x),
          y: e.screenY * mod.tran - (clickPos.y * mod.tran + clickPos.tran.y)
        };
      }
      if (!e.ctrlKey && (distance.x || distance.y) || e.ctrlKey && distance) {
        if (e.ctrlKey) sldrTranslateZ.newValues({value: distance})
        else {
          if (distance.x) sldrTranslateX.newValues({value: distance.x});
          if (distance.y) sldrTranslateY.newValues({value: -distance.y});
        }
        draw();
      }
    } else if (clickedBtn == 2) {
      const distance = {
        x: e.screenY * mod.rot - (clickPos.y * mod.rot + clickPos.rot.y),
        y: e.screenX * mod.rot - (clickPos.x * mod.rot + clickPos.rot.x)
      };
      if (distance.x || distance.y) {
        if (distance.x) sldrRotateX.newValues({value: -distance.x});
        if (distance.y) sldrRotateY.newValues({value: -distance.y});
        draw();
      }
    }
  }
}

function mouseDown(e) {
  if (e.button == 1) e.preventDefault();
  removeMouseMove();
  clickedBtn = e.button;
  // const scaleMod = (sldrScaleX.value + sldrScaleY.value) / 2;
  mod.tran = 1.7 * (sldrTranslateZ.value / -1000);
  mod.rot = .44 * (sldrTranslateZ.value / -1000);
  // mod.rot = .44;
  clickPos.x = e.screenX;
  clickPos.y = e.screenY;
  clickPos.tran = {
    x: sldrTranslateX.value,
    y: sldrTranslateY.value,
    z: sldrTranslateZ.value
  };
  clickPos.rot = {
    x: sldrRotateY.value,
    y: sldrRotateX.value
  };
  window.addEventListener('mousemove', mouseMove);
}

function removeMouseMove() {
  window.removeEventListener('mousemove', mouseMove);
}
function clearAxes(obj, prop) {
  for (const axis in obj) {
    if (prop !== axis) delete obj[axis];
  }
  return obj;
}

function draw() {
  gl.uniformMatrix4fv(matOrigin, false, [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    150, 150, 150, 1
  ]);

  const perspective = Math.tan(Math.PI * 0.5 - 0.5 * (sldrFov.value * Math.PI / 180));
  gl.uniformMatrix4fv(matPerspective, false, [
    perspective * canvas.height / canvas.width, 0, 0, 0,
    0, perspective, 0, 0,
    0, 0, (1 + 2000) * (1.0 / (1 - 2000)), -1,
    0, 0, (1 * 2000) * (1.0 / (1 - 2000)) * 2, 0
  ]);
  gl.uniformMatrix4fv(matTranslate, false, [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    sldrTranslateX.value, sldrTranslateY.value, sldrTranslateZ.value, 1
  ]);
  gl.uniformMatrix4fv(matRotateX, false, [
    1, 0, 0, 0,
    0, Math.cos(sldrRotateX.value * Math.PI / 180), -Math.sin(sldrRotateX.value * Math.PI / 180), 0,
    0, Math.sin(sldrRotateX.value * Math.PI / 180), Math.cos(sldrRotateX.value * Math.PI / 180), 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matRotateY, false, [
    Math.cos(sldrRotateY.value * Math.PI / 180), 0, Math.sin(sldrRotateY.value * Math.PI / 180), 0,
    0, 1, 0, 0,
    -Math.sin(sldrRotateY.value * Math.PI / 180), 0, Math.cos(sldrRotateY.value * Math.PI / 180), 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matRotateZ, false, [
    Math.cos(sldrRotateZ.value * Math.PI / 180), -Math.sin(sldrRotateZ.value * Math.PI / 180), 0, 0,
    Math.sin(sldrRotateZ.value * Math.PI / 180), Math.cos(sldrRotateZ.value * Math.PI / 180), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  gl.uniformMatrix4fv(matScale, false, [
    sldrScaleX.value, 0, 0, 0,
    0, sldrScaleY.value, 0, 0,
    0, 0, sldrScaleZ.value, 0,
    0, 0, 0, 1
  ]);
  //primitiveType, offsetExecute, count
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
//copy-paste: Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The 2nd time a_position.xy will be set to the 2nd two values. The last time it will be set to the last 2 values.
//= each time the vertex shader is executed (-> count, this case: 3 times), it will set 2 values (because size from above = 2) to the first 2 parameters of our vertex shader attribute. Every execution it is moving 2 onward; first time executing: first 2 values, second time: second 2 values, etc.
