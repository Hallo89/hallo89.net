'use strict';
var Controls3D = (function() {
  let hasGamepad = false;
  const gamepads = {};

  function Controls3D(canvas, drawFunction, skipEvents) {
    const that = this;

    // persistant transform properties, here initial
    const clickState = {};
    let clickedBtn;

    that.drawFunction = drawFunction;
    that.animationID = {
      scale: -1,
      tran: -1,
      rot: -1
    };

    that.joystickThreshold = .14;

    that.mod = {
      scale: .224,
      tran: .025,
      rot: .44
    };
    that.gamepadMod = {
      scale: .015,
      tran: .25,
      rot: .75
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

      window.addEventListener('gamepadconnected', gamepadConnected.bind(that));
      window.addEventListener('gamepaddisconnected', gamepadDisconnected.bind(that));
    }


    // ---- GamepadEvent functions ----
    function gamepadConnected(e) {
      gamepads[e.gamepad.index] = e.gamepad;
      hasGamepad = true;
      gamepadLoop();
    }
    function gamepadDisconnected(e) {
      delete gamepads[e.gamepad.index];
      if (Object.keys(gamepads).length == 0) {
        hasGamepad = false;
      }
    }

    function gamepadLoop() {
      for (const gamepadIndex in gamepads) {
        const gamepad = gamepads[gamepadIndex];

        // Scale, LB/RB
        if (gamepad.buttons[4].pressed || gamepad.buttons[5].pressed) {
          const direction = gamepad.buttons[5].value || -gamepad.buttons[4].value;
          if (direction) {
            that.animateProperty('scale', ['x', 'y', 'z'], direction * that.gamepadMod.scale, 35);
          }
        }

        // Translate, left joystick
        handleJoystick([gamepad.axes[0], -gamepad.axes[1]], gamepad.buttons[10], 'tran');

        // Rotate, right joystick
        handleJoystick([gamepad.axes[3], gamepad.axes[2]], gamepad.buttons[11], 'rot');
      }

      if (hasGamepad) {
        requestAnimationFrame(gamepadLoop);
      }
    }

    function handleJoystick(axes, resetButton, action) {
      let hasNewState = false;
      const newState = {};
      newState[action] = {};

      if (axes[0] > that.joystickThreshold || axes[0] < -that.joystickThreshold) {
        hasNewState = true;
        newState[action].x = (axes[0] * that.gamepadMod[action]) + that.state[action].x;
      }
      if (axes[1] > that.joystickThreshold || axes[1] < -that.joystickThreshold) {
        hasNewState = true;
        newState[action].y = (axes[1] * that.gamepadMod[action]) + that.state[action].y;
      }

      if (hasNewState) {
        that.assignNewStateAndDraw(newState);
      }

      // Reset distance when right joystick is pressed
      if (resetButton.pressed) {
        newState[action].x = 0;
        newState[action].y = 0;
        that.assignNewStateAndDraw(newState);
      }
    }

    // ---- MouseEvent functions ----
    async function wheel(e) {
      if (e.ctrlKey) e.preventDefault();
      if (e.deltaY) {
        const direction = -1 * (e.deltaY / Math.abs(e.deltaY)); // either 1 or -1

        let usedAxes;
        if (e.ctrlKey && e.shiftKey)
          usedAxes = ['z'];
        else if (e.ctrlKey)
          usedAxes = ['y'];
        else if (e.shiftKey)
          usedAxes = ['x'];
        else
          usedAxes = ['x', 'y', 'z'];

        const axesAmounts = {};
        for (const axis of usedAxes) {
          axesAmounts[axis] = direction * that.mod.scale;
        }

        await that.animateProperty('scale', 45, axesAmounts);
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
  Controls3D.prototype.animateProperty = function(property, duration, axesAmounts, drawCallback) {
    const that = this;
    return new Promise(resolve => {
      let currentAnimationID = Infinity;
      let startTime;
      let initialAmounts;

      requestAnimationFrame(step);

      function step(now) {
        // The first frame is empty to start the timings
        if (startTime == null) {
          startTime = now;
        } else if (currentAnimationID === Infinity) {
          // This is always the second frame
          currentAnimationID = ++that.animationID[property];
          initialAmounts = Object.assign({}, that.state[property]);
        } else if (currentAnimationID < that.animationID[property]) {
          // Abort if another animation on the current property has started
          // and has reached the second frame
          return;
        }
        const totalElapsed = now - startTime;

        if (initialAmounts) {
          for (const axis in axesAmounts) {
            const stepAmount = (totalElapsed / duration) * axesAmounts[axis];
            if (stepAmount) {
              that.state[property][axis] = initialAmounts[axis] + stepAmount;
            }
          }

          if (drawCallback) {
            drawCallback();
          } else {
            that.drawFunction();
          }
        }

        if (totalElapsed < duration) {
          requestAnimationFrame(step);
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
