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
      </div>
      <div style="text-align:center;margin:18px 0 8px">
        <a href="#/diag" style="color:var(--ink2);font-size:14px;text-decoration:underline">🔎 没有声音？点这里做语音诊断</a>
      </div>`;
  }

  /* ---------- 诊断页（#/diag）----------
     手机上打不开控制台，出问题时让家长把这个页面截图发过来，
     就能一眼看出是哪一环卡住：浏览器 / 本机语音 / 在线朗读 / 网络。 */
  function diagRows() {
    const a = document.getElementById('netTts');
    let online = '尚未使用';
    if (a && a.src) {
      if (a.error) online = '失败（错误码 ' + a.error.code + '）';
      else if (!a.paused) online = '正在播放';
      else if (a.currentTime > 0) online = '正常（已播 ' + a.currentTime.toFixed(1) + ' 秒）';
      else online = '已就绪';
    }
    return [
      ['浏览器', Say.browser()],
      ['页面地址', location.origin + '/'],
      ['是否 HTTPS', location.protocol === 'https:' ? '是' : '否（部分手机会禁用语音）'],
      ['本机语音（Web Speech）', Say.ready() ? '可用' : '不可用'],
      ['当前朗读通道', Say.engine() === 'local' ? '本机语音' : (Say.engine() === 'net' ? '在线朗读' : '检测中')],
      ['本机音色数量', (function () { try { return (speechSynthesis.getVoices() || []).length + ' 个'; } catch (e) { return '取不到'; } })()],
      ['在线朗读状态', online],
      ['网络', navigator.onLine ? '已连接' : '未连接'],
      ['触摸支持', ('ontouchstart' in window) ? '支持' : '不支持'],
    ];
  }
  function diagPage() {
    const rows = diagRows();
    return `
      <p class="big-title">🔎 语音诊断</p>
      <p class="sub-title">朗读没声音时，把这一页截图发给我就能定位问题</p>
      <div class="card" style="margin-top:12px">
        ${rows.map(r => `<div style="display:flex;justify-content:space-between;gap:10px;padding:9px 2px;border-bottom:1px solid var(--line)">
          <span style="color:var(--ink2);font-size:15px;flex:none">${UI.esc(r[0])}</span>
          <b style="font-size:15px;text-align:right;word-break:break-all">${UI.esc(r[1])}</b>
        </div>`).join('')}
      </div>
      <div class="card" style="margin-top:12px">
        <div style="font-weight:800">点下面按钮试听</div>
        <p style="color:var(--ink2);font-size:14px;margin-top:4px">能听到"小朋友你好"，说明在线朗读通道正常</p>
        <button class="btn bg-g" id="diagTest" style="margin-top:8px">🔊 试听一句</button>
        <div id="diagOut" style="margin-top:8px;font-size:14px;color:var(--ink2)"></div>
      </div>
      <button class="btn ghost" id="diagAgain" style="margin-top:12px">🔄 重新检测</button>`;
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
    else if (parts[0] === 'diag') html = diagPage();
    else if (MOD[parts[0]]) html = MOD[parts[0]].render(parts);
    else html = home();

    V().innerHTML = html;
    // 游戏页要"一屏装得下"，底部给标签栏留的空隙收紧一点（见 css 的 .page-game）
    V().classList.toggle('page-game', parts[0] === 'en' && parts[1] === 'g');
    // 用赋值方式绑定，避免多次路由后监听器叠加
    V().onclick = UI.delegate('[data-go]', function () {
      SFX.tap();
      location.hash = this.getAttribute('data-go');
    });
    window.scrollTo(0, 0);

    if (parts[0] === 'diag') {
      const out = document.getElementById('diagOut');
      const t = document.getElementById('diagTest');
      if (t) t.onclick = () => {
        SFX.tap();
        if (out) out.textContent = '正在播放…（若听不到，请看上面的「在线朗读状态」）';
        Say.zh('小朋友你好', .9);
        setTimeout(() => { if (out) out.textContent = '播放指令已发出：' + JSON.stringify(diagRows()[6][1]) + ' · 通道 ' + (Say.engine() === 'local' ? '本机' : '在线'); }, 1500);
      };
      const ag = document.getElementById('diagAgain');
      if (ag) ag.onclick = () => { SFX.tap(); route(); };
    }

    if (parts[0] !== 'home' && MOD[parts[0]] && MOD[parts[0]].mount) MOD[parts[0]].mount(parts);
    refreshScore();
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', route);
})();
