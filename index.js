const fs = require('fs');
const express = require('express');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');
const argon = require('argon-parser');
const markdown = require('markdown-it')({
  breaks: true
});
const slider89Data = {
  docs: require('./source/data/slider89/docs.json'),
  // This is completely static
  versions: require('./source/data/slider89/static-git.json')
};
const pageData = yaml.load(fs.readFileSync('./source/data/page-data.yml', 'utf8'));
const staticExclusions = [
  'data',
  'style'
];

const app = express();
const njk = nunjucks.configure('pages', {
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
      for (str of expr) {
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
app.set('views', __dirname + '/pages');
app.set('strict routing', false);

app.use('/style', express.static('source/style/css'));
fs.readdir('./source', (err, files) => {
  if (err) {
    console.error("Error scanning directory 'source': " + err);
    return;
  }
  files
  .filter(val => !staticExclusions.includes(val))
  .forEach(val => {
    app.use(val == 'root' ? '' : '/' + val, express.static('source/' + val));
  });
});

function get(viewPath, fileName = viewPath) {
  app.get('/' + viewPath, function(req, res) {
    res.sendFile(__dirname + '/pages/' + fileName + '.html');
  });
}
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
    res.render(fileName, renderParams);
  });
}

getNJK('', false, 'index');
getNJK('blog');
getNJK('tools');
getNJK('tools/3DMagic');
get('tools/RFG');
get('tools/mocking');
get('tools/spacing');
getNJK('webgl');
get('webgl/triangles');
get('webgl/matrices3d');
getNJK('slider89', {
  data: slider89Data.docs,
  gitData: slider89Data.versions
});
