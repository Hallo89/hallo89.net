'use strict';
class GLBoiler {
  canvas;
  gl;

  constructor(canvas, options) {
    this.canvas = canvas;
    this.gl = this.getContext(options);
  };

  // --- Static functions ---
  static getCanvasByTag() {
    return document.querySelector('canvas');
  };

  static getContext(canvas, options) {
    return canvas.getContext('webgl2', options) ||
      canvas.getContext('experimental-webgl2', options);
  };

  static setDimensions(gl, canvas, width = canvas.clientWidth, height = canvas.clientHeight) {
    canvas.width = width;
    canvas.height = height;

    gl.viewport(0, 0, width, height);
  };

  static enable(gl, ...args) {
    for (const arg of args) {
      gl.enable(arg);
    }
  };

  static clearAll(gl) {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  };

  static setMatrix(gl, matrixType, uniform, args) {
    GLBoiler.setMatrixFromArray(gl, uniform, Matrices.getMatrix[matrixType](...args));
  };

  static setMatrixFromArray(gl, uniform, matrixArray) {
    gl.uniformMatrix4fv(uniform, false, matrixArray);
  };

  static fillUniformMatrixBuffer(gl, matrixType, offset, args) {
    gl.bufferSubData(gl.UNIFORM_BUFFER, offset, Matrices.getMatrix[matrixType](...args));
  };

  static createProgram(gl, vertexStr, fragmentStr) {
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(vertexStr, gl.VERTEX_SHADER));
    gl.attachShader(program, compileShader(fragmentStr, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('program failed to link: ' + gl.getProgramInfoLog(program));
    }
    return program;

    function compileShader(shaderStr, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, shaderStr);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('could not compile shader:\n' + gl.getShaderInfoLog(shader));
      }
      return shader;
    }
  };

  // --- Prototype functions ---
  getContext(options) {
    return GLBoiler.getContext(this.canvas, ...arguments);
  };

  setDimensions(width, height) {
    GLBoiler.setDimensions(this.gl, this.canvas, ...arguments);
  };

  enable() {
    GLBoiler.enable(this.gl, ...arguments);
  };

  clearAll() {
    GLBoiler.clearAll(this.gl, ...arguments);
  };

  setMatrix(matrixType, uniform, args) {
    GLBoiler.setMatrix(this.gl, ...arguments);
  };

  setMatrixFromArray(uniform, matrixArray) {
    GLBoiler.setMatrixFromArray(this.gl, ...arguments);
  };

  fillUniformMatrixBuffer(matrixType, offset, args) {
    GLBoiler.fillUniformMatrixBuffer(this.gl, ...arguments);
  };

  createProgram(vertexStr, fragmentStr) {
    return GLBoiler.createProgram(this.gl, ...arguments);
  };
}

