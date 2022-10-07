'use strict';
/**
 * @typedef { import('./State3D.js') }
 *
 * @typedef {Record<StateName, number>} Controls3DModifier
 *
 * @typedef {object} Controls3DConfig
 * @prop {Controls3DModifier} mod
 * @prop {Controls3DModifier} gamepadMod
 * @prop {{ tran: number, rot: number }} buttons
 * @prop {boolean | { contextmenu: boolean, mousemove: boolean, mousewheel: boolean, touch: boolean }} disableEvents
 * @prop {number} joystickThreshold
 * @prop {boolean} dontInvertTranY
 * @prop {boolean} skipScaleKeyModifier
 * @prop {boolean} useProportionalScale
 */

class Controls3D {
  _hasGamepad = false;
  _gamepads = {};

  _eventTarget;

  // Persistent transform properties between events
  _clickState = {};
  _clickedBtn;

  _touchStateTran;
  _touchStartDistance;
  _activeTouchData = [];
  _activeTouchIDs;

  /**
   * @type Controls3DConfig
   */
  config = {
    mod: {
      scale: .224,
      tran: .025,
      rot: .44
    },
    gamepadMod: {
      scale: .015,
      tran: .25,
      rot: .75
    },
    // TODO The gamepad buttons are not configurable yet
    buttons: {
      tran: 0,
      rot: 2
    },
    joystickThreshold: .14,
    disableEvents: false,
    dontInvertTranY: false,
    // NOTE: If need arises, perhaps implement a system for individual ctrl/shift mods
    skipScaleKeyModifier: false,
    useProportionalScale: false,
  };

  /**
   * @type State3D
   */
  state;

  /**
   * @param {EventTarget} [eventTarget] The DOM Element to receive the mouse and mousewheel events.
   *                                   If left unspecified, use {@link changeEventTarget}.
   * @param {State3D} [initialState] A directly assigned state.
   *                                If left unspecified, use {@link changeState}.
   * @param {Partial<Controls3DConfig>} [config] A subset of the configuration options.
   */
  constructor(eventTarget, initialState, config) {
    if (initialState) {
      this.changeState(initialState);
      this.state.assignNewState({ scale: { x: 1, y: 1, z: 1 } });
    }
    if (config) {
      this.assignNewConfig(config);
    }

    // This permanently binds the methods to `this` (e.g. to be able to remove the event)
    this.preventContext = this.preventContext.bind(this);

    this.touchDown = this.touchDown.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchUp = this.touchUp.bind(this);

    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);

    this.wheel = this.wheel.bind(this);

    this.gamepadLoop = this.gamepadLoop.bind(this);

    if (!this.config.disableEvents) {
      window.addEventListener('pointerup', this.removeMouseMove.bind(this));

      window.addEventListener('gamepadconnected', this.gamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.gamepadDisconnected.bind(this));

      if (eventTarget) {
        this.changeEventTarget(eventTarget);
      }
    }
  }

  // ---- Context switching functions ----
  /**
   * Assign a new event target.
   * This removes currently attached events and attaches them to the new target.
   *
   * @param {EventTarget} newEventTarget
   */
  changeEventTarget(newEventTarget) {
    if (this._eventTarget) {
      this.removeTargetEvents(this._eventTarget);
    }
    this.addTargetEvents(newEventTarget);
    this._eventTarget = newEventTarget;
  }

  /**
   * Assign a new State3D instance.
   *
   * @param {State3D} newState
   */
  changeState(newState) {
    this.state = newState;
  }

  // ---- Helper functions ----
  assignNewConfig(newConfig) {
    // Dynamically assigns new fields up to 1 nested object deep
    for (const configName in newConfig) {
      if (!(configName in this.config)) {
        throw new Error(`Controls3D: Config option '${configName}' does not exist!`);
      }

      const configVal = newConfig[configName];
      if (typeof configVal === 'object') {
        this.config[configName] = Object.assign(this.config[configName], configVal);
      } else {
        this.config[configName] = configVal;
      }
    }
  }

  removeTargetEvents(eventTarget) {
    eventTarget.removeEventListener('contextmenu', this.preventContext);
    eventTarget.removeEventListener('pointerdown', this.mouseDown);
    eventTarget.removeEventListener('wheel', this.wheel);

    eventTarget.removeEventListener('touchstart', this.touchDown);
    eventTarget.removeEventListener('touchmove', this.touchMove);
    eventTarget.removeEventListener('touchend', this.touchUp);
    eventTarget.removeEventListener('touchcancel', this.touchUp);
  }
  addTargetEvents(eventTarget) {
    if (!this.config.disableEvents) {
      if (!this.config.disableEvents.contextmenu) {
        eventTarget.addEventListener('contextmenu', this.preventContext);
      }
      if (!this.config.disableEvents.mousemove) {
        eventTarget.addEventListener('pointerdown', this.mouseDown);
      }
      if (!this.config.disableEvents.mousewheel) {
        eventTarget.addEventListener('wheel', this.wheel);
      }
      if (!this.config.disableEvents.touch) {
        eventTarget.addEventListener('touchstart', this.touchDown);
        eventTarget.addEventListener('touchmove', this.touchMove);
        eventTarget.addEventListener('touchend', this.touchUp);
        eventTarget.addEventListener('touchcancel', this.touchUp);
      }
    }
  }

  // ---- Touch events ----
  touchDown(e) {
    if (e.targetTouches.length === 2) {
      e.preventDefault();
      this.initializeTouchData(e.targetTouches);
    }
  }
  touchMove(e) {
    if (e.targetTouches.length >= 2) {
      e.preventDefault();

      const usedTouches = this.getTouchesFromIDs(e.targetTouches, this._activeTouchIDs);
      this.touchTransformTranslate(usedTouches);
      this.touchTransformScale(usedTouches);

      this.state.draw({ touches: usedTouches });
    }
  }
  touchUp(e) {
    if (e.targetTouches.length === 2) {
      // Update initial data to the current fingers, in case a finger was
      // lifted which was responsible for the previous initial data
      this.initializeTouchData(e.targetTouches);
    } else if (e.targetTouches.length < 2) {
      this._activeTouchData = null;
      this._touchStartDistance = null;
      this._touchStateTran = null;
    }
  }

  touchTransformTranslate(usedTouches) {
    const usedMidpoint = Controls3D.computeTouchesMidpoint(...usedTouches);
    const initialMidpoint = Controls3D.computeTouchesMidpoint(...(this._activeTouchData));

    const averageDistance = {
      x: usedMidpoint[0] - initialMidpoint[0],
      y: usedMidpoint[1] - initialMidpoint[1]
    };

    this.state.assignNewState({
      tran: {
        x: this._touchStateTran.x + averageDistance.x,
        y: this._touchStateTran.y + averageDistance.y,
      }
    });
  }
  touchTransformScale(usedTouches) {
    const distance = this.getTouchesDistance(usedTouches[0], usedTouches[1]);

    this.state.assignNewState({
      scale: {
        x: distance / this._touchStartDistance.x,
        y: distance / this._touchStartDistance.y,
        z: distance / this._touchStartDistance.z
      }
    });
  }

  // ---- Touch helper functions ----
  getTouchesDistance(touch1, touch2) {
    return Math.sqrt(
        Math.pow(touch2.screenX - touch1.screenX, 2)
      + Math.pow(touch2.screenY - touch1.screenY, 2));
  }

  // NOTE: It is assumed that all given touchIDs are valid
  getTouchesFromIDs(targetTouches, touchIDs) {
    const usedTouches = new Array(touchIDs.length);
    for (let i = 0; i < usedTouches.length; i++) {
      for (const targetTouch of targetTouches) {
        if (targetTouch.identifier === touchIDs[i]) {
          usedTouches[i] = targetTouch;
        }
      }
    }
    return usedTouches;
  }

  initializeTouchData(usedTouches) {
    const distance = this.getTouchesDistance(usedTouches[0], usedTouches[1]);
    this._touchStartDistance = {
      x: distance / this.state.scale.x,
      y: distance / this.state.scale.y,
      z: distance / this.state.scale.z
    };

    this._activeTouchIDs = [
      usedTouches[0].identifier,
      usedTouches[1].identifier
    ];
    // NOTE Touch objects are supposed to be immutable, but apparently apple reuses
    // them or have reused them at some point. By copying them, I'm going the safe route.
    this._activeTouchData = [
      { clientX: usedTouches[0].clientX, clientY: usedTouches[0].clientY },
      { clientX: usedTouches[1].clientX, clientY: usedTouches[1].clientY }
    ];

    this._touchStateTran = Object.assign({}, this.state.tran);
  }

  // ---- Misc event functions ----
  preventContext(e) {
    e.preventDefault();
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
              x: direction * this.config.gamepadMod.scale,
              y: direction * this.config.gamepadMod.scale,
              z: direction * this.config.gamepadMod.scale
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

    if (axes[0] > this.config.joystickThreshold || axes[0] < -this.config.joystickThreshold) {
      hasNewState = true;
      newState[action].x = (axes[0] * this.config.gamepadMod[action]) + this.state[action].x;
    }
    if (axes[1] > this.config.joystickThreshold || axes[1] < -this.config.joystickThreshold) {
      hasNewState = true;
      newState[action].y = (axes[1] * this.config.gamepadMod[action]) + this.state[action].y;
    }

    if (hasNewState) {
      this.state.assignNewStateAndDraw(newState);
    }

    // Reset distance when right joystick is pressed
    if (resetButton.pressed) {
      newState[action].x = 0;
      newState[action].y = 0;
      this.state.assignNewStateAndDraw(newState);
    }
  }

  // ---- MouseEvent functions ----
  async wheel(e) {
    if (e.ctrlKey) {
      // Return when ctrl is not used as modifier to allow default browser scaling
      if (!this.config.skipScaleKeyModifier) e.preventDefault();
      else return;
    }
    if (e.deltaY) {
      const direction = -1 * (e.deltaY / Math.abs(e.deltaY)); // either 1 or -1

      let usedAxes = ['x', 'y', 'z'];
      if (!this.config.skipScaleKeyModifier) {
        if (e.ctrlKey && e.shiftKey)
          usedAxes = ['z'];
        else if (e.ctrlKey)
          usedAxes = ['y'];
        else if (e.shiftKey)
          usedAxes = ['x'];
      }

      const axesAmounts = {};
      for (const axis of usedAxes) {
        axesAmounts[axis] = direction * this.config.mod.scale;
        if (this.config.useProportionalScale) {
          axesAmounts[axis] *= this.state.scale[axis];
        }
      }

      await this.state.animateStates(45, { scale: axesAmounts }, undefined, State3D.Easing.LINEAR, true);
    }
  }

  mouseMove(e) {
    if (this._clickedBtn === this.config.buttons.tran) {
      // Translation
      const distance = {
        x: this._clickState.tran.x + (e.screenX - this._clickState.x) * this.config.mod.tran,
      };
      // NOTE: y is inverted in 3D space because of OpenGL reasons
      if (this.config.dontInvertTranY === true) {
        distance.y = this._clickState.tran.y + (e.screenY - this._clickState.y) * this.config.mod.tran
      } else {
        distance.y = this._clickState.tran.y - (e.screenY - this._clickState.y) * this.config.mod.tran
      }

      if (distance.x || distance.y) {
        this.state.assignNewStateAndDraw({
          tran: distance
        });
      }
      // TODO
    } else if (this._clickedBtn === this.config.buttons.rot) {
      // Rotation
      // x and y are swapped because of the OpenGL 3D coordinate system axes
      const distance = {
        x: this._clickState.rot.x + (e.screenY - this._clickState.y) * this.config.mod.rot,
        y: this._clickState.rot.y + (e.screenX - this._clickState.x) * this.config.mod.rot
      };
      if (distance.x || distance.y) {
        this.state.assignNewStateAndDraw({
          rot: distance
        });
      }
    }
  }

  mouseDown(e) {
    if (e.button === 1) e.preventDefault();
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

  // ---- Static helper functions ----
  /**
   * Returns the midpoint of two supplied touch objects.
   *
   * @param {Touch} touch0
   * @param {Touch} touch1
   * @return {[number, number]} The resulting midpoint.
   */
  static computeTouchesMidpoint(touch0, touch1) {
    return [
      (touch0.clientX + touch1.clientX) / 2,
      (touch0.clientY + touch1.clientY) / 2,
    ];
  }
}
