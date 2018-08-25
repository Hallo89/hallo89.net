//predefined file-global variables
var request = new XMLHttpRequest(); //The core of the program generating the structure to send requests to the API
var value; //The input value. Simple.
var it = 0; //The number of what request/container iteration the request is currently on

//consts filled with elements which are used in this file
const input = document.querySelector('#function_mocking .text_input .text_box'); //The input textarea everything begins with
const outputCount = document.getElementById('output_count'); //The number input deciding how many outputs will be generated
const outputs = document.querySelectorAll('.text_output .text_box');
const containersOutput = document.querySelectorAll('.text_output');
const thisFunction = document.getElementById('function_mocking');

//event listeners


//functions
function mocking() {
  value = input.value;
  if (value == '') {
    return;
  }
  request.responseType = 'json';
  while (value.indexOf(' ') >= 0) {
    value = value.replace(' ', '%20');
  }
  while (value.indexOf('\n') >= 0) {
    value = value.replace('\n', '<br>');
  }
  for (var i = 0; i < outputs.length; i++) {
    outputs[i].innerHTML = '';
  }
  handleRequest();
}

function handleRequest() {
  request.open('GET', 'https://www.api.sparxdev.de/mockingbob/?value=' + value);
  request.send();
}

request.onload = function(e) {
  outputs[it].innerHTML = request.response.output;
  it++;
  request.abort();
  if (it < containersOutput.length) {
    handleRequest();
  }
  else if (it = containersOutput.length) {
    it = 0;
  }
}

function focusOutputCount() {
  outputCount.focus();
}
