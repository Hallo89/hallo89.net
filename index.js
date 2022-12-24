import fs from 'fs';
import Express from 'express';
import Yaml from 'js-yaml';
import Nunjucks from 'nunjucks';
import argon from 'argon-parser';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
  breaks: true
});

import sl89Docs from './source/data/slider89/docs.json' assert { type: "json" };
// This is completely static
import sl89Versions from './source/data/slider89/static-git.json' assert { type: "json" };

const cwd = new URL('.', import.meta.url).pathname;

const slider89Data = {
  docs: sl89Docs,
  versions: sl89Versions
};

const pageData = Yaml.load(fs.readFileSync('./source/data/page-data.yml', 'utf8'));
const staticExclusions = [
  'data',
  'style'
];

const app = Express();
const njk = Nunjucks.configure('', {
  express: app
});

(function() {
  njk.addGlobal('staticPageData', pageData);
  njk.addGlobal('getPageName', function(name, link) {
    return name != null ? name : (link.slice(0, 1).toUpperCase() + link.slice(1));
  });

  njk.addGlobal('compareVer', function(ver1, ver2) {
    [ver1, ver2] = [ver1, ver2].map(ver => parseInt('1' + ver.slice(1).replace(/[_\.]/g, '')));
    if (ver1 > ver2) {
      return 'greater';
    } else if (ver1 < ver2) {
      return 'smaller';
    } else return 'equal';
  });
  njk.addGlobal('concatObj', function(objects) {
    return objects.reduce(function(prev, current) {
      return mergeObjects(JSON.parse(JSON.stringify(prev)), current);
    }, {});

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
  });

  njk.addFilter('startsWith', function(val, expr) {
    if (Array.isArray(expr)) {
      for (const str of expr) {
        if (new RegExp('^' + str).test(val)) return true;
      }
      return false;
    } else return new RegExp('^' + expr).test(val);
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
  njk.addFilter('incrVer', function(val, array) {
    for (const i in array) {
      if (array[i].tag_name == 'v' + val) return array[i - 1] ? array[i - 1].tag_name.slice(1) : val;
    }
    return val;
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

  njk.addFilter('removeNewLines', function(val) {
    return val?.trim().replace(/\n/g, ' ');
  });
  njk.addFilter('expandBackgroundImage', function(val) {
    if (/^[\w-]+\.\w+$/.test(val)) {
      return `url("/image/nav/${val}")`;
    } else {
      return val;
    }
  });
})();

argon.addFlag(['f', 'first'], function(val) {
  return val.slice(0, val.indexOf(' '));
}, true);

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});

app.set('view engine', 'njk');
app.set('views', cwd);
app.set('strict routing', false);

app.use('/style', Express.static('source/style/css'));
fs.readdir('./source', (err, files) => {
  if (err) {
    console.error("Error scanning directory 'source': " + err);
    return;
  }
  files
  .filter(val => !staticExclusions.includes(val))
  .forEach(val => {
    app.use(val == 'root' ? '' : '/' + val, Express.static('source/' + val));
  });
});

app.use('/js/snake', Express.static('snake/script'));
app.use('/style/snake', Express.static('snake/style'));

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
  data: slider89Data.docs,
  gitData: slider89Data.versions
});
