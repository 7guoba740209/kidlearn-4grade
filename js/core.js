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
  /* 0.01 秒静音 WAV（8kHz 单声道 8bit，共 124 字节）—— 用来在用户手势里"解锁" <audio> */
  const SILENT_WAV = 'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
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
      // 3) 把在线朗读用的 <audio> 也"解锁"：趁这次真实手势播一段 0.01 秒静音。
      //    iOS 上只有被手势解锁过的音频元素，之后才允许程序化连续播放。
      try {
        const a = NetTTS.ensure();
        a.src = SILENT_WAV;
        const p = a.play();
        if (p && p.catch) p.catch(() => { });
      } catch (e) { }
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
  /* 识别浏览器（只用于诊断，不再拿它劝用户"换浏览器"——用户往往本来就在自带浏览器里） */
  function browserName() {
    const ua = navigator.userAgent || '';
    if (/MicroMessenger/i.test(ua)) return '微信内置浏览器';
    if (/QQ\/|QQBrowser/i.test(ua)) return 'QQ 浏览器';
    if (/UCBrowser|UCWEB/i.test(ua)) return 'UC 浏览器';
    if (/Quark/i.test(ua)) return '夸克浏览器';
    if (/HuaweiBrowser|HarmonyOS|HUAWEI/i.test(ua)) return '华为/鸿蒙浏览器';
    if (/MiuiBrowser|XiaoMi|Redmi/i.test(ua)) return '小米浏览器';
    if (/HeyTapBrowser|OppoBrowser|OPPO/i.test(ua)) return 'OPPO 浏览器';
    if (/VivoBrowser|vivo/i.test(ua)) return 'vivo 浏览器';
    if (/SamsungBrowser/i.test(ua)) return '三星浏览器';
    if (/EdgA|Edg\//i.test(ua)) return 'Edge';
    if (/FxiOS|Firefox/i.test(ua)) return 'Firefox';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Chrome/i.test(ua)) return 'Chrome 内核浏览器';
    return '当前浏览器';
  }
  /* 说明"为什么本机朗读用不了"——只陈述原因，不给用户开无用的药方 */
  function speechDiag() {
    const who = browserName();
    const hasSS = typeof window.speechSynthesis !== 'undefined';
    const hasU = typeof window.SpeechSynthesisUtterance !== 'undefined';
    if (!hasSS && !hasU) return `${who}没有内置语音朗读，已自动改用「在线朗读」`;
    if (!hasSS) return `${who}的语音模块未提供，已自动改用「在线朗读」`;
    if (!hasU) return `${who}缺少发声组件，已自动改用「在线朗读」`;
    return `${who}本机朗读不可用，已自动改用「在线朗读」`;
  }
  /* 在线朗读也失败时的提示（这时候才需要用户动手） */
  function netFailDiag() {
    return '在线朗读连不上，请检查手机网络后刷新页面；若还不行，请打开「#/diag」把结果发我';
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

  /* ---------- 在线朗读兜底（设备没有 speechSynthesis 时用） ----------
   *  背景：部分手机浏览器（某些自带浏览器、微信/QQ 内置、部分鸿蒙机型）
   *        根本没有 Web Speech 合成能力，`speechSynthesis` 直接是 undefined。
   *        只靠它，这些设备就永远没有声音 —— 必须有第二条路。
   *  通道：中文 → 百度翻译 gettts（**有防盗链**，必须 referrerpolicy="no-referrer"）
   *        英文 → 有道词典 dictvoice（不校验 Referer）
   *  要点：
   *    1) **全程复用同一个 <audio> 元素** —— iOS 上只有被用户手势"解锁"过的那个元素
   *       才允许之后程序化连续播放；每次 new Audio() 第二句就哑了。
   *    2) 不要设 crossorigin，否则会走 CORS 校验而失败（媒体播放不需要 CORS）。
   *    3) 百度接口带 Referer 会返回 0 字节空白，referrerpolicy 是硬性要求。
   *    4) 百度响应有 `Cache-Control: max-age=3600`，预取下一句能明显减少卡顿。
   * ------------------------------------------------------------------- */
  const NetTTS = {
    el: null, gen: 0, cache: {}, fails: 0,

    url(text, lang, opt) {
      opt = opt || {};
      const t = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
      if (!t) return '';
      // 在线朗读"有感情"通道：配置了 Edge 代理就用微软神经语音（晓晓/云希），
      // 这是浏览器自带语音和百度免费接口都给不了的"感情/韵律"。
      const cp = (window.APP_CONFIG && APP_CONFIG.CN_PLAY) || {};
      if (lang !== 'en' && cp.EDGE_URL) {
        const voice = cp.EDGE_VOICE || 'zh-CN-XiaoxiaoNeural';
        // 把语速/音调也带给代理（代理侧再换算成 SSML prosody）
        const rate = (opt && opt.rate != null) ? opt.rate : (TTS.rate || (cp.TTS_RATE || .95));
        const pitch = (opt && opt.pitch != null) ? opt.pitch : (TTS.pitch || (cp.TTS_PITCH || 1.05));
        const sep = cp.EDGE_URL.indexOf('?') >= 0 ? '&' : '?';
        return cp.EDGE_URL + sep + 'voice=' + encodeURIComponent(voice)
          + '&text=' + encodeURIComponent(t)
          + '&rate=' + encodeURIComponent(rate)
          + '&pitch=' + encodeURIComponent(pitch);
      }
      if (lang === 'en') {
        return 'https://dict.youdao.com/dictvoice?type=2&audio=' + encodeURIComponent(t);
      }
      // 百度长文本会截断，超过 170 字先切一段（调用方本来就是逐句播，很少触发）
      const s = t.length > 170 ? t.slice(0, 170) : t;
      return 'https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=' + encodeURIComponent(s);
    },

    ensure() {
      if (NetTTS.el && NetTTS.el.parentNode) return NetTTS.el;
      const a = document.createElement('audio');
      a.id = 'netTts';
      a.preload = 'auto';
      a.setAttribute('referrerpolicy', 'no-referrer');   // 百度防盗链，必须
      a.setAttribute('playsinline', '');
      a.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
      document.body.appendChild(a);
      NetTTS.el = a;
      return a;
    },

    /* 预取：用一次性 Audio 把资源拉进浏览器缓存，当前句播完时下一句已就绪 */
    prefetch(text, lang) {
      const url = NetTTS.url(text, lang);
      if (!url || NetTTS.cache[url]) return;
      NetTTS.cache[url] = true;
      try {
        const a = new Audio();
        a.preload = 'auto';
        a.setAttribute('referrerpolicy', 'no-referrer');
        a.src = url;
        a.load();
      } catch (e) { }
    },

    speak(text, opt) {
      opt = opt || {};
      const url = NetTTS.url(text, opt.lang, opt);
      if (!url) { if (opt.onError) opt.onError(); return false; }
      const a = NetTTS.ensure();
      const my = ++NetTTS.gen;
      const alive = () => NetTTS.gen === my && !a.__dead;
      a.__dead = false;
      a.onplaying = () => { if (alive()) { NetTTS.fails = 0; if (opt.onStart) opt.onStart(); } };
      a.onended = () => { if (alive() && opt.onEnd) opt.onEnd(); };
      a.onerror = () => {
        if (!alive()) return;
        NetTTS.fails++;
        if (opt.onError) opt.onError();
      };
      try { a.pause(); } catch (e) { }
      try { a.currentTime = 0; } catch (e) { }
      a.src = url;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => { /* onplaying 会再确认一次 */ }).catch(() => {
          // 自动播放被拦：通常是这次没有用户手势。给一次重试机会，仍失败就交给上层报错
          if (!alive()) return;
          setTimeout(() => {
            if (!alive()) return;
            const p2 = a.play();
            if (p2 && p2.catch) p2.catch(() => { if (alive()) { NetTTS.fails++; if (opt.onError) opt.onError(); } });
          }, 120);
        });
      } else {
        if (opt.onStart) opt.onStart();
      }
      return true;
    },

    stop() {
      NetTTS.gen++;
      const a = NetTTS.el;
      if (!a) return;
      a.__dead = true;
      try { a.pause(); } catch (e) { }
    },
    pause() { const a = NetTTS.el; if (a) { try { a.pause(); } catch (e) { } } },
    resume() { const a = NetTTS.el; if (a) { try { a.play(); } catch (e) { } } },
    get playing() { const a = NetTTS.el; return !!a && !a.paused && !a.ended; }
  };

  /* ---------- 引擎选择 ----------
   *  'local' = 浏览器自带语音合成    'net' = 在线朗读    'unknown' = 还在探测
   *  'unknown' 只出现在页面刚打开的几百毫秒内（加载后会自动探测一次）。
   * ------------------------------------------------------------------ */
  let SPEECH_ABSENT = false;   // 探测确认：这台设备没有 Web Speech 合成
  let FORCE_NET = false;       // 本机朗读试过但不出声 → 判为"有 API 但没引擎"
  let NET_ONLY = false;        // 强制走在线朗读（网址加 ?forceNet=1，便于排查/对比）
  try { NET_ONLY = /[?&]forceNet=1/.test(location.search); } catch (e) { }
  function engine() {
    if (NET_ONLY || FORCE_NET) return 'net';
    if (speechReady()) return 'local';
    if (SPEECH_ABSENT) return 'net';
    return 'unknown';
  }
  /* 统一入口：确定用哪个引擎后执行 run(engine) */
  function withEngine(run, waitMs) {
    const e = engine();
    if (e !== 'unknown') { run(e); return e; }
    whenSpeechReady(good => {
      if (!good) SPEECH_ABSENT = true;
      run(good ? 'local' : 'net');
    }, waitMs || 800);
    return 'unknown';
  }
  /* 本机朗读"防哑"：安卓上常见"有 speechSynthesis 但系统没装 TTS 引擎"——
     speak() 既不报错也不出声。这里 1.3 秒内一句都没开始读，就认定本机语音是哑的，
     记住结论并改用在线朗读重播。 */
  function guardLocal(started, replayNet) {
    if (FORCE_NET) return;                       // 已经知道是哑的，不用再等
    setTimeout(() => {
      if (started.v || TTS.localOk === true) return;
      FORCE_NET = true;
      try { speechSynthesis.cancel(); } catch (e) { }
      replayNet();
    }, 1300);
  }
  /* 页面加载后静默探测一次：1.6 秒还不出现就认定"这台设备没有本机语音" */
  (function probeSpeech() {
    if (speechReady()) return;
    whenSpeechReady(good => { if (!good) SPEECH_ABSENT = true; }, 1600);
  })();

  const Say = {
    /* 注意：这是 getter，每次都实时判断，不要改成静态值。
       语义是"本机语音可用"；本机不可用时 Say 会自动走在线朗读，仍然能发声。 */
    get ok() { return speechReady() || engine() === 'net'; },
    get mode() { return engine() === 'local' ? 'local' : 'net'; },

    /* 英文朗读：词组（moon cake / sports day / New Year）按空格拆词逐个排队朗读 */
    en(word, rate) {
      const t = String(word == null ? '' : word).trim();
      if (!t) return false;
      const r = rate || (window.APP_CONFIG && APP_CONFIG.EN_SPEAK_RATE) || .8;

      const viaNet = () => {
        const parts = t.split(/\s+/).filter(Boolean);
        NetTTS.stop();
        let i = 0;
        const step = () => {
          if (i >= parts.length) return;
          const cur = parts[i++];
          NetTTS.speak(cur, {
            lang: 'en',
            onEnd: () => setTimeout(step, 120),
            onError: () => setTimeout(step, 120),
          });
        };
        setTimeout(step, 60);
        return true;
      };

      const viaLocal = () => {
        try {
          const parts = t.split(/\s+/).filter(Boolean);
          const vs = VOICES.length ? VOICES : refreshVoices();
          const enV = vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
          const started = { v: false };
          // cancel() 是异步的，紧跟 speak() 会被一起取消（移动端 100% 丢声）→ 等一个 tick
          speechSynthesis.cancel();
          setTimeout(() => {
            parts.forEach(p => {
              const u = new SpeechSynthesisUtterance(p);
              u.lang = 'en-US';
              u.rate = r;
              if (enV) u.voice = enV;
              u.onstart = () => { started.v = true; };
              speechSynthesis.speak(u);
            });
          }, 60);
          guardLocal(started, viaNet);
          return true;
        } catch (e) { return viaNet(); }
      };

      const e = engine();
      if (e === 'unknown') {           // 刚打开页面，还在探测：定下来后自动播
        withEngine(eng => { eng === 'local' ? viaLocal() : viaNet(); }, 800);
        return true;
      }
      return e === 'local' ? viaLocal() : viaNet();
    },

    /* 中文单句朗读（作文页/练习用） */
    zh(text, rate) {
      const t = String(text == null ? '' : text).trim();
      if (!t) return false;
      const rr = rate || .9;

      const viaNet = () => {
        NetTTS.stop();
        const pitch = ((window.APP_CONFIG && APP_CONFIG.CN_PLAY) || {}).TTS_PITCH;
        setTimeout(() => { NetTTS.speak(t, { lang: 'zh', rate: rr, pitch: pitch }); }, 60);
        return true;
      };
      const viaLocal = () => {
        try {
          const started = { v: false };
          speechSynthesis.cancel();
          setTimeout(() => {
            const u = new SpeechSynthesisUtterance(t);
            u.lang = 'zh-CN'; u.rate = rr;
            u.onstart = () => { started.v = true; };
            speechSynthesis.speak(u);
          }, 60);
          guardLocal(started, viaNet);
          return true;
        } catch (e) { return viaNet(); }
      };

      const e = engine();
      if (e === 'unknown') {
        withEngine(eng => { eng === 'local' ? viaLocal() : viaNet(); }, 800);
        return true;
      }
      return e === 'local' ? viaLocal() : viaNet();
    },

    diag: speechDiag,
    netDiag: netFailDiag,
    browser: browserName,
    /* 本机语音可用？注意：为 false 不代表没声音——还有在线朗读兜底 */
    ready: speechReady,
    whenReady: whenSpeechReady,
    engine: engine,
    stop() {
      try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { }
      NetTTS.stop();
    }
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
    get ok() { return speechReady() || engine() !== 'unknown'; },
    engine: 'local',      // 本次播放实际用哪条通道（play() 时定）
    localOk: undefined,   // 本机语音是否确认真的出过声
    q: [], i: 0, stopped: true, paused: false, at: 0,
    onEnd: null, onPart: null, onStep: null, onMode: null,

    voice() {
      if (!speechReady()) return null;
      // 只挑中文语音，再按"质量"排序，优先选最好的那一个。
      // 注意：Web Speech 暴露的是系统 SAPI 语音，Windows 的 XiaoxiaoNeural 等
      // 神经语音通常不在列表里；能命中 Neural/晓晓/云希/Google 最好，命中不到
      // 也不要紧，至少避开明显差的，并优先 zh-CN 地区。
      const vs = (VOICES.length ? VOICES : refreshVoices())
        .filter(v => /zh/i.test(v.lang || '') || /Chinese/i.test(v.name || ''));
      if (!vs.length) return null;
      const score = v => {
        const n = (v.name || '') + ' ' + (v.lang || '');
        let s = 0;
        if (/Neural/i.test(n)) s += 100;                 // 神经语音（晓晓/云希/Google 神经）最优
        if (/Xiaoxiao|Yunxi|晓晓|云希/i.test(n)) s += 60;
        if (/Google|谷哥|普通话/i.test(n)) s += 40;
        if (/Microsoft|微软/i.test(n)) s += 30;
        if (/Huihui|慧慧|Yaoyao|瑶瑶|Tingting|婷婷|Mei|美/i.test(n)) s += 20; // 基础女声，够用
        if (/zh[-_]CN/i.test(v.lang || '')) s += 10;     // 优先中国大陆口音
        if (/Male|男/i.test(n)) s -= 5;
        return s;
      };
      return vs.sort((a, b) => score(b) - score(a))[0];
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
     *   opt.onMode('local'|'net')  引擎确定时回调（界面据此提示）
     * 本机有语音合成就用本机；没有（或本机是哑的）自动改用在线朗读。
     */
    play(text, opt) {
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
      TTS.onMode = opt.onMode || null;
      TTS.rate = opt.rate || cfg.TTS_RATE || .95;
      TTS.pitch = opt.pitch || cfg.TTS_PITCH || 1.05;
      TTS.stepGap = opt.stepGap || cfg.STEP_GAP || 280;

      const start = () => {
        if (TTS.stopped) return;
        TTS.engine = engine() === 'local' ? 'local' : 'net';
        if (TTS.onMode) TTS.onMode(TTS.engine);
        if (TTS.engine === 'net') {
          // 在线朗读：<audio>.play() 必须留在用户手势的调用栈里（iOS 硬性要求），
          // 所以这里**不能**套 setTimeout，直接起播。
          TTS.next();
          return;
        }
        // 本机语音：stop() 里的 cancel() 是异步的，必须等一个 tick 再 speak，
        // 否则移动端会把第一句（甚至整段）一起取消掉 → 点了没声音。
        setTimeout(() => { if (!TTS.stopped) TTS.next(); }, 70);
      };

      if (engine() === 'unknown') {
        // 刚打开页面，本机语音还在探测：等它一下，超时就走在线朗读
        whenSpeechReady(good => { if (!good) SPEECH_ABSENT = true; start(); }, 800);
      } else start();
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
      if (TTS.engine === 'net') return TTS.nextNet();
      return TTS.nextLocal();
    },

    /* —— 本机语音合成 —— */
    nextLocal() {
      const k = TTS.i, unit = TTS.q[k];
      try {
        const u = new SpeechSynthesisUtterance(unit);
        u.lang = 'zh-CN';
        const v = TTS.voice(); if (v) u.voice = v;
        u.rate = TTS.rate; u.pitch = TTS.pitch;
        u.onstart = () => { TTS.at = k; if (TTS.onStep) TTS.onStep(k, TTS.q.length, unit); };
        u.onend = () => {
          TTS.localOk = true;
          clearTimeout(TTS.__wd);
          TTS.i = k + 1; setTimeout(() => TTS.next(), TTS.stepGap || 280);
        };
        u.onerror = () => {
          clearTimeout(TTS.__wd);
          // 第一句就报错 → 这台机器"有 API 却没语音引擎"，换在线朗读重读这句
          if (TTS.localOk !== true) return TTS.fallbackToNet(k);
          TTS.i = k + 1; setTimeout(() => TTS.next(), 120);
        };
        speechSynthesis.speak(u);
        // 兜底高亮：个别浏览器不触发 onstart
        setTimeout(() => {
          if (!TTS.stopped && TTS.i === k && TTS.at !== k) {
            TTS.at = k; if (TTS.onStep) TTS.onStep(k, TTS.q.length, unit);
          }
        }, 120);
        // 看门狗：第一句 2.5 秒内既没开始也没结束 → 判定本机朗读是哑的（Android 上很常见，
        // 系统没装 TTS 引擎时 speak() 就是啥也不发生、也不报错），改用在线朗读。
        if (TTS.localOk !== true) {
          clearTimeout(TTS.__wd);
          TTS.__wd = setTimeout(() => {
            if (TTS.stopped || TTS.i !== k) return;
            if (TTS.at === k) return;                       // 已经出声了，正常
            TTS.fallbackToNet(k);
          }, 2500);
        }
      } catch (e) { TTS.fallbackToNet(k); }
    },

    /* 本机语音不可用 → 改用在线朗读，并从第 k 句重读（不跳句） */
    fallbackToNet(k) {
      if (TTS.stopped || TTS.engine === 'net') return;
      // 记住这台机器"有 API 但不出声"，之后直接走在线，别再每句都白等 2.5 秒
      FORCE_NET = true;
      TTS.engine = 'net';
      TTS.i = k; TTS.at = -1;
      try { speechSynthesis.cancel(); } catch (e) { }
      if (TTS.onMode) TTS.onMode('net');
      setTimeout(() => { if (!TTS.stopped) TTS.next(); }, 60);
    },

    /* —— 在线朗读（<audio> 播放，任何浏览器都能出声） —— */
    nextNet() {
      const k = TTS.i, unit = TTS.q[k];
      if (TTS.q[k + 1]) NetTTS.prefetch(TTS.q[k + 1], 'zh');   // 预取下一句，减少卡顿
      let marked = false;
      const mark = () => {
        if (marked || TTS.stopped || TTS.i !== k) return;
        marked = true;
        TTS.at = k;
        if (TTS.onStep) TTS.onStep(k, TTS.q.length, unit);
      };
      NetTTS.speak(unit, {
        lang: 'zh',
        rate: TTS.rate, pitch: TTS.pitch,
        onStart: mark,
        onEnd: () => { if (TTS.i !== k) return; TTS.i = k + 1; setTimeout(() => TTS.next(), TTS.stepGap || 220); },
        onError: () => {
          if (TTS.i !== k) return;
          TTS.netFails = (TTS.netFails || 0) + 1;
          if (TTS.netFails >= 3 && !TTS.__netWarned) { TTS.__netWarned = true; UI.toast(netFailDiag(), 4200); }
          TTS.i = k + 1; setTimeout(() => TTS.next(), 150);
        }
      });
      setTimeout(mark, 900);   // 音频起播偏慢时，高亮别落后太多
    },

    pause() {
      if (TTS.stopped) return;
      TTS.paused = true;
      if (TTS.engine === 'net') NetTTS.pause();
      else { try { speechSynthesis.pause(); } catch (e) { } }
    },
    resume() {
      if (TTS.stopped) return;
      TTS.paused = false;
      if (TTS.engine === 'net') NetTTS.resume();
      else { try { speechSynthesis.resume(); } catch (e) { } }
    },
    toggle() { TTS.paused ? TTS.resume() : TTS.pause(); return TTS.paused; },
    stop() {
      TTS.stopped = true; TTS.paused = false; TTS.q = []; TTS.i = 0; TTS.at = -1;
      TTS.localOk = undefined; TTS.netFails = 0; TTS.__netWarned = false;
      clearTimeout(TTS.__wd);
      try { speechSynthesis.cancel(); } catch (e) { }
      NetTTS.stop();
    },
    get busy() { return !TTS.stopped; }
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
    },
    /* 把已有的 dataURL 再缩放到最长边 maxSide（裁剪之后压缩用） */
    resizeDataURL(dataUrl, maxSide) {
      return new Promise(resolve => {
        const im = new Image();
        im.onload = () => {
          let { width: w, height: h } = im;
          const m = maxSide || 800;
          if (Math.max(w, h) > m) { const k = m / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(im, 0, 0, w, h);
          try { resolve(cv.toDataURL('image/jpeg', 0.78)); } catch (e) { resolve(dataUrl); }
        };
        im.onerror = () => resolve(dataUrl);
        im.src = dataUrl;
      });
    },
    /* 取得 dataURL 的像素尺寸 */
    sizeOf(dataUrl) {
      return new Promise(resolve => {
        const im = new Image();
        im.onload = () => resolve({ w: im.naturalWidth || 0, h: im.naturalHeight || 0 });
        im.onerror = () => resolve({ w: 0, h: 0 });
        im.src = dataUrl;
      });
    }
  };

  /* ---------- 图片：框选裁剪 ----------
   *  Crop.open(dataUrl, opt) → Promise<string|null>
   *    确认裁剪 → resolve 裁剪后的 dataURL
   *    用整张图 → resolve 原 dataURL
   *    取消     → resolve null
   *  支持鼠标与触摸（Pointer Events），四角可拉伸、框内可拖动。
   * ------------------------------------------------------------ */
  const Crop = {
    open(dataUrl, opt) {
      opt = opt || {};
      return new Promise(resolve => {
        const mask = document.createElement('div');
        mask.className = 'crop-mask';
        mask.innerHTML = `
          <div class="crop-head">
            <span class="crop-title">${UI.esc(opt.title || '框住这道题')}</span>
            <button class="crop-x" id="cropCancel" aria-label="取消">✕</button>
          </div>
          <div class="crop-scroll" id="cropScroll">
            <div class="crop-wrap" id="cropWrap">
              <img id="cropImg" src="${dataUrl}" alt="">
              <div class="crop-box" id="cropBox">
                <i class="crop-h" data-h="tl"></i><i class="crop-h" data-h="tr"></i>
                <i class="crop-h" data-h="bl"></i><i class="crop-h" data-h="br"></i>
              </div>
            </div>
          </div>
          <div class="crop-tip">拖动四角调整大小，框住<b>这一道题</b>，再点下面的按钮</div>
          <div class="crop-actions">
            <button class="btn ghost" id="cropAll">用整张图</button>
            <button class="btn bg-g" id="cropOk">✅ 就用框住的这块</button>
          </div>`;
        document.body.appendChild(mask);
        requestAnimationFrame(() => mask.classList.add('on'));

        const scroller = mask.querySelector('#cropScroll');
        const img = mask.querySelector('#cropImg');
        const wrap = mask.querySelector('#cropWrap');
        const box = mask.querySelector('#cropBox');
        let nat = { w: 1, h: 1 };
        let disp = { w: 1, h: 1 };
        const MIN = 44;

        const clampBox = (b) => {
          b.w = Math.max(MIN, Math.min(b.w, disp.w));
          b.h = Math.max(MIN, Math.min(b.h, disp.h));
          b.x = Math.max(0, Math.min(b.x, disp.w - b.w));
          b.y = Math.max(0, Math.min(b.y, disp.h - b.h));
          return b;
        };
        const paint = (b) => {
          box.style.left = b.x + 'px'; box.style.top = b.y + 'px';
          box.style.width = b.w + 'px'; box.style.height = b.h + 'px';
        };
        let cur = { x: 0, y: 0, w: 0, h: 0 };

        /* 用 JS 精确算出"图片显示尺寸"，并把 wrap 与 img 都设成同一像素值。
           这样选框坐标与显示像素一一对应，不会因 CSS 的 max-height 把竖长照片压扁而出错。 */
        const layout = (keepRatio) => {
          nat.w = img.naturalWidth || 1; nat.h = img.naturalHeight || 1;
          const availW = Math.max(120, scroller.clientWidth - 24);
          const availH = Math.max(120, scroller.clientHeight - 12);
          const k = Math.min(availW / nat.w, availH / nat.h);   // 铺满可用区域（等比，可放大）
          disp.w = Math.max(80, Math.round(nat.w * k));
          disp.h = Math.max(80, Math.round(nat.h * k));
          wrap.style.width = disp.w + 'px'; wrap.style.height = disp.h + 'px';
          img.style.width = disp.w + 'px'; img.style.height = disp.h + 'px';
          if (keepRatio) {
            const rw = cur.w / (disp.w || 1), rh = cur.h / (disp.h || 1);
            const rx = cur.x / (disp.w || 1), ry = cur.y / (disp.h || 1);
            cur = clampBox({ x: rx * disp.w, y: ry * disp.h, w: rw * disp.w, h: rh * disp.h });
          } else {
            cur = clampBox({ x: disp.w * 0.06, y: disp.h * 0.10, w: disp.w * 0.88, h: disp.h * 0.34 });
          }
          paint(cur);
        };
        const ready = () => { layout(false); };
        if (img.complete && img.naturalWidth) ready();
        else img.onload = ready;
        const onResize = () => { if (img.naturalWidth) layout(true); };
        window.addEventListener('resize', onResize);

        /* 拖动 / 拉伸 */
        let drag = null;
        box.addEventListener('pointerdown', e => {
          if (e.target.id === 'cropCancel') return;
          e.preventDefault(); e.stopPropagation();
          drag = {
            mode: e.target.getAttribute('data-h') || 'move',
            sx: e.clientX, sy: e.clientY, b: Object.assign({}, cur),
          };
        });
        const onMove = e => {
          if (!drag) return;
          e.preventDefault();
          const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
          const b = Object.assign({}, drag.b);
          if (drag.mode === 'move') { b.x += dx; b.y += dy; }
          else {
            if (drag.mode.indexOf('l') >= 0) { b.x += dx; b.w -= dx; }
            if (drag.mode.indexOf('r') >= 0) { b.w += dx; }
            if (drag.mode.indexOf('t') >= 0) { b.y += dy; b.h -= dy; }
            if (drag.mode.indexOf('b') >= 0) { b.h += dy; }
            if (b.w < MIN) { if (drag.mode.indexOf('l') >= 0) b.x = drag.b.x + drag.b.w - MIN; b.w = MIN; }
            if (b.h < MIN) { if (drag.mode.indexOf('t') >= 0) b.y = drag.b.y + drag.b.h - MIN; b.h = MIN; }
          }
          cur = clampBox(b); paint(cur);
        };
        const onUp = () => { drag = null; };
        mask.addEventListener('pointermove', onMove, { passive: false });
        mask.addEventListener('pointerup', onUp);
        mask.addEventListener('pointercancel', onUp);

        const finish = (v) => {
          window.removeEventListener('resize', onResize);
          mask.classList.remove('on');
          setTimeout(() => mask.remove(), 180);
          resolve(v);
        };

        mask.querySelector('#cropCancel').onclick = () => finish(null);
        mask.querySelector('#cropAll').onclick = () => finish(dataUrl);
        mask.querySelector('#cropOk').onclick = () => {
          if (!nat.w || !disp.w) { finish(dataUrl); return; }
          const k = nat.w / disp.w;
          const sx = Math.round(cur.x * k), sy = Math.round(cur.y * k);
          const sw = Math.max(8, Math.round(cur.w * k)), sh = Math.max(8, Math.round(cur.h * k));
          const im = new Image();
          im.onload = () => {
            const cv = document.createElement('canvas');
            cv.width = sw; cv.height = sh;
            const c = cv.getContext('2d');
            c.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
            try { finish(cv.toDataURL('image/jpeg', 0.8)); } catch (e) { finish(dataUrl); }
          };
          im.onerror = () => finish(dataUrl);
          im.src = dataUrl;
        };
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

  window.DB = DB; window.UI = UI; window.SFX = SFX; window.Say = Say; window.TTS = TTS;
  window.FX = FX; window.Img = Img; window.Modal = Modal; window.Douyin = Douyin; window.Crop = Crop;
  document.addEventListener('DOMContentLoaded', FX.init);
})();
