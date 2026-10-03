/* ================= 英语模块：单词拼写小游戏 =================
 *  听音拼写 / 乱序拼词 / 限时闯关 —— 积分、等级、即时反馈、鼓励特效
 * =========================================================== */
window.English = (function () {
  let G = null;   // 当前游戏状态

  const getBook = id => EN_BOOKS.find(b => b.id === id) || EN_BOOKS[0];
  const getMod = (b, id) => b.units.find(m => m.id === id) || b.units[0];

  /* 可发音：支持纯单词与词组（moon cake / sports day / New Year / come on）
   * —— 只排除明显不是英文的条目（数字、纯符号） */
  const playable = w => {
    const s = String(w && w.en || '').trim();
    if (!s) return false;
    if (/[0-9]/.test(s)) return false;
    return /^[a-z][a-z'’]*( [a-z][a-z'’]*)*$/i.test(s);
  };
  /* 拼字游戏只能玩纯字母单词（词组有空格，tile 拼不出来） */
  const spellable = w => /^[a-z'’]{2,12}$/i.test(String(w && w.en || '').trim());

  /* ---------- 选册 ---------- */
  function books() {
    return `<div class="page-head"><span class="back" data-go="#/home">‹</span><h2>英语</h2></div>
      <p class="big-title">选一册开始闯关</p>
      <p class="sub-title">人教版（三年级起点）· 边玩边背单词</p>
      ${EN_BOOKS.map(b => `
        <button class="big-btn ${b.id === '4a' ? 'bg-g' : 'bg-p'}" data-go="#/en/${b.id}">
          <span class="ico">${b.id === '4a' ? '🔠' : '🎧'}</span>
          <span>${b.name}<small>${b.sub} · ${b.units.length} 个单元</small></span>
        </button>`).join('')}`;
  }

  /* ---------- 模块列表 ---------- */
  function mods(p) {
    const b = getBook(p[1]);
    return `<div class="page-head"><span class="back" data-go="#/en">‹</span><h2>${b.name}</h2></div>
      <div style="display:flex;gap:8px;margin-bottom:6px">
        ${EN_BOOKS.map(x => `<span class="chip small ${x.id === b.id ? 'b' : ''}" ${x.id === b.id ? '' : `data-go="#/en/${x.id}"`}>${x.name}</span>`).join('')}
      </div>
      <p class="sub-title">挑一个单元，马上开玩</p>
      ${b.units.map(m => `
        <div class="unit-card" style="border-left-color:#35C77E">
          <h3>${m.name} · ${m.topic}</h3>
          <div style="color:var(--ink2);font-size:15px;margin-bottom:10px">共 ${m.words.length} 个单词</div>
          <div class="grid2">
            <a class="btn bg-b" href="#/en/g/spell/${b.id}/${m.id}"><span>🎧</span>听音拼写</a>
            <a class="btn bg-p" href="#/en/g/scramble/${b.id}/${m.id}"><span>🔀</span>拼词游戏</a>
            <a class="btn bg-o" href="#/en/g/timed/${b.id}/${m.id}"><span>⏱️</span>限时闯关</a>
            <a class="btn ghost" href="#/en/${b.id}/${m.id}"><span>📖</span>单词表</a>
          </div>
        </div>`).join('')}`;
  }

  /* ---------- 单词表（单独页） ---------- */
  function wordList(p) {
    const b = getBook(p[2]), m = getMod(b, p[3]);
    return `<div class="page-head"><span class="back" data-go="#/en/${b.id}">‹</span><h2>${m.name}</h2></div>
      <p class="sub-title">${m.topic} · 点任意一行就能听发音</p>
      <div class="card">
        ${m.words.map(w => `
          <div class="js-say" data-w="${UI.esc(w.en)}" style="justify-content:space-between;padding:12px 4px;border-bottom:1px solid var(--line)">
            <b style="font-size:20px">${UI.esc(w.en)}</b>
            <span style="display:flex;align-items:center;gap:8px;color:var(--ink2)">
              ${UI.esc(w.zh)}<span class="spk">🔊</span></span>
          </div>`).join('')}
      </div>
      <a class="big-btn bg-o" href="#/en/${b.id}"><span class="ico">🎮</span><span>玩这个单元的游戏</span></a>`;
  }

  /* ---------- 单个单元：游戏入口 + 单词速览 ---------- */
  function modPage(p) {
    const b = getBook(p[1]), m = getMod(b, p[2]);
    const games = [
      ['spell', '🎧', '听音拼写', '听到发音，把单词拼出来', 'bg-b'],
      ['scramble', '🔀', '拼词游戏', '打乱的字母，拼回正确单词', 'bg-p'],
      ['timed', '⏱️', '限时闯关', `${APP_CONFIG.EN_TIMED_SECONDS} 秒内能拼几个`, 'bg-o']
    ];
    return `<div class="page-head"><span class="back" data-go="#/en/${b.id}">‹</span><h2>${m.name}</h2></div>
      <p class="big-title">${UI.esc(m.topic)}</p>
      <p class="sub-title">共 ${m.words.length} 个单词 · 选一个玩法</p>
      ${games.map(g => `
        <a class="big-btn ${g[4]}" href="#/en/g/${g[0]}/${b.id}/${m.id}">
          <span class="ico">${g[1]}</span><span>${g[2]}<small>${g[3]}</small></span></a>`).join('')}
      <div class="card" style="margin-top:16px">
        <div style="font-weight:800;margin-bottom:6px">📖 单词速览（点一行听发音）</div>
        ${m.words.map(w => `
          <div class="js-say" data-w="${UI.esc(w.en)}" style="justify-content:space-between;padding:9px 2px;border-bottom:1px solid var(--line)">
            <b>${UI.esc(w.en)}</b>
            <span style="display:flex;align-items:center;gap:8px;color:var(--ink2)">
              ${UI.esc(w.zh)}<span class="spk">🔊</span></span>
          </div>`).join('')}
      </div>`;
  }

  /* ---------- 游戏页 ---------- */
  function game(p) {
    const mode = p[2], bid = p[3], mid = p[4];
    const b = getBook(bid), m = getMod(b, mid);
    const titleMap = { spell: '听音拼写', scramble: '拼词游戏', timed: '限时闯关' };
    const lv = levelOf(DB.get('points', 0));
    return `<div class="page-head"><span class="back" data-go="#/en/${bid}">‹</span>
        <h2>${titleMap[mode]}</h2><span class="spacer"></span>
        <span class="chip small b">${m.name}</span></div>
      <div class="game-top">
        <span class="pill" id="gProg">1 / 1</span>
        <span class="pill" id="gLevel">${lv.name}</span>
        <span class="pill" id="gTimer" style="display:none">⏱️ 60</span>
      </div>
      <div id="gameBox"></div>`;
  }

  /* ---------- 游戏引擎 ---------- */
  function startGame(mode, bid, mid) {
    const b = getBook(bid), m = getMod(b, mid);
    // 听音拼写/限时闯关只出可拼的单词；拼词游戏同理。词组单独在单词表里点读。
    let words = m.words.filter(spellable);
    if (words.length < 3) words = m.words;
    G = {
      mode, words: UI.shuffle(words), i: 0, letters: [], built: [], used: [],
      timer: null, left: APP_CONFIG.EN_TIMED_SECONDS || 60,
      earned: 0, streak: 0, right: 0, total: 0, hinted: false, gave: 0
    };
    step(true);
  }

  function speakNow(w, slow) {
    Say.en(w, slow ? (APP_CONFIG.EN_SPEAK_RATE || .75) * .85 : APP_CONFIG.EN_SPEAK_RATE);
    const s = document.getElementById('sSay');
    if (s) { s.classList.add('spk-flash'); setTimeout(() => s.classList.remove('spk-flash'), 420); }
  }

  /* 保证「题目框 + 所有字母块」在手机上一屏装得下（不用上下拉）：
     渲染完量一次，超了就整体按比例收一点（--fit），反复几次直到不超。
     单词越长、块越多，收得越多；最短也只收到 0.58，字号仍然看得清。 */
  function fitGame() {
    const card = document.querySelector('#gameBox .card');
    if (!card) return;
    const root = document.documentElement;
    let f = 1;
    card.style.setProperty('--fit', '1');
    for (let i = 0; i < 12; i++) {
      if (root.scrollHeight <= window.innerHeight) break;
      f = Math.max(0.48, f - 0.055);
      card.style.setProperty('--fit', String(f));
      if (f <= 0.48) break;
    }
  }

  function step(autoSpeak) {
    const box = document.getElementById('gameBox');
    if (!box || !G) return;
    if (G.mode !== 'timed' && G.i >= G.words.length) return finish(false);

    // __EN_FORCE_WORD 是给自动化测试用的（构造"最长单词"这种最坏情况），平时不设
    const forced = window.__EN_FORCE_WORD;
    const w = forced
      ? { en: String(forced), zh: '（测试词）' }
      : (G.mode === 'timed'
        ? G.words[Math.floor(Math.random() * G.words.length)]
        : G.words[G.i]);

    const letters = w.en.toLowerCase().split('');
    const extra = ['a', 'e', 'i', 'o', 'u', 'r', 's', 't', 'n', 'l', 'm', 'c', 'd', 'p', 'h', 'g'];
    const pool = UI.shuffle(letters.concat(UI.shuffle(extra).slice(0, 2)));
    G.cur = w; G.letters = pool; G.built = []; G.used = []; G.hinted = false;

    document.getElementById('gProg').textContent =
      G.mode === 'timed' ? `✅ ${G.right} 个` : `${G.i + 1} / ${G.words.length}`;
    document.getElementById('gTimer').style.display = G.mode === 'timed' ? 'block' : 'none';

    box.innerHTML = `
      <div class="card">
        <div class="word-zh">${G.mode === 'scramble' ? '<span style="font-size:22px">拼出这个单词 →</span>' : '🎧 听一听，拼出这个单词'}</div>
        <div class="word-hint-row">
          <span class="zh">${UI.esc(w.zh)}</span>
          <button class="mini-spk" id="sZhSay">🔊 再听一遍</button>
        </div>
        <div class="word-hint">${w.hint ? '💡 ' + UI.esc(w.hint) : ''}</div>
        <div class="slots" id="slots">${letters.map(() => '<div class="slot"></div>').join('')}</div>
        <div class="tiles" id="tiles">${pool.map((c, i) => `<div class="tile" data-c="${c}" data-i="${i}">${c}</div>`).join('')}</div>
        <div class="combo" id="combo">${G.streak >= 2 ? '🔥 连对 ' + G.streak + ' 个！' : ''}</div>
        <div class="game-ctrl">
          <button class="btn ghost" id="sHint">💡 提示</button>
          <button class="btn bg-y" id="sClear" style="color:#6A4A05">↩️ 清空</button>
        </div>
        <button class="btn bg-b" id="sSkip" style="width:100%;margin-top:10px">⏭️ ${G.mode === 'timed' ? '换一个' : '听不清，跳过这个'}</button>
      </div>`;

    document.getElementById('sZhSay').onclick = (e) => { e.stopPropagation(); speakNow(w.en, true); };
    document.getElementById('sHint').onclick = () => {
      if (G.hinted) { UI.toast('已经提示过啦'); return; }
      if (G.built.length >= G.cur.en.length) return;
      const first = G.cur.en.toLowerCase()[0];
      let target = -1;
      UI.$$('#tiles .tile').forEach((t, i) => {
        if (target < 0 && G.used.indexOf(i) < 0 && t.getAttribute('data-c') === first) target = i;
      });
      if (target < 0) return;
      G.hinted = true;
      tapLetter({ idx: target });
      UI.toast('送你一个字母，这一次少得 3 颗星哦');
    };
    document.getElementById('sClear').onclick = () => {
      G.built = []; G.used = [];
      UI.$$('#tiles .tile').forEach(t => t.classList.remove('used'));
      paint();
    };
    const sk = document.getElementById('sSkip');
    if (sk) sk.onclick = () => {
      Say.en(w.en); UI.toast('正确答案是 ' + w.en);
      G.streak = 0;
      if (G.mode === 'timed') setTimeout(() => step(false), 900);
      else setTimeout(() => { G.i++; step(true); }, 1100);
    };

    UI.$$('#tiles .tile').forEach((t, i) => t.onclick = () => tapLetter({ idx: i }));
    // 点题目卡片空白处也能再听一遍（tile 和按钮已 stopPropagation）
    box.querySelector('.card').addEventListener('click', (e) => {
      if (e.target.closest('.tile') || e.target.closest('button')) return;
      speakNow(w.en, true);
    });

    if (autoSpeak && G.mode !== 'scramble') setTimeout(() => speakNow(w.en), 300);
    if (G.mode === 'timed' && !G.timer) startTimer();
    fitGame();                       // 框 + 字母必须一屏装得下
    setTimeout(fitGame, 60);         // 字体加载/换行后再校一次
  }

  function tapLetter(opt) {
    if (!G || G.built.length >= G.cur.en.length) return;
    const idx = opt && opt.idx;
    const tile = UI.$$('#tiles .tile')[idx];
    if (!tile || G.used.indexOf(idx) >= 0) return;
    G.used.push(idx);
    tile.classList.add('used');
    G.built.push(tile.getAttribute('data-c'));
    SFX.tap();
    paint();
    if (G.built.length === G.cur.en.length) judge();
  }

  function paint() {
    const slots = UI.$$('#slots .slot');
    G.cur.en.toLowerCase().split('').forEach((c, i) => {
      slots[i].textContent = G.built[i] || '';
      slots[i].className = 'slot' + (G.built[i] ? ' filled' : '');
    });
  }

  function judge() {
    const answer = G.built.join('');
    if (answer === G.cur.en.toLowerCase()) {
      SFX.right();
      G.right++; G.total++; G.streak++;
      const bonus = Math.min(5, G.streak - 1);
      const get = 10 + bonus - (G.hinted ? 3 : 0);
      G.earned += Math.max(1, get);
      const before = levelOf(DB.get('points', 0)).name;
      addPoints(get);
      const after = levelOf(DB.get('points', 0)).name;
      FX.burst(28);
      UI.toast(G.streak >= 3 ? `🔥 连对${G.streak}个！+${get}⭐` : `太棒了！+${get}⭐`);
      if (before !== after) setTimeout(() => UI.toast('🎉 升级啦！你是「' + after + '」了'), 600);
      if (G.mode !== 'timed') {
        UI.$$('#slots .slot').forEach(s => s.style.background = '#D9F5E4');
        setTimeout(() => { G.i++; step(true); }, 950);
      } else {
        UI.$$('#slots .slot').forEach(s => s.style.background = '#D9F5E4');
        setTimeout(() => step(false), 700);
        document.getElementById('gProg').textContent = `✅ ${G.right} 个`;
      }
    } else {
      SFX.wrong();
      G.total++; G.streak = 0;
      const slots = UI.$$('#slots .slot');
      slots.forEach(s => s.classList.add('bad'));
      UI.toast('拼错啦，正确拼写是 ' + G.cur.en);
      Say.en(G.cur.en, .7);
      setTimeout(() => {
        if (G.mode !== 'timed') { G.i++; step(true); }
        else step(false);
      }, 1700);
    }
    const cb = document.getElementById('combo');
    if (cb) cb.textContent = G.streak >= 2 ? '🔥 连对 ' + G.streak + ' 个！' : '';
  }

  function startTimer() {
    const el = document.getElementById('gTimer');
    G.left = APP_CONFIG.EN_TIMED_SECONDS || 60;
    G.timer = setInterval(() => {
      G.left--;
      if (el) el.textContent = '⏱️ ' + G.left;
      if (el) el.className = 'pill timer' + (G.left <= 10 ? ' low' : '');
      if (G.left <= 0) { clearInterval(G.timer); G.timer = null; Say.stop(); finish(true); }
    }, 1000);
  }

  function finish(isTimeUp) {
    if (G.timer) { clearInterval(G.timer); G.timer = null; }
    const box = document.getElementById('gameBox');
    const pct = G.total ? Math.round(G.right / G.total * 100) : 0;
    const em = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '🌱';
    const msg = pct >= 90 ? '太厉害啦，几乎全对！' : pct >= 70 ? '很不错，再练练就满分！' : pct >= 50 ? '有进步，继续加油！' : '别灰心，多听几遍就会啦～';
    SFX.win(); FX.burst(80);
    const mode0 = G.mode;
    const bid = (location.hash.split('/')[4]) || EN_BOOKS[0].id;
    const mid = (location.hash.split('/')[5]) || getBook(bid).units[0].id;
    // 结算页也把本模块单词全部列出来，随时点读复习
    const list = getMod(getBook(bid), mid).words;
    box.innerHTML = `
      <div class="card result">
        <div class="em">${em}</div>
        <h2>${isTimeUp ? '时间到！' : '这一组完成啦！'}</h2>
        <div class="sc">拼对 ${G.right} 个 · 正确率 ${pct}% · 本次 ⭐ ${G.earned}</div>
        <div style="margin:10px 0 4px;font-size:18px;color:var(--ink2)">${msg}</div>
        <div style="margin-top:14px;font-size:16px;font-weight:800;color:var(--ink)">📖 点任意一行听发音</div>
        <div style="text-align:left;max-height:38vh;overflow:auto;margin-top:6px">
          ${list.map(w => `
            <div class="js-say" data-w="${UI.esc(w.en)}" style="justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--line)">
              <b style="font-size:19px">${UI.esc(w.en)}</b>
              <span style="display:flex;align-items:center;gap:8px;color:var(--ink2)">
                ${UI.esc(w.zh)}<span class="spk">🔊</span></span>
            </div>`).join('')}
        </div>
        <div class="grid2" style="margin-top:16px">
          <button class="btn bg-g" id="fAgain"><span>🔄</span>再玩一次</button>
          <a class="btn ghost" href="#/en/${bid}"><span>📚</span>换个单元</a>
        </div>
      </div>`;
    document.getElementById('fAgain').onclick = () => startGame(mode0, bid, mid);
    UI.$$('.js-say', box).forEach(r => r.onclick = () => Say.en(r.getAttribute('data-w')));
    G = null;
  }

  return {
    render(p) {
      if (!p[1]) return books();
      if (p[1] === 'g') return game(p);
      if (p[1] === 'w') return wordList(p);
      if (p[2]) return modPage(p);
      return mods(p);
    },
    mount(p) {
      const view = document.getElementById('view');
      UI.$$('.js-say', view).forEach(r => r.onclick = () => Say.en(r.getAttribute('data-w')));
      if (p[1] === 'g') {
        const [mode, bid, mid] = [p[2], p[3], p[4]];
        // 离开游戏时清掉计时器
        window.addEventListener('hashchange', () => { if (G && G.timer) { clearInterval(G.timer); G.timer = null; } });
        // 转屏/改窗口尺寸后重新校正"一屏装得下"
        window.addEventListener('resize', fitGame);
        window.addEventListener('orientationchange', () => setTimeout(fitGame, 200));
        startGame(mode, bid, mid);
      }
    }
  };
})();
