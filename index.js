const express = require('express');
const nunjucks = require('nunjucks');
const app = express();

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});

const njk = nunjucks.configure('pages', {
  express: app
});
njk.addGlobal('getNavLinks', function() {
  return getLinks();
});

app.set('view engine', 'njk');
app.set('views', __dirname + '/pages');
app.set('strict routing', false);

app.use(express.static('source/style/css'));
app.use(express.static('source/js'));
app.use(express.static('source/images'));
app.use(express.static('source/resources'));
app.use(express.static('source/icon'));

function getLinks() {
  return require('./source/resources/page-links.json');
}

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

getNJK('', { links: getLinks() }, 'index');
get('sponge');
get('tutorials');
getNJK('slider89', {page: 'slider89'});
get('blog');
getNJK('tools', {links: getLinks() });
get('tools/3DMagic');
get('tools/RFG');
get('tools/mocking');
get('tools/spacing');
get('webgl/triangles');
get('webgl/matrices3d');
