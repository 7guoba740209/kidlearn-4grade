/* ================= 本地神经语音（Piper · VITS · 华研女声） =================
 *  目的：给语文朗读「有感情」—— 微软/百度免费接口是机械音、逐字读，
 *        本机 Web Speech 也大多平淡。Piper 是 VITS 神经语音，自带自然韵律，
 *        且全部资源自托管在 vendor/piper/（模型 63MB + espeak 18MB + ort 10MB），
 *        浏览器内 WASM 推理 → **完全离线、零账号、零密钥**。
 *
 *  流畅度修复（关键）：
 *    旧版逐句"现点现做"——读完一句才跑 WASM 推理合成下一句，句间夹着
 *    推理延迟 + 固定间隔 → 听起来一顿一顿。新版改为：
 *      · synth(text) 记忆化：同一句话只推理一次，之后直接命中缓存；
 *      · 播放当前句时，后台预合成后面几句（preload）；
 *      · 读完后下一句早已算好 → 立即播放，间隙≈0（仅音频解码耗时）。
 *    这样 Piper 也能像本机语音一样"一口气顺下来"，不再断断续续。
 * ===================================================================== */
import { TtsSession } from '../vendor/piper/piper-tts-web.js';

const VOICE = 'zh_CN-huayan-medium';
// 0.01 秒静音 WAV —— 趁用户手势把共享 <audio> 解锁（iOS/微信硬性要求）
const SILENT_WAV = 'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

/* 轻微"更有感情/更清晰"的默认调参（可在 data/config.js 的 CN_PLAY.PIPER_TUNE 覆盖）。
   lengthScale 略小于 1 → 稍慢一点，吐字更清楚、更有讲述感（适合小学生跟读）；
   noiseScale 保持模型默认，避免引入杂音。改坏随时把对应项删掉即回到模型原生。 */
window.KL_PIPER_TUNE = Object.assign({ lengthScale: 0.95 }, window.KL_PIPER_TUNE || {});

let _session = null;
let _loading = null;
let _ready = false;
let _failed = false;
let _gen = 0;            // 世代号：stop() 后作废在途的播放回调
let _queue = [];         // 待播队列 {text, opt, gen}
let _busy = false;       // 当前是否正在播放（_pump 占用）
let _slot = 0;           // 双缓冲音频元素交替，避免 src 切换抖动
let _els = [];           // 音频元素池
let _curEl = null;       // 当前正在用的元素（供 audioEl getter）
let _cache = new Map();  // text -> Promise<Blob>  （合成记忆化）

function getEl(i) {
  if (_els[i]) return _els[i];
  const a = document.createElement('audio');
  a.id = 'piperTts' + (i ? i : '');
  a.preload = 'auto';
  a.setAttribute('playsinline', '');
  a.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
  document.body.appendChild(a);
  _els[i] = a;
  return a;
}

/* 趁用户手势播一段静音，解锁共享音频元素 */
function unlock() {
  try {
    const a = getEl(0);
    a.src = SILENT_WAV;
    const p = a.play();
    if (p && p.catch) p.catch(() => { });
  } catch (e) { }
}

async function ensure() {
  if (_ready) return _session;
  if (_failed) throw new Error('piper 不可用');
  if (_loading) return _loading;
  if (!window.ort) { _failed = true; throw new Error('onnxruntime-web 未加载'); }
  _loading = (async () => {
    try {
      getEl(0);   // 提前创建，等会儿解锁用
      _session = await TtsSession.create({
        voiceId: VOICE,
        logger: (m) => { if (window.KL_DEBUG) console.debug('[piper]', m); },
        progress: (p) => { if (window.KL && window.KL.onPiperProgress) window.KL.onPiperProgress(p); }
      });
      _ready = true;
      console.log('[piper] 就绪，发音人 =', VOICE);
      if (window.KL && window.KL.onPiperReady) window.KL.onPiperReady();
      return _session;
    } catch (e) {
      _failed = true;
      console.error('[piper] 初始化失败：', e);
      throw e;
    }
  })();
  return _loading;
}

/* 合成一句（记忆化）：同一文本只推理一次，之后直接命中缓存。
   这是消除"断断续续"的核心——后面几句提前合成好，播放时零等待。 */
function synth(text) {
  const key = String(text == null ? '' : text);
  if (_cache.has(key)) return _cache.get(key);
  const p = (async () => {
    const s = await ensure();
    return s.predict(key);
  })();
  _cache.set(key, p);
  return p;
}
/* 后台预合成（不阻塞、不播放），让下一句在需要前就备好 */
function preload(text) {
  const k = String(text == null ? '' : text);
  if (k) synth(k).catch(() => { });
}

/* 内部播放泵：从队列取出一句，合成（命中缓存则秒出）→ 播放；
   播完（onended）立即取下一句，形成连续朗读。 */
async function _pump() {
  if (_busy) return;
  const it = _queue.shift();
  if (!it) return;
  if (it.gen !== _gen) { _pump(); return; }   // 已被 stop/新播放作废
  _busy = true;
  let blob;
  try {
    blob = await synth(it.text);
  } catch (e) {
    console.error('[piper] 推理失败：', e);
    _busy = false;
    if (it.opt.onError) it.opt.onError();   // 让上层退回在线朗读补读
    _pump();
    return;
  }
  if (it.gen !== _gen) { _busy = false; _pump(); return; }
  const url = URL.createObjectURL(blob);
  const e = getEl(_slot); _slot ^= 1;
  _curEl = e;
  const alive = () => it.gen === _gen;
  let done = false;
  e.onplaying = () => { if (alive() && !done && it.opt.onStart) it.opt.onStart(); };
  e.onended = () => {
    if (done) return; done = true;
    if (!alive()) return;
    URL.revokeObjectURL(url);
    _busy = false;
    if (it.opt.onEnd) it.opt.onEnd();
    _pump();
  };
  e.onerror = () => {
    if (done) return; done = true;
    if (!alive()) return;
    URL.revokeObjectURL(url);
    _busy = false;
    if (it.opt.onError) it.opt.onError();
    _pump();
  };
  try { e.pause(); } catch (e2) { }
  try { e.currentTime = 0; } catch (e2) { }
  e.src = url;
  const p = e.play();
  if (p && typeof p.then === 'function') {
    p.then(() => { /* onplaying 再确认 */ }).catch(() => {
      if (!alive() || done) return;
      setTimeout(() => {
        if (!alive() || done) return;
        const p2 = e.play();
        if (p2 && p2.catch) p2.catch(() => { if (alive() && it.opt.onError) it.opt.onError(); });
      }, 120);
    });
  } else {
    if (it.opt.onStart) it.opt.onStart();
  }
}

/* 朗读一句中文。opt: { onStart, onEnd, onError } —— 接口与 NetTTS.speak 对齐 */
function speak(text, opt) {
  opt = opt || {};
  preload(text);                 // 确保本句已在合成（首句可能还在算，后续句已缓存）
  _queue.push({ text: String(text == null ? '' : text), opt, gen: _gen });
  _pump();
}

function pause() { const e = _curEl || _els[0]; if (e) { try { e.pause(); } catch (e2) { } } }
function resume() { const e = _curEl || _els[0]; if (e) { try { e.play(); } catch (e2) { } } }
function stop() {
  _gen++;                        // 作废在途回调与队列
  _queue.length = 0;
  _busy = false;
  for (const e of _els) { if (e) { e.onerror = null; try { e.pause(); } catch (e2) { } } }
}

/* 首屏空闲后预热（不阻塞）：用户稍后点朗读时多半已就绪。
   仍建议配合 core.js 在 TTS 首次使用时再 ensure() 一次，确保一定触发加载。 */
function prewarm() { ensure().catch(() => { }); }

window.PiperTTS = {
  get ready() { return _ready; },
  get failed() { return _failed; },
  get engine() { return 'piper'; },
  get voice() { return VOICE; },
  get audioEl() { return _curEl || getEl(0); },
  ensure, speak, pause, resume, stop, unlock, prewarm, preload
};

if (document.readyState === 'complete') setTimeout(prewarm, 2000);
else window.addEventListener('load', () => setTimeout(prewarm, 2000));
