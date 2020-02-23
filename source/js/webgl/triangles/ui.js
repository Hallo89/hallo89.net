function enableLines() {
  lineMode = !lineMode;
  generate();
  updateHash({linemode: lineMode});
}

function switchScript() {
  legacyMode = !legacyMode;
  gl.useProgram(legacyMode ? programAlt : program);
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

function decoupleSize() {
  if (!document.body.classList.contains('decoupledsize')) {
    inputWidth.value = inputSize.value;
    inputHeight.value = inputSize.value;
  }
  document.body.classList.toggle('decoupledsize');
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
function pickerSubmit() {
  const value = checkHex(inputColor.value);
  if (value != null) {
    updateHash({color: value.slice(1)});
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
    updateHash({color: value.slice(1)});
  }
}
function rgbBlur() {
  clearTimeout(rgbTimer);
  rgbTimer = setTimeout(function() {
    const value = checkRgb({
      r: inputsRGB[0].value,
      g: inputsRGB[1].value,
      b: inputsRGB[2].value
    });
    if (value != null) {
      updateHash({color: rgbToHex(value).slice(1)});
    }
  }, 250);
}

function resetHash() {
  const params = {
    color: '17469E',
    width: '50',
    height: '50',
    lightness: ((amountX + amountY) * 3.2) / 16,
    threshold: (amountX + amountY) * 3.2,
    linemode: false
  };
  updateHash(params);
  updateInputs(params);
}

function updateInputs(values) {
  //Set the inputs for each parameter to its value
  if (values.color != null) updateColors(checkHex(values.color));
  if (values.size) {
    inputSize.value = values.size;
  }
  if (values.width) {
    inputWidth.value = values.width;
  }
  if (values.height) {
    inputHeight.value = values.height;
  }
  if (values.lightness != null) sliderLightness.newValues({value: values.lightness});
  if (values.threshold != null) sliderThreshold.newValues({value: values.threshold});
  if (values.linemode != null) {
    lineMode = values.linemode;
    if (lineMode == true) {
      inputLines.classList.add('active');
    } else {
      inputLines.classList.remove('active');
    }
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
