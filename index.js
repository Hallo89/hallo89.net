import fs from 'fs';
import Express from 'express';
import Yaml from 'js-yaml';

import { setupNunjucks } from './nunjucks.js';

// This is completely static
import slider89VersionData from './source/data/slider89/static-git.json' assert { type: 'json' };
import slider89DocData from './source/data/slider89/docs.json' assert { type: 'json' };


// ---- Constants ----
const pageData = Yaml.load(fs.readFileSync('./source/data/page-data.yml', 'utf8'));
const staticExclusions = [
  'data',
  'style'
];

const cwd = new URL('.', import.meta.url).pathname;


// ---- Express & Nunjucks setup ----
const app = Express();
const njk = setupNunjucks(app, pageData)

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});

app.set('view engine', 'njk');
app.set('views', cwd);
app.set('strict routing', false);

app.use('/style', Express.static('source/style/css'));
fs.readdir('./source', (err, files) => {
  if (err) {
    throw new Error("Error scanning directory 'source': " + err);
  }
  files
    .filter(val => !staticExclusions.includes(val))
    .forEach(val => {
      app.use(val == 'root' ? '' : '/' + val, Express.static('source/' + val));
    });
});

app.use('/js/snake', Express.static('snake/script'));
app.use('/style/snake', Express.static('snake/style'));


// ---- Routes ----
getNJK('', false, 'index');

getNJK('blog');

getNJK('tools');
getNJK('tools/3DMagic');
getNJK('tools/RFG');
getNJK('tools/mocking');
getNJK('tools/spacing');

getNJK('webgl');
getNJK('webgl/triangles');
getNJK('webgl/matrices3d');

getNJK('games');
getNJK('games/snake3D', false, '../snake/snake3D')
getNJK('games/snake2D', false, '../snake/snake2D')

getNJK('slider89', {
  data: slider89DocData,
  gitData: slider89VersionData
});


// ---- Route functions ----
function getNJK(viewPath, customParams, fileName = viewPath) {
  let renderParams = {
    pagePath: viewPath,
    pageTopLink: viewPath.includes('/') ? viewPath.slice(0, viewPath.indexOf('/')) : viewPath,
    pageData: (function() {
      let data = pageData;
      // Special check for index
      if (viewPath !== '') {
        for (const view of viewPath.split('/')) {
          if (data.children) data = data.children;
          data = data[view];
          if (!data) return;
        }
      }
      return data;
    }())
  };
  if (customParams) {
    renderParams = Object.assign(renderParams, customParams);
  }

  app.get('/' + viewPath, function(req, res) {
    res.render('pages/' + fileName, renderParams);
  });
}
