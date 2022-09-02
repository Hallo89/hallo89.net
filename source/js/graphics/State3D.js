'use strict';
class State3D {
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

  _drawFunction;

  // Animation helper properties
  _animationID = {
    scale: -1,
    tran: -1,
    rot: -1
  };
  _animationInitial = {
    scale: null,
    tran: null,
    rot: null
  };

  // State
  state = {};

  constructor(drawFunction, initialState) {
    this._drawFunction = drawFunction;

    this.state = initialState || {
      scale: {
        x: 0,
        y: 0,
        z: 0
      },
      tran: {
        x: 0,
        y: 0,
        z: 0
      },
      rot: {
        x: 0,
        y: 0,
        z: 0
      }
    };
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
    duration, statesAmounts, drawCallback = this._drawFunction, easingFn = State3D.Easing.LINEAR, allowStacking
  ) {
    const that = this;

    return new Promise(resolve => {
      const usedStateNames = Object.keys(statesAmounts);
      let currentAnimationID = Infinity;
      let startTime;

      if (!allowStacking && usedStateNames.every(key => that._animationID[key] === -1)) {
        for (const stateName in that.state) {
          if (that._animationID[stateName] === -1) {
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
            usedStateNames.reduce((acc, curr) => Math.max(acc, that._animationID[curr]), -1);
          for (const stateName of usedStateNames) {
            // If stacking – as seen on scroll – is used, continuously advance the initial state
            if (allowStacking) {
              updateInitialState(stateName);
            }
            that._animationID[stateName] = currentAnimationID;
          }
        } else if (usedStateNames.some(key => currentAnimationID < that._animationID[key])) {
          // Abort if another animation on the current property has started and has reached the second frame
          return;
        }
        const totalElapsed = now - startTime;

        if (totalElapsed !== 0) {
          for (const stateName of usedStateNames) {
            const axesAmounts = statesAmounts[stateName];
            for (const axis in axesAmounts) {
              const stepModifier = (totalElapsed >= duration ? 1 : easingFn(totalElapsed / duration));
              that.state[stateName][axis] = that._animationInitial[stateName][axis] + stepModifier * axesAmounts[axis];
            }
          }

          drawCallback();
        }

        if (totalElapsed < duration) {
          requestAnimationFrame(step);
        } else {
          for (const stateName of usedStateNames) {
            that._animationID[stateName] = -1;
          }
          resolve();
        }
      }
    });

    function updateInitialState(stateName) {
      that._animationInitial[stateName] = Object.assign({}, that.state[stateName]);
    }
  }

  // ---- Helper functions ----
  assignNewStateAndDraw(newState) {
    this.assignNewState(newState);
    this._drawFunction();
    return this;
  }

  assignNewState(newState) {
    for (const action in newState) {
      Object.assign(this.state[action], newState[action]);
    }
    return this;
  }
}
