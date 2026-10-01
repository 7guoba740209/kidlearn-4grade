/* ================= 路由 + 首页 + 底部导航 ================= */
(function () {
  const V = () => document.getElementById('view');

  /* ---------- 星星总数 ---------- */
  window.refreshScore = function () {
    const p = DB.get('points', 0);
    const el = document.getElementById('topScore');
    if (el) el.textContent = '⭐ ' + p;
    return p;
  };
  window.addPoints = function (n) {
    const p = DB.get('points', 0) + n;
    DB.set('points', p);
    refreshScore();
    return p;
  };
  window.levelOf = function (p) {
    const L = APP_CONFIG.EN_LEVELS || [];
    let cur = L[0] || { name: '新手' };
    L.forEach(l => { if (p >= l.min) cur = l; });
    let next = L.find(l => l.min > p);
    return { name: cur.name, next: next ? next.name : null, need: next ? next.min - p : 0 };
  };

  /* ---------- 首页 ---------- */
  function home() {
    let last = DB.get('lastCn', null);
    let lastHtml = '';
    if (last) {
      lastHtml = `<button class="big-btn bg-y" data-go="#/cn/${last.b}/${last.u}/${last.l}">
        <span class="ico">⏭️</span><span>继续上次朗读<small>${UI.esc(last.title)}</small></span></button>`;
    }
    return `
      <p class="big-title">今天想先学哪一科？</p>
      <p class="sub-title">点一下就能开始，全部保存在本机里</p>
      ${lastHtml}
      <button class="big-btn bg-o" data-go="#/cn"><span class="ico">📖</span>
        <span>语文 课文朗读<small>人教版 四年级 上·下册 · 每单元 3 篇范文</small></span></button>
      <button class="big-btn bg-b" data-go="#/ma"><span class="ico">📷</span>
        <span>数学 拍错题<small>自动出题 · 自动判分</small></span></button>
      <button class="big-btn bg-g" data-go="#/en"><span class="ico">🎮</span>
        <span>英语 单词游戏<small>听音拼写 · 拼词闯关</small></span></button>

      <div class="card" style="margin-top:18px">
        <div style="font-weight:800;font-size:19px">🌟 我的星星：<span style="color:var(--orange)">${DB.get('points', 0)}</span></div>
        <div style="color:var(--ink2);font-size:15px;margin-top:4px">
          当前等级：<b>${levelOf(DB.get('points', 0)).name}</b> · 错题照片 ${DB.get('photos', []).length} 张
        </div>
      </div>`;
  }

  /* ---------- 路由表 ---------- */
  const MOD = { cn: Chinese, ma: MathMod, en: English };

  function route() {
    let h = location.hash.replace(/^#\/?/, '');
    if (!h) h = 'home';
    const parts = h.split('/');

    // 换页时关掉课文朗读页，避免声音继续读
    if (window.Chinese && Chinese.closeReaderIfAny) Chinese.closeReaderIfAny();

    // 高亮底栏
    UI.$$('#tabbar .tab').forEach(a => {
      a.classList.toggle('on', a.getAttribute('href') === '#/' + parts[0]);
    });

    let html;
    if (parts[0] === 'home') html = home();
    else if (MOD[parts[0]]) html = MOD[parts[0]].render(parts);
    else html = home();

    V().innerHTML = html;
    // 用赋值方式绑定，避免多次路由后监听器叠加
    V().onclick = UI.delegate('[data-go]', function () {
      SFX.tap();
      location.hash = this.getAttribute('data-go');
    });
    window.scrollTo(0, 0);

    if (parts[0] !== 'home' && MOD[parts[0]] && MOD[parts[0]].mount) MOD[parts[0]].mount(parts);
    refreshScore();
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', route);
})();
