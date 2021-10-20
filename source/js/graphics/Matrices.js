var Matrices = {
  getMatrix: {
    origin: function(x, y, z) {
      return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      ]);
    },
    perspective: function(canvas, fovRad, near, far) {
      return new Float32Array([
        fovRad / (canvas.clientWidth / canvas.clientHeight), 0, 0, 0,
        0, fovRad, 0, 0,
        0, 0, (near + far) * (1.0 / (near - far)), -1,
        0, 0, (near * far) * (1.0 / (near - far)) * 2, 0
      ]);
    },
    translate: function(x, y, z) {
      return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      ]);
    },
    scale: function(x, y, z) {
      return new Float32Array([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      ]);
    },
    rotateX: function(x) {
      return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(x * Math.PI / 180), Math.sin(x * Math.PI / 180), 0,
        0, -Math.sin(x * Math.PI / 180), Math.cos(x * Math.PI / 180), 0,
        0, 0, 0, 1
      ]);
    },
    rotateY: function(y) {
      return new Float32Array([
        Math.cos(y * Math.PI / 180), 0, -Math.sin(y * Math.PI / 180), 0,
        0, 1, 0, 0,
        Math.sin(y * Math.PI / 180), 0, Math.cos(y * Math.PI / 180), 0,
        0, 0, 0, 1
      ]);
    },
    rotateZ: function(z) {
      return new Float32Array([
        Math.cos(z * Math.PI / 180), Math.sin(z * Math.PI / 180), 0, 0,
        -Math.sin(z * Math.PI / 180), Math.cos(z * Math.PI / 180), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    }
  }
}
