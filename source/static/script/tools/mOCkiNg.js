//Global js for 'text-input-output' infrastructure (used by mocking and spacing) is stored in textio.js

function execute() {
  mockingText();
}

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
    while (i > 1) {
      if (inputValue[ln1] && !inputValue[ln1].hasCasing()) {
        ln1--;
        ln2--;
      }
      if (inputValue[ln2] && !inputValue[ln2].hasCasing()) {
        ln2--;
      }
      if (!inputValue[ln2] || !inputValue[ln1] || inputValue[ln1].hasCasing() && inputValue[ln2].hasCasing()) {
        break;
      }
    }
    if (inputValue[i].hasCasing()) {
      outputValue += mockify(inputValue, outputValue, i, ln1, ln2);
    } else {
      outputValue += inputValue[i];
    }
  }
  outputValue = outputValue.replace(/\n/g, '<br>');
  output.innerHTML = outputValue;
}

function mockify(inputText, outputText, index1, index2, index3) {
  if (outputText[index2] && outputText[index3] && outputText[index2].isUpperCase() && outputText[index3].isUpperCase()) {
    return inputText[index1].toLowerCase();
  } else if (outputText[index2] && outputText[index3] && outputText[index2].isLowerCase() && outputText[index3].isLowerCase()) {
    return inputText[index1].toUpperCase();
  } else {
    return Math.round(Math.random()) == 1 ? inputText[index1].toUpperCase() : inputText[index1].toLowerCase();
  }
}

String.prototype.hasCasing = function() {
  return this.toUpperCase() != this.toLowerCase();
};

String.prototype.isLowerCase = function() {
  return this == this.toLowerCase();
};

String.prototype.isUpperCase = function() {
  return this == this.toUpperCase();
};
