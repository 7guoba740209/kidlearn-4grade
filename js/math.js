/* ================= 数学模块：拍错题 → 存云盘 → 自动识别知识点 → 同类题练习 ================= */
window.MathMod = (function () {
  const N = () => APP_CONFIG.MATH_PRACTICE_N || 5;

  /* ---------------- 模拟 OCR ----------------
   * 想接真 OCR：把 APP_CONFIG.MATH_OCR 设成 true，然后把下面的
   * Promise 换成自己的接口请求，返回 { text:'识别出的题目', kp:'知识点id' } 即可。
   * 注意：请用第二个参数 dataUrl（**已经裁剪好的那一题**），不要用原始整张照片。
   */
  /* ---------------- 真 OCR（Tesseract.js，纯前端） ----------------
   * 由 index.html 引入 CDN 的 tesseract.min.js，window.Tesseract 才存在。
   * 首次会下载中文语言包（约 10MB，缓存在 IndexedDB），之后复用同一 worker。
   * onProgress(m) 把识别进度显示到页面。 */
  let _ocrWorker = null;
  function _ocrTimeout(ms, tag) {
    return new Promise((_, rej) => setTimeout(() => rej(new Error('ocr-' + tag + '-timeout')), ms));
  }

  /* 拍照原图往往有噪点 / 光线不均 / 字偏小，直接喂给 Tesseract 准确率会掉。
   * 预处理：放大(小字) → 灰度 → 轻度锐化(补偿对焦不实&缩放模糊)。
   * 不开"硬二值化"——实测对带噪+模糊的图反而把字搞糊，Tesseract 自带自适应阈值更稳。
   * 任何一步出错就退回原图。 */
  function preprocessForOCR(dataUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
          if (!W || !H) return resolve(dataUrl);
          let scale = 1;
          const target = 1800;
          if (W < target) scale = Math.min(target / W, 3);   // 字太小就放大，最多 3 倍
          const w = Math.max(1, Math.round(W * scale)), h = Math.max(1, Math.round(H * scale));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const d = ctx.getImageData(0, 0, w, h);
          const px = d.data;
          const g = new Uint8ClampedArray(w * h);
          for (let i = 0, j = 0; i < px.length; i += 4, j++) {
            const v = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
            g[j] = v; px[i] = px[i + 1] = px[i + 2] = v;
          }
          // 轻度锐化（拉普拉斯）：中心 5 倍，四邻各减 1
          const out = new Uint8ClampedArray(g.length);
          const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? g[y * w + x] : g[y * w + x];
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const v = 5 * at(x, y) - at(x - 1, y) - at(x + 1, y) - at(x, y - 1) - at(x, y + 1);
            out[i] = Math.max(0, Math.min(255, v));
          }
          for (let i = 0, j = 0; i < px.length; i += 4, j++) px[i] = px[i + 1] = px[i + 2] = out[j];
          ctx.putImageData(d, 0, 0);
          resolve(cv.toDataURL('image/png'));
        } catch (e) { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function ocrWithTesseract(dataUrl, onProgress) {
    try {
      if (!_ocrWorker) {
        _ocrWorker = await Promise.race([
          Tesseract.createWorker('chi_sim', 1, { logger: m => { if (onProgress) onProgress(m); } }),
          _ocrTimeout(45000, 'init')
        ]);
      }
      const clean = await preprocessForOCR(dataUrl);   // 先预处理，再识别
      const { data } = await Promise.race([
        _ocrWorker.recognize(clean),
        _ocrTimeout(45000, 'recognize')
      ]);
      return { text: (data.text || '').replace(/\s+/g, '') };
    } catch (e) {
      console.warn('[OCR] 识别失败，改走人工选知识点：', e && e.message);
      return { text: '' };   // 失败 → 让调用方引导用户手动选，绝不再随机抽
    }
  }
  function recognizeImage(file, dataUrl, onProgress) {
    // 1) 用户自己接的 OCR 接口（若有）
    if (APP_CONFIG.MATH_OCR && window.MyOCR) return window.MyOCR(dataUrl || file, file);
    // 2) 纯前端真 OCR
    if (window.Tesseract) return ocrWithTesseract(dataUrl || file, onProgress);
    // 3) 都没得用：返回空文本，由调用方引导用户手动选知识点（不再随机抽题）
    return Promise.resolve({ text: '' });
  }
  /* 依据文字里的关键词二次确认知识点（真 OCR 返回的文本也走这一步）。
   * 返回 { kp, score }，score 是匹配到的关键词"权重和"（越长越专属的词权重越高）。
   * 只有 score>=2 才算可信；垃圾文本里偶尔含单个弱字(如"角")不应自动出题。 */
  function guessKp(text) {
    let best = null, score = 0;
    if (text) {
      MATH_KP.forEach(kp => {
        let s = 0;
        kp.keywords.forEach(w => { if (text.indexOf(w) >= 0) s += w.length; });
        if (s > score) { score = s; best = kp; }
      });
    }
    return { kp: best, score };
  }

  /* 没认出来 / 没匹配到知识点：让用户手动点选（返回 Promise<kpid|null>） */
  function pickKp(box, ocrText) {
    return new Promise(resolve => {
      box.innerHTML = `
        <div class="card">
          <div style="font-weight:800;font-size:18px">🔍 没认出这道是什么题</div>
          <div style="color:var(--ink2);font-size:15px;margin-top:6px;line-height:1.7">
            ${ocrText ? '我读到的文字：<b>' + UI.esc(ocrText.slice(0, 80)) + '</b>' : '没有读到文字（照片可能不太清晰）'}
          </div>
          <div style="margin-top:12px;font-size:15px;color:var(--ink2)">请帮它选一下正确的知识点：</div>
          <div class="lesson-list" style="margin-top:8px">
            ${MATH_KP.map(k => `<span class="chip small" data-kp="${k.id}">${k.emoji} ${k.name}</span>`).join('')}
          </div>
        </div>`;
      UI.$$('[data-kp]', box).forEach(ch => ch.onclick = () => resolve(ch.getAttribute('data-kp')));
    });
  }

  function genQuestions(kpId) {
    const kp = KP_MAP[kpId];
    const arr = [];
    for (let i = 0; i < N(); i++) arr.push(kp.gen());
    return arr;
  }

  function newSession(kpId, ocrText, photo) {
    const id = 's' + Date.now();
    const kp = KP_MAP[kpId];
    const s = {
      id, kp: kpId, kpName: kp.name, emoji: kp.emoji, color: kp.color,
      ocr: ocrText || '', photo: photo || '', time: UI.now(),
      qs: genQuestions(kpId), done: false, got: 0
    };
    DB.set('sess_' + id, s);
    // 照片同步进「云盘」
    if (photo) {
      const photos = DB.get('photos', []);
      photos.unshift({ id, thumb: photo, time: s.time, kp: kpId, kpName: kp.name, emoji: kp.emoji });
      DB.set('photos', photos.slice(0, 60));
    }
    return s;
  }
  const getSess = id => DB.get('sess_' + id, null);

  /* ---------------- 页面：模块首页 ---------------- */
  function home() {
    const photos = DB.get('photos', []);
    return `
      <div class="page-head"><span class="back" data-go="#/home">‹</span><h2>数学</h2></div>
      <p class="big-title">把错题拍下来吧！</p>
      <p class="sub-title">拍一张照片，框住这一道题，自动生成同类型练习题</p>

      <button class="big-btn bg-b" id="bCam"><span class="ico">📷</span>
        <span>拍照上传<small>手机会打开相机</small></span></button>
      <button class="big-btn bg-c" id="bAlbum"><span class="ico">🖼️</span>
        <span>从相册选图<small>也可以选电脑里的截图</small></span></button>
      <button class="big-btn bg-o" data-go="#/ma/album"><span class="ico">🗂️</span>
        <span>我的错题本<small>共 ${photos.length} 张 · 按时间排列</small></span></button>

      <div id="workBox"></div>

      <div class="card" style="margin-top:14px">
        <div style="font-weight:800;margin-bottom:6px">怎么用？</div>
        <div style="color:var(--ink2);font-size:16px;line-height:1.9">
          ① 点「拍照」或直接选一张错题照片<br>
          ② <b>拖动框，只框住这一道题</b>（一张照片上有好几题时尤其有用）<br>
          ③ 自动识别这道题的知识点，生成 ${N()} 道同类新题<br>
          ④ 做完自动判分，每道题都有解析<br>
          <span style="font-size:14px">（照片保存在本机，不会上传到任何服务器）</span>
        </div>
      </div>`;
  }

  /* ---------------- 上传 + 识别流程 ---------------- */
  async function handleFiles(files, boxId) {
    const box = document.getElementById(boxId) || document.getElementById('workBox');
    const f = files && files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { UI.toast('请选择一张图片哦'); return; }

    box.innerHTML = `<div class="card loading"><div class="spin"></div>
      <div class="step-line">正在读取照片…</div></div>`;

    const MAX = APP_CONFIG.MATH_MAX_PHOTO || 800;
    const WANT_CROP = APP_CONFIG.MATH_CROP !== false;
    // 要裁剪时先把原图读大一点（裁出来的那一题才够清晰给 OCR 认）
    let dataUrl;
    try {
      dataUrl = await Img.fileToDataURL(f, WANT_CROP ? Math.max(1400, MAX * 2) : MAX);
    } catch (e) {
      box.innerHTML = `<div class="card">读取失败，换一张图片试试～</div>`;
      return;
    }

    /* ---- 框选一题 ----
       一张作业照片上常常有好几道题，整张送进去会认错知识点。
       所以先让用户把框拉到"这一道题"上，只把框里的那块送去识别。
       不想要这一步可以把 APP_CONFIG.MATH_CROP 设成 false。 */
    if (WANT_CROP) {
      box.innerHTML = '';
      box.style.display = 'none';
      let picked = null;
      try {
        picked = await Crop.open(dataUrl, { title: '框住你要练的那道题' });
      } finally {
        box.style.display = '';
      }
      if (picked === null) {          // 用户点了 ✕
        box.innerHTML = `<div class="card" style="text-align:center;color:var(--ink2)">已取消，重新选一张吧</div>`;
        return;
      }
      dataUrl = await Img.resizeDataURL(picked, MAX);
    }

    box.innerHTML = `<div class="card loading"><div class="spin"></div>
      <div class="step-line" id="ocrStep">正在识别文字…（首次需下载识别包，请稍候）</div></div>`;

    SFX.tap();
    const step = () => document.getElementById('ocrStep');
    const r = await recognizeImage(f, dataUrl, m => {
      if (m && m.status) {
        const pct = m.progress != null ? Math.round(m.progress * 100) : 0;
        const LABELS = {
          'loading language traineddata': '正在下载识别包',
          'initializing tesseract': '正在准备识别引擎',
          'recognizing text': '正在识别文字',
          'recognized': '识别完成'
        };
        const el = step();
        if (el) el.textContent = (LABELS[m.status] || m.status) + (pct ? `（${pct}%）` : '') + '…';
      }
    });

    let kp = null;
    const g = guessKp(r.text);
    if (g.kp && g.score >= 2) kp = g.kp;            // 置信够高才自动出题
    else if (r.kp && KP_MAP[r.kp]) kp = KP_MAP[r.kp];
    if (!kp) {                                      // 否则引导用户手动选，绝不随机抽
      const chosen = await pickKp(box, r.text);
      if (!chosen) {
        box.innerHTML = `<div class="card" style="text-align:center;color:var(--ink2)">已取消，回到数学首页重新拍一张吧</div>`;
        return;
      }
      kp = KP_MAP[chosen];
    }

    const s = newSession(kp.id, r.text, dataUrl);
    SFX.win();
    location.hash = '#/ma/s/' + s.id;
  }

  /* ---------------- 页面：练习 ---------------- */
  function practice(p) {
    const s = getSess(p[2]);
    if (!s) return `<div class="empty"><div class="e">🙈</div>练习不见了，重新拍一张吧</div>`;
    const done = s.done;
    return `
      <div class="page-head"><span class="back" data-go="#/ma/album">‹</span>
        <h2>${s.emoji} ${s.kpName}</h2></div>
      ${s.photo ? `<img src="${s.photo}" style="width:100%;max-height:220px;object-fit:cover;border-radius:18px;box-shadow:var(--shadow)">` : ''}
      <div class="card">
        <div style="font-weight:800">🔍 我认出的题目</div>
        <textarea id="ocrEdit" rows="3" placeholder="识别有偏差？在这里改一下文字…"
          style="width:100%;font-size:15px;line-height:1.6;padding:10px;border-radius:12px;border:1.5px solid #d9e2ec;resize:vertical;font-family:inherit;box-sizing:border-box;margin-top:6px">${UI.esc(s.ocr || '')}</textarea>
        <button class="chip small bg-b js-rematch" style="margin-top:8px">✏️ 按我改的文字重新判断知识点</button>
        <div style="margin-top:10px;font-size:15px;color:var(--ink2)">或者知识点不对？直接点正确的：</div>
        <div class="lesson-list" style="margin-top:6px">
          ${MATH_KP.map(k => `<span class="chip small ${k.id === s.kp ? 'b' : ''}" data-kp="${k.id}">${k.emoji} ${k.name}</span>`).join('')}
        </div>
      </div>

      <p class="big-title">同类型练习 ${s.qs.length} 题</p>
      <div id="qList">
        ${s.qs.map((q, i) => `
          <div class="q-card" data-i="${i}">
            <div><span class="q-num">${i + 1}</span><span class="q-text">${UI.esc(q.q)}</span></div>
            <div class="ans-row">
              <input inputmode="decimal" placeholder="填答案">
              ${q.unit ? `<span class="unit">${q.unit}</span>` : ''}
              <button class="btn bg-g js-check" style="min-height:52px;font-size:17px;padding:8px 16px">检查</button>
            </div>
            <div class="js-fb"></div>
          </div>`).join('')}
      </div>
      <button class="big-btn bg-p" id="bFinish"><span class="ico">🏁</span>
        <span>我做完啦，看成绩！</span></button>
      <div id="sumBox"></div>`;
  }

  /* ---------------- 页面：错题本（模拟云盘） ---------------- */
  function album() {
    const photos = DB.get('photos', []);
    if (!photos.length) {
      return `<div class="page-head"><span class="back" data-go="#/ma">‹</span><h2>我的错题本</h2></div>
        <div class="empty"><div class="e">📂</div>还没有错题照片<br>去拍第一张吧！</div>`;
    }
    return `
      <div class="page-head"><span class="back" data-go="#/ma">‹</span><h2>我的错题本</h2>
        <span class="spacer"></span><span class="chip small">${photos.length} 张</span></div>
      <p class="sub-title">按时间从新到旧排列</p>
      <div class="photo-grid">
        ${photos.map(p => `
          <div class="photo">
            <img src="${p.thumb}" alt="错题">
            <span class="del js-del" data-id="${p.id}">×</span>
            <div class="meta">${p.time}<br>${p.emoji || ''} ${UI.esc(p.kpName || '')}</div>
            <button class="redo js-redo" data-id="${p.id}">再做同类题</button>
          </div>`).join('')}
      </div>`;
  }

  return {
    render(p) {
      if (p[1] === 'album') return album();
      if (p[1] === 's') return practice(p);
      return home();
    },
    mount(p) {
      const view = document.getElementById('view');

      /* 首页：拍照 / 相册 */
      const cam = document.getElementById('bCam');
      const alb = document.getElementById('bAlbum');
      function makeInput(capture) {
        const i = document.createElement('input');
        i.type = 'file'; i.accept = 'image/*';
        if (capture) i.setAttribute('capture', 'environment');
        i.style.display = 'none';
        document.body.appendChild(i);
        i.addEventListener('change', () => { handleFiles(i.files, 'workBox'); i.remove(); });
        i.click();
      }
      if (cam) cam.onclick = () => makeInput(true);
      if (alb) alb.onclick = () => makeInput(false);

      /* 练习页：换知识点 */
      if (p[1] === 's') {
        const s = getSess(p[2]);
        if (!s) return;

        /* 识别有偏差：用户改几个字 → 重新判断知识点并重出同类题 */
        const rematch = UI.$('.js-rematch', view);
        if (rematch) rematch.onclick = () => {
          const ta = UI.$('#ocrEdit', view);
          const txt = (ta ? ta.value : '') || '';
          if (!txt.trim()) { UI.toast('先写点文字吧'); return; }
          const g = guessKp(txt.replace(/\s+/g, ''));
          s.ocr = txt;
          if (g.kp && g.score >= 2) {
            s.kp = g.kp.id; s.kpName = g.kp.name; s.emoji = g.kp.emoji; s.color = g.kp.color;
            s.qs = genQuestions(g.kp.id); s.done = false; s.got = 0;
            DB.set('sess_' + s.id, s);
            UI.toast('已按「' + g.kp.name + '」重新出题');
            location.reload();
          } else {
            DB.set('sess_' + s.id, s);
            UI.toast('还是没匹配到，下面点正确的知识点吧');
          }
        };

        UI.$$('[data-kp]', view).forEach(ch => ch.onclick = () => {
          const kp = KP_MAP[ch.getAttribute('data-kp')];
          if (!kp || !s) return;
          s.kp = kp.id; s.kpName = kp.name; s.emoji = kp.emoji; s.color = kp.color;
          s.qs = genQuestions(kp.id); s.done = false; s.got = 0;
          DB.set('sess_' + s.id, s);
          UI.toast('换成「' + kp.name + '」啦');
          location.reload();
        });

        /* 单题检查 */
        UI.$$('#qList .q-card', view).forEach(card => {
          const i = Number(card.getAttribute('data-i'));
          const q = s.qs[i];
          const input = UI.$('input', card);
          const btn = UI.$('.js-check', card);
          const fb = UI.$('.js-fb', card);
          const norm = t => String(t).trim().replace(/[，,\s]/g, '').replace(/。$/, '');
          function check() {
            const v = norm(input.value);
            if (!v) { UI.toast('先写一个答案吧'); return; }
            const ok = Math.abs(Number(v) - Number(q.a)) < 1e-6 || norm(q.a) === v;
            if (ok) {
              SFX.right();
              fb.innerHTML = `<div class="verdict ok">✅ 答对了！</div><div class="exp">${UI.esc(q.exp)}</div>`;
              input.style.borderColor = '#35C77E';
              btn.style.opacity = .4;
            } else {
              SFX.wrong();
              fb.innerHTML = `<div class="verdict no">❌ 再想想～</div>
                <button class="chip small js-showans" style="margin-top:8px">看正确答案和解析</button>`;
              UI.$('.js-showans', fb).onclick = () => {
                fb.innerHTML = `<div class="verdict no">正确答案：${UI.esc(q.a)}${q.unit || ''}</div>
                  <div class="exp">${UI.esc(q.exp)}</div>`;
              };
            }
          }
          btn.onclick = check;
          input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
        });

        /* 交卷 */
        const bf = document.getElementById('bFinish');
        if (bf) bf.onclick = () => {
          const cards = UI.$$('#qList .q-card', view);
          let right = 0;
          cards.forEach((card, i) => {
            const inp = UI.$('input', card);
            const fb = UI.$('.js-fb', card);
            const v = String(inp.value).trim().replace(/[，,\s]/g, '');
            const q = s.qs[i];
            const ok = v && (Math.abs(Number(v) - Number(q.a)) < 1e-6 || String(q.a).trim() === v);
            if (ok) right++;
            fb.innerHTML = `<div class="verdict ${ok ? 'ok' : 'no'}">${ok ? '✅ 正确（' + q.a + (q.unit || '') + '）' : '❌ 正确答案：' + q.a + (q.unit || '')}</div>
              <div class="exp">${UI.esc(q.exp)}</div>`;
          });
          const total = s.qs.length;
          const pct = Math.round(right / total * 100);
          let star = right >= total ? 10 : right >= total * .8 ? 8 : right >= total * .6 ? 5 : 2;
          let msg = right === total ? '太厉害啦，全对！🏆' : right >= total * .8 ? '很棒，只差一点点！💪' : '订正完就满分，加油！🌱';
          if (!s.done) {
            s.done = true; s.got = star; DB.set('sess_' + s.id, s);
            addPoints(star);
            if (right >= total * .8) FX.burst(70);
          } else {
            UI.toast('这份练习已经判过啦');
          }
          document.getElementById('sumBox').innerHTML = `
            <div class="card result">
              <div class="em">${right === total ? '🏆' : pct >= 60 ? '👍' : '🌱'}</div>
              <h2>${right} / ${total} 题正确</h2>
              <div class="sc">得分 ${pct} 分 · 获得 ⭐ ${star}</div>
              <div style="margin-top:10px;font-size:17px;color:var(--ink2)">${msg}</div>
              <div class="grid2" style="margin-top:14px">
                <a class="btn ghost" href="#/ma">再拍一道题</a>
                <a class="btn bg-b" href="#/ma/album">看错题本</a>
              </div>
            </div>`;
          SFX.win();
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };
      }

      /* 错题本：删除 / 再做同类题 */
      UI.$$('.js-del', view).forEach(b => b.onclick = () => {
        const id = b.getAttribute('data-id');
        if (!confirm('要删掉这张错题照片吗？')) return;
        let ph = DB.get('photos', []).filter(x => x.id !== id);
        DB.set('photos', ph);
        UI.toast('已经删掉啦');
        location.reload();
      });
      UI.$$('.js-redo', view).forEach(b => b.onclick = () => {
        const id = b.getAttribute('data-id');
        const old = getSess(id);
        const kpId = old ? old.kp : (DB.get('photos', []).find(x => x.id === id) || {}).kp || MATH_KP[0].id;
        const s = newSession(kpId, old ? old.ocr : '', '');
        SFX.tap();
        location.hash = '#/ma/s/' + s.id;
      });
    }
  };
})();
