//predefined file-global variables
var request = new XMLHttpRequest(); //The core of the program generating the structure to send requests to the API

//consts filled with elements which are used in this file
const input = document.querySelector('.input_box.text_input .input.text'); //The input textarea everything begins with
const output = document.getElementById('output');
const box = document.querySelector('.box');
const header = document.querySelector('.box .box_header');
const input2 = document.querySelector('.box .input_container:nth-child(3)');

//Event listeners
input.addEventListener('input', resizeInput);
input.addEventListener('keydown', recordEnter);

//Being executed on pageload
resizeInput();

//functions
function mockingText() {
  let value = input.value;
  if (value == '') {
    output.innerHTML = '';
    return;
  }
  let outputValue = '';
  for (i = 0; i < value.length; i++) {
    if (i > 1 && outputValue[i-1] == outputValue[i-1].toUpperCase() && outputValue[i-2] == outputValue[i-2].toUpperCase()) {
      outputValue += value[i].toLowerCase();
    } else if (i > 1 && outputValue[i-1] == outputValue[i-1].toLowerCase() && outputValue[i-2] == outputValue[i-2].toLowerCase()) {
      outputValue += value[i].toUpperCase();
    } else {
      outputValue += Math.round(Math.random()) == 1 ? value[i].toUpperCase() : value[i].toLowerCase();
    }
  }
  while (outputValue.indexOf('\n') >= 0) {
    outputValue = outputValue.replace('\n', '<br>');
  }
  output.innerHTML = outputValue;
}

function resizeInput() {
  input.style.height = null;
  input.style.height = input.scrollHeight - 6 + 'px';
}

function recordEnter(e) {
  if (e.key == 'Enter' && e.ctrlKey) {
    mockingText();
  }
}
