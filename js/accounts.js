/* ================= 多账号：登录 / 注册 / 数据隔离 / 云端同步 =================
 *  设计要点（见 README 注释与技能规范）：
 *  1) 本机优先 + 云端自动双写：没配 Supabase 时全自动本机（离线可用）；
 *     配了之后自动同步，严格规避两个数据丢失大坑——
 *       坑1：新设备空白档案绝不覆盖云端已有记录（fresh 标志）
 *       坑2：账号表合并而非互冲（云端的本机没有→追加；两边都有→云端为准）
 *  2) 密码只做「防误操作」级别（简单加盐哈希），不是银行级安全。
 *     儿童学习工具够用，但不会宣传成安全系统。
 *  3) 每个账号独立档案：积分 / 各单词掌握度{right,wrong,total,level} / 练习时长 / 错题。
 *  4) 自适应选词：错得越多的单词权重越高（pickByMastery）。
 * =========================================================== */
window.Accounts = (function () {
  const NS = 'kidlearn_v1_';
  const cfg = (window.APP_CONFIG && APP_CONFIG.ACCOUNTS) || {};
  const ENABLED = cfg.enabled !== false;                 // 默认开启多账号
  const ADMIN = cfg.adminInit || { name: 'admin', pwd: '123456', nick: '管理员' };
  const CLOUD_CFG = cfg.cloud || null;                   // 形如 { supabase:{ url, key } }

  /* ---------- 简单加盐哈希（防误操作，非银行级） ---------- */
  function hash(pw) {
    let h = 2166136261 >>> 0;
    const s = 'kl_salt_' + String(pw);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return 'h' + h.toString(36);
  }

  /* ---------- 账号表 ---------- */
  let users = loadUsers();
  function loadUsers() {
    let u = DB.get('users', null);
    if (!Array.isArray(u)) u = [];
    if (!u.find(x => x.name === ADMIN.name)) {
      u.unshift({ name: ADMIN.name, pwd: hash(ADMIN.pwd), role: 'admin', nick: ADMIN.nick || '管理员', created: 'init' });
      DB.set('users', u);
    }
    return u;
  }
  function saveUsers() { DB.set('users', users); }

  /* ---------- 会话 / 当前账号状态 ---------- */
  let cur = null;          // 当前登录的账号对象
  let state = null;        // 当前账号的档案
  let fresh = false;       // 本机是否为该用户「刚新建的空白档案」（坑1 标志）
  let booting = false;

  function session() { return DB.get('session', null); }
  function setSession(name) { if (name) DB.set('session', name); else DB.del('session'); }

  function defaultState() {
    return { points: 0, mastery: {}, stats: { games: 0, right: 0, wrong: 0, playMs: 0 }, created: Date.now(), ts: Date.now() };
  }
  function migrate(s) {
    s = s || {};
    const d = defaultState();
    d.points = s.points || 0;
    d.mastery = s.mastery || {};
    d.stats = Object.assign(d.stats, s.stats || {});
    d.created = s.created || d.created;
    d.ts = s.ts || d.created;
    return d;
  }

  function loadState(name) {
    const raw = DB.get('state_' + name, null);
    if (raw == null) { state = defaultState(); fresh = true; DB.set('state_' + name, state); return; }
    state = migrate(raw); fresh = false;
  }
  function saveStateLocal() { if (cur) { state.ts = Date.now(); DB.set('state_' + cur.name, state); } }

  /* ---------- 云端适配层（本地优先，可选 Supabase） ---------- */
  let cloud = null;
  function loadCloud() {
    if (!CLOUD_CFG || !CLOUD_CFG.supabase || !CLOUD_CFG.supabase.url) return null;   // 没配 → 纯本机
    return {
      _sb: null,
      async init() {
        if (this._sb) return this._sb;
        const ok = await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        if (!ok || !window.supabase) throw new Error('supabase SDK 加载失败');
        this._sb = window.supabase.createClient(CLOUD_CFG.supabase.url, CLOUD_CFG.supabase.key);
        return this._sb;
      },
      async putState(name, st) {
        const sb = await this.init();
        await sb.from('kl_states').upsert({ name, data: st, ts: Date.now() });
      },
      async getState(name) {
        const sb = await this.init();
        const { data } = await sb.from('kl_states').select('*').eq('name', name).maybeSingle();
        return data ? { data: data.data, ts: data.ts } : null;
      },
      async putUsers(u) {
        const sb = await this.init();
        await sb.from('kl_users').upsert({ id: 'index', users: u, ts: Date.now() });
      },
      async getUsers() {
        const sb = await this.init();
        const { data } = await sb.from('kl_users').select('*').eq('id', 'index').maybeSingle();
        return data ? { users: data.users, ts: data.ts } : null;
      }
    };
  }
  function loadScript(src) {
    return new Promise(res => {
      if (document.querySelector('script[src*="' + src.split('/').pop().split('@')[0] + '"]')) return res(true);
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = () => res(true); s.onerror = () => res(false);
      document.head.appendChild(s);
    });
  }

  /* 登录后云端对账：拉远端状态，按规则合并（坑1） */
  async function cloudBoot() {
    if (!cloud || !cur) return;
    try {
      const remote = await cloud.getState(cur.name);
      if (!remote) { if (fresh) { saveStateLocal(); await cloud.putState(cur.name, state).catch(() => {}); } return; }
      if (fresh || remote.ts > state.ts) { state = migrate(remote.data); fresh = false; saveStateLocal(); }
      else if (state.ts > remote.ts) { await cloud.putState(cur.name, state).catch(() => {}); }
    } catch (e) { /* 云端不可用时静默降级为本机 */ }
  }
  /* 云端推送当前账号档案 */
  function pushState() { saveStateLocal(); if (cloud && cur) cloud.putState(cur.name, state).catch(() => {}); }
  /* 账号表合并推送（坑2） */
  async function pushUsers() {
    saveUsers();
    if (!cloud) return;
    try {
      const remote = await cloud.getUsers();
      if (remote && Array.isArray(remote.users)) {
        // 云端有本机没有 → 追加；两边都有 → 云端为准；本机独有 → 保留
        const map = {};
        remote.users.forEach(u => map[u.name] = u);
        users.forEach(u => { if (!map[u.name] || (u.role === 'admin')) map[u.name] = u; });
        users = Object.keys(map).map(k => map[k]);
        saveUsers();
      }
      await cloud.putUsers(users);
    } catch (e) { /* 降级为本机 */ }
  }

  /* ---------- 登录 / 注册 / 退出 ---------- */
  function login(name, pw) {
    const u = users.find(x => x.name === name);
    if (!u || u.pwd !== hash(pw)) return { ok: false, msg: '账号或密码不对～' };
    cur = u; setSession(name); loadState(name);
    if (fresh) saveStateLocal(); else pushState();
    cloudBoot();
    return { ok: true };
  }
  function logout() { cur = null; state = null; setSession(null); }
  function register(name, pw, nick, role) {
    name = String(name || '').trim(); pw = String(pw || '').trim(); nick = String(nick || '').trim();
    if (!name || !pw) return { ok: false, msg: '账号和密码都要填' };
 if (/[^A-Za-z0-9_]/.test(name)) return { ok: false, msg: '账号只能用字母/数字/下划线' };
    if (name === ADMIN.name) return { ok: false, msg: '这个名字是管理员的，换个吧' };
    if (users.find(x => x.name === name)) return { ok: false, msg: '这个账号已经存在了' };
    const u = { name, pwd: hash(pw), role: role || 'kid', nick: nick || name, created: new Date().toISOString().slice(0, 10) };
    users.push(u); pushUsers();
    return { ok: true, user: u };
  }

  /* ---------- 掌握度 / 自适应 / 积分 ---------- */
  function masteryOf(en) { return (state && state.mastery[en]) || { right: 0, wrong: 0, total: 0, level: 0 }; }
  function recordWord(en, ok) {
    if (!state) return;
    const m = state.mastery[en] || { right: 0, wrong: 0, total: 0, level: 0 };
    m.total++; if (ok) m.right++; else m.wrong++;
    m.level = m.total === 0 ? 0 : (m.wrong === 0 && m.right >= 3 ? 2 : 1);
    state.mastery[en] = m;
    state.stats.right += ok ? 1 : 0; state.stats.wrong += ok ? 0 : 1;
    pushState();
  }
  function pickByMastery(pool, n) {
    if (!state || !pool.length) return UI.shuffle(pool || []).slice(0, n);
    const arr = pool.map(w => {
      const m = state.mastery[w.en] || { right: 0, wrong: 0, total: 0, level: 0 };
      let k;
      if (m.total === 0) k = 72;                   // 从没练过 → 稳定引入新课（但不压过易错词）
      else if (m.level >= 2) k = 6;                // 已掌握 → 最低（少浪费时间）
      else k = 45 + m.wrong * 24 - m.right * 7;    // 练过没稳：错得越多越优先
      return { w, k: k + Math.random() * 18 };      // 随机扰动，保留新鲜感
    }).sort((a, b) => b.k - a.k);
    const take = Math.min(n, arr.length);
    return arr.slice(0, take).map(x => x.w);
  }
  function addPoints(n) {
    if (state) { state.points += n; pushState(); }
    else { DB.set('points', DB.get('points', 0) + n); }   // 未登录（理论上不会发生）退回全局
  }
  function points() { return state ? state.points : DB.get('points', 0); }
  function recordPlay(ms) { if (state) { state.stats.games++; state.stats.playMs += Math.max(0, ms | 0); pushState(); } }
  function wrongWords() {
    if (!state) return [];
    return Object.keys(state.mastery).filter(en => state.mastery[en].wrong > 0)
      .map(en => ({ en, ...state.mastery[en] }))
      .sort((a, b) => (b.wrong - b.right) - (a.wrong - a.right));
  }

  /* ---------- 管理员 ---------- */
  function isAdmin() { return !!(cur && cur.role === 'admin'); }
  function listUsers() { return users.slice(); }
  function resetPwd(name, pw) {
    const u = users.find(x => x.name === name); if (!u) return false;
    if (!String(pw || '').trim()) return false;
    u.pwd = hash(pw); pushUsers(); return true;
  }
  function deleteUser(name) {
    if (name === (cur && cur.name)) return false;
    users = users.filter(x => x.name !== name); pushUsers();
    DB.del('state_' + name);
    if (cloud) cloud.putState(name, null).catch(() => {});
    return true;
  }

  /* ===================== UI：登录门禁 ===================== */
  function guard() {
    if (!ENABLED) return;
    if (cur) { renderTopbar(); return; }
    const s = session();
    if (s && users.find(u => u.name === s)) { loginAuto(s); return; }
    showLogin();
  }
  function loginAuto(name) {
    const u = users.find(x => x.name === name);
    if (!u) { showLogin(); return; }
    cur = u; setSession(name); loadState(name);
    if (fresh) saveStateLocal(); else pushState(); cloudBoot();
    renderTopbar();
    if (window.route) window.route();
  }

  function showLogin() {
    const mask = document.createElement('div');
    mask.className = 'acct-mask'; mask.id = 'acctMask';
    mask.innerHTML = `
      <div class="acct-card">
        <div class="acct-head">
          <span class="acct-logo">🏡</span>
          <div><div class="acct-title">四年级学习小屋</div>
          <div class="acct-sub" id="acctSub">请登录或注册一个账号</div></div>
        </div>
        <div id="acctTabs" class="acct-tabs">
          <button class="acct-tab on" data-t="login">登录</button>
          <button class="acct-tab" data-t="reg">注册新账号</button>
        </div>
        <div id="acctBody"></div>
        <div class="acct-tip">本机已存 ${users.length} 个账号${isAdmin() ? '' : ''} · 管理员账号 ${UI.esc(ADMIN.name)}</div>
      </div>`;
    document.body.appendChild(mask);
    requestAnimationFrame(() => mask.classList.add('on'));

    let tab = 'login';
    const body = mask.querySelector('#acctBody');
    const sub = mask.querySelector('#acctSub');
    function paint() {
      mask.querySelectorAll('.acct-tab').forEach(b => b.classList.toggle('on', b.getAttribute('data-t') === tab));
      if (tab === 'login') {
        sub.textContent = '选择或输入账号，开始学习';
        const local = users.filter(u => u.role !== 'admin');
        body.innerHTML = `
          <div class="acct-quick">
            ${users.map(u => `
              <button class="acct-chip ${u.role === 'admin' ? 'admin' : ''}" data-name="${UI.esc(u.name)}">
                <span class="av">${UI.esc((u.nick || u.name)[0])}</span>
                <span class="nm">${UI.esc(u.nick || u.name)}</span>
                ${u.role === 'admin' ? '<span class="tag">管理</span>' : ''}
              </button>`).join('')}
          </div>
          <input class="acct-in" id="liName" placeholder="账号" value="">
          <input class="acct-in" id="liPwd" type="password" placeholder="密码">
          <button class="acct-btn" id="liGo">登录</button>
          <div class="acct-msg" id="liMsg"></div>`;
        UI.$$('.acct-chip', body).forEach(c => c.onclick = () => {
          body.querySelector('#liName').value = c.getAttribute('data-name');
          body.querySelector('#liPwd').focus();
        });
        body.querySelector('#liGo').onclick = doLogin;
      } else {
        sub.textContent = '给孩子建一个专属账号吧';
        body.innerHTML = `
          <input class="acct-in" id="rgName" placeholder="账号（字母/数字）">
          <input class="acct-in" id="rgNick" placeholder="昵称（如：小明）">
          <input class="acct-in" id="rgPwd" type="password" placeholder="密码">
          <button class="acct-btn" id="rgGo">注册并登录</button>
          <div class="acct-msg" id="rgMsg"></div>`;
        body.querySelector('#rgGo').onclick = doReg;
      }
    }
    mask.querySelectorAll('.acct-tab').forEach(b => b.onclick = () => { tab = b.getAttribute('data-t'); paint(); });
    function doLogin() {
      const name = body.querySelector('#liName').value.trim();
      const pwd = body.querySelector('#liPwd').value;
      const r = login(name, pwd);
      const msg = body.querySelector('#liMsg');
      if (!r.ok) { msg.textContent = r.msg; msg.className = 'acct-msg bad'; return; }
      done();
    }
    function doReg() {
      const name = body.querySelector('#rgName').value;
      const nick = body.querySelector('#rgNick').value;
      const pwd = body.querySelector('#rgPwd').value;
      const r = register(name, pwd, nick, 'kid');
      const msg = body.querySelector('#rgMsg');
      if (!r.ok) { msg.textContent = r.msg; msg.className = 'acct-msg bad'; return; }
      const lr = login(name, pwd);
      if (!lr.ok) { msg.textContent = lr.msg; msg.className = 'acct-msg bad'; return; }
      done();
    }
    paint();
  }
  function done() {
    const m = document.getElementById('acctMask');
    if (m) { m.classList.remove('on'); setTimeout(() => m.remove(), 200); }
    renderTopbar();
    if (window.route) window.route();
  }

  /* ===================== 顶栏账户入口 ===================== */
  function renderTopbar() {
    let el = document.getElementById('acctBtn');
    if (!ENABLED) return;
    const tb = document.getElementById('topbar');
    if (!tb) return;
    if (!el) {
      el = document.createElement('span');
      el.id = 'acctBtn'; el.className = 'acct-trigger';
      tb.appendChild(el);
    }
    if (!cur) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = `<span class="av sm">${UI.esc((cur.nick || cur.name)[0])}</span><span class="nm">${UI.esc(cur.nick || cur.name)}</span>▾`;
    el.onclick = showMenu;
  }
  function showMenu() {
    const isA = isAdmin();
    Modal.open(`
      <div class="acct-menu">
        <div class="am-head">
          <span class="av">${UI.esc((cur.nick || cur.name)[0])}</span>
          <div><div class="am-nm">${UI.esc(cur.nick || cur.name)}</div>
          <div class="am-sub">${UI.esc(cur.name)} · ${isA ? '管理员' : '学生'}</div></div>
        </div>
        <div class="am-stats">
          <div><b>${points()}</b><span>⭐ 星星</span></div>
          <div><b>${state ? state.stats.games : 0}</b><span>玩过次数</span></div>
          <div><b>${state ? state.stats.wrong : 0}</b><span>总错词次</span></div>
        </div>
        ${isA ? '<button class="am-btn" id="amAdmin">🛠️ 管理后台</button>' : ''}
        <button class="am-btn" id="amSwitch">🔄 切换账号</button>
        <button class="am-btn danger" id="amLogout">🚪 退出登录</button>
      </div>`, { cls: 'acct-modal' });
    const adm = document.getElementById('amAdmin'); if (adm) adm.onclick = () => { Modal.close(); showAdmin(); };
    document.getElementById('amSwitch').onclick = () => { Modal.close(); logout(); showLogin(); };
    document.getElementById('amLogout').onclick = () => { Modal.close(); logout(); showLogin(); };
  }

  /* ===================== 管理后台 ===================== */
  function showAdmin() {
    function statsRow(u) {
      const st = DB.get('state_' + u.name, null);
      const s = st ? migrate(st) : defaultState();
      const mins = Math.round((s.stats.playMs || 0) / 60000);
      const wrong = Object.keys(s.mastery || {}).filter(k => s.mastery[k].wrong > 0).length;
      return { points: s.points, games: s.stats.games, wrong, mins };
    }
    const rows = listUsers().map(u => ({ u, r: statsRow(u) }));
    Modal.open(`
      <div class="admin-wrap">
        <div class="admin-head">🛠️ 管理后台 · 全部账号</div>
        <div class="admin-list">
          ${rows.map(({ u, r }) => `
            <div class="admin-row">
              <div class="ar-left">
                <span class="av ${u.role === 'admin' ? 'admin' : ''}">${UI.esc((u.nick || u.name)[0])}</span>
                <div><div class="ar-nm">${UI.esc(u.nick || u.name)} ${u.role === 'admin' ? '<span class="tag">管理</span>' : ''}</div>
                <div class="ar-sub">⭐${r.points} · 玩${r.games}次 · 错词${r.wrong}个 · 练习${r.mins}分</div></div>
              </div>
              <div class="ar-act">
                <button class="ar-btn" data-view="${UI.esc(u.name)}">详情</button>
                <button class="ar-btn" data-pwd="${UI.esc(u.name)}">改密</button>
                ${u.name !== ADMIN.name && u.name !== (cur && cur.name) ? `<button class="ar-btn danger" data-del="${UI.esc(u.name)}">删除</button>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <button class="am-btn ghost" id="admClose">关闭</button>
      </div>`, { cls: 'acct-modal' });
    const close = document.getElementById('admClose'); if (close) close.onclick = () => Modal.close();
    Modal.el && UI.$$('.ar-btn', Modal.el).forEach(b => b.onclick = () => {
      const v = b.getAttribute('data-view'), p = b.getAttribute('data-pwd'), d = b.getAttribute('data-del');
      if (v) return showUserDetail(v);
      if (p) return promptPwd(p);
      if (d) return doDelete(d);
    });
  }
  function showUserDetail(name) {
    const u = users.find(x => x.name === name); if (!u) return;
    const s = migrate(DB.get('state_' + name, null));
    const wrong = Object.keys(s.mastery || {}).filter(k => s.mastery[k].wrong > 0)
      .map(k => ({ en: k, ...s.mastery[k] }))
      .sort((a, b) => (b.wrong - b.right) - (a.wrong - a.right));
    const mins = Math.round((s.stats.playMs || 0) / 60000);
    Modal.open(`
      <div class="admin-wrap">
        <div class="admin-head">📊 ${UI.esc(u.nick || u.name)} 的学习情况</div>
        <div class="ad-sum">
          <div><b>${s.points}</b><span>⭐星星</span></div>
          <div><b>${s.stats.games}</b><span>玩过次数</span></div>
          <div><b>${s.stats.right}</b><span>答对次</span></div>
          <div><b>${s.stats.wrong}</b><span>答错次</span></div>
          <div><b>${mins}</b><span>练习分钟</span></div>
        </div>
        <div class="ad-title">❌ 易错单词（错得最多的排前面，游戏里出现更频）</div>
        <div class="ad-wrong">
          ${wrong.length ? wrong.slice(0, 40).map(w => `<span class="wtag">${UI.esc(w.en)} <i>错${w.wrong}/对${w.right}</i></span>`).join('') : '<span class="muted">还没有错词，真棒！</span>'}
        </div>
        <button class="am-btn ghost" id="adBack">← 返回列表</button>
      </div>`, { cls: 'acct-modal' });
    document.getElementById('adBack').onclick = () => { Modal.close(); showAdmin(); };
  }
  function promptPwd(name) {
    Modal.open(`
      <div class="admin-wrap">
        <div class="admin-head">🔑 重置「${UI.esc(name)}」的密码</div>
        <input class="acct-in" id="npw" placeholder="输入新密码" type="password">
        <button class="acct-btn" id="npwGo">确认修改</button>
        <div class="acct-msg" id="npwMsg"></div>
      </div>`, { cls: 'acct-modal' });
    document.getElementById('npwGo').onclick = () => {
      const pw = document.getElementById('npw').value;
      const ok = resetPwd(name, pw);
      const msg = document.getElementById('npwMsg');
      if (!ok) { msg.textContent = '密码不能为空'; msg.className = 'acct-msg bad'; return; }
      Modal.close(); UI.toast('密码已重置'); showAdmin();
    };
  }
  function doDelete(name) {
    Modal.open(`
      <div class="admin-wrap">
        <div class="admin-head">⚠️ 删除账号「${UI.esc(name)}」？</div>
        <div class="ad-warn">会同时删除该账号在本机的学习记录，且云端记录也会被清除（不可恢复）。</div>
        <button class="am-btn danger" id="dlGo">确认删除</button>
        <button class="am-btn ghost" id="dlCancel">取消</button>
      </div>`, { cls: 'acct-modal' });
    document.getElementById('dlGo').onclick = () => { deleteUser(name); Modal.close(); UI.toast('已删除'); showAdmin(); };
    document.getElementById('dlCancel').onclick = () => { Modal.close(); showAdmin(); };
  }

  /* ---------- 初始化 ---------- */
  cloud = loadCloud();
  if (ENABLED) {
    document.addEventListener('DOMContentLoaded', () => { guard(); });
    // 路由切换后确保顶栏是当前账号
    window.addEventListener('hashchange', () => { if (cur) renderTopbar(); });
  }

  return {
    enabled: ENABLED,
    current: () => cur,
    isAdmin, listUsers,
    points, addPoints, recordWord, recordPlay, masteryOf, pickByMastery, wrongWords,
    login, logout, register, resetPwd, deleteUser,
    guard, renderTopbar, showLogin, showAdmin
  };
})();
