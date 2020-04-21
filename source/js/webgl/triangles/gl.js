//The vertex shader is called once every vertex and computes its properties like position
const vertex = `#version 300 es

in vec2 position;

const mat3 rotateZ = mat3(mat2(-1));
const mat3 rotateZ90 = mat3(
  0, 1, 0,
  -1, 0, 0,
  0, 0, 1
);

uniform int amountX;
uniform float lightness;
uniform float threshold;
uniform mat3 projection;
uniform vec2 rands;
uniform vec2 rands90;
uniform vec2 drawDims;
uniform vec3 color;
mat3 rotationOffset;
mat3 rotation90Offset;

out vec3 fragColor;

//A pseudo-random function found on the internet (literally everywhere)
//(Math.sin(v[0] * 12.9898 + v[1] * 78.233) * 43758.5453) - Math.floor(Math.sin(v[0] * 12.9898 + v[1] * 78.233) * 43758.5453)
float rand(vec2 v) {
  return fract(sin(dot(v.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

//Statically building some matrices
void buildMatrices() {
  rotationOffset = mat3(
    1, 0, 0,
    0, 1, 0,
    -drawDims.x, -drawDims.y, 1
  );
  rotation90Offset = mat3(
    1, 0, 0,
    0, 1, 0,
    0, -drawDims.y, 1
  );
}

void main() {
  buildMatrices();

  //The current triangle iteration
  float id = float(gl_InstanceID);
  //On which grid and row the triangle batch is positioned
  vec2 currentGridPos = vec2(ivec2(gl_InstanceID / 2 % amountX, gl_InstanceID / 2 / amountX));

  //Taking two Math.random() from a uniform and doing some pre-compution for absolute randomness
  vec2 randMethod = rands * (sin(id + 1.0) * (id + 1.0));
  //The usual lightness computation
  float value = (0.55 + 2.0 * rand(randMethod)) * (currentGridPos.x + currentGridPos.y + lightness) / (threshold + 0.0001);

  //Constructing the translation matrix (which advances with the ID)
  mat3 translation = mat3(
    1, 0, 0,
    0, 1, 0,
    drawDims * currentGridPos, 1
  );
  //Defining the matrix, start by adding the projection & translation matrix
  mat3 positionMatrix = projection * translation;

  //If the id is uneven, meaning the triangle's counterpart is to be drawn, rotate it
  if (gl_InstanceID % 2 == 1) {
    positionMatrix = positionMatrix * rotateZ * rotationOffset;
  }
  //If the rounded modulus of a random number equals 1, rotate the current triangle and its counterpart by 90 degrees
  vec2 randMethod90 = rands90 * (sin(ceil((id + 1.0) / 2.0)) * ceil((id + 1.0) / 2.0));
  if (round(rand(randMethod90)) == 1.0) {
    //Constructing the scaling matrix needed for 90° rotated triangles
    mat3 scale90 = mat3(
      drawDims.y / drawDims.x, 0, 0,
      0, drawDims.x / drawDims.y, 0,
      0, 0, 1
    );
    positionMatrix = positionMatrix * rotateZ90 * scale90 * rotation90Offset;
  }

  gl_Position = vec4((positionMatrix * vec3(position, 1)).xy, 0, 1);
  fragColor = color * value;
}
`;

//The fragment shader is called once every fragment (pixel) and computes its color
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

screenWidth = canvas.clientWidth;
screenHeight = canvas.clientHeight;

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
const uRotationOffset = gl.getUniformLocation(program, 'rotationOffset');
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
const buffer = gl.createBuffer();
//we bind the `buffer` buffer to ARRAY_BUFFER which is a static something which can only hold one buffer at a time
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

//we enable the 'position' attribute -> it would be a constant otherwise
gl.enableVertexAttribArray(aPosition);
//atrribute, size, type, normalize, stride, offset
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(legacyMode ? programAlt : program);
