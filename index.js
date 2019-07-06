const fetch = require('node-fetch');
const express = require('express');
const nunjucks = require('nunjucks');
const argon = require('argon-parser');
const app = express();

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});

argon.addFlag(['f', 'first'], function(val) {
  return val.slice(0, val.indexOf(' '));
}, true);

const njk = nunjucks.configure('pages', {
  express: app
});

njk.addFilter('argonize', function(val) {
  return (val != null ? argon.parse(val.toString()) : val);
});
njk.addFilter('argondry', function(val) {
  return (val != null ? argon.parse(val.toString(), true) : val);
});
njk.addFilter('functName', function (val) {
  const match = val.match(/(?:.+\s*=\s*)?(\w+)\([\d\D]*\)/);
  return match ? match[1] : val;
});
njk.addFilter('isArray', function(val) {
  return Array.isArray(val);
});
njk.addFilter('firstword', function(val) {
  return (typeof val == 'string' && val.indexOf(' ') != -1 ? val.slice(0, val.indexOf(' ')) : val);
});
njk.addFilter('separate', function(val, exclusion, tag) {
  const excls = Array.isArray(exclusion) ? exclusion.reduce((prev, current) => prev + '|' + current) : exclusion;
  return val.replace(new RegExp('([\\d\\D]+?)($|(?:'+excls+')(?:\\s+|$))', 'g'), function(match, value, exclusion) {
    return '<' + tag + '>' + value + '</' + tag + '>' + exclusion;
  });
});
njk.addFilter('kebab', function(val) {
  return (typeof val == 'string' ? val.replace(/\s/g, '-') : val);
});
njk.addFilter('dotSnake', function(val) {
  return (typeof val == 'string' ? val.replace(/\./g, '_') : val);
});
njk.addGlobal('concatObj', function(objects) {
  return objects.reduce(function(prev, current) {
    return mergeObjects(JSON.parse(JSON.stringify(prev)), current);
  }, {});
});
function mergeObjects(target, source) {
  for (const key in source) {
    if (key in target && typeof target[key] == 'object') {
      mergeObjects(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

app.set('view engine', 'njk');
app.set('views', __dirname + '/pages');
app.set('strict routing', false);

app.use(express.static('source/style/css'));
app.use(express.static('source/js'));
app.use(express.static('source/images'));
app.use(express.static('source/resources'));
app.use(express.static('source/icon'));

function get(which, fileName) {
  app.get('/' + which, function(req, res) {
    res.sendFile(__dirname + '/pages/' + (fileName || which) + '.html');
  });
}
function getNJK(which, param, fileName) {
  app.get('/' + which, function(req, res) {
    param ? res.render(fileName || which, param) : res.render(fileName || which);
  });
}

getNJK('', false, 'index');
get('sponge');
get('tutorials');
get('blog');
getNJK('tools');
get('tools/3DMagic');
get('tools/RFG');
get('tools/mocking');
get('tools/spacing');
get('webgl/triangles');
get('webgl/matrices3d');

const jsonData = require('./source/resources/slider89/docs.json');
let gitData = [];
fetch('https://api.github.com/repos/Hallo89/Slider89/releases')
  .then(res => res.json())
  .then(data => {
    gitData = data;
  });
app.get('/slider89', function(req, res) {
  res.render('slider89', {page: 'slider89', data: jsonData, gitData: gitData});
});
