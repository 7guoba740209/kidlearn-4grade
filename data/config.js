/* ============================================================
 *  全局配置 —— 家长/老师只需要改这一个文件
 * ============================================================
 *  【1】语文朗读视频（免登录内嵌播放）
 *      点「听朗读」会在页面里直接弹出播放器播放，
 *      不跳抖音网页、不用登录账号。
 *      用的是抖音官方嵌入播放器：https://open.douyin.com/player/video?vid=视频ID
 *      （抖音开放平台官方接口，无需申请权限，公开视频免登录即可播放）
 *
 *      CN_LINKS 键名规则：册id-课文编号，如 "4a-3" = 四年级上册第3课
 *      值支持三种写法，随便挑一种：
 *        A. 只填视频ID（最省事）：        '4a-1': '7357934509125389631'
 *        B. 填抖音完整链接（自动提取ID）：'4a-1': 'https://www.douyin.com/video/7357934509125389631'
 *        C. 精细写法：                    '4a-1': { vid: '7357934509125389631', tip: '王老师朗读' }
 *
 *      视频ID怎么拿？把抖音视频的分享链接粘到电脑浏览器打开，
 *      地址栏 https://www.douyin.com/video/ 后面那一长串数字就是。
 *
 *      没填的课：播放器会自动改用「本机朗读」把课文读出来（离线、免登录），
 *      并同时给一个「去抖音搜一搜」的按钮。
 *
 *  【2】是否需要真 OCR
 *      MATH_OCR 留 false = 本地模拟识别（离线可用）
 *      接阿里云/百度 OCR 时，把请求写在 js/math.js 的 recognizeImage() 里
 * ============================================================ */
window.APP_CONFIG = {
  name: '四年级学习小屋',
  grade: '四年级',

  /* ---------- 语文：朗读视频（按课文录入，可以留空） ---------- */
  CN_LINKS: {
    // '4a-1': 'https://www.douyin.com/video/7357934509125389631',   // 四上《观潮》
    // '4a-2': '7357934509125389631',                                // 四上《走月亮》（只填ID也行）
    // '4b-1': { vid: '7357934509125389631', tip: '古诗词三首·范读' }, // 四下《古诗词三首》
  },

  /* ---------- 语文：播放器行为 ---------- */
  CN_PLAY: {
    AUTOPLAY: true,        // 弹出播放器后自动开始播放
    AUTO_TTS: true,        // 没录视频的课，自动用本机朗读兜底（免登录、离线可用）
    TTS_RATE: 0.95,        // 本机朗读语速（0.5 慢 ~ 1 快）；0.85 偏慢会显得拖沓"逐字"
    TTS_PITCH: 1.05,       // 本机朗读音调
    STEP_GAP: 280,         // 句与句之间的停顿(毫秒)，给朗读一点呼吸感，避免一字一顿
    SHOW_DOUYIN_BTN: true, // 播放器底部是否显示「在抖音里看」按钮

    /* —— 在线朗读"有感情"通道（可选，默认关闭）——
     * 浏览器自带语音和百度免费接口都没有"感情/韵律"，读起来像念字。
     * 真正有感情要用微软 Edge 神经语音（晓晓/云希）。它因浏览器限制无法直连，
     * 需经一个免费代理（Cloudflare Worker，见 _edge_worker.js 与 _edge_guide.html）。
     * 部署好 Worker 后，把它的地址填到下面 EDGE_URL，在线朗读就会自动改用它：
     *   EDGE_URL:  'https://你的worker子域.workers.dev/api/tts',
     *   EDGE_VOICE:'zh-CN-XiaoxiaoNeural',   // 晓晓(女,活泼) / zh-CN-YunxiNeural(云希,男,稳重)
     * 留空则继续用百度兜底（机械但能用）。两个字段要一起填。 */
    EDGE_URL: '',
    EDGE_VOICE: 'zh-CN-XiaoxiaoNeural'
  },

  /* ---------- 数学 ----------
   * 拍照识别默认用内置的纯前端 OCR（Tesseract.js，见 index.html 引入的 CDN，
   * 无需后端/密钥，首次会下载中文包约 10MB 并缓存在本机）。
   * 若你想接自己的商业 OCR（百度/腾讯云等），把识别逻辑写在 js/math.js 的
   * window.MyOCR 里，并把下面这个值设为 true 即可走你的接口。
   * 既没有 Tesseract 又没接 MyOCR 时，会改为让用户手动选知识点（不再随机抽）。 */
  MATH_OCR: false,        // true = 使用 window.MyOCR 自定义接口；false = 用内置 Tesseract（若已加载）
  MATH_MAX_PHOTO: 800,    // 存云盘的照片最长边像素（越小越省空间）
  MATH_PRACTICE_N: 5,     // 每次自动生成几道针对性练习题
  MATH_CROP: true,        // true = 拍完先框住"这一道题"再识别；false = 直接识别整张

  /* ---------- 英语 ---------- */
  EN_SPEAK_RATE: 0.75,    // 朗读语速（0.1~1，越小越慢）
  EN_TIMED_SECONDS: 60,   // 限时闯关时长
  EN_LEVELS: [
    { name: '字母新星', min: 0 },
    { name: '拼写小能手', min: 60 },
    { name: '单词达人', min: 150 },
    { name: '词汇高手', min: 300 },
    { name: '英语小状元', min: 600 }
  ],

  /* ---------- 多账号 / 云端同步 ----------
   *  enabled: 是否开启登录（默认 true）。设 false 退回单用户旧模式。
   *  adminInit: 内置管理员账号（账号表被清空也能自愈，会自动补回）。
   *  cloud: 云端同步。留空 = 纯本机（离线可用，换设备需重注册）。
   *         想要「手机/平板/电脑进度一致」才填下面这个——
   *         去 supabase.com 建个免费项目，把 Project URL 和 anon public key 粘进来，
   *         并在 SQL 编辑器里跑 data/supabase_schema.sql 建两张表即可。
   *         注意：纯前端没有服务器，密码只做「防误操作」级别，不是银行级安全。 */
  ACCOUNTS: {
    enabled: true,
    adminInit: { name: 'admin', pwd: '123456', nick: '管理员' },
    cloud: null
    // cloud: { supabase: { url: 'https://xxxx.supabase.co', key: 'eyJhbG...anon...' } }
  }
};
