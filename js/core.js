/* ================= 公共工具：存储 / 提示 / 音效 / 鼓励特效 / 图片处理 ================= */
(function () {
  const NS = 'kidlearn_v1_';

  /* ---------- 本地存储（模拟云盘 / 积分 / 进度） ---------- */
  const DB = {
    get(k, def) {
      try { const v = localStorage.getItem(NS + k); return v == null ? def : JSON.parse(v); }
      catch (e) { return def; }
    },
    set(k, v) {
      try { localStorage.setItem(NS + k, JSON.stringify(v)); return true; }
      catch (e) { UI.toast('手机存储空间不够啦，先删几张旧照片吧～'); return false; }
    },
    del(k) { localStorage.removeItem(NS + k); }
  };

  /* ---------- 小工具 ---------- */
  const UI = {
    toast(msg, ms) {
      const box = document.getElementById('toast');
      const el = document.createElement('div');
      el.className = 'toast'; el.textContent = msg;
      box.appendChild(el);
      setTimeout(() => el.remove(), ms || 1800);
    },
    $(s, r) { return (r || document).querySelector(s); },
    $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
    esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
    on(sel, ev, fn) {
      UI.$$(sel).forEach(el => el.addEventListener(ev, e => fn.call(el, e, el)));
    },
    // 用于延迟绑定：view.addEventListener('click', UI.delegate('[data-go]', fn))
    delegate(sel, fn) {
      return function (e) {
        const t = e.target.closest(sel);
        if (t) fn.call(t, e, t);
      };
    },
    now() {
      const d = new Date(), p = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    },
    shuffle(a) {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    }
  };

  /* ---------- 音效（纯 WebAudio，不依赖任何音频文件） ---------- */
  let ac = null;
  function tone(freq, dur, type, vol) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.14, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (dur || 0.18));
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + (dur || 0.18));
    } catch (e) { }
  }
  const SFX = {
    right() { tone(784, .12, 'sine', .16); setTimeout(() => tone(1046, .22, 'sine', .16), 110); },
    wrong() { tone(220, .22, 'triangle', .12); },
    tap() { tone(660, .07, 'square', .06); },
    win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .25, 'sine', .15), i * 110)); }
  };

  /* ---------- 朗读（Web Speech API，离线可用、免登录） ---------- */
  /* 移动端音频解锁：iOS/微信要求语音必须由"用户手势"直接触发。
     下面这个 warmup 在任何一次点击/触摸时被调用，把音频通道打开，
     之后按钮里的 speak 就不会再被 not-allowed。 */
  let AUDIO_UNLOCKED = false;
  function unlockAudio() {
    if (AUDIO_UNLOCKED) return;
    try {
      // 1) 打开 WebAudio（彩纸音效用它，顺便解锁）
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        if (!window.__ac) window.__ac = new AC();
        if (window.__ac.state === 'suspended') window.__ac.resume();
      }
      // 2) 用一句话把 speech 通道"点亮"（静音、极短，人耳听不到）
      if (speechReady()) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0; u.rate = 10;
        speechSynthesis.speak(u);
      }
      AUDIO_UNLOCKED = true;
    } catch (e) { }
  }
  document.addEventListener('touchstart', unlockAudio, { passive: true });
  document.addEventListener('touchend', unlockAudio, { passive: true });
  document.addEventListener('click', unlockAudio, true);
  window.__unlockAudio = unlockAudio;

  /* ---------- 语音能力实时探测 ----------
   *  坑：部分手机浏览器（国产 App 内置 WebView、部分 iOS 版本）在页面刚加载时
   *      speechSynthesis 尚未注入，要过一会儿才出现。若在脚本加载瞬间算一个
   *      `ok = 'speechSynthesis' in window` 布尔值，就会永久锁死为 false，
   *      后面 API 出来了也不会变 → 用户永远看到"设备不支持"。
   *  所以一律改成**每次调用时实时判断**。 */
  function speechReady() {
    return typeof window.speechSynthesis !== 'undefined' &&
      typeof window.SpeechSynthesisUtterance !== 'undefined' &&
      window.speechSynthesis !== null;
  }
  /* 给用户看的诊断信息（手机上没有控制台，把原因写到提示里） */
  function speechDiag() {
    const hasSS = typeof window.speechSynthesis !== 'undefined';
    const hasU = typeof window.SpeechSynthesisUtterance !== 'undefined';
    const ua = navigator.userAgent || '';
    let who = '当前浏览器';
    if (/MicroMessenger/i.test(ua)) who = '微信内置浏览器';
    else if (/QQ\/|QQBrowser/i.test(ua)) who = 'QQ 浏览器';
    else if (/UCBrowser|UCWEB/i.test(ua)) who = 'UC 浏览器';
    else if (/baidu|BIDUBrowser/i.test(ua)) who = '百度浏览器';
    else if (/Quark/i.test(ua)) who = '夸克浏览器';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) who = 'Safari';
    else if (/Chrome/i.test(ua)) who = 'Chrome';
    if (!hasSS && !hasU) return `${who}不支持语音朗读，请改用「手机自带浏览器」或 Chrome 打开`;
    if (!hasSS) return `${who}的语音模块还没准备好，请刷新页面再试`;
    if (!hasU) return `${who}的语音模块缺少发声组件，请换 Chrome 打开`;
    return `${who}暂时无法朗读，请刷新页面再试`;
  }
  /* 等待语音模块就绪（最多等 3 秒），就绪后回调 */
  function whenSpeechReady(cb, timeout) {
    if (speechReady()) { cb(true); return; }
    let n = 0;
    const max = Math.ceil((timeout || 3000) / 200);
    const t = setInterval(() => {
      n++;
      if (speechReady()) { clearInterval(t); refreshVoices(); cb(true); }
      else if (n >= max) { clearInterval(t); cb(false); }
    }, 200);
  }

  const Say = {
    /* 注意：这是 getter，每次都实时判断，不要改成静态值 */
    get ok() { return speechReady(); },
    /* 英文朗读：词组（moon cake / sports day / New Year）按空格拆词逐个排队朗读 */
    en(word, rate) {
      if (!speechReady()) {
        // 还没就绪：等一会儿，就绪后自动补读
        whenSpeechReady(good => {
          if (good) Say.en(word, rate);
          else UI.toast(speechDiag(), 3600);
        });
        return false;
      }
      try {
        const r = rate || (window.APP_CONFIG && APP_CONFIG.EN_SPEAK_RATE) || .8;
        const t = String(word == null ? '' : word).trim();
        if (!t) return false;
        const parts = t.split(/\s+/).filter(Boolean);
        const vs = VOICES.length ? VOICES : refreshVoices();
        const enV = vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;

        // 关键修复：cancel() 是异步的，紧跟 speak() 会被一起取消（移动端 100% 丢声）。
        // 做法：先 cancel，等一个 tick 再 speak。
        speechSynthesis.cancel();
        const fire = () => {
          parts.forEach(p => {
            const u = new SpeechSynthesisUtterance(p);
            u.lang = 'en-US';
            u.rate = r;
            if (enV) u.voice = enV;
            speechSynthesis.speak(u);
          });
        };
        setTimeout(fire, 60);
        return true;
      } catch (e) { return false; }
    },
    /* 中文单句朗读（作文页/练习用） */
    zh(text, rate) {
      if (!speechReady()) {
        whenSpeechReady(good => { if (good) Say.zh(text, rate); else UI.toast(speechDiag(), 3600); });
        return false;
      }
      try {
        const t = String(text == null ? '' : text).trim();
        if (!t) return false;
        speechSynthesis.cancel();
        setTimeout(() => {
          const u = new SpeechSynthesisUtterance(t);
          u.lang = 'zh-CN'; u.rate = rate || .9;
          speechSynthesis.speak(u);
        }, 60);
        return true;
      } catch (e) { return false; }
    },
    diag: speechDiag,
    ready: speechReady,
    whenReady: whenSpeechReady,
    stop() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { } }
  };

  /* ---------- 中文朗读器（逐页/逐句队列 + 高亮回调） ----------
   *  设计要点：
   *  1) 每一步只读一个"单位"，onstart/onend 驱动高亮，不依赖 boundary 事件
   *     （SpeechSynthesis 的 boundary 在中文下各家浏览器支持极差）
   *  2) 单位既可以是整段（paged=true，适合屏幕只显示一页看图朗读），
   *     也可以是句（适合整篇随文高亮）
   *  3) 用队列 + onend 串联，规避部分浏览器读长文本会自动截断
   * -------------------------------------------------------- */
  const TTS = {
    /* 注意：这是 getter，每次实时判断。绝不能写成静态布尔值——
       部分手机加载瞬间 speechSynthesis 尚未注入，静态值会永久锁死为 false。 */
    get ok() { return speechReady(); },
    q: [], i: 0, stopped: true, paused: false, at: 0,
    onEnd: null, onPart: null, onStep: null,

    voice() {
      if (!speechReady()) return null;
      const vs = VOICES.length ? VOICES : refreshVoices();
      return vs.find(v => /zh[-_]CN/i.test(v.lang)) ||
        vs.find(v => /^zh/i.test(v.lang)) ||
        vs.find(v => /Chinese|Huihui|Yaoyao|Xiaoxiao|Tingting/i.test(v.name)) || null;
    },

    /* 按行切分，保留原始行结构（高亮要跟屏幕上的段落一一对应） */
    splitLines(t) {
      return String(t == null ? '' : t).replace(/\r/g, '')
        .split('\n').map(s => s.trim()).filter(s => s.length);
    },

    /* 句切分：一句话一个单位，最长的也不再切（超长会导致高亮停留过久，故上限120字） */
    splitSentences(t) {
      const out = [];
      TTS.splitLines(t).forEach(line => {
        if (line.length <= 26) { out.push(line); return; }
        let buf = '';
        for (const ch of line) {
          buf += ch;
          if ('。！？；!?…'.indexOf(ch) >= 0) { out.push(buf); buf = ''; }
          else if (buf.length >= 120) { out.push(buf); buf = ''; }
        }
        if (buf.trim()) out.push(buf.trim());
      });
      return out;
    },

    /* play(units, opt)
     *   units : 字符串数组（每个元素是一个朗读单位）
     *   opt.onStep(i, n, unit) 第 i 个单位开始朗读
     *   opt.onEnd()
     */
    play(text, opt) {
      if (!speechReady()) {
        // 语音模块可能只是"还没就绪"——等一会儿再补读，别急着报"不支持"
        opt = opt || {};
        whenSpeechReady(good => {
          if (good) TTS.play(text, opt);
          else UI.toast(speechDiag(), 3600);
        });
        return false;
      }
      opt = opt || {};
      const cfg = (window.APP_CONFIG && APP_CONFIG.CN_PLAY) || {};
      let units = opt.units;
      if (!units) units = opt.paged ? TTS.splitLines(text) : TTS.splitSentences(text);
      units = (units || []).filter(s => String(s).trim().length);
      TTS.stop();
      if (!units.length) { UI.toast('这课还没有课文内容哦'); return false; }
      TTS.q = units;
      TTS.i = 0; TTS.at = -1; TTS.stopped = false; TTS.paused = false;
      TTS.onEnd = opt.onEnd || null;
      TTS.onStep = opt.onStep || null;
      TTS.onPart = opt.onPart || null;
      TTS.rate = opt.rate || cfg.TTS_RATE || .85;
      TTS.pitch = opt.pitch || cfg.TTS_PITCH || 1.05;
      // 关键：stop() 里的 cancel() 是异步的，必须等一个 tick 再 speak，
      // 否则移动端会把第一句（甚至整段）一起取消掉 → 点了没声音。
      setTimeout(() => { if (!TTS.stopped) TTS.next(); }, 70);
      return true;
    },

    next() {
      if (TTS.stopped) return;
      if (TTS.i >= TTS.q.length) {
        TTS.stopped = true;
        if (TTS.onStep) TTS.onStep(-1, TTS.q.length, '');
        if (TTS.onEnd) TTS.onEnd();
        return;
      }
      try {
        const unit = TTS.q[TTS.i];
        const u = new SpeechSynthesisUtterance(unit);
        u.lang = 'zh-CN';
        const v = TTS.voice(); if (v) u.voice = v;
        u.rate = TTS.rate; u.pitch = TTS.pitch;
        const k = TTS.i;
        u.onstart = () => { TTS.at = k; if (TTS.onStep) TTS.onStep(k, TTS.q.length, unit); };
        u.onend = () => { TTS.i++; setTimeout(() => TTS.next(), 60); };
        u.onerror = () => { TTS.i++; setTimeout(() => TTS.next(), 120); };
        speechSynthesis.speak(u);
        // 兜底：个别浏览器不触发 onstart，延迟给一次高亮
        setTimeout(() => {
          if (!TTS.stopped && TTS.i === k && TTS.at !== k) {
            TTS.at = k; if (TTS.onStep) TTS.onStep(k, TTS.q.length, unit);
          }
        }, 120);
      } catch (e) { TTS.stopped = true; }
    },

    pause() {
      if (!speechReady() || TTS.stopped) return;
      TTS.paused = true;
      try { speechSynthesis.pause(); } catch (e) { }
    },
    resume() {
      if (!speechReady() || TTS.stopped) return;
      TTS.paused = false;
      try { speechSynthesis.resume(); } catch (e) { }
    },
    toggle() { TTS.paused ? TTS.resume() : TTS.pause(); return TTS.paused; },
    stop() {
      TTS.stopped = true; TTS.paused = false; TTS.q = []; TTS.i = 0; TTS.at = -1;
      try { speechSynthesis.cancel(); } catch (e) { }
    },
    get busy() { return speechReady() && !TTS.stopped; }
  };
  let VOICES = [];
  function refreshVoices() {
    if (!speechReady()) return VOICES;
    try { VOICES = speechSynthesis.getVoices() || []; } catch (e) { VOICES = []; }
    return VOICES;
  }
  function initVoices() {
    if (!speechReady()) { whenSpeechReady(() => initVoices()); return; }
    refreshVoices();
    try { speechSynthesis.onvoiceschanged = refreshVoices; } catch (e) { }
    // iOS 首次 getVoices() 常返回空，延迟再取几次
    [120, 500, 1200, 2500].forEach(ms => setTimeout(refreshVoices, ms));
  }
  initVoices();

  /* ---------- 抖音：免登录内嵌播放 ---------- */
  const Douyin = {
    /* 官方嵌入播放器（开放平台接口，无需申请权限，公开视频免登录可播） */
    embedUrl(vid, autoplay) {
      return 'https://open.douyin.com/player/video?vid=' + encodeURIComponent(vid) +
        '&autoplay=' + (autoplay ? '1' : '0');
    },
    /* 从各种写法里提取视频ID：纯ID / 完整链接 / modal_id / vid= / 对象 */
    parseVid(v) {
      if (!v) return '';
      if (typeof v === 'object') return Douyin.parseVid(v.vid || v.url || '');
      const s = String(v).trim();
      let m = s.match(/video\/(\d{8,})/); if (m) return m[1];
      m = s.match(/modal_id=(\d{8,})/); if (m) return m[1];
      m = s.match(/[?&]vid=(\d{8,})/); if (m) return m[1];
      m = s.match(/^(\d{8,})$/); if (m) return m[1];
      return '';   // 短链 v.douyin.com/xxx 里没有数字ID，无法内嵌
    },
    /* 原始跳转地址（兜底：在抖音里看） */
    pageUrl(v, kw) {
      if (!v) return 'https://www.douyin.com/search/' + encodeURIComponent(kw || '课文朗读');
      if (typeof v === 'object') return v.url || v.page || Douyin.pageUrl(v.vid, kw);
      const s = String(v).trim();
      if (/^https?:/i.test(s)) return s;
      if (/^\d{8,}$/.test(s)) return 'https://www.douyin.com/video/' + s;
      return 'https://www.douyin.com/search/' + encodeURIComponent(kw || '课文朗读');
    }
  };

  /* ---------- 彩纸 / 星星鼓励特效（Canvas2D） ---------- */
  const FX = {
    parts: [], running: false,
    canvas: null, ctx: null, w: 0, h: 0,
    init() {
      FX.canvas = document.getElementById('fx');
      if (!FX.canvas) return;
      FX.ctx = FX.canvas.getContext('2d');
      FX.resize();
      window.addEventListener('resize', FX.resize);
    },
    resize() {
      if (!FX.canvas) return;
      FX.w = FX.canvas.width = window.innerWidth;
      FX.h = FX.canvas.height = window.innerHeight;
    },
    burst(n, colors) {
      if (!FX.ctx) FX.init();
      if (!FX.ctx) return;
      const cs = colors || ['#FF8A3D', '#3D8BFF', '#35C77E', '#FFC93D', '#FF6B9D', '#A66BFF'];
      for (let i = 0; i < (n || 60); i++) {
        FX.parts.push({
          x: FX.w / 2 + (Math.random() - .5) * 120,
          y: FX.h / 2 - 40,
          vx: (Math.random() - .5) * 11,
          vy: Math.random() * -12 - 3,
          s: Math.random() * 8 + 5,
          c: cs[Math.floor(Math.random() * cs.length)],
          r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
          life: 1
        });
      }
      if (!FX.running) { FX.running = true; requestAnimationFrame(FX.loop); }
    },
    loop() {
      const c = FX.ctx;
      c.clearRect(0, 0, FX.w, FX.h);
      FX.parts = FX.parts.filter(p => p.life > 0 && p.y < FX.h + 40);
      FX.parts.forEach(p => {
        p.vy += .32; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .008;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r);
        c.globalAlpha = Math.max(0, p.life);
        c.fillStyle = p.c;
        c.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .7);
        c.restore();
      });
      if (FX.parts.length) requestAnimationFrame(FX.loop);
      else { FX.running = false; c.clearRect(0, 0, FX.w, FX.h); }
    }
  };

  /* ---------- 图片：压缩后转 DataURL ---------- */
  const Img = {
    fileToDataURL(file, maxSide) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          const image = new Image();
          image.onload = () => {
            let { width: w, height: h } = image;
            const m = maxSide || 800;
            if (Math.max(w, h) > m) { const k = m / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
            const cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(image, 0, 0, w, h);
            resolve(cv.toDataURL('image/jpeg', 0.72));
          };
          image.onerror = reject;
          image.src = fr.result;
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    }
  };

  /* ---------- 通用弹层 ---------- */
  const Modal = {
    el: null,
    open(html, opt) {
      opt = opt || {};
      Modal.close();
      const mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML = `<div class="modal ${opt.cls || ''}">${html}</div>`;
      document.body.appendChild(mask);
      Modal.el = mask;
      requestAnimationFrame(() => mask.classList.add('on'));
      mask.addEventListener('click', e => {
        if (e.target === mask && opt.maskClose !== false) Modal.close();
      });
      UI.$$('[data-close]', mask).forEach(b => b.onclick = () => Modal.close());
      document.body.style.overflow = 'hidden';
      return mask;
    },
    close() {
      if (Modal.el) { Modal.el.remove(); Modal.el = null; }
      document.body.style.overflow = '';
      TTS.stop();
    }
  };

  /* ---------- 课文朗读播放器：抖音内嵌（免登录）+ 本机朗读兜底 ---------- */
  const Player = {
    open(o) {
      o = o || {};
      const cfg = (window.APP_CONFIG && APP_CONFIG.CN_PLAY) || {};
      const vid = Douyin.parseVid(o.vid);
      const pageUrl = Douyin.pageUrl(o.vid || o.url, o.kw || ((o.title || '') + ' 课文朗读').trim());
      const title = o.title || '课文朗读';
      const tip = (o.vid && typeof o.vid === 'object' && o.vid.tip) || o.tip || '';

      // 竖版 9:16，最大不超过屏幕
      const winW = window.innerWidth, winH = window.innerHeight;
      let w = Math.min(440, winW - 28), h = Math.round(w * 16 / 9);
      const maxH = Math.round(winH * 0.56);
      if (h > maxH) { h = maxH; w = Math.round(h * 9 / 16); }

      const hasVid = !!vid;
      const autoplay = cfg.AUTOPLAY !== false;
      const showDy = cfg.SHOW_DOUYIN_BTN !== false;

      const html = `
        <div class="play-head">
          <div class="play-title">🎧 ${UI.esc(title)}</div>
          <button class="play-x" data-close aria-label="关闭">✕</button>
        </div>
        ${hasVid ? `
          <div class="play-stage" style="width:${w}px;height:${h}px">
            <iframe src="${Douyin.embedUrl(vid, autoplay)}"
              referrerpolicy="unsafe-url" allow="autoplay; encrypted-media; fullscreen"
              allowfullscreen scrolling="no" frameborder="0"></iframe>
          </div>
          ${tip ? `<div class="play-tip">${UI.esc(tip)}</div>` : ''}
        ` : `
          <div class="play-empty" style="width:${Math.max(240, w)}px">
            <div class="pe-ico">📢</div>
            <div class="pe-t">这课还没录朗读视频</div>
            <div class="pe-s">没关系～ 点下面的大按钮，<br>我直接把课文读给你听</div>
          </div>
        `}
        <div class="play-bar">
          <button class="pbtn ${hasVid ? 'ghost' : 'bg-pk big'}" id="pRead">
            <span>🔊</span><b>${hasVid ? '跟着读一遍' : '点我听朗读'}</b>
          </button>
          <button class="pbtn ghost" id="pPause"><span>⏸</span><b>暂停</b></button>
        </div>
        <div class="play-stat" id="pStat">${hasVid ? '视频来自抖音，不用登录就能看；没自动播就点一下画面' : ''}</div>
        ${showDy ? `<a class="play-link" id="pDouyin" href="${UI.esc(pageUrl)}" target="_blank" rel="noopener">在抖音里看 ›</a>` : ''}
      `;

      const mask = Modal.open(html, { cls: 'modal-play' });
      const btnR = mask.querySelector('#pRead');
      const btnP = mask.querySelector('#pPause');
      const stat = mask.querySelector('#pStat');
      let reading = false;

      const setStat = s => { if (stat) stat.textContent = s; };
      const setReadBtn = (label) => { btnR.querySelector('b').textContent = label; };

      btnR.onclick = () => {
        SFX.tap();
        if (reading) {
          TTS.stop(); reading = false;
          setReadBtn(hasVid ? '跟着读一遍' : '点我听朗读');
          setStat(hasVid ? '视频来自抖音，不用登录就能看；没自动播就点一下画面' : '');
          return;
        }
        const ok = TTS.play(o.text, {
          onPart: (i, n) => { setStat(`正在读第 ${i} / ${n} 段…`); },
          onEnd: () => {
            reading = false;
            setReadBtn('再读一遍');
            setStat('读完啦，真棒！✅');
          }
        });
        if (ok) { reading = true; setReadBtn('停止朗读'); }
      };

      btnP.onclick = () => {
        if (!TTS.busy) { UI.toast('先点「🔊」开始朗读哦'); return; }
        const p = TTS.toggle();
        btnP.querySelector('b').textContent = p ? '继续' : '暂停';
        btnP.querySelector('span').textContent = p ? '▶' : '⏸';
        setStat(p ? '暂停中…' : '继续朗读中…');
      };

      // 没录视频 → 打开就自动读，孩子不用多点一下
      // 注意：iOS / 微信内置浏览器要求朗读必须由用户手势触发，异步自动调用会被静音
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isWeixin = /MicroMessenger/i.test(navigator.userAgent);
      if (!hasVid) {
        // 语音模块可能"还没就绪"（部分手机 WebView 延迟注入），不能立刻禁用按钮。
        // 先按可用处理，若 3 秒后仍不可用再禁用并给诊断提示。
        if (cfg.AUTO_TTS !== false && !isIOS && !isWeixin) {
          setTimeout(() => btnR.click(), 260);
        } else {
          setStat('点上面的大按钮，我就开始读～');
        }
        whenSpeechReady(good => {
          if (good) return;
          setStat('📱 ' + speechDiag());
          btnR.disabled = true;
          btnR.style.opacity = '.45';
        });
      }

      // 视频加载兜底提示
      if (hasVid) {
        const fr = mask.querySelector('.play-stage iframe');
        let loaded = false;
        if (fr) fr.onload = () => { loaded = true; };
        setTimeout(() => {
          if (!loaded) setStat('视频加载有点慢？点「🔊」先听本机朗读');
        }, 4000);
      }
      return mask;
    }
  };

  window.DB = DB; window.UI = UI; window.SFX = SFX; window.Say = Say; window.TTS = TTS;
  window.FX = FX; window.Img = Img; window.Modal = Modal; window.Douyin = Douyin; window.Player = Player;
  document.addEventListener('DOMContentLoaded', FX.init);
})();
