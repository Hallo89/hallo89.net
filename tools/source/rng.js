//predefined file-global variables
var randomNumbers = '';

//consts filled with elements which are used in this file
 //<input>s with their specific tasks - self-explanatory
const amount = document.getElementById('figures_amount');
const start = document.getElementById('figures_start');
const end = document.getElementById('figures_end');
const aftercomma = document.getElementById('figures_aftercomma');

const buttonAppend = document.getElementById('figures_append'); //the append button

const figuresOutput = document.getElementById('output'); //The heart of the program where everything takes place

//Both heart and brain
function randomNumber() {
  let valueAmount = parseInt(amount.value);
  let valueStart = parseInt(start.value);
  let valueEnd = parseInt(end.value);
  let valueAftercomma = parseInt(aftercomma.value);
  let valueLength = valueEnd - valueStart;
  if (!buttonAppend.classList.contains('active')) {
    randomNumbers = "";
  }
  for (var i = 0; i < valueAmount; i++) {
    randomNumbers += '<span>' + (valueLength*Math.random() + valueStart).toFixed(valueAftercomma) + '</span>';
  }
  figuresOutput.innerHTML = randomNumbers;
}

//Toggle append mode which is self-explanatory
function toggleRandomMode() {
  buttonAppend.classList.toggle('active');
}
