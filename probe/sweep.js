/* 在公网页面注入回归脚本：遍历全路由，统计错误 */
(function () {
  var errors = [], blank = [], shortP = [];
  window.addEventListener('error', function (e) {
    errors.push((e.message || '') + ' @' + (e.filename || '').split('/').pop() + ':' + (e.lineno || ''));
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      var CN = window.CN_BOOKS || [];
      var routes = ['home', 'cn', 'ma', 'en'];
      CN.forEach(function (b) {
        routes.push('cn/' + b.id);
        b.units.forEach(function (u) {
          routes.push('cn/' + b.id + '/' + u.id);
          routes.push('cn/' + b.id + '/' + u.id + '/essay');
          routes.push('cn/' + b.id + '/' + u.id + '/essay/0');
          routes.push('cn/' + b.id + '/' + u.id + '/essay/2');
          u.lessons.forEach(function (l) { routes.push('cn/' + b.id + '/' + u.id + '/' + l.no); });
        });
      });

      var i = 0;
      function step() {
        if (i >= routes.length) {
          var pre = document.createElement('pre');
          pre.id = 'DIAG';
          pre.textContent = 'MODE=ONLINE\nTOTAL=' + routes.length + '\nERRORS=' + errors.length +
            '\n' + (errors.length ? 'ERR=' + JSON.stringify(errors.slice(0, 8)) + '\n' : '') +
            'BLANK=' + (blank.length ? JSON.stringify(blank) : 'none') +
            '\nSHORT=' + (shortP.length ? JSON.stringify(shortP.slice(0, 8)) : 'none') +
            '\nCN_ESSAYS_KEYS=' + (window.CN_ESSAYS ? Object.keys(window.CN_ESSAYS).length : 'MISSING');
          document.body.appendChild(pre);
          return;
        }
        var r = routes[i++];
        location.hash = '#/' + r;
        setTimeout(function () {
          var v = document.getElementById('view');
          var len = v ? v.textContent.trim().length : 0;
          if (len < 10) blank.push(r);
          else if (len < 40) shortP.push(r + ':' + len);
          step();
        }, 55);
      }
      step();
    }, 500);
  });
})();
