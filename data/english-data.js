/* ============================================================
 *  英语教材数据 —— 人民教育出版社 义务教育教科书
 *  英语（三年级起点）四年级 上册 / 下册
 *
 *  结构：units[{ id:'U1', name:'Unit 1', topic:'…', words:[{en, zh}] }]
 *  ⚠️ 词条严格照抄课本 Appendix 1「单元词汇表」，不要凭印象改。
 *     （注：黑体词要求听、说、认读；白体词只作听、说要求。）
 *  维护：直接改 EN_BOOKS 即可，单元名、单词都可自由增删，
 *        拼写游戏会自动读取最新数据。
 * ============================================================ */
window.EN_BOOKS = [
  /* ==================== 四年级 上册 ==================== */
  {
    id: '4a', name: '四年级 上册', sub: '人教版（三年级起点）',
    units: [
      {
        id: 'U1', name: 'Unit 1', topic: 'My classroom 我的教室',
        words: [
          { en: 'classroom', zh: '教室' },
          { en: 'window', zh: '窗户' },
          { en: 'blackboard', zh: '黑板' },
          { en: 'light', zh: '电灯' },
          { en: 'picture', zh: '图画' },
          { en: 'door', zh: '门' },
          { en: "teacher's desk", zh: '讲台' },
          { en: 'computer', zh: '计算机' },
          { en: 'fan', zh: '风扇' },
          { en: 'wall', zh: '墙壁' },
          { en: 'floor', zh: '地板' },
          { en: 'really', zh: '（表示兴趣或惊讶）真的' },
          { en: 'near', zh: '距离近' },
          { en: 'TV', zh: '电视' },
          { en: 'clean', zh: '打扫' },
          { en: 'help', zh: '帮助' }
        ]
      },
      {
        id: 'U2', name: 'Unit 2', topic: 'My schoolbag 我的书包',
        words: [
          { en: 'schoolbag', zh: '书包' },
          { en: 'maths book', zh: '数学书' },
          { en: 'English book', zh: '英语书' },
          { en: 'Chinese book', zh: '语文书' },
          { en: 'storybook', zh: '故事书' },
          { en: 'candy', zh: '糖果' },
          { en: 'notebook', zh: '笔记本' },
          { en: 'toy', zh: '玩具' },
          { en: 'key', zh: '钥匙' },
          { en: 'wow', zh: '哇；呀' },
          { en: 'lost', zh: '丢失（lose 的过去式形式）' },
          { en: 'so much', zh: '非常地' },
          { en: 'cute', zh: '可爱的' }
        ]
      },
      {
        id: 'U3', name: 'Unit 3', topic: 'My friends 我的朋友',
        words: [
          { en: 'strong', zh: '强壮的' },
          { en: 'friendly', zh: '友好的' },
          { en: 'quiet', zh: '安静的' },
          { en: 'hair', zh: '头发' },
          { en: 'shoe', zh: '鞋' },
          { en: 'glasses', zh: '眼镜' },
          { en: 'his', zh: '他的' },
          { en: 'or', zh: '或者' },
          { en: 'right', zh: '正确的；对的' },
          { en: 'hat', zh: '（常指带檐的）帽子' },
          { en: 'her', zh: '她的' }
        ]
      },
      {
        id: 'U4', name: 'Unit 4', topic: 'My home 我的家',
        words: [
          { en: 'bedroom', zh: '卧室' },
          { en: 'living room', zh: '客厅；起居室' },
          { en: 'study', zh: '书房' },
          { en: 'kitchen', zh: '厨房' },
          { en: 'bathroom', zh: '浴室；洗手间' },
          { en: 'bed', zh: '床' },
          { en: 'phone', zh: '电话' },
          { en: 'table', zh: '桌子' },
          { en: 'sofa', zh: '长沙发' },
          { en: 'fridge', zh: '冰箱' },
          { en: 'find', zh: '找到' },
          { en: 'them', zh: '他（她、它）们' }
        ]
      },
      {
        id: 'U5', name: 'Unit 5', topic: "Dinner's ready 晚餐准备好了",
        words: [
          { en: 'beef', zh: '牛肉' },
          { en: 'chicken', zh: '鸡肉' },
          { en: 'noodles', zh: '面条' },
          { en: 'soup', zh: '汤' },
          { en: 'vegetable', zh: '蔬菜' },
          { en: 'chopsticks', zh: '筷子' },
          { en: 'bowl', zh: '碗' },
          { en: 'fork', zh: '餐叉' },
          { en: 'knife', zh: '刀' },
          { en: 'spoon', zh: '勺' },
          { en: 'dinner', zh: '（中午或晚上吃的）正餐' },
          { en: 'ready', zh: '准备好' },
          { en: 'help yourself', zh: '为（自己）取用' },
          { en: 'pass', zh: '给；递' },
          { en: 'try', zh: '试；尝试' }
        ]
      },
      {
        id: 'U6', name: 'Unit 6', topic: 'Meet my family! 认识我的家人',
        words: [
          { en: 'parents', zh: '父母' },
          { en: 'cousin', zh: '同辈表亲（或堂亲）' },
          { en: 'uncle', zh: '舅父；叔父；伯父；姑父；姨夫' },
          { en: 'aunt', zh: '姑母；姨母' },
          { en: 'baby brother', zh: '婴儿小弟弟' },
          { en: 'doctor', zh: '医生' },
          { en: 'cook', zh: '厨师' },
          { en: 'driver', zh: '司机' },
          { en: 'farmer', zh: '农民' },
          { en: 'nurse', zh: '护士' },
          { en: 'people', zh: '人们' },
          { en: 'but', zh: '但是' },
          { en: 'little', zh: '小的' },
          { en: 'puppy', zh: '小狗' },
          { en: 'football player', zh: '足球运动员' },
          { en: 'job', zh: '工作' },
          { en: 'basketball', zh: '篮球' }
        ]
      }
    ]
  },

  /* ==================== 四年级 下册 ==================== */
  {
    id: '4b', name: '四年级 下册', sub: '人教版（三年级起点）',
    units: [
      {
        id: 'U1', name: 'Unit 1', topic: 'My school 我的学校',
        words: [
          { en: 'first floor', zh: '一楼' },
          { en: 'second floor', zh: '二楼' },
          { en: "teachers' office", zh: '教师办公室' },
          { en: 'library', zh: '图书馆' },
          { en: 'playground', zh: '操场' },
          { en: 'computer room', zh: '计算机房' },
          { en: 'art room', zh: '美术教室' },
          { en: 'music room', zh: '音乐教室' },
          { en: 'next to', zh: '紧邻；在……近旁' },
          { en: 'homework', zh: '作业' },
          { en: 'class', zh: '班；班级' },
          { en: 'forty', zh: '四十' },
          { en: 'way', zh: '方向' }
        ]
      },
      {
        id: 'U2', name: 'Unit 2', topic: 'What time is it? 几点了？',
        words: [
          { en: 'breakfast', zh: '早餐；早饭' },
          { en: 'English class', zh: '英语课' },
          { en: 'lunch', zh: '午餐；午饭' },
          { en: 'music class', zh: '音乐课' },
          { en: 'PE class', zh: '体育课' },
          { en: 'dinner', zh: '（中午或晚上吃的）正餐' },
          { en: 'get up', zh: '起床' },
          { en: 'go to school', zh: '去上学' },
          { en: 'go home', zh: '回家' },
          { en: 'go to bed', zh: '上床睡觉' },
          { en: 'over', zh: '结束' },
          { en: 'now', zh: '现在；目前' },
          { en: "o'clock", zh: '（表示整点）……点钟' },
          { en: 'kid', zh: '小孩' },
          { en: 'thirty', zh: '三十' },
          { en: 'hurry up', zh: '快点' },
          { en: 'come on', zh: '快；加油' },
          { en: 'just a minute', zh: '稍等一会儿' }
        ]
      },
      {
        id: 'U3', name: 'Unit 3', topic: 'Weather 天气',
        words: [
          { en: 'cold', zh: '寒冷的；冷的' },
          { en: 'cool', zh: '凉的；凉爽的' },
          { en: 'warm', zh: '温暖的；暖和的' },
          { en: 'hot', zh: '热的；烫的' },
          { en: 'sunny', zh: '阳光充足的' },
          { en: 'windy', zh: '多风的；风大的' },
          { en: 'cloudy', zh: '阴天的；多云的' },
          { en: 'snowy', zh: '下雪（多）的' },
          { en: 'rainy', zh: '阴雨的；多雨的' },
          { en: 'outside', zh: '在户外' },
          { en: 'be careful', zh: '小心' },
          { en: 'weather', zh: '天气' },
          { en: 'New York', zh: '纽约' },
          { en: 'how about ...', zh: '……怎么样？……情况如何？' },
          { en: 'degree', zh: '度；度数' },
          { en: 'world', zh: '世界' },
          { en: 'London', zh: '伦敦' },
          { en: 'Moscow', zh: '莫斯科' },
          { en: 'Singapore', zh: '新加坡（市）' },
          { en: 'Sydney', zh: '悉尼' },
          { en: 'fly', zh: '放（风筝等）' },
          { en: 'love', zh: '（写信结尾的热情问候语）爱你的' }
        ]
      },
      {
        id: 'U4', name: 'Unit 4', topic: 'At the farm 在农场',
        words: [
          { en: 'tomato', zh: '西红柿' },
          { en: 'potato', zh: '马铃薯；土豆' },
          { en: 'green beans', zh: '豆角；四季豆' },
          { en: 'carrot', zh: '胡萝卜' },
          { en: 'horse', zh: '马' },
          { en: 'cow', zh: '母牛；奶牛' },
          { en: 'sheep', zh: '羊；绵羊' },
          { en: 'hen', zh: '母鸡' },
          { en: 'these', zh: '（this 的复数形式）这些' },
          { en: 'yum', zh: '（表示味道或气味非常好）' },
          { en: 'animal', zh: '兽；动物' },
          { en: 'those', zh: '（that 的复数形式）那些' },
          { en: 'garden', zh: '花园；菜园' },
          { en: 'farm', zh: '农场' },
          { en: 'goat', zh: '山羊' },
          { en: 'eat', zh: '吃' }
        ]
      },
      {
        id: 'U5', name: 'Unit 5', topic: 'My clothes 我的衣服',
        words: [
          { en: 'clothes', zh: '衣服；服装' },
          { en: 'pants', zh: '裤子' },
          { en: 'hat', zh: '（常指带檐的）帽子' },
          { en: 'dress', zh: '连衣裙' },
          { en: 'skirt', zh: '女裙' },
          { en: 'coat', zh: '外衣；大衣' },
          { en: 'sweater', zh: '毛衣' },
          { en: 'sock', zh: '短袜' },
          { en: 'shorts', zh: '短裤' },
          { en: 'jacket', zh: '夹克衫' },
          { en: 'shirt', zh: '（尤指男士）衬衫' },
          { en: 'yours', zh: '你的；你们的' },
          { en: 'whose', zh: '谁的' },
          { en: 'mine', zh: '我的' },
          { en: 'pack', zh: '收拾（行李）' },
          { en: 'wait', zh: '等待' }
        ]
      },
      {
        id: 'U6', name: 'Unit 6', topic: 'Shopping 购物',
        words: [
          { en: 'glove', zh: '（分手指的）手套' },
          { en: 'scarf', zh: '围巾；披巾' },
          { en: 'umbrella', zh: '伞；雨伞' },
          { en: 'sunglasses', zh: '太阳镜' },
          { en: 'pretty', zh: '美观的；精致的' },
          { en: 'expensive', zh: '昂贵的；花钱多的' },
          { en: 'cheap', zh: '花钱少的；便宜的' },
          { en: 'nice', zh: '好的' },
          { en: 'try on', zh: '试穿' },
          { en: 'size', zh: '尺码；号' },
          { en: 'of course', zh: '当然' },
          { en: 'too', zh: '太；过于' },
          { en: 'just', zh: '正好；恰好' },
          { en: 'how much', zh: '多少钱' },
          { en: 'eighty', zh: '八十' },
          { en: 'dollar', zh: '元（美国、加拿大等国的货币单位）' },
          { en: 'sale', zh: '特价销售；大减价' },
          { en: 'more', zh: '更多的' },
          { en: 'us', zh: '我们' }
        ]
      }
    ]
  }
];
