//Nodes of the page
const input = document.querySelector('.input_box.text_input .input.text'); //The input textarea everything begins with
const output = document.getElementById('output');

//Event listeners
input.addEventListener('input', resizeInput);
input.addEventListener('keydown', recordEnter);

//Executed on pageload
resizeInput();

//Functions
function resizeInput() {
  input.style.height = null;
  input.style.height = input.scrollHeight - 6 + 'px';
}

function recordEnter(e) {
  if (e.key == 'Enter' && e.ctrlKey) {
    execute();
  }
}
