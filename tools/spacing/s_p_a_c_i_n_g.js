//Global js for 'text-input-output' infrastructure (used by mocking and spacing) is stored in textio.js
const inputExtra = document.querySelector('.input.extraspaces');
const inputAmount = document.querySelector('.input.spacesamount');
const inputFiller = document.querySelector('.input.filler');

function execute() {
  spacify();
}

new Slider89(document.getElementById('slider_spacesamount'), {
  replaceNode: true,
  max: 10,
  value: 1,
  width: 150,
  classList: ['input_box', 'tipper'],
  structure: '<caption class(input_header)><wrapper><knob><tooltip></wrapper>',
  caption: 'Number of spaces'
});

function spacify() {
  const inputValue = input.value;
  if (inputValue == '') {
    output.innerHTML = '';
    return;
  }
  let filler = '';
  for (var i = 0; i < inputAmount.value; i++) {
    filler += inputFiller.value;
  }
  let outputValue = '';
  for (var i = 0; i < inputValue.length; i++) {
    if (inputExtra.classList.contains('active') && inputValue[i] != ' ' || !inputExtra.classList.contains('active')) {
      outputValue += inputValue[i] != filler && inputValue[i+1] != null ? inputValue[i] + filler : inputValue[i];
    }
  }
  output.innerHTML = outputValue;
}
