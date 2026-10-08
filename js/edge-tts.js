/* Edge-TTS：微软神经语音，浏览器原生 WebSocket 直连。
 *  - 无需密钥 / 无需 Cloudflare / 零大体积下载（模型在微软云端）。
 *  - 中文默认 zh-CN-XiaoxiaoNeural（晓晓：有感情、断句自然、韵律好）；英文 en-US-AriaNeural。
 *  - 断句交给云端 TTS 自己处理，比本地逐句拼读自然得多，也不会"断断续续"。
 *  - 仅作中文朗读的在线主引擎；断网时由 core.js 降级到本机语音 / Piper / 百度兜底。
 *  说明：GEC 令牌通过 URL 查询参数传递（原生 WebSocket 即可，不需自定义请求头），
 *        用 Web Crypto(SHA-256) 计算，算法与公开可用的 edge-tts 浏览器实现一致。
 */
(function () {
  var TRUSTED = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  var WSS = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
  var VOICE = { zh: 'zh-CN-XiaoxiaoNeural', en: 'en-US-AriaNeural' };
  var AUDIO_HDR = [80, 97, 116, 104, 58, 97, 117, 100, 105, 111, 13, 10, 13, 10]; // "Path:audio\r\n\r\n"
  var cache = Object.create(null);   // key -> blobURL
  var el = null, gen = 0, fails = 0, usable = true;

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0; var v = c === 'x' ? r : (r & 0x3) | 0x8; return v.toString(16);
    });
  }
  // 计算 Sec-MS-GEC：Windows filetime(100ns) 取整到 5 分钟窗口，拼接 TrustedClientToken 后 SHA-256。
  function gec() {
    var WIN = 11644473600;
    var t = Date.now() / 1000 + WIN; t -= t % 300; t *= 1e7;
    var s = Math.floor(t).toString() + TRUSTED;
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      var a = Array.from(new Uint8Array(b));
      return a.map(function (x) { return x.toString(16).padStart(2, '0'); }).join('').toUpperCase();
    });
  }
  // 在二进制帧中定位 "Path:audio\r\n\r\n" 之后真正的音频字节起点
  function findAudio(buf) {
    for (var i = 0; i + AUDIO_HDR.length <= buf.length; i++) {
      var ok = true;
      for (var j = 0; j < AUDIO_HDR.length; j++) { if (buf[i + j] !== AUDIO_HDR[j]) { ok = false; break; } }
      if (ok) return i + AUDIO_HDR.length;
    }
    return -1;
  }
  // rate/pitch 由倍率换算成 SSML 相对百分比（Edge 最稳的写法）
  function toRate(r) { var p = Math.round((r - 1) * 100); return (p >= 0 ? '+' : '') + p + '%'; }
  function toPitch(p) { var p2 = Math.round((p - 1) * 100); return (p2 >= 0 ? '+' : '') + p2 + '%'; }

  function synth(text, lang, rate, pitch) {
    var voice = VOICE[lang] || VOICE.zh;
    var key = lang + '|' + rate + '|' + pitch + '|' + text;
    if (cache[key]) return Promise.resolve(cache[key]);
    return gec().then(function (tok) {
      return new Promise(function (resolve, reject) {
        var url = WSS + '?TrustedClientToken=' + TRUSTED + '&Sec-MS-GEC=' + tok +
          '&Sec-MS-GEC-Version=1-130.0.2849.68&ConnectionId=' + uuid();
        var ws;
        try { ws = new WebSocket(url); } catch (e) { reject(e); return; }
        ws.binaryType = 'arraybuffer';
        var chunks = [], ended = false;
        var timer = setTimeout(function () { try { ws.close(); } catch (e) {} if (!ended) reject(new Error('timeout')); }, 30000);
        ws.onopen = function () {
          ws.send('X-Timestamp:' + new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') +
            '\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n' +
            '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}');
          var esc = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
          var ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="' +
            (lang === 'en' ? 'en-US' : 'zh-CN') + '"><voice name="' + voice + '"><prosody rate="' +
            toRate(rate) + '" pitch="' + toPitch(pitch) + '">' + esc + '</prosody></voice></speak>';
          ws.send('X-RequestId:' + uuid() + '\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:' +
            new Date().toISOString() + 'Z\r\nPath:ssml\r\n\r\n' + ssml);
        };
        ws.onmessage = function (ev) {
          clearTimeout(timer);
          if (typeof ev.data === 'string') {
            if (ev.data.indexOf('Path:turn.end') >= 0) {
              ended = true; try { ws.close(); } catch (e) {}
              if (!chunks.length) { reject(new Error('empty audio')); return; }
              var total = chunks.reduce(function (a, b) { return a + b.length; }, 0);
              var merged = new Uint8Array(total); var off = 0;
              for (var c = 0; c < chunks.length; c++) { merged.set(chunks[c], off); off += chunks[c].length; }
              var burl = URL.createObjectURL(new Blob([merged], { type: 'audio/mpeg' }));
              cache[key] = burl; resolve(burl);
            }
          } else {
            var buf = new Uint8Array(ev.data);
            var idx = findAudio(buf);
            if (idx >= 0) chunks.push(buf.subarray(idx));
          }
        };
        ws.onerror = function () { if (!ended) { clearTimeout(timer); reject(new Error('ws error')); } };
      });
    });
  }

  function ensure() {
    if (el && el.parentNode) return el;
    var a = document.createElement('audio');
    a.id = 'edgeTts'; a.preload = 'auto'; a.setAttribute('playsinline', '');
    a.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
    document.body.appendChild(a); el = a; return a;
  }

  var EdgeTTS = {
    get playing() { return !!el && !el.paused && !el.ended; },
    get fails() { return fails; },
    usable: (typeof WebSocket !== 'undefined') && (typeof navigator === 'undefined' || navigator.onLine !== false),
    speak: function (text, opt) {
      opt = opt || {};
      var lang = (opt.lang === 'en') ? 'en' : 'zh';
      var rate = opt.rate != null ? opt.rate : 0.95;
      var pitch = opt.pitch != null ? opt.pitch : 1.05;
      var my = ++gen;
      var alive = function () { return gen === my && !(el && el.__dead); };
      synth(text, lang, rate, pitch).then(function (burl) {
        if (!alive()) return;
        var a = ensure(); el.__dead = false;
        a.onplaying = function () { if (alive()) { fails = 0; if (opt.onStart) opt.onStart(); } };
        a.onended = function () { if (alive() && opt.onEnd) opt.onEnd(); };
        a.onerror = function () { if (!alive()) return; fails++; if (opt.onError) opt.onError(); };
        try { a.pause(); } catch (e) {}
        try { a.currentTime = 0; } catch (e) {}
        a.src = burl;
        var p = a.play();
        if (p && typeof p.then === 'function') p.then(function () { }).catch(function () {
          if (!alive()) return;
          setTimeout(function () {
            var p2 = a.play();
            if (p2 && p2.catch) p2.catch(function () { if (alive()) { fails++; if (opt.onError) opt.onError(); } });
          }, 120);
        }); else if (opt.onStart) opt.onStart();
      }).catch(function () {
        if (alive()) { fails++; if (opt.onError) opt.onError(); }
      });
      return true;
    },
    // 后台预合成下一句，播完当前句立即续上，消除"断断续续"
    prefetch: function (text, opt) {
      opt = opt || {};
      var lang = (opt.lang === 'en') ? 'en' : 'zh';
      var rate = opt.rate != null ? opt.rate : 0.95;
      var pitch = opt.pitch != null ? opt.pitch : 1.05;
      synth(text, lang, rate, pitch).catch(function () { });
    },
    stop: function () { gen++; if (el) { el.__dead = true; try { el.pause(); } catch (e) { } } },
    pause: function () { if (el) { try { el.pause(); } catch (e) { } } },
    resume: function () { if (el) { try { el.play(); } catch (e) { } } },
    reset: function () { EdgeTTS.usable = (typeof navigator === 'undefined' || navigator.onLine !== false); fails = 0; }
  };
  try {
    window.addEventListener('offline', function () { EdgeTTS.usable = false; });
    window.addEventListener('online', function () { EdgeTTS.reset(); });
  } catch (e) { }
  window.EdgeTTS = EdgeTTS;
})();
