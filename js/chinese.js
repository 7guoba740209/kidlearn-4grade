/* ================= 语文模块：单元目录 → 课文原文 → 抖音朗读 ================= */
window.Chinese = (function () {
  const FALLBACK_BOOK = '4a';

  /* ---------- 合并课文全文 ----------
   *  data/chinese-data.js 里原本只放了「精彩片段」；data/full-4a.js / full-4b.js
   *  提供完整课文。这里在启动时把全文覆盖上去，并标记 full:true。
   *  所以维护课文内容只需要改 data/full-*.js —— 页面、朗读都不用动。
   * ------------------------------------------------------------ */
  (function mergeFullText() {
    const T = window.CN_FULL_TEXT || {};
    let n = 0;
    (window.CN_BOOKS || []).forEach(book => {
      (book.units || []).forEach(unit => {
        (unit.lessons || []).forEach(l => {
          const t = T[book.id + '-' + l.no];
          if (t && String(t).trim().length) { l.text = String(t).trim(); l.full = true; n++; }
        });
      });
    });
    window.__CN_FULL_COUNT = n;
  })();

  function findBook(id) { return CN_BOOKS.find(b => b.id === id) || CN_BOOKS[0]; }
  function findUnit(book, uid) { return book.units.find(u => u.id === uid); }
  function findLesson(unit, no) { return unit.lessons.find(l => l.no === no); }

  /* 朗读源：优先 lesson.video → CN_LINKS 表 → 空（播放器自动走本机朗读） */
  function linkOf(bookId, lesson) {
    if (lesson.video) return lesson.video;
    const t = (window.APP_CONFIG && APP_CONFIG.CN_LINKS) || {};
    const key = bookId + '-' + lesson.no;
    return t[key] || '';
  }
  /* 这一课有没有录好可用的抖音视频（能解析出视频ID才算） */
  function hasVideo(bookId, lesson) {
    return !!Douyin.parseVid(linkOf(bookId, lesson));
  }

  /* ---------- 首页：选册 ---------- */
  function renderBook(p) {
    const cards = CN_BOOKS.map(b => `
      <button class="big-btn ${b.id === '4a' ? 'bg-o' : 'bg-p'}" data-go="#/cn/${b.id}">
        <span class="ico">${b.id === '4a' ? '🍂' : '🌱'}</span>
        <span>${b.name}<small>${b.sub} · 共 ${b.units.length} 个单元</small></span>
      </button>`).join('');
    return `
      <div class="page-head"><span class="back" data-go="#/home">‹</span><h2>语文</h2></div>
      <p class="big-title">选一册开始</p>
      <p class="sub-title">点开就能看课文、听朗读</p>
      ${cards}`;
  }

  /* ---------- 单元目录 ---------- */
  const essaysOf = (bookId, unitId) =>
    (window.CN_ESSAYS && CN_ESSAYS[bookId + '-' + unitId]) || [];

  function renderUnits(p) {
    const book = findBook(p[1]);
    const units = book.units.map(u => {
      const es = essaysOf(book.id, u.id);
      const essayChip = es.length
        ? `<a class="chip orange essay-chip" href="#/cn/${book.id}/${u.id}/essay">
             ✍️ ${es.length} 篇优秀作文</a>`
        : '';
      return `
      <div class="unit-card" style="border-left-color:${u.id === 'u1' ? '#FF8A3D' : ''}">
        <h3>${u.name}</h3>
        <div class="lesson-list">
          ${u.lessons.map(l => `<a class="chip ${Number(l.no) % 2 ? '' : 'g'}" href="#/cn/${book.id}/${u.id}/${l.no}">${l.no} ${l.title}</a>`).join('')}
          ${essayChip}
        </div>
      </div>`;
    }).join('');
    return `
      <div class="page-head"><span class="back" data-go="#/cn">‹</span><h2>${book.name}</h2></div>
      <div style="display:flex;gap:8px;margin-bottom:6px">
        ${CN_BOOKS.map(b => `<span class="chip small ${b.id === book.id ? 'b' : ''}" ${b.id === book.id ? '' : `data-go="#/cn/${b.id}"`}>${b.name}</span>`).join('')}
      </div>
      ${units}`;
  }

  /* ---------- 优秀作文列表（每个单元 3 篇） ---------- */
  function renderEssays(p) {
    const book = findBook(p[1]);
    const unit = findUnit(book, p[2]) || book.units[0];
    const es = essaysOf(book.id, unit.id);

    if (!es.length) {
      return `<div class="page-head"><span class="back" data-go="#/cn/${book.id}">‹</span><h2>优秀作文</h2></div>
        <div class="card" style="text-align:center;padding:26px 16px">
          <div style="font-size:52px">✍️</div>
          <div style="font-weight:900;font-size:20px;margin-top:6px">这个单元还没有配作文</div>
          <div style="color:var(--ink2);font-size:15px;margin-top:8px">
            可以在 <b>data/essay-data.js</b> 里，用键名 <b>'${book.id}-${unit.id}'</b> 补上几篇。
          </div>
        </div>
        <a class="big-btn bg-o" href="#/cn/${book.id}"><span class="ico">📖</span><span>回到单元目录</span></a>`;
    }

    const cards = es.map((e, i) => `
      <div class="essay-card" data-go="#/cn/${book.id}/${unit.id}/essay/${i}">
        <div class="ec-no">${i + 1}</div>
        <div class="ec-main">
          <div class="ec-title">${UI.esc(e.title)}</div>
          <div class="ec-sub">${UI.esc(e.author || '')} · 约 ${e.words || (e.text || '').replace(/\s/g, '').length} 字</div>
          <div class="ec-tags">${(e.tags || []).map(t => `<span class="etag">${UI.esc(t)}</span>`).join('')}</div>
        </div>
        <div class="ec-go">阅读 ›</div>
      </div>`).join('');

    return `
      <div class="page-head"><span class="back" data-go="#/cn/${book.id}">‹</span><h2>优秀作文</h2>
        <span class="spacer"></span><span class="chip small g">${unit.name.split('·')[0].trim()}</span></div>
      <p class="big-title">${UI.esc(unit.name.split('·')[1] ? unit.name.split('·')[1].trim() : '单元习作')}</p>
      <p class="sub-title">${book.name} · 本单元 ${es.length} 篇范文，点开就能读</p>
      ${cards}
      <div class="card" style="margin-top:14px">
        <div style="font-weight:800;margin-bottom:6px">💡 怎么用这几篇范文</div>
        <div style="color:var(--ink2);font-size:15px;line-height:1.8">
          ① 先自己想一想：如果让我写，我会写什么？<br>
          ② 再读范文，找找它写得好的地方（每篇都标了亮点）<br>
          ③ 最后挑一个句式，改成你自己的事。
        </div>
      </div>`;
  }

  /* ---------- 作文正文页 ---------- */
  function renderEssayRead(p) {
    const book = findBook(p[1]);
    const unit = findUnit(book, p[2]) || book.units[0];
    const es = essaysOf(book.id, unit.id);
    const idx = Number(p[3]) || 0;
    const e = es[idx];
    if (!e) return renderEssays([p[0], book.id, unit.id]);

    const paras = String(e.text || '').split('\n').filter(s => s.trim().length);
    const body = paras.map(s => `<p class="essay-p">${UI.esc(s.trim())}</p>`).join('');
    const prev = idx > 0 ? `<a class="btn ghost" href="#/cn/${book.id}/${unit.id}/essay/${idx - 1}">‹ 上一篇</a>` : '<span></span>';
    const next = idx < es.length - 1 ? `<a class="btn bg-b" href="#/cn/${book.id}/${unit.id}/essay/${idx + 1}">下一篇 ›</a>` : '<span></span>';

    return `
      <div class="page-head">
        <span class="back" data-go="#/cn/${book.id}/${unit.id}/essay">‹</span>
        <h2>优秀作文</h2>
        <span class="spacer"></span>
        <span class="chip small g">${idx + 1} / ${es.length}</span>
      </div>

      <div class="essay-head">
        <h3>${UI.esc(e.title)}</h3>
        <div class="essay-by">${UI.esc(e.author || '')}</div>
        <div class="essay-meta">约 ${e.words || paras.join('').length} 字 · ${book.name} ${unit.name.split('·')[0].trim()}</div>
        ${(e.tags || []).length ? `<div class="ec-tags" style="justify-content:center">
          ${e.tags.map(t => `<span class="etag">${UI.esc(t)}</span>`).join('')}</div>` : ''}
      </div>

      <div class="essay-box">${body}</div>

      <div class="card" style="margin-top:14px">
        <div style="font-weight:800;margin-bottom:6px">✍️ 读完了，试试这几件事</div>
        <div style="color:var(--ink2);font-size:16px;line-height:1.9">
          1. 这篇作文你最喜欢哪一句？抄下来。<br>
          2. 它用了什么方法？（${(e.tags || ['观察', '描写', '安排顺序']).join(' / ')}）<br>
          3. 换成你自己的事，学着写一段。
        </div>
      </div>

      <div class="grid2" style="margin-top:14px">${prev}${next}</div>
      <a class="big-btn bg-o" style="margin-top:10px" href="#/cn/${book.id}/${unit.id}/essay"><span class="ico">📚</span><span>回到这个单元的作文列表</span></a>`;
  }

  /* ---------- 课文页 ---------- */
  function renderLesson(p) {
    const book = findBook(p[1]);
    const unit = findUnit(book, p[2]) || book.units[0];
    const lesson = findLesson(unit, p[3]) || unit.lessons[0];
    const ok = hasVideo(book.id, lesson);

    // 排版：句子普遍很短（≥3行且平均长度<22字）→ 按诗歌/韵文居中排版，否则按现代文首行缩进
    const lines = (lesson.text || '').split('\n').filter(s => s.trim().length);
    const avg = lines.reduce((s, t) => s + t.length, 0) / Math.max(1, lines.length);
    const isVerse = lines.length >= 3 && avg < 22;
    const body = lines.map((s, i) => `<p class="${isVerse ? 'poem' : ''}" data-l="${i}">${UI.esc(s)}</p>`).join('');

    DB.set('lastCn', { b: book.id, u: unit.id, l: lesson.no, title: lesson.title });

    return `
      <div class="page-head">
        <span class="back" data-go="#/cn/${book.id}/${unit.id}">‹</span>
        <h2>${lesson.no} ${UI.esc(lesson.title)}</h2>
        <span class="spacer"></span>
        <span class="chip small g">${unit.name}</span>
      </div>

      <div class="toolbar">
        <button class="btn bg-pk" id="btnRead"><span>🔊</span>听朗读</button>
        <button class="btn ghost" id="btnMark">${isMarked(book.id, lesson.no) ? '⭐ 已收藏' : '☆ 收藏'}</button>
      </div>
      <div class="read-hint" id="readHint">🔊 点「听朗读」，声音会一句一句读出来，读到哪句，哪句就变色</div>

      <div class="text-box" id="textBox">
        <div class="by">${UI.esc(lesson.by || '')}</div>
        ${body}
      </div>

      <div class="card" style="margin-top:14px">
        <div style="font-weight:800;margin-bottom:6px">📌 这一课</div>
        <div style="color:var(--ink2);font-size:16px">
          点「🔊 听朗读」，声音会一句一句读出来，读到的句子会变颜色。<br>
          朗读时你可以<b>自己上下翻看</b>，翻看后会自动暂停跟随，点底部「⬇ 回到正在读的地方」再跟上。<br>
          想换成本课真人朗读视频也可以：打开 <b>data/config.js</b>，
          在 CN_LINKS 里加一行 <b>'${book.id}-${lesson.no}': '视频ID或链接'</b>。
        </div>
      </div>

      <button class="follow-btn" id="sbFollow" hidden>⬇ 回到正在读的地方</button>

      <div class="songbar" id="songBar" hidden>
        <button class="sb-btn" id="sbPrev" aria-label="上一句">‹</button>
        <button class="sb-play" id="sbPlay">⏸ 暂停</button>
        <button class="sb-btn" id="sbNext" aria-label="下一句">›</button>
        <button class="sb-x" id="sbClose" aria-label="停止">✕</button>
      </div>

      <div class="grid2" style="margin-top:14px">
        ${prevNext(book, unit, lesson)}
      </div>`;
  }

  function presOrNext(book, unit, lesson, dir) {
    const units = book.units;
    let ui = units.indexOf(unit), li = unit.lessons.indexOf(lesson);
    li += dir;
    while (ui >= 0 && ui < units.length) {
      if (li < 0) { ui--; if (ui < 0) break; li = units[ui].lessons.length - 1; continue; }
      if (li >= units[ui].lessons.length) { ui++; li = 0; continue; }
      const u = units[ui], l = u.lessons[li];
      return `<a class="btn ${dir < 0 ? 'ghost' : 'bg-b'}" href="#/cn/${book.id}/${u.id}/${l.no}">
        ${dir < 0 ? '‹ 上一课：' : '下一课：'} ${l.title}</a>`;
    }
    return '<span></span>';
  }
  function prevNext(book, unit, lesson) {
    return presOrNext(book, unit, lesson, -1) + presOrNext(book, unit, lesson, 1);
  }

  function markKey(b, l) { return 'marks_' + b + '_' + l; }
  function isMarked(b, l) { return !!DB.get(markKey(b, l), false); }

  /* ============================================================
   *  朗读页：看图朗读 —— 一页 = 一图 + 一句，声音与画面逐页同步
   * ============================================================ */

  /* 切成"一页一句"（句子过长时在标点处再断，避免一屏放不下） */
  function pageLines(text) {
    const out = [];
    (text || '').replace(/\r/g, '').split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      let buf = '';
      for (const ch of line) {
        buf += ch;
        if ('。！？；!?…'.indexOf(ch) >= 0 && buf.length >= 34) { out.push(buf.trim()); buf = ''; }
        else if (buf.length >= 46) { out.push(buf.trim()); buf = ''; }
      }
      if (buf.trim()) out.push(buf.trim());
    });
    // 太短的页与相邻页合并，避免一页只有几个字
    const merged = [];
    out.forEach(s => {
      const last = merged[merged.length - 1];
      if (last && (last.length < 12 || s.length < 12) && (last.length + s.length) <= 44) {
        merged[merged.length - 1] = last + s;
      } else merged.push(s);
    });
    return merged;
  }

  /* ================= 原地朗读（不跳页）：课文页直接出声 + 逐句高亮 ================= */
  let LIVE = null;   // { lines, els, i, playing, pending, gen, bar, btnPlay, hint }

  /* 彻底清掉（切换路由/换课时调） */
  function liveClose() {
    if (!LIVE) return;
    TTS.stop();
    if (LIVE.bar) LIVE.bar.hidden = true;
    if (LIVE.followBtn) LIVE.followBtn.hidden = true;
    LIVE.els.forEach(e => e.classList.remove('now'));
    if (LIVE.onScroll) window.removeEventListener('scroll', LIVE.onScroll);
    if (LIVE.onWheel) window.removeEventListener('wheel', LIVE.onWheel);
    if (LIVE.onKey) window.removeEventListener('keydown', LIVE.onKey);
    if (LIVE.onTouchStart) window.removeEventListener('touchstart', LIVE.onTouchStart);
    if (LIVE.onTouchMove) window.removeEventListener('touchmove', LIVE.onTouchMove);
    clearTimeout(LIVE.progTimer);
    LIVE.gen++;          // 让所有挂起的"等待语音就绪"回调失效
    LIVE = null;
  }
  function livePlaying() { return !!(LIVE && LIVE.playing); }

  /* 绑定课文页的原地朗读 */
  function mountLiveReader(book, unit, lesson) {
    const box = document.getElementById('textBox');
    const br = document.getElementById('btnRead');
    if (!box || !br) return;

    const paras = UI.$$('p[data-l]', box);

    /* 逐段切句：这样每一句"属于哪一段"是**精确算出来的**，
       不再用长度累加去猜 —— 全文课文的段落多，猜法会错位。 */
    const lines = [];
    const owner = [];
    paras.forEach(pel => {
      const t = (pel.textContent || '').trim();
      if (!t) return;
      TTS.splitSentences(t).forEach(s => { lines.push(s); owner.push(pel); });
    });

    if (!lines.length) {
      br.onclick = () => UI.toast('这一课还没有课文内容哦');
      return;
    }

    const bar = document.getElementById('songBar');
    const btnPlay = document.getElementById('sbPlay');
    const btnPrev = document.getElementById('sbPrev');
    const btnNext = document.getElementById('sbNext');
    const btnClose = document.getElementById('sbClose');
    const btnFollow = document.getElementById('sbFollow');
    const hint = document.getElementById('readHint');

    LIVE = {
      lines, els: owner.slice(),
      i: -1, playing: false, pending: false, gen: 0,
      follow: true, prog: false, progTimer: null,
      bar, btnPlay, hint, followBtn: btnFollow, onScroll: null
    };

    /* ---- 自动跟随 / 用户自由滚动 ----
       读一句就 scrollIntoView 会把用户正在翻页的手"打回去"。
       判定用户滚动**不能只看 scroll 事件 + 时间窗**：程序平滑滚动之后紧接着的
       用户滚动会被误判成"程序滚动"而忽略，用户就会一直被拉回去。
       所以主判据用**明确的用户意图事件**：
         · 手机：touchmove 纵向位移 > 10px（相当于手指在滑动，不是点按）
         · 电脑：wheel 滚轮
         · 键盘：方向键 / PageUp / PageDown / 空格 / Home / End
       命中就停止跟随，并在底部给一个「回到正在读的地方」按钮；
       高亮仍然照常跟着读，只是不再自动滚屏。 */
    const markProg = () => {
      if (!LIVE) return;
      LIVE.prog = true;
      clearTimeout(LIVE.progTimer);
      LIVE.progTimer = setTimeout(() => { if (LIVE) LIVE.prog = false; }, 700);
    };

    const jumpTo = (k) => {
      const el = owner[k];
      if (!el) return;
      markProg();
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { }
      [140, 320, 520].forEach(ms => setTimeout(markProg, ms));
    };

    const showFollowBtn = () => {
      if (!btnFollow || !LIVE) return;
      btnFollow.hidden = !(LIVE.playing && !LIVE.follow);
    };

    const stopFollow = () => {
      if (!LIVE || !LIVE.follow || !LIVE.playing) return;
      LIVE.follow = false;
      showFollowBtn();
      if (hint) hint.textContent = `正在朗读 第 ${LIVE.i + 1} / ${LIVE.lines.length} 句 · 已暂停跟随，可自由上下翻看`;
    };

    const setFollow = (v) => {
      if (!LIVE) return;
      LIVE.follow = !!v;
      showFollowBtn();
      if (v && LIVE.i >= 0) jumpTo(LIVE.i);
    };

    /* 兜底：拖动滚动条、惯性滚动等（没有上面那些事件时）也能识别 */
    LIVE.onScroll = () => {
      if (!LIVE) return;
      if (LIVE.prog) {
        clearTimeout(LIVE.progTimer);
        LIVE.progTimer = setTimeout(() => { if (LIVE) LIVE.prog = false; }, 300);
        return;
      }
      stopFollow();
    };
    LIVE.onWheel = () => stopFollow();
    LIVE.onKey = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].indexOf(e.key) >= 0) stopFollow();
    };
    LIVE.onTouchStart = (e) => {
      LIVE.touchY = (e.touches && e.touches[0]) ? e.touches[0].clientY : null;
    };
    LIVE.onTouchMove = (e) => {
      if (LIVE.touchY == null || !e.touches || !e.touches[0]) return;
      if (Math.abs(e.touches[0].clientY - LIVE.touchY) > 10) stopFollow();
    };

    window.addEventListener('scroll', LIVE.onScroll, { passive: true });
    window.addEventListener('wheel', LIVE.onWheel, { passive: true });
    window.addEventListener('keydown', LIVE.onKey);
    window.addEventListener('touchstart', LIVE.onTouchStart, { passive: true });
    window.addEventListener('touchmove', LIVE.onTouchMove, { passive: true });

    if (btnFollow) btnFollow.onclick = () => { SFX.tap(); setFollow(true); };

    const showK = (k) => {
      const el = owner[k];
      if (!el) return;
      LIVE.i = k;
      paras.forEach(p => p.classList.remove('now'));
      el.classList.add('now');
      if (LIVE.follow) jumpTo(k);      // 只在"跟随中"才自动滚屏
      if (hint) {
        hint.textContent = `正在朗读 第 ${k + 1} / ${lines.length} 句`
          + (LIVE.follow ? '' : ' · 已暂停跟随，可自由上下翻看');
      }
    };

    // 直接用「句」为单位播放（更贴合"读到哪句哪句变色"）
    const play = (from) => {
      if (!LIVE) return;
      const f = from < 0 ? 0 : from;
      const myGen = ++LIVE.gen;      // 本次播放的世代号；被打断后旧回调作废

      const begin = () => {
        if (!LIVE || LIVE.gen !== myGen) return;
        LIVE.pending = false;
        LIVE.playing = true;
        // 每次新起一次播放都恢复"自动跟随"，并立刻把当前句滚到屏幕中间
        LIVE.follow = true;
        btnPlay.textContent = '⏸ 暂停';
        btnPlay.classList.add('playing');
        bar.hidden = false;
        showFollowBtn();
        jumpTo(f);
        TTS.play(null, {
          units: lines.slice(f),
          onMode: (m) => {
            // 'net' = 这台设备没有本机语音，已自动改用在线朗读；提示一下免得以为坏了
            if (m === 'net' && hint && LIVE && LIVE.gen === myGen) {
              hint.textContent = '正在用在线朗读，马上开始…';
            }
          },
          onStep: (k) => {
            if (!LIVE || LIVE.gen !== myGen) return;
            if (k >= 0) { LIVE.i = f + k; showK(f + k); }
          },
          onEnd: () => {
            if (!LIVE || LIVE.gen !== myGen) return;
            LIVE.playing = false; LIVE.i = -1;
            paras.forEach(p => p.classList.remove('now'));
            btnPlay.textContent = '🔄 再读一遍';
            btnPlay.classList.remove('playing');
            showFollowBtn();
            if (hint) hint.textContent = '读完啦，真棒！✅ 想再听就点「再读一遍」';
          }
        });
      };

      // 只有"引擎还没定下来"（页面刚打开那几百毫秒）才需要等一下。
      // 本机语音、在线朗读**都算可用** → 都直接开始，不让用户点第二次。
      if (Say.engine() !== 'unknown') { begin(); return; }

      LIVE.pending = true;
      LIVE.playing = false;
      bar.hidden = false;
      btnPlay.textContent = '⏳ 准备中';
      btnPlay.classList.remove('playing');
      if (hint) hint.textContent = '正在准备语音，马上就好…';

      Say.whenReady(() => {
        if (!LIVE || LIVE.gen !== myGen) return;
        begin();
      }, 900);
    };

    const pauseTo = () => {
      TTS.stop();
      if (!LIVE) return;
      LIVE.gen++;                 // 作废挂起回调
      LIVE.pending = false;
      LIVE.playing = false;
      btnPlay.textContent = '▶ 继续';
      btnPlay.classList.remove('playing');
      showFollowBtn();
    };

    br.onclick = () => {
      SFX.tap();
      if (!LIVE) return;
      if (LIVE.pending) { UI.toast('语音正在准备，稍等一下…'); return; }
      if (LIVE.playing) {
        pauseTo();
        if (hint) hint.textContent = '已暂停，点下面的「继续」接着听';
        return;
      }
      play(0);
    };

    btnPlay.onclick = () => {
      SFX.tap();
      if (!LIVE) return;
      if (LIVE.pending) { UI.toast('语音正在准备，稍等一下…'); return; }
      if (LIVE.playing) {
        pauseTo();
        if (hint) hint.textContent = '已暂停，点「继续」接着听';
      } else {
        play(LIVE.i < 0 ? 0 : LIVE.i);
      }
    };

    // 上一句 / 下一句 / 点某一句 —— 都是用户主动指定位置，恢复自动跟随
    btnPrev.onclick = () => { SFX.tap(); pauseTo(); play(Math.max(0, LIVE.i - 1)); setFollow(true); };
    btnNext.onclick = () => { SFX.tap(); pauseTo(); play(Math.min(lines.length - 1, LIVE.i + 1)); setFollow(true); };
    btnClose.onclick = () => {
      SFX.tap();
      if (!LIVE) return;
      LIVE.gen++; LIVE.pending = false; LIVE.playing = false;
      TTS.stop();
      bar.hidden = true;
      showFollowBtn();
      paras.forEach(p => p.classList.remove('now'));
      if (hint) hint.textContent = '🔊 点「听朗读」，声音会一句一句读出来';
    };

    // 点某一句，从这句开始读
    paras.forEach((pel) => {
      pel.style.cursor = 'pointer';
      pel.onclick = () => {
        if (!LIVE) return;
        const k = owner.findIndex(o => o === pel);
        if (k >= 0) { SFX.tap(); pauseTo(); play(k); setFollow(true); }
      };
    });
  }

  return {
    readerOpen: livePlaying, closeReaderIfAny: liveClose,
    render(p) {
      if (!p[1]) return renderBook(p);
      if (!p[2]) return renderUnits(p);
      // 作文路由：#/cn/4a/u1/essay 或 #/cn/4a/u1/essay/2
      if (p[3] === 'essay') {
        return p[4] === undefined || p[4] === '' ? renderEssays(p) : renderEssayRead(p);
      }
      return renderLesson(p);
    },
    mount(p) {
      const bm = document.getElementById('btnMark');
      if (bm) bm.onclick = () => {
        const book = findBook(p[1]);
        const lesson = findLesson(findUnit(book, p[2]), p[3]);
        const k = markKey(book.id, lesson.no);
        DB.set(k, !DB.get(k, false));
        SFX.right();
        bm.textContent = DB.get(k) ? '⭐ 已收藏' : '☆ 收藏';
        UI.toast(DB.get(k) ? '收藏好啦！' : '取消收藏');
      };
      // 课文页：绑定原地朗读
      if (p[1] && p[2] && p[3] && p[3] !== 'essay') {
        const book = findBook(p[1]);
        const unit = findUnit(book, p[2]) || book.units[0];
        const lesson = findLesson(unit, p[3]) || unit.lessons[0];
        mountLiveReader(book, unit, lesson);
      }
    }
  };
})();
