//The absolute legend being the code for the vertex shader which is the one computing the position and stuff for one object
var vertexSource = `#version 300 es

in vec4 position;
in vec3 color;

out vec4 fragColor;

uniform mat4 matrixOrtho;
uniform mat4 matrixTranslate;
uniform mat4 matrixRotateX;
uniform mat4 matrixRotateY;
uniform mat4 matrixRotateZ;
uniform mat4 matrixScale;

void main() {
    fragColor = vec4(color, 1);
    mat4 finalMatrix = matrixOrtho * matrixTranslate * matrixRotateX * matrixRotateY * matrixRotateZ * matrixScale;

    gl_Position = finalMatrix * position;
}
`;
