//predefined file-global variables
var indexMarker1 = 0;
var indexMarker2;
var currentLength;

//consts filled with elements which are used in this file
const minifyInput = document.getElementById('minify_json'); //The <input> which processes the file which has been.. well, input
const minifyLabel = document.getElementById('minify_json_label'); //The label of above, on which the user clicks

const containerMinify = document.getElementById('function_3');

//JSON minifier (literally just that)
function minifyJson() {
  let reader = new FileReader();
  let keyFile = minifyInput.files[0];
  minifyLabel.innerHTML = 'Browse... ► ' + keyFile.name;
  reader.readAsText(keyFile);
  reader.onload = function(e) {
    let fileContent = e.target.result;
    fileContent = JSON.stringify(JSON.parse(fileContent));
/*    while (fileContent.indexOf('\n') >= 0) {
      fileContent = fileContent.replace('\n', '');
    }
    while (fileContent.indexOf('	') >= 0) {
      fileContent = fileContent.replace('	', '');
    }
    while (indexMarker1 >= 0) {
      indexMarker2 = fileContent.indexOf('"', indexMarker1 + 1);
      let fragContent = fileContent.slice(indexMarker1 + 1, indexMarker2);
      let startContent = fileContent.slice(0, indexMarker1 + 1);
      let endContent = fileContent.slice(indexMarker2);
      while (fragContent.indexOf(' ') >= 0) {
        fragContent = fragContent.replace(' ', '');
      }
      currentLength = (startContent + fragContent).length;
      fileContent = startContent + fragContent + endContent;
      indexMarker1 = fileContent.indexOf('"', currentLength + 1);
    }*/
    containerMinify.innerHTML = fileContent;
  }
}
