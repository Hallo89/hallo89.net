'use strict';
class Controls3D {
  _hasGamepad = false;
  _gamepads = {};

  // Persistant transform properties, here initial
  _clickState = {};
  _clickedBtn;

  // Animation helper properties
  animationID = {
    scale: -1,
    tran: -1,
    rot: -1
  };
  animationInitial = {
    scale: null,
    tran: null,
    rot: null
  };

  // Configurable properties
  drawFunction;

  joystickThreshold = .14;

  mod = {
    scale: .224,
    tran: .025,
    rot: .44
  };
  gamepadMod = {
    scale: .015,
    tran: .25,
    rot: .75
  };

  // State
  state = {
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

  constructor(canvas, drawFunction, skipEvents) {
    this.drawFunction = drawFunction;

    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    if (!skipEvents) {
      // This permanently binds the methods to `this` (e.g. to be able to remove the event)
      this.mouseMove = this.mouseMove.bind(this);
      this.gamepadLoop = this.gamepadLoop.bind(this);

      canvas.addEventListener('pointerdown', this.mouseDown.bind(this));
      window.addEventListener('pointerup', this.removeMouseMove.bind(this));
      canvas.addEventListener('wheel', this.wheel.bind(this)); //TODO: support for mousewheel

      window.addEventListener('gamepadconnected', this.gamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.gamepadDisconnected.bind(this));
    }
  }

  // ---- GamepadEvent functions ----
  gamepadConnected(e) {
    this._gamepads[e.gamepad.index] = e.gamepad;
    this._hasGamepad = true;
    this.gamepadLoop();
  }
  gamepadDisconnected(e) {
    delete this._gamepads[e.gamepad.index];
    if (Object.keys(this._gamepads).length == 0) {
      this._hasGamepad = false;
    }
  }

  gamepadLoop() {
    for (const gamepadIndex in this._gamepads) {
      const gamepad = this._gamepads[gamepadIndex];

      // Scale, LB/RB
      if (gamepad.buttons[4].pressed || gamepad.buttons[5].pressed) {
        const direction = gamepad.buttons[5].value || -gamepad.buttons[4].value;
        if (direction) {
          this.animateStates(35, {
            scale: {
              x: direction * this.gamepadMod.scale,
              y: direction * this.gamepadMod.scale,
              z: direction * this.gamepadMod.scale
            }
          }, undefined, undefined, true);
        }
      }

      // Translate, left joystick
      this.handleJoystick([gamepad.axes[0], -gamepad.axes[1]], gamepad.buttons[10], 'tran');

      // Rotate, right joystick
      this.handleJoystick([gamepad.axes[3], gamepad.axes[2]], gamepad.buttons[11], 'rot');
    }

    if (this._hasGamepad) {
      requestAnimationFrame(this.gamepadLoop);
    }
  }

  handleJoystick(axes, resetButton, action) {
    let hasNewState = false;
    const newState = {};
    newState[action] = {};

    if (axes[0] > this.joystickThreshold || axes[0] < -this.joystickThreshold) {
      hasNewState = true;
      newState[action].x = (axes[0] * this.gamepadMod[action]) + this.state[action].x;
    }
    if (axes[1] > this.joystickThreshold || axes[1] < -this.joystickThreshold) {
      hasNewState = true;
      newState[action].y = (axes[1] * this.gamepadMod[action]) + this.state[action].y;
    }

    if (hasNewState) {
      this.assignNewStateAndDraw(newState);
    }

    // Reset distance when right joystick is pressed
    if (resetButton.pressed) {
      newState[action].x = 0;
      newState[action].y = 0;
      this.assignNewStateAndDraw(newState);
    }
  }

  // ---- MouseEvent functions ----
  async wheel(e) {
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
        axesAmounts[axis] = direction * this.mod.scale;
      }

      await this.animateStates(45, { scale: axesAmounts }, undefined, undefined, true);
    }
  }

  mouseMove(e) {
    if (this._clickedBtn == 0) {
      //LMB, translation
      const distance = {
        x: this._clickState.tran.x + (e.screenX - this._clickState.x) * this.mod.tran,
        y: this._clickState.tran.y - (e.screenY - this._clickState.y) * this.mod.tran
      };
      if (distance.x || distance.y) {
        this.assignNewStateAndDraw({
          tran: distance
        });
      }
    } else if (this._clickedBtn == 2) {
      //RMB, rotation
      //x and y are swapped because of the OpenGL 3D coordinate system axes
      const distance = {
        x: this._clickState.rot.x + (e.screenY - this._clickState.y) * this.mod.rot,
        y: this._clickState.rot.y + (e.screenX - this._clickState.x) * this.mod.rot
      };
      if (distance.x || distance.y) {
        this.assignNewStateAndDraw({
          rot: distance
        });
      }
    }
  }

  mouseDown(e) {
    if (e.button == 1) e.preventDefault();
    this._clickedBtn = e.button;
    this._clickState.x = e.screenX;
    this._clickState.y = e.screenY;
    this._clickState.tran = Object.assign({}, this.state.tran);
    this._clickState.rot = Object.assign({}, this.state.rot);
    window.addEventListener('pointermove', this.mouseMove);
  }
  removeMouseMove() {
    window.removeEventListener('pointermove', this.mouseMove);
  }

  // ---- Animation ----
  animateStatesSteps(duration, animationSteps, ...args) {
    animationSteps = Object.entries(animationSteps)
      .map(val => {
        val[0] = (Number(val[0]) / 100) * duration;
        return val;
      })
      .sort((val1, val2) => val1[0] > val2[0]);

    return new Promise(async resolve => {
      let prevStepTime = 0;

      for (const step of animationSteps) {
        const stepDuration = step[0] - prevStepTime;
        prevStepTime = step[0];

        await this.animateStates(stepDuration, step[1], ...args);
      }

      resolve();
    });
  };

  animateStates(
    duration, statesAmounts, drawCallback = this.drawFunction, easingFn = Controls3D.Easing.LINEAR, allowStacking
  ) {
    const that = this;

    return new Promise(resolve => {
      const usedStateNames = Object.keys(statesAmounts);
      let currentAnimationID = Infinity;
      let startTime;

      if (!allowStacking && usedStateNames.every(key => that.animationID[key] === -1)) {
        for (const stateName in that.state) {
          if (that.animationID[stateName] === -1) {
            updateInitialState(stateName);
          }
        }
      }

      requestAnimationFrame(step);

      function step(now) {
        // The first frame is empty to start the timings
        if (startTime == null) {
          startTime = now;
        } else if (currentAnimationID === Infinity) {
          // This is always the second frame
          currentAnimationID = 1 +
            usedStateNames.reduce((acc, curr) => Math.max(acc, that.animationID[curr]), -1);
          for (const stateName of usedStateNames) {
            // If stacking – as seen on scroll – is used, continuously advance the initial state
            if (allowStacking) {
              updateInitialState(stateName);
            }
            that.animationID[stateName] = currentAnimationID;
          }
        } else if (usedStateNames.some(key => currentAnimationID < that.animationID[key])) {
          // Abort if another animation on the current property has started and has reached the second frame
          return;
        }
        const totalElapsed = now - startTime;

        if (totalElapsed !== 0) {
          for (const stateName of usedStateNames) {
            const axesAmounts = statesAmounts[stateName];
            for (const axis in axesAmounts) {
              const stepModifier = (totalElapsed >= duration ? 1 : easingFn(totalElapsed / duration));
              that.state[stateName][axis] = that.animationInitial[stateName][axis] + stepModifier * axesAmounts[axis];
            }
          }

          drawCallback();
        }

        if (totalElapsed < duration) {
          requestAnimationFrame(step);
        } else {
          for (const stateName of usedStateNames) {
            that.animationID[stateName] = -1;
          }
          resolve();
        }
      }
    });

    function updateInitialState(stateName) {
      that.animationInitial[stateName] = Object.assign({}, that.state[stateName]);
    }
  }

  assignNewStateAndDraw(newState) {
    this.assignNewState(newState);
    this.drawFunction();
  }

  assignNewState(newState) {
    for (const action in newState) {
      Object.assign(this.state[action], newState[action]);
    }
  }

  // ---- Statics ----
  // Mostly taken from https://easings.net/
  static Easing = {
    LINEAR: x => x,

    EASE_IN_SINE: x => 1 - Math.cos((x * Math.PI) / 2),
    EASE_IN_QUAD: x => x * x,
    EASE_IN_CUBIC: x => x * x * x,

    EASE_OUT_SINE: x => Math.sin((x * Math.PI) / 2),
    EASE_OUT_QUAD: x => 1 - (1 - x) * (1 - x),
    EASE_OUT_CUBIC: x => 1 - Math.pow(1 - x, 3),

    EASE_IN_OUT_SINE: x => -(Math.cos(Math.PI * x) - 1) / 2,
    EASE_IN_OUT_QUAD: x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    EASE_IN_OUT_CUBIC: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,

    EASE: x => {
      return x < 0.2059
        ? (5.2 * Math.pow(x, 1.8))
        : (1 - 1.3 * Math.pow(1 - x, 2.7));
    },
  };
}
