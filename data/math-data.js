/* ============================================================
 *  数学数据 —— 人教版四年级 上册 / 下册 知识点 + 自动出题引擎
 *
 *  每个知识点 = { id, name, book, keywords, emoji, color, gen(seedSeed) }
 *  gen() 每次都会生成一道「同类型的随机新题」，所以孩子刷不完。
 *  新增知识点：照着下面任意一条抄一遍即可。
 * ============================================================ */
(function () {
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  window.MATH_KP = [
    /* ================= 四年级上册 ================= */
    {
      id: 'bignum', name: '大数的认识', book: '4a', emoji: '🔢', color: '#FF8A3D',
      keywords: ['万', '亿', '读作', '写作', '数位', '近似数', '四舍五入', '大数'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const yi = R(1, 9), wan = R(0, 999), ge = R(0, 999);
          const num = yi * 1e8 + wan * 1e4 + ge;
          return {
            q: `一个数里有 ${yi} 个亿、${wan} 个万和 ${ge} 个一，这个数写作（　　）。`,
            a: String(num), unit: '',
            exp: `亿级写 ${yi}，万级写 ${String(wan).padStart(4, '0')}，个级写 ${String(ge).padStart(4, '0')}，
                  合起来是 ${num}。写数时哪一位上一个单位也没有，就在那一位上写 0。`
          };
        }
        const n = R(120000, 980000);
        const ans = Math.round(n / 10000);
        return {
          q: `把 ${n} 省略万位后面的尾数，约是（　　）万。`,
          a: String(ans), unit: '万',
          exp: `看千位上的数：千位是 ${String(n)[3]}，${Number(String(n)[3]) >= 5 ? '满 5 向前一位进 1' : '比 5 小，直接舍去'}，
                  所以约是 ${ans} 万。`
        };
      }
    },
    {
      id: 'area', name: '公顷和平方千米', book: '4a', emoji: '🌾', color: '#35C77E',
      keywords: ['公顷', '平方千米', '平方米', '面积单位', '换算'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const k = R(2, 20) / 2;
          return {
            q: `${k} 平方千米 = （　　）公顷`,
            a: String(k * 100), unit: '公顷',
            exp: `1 平方千米 = 100 公顷，${k} × 100 = ${k * 100} 公顷。`
          };
        }
        const h = R(3, 60);
        return {
          q: `${h * 10000} 平方米 = （　　）公顷`,
          a: String(h), unit: '公顷',
          exp: `1 公顷 = 10000 平方米，${h * 10000} ÷ 10000 = ${h} 公顷。`
        };
      }
    },
    {
      id: 'angle', name: '角的度量', book: '4a', emoji: '📐', color: '#3D8BFF',
      keywords: ['角', '直角', '平角', '周角', '度', '量角器', '钟面'],
      gen() {
        const t = R(0, 2);
        if (t === 0) {
          const a = R(20, 150);
          return {
            q: `∠1 和 ∠2 正好拼成一个平角，∠1 = ${a}°，∠2 = （　　）°。`,
            a: String(180 - a), unit: '°',
            exp: `平角是 180°，180 - ${a} = ${180 - a}°。`
          };
        }
        if (t === 1) {
          const x = R(5, 80);
          return {
            q: `一个角比直角大 ${x}°，这个角的度数是（　　）°，它是钝角。`,
            a: String(90 + x), unit: '°',
            exp: `直角 = 90°，90 + ${x} = ${90 + x}°。`
          };
        }
        const h = R(1, 6);
        return {
          q: `钟面上 ${h} 时整，时针和分针之间的夹角是（　　）°。`,
          a: String(h * 30), unit: '°',
          exp: `钟面一圈 360°，平均分成 12 大格，每格 30°。${h} 时整时针与分针相隔 ${h} 格，${h} × 30 = ${h * 30}°。`
        };
      }
    },
    {
      id: 'mul', name: '三位数乘两位数', book: '4a', emoji: '✖️', color: '#A66BFF',
      keywords: ['乘法', '三位数', '两位数', '竖式', '积'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const a = R(102, 980), b = R(12, 89);
          return {
            q: `${a} × ${b} = （　　）`,
            a: String(a * b), unit: '',
            exp: `先用 ${b} 个位上的 ${b % 10} 去乘 ${a}，再用十位上的 ${Math.floor(b / 10)} 去乘 ${a}
                  （末位对齐十位），最后把两次的积相加，结果是 ${a * b}。`
          };
        }
        const a = R(12, 45), b = R(3, 9), k = pick([10, 100]);
        return {
          q: `已知 ${a} × ${b} = ${a * b}，那么 ${a} × ${b * k} = （　　）。`,
          a: String(a * b * k), unit: '',
          exp: `一个因数不变，另一个因数乘 ${k}，积也跟着乘 ${k}：${a * b} × ${k} = ${a * b * k}。`
        };
      }
    },
    {
      id: 'para', name: '平行四边形和梯形', book: '4a', emoji: '🔷', color: '#00BCD4',
      keywords: ['平行四边形', '梯形', '高', '底', '周长', '对边'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const a = R(4, 20), b = R(3, 18);
          return {
            q: `一个平行四边形相邻的两条边分别是 ${a} cm 和 ${b} cm，它的周长是（　　）cm。`,
            a: String(2 * (a + b)), unit: 'cm',
            exp: `平行四边形对边相等，周长 = (${a} + ${b}) × 2 = ${2 * (a + b)} cm。`
          };
        }
        const up = R(3, 15), down = R(16, 30), leg = R(4, 12);
        return {
          q: `一个等腰梯形的上底 ${up} cm，下底 ${down} cm，一条腰 ${leg} cm，它的周长是（　　）cm。`,
          a: String(up + down + 2 * leg), unit: 'cm',
          exp: `等腰梯形两腰相等，周长 = 上底 + 下底 + 腰 × 2 = ${up} + ${down} + ${leg} × 2 = ${up + down + 2 * leg} cm。`
        };
      }
    },
    {
      id: 'div', name: '除数是两位数的除法', book: '4a', emoji: '➗', color: '#FF6B9D',
      keywords: ['除法', '除数是两位数', '商', '试商', '余数'],
      gen() {
        const d = R(12, 45), q = R(3, 40);
        return {
          q: `${d * q} ÷ ${d} = （　　）`,
          a: String(q), unit: '',
          exp: `把 ${d} 看作 ${Math.round(d / 10) * 10} 来试商：${d} × ${q} = ${d * q}，所以商是 ${q}。`
        };
      }
    },
    {
      id: 'chart', name: '条形统计图', book: '4a', emoji: '📊', color: '#FFC93D',
      keywords: ['条形统计图', '统计图', '一格', '人数', '统计'],
      gen() {
        const k = pick([2, 5, 10]), n1 = R(3, 12), n2 = R(1, n1 - 1);
        const t = R(0, 1);
        if (t === 0) {
          return {
            q: `条形统计图中 1 格表示 ${k} 人，喜欢足球的画了 ${n1} 格，喜欢足球的有（　　）人。`,
            a: String(k * n1), unit: '人',
            exp: `每格 ${k} 人，${n1} 格就是 ${k} × ${n1} = ${k * n1} 人。`
          };
        }
        return {
          q: `条形统计图中 1 格表示 ${k} 人，喜欢足球的 ${n1} 格，喜欢篮球的 ${n2} 格，喜欢足球的比喜欢篮球的多（　　）人。`,
          a: String(k * (n1 - n2)), unit: '人',
          exp: `相差 ${n1 - n2} 格，每格 ${k} 人，${n1 - n2} × ${k} = ${k * (n1 - n2)} 人。`
        };
      }
    },
    {
      id: 'optimize', name: '数学广角——优化', book: '4a', emoji: '🍳', color: '#FF7043',
      keywords: ['优化', '烙饼', '沏茶', '等候', '最少', '合理安排'],
      gen() {
        const x = pick([2, 3]), n = R(x + 1, 9), t = R(2, 5);
        const batches = Math.ceil((2 * n) / x);
        return {
          q: `一口锅每次最多只能烙 ${x} 张饼，一张饼两面都要烙，每面需要 ${t} 分钟。烙 ${n} 张饼最少要（　　）分钟。`,
          a: String(batches * t), unit: '分钟',
          exp: `一共要烙 ${2 * n} 个面，锅里每次能烙 ${x} 个面，需要 ${batches} 次，
                  ${batches} × ${t} = ${batches * t} 分钟。注意别让锅空着！`
        };
      }
    },

    /* ================= 四年级下册 ================= */
    {
      id: 'four', name: '四则运算', book: '4b', emoji: '🧮', color: '#3D8BFF',
      keywords: ['四则运算', '括号', '先算', '加减乘除', '运算顺序'],
      gen() {
        const r = R(3, 9), k = R(3, 25), sum = r * k, p = R(2, sum - 2), q = sum - p;
        return {
          q: `(${p} + ${q}) ÷ ${r} = （　　）`,
          a: String(k), unit: '',
          exp: `有括号要先算括号里的：${p} + ${q} = ${sum}，再算 ${sum} ÷ ${r} = ${k}。`
        };
      }
    },
    {
      id: 'law', name: '运算定律', book: '4b', emoji: '🎯', color: '#A66BFF',
      keywords: ['运算定律', '分配律', '结合律', '交换律', '简便计算'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const a = R(3, 25), b = pick([20, 30, 40, 50, 60]), c = R(2, 9);
          return {
            q: `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × （　　）`,
            a: String(c), unit: '',
            exp: `乘法分配律：a × (b + c) = a × b + a × c，括号里第二个数是 ${c}。`
          };
        }
        const a = R(20, 90), b = R(10, 60), c = 100 - (b % 10) - 0;
        return {
          q: `(${a} + ${b}) + ${100 - b} = ${a} + (${b} + （　　）)`,
          a: String(100 - b), unit: '',
          exp: `加法结合律：(a + b) + c = a + (b + c)，所以括号里是 ${100 - b}。
                  这样凑成 ${b} + ${100 - b} = 100，计算更简便。`
        };
      }
    },
    {
      id: 'decimal', name: '小数的意义和性质', book: '4b', emoji: '🔟', color: '#00BCD4',
      keywords: ['小数', '计数单位', '小数点', '扩大', '缩小', '单位换算'],
      gen() {
        const t = R(0, 2);
        if (t === 0) {
          const n = R(11, 99);
          const x = (n / 10).toFixed(1);
          return {
            q: `${x} 里面有（　　）个 0.1。`,
            a: String(n), unit: '个',
            exp: `0.1 是十分之一，${x} = ${n} × 0.1，所以有 ${n} 个 0.1。`
          };
        }
        if (t === 1) {
          const m = (R(101, 999) / 100).toFixed(2);
          return {
            q: `${m} 米 = （　　）厘米`,
            a: String(Math.round(Number(m) * 100)), unit: '厘米',
            exp: `1 米 = 100 厘米，${m} × 100 = ${Math.round(Number(m) * 100)} 厘米。`
          };
        }
        const v = (R(2, 95) / 10).toFixed(1);
        const k = pick([10, 100]);
        return {
          q: `把 ${v} 扩大到原来的 ${k} 倍是（　　）。`,
          a: String(Number(v) * k), unit: '',
          exp: `扩大 ${k} 倍就是小数点向右移动 ${k === 10 ? '一' : '两'}位：${Number(v) * k}。`
        };
      }
    },
    {
      id: 'triangle', name: '三角形', book: '4b', emoji: '🔺', color: '#FF6B9D',
      keywords: ['三角形', '内角和', '等腰', '底角', '顶角', '边'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const a = R(20, 90), b = R(20, 170 - a - 10);
          return {
            q: `一个三角形中，两个角分别是 ${a}° 和 ${b}°，第三个角是（　　）°。`,
            a: String(180 - a - b), unit: '°',
            exp: `三角形内角和是 180°，180 - ${a} - ${b} = ${180 - a - b}°。`
          };
        }
        const top = pick([20, 30, 40, 50, 60, 80, 100, 120]);
        return {
          q: `等腰三角形的顶角是 ${top}°，它的一个底角是（　　）°。`,
          a: String((180 - top) / 2), unit: '°',
          exp: `两个底角相等：(180 - ${top}) ÷ 2 = ${(180 - top) / 2}°。`
        };
      }
    },
    {
      id: 'decadd', name: '小数的加法和减法', book: '4b', emoji: '➕', color: '#35C77E',
      keywords: ['小数加法', '小数减法', '小数点对齐', '进位', '退位'],
      gen() {
        const t = R(0, 1);
        const a = R(12, 95) / 10, b = R(5, 88) / 10;
        if (t === 0) {
          return {
            q: `${a.toFixed(1)} + ${b.toFixed(1)} = （　　）`,
            a: (a + b).toFixed(1), unit: '',
            exp: `小数点对齐再加减：${a.toFixed(1)} + ${b.toFixed(1)} = ${(a + b).toFixed(1)}。`
          };
        }
        const big = Math.max(a, b), small = Math.min(a, b);
        return {
          q: `${big.toFixed(1)} - ${small.toFixed(1)} = （　　）`,
          a: (big - small).toFixed(1), unit: '',
          exp: `小数点对齐，${big.toFixed(1)} - ${small.toFixed(1)} = ${(big - small).toFixed(1)}。`
        };
      }
    },
    {
      id: 'move', name: '图形的运动', book: '4b', emoji: '🧩', color: '#FFC93D',
      keywords: ['平移', '旋转', '格', '距离', '方向'],
      gen() {
        const t = R(0, 1);
        if (t === 0) {
          const a = R(2, 9), b = R(2, 9);
          return {
            q: `一个图形先向右平移 ${a} 格，再向右平移 ${b} 格，一共向右平移了（　　）格。`,
            a: String(a + b), unit: '格',
            exp: `同方向平移可以直接相加：${a} + ${b} = ${a + b} 格。`
          };
        }
        const col = R(1, 8), step = R(1, 6);
        return {
          q: `点 A 在第 ${col} 列第 5 行，向右平移 ${step} 格后，在第（　　）列。`,
          a: String(col + step), unit: '列',
          exp: `向右平移列数增加：${col} + ${step} = ${col + step}，行数不变。`
        };
      }
    },
    {
      id: 'avg', name: '平均数', book: '4b', emoji: '⚖️', color: '#FF8A3D',
      keywords: ['平均数', '平均', '总数', '除以'],
      gen() {
        const n = pick([3, 4]);
        const avg = R(8, 40);
        const d = [];
        let s = 0;
        for (let i = 0; i < n - 1; i++) { const v = R(-5, 5); d.push(v); s += v; }
        d.push(-s);
        const arr = d.map(x => avg + x);
        if (Math.min(...arr) < 0) {          // 极端情况兜底，重来一次
          return window.KP_MAP.avg.gen();
        }
        return {
          q: `${arr.join('、')} 这 ${n} 个数的平均数是（　　）。`,
          a: String(avg), unit: '',
          exp: `先求总和 ${arr.join(' + ')} = ${avg * n}，再除以 ${n}：${avg * n} ÷ ${n} = ${avg}。`
        };
      }
    },
    {
      id: 'chicken', name: '鸡兔同笼', book: '4b', emoji: '🐰', color: '#26A69A',
      keywords: ['鸡兔同笼', '假设法', '头', '脚', '腿'],
      gen() {
        const rab = R(3, 15), chi = R(3, 20);
        const heads = rab + chi, legs = rab * 4 + chi * 2;
        const t = R(0, 1);
        if (t === 0) {
          return {
            q: `鸡兔同笼，共有 ${heads} 个头，${legs} 只脚。兔子有（　　）只。`,
            a: String(rab), unit: '只',
            exp: `假设全是鸡，脚应有 ${heads * 2} 只，比实际少 ${legs - heads * 2} 只；
                  每把 1 只鸡换成兔多 2 只脚，${legs - heads * 2} ÷ 2 = ${rab} 只兔。`
          };
        }
        return {
          q: `鸡兔同笼，共有 ${heads} 个头，${legs} 只脚。鸡有（　　）只。`,
          a: String(chi), unit: '只',
          exp: `兔子有 ${rab} 只（用假设法算出），鸡 = ${heads} - ${rab} = ${chi} 只。`
        };
      }
    }
  ];

  /* 知识点字典 */
  window.KP_MAP = {};
  window.MATH_KP.forEach(k => { window.KP_MAP[k.id] = k; });

  /* 本地模拟 OCR：没有网络也能跑通完整流程。
     接真实 OCR 时，替换 js/math.js 里的 recognizeImage() 即可。 */
  window.MOCK_OCR = [
    { text: `一个数的万位上是 3，千位上是 8，其余各位都是 0，这个数读作什么？省略万位后面的尾数约是多少万？`, kp: 'bignum' },
    { text: `一块长方形的麦田长 400 米，宽 250 米，这块麦田的面积是多少公顷？`, kp: 'area' },
    { text: `如图，∠1 = 55°，∠1 和 ∠2 组成一个直角，求 ∠2 的度数。`, kp: 'angle' },
    { text: `学校买了 126 本《西游记》，每本 24 元，一共花了多少元？`, kp: 'mul' },
    { text: `一个平行四边形的两条邻边分别是 9 厘米和 6 厘米，它的周长是多少厘米？`, kp: 'para' },
    { text: `四年级 3 个班共捐书 576 本，平均每班捐书多少本？`, kp: 'div' },
    { text: `下面是四年级同学最喜欢的水果统计图，一格表示 5 人，喜欢苹果的有 7 格，喜欢苹果的有多少人？`, kp: 'chart' },
    { text: `一口锅每次只能烙 2 张饼，两面都要烙，每面 3 分钟，烙 3 张饼最少需要几分钟？`, kp: 'optimize' },
    { text: `四年级同学去春游，男生 128 人，女生 112 人，每 40 人坐一辆车，需要多少辆车？`, kp: 'four' },
    { text: `用简便方法计算：25 × (40 + 4) = ？`, kp: 'law' },
    { text: `把 3.05 米改写成用厘米作单位的数是多少？`, kp: 'decimal' },
    { text: `一个等腰三角形的顶角是 80°，它的一个底角是多少度？`, kp: 'triangle' },
    { text: `小明买文具用去 12.5 元，买图书用去 8.8 元，一共花了多少元？`, kp: 'decadd' },
    { text: `把一个图形先向右平移 4 格，再向下平移 3 格，它一共向哪个方向移动了？`, kp: 'move' },
    { text: `小明四次数学测验的成绩分别是 92、88、95、93 分，他的平均分是多少？`, kp: 'avg' },
    { text: `笼子里有鸡和兔共 12 只，共有 34 只脚，鸡和兔各有多少只？`, kp: 'chicken' }
  ];
})();
