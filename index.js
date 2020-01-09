const fetch = require('node-fetch');
const express = require('express');
const nunjucks = require('nunjucks');
const argon = require('argon-parser');
const markdown = require('markdown-it')({
  breaks: true
});
const sl89Docs = require('./source/resource/slider89/docs.json');
const pageData = require('./source/resource/page-data.json')

const app = express();
const njk = nunjucks.configure('pages', {
  express: app
});

(function() {
  njk.addGlobal('getNavLinks', function() {
    return pageData;
  });
  njk.addGlobal('compareVer', function(ver1, ver2) {
    ver1 = parseInt('1' + ver1.slice(1).replace(/[_\.]/g, ''));
    ver2 = parseInt('1' + ver2.slice(1).replace(/[_\.]/g, ''));
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

getNJK('', { links: pageData }, 'index');
get('sponge');
get('tutorials');
getNJK('blog', { links: pageData, page: 'blog' });
getNJK('tools', { links: pageData['Tools'] });
get('tools/3DMagic');
get('tools/RFG');
get('tools/mocking');
get('tools/spacing');
getNJK('webgl', { links: pageData['WebGL Experiments'] });
get('webgl/triangles');
get('webgl/matrices3d');
app.get('/slider89', function(req, res) {
  res.render('slider89', {page: 'slider89', data: sl89Docs, gitData: sl89GitData});
});

let sl89GitData = new Array();
fetch('https://api.github.com/repos/Hallo89/Slider89/releases')
  .then(res => res.json())
  .then(data => {
    sl89GitData = data;
    for (version of sl89GitData) {
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
      if (version == sl89GitData[0]) {
        const now = new Date(Date.now());
        now.setMonth(now.getMonth() - 1);
        version.new = new Date(version.created_at) > now ? true : false;
      } else version.new = false;
    }
  });
