/* ================= 本地神经语音（Piper · VITS · 华研女声） =================
 *  目的：给语文朗读「有感情」—— 微软/百度免费接口是机械音、逐字读，
 *        本机 Web Speech 也大多平淡。Piper 是 VITS 神经语音，自带自然韵律，
 *        且全部资源自托管在 vendor/piper/（模型 63MB + espeak 18MB + ort 10MB），
 *        浏览器内 WASM 推理 → **完全离线、零账号、零密钥**。
 *
 *  用法：core.js 的 TTS / Say 在引擎选择时优先用本模块（就绪后 engine()==='piper'）。
 *  首次使用会在后台懒加载模型（约几十秒视网速，之后浏览器缓存），加载完自动切换。
 * ===================================================================== */
import { TtsSession } from '../vendor/piper/piper-tts-web.js';

const VOICE = 'zh_CN-huayan-medium';
// 0.01 秒静音 WAV —— 趁用户手势把共享 <audio> 解锁（iOS/微信硬性要求）
const SILENT_WAV = 'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

let _session = null;
let _loading = null;
let _ready = false;
let _failed = false;
let _audio = null;
let _gen = 0;            // 世代号：stop() 后作废在途的播放回调

/* 复用同一个 <audio>（和 NetTTS 同理）：iOS 只有被用户手势解锁过的元素才允许之后程序化连续播放 */
function getAudio() {
  if (_audio && _audio.parentNode) return _audio;
  const a = document.createElement('audio');
  a.id = 'piperTts';
  a.preload = 'auto';
  a.setAttribute('playsinline', '');
  a.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
  document.body.appendChild(a);
  _audio = a;
  return a;
}

/* 趁用户手势播一段静音，解锁共享音频元素 */
function unlock() {
  try {
    const a = getAudio();
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
      getAudio();   // 提前创建，等会儿解锁用
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

/* 朗读一句中文。opt: { rate, onStart, onEnd, onError } —— 接口与 NetTTS.speak 对齐 */
async function speak(text, opt) {
  opt = opt || {};
  let blob;
  try {
    const s = await ensure();
    blob = await s.predict(String(text == null ? '' : text));
  } catch (e) {
    console.error('[piper] 推理失败：', e);
    if (opt.onError) opt.onError();   // 模型/推理出错 → 让上层退回在线朗读补读
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = getAudio();
  const my = ++_gen;
  const alive = () => _gen === my;
  a.onplaying = () => { if (alive() && opt.onStart) opt.onStart(); };
  a.onended = () => {
    if (!alive()) return;
    URL.revokeObjectURL(url);
    if (opt.onEnd) opt.onEnd();
  };
  a.onerror = () => {
    if (!alive()) return;
    URL.revokeObjectURL(url);
    if (opt.onError) opt.onError();
  };
  try { a.pause(); } catch (e) { }
  try { a.currentTime = 0; } catch (e) { }
  a.src = url;
  const p = a.play();
  if (p && typeof p.then === 'function') {
    p.then(() => { /* onplaying 再确认 */ }).catch(() => {
      if (!alive()) return;
      setTimeout(() => {
        if (!alive()) return;
        const p2 = a.play();
        if (p2 && p2.catch) p2.catch(() => { if (alive() && opt.onError) opt.onError(); });
      }, 120);
    });
  } else {
    if (opt.onStart) opt.onStart();
  }
}

function pause() { const a = _audio; if (a) { try { a.pause(); } catch (e) { } } }
function resume() { const a = _audio; if (a) { try { a.play(); } catch (e) { } } }
function stop() {
  _gen++;                       // 作废在途回调
  const a = _audio;
  if (a) { a.onerror = null; try { a.pause(); } catch (e) { } }
}

/* 首屏空闲后预热（不阻塞）：用户稍后点朗读时多半已就绪。
   仍建议配合 core.js 在 TTS 首次使用时再 ensure() 一次，确保一定触发加载。 */
function prewarm() { ensure().catch(() => { }); }

window.PiperTTS = {
  get ready() { return _ready; },
  get failed() { return _failed; },
  get engine() { return 'piper'; },
  get voice() { return VOICE; },
  get audioEl() { return getAudio(); },
  ensure, speak, pause, resume, stop, unlock, prewarm
};

if (document.readyState === 'complete') setTimeout(prewarm, 2000);
else window.addEventListener('load', () => setTimeout(prewarm, 2000));
