import Nunjucks from 'nunjucks';
import argon from 'argon-parser';

argon.addFlag(['f', 'first'], function(val) {
  return val.slice(0, val.indexOf(' '));
}, true);


export function setupNunjucks(expressApp, pageData) {
  const njk = Nunjucks.configure('', {
    express: expressApp
  });
  applyNunjucksFilters(njk, pageData);
  return njk;
}

function applyNunjucksFilters(njk, pageData) {
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
}
