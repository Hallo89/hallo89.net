//consts filled with elements which are used in this file
const input = document.querySelector('.input_box.text_input .input.text'); //The input textarea everything begins with
const output = document.getElementById('output');

//Event listeners
input.addEventListener('input', resizeInput);
input.addEventListener('keydown', recordEnter);

//Being executed on pageload
resizeInput();

//functions
function mockingText() {
  let inputValue = input.value;
  if (inputValue == '') {
    output.innerHTML = '';
    return;
  }
  let processValue = inputValue.replace(/\n/g, '');
  let outputValue = '';
  for (let i = 0; i < processValue.length; i++) {
    if (i > 1 && outputValue[i-1] == outputValue[i-1].toUpperCase() && outputValue[i-2] == outputValue[i-2].toUpperCase()) {
      outputValue += processValue[i].toLowerCase();
    } else if (i > 1 && outputValue[i-1] == outputValue[i-1].toLowerCase() && outputValue[i-2] == outputValue[i-2].toLowerCase()) {
      outputValue += processValue[i].toUpperCase();
    } else {
      outputValue += Math.round(Math.random()) == 1 ? processValue[i].toUpperCase() : processValue[i].toLowerCase();
    }
  }
  for (let i = 0; i < inputValue.match(/\n/g).length; i++) {
    outputValue = outputValue.slice(0, inputValue.indexOf('\n') + 5*i) + '<br>' + outputValue.slice(inputValue.indexOf('\n') + 5*i);
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
