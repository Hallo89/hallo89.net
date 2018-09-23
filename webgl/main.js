//making the inner webgl pixel canvas size the size it is displayed as
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
//resize the actual inner webgl clipspace dimensions
gl.viewport(0, 0, canvas.width, canvas.height);

//setting the canvas background color
gl.clearColor(0.2, 0.54, 0.3, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

//creating a shader program from both shaders
var program = createProgram();
//get the position of the "position" atrribute ("in")
var locationPosition = gl.getAttribLocation(program, 'position');
var bufferPosition = gl.createBuffer();

gl.useProgram(program);

/* var resolutionPosition = gl.getUniformLocation(program, 'resolution');
gl.uniform2f(resolutionPosition, gl.canvas.width, gl.canvas.height); */

var offsetPosition = gl.getUniformLocation(program, 'offset');

//Getting every triangle to have a different random color
var colorPosition = gl.getUniformLocation(program, 'color');

//we bind the bufferPosition buffer to ARRAY_BUFFER which is a static something which can only hold one buffer at a time
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);

for (i = 0; i < 20; i++) {
  for (u = 0; u < 20; u++) {
    let positionMethod = Math.round(Math.random());
    for (n = 0; n < 2; n++) {
      let positions;
      if (positionMethod == 0) {
        if (n == 0) {
          positions = [
            -1, 1,
            -1, 0.9,
            -0.9, 1
          ];
        }
        else {
          positions = [
            -0.9, 0.9,
            -1, 0.9,
            -0.9, 1
          ];
        }
      }
      else {
        if (n == 0) {
          positions = [
            -1, 1,
            -0.9, 1,
            -0.9, 0.9
          ];
        }
        else {
          positions = [
            -1, 1,
            -1, 0.9,
            -0.9, 0.9
          ];
        }
      }

      //ARRAY_BUFFER had been bound to bufferPosition, so this is going into bufferPosition
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      gl.uniform4fv(offsetPosition, [0.1 * u, -0.1 * i, 0, 0]);
      gl.uniform4fv(colorPosition, [
        (Math.random()).toFixed(2),
        (Math.random()+0.1).toFixed(2),
        (Math.random()+0.4).toFixed(2),
        (Math.random()+0.2).toFixed(2)
      ]);

      /* //creating a collection of attribute states -> Vertex Array Object
      var vertexArray = gl.createVertexArray();
      //we bind the just created vertex array as the current vertex array
      gl.bindVertexArray(vertexArray);
       */
      gl.enableVertexAttribArray(locationPosition);

      //Cheekily copy-pasted
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer

      //vertexAttribPointer does also bind to the buffer which is bound to ARRAY_BUFFER, in our case bufferPosition, so that ARRAY_BUFFER is free and we can bind another buffer to it as it's purpose, transferring to vertexAttribPointer, is done
      gl.vertexAttribPointer(locationPosition, size, type, normalize, stride, offset);

      //copy-paste: vec4 is a 4 float value. In JavaScript you could think of it something like a_position = {x: 0, y: 0, z: 0, w: 0}. Above we set size = 2. Attributes default to 0, 0, 0, 1 so this attribute will get its first 2 values (x and y) from our buffer. The z, and w will be the default 0 and 1 respectively.
      //= the value of size is the number of parameters we will customly define to the value of the GLSL variable. if vec4 = {x: 0, y: 0, z: 0, w: 0}, the first 2 parameters, which are defined by size = 2, will get written by our buffer, the remains are defaulted

      var primitiveType = gl.TRIANGLES;
      var offsetExecute = 0;
      var count = 3;
      gl.drawArrays(primitiveType, offsetExecute, count);
    }
  }
}
//copy-paste: Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The 2nd time a_position.xy will be set to the 2nd two values. The last time it will be set to the last 2 values.
//= each time the vertex shader is executed (-> count, this case: 3 times), it will set 2 values (because size from above = 2) to the first 2 parameters of our vertex shader attribute. Every execution it is moving 2 onward; first time executing: first 2 values, second time: second 2 values, etc.
