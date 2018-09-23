//The absolute legend being the code for the vertex shader which is the one computing the position and stuff for one object
var vertexSource = `#version 300 es

in vec2 position;
//uniform vec2 resolution;
uniform vec4 offset;

void main() {
    //convert from 0->1 to 0->2 to -1->+1 (clipspace)
    //vec2 clipSpace = (position/resolution) * 2.0 - 1.0;

    gl_Position = vec4(position, 0, 1) + offset;
}
`;
