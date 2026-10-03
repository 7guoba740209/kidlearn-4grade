/* ============================================================
 *  英语教材数据 —— 外语教学与研究出版社（外研版）
 *  义务教育教科书 英语 四年级 上、下册（2025 年 6 月第 1 版）
 *
 *  结构：EN_BOOKS[ { id:'4a'/'4b', name, sub, units:[ { id:'U1', name, topic, words:[{en,zh}] } ] } ]
 *  来源：国家中小学智慧教育平台 PDF「Words and expressions」
 *        人工照录。课本为图片版，词条按 Unit 分组。
 *  维护：直接改 EN_BOOKS 即可，单元名、单词都可自由增删，
 *        拼写游戏会自动读取最新数据。
 * ============================================================ */
window.EN_BOOKS = [
  /* ==================== 四年级 上册 ==================== */
  {
    id: '4a', name: '四年级 上册', sub: '外研版（2025）',
    units: [
      {
        id: 'U1', name: 'Unit 1', topic: 'I love sports 我喜欢运动',
        words: [
          { en: 'sport', zh: '体育运动' },
          { en: 'jump', zh: '跳' },
          { en: 'high', zh: '高高得' },
          { en: 'far', zh: '远' },
          { en: 'ping-pong', zh: '乒乓球运动' },
          { en: 'volleyball', zh: '排球（运动）' },
          { en: 'across', zh: '从一边到另一边；穿过，越过' },
          { en: 'hope', zh: '希望' },
          { en: 'lose', zh: '失去' },
          { en: 'because', zh: '因为' },
          { en: 'because of sb / sth', zh: '因为某人 / 某事物' },
          { en: 'cancer', zh: '癌（症）' },
          { en: 'money', zh: '钱' },
          { en: 'hard', zh: '困难的' },
          { en: 'kind', zh: '亲切的；友好的；善良的' },
          { en: 'keep', zh: '持续；继续' },
          { en: 'month', zh: '一个月' },
          { en: 'ill', zh: '生病的' },
          { en: 'year', zh: '年；年度' },
          { en: 'remember', zh: '纪念；记住' },
          { en: 'fail', zh: '失败' },
          { en: 'give', zh: '给予' },
          { en: 'give up', zh: '放弃' },
          { en: 'never', zh: '决不，永不' },
          { en: 'try', zh: '努力；尝试' },
          { en: 'try your best', zh: '尽最大努力' },
          { en: 'star', zh: '明星，最出色者' },
          { en: 'ability', zh: '才能；能力' },
          { en: 'player', zh: '运动员，选手，球员' }
        ]
      },
      {
        id: 'U2', name: 'Unit 2', topic: 'Helping at home 帮忙做家务',
        words: [
          { en: 'phew', zh: '啊，唷，唉' },
          { en: 'wash', zh: '洗' },
          { en: 'dish', zh: '盘子，碟子' },
          { en: 'feed', zh: '喂养，给……食物' },
          { en: 'sweep', zh: '扫，打扫，清扫' },
          { en: 'floor', zh: '地板，地面' },
          { en: 'rubbish', zh: '垃圾' },
          { en: 'chore', zh: '家庭杂务' },
          { en: 'to-do list', zh: '待办清单' },
          { en: 'may', zh: '可以（表示允许某人做某事）' },
          { en: 'outside', zh: '在室外，在外面' },
          { en: 'tidy', zh: '整理，收拾' },
          { en: 'easy', zh: '容易的' },
          { en: 'clean', zh: '（把……）弄干净，（使）清洁' },
          { en: 'woof', zh: '汪汪（形容狗吠声）' },
          { en: 'job', zh: '任务，事情' },
          { en: 'Good job!', zh: '干得好！真不错！' },
          { en: 'dirty', zh: '脏的' },
          { en: 'desk', zh: '书桌，写字台' },
          { en: 'wall', zh: '墙' },
          { en: 'again', zh: '又，再一次' },
          { en: 'also', zh: '除此之外，还' },
          { en: 'sunshine', zh: '阳光' },
          { en: 'sometimes', zh: '有时' },
          { en: 'feel', zh: '感受到，觉得' },
          { en: 'tired', zh: '疲惫的，累的' },
          { en: 'helpful', zh: '乐于助人的' },
          { en: 'warm', zh: '（使）温暖起来' },
          { en: 'warm up', zh: '（使）变暖' },
          { en: 'water', zh: '给……浇水' },
          { en: 'yard', zh: '庭院' },
          { en: 'helper', zh: '帮手；助手' },
          { en: 'pick', zh: '采，摘' },
          { en: 'pig', zh: '猪' },
          { en: 'cow', zh: '奶牛' },
          { en: 'cut', zh: '修剪' },
          { en: 'grass', zh: '草地；草，青草' }
        ]
      },
      {
        id: 'U3', name: 'Unit 3', topic: "What's the weather like? 天气怎么样？",
        words: [
          { en: 'weather', zh: '天气' },
          { en: 'sunny', zh: '阳光充足的' },
          { en: 'cloud', zh: '云' },
          { en: 'by', zh: '经过' },
          { en: 'cloudy', zh: '多云的，阴天的' },
          { en: 'wind', zh: '风' },
          { en: 'blow', zh: '吹，刮' },
          { en: 'windy', zh: '风大的；多风的' },
          { en: 'rain', zh: '雨' },
          { en: 'rainy', zh: '多雨的' },
          { en: 'snow', zh: '雪' },
          { en: 'any', zh: '任何一个' }
        ]
      },
      {
        id: 'U4', name: 'Unit 4', topic: 'Wonderful seasons 美妙的季节',
        words: [
          { en: 'cold', zh: '冷的，寒冷的' },
          { en: 'or', zh: '或者' },
          { en: 'enjoy', zh: '享受……的乐趣' },
          { en: 'diary', zh: '日记' },
          { en: 'teacher', zh: '教师，老师' },
          { en: 'taste', zh: '有……的味道' },
          { en: 'ice cream', zh: '冰激凌，雪糕' },
          { en: 'real', zh: '真的，真正的' },
          { en: 'later', zh: '之后' },
          { en: 'coat', zh: '外套' },
          { en: 'turn', zh: '转身；转动' },
          { en: 'turn on', zh: '打开' },
          { en: 'TV', zh: '电视' },
          { en: 'report', zh: '报道' },
          { en: 'fly', zh: '放飞' },
          { en: 'snowstorm', zh: '雪暴，暴风雪' },
          { en: 'beach', zh: '海滩，沙滩' },
          { en: 'sea', zh: '海，海洋' },
          { en: 'equator', zh: '赤道' },
          { en: 'round', zh: '循环地，周而复始地' },
          { en: 'all year round', zh: '全年' },
          { en: 'quite', zh: '非常，十分' },
          { en: 'join', zh: '参与，加入' }
        ]
      },
      {
        id: 'U5', name: 'Unit 5', topic: "Let's go! 我们走吧！",
        words: [
          { en: 'bus', zh: '公交车，公共汽车' },
          { en: 'car', zh: '汽车' },
          { en: 'train', zh: '火车，列车' },
          { en: 'city', zh: '城市' },
          { en: 'town', zh: '镇，城镇' },
          { en: 'ship', zh: '大船' },
          { en: 'plane', zh: '飞机' },
          { en: 'sky', zh: '天，天空' },
          { en: 'place', zh: '地方，地点' },
          { en: 'near', zh: '（距离）近的' },
          { en: 'travel', zh: '旅行' },
          { en: 'way', zh: '方式' },
          { en: 'picnic', zh: '野餐' },
          { en: 'minute', zh: '分钟' },
          { en: 'wear', zh: '穿；戴' },
          { en: 'live', zh: '住，居住' },
          { en: 'away', zh: '离开，相距' },
          { en: 'truck', zh: '货车，卡车' },
          { en: 'bamboo', zh: '竹，竹子' },
          { en: 'bike', zh: '自行车' },
          { en: 'ring', zh: '（钟、铃）鸣响' },
          { en: 'beep', zh: '（使）（汽车喇叭）鸣响' },
          { en: 'subway', zh: '地铁' },
          { en: 'whoosh', zh: '（呼呼地）飞快移动' },
          { en: 'tram', zh: '有轨电车' },
          { en: 'chug', zh: '（汽车、火车等）突突地缓慢前进' }
        ]
      },
      {
        id: 'U6', name: 'Unit 6', topic: 'Find your way 找到路',
        words: [
          { en: 'wheel', zh: '车轮' },
          { en: 'left', zh: '向左，朝左' },
          { en: 'straight', zh: '笔直地' },
          { en: 'library', zh: '图书室；图书馆' },
          { en: 'centre', zh: '中心' },
          { en: 'cinema', zh: '电影院' },
          { en: 'hospital', zh: '医院' },
          { en: 'supermarket', zh: '超市' },
          { en: 'museum', zh: '博物馆，博物院' },
          { en: 'tomorrow', zh: '（在）明天' },
          { en: 'woman', zh: '成年女子，妇女' },
          { en: 'wish', zh: '愿望' },
          { en: 'step', zh: '步；一步（的距离）' },
          { en: 'own', zh: '自己的' },
          { en: "on one's own", zh: '独立地' },
          { en: 'cross', zh: '横穿' },
          { en: 'careful', zh: '谨慎的' },
          { en: 'be careful', zh: '当心，小心' },
          { en: 'underground', zh: '在地（面）下' }
        ]
      }
    ]
  },

  /* ==================== 四年级 下册 ==================== */
  {
    id: '4b', name: '四年级 下册', sub: '外研版（2025）',
    units: [
      {
        id: 'U1', name: 'Unit 1', topic: 'People at work 工作中的人',
        words: [
          { en: 'doctor', zh: '医生，大夫' },
          { en: 'fireman', zh: '消防队员' },
          { en: 'farmer', zh: '农民；农场主；养殖场主' },
          { en: 'cook', zh: '厨师，炊事员' },
          { en: 'police', zh: '警察' },
          { en: 'police officer', zh: '警察，警官' },
          { en: 'station', zh: '所；站；台；局' },
          { en: 'police station', zh: '警察（分）局，派出所' },
          { en: 'often', zh: '经常，时常，多次' },
          { en: 'field', zh: '田地，田野' },
          { en: 'painter', zh: '画家' },
          { en: 'use', zh: '用，使用' },
          { en: 'brush', zh: '刷子；毛刷' },
          { en: 'scientist', zh: '科学家' },
          { en: 'writer', zh: '作家；作者' },
          { en: 'worker', zh: '工人' },
          { en: 'aunt', zh: '姑母；姨母' },
          { en: 'night', zh: '夜晚，夜间' },
          { en: 'owl', zh: '猫头鹰' },
          { en: 'night owl', zh: '夜猫子，喜欢熬夜的人' },
          { en: 'driver', zh: '司机，驾驶员' },
          { en: 'taxi', zh: '出租车，计程车' },
          { en: 'safe', zh: '安全的，没有危险的' },
          { en: 'nurse', zh: '护士' },
          { en: 'light', zh: '照亮' },
          { en: 'uncle', zh: '叔叔，伯伯' },
          { en: 'bake', zh: '烘，烤，焙' },
          { en: 'bee', zh: '蜜蜂' },
          { en: 'same', zh: '相同的，完全相同的，一模一样的' },
          { en: 'sound', zh: '声，声音' },
          { en: 'postman', zh: '邮递员' },
          { en: 'life', zh: '生活' },
          { en: 'mountain', zh: '高山' }
        ]
      },
      {
        id: 'U2', name: 'Unit 2', topic: 'How do you feel today? 你今天感觉怎么样？',
        words: [
          { en: 'laugh', zh: '发出笑声，（大）笑' },
          { en: 'sad', zh: '不愉快的，伤心的，难过的' },
          { en: 'scared', zh: '害怕的，恐惧的；紧张的' },
          { en: 'angry', zh: '发怒的，生气的，气愤的' },
          { en: 'excited', zh: '兴奋的，激动的' },
          { en: 'opera', zh: '歌剧' },
          { en: 'next', zh: '（时间）紧接着的；下次的' },
          { en: 'cough', zh: '咳嗽，咳' },
          { en: 'better', zh: '（健康状况）好转的；（疼痛、伤势等）减轻的' },
          { en: 'gift', zh: '礼物' },
          { en: 'model', zh: '（尤指可拼装的）模型' },
          { en: 'shout', zh: '大声说，喊叫，呼喊' },
          { en: 'should', zh: '应当，应该' },
          { en: 'feeling', zh: '感觉，感触' },
          { en: 'huge', zh: '巨大的' },
          { en: 'worried', zh: '担心的，焦虑的' },
          { en: 'street', zh: '大街，街道' },
          { en: 'hit', zh: '撞击，碰撞' }
        ]
      },
      {
        id: 'U3', name: 'Unit 3', topic: "Everyone's got talent! 人人都有天赋！",
        words: [
          { en: 'talent', zh: '天资，天赋，才能' },
          { en: 'act', zh: '演出；扮演' },
          { en: 'magic', zh: '魔术，戏法' },
          { en: 'shine', zh: '表现突出，出众' },
          { en: 'puzzle', zh: '拼图游戏' },
          { en: 'dancer', zh: '舞蹈演员' },
          { en: 'win', zh: '获胜，赢' },
          { en: 'just', zh: '就，只是' },
          { en: 'boy', zh: '男孩；儿子' },
          { en: 'slowly', zh: '缓慢地，慢慢地' }
        ]
      },
      {
        id: 'U4', name: 'Unit 4', topic: 'Plant life 植物的生命',
        words: [
          { en: 'seed', zh: '种子，籽' },
          { en: 'earth', zh: '泥土，土壤' },
          { en: 'root', zh: '根' },
          { en: 'stem', zh: '（植物的）茎，梗，柄' },
          { en: 'thin', zh: '细的' },
          { en: 'leaf', zh: '叶，叶子' },
          { en: 'dig', zh: '挖，掘' },
          { en: 'sunflower', zh: '向日葵' },
          { en: 'plant', zh: '种植，栽种；播（种）' },
          { en: 'dream', zh: '梦想，愿望，理想' },
          { en: 'sleep', zh: '睡，睡觉' },
          { en: 'will', zh: '将，会，要' },
          { en: 'true', zh: '真的，真实的' },
          { en: 'come true', zh: '实现' },
          { en: 'paper', zh: '纸' }
        ]
      },
      {
        id: 'U5', name: 'Unit 5', topic: 'School activities 学校活动',
        words: [
          { en: 'drama', zh: '戏剧' },
          { en: 'trip', zh: '旅游；旅行，出行' },
          { en: 'fair', zh: '集市；义卖会；户外游艺会' },
          { en: 'festival', zh: '节，节庆，汇演' },
          { en: 'horn', zh: '角' },
          { en: 'dot', zh: '点，小圆点' },
          { en: 'raindrop', zh: '雨点，雨滴' },
          { en: 'more', zh: '更多的' },
          { en: 'special', zh: '特殊的，特别的' },
          { en: 'keeper', zh: '看守人，保管人' },
          { en: 'hey', zh: '嘿，喂' },
          { en: 'lovely', zh: '美好的；令人愉快的；可爱的' },
          { en: 'student', zh: '学生' },
          { en: 'culture', zh: '文化' },
          { en: 'hour', zh: '小时' },
          { en: 'note', zh: '笔记，记录' },
          { en: 'vote', zh: '选票' },
          { en: 'design', zh: '设计' },
          { en: 'hometown', zh: '家乡，故乡' }
        ]
      },
      {
        id: 'U6', name: 'Unit 6', topic: 'Cool clothes 炫酷的服装',
        words: [
          { en: 'T-shirt', zh: 'T恤（衫）' },
          { en: 'skirt', zh: '半身裙，裙子' },
          { en: 'shorts', zh: '短裤' },
          { en: 'shirt', zh: '衬衫' },
          { en: 'trousers', zh: '裤子' },
          { en: 'scarf', zh: '围巾' },
          { en: 'sweater', zh: '毛线衣，羊毛衫，针织衫' },
          { en: 'dress', zh: '连衣裙' },
          { en: 'party', zh: '聚会，宴会' },
          { en: 'dressmaker', zh: '裁缝' },
          { en: 'wrong', zh: '不正确的，错误的' },
          { en: 'clever', zh: '聪明的' },
          { en: 'whale', zh: '鲸' },
          { en: 'Mr', zh: '先生' },
          { en: 'uniform', zh: '制服' },
          { en: 'robe', zh: '长袍' }
        ]
      }
    ]
  }
];
