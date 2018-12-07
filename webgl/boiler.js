/*
  Boilerplate code for WebGL 2. For my purposes, importing a library is not needed
  Considering the fact that I would not learn about stuff this way, this method is a better one, especially because I add my own spice to it as to comment it in my way so it is best understandable for me (and probably others as well)
  I'm also adding my own spice to it as to formatting parts of it in a better way
*/

const canvas = document.querySelector('canvas'); //The body of this, being the thing I work with

//The absolute legend being the heart of everything (literally everything)
const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: preserveBuffer});
if (!gl) {
  console.error('It seems like WebGL2 is not supported');
  document.body.innerHTML = '<span style="color: hsl(0, 0%, 80%); font-size: 50px;">It seems like WebGL2 is not supported</span>';
}

const webgl = {
  //The function compiling either one of the shaders, where 'shaderSource' is obvious and shaderType is either FRAGMENT_SHADER or VERTEX_SHADER
  compileShader: function(source, type) {
   //creating a new empty 'shader hull'
    let shader = gl.createShader(type);
   //linking the shader code to the just created empty shader and compiling it
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
   //get the status. If not correct, throw an error
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error: could not compile shader: ' + gl.getShaderInfoLog(shader));
    }
   //return the now compiled shader, which is only either one
    return shader;
  },

  //The function creating a 'program' from both needed shaders
  constructProgram: function(vertex, fragment) {
   //creating an empty program to be written
    let program = gl.createProgram();
   //attaching both shaders to the empty program
    gl.attachShader(program, this.compileShader(vertex, gl.VERTEX_SHADER));
    gl.attachShader(program, this.compileShader(fragment, gl.FRAGMENT_SHADER));
   //linking the program. I don't know what this does. I think it links, as in merges, both just-attached shaders together into the final thing
    gl.linkProgram(program);
   //get the LINK_STATUS which is the status (mind = blown). If not correct, throw an error
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error: program failed to link: ' + gl.getProgramInfoLog(program));
    }
   //return the now finished (as in linked) program
    return program;
  }
}
