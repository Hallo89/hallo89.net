const fs = require('fs');
const fetch = require('node-fetch');
const express = require('express');
const nunjucks = require('nunjucks');
const argon = require('argon-parser');
const markdown = require('markdown-it')({
  breaks: true
});
const sl89Docs = require('./source/data/slider89/docs.json');
const staticSl89GitData = require('./source/data/slider89/static-git.json');
const pageData = require('./source/data/page-data.json');
const staticExclusions = [
  'data',
  'style'
];

const app = express();
const njk = nunjucks.configure('pages', {
  express: app
});

fetch('https://api.github.com/repos/Hallo89/Slider89/releases')
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data)) data = staticSl89GitData;
    for (version of data) {
      version.body = (function(body) {
        while(match = /https:\/\/hallo89\.net\/slider89(#[\w-]+)/.exec(body)) {
          body = body.replace(match[0], match[1]);
        }
        body = markdown.render(body);
        return body;
      })(version.body);
      version.date = (function() {
        const date = new Date(version.created_at);
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      })();
      if (version == data[0]) {
        const now = new Date(Date.now());
        now.setMonth(now.getMonth() - 1);
        version.new = new Date(version.created_at) > now ? true : false;
      } else version.new = false;
    }
    return data;
  }).then(sl89GitData => {
    getNJK('slider89', {data: sl89Docs, gitData: sl89GitData});
  });
(function() {
  njk.addGlobal('staticPageData', pageData);
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

function get(which, fileName) {
  app.get('/' + which, function(req, res) {
    res.sendFile(__dirname + '/pages/' + (fileName || which) + '.html');
  });
}
function getNJK(which, obj, dataName, fileName) {
  let params = {};
  if (which) {
    let data;
    if (dataName) {
      if (Array.isArray(dataName)) {
        data = pageData;
        dataName.forEach(val => {
          data = data[val];
          if (data && data.children) data = data.children;
        });
      } else data = pageData[dataName];
    } else data = pageData[which.slice(0, 1).toUpperCase() + which.slice(1)];
    if (data && data.children) data = data.children;
    params.pageData = data;
  } else {
    params.pageData = pageData;
  }
  params.page = which;
  params.name = which.includes('/') ? which.slice(0, which.indexOf('/')) : which;
  if (obj) params = Object.assign(params, obj);
  app.get('/' + which, function(req, res) {
    res.render(fileName || which, params);
  });
}

getNJK('', false, false, 'index');
getNJK('blog');
getNJK('tools');
get('tools/3DMagic');
get('tools/RFG');
get('tools/mocking');
get('tools/spacing');
getNJK('webgl', false, 'WebGL Experiments');
get('webgl/triangles');
get('webgl/matrices3d');
get('sponge');
getNJK('tutorials', false, ['Other stuff', 'Empty thing']);
