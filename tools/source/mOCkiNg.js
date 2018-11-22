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
  let outputValue = '';
  for (let i = 0; i < inputValue.length; i++) {
    let ln1 = i-1;
    let ln2 = i-2;
    while (true) {
      if (inputValue[ln1] == '\n') {
        ln1--;
        ln2--;
      }
      if (inputValue[ln2] == '\n') {
        ln2--;
      }
      if (inputValue[ln1] != '\n' && inputValue[ln2] != '\n') {
        break;
      }
    }
    if (inputValue[i] != '\n') {
      outputValue += mockify(inputValue, outputValue, i, ln1, ln2);
    } else {
      outputValue += inputValue[i];
    }
  }
  outputValue = outputValue.replace(/\n/g, '<br>');
  output.innerHTML = outputValue;
}

function mockify(inputText, outputText, index1, index2, index3) {
  if (outputText[index2] && outputText[index3] && outputText[index2] == outputText[index2].toUpperCase() && outputText[index3] == outputText[index3].toUpperCase()) {
    return inputText[index1].toLowerCase();
  } else if (outputText[index2] && outputText[index3] && outputText[index2] == outputText[index2].toLowerCase() && outputText[index3] == outputText[index3].toLowerCase()) {
    return inputText[index1].toUpperCase();
  } else {
    return Math.round(Math.random()) == 1 ? inputText[index1].toUpperCase() : inputText[index1].toLowerCase();
  }
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
