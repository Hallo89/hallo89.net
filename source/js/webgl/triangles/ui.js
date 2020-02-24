function toggleLines() {
  lineMode = !lineMode;
  generate();
}

function toggleLegacy() {
  switchProgram(!legacyMode);
  if (!tipLock) {
    tipLegacy.classList.add('active');
    setTimeout(function() {
      tipLegacy.classList.remove('active');
    }, 5500);
    tipLock = true;
  }
  generate();
}

function downloadCanvas() {
  inputDownload.href = canvas.toDataURL();
}

function hideWarning() {
  sizeAlert.classList.remove('active');
}

function pickerChange() {
  const value = checkHex(inputColor.value);
  if (value != null) {
    updateColors(value, 'picker');
    draw(true, hexToRgb(value));
  }
}
function rgbChange() {
  const value = checkRgb({
    r: inputsRGB[0].value,
    g: inputsRGB[1].value,
    b: inputsRGB[2].value
  });
  if (value != null) {
    updateColors(rgbToHex(value), 'rgb');
    draw(true, value);
  }
}
function hexChange() {
  const value = checkHex(inputHEX.value);
  if (value != null) {
    updateColors(value, 'hex');
    draw(true, hexToRgb(value));
  }
}

function resetProperties() {
  const params = Object.assign({}, defaultProps);
  switchProgram(false);
  inputLegacy.classList.remove('active');

  updateProperties(params);
  run();
}

function switchProgram(mode) {
  if (legacyMode != mode) {
    legacyMode = mode;
    gl.useProgram(legacyMode ? programAlt : program);
  }
}

function getParamLink() {
  const props = getProperties();
  const params = new URLSearchParams();
  for (const prop in props) {
    const val = props[prop]
    if (defaultProps[prop] != val) params.set(prop, val);
  }
  const paramStr = params.toString();
  const url = location.origin + location.pathname + (paramStr ? '?' + paramStr : '');

  const node = document.createElement('div');
  node.textContent = url;
  node.classList.add('visually-hidden');
  document.body.appendChild(node);

  const selection = document.getSelection();
  const currentRanges = (function() {
    const range = new Array(selection.rangeCount);
    for (let i = 0; i < range.length; i++) {
      range[i] = selection.getRangeAt(i);
    }
    return range;
  })();
  selection.removeAllRanges();

  const range = new Range();
  range.selectNodeContents(node);
  selection.addRange(range);

  document.execCommand('copy');

  node.remove();
  selection.removeRange(range);
  range.detach();
  for (const range of currentRanges) {
    selection.addRange(range);
  }
}

function getProperties() {
  return {
    color: inputHEX.value.slice(1),
    size: inputSize.value,
    lightness: sliderLightness.value,
    threshold: sliderThreshold.value,
    linemode: inputLines.classList.contains('active').toString()
  };
}

function updateProperties(props) {
  //Set the inputs for each parameter to its value
  if (props.color) updateColors(checkHex(props.color));

  if (props.size) inputSize.value = parseInt(props.size);

  if (props.lightness) sliderLightness.newValues({value: parseInt(props.lightness)});
  if (props.threshold) sliderThreshold.newValues({value: parseInt(props.threshold)});

  if (props.linemode) {
    lineMode = props.linemode == 'true' ? true : false;
    inputLines.classList[lineMode ? 'add' : 'remove']('active');
  }
}

function updateColors(hex, source = '') {
  if (hex) {
    if (source != 'rgb') {
      const rgb = hexToRgb(hex);
      if (rgb != null) {
        inputsRGB[0].value = rgb.r;
        inputsRGB[1].value = rgb.g;
        inputsRGB[2].value = rgb.b;
      }
    }
    if (source != 'picker') inputColor.value = hex;
    if (source != 'hex') inputHEX.value = hex;
  }
}
