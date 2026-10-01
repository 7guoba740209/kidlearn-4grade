/* 公网最终验收：点朗读出声 + 页面不跳转 + 英语发音 */
(function () {
  var log = [];
  function L(s) { log.push(s); }
  window.addEventListener('error', function (e) {
    log.push('JS-ERROR: ' + (e.message || '') + ' @' + (e.filename || '').split('/').pop() + ':' + (e.lineno || ''));
  });
  function dump() {
    var pre = document.createElement('pre');
    pre.id = 'DIAG';
    pre.textContent = log.join('\n');
    document.body.appendChild(pre);
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      L('=== A. 语文：点朗读不出声？看是否跳页 ===');
      location.hash = '#/cn/4a/u1/1';
      setTimeout(function () {
        L('课文页文本长度 = ' + document.getElementById('view').textContent.trim().length);
        var br = document.getElementById('btnRead');
        L('btnRead 存在 = ' + !!br);
        var hashBefore = location.hash;
        // 真实点击
        br.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        setTimeout(function () {
          L('点后 hash = ' + location.hash + '  (点前 = ' + hashBefore + ')');
          L('是否跳页 = ' + (location.hash !== hashBefore ? '❌ 跳了' : '✅ 没跳'));
          L('speechSynthesis.speaking = ' + speechSynthesis.speaking);
          L('songBar 显示 = ' + (document.getElementById('songBar') ? !document.getElementById('songBar').hidden : '-'));
          L('高亮段落数 = ' + document.querySelectorAll('#textBox p.now').length);
          L('hint = ' + (document.getElementById('readHint') || {}).textContent);
          L('');

          L('=== B. 英语：点单词发音 ===');
          location.hash = '#/en/w/4a/M1';
          setTimeout(function () {
            var rows = document.querySelectorAll('.js-say');
            L('单词表 .js-say 行数 = ' + rows.length);
            var bound = 0;
            rows.forEach(function (r) { if (typeof r.onclick === 'function') bound++; });
            L('已绑定 = ' + bound);
            if (rows.length) {
              speechSynthesis.cancel();
              var w = rows[0].getAttribute('data-w');
              rows[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              setTimeout(function () {
                L('点了 "' + w + '" → speaking = ' + speechSynthesis.speaking);
                dump();
              }, 700);
            } else dump();
          }, 800);
        }, 800);
      }, 700);
    }, 800);
  });
})();
