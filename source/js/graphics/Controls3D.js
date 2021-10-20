'use strict';
var Controls3D = (function() {
  function Controls3D(canvas, drawFunction, skipEvents) {
    const that = this;

    that.drawFunction = drawFunction;
    that.animationID = {
      scale: null,
      tran: null,
      rot: null
    };

    //persistant transform properties, here initial
    const clickState = {};
    let clickedBtn;

    that.mod = {
      scale: .224,
      tran: .025,
      rot: .44
    };

    that.state = {
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      tran: {
        x: 0,
        y: 0,
        z: 0
      },
      rot: {
        x: 0,
        y: 0,
        z: 0 //not implemented yet
      }
    };

    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    if (!skipEvents) {
      canvas.addEventListener('mousedown', mouseDown);
      window.addEventListener('mouseup', removeMouseMove);
      canvas.addEventListener('wheel', wheel); //TODO: support for mousewheel
    }


    // ---- MouseEvent functions ----
    async function wheel(e) {
      if (e.ctrlKey) e.preventDefault();
      if (e.deltaY) {
        const direction = -1 * (e.deltaY / Math.abs(e.deltaY)); //either 1 or -1
        let usedAxes

        if (e.ctrlKey && e.shiftKey)
          usedAxes = ['z'];
        else if (e.ctrlKey)
          usedAxes = ['y'];
        else if (e.shiftKey)
          usedAxes = ['x'];
        else
          usedAxes = ['x', 'y', 'z'];

        await that.animateProperty('scale', usedAxes, direction * that.mod.scale, 45);
      }
    }

    function mouseMove(e) {
      if (clickedBtn == 0) {
        //LMB, translation
        const distance = {
          x: clickState.tran.x + (e.screenX - clickState.x) * that.mod.tran,
          y: clickState.tran.y - (e.screenY - clickState.y) * that.mod.tran
        };
        if (distance.x || distance.y) {
          that.assignNewStateAndDraw({
            tran: distance
          });
        }
      } else if (clickedBtn == 2) {
        //RMB, rotation
        //x and y are swapped because of the OpenGL 3D coordinate system axes
        const distance = {
          x: clickState.rot.x + (e.screenY - clickState.y) * that.mod.rot,
          y: clickState.rot.y + (e.screenX - clickState.x) * that.mod.rot
        };
        if (distance.x || distance.y) {
          that.assignNewStateAndDraw({
            rot: distance
          });
        }
      }
    }

    function mouseDown(e) {
      if (e.button == 1) e.preventDefault();
      clickedBtn = e.button;
      clickState.x = e.screenX;
      clickState.y = e.screenY;
      clickState.tran = Object.assign({}, that.state.tran);
      clickState.rot = Object.assign({}, that.state.rot);
      window.addEventListener('mousemove', mouseMove);
    }
    function removeMouseMove() {
      window.removeEventListener('mousemove', mouseMove);
    }
  }

  // ---- Prototype functions ----
  Controls3D.prototype.animateProperty = function(property, axesArr, totalAmount, duration, drawCallback) {
    const that = this;
    return new Promise(resolve => {
      let startTime;
      let prevTime;

      requestAnimationFrame(step);

      function step(now) {
        if (startTime == null) {
          startTime = now;
          prevTime = now;
        } else if (that.animationID[property] != null) {
          // Cancelling other frames after the first frame for a smooth continous scroll
          cancelAnimationFrame(that.animationID[property]);
          that.animationID[property] = null;
        }
        const totalElapsed = now - startTime;
        const stepElapsed = now - prevTime;
        const cycleAmount = (stepElapsed / duration) * totalAmount;

        if (cycleAmount) {
          for (const axis of axesArr) {
            that.state[property][axis] += cycleAmount;
          }

          if (drawCallback) {
            drawCallback();
          } else {
            that.drawFunction();
          }
        }

        if (totalElapsed < duration) {
          prevTime = now;
          that.animationID[property] = requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
    });
  }

  Controls3D.prototype.assignNewStateAndDraw = function(newState) {
    this.assignNewState(newState);
    this.drawFunction();
  }

  Controls3D.prototype.assignNewState = function(newState) {
    for (const action in newState) {
      Object.assign(this.state[action], newState[action]);
    }
  }

  return Controls3D;
})();
