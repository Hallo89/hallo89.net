const express = require('express');
const nunjucks = require('nunjucks');
const argon = require('argon-parser');
const app = express();

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});

const njk = nunjucks.configure('pages', {
  express: app
});

njk.addFilter('argonize', function(val) {
  return (val != null ? argon.parse(val.toString()) : '');
});
njk.addFilter('isArray', function(val) {
  return Array.isArray(val);
});

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
app.get('/slider89', function(req, res) {
  const data = require('./source/resources/slider89/docs.json');
  res.render('slider89', {page: 'slider89', data: data})
});
