const express = require('express');
const app = express();

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});

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

get('', 'index');
get('sponge');
get('tutorials');
get('slider89');
get('blog');
get('tools');
get('tools/3DMagic');
get('tools/RFG');
get('tools/mocking');
get('tools/spacing');
get('webgl/triangles');
get('webgl/matrices3d');
