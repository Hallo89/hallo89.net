var boxesArray = []; //Holding the '.info_box' items after they have been converted from a nodeList to an array

const boxes = document.querySelectorAll('.box'); //all boxes
const infoboxes = document.querySelectorAll('.info_box'); //all local tools

//Event-listeners which do stuff - ForEach not valid due to IE support
 //Execution of the procedure of choosing an item in the main menu
for (i = 0; i < infoboxes.length; i++) {
  infoboxes[i].addEventListener('mousedown', choseItem);
}

//activation of the clicked item in the main menu
function choseItem() {
// convert nodeList of all boxes to an array -> boxesArray
  for (i = 0; i < boxes.length; i++) {
    boxesArray.push(boxes[i]);
  }
  if (boxesArray.indexOf(this) >= -1) {
    boxesArray.splice(boxesArray.indexOf(this), 1);
  }
//end of converting
  document.body.classList.add('noselect');
  for (i = 0; i < boxesArray.length; i++) {
    boxesArray[i].classList.add('nodisplay');
  }
  document.body.classList.remove('info_mode');
  this.classList.add('active_item');
  this.children[2].classList.add('nodisplay'); //info_description

  for (i = 0; i < infoboxes.length; i++) {
    infoboxes[i].removeEventListener('mousedown', choseItem);
  }
}
