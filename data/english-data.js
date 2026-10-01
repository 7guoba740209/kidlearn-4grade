/* ============================================================
 *  英语教材数据 —— 外语教学与研究出版社（三起）四年级 上册 / 下册
 *  结构：Modules → words[{en, zh}]
 *  维护说明：直接改 EN_BOOKS 即可，模块名、单词都可以自由增删，
 *            拼写游戏会自动读取最新数据。
 * ============================================================ */
window.EN_BOOKS = [
  /* ==================== 四年级 上册（外研版三起） ==================== */
  {
    id: '4a', name: '四年级 上册', sub: '外研版（三年级起）',
    modules: [
      {
        id: 'M1', name: 'Module 1', topic: '方向与问路',
        words: [
          { en: 'straight', zh: '直地，直线地' }, { en: 'left', zh: '左边；向左' },
          { en: 'right', zh: '右边；向右' }, { en: 'lost', zh: '迷路的' },
          { en: 'live', zh: '居住' }, { en: 'street', zh: '大街，街道' },
          { en: 'supermarket', zh: '超市' }, { en: 'beside', zh: '在……旁边' },
          { en: 'cinema', zh: '电影院' }, { en: 'station', zh: '车站' },
          { en: 'train', zh: '火车' }, { en: 'hill', zh: '小山' },
          { en: 'near', zh: '接近，临近' }, { en: 'house', zh: '房屋' }
        ]
      },
      {
        id: 'M2', name: 'Module 2', topic: '正在做的事',
        words: [
          { en: 'read', zh: '阅读' }, { en: 'running', zh: '跑步' },
          { en: 'these', zh: '这些' }, { en: 'picture', zh: '图画；照片' },
          { en: 'take', zh: '拍摄' }, { en: 'children', zh: '孩子们' },
          { en: 'listen', zh: '听' }, { en: 'talk', zh: '说话，交谈' },
          { en: 'China', zh: '中国' }, { en: 'friend', zh: '朋友' }
        ]
      },
      {
        id: 'M3', name: 'Module 3', topic: '公园里的人们',
        words: [
          { en: 'kid', zh: '小孩' }, { en: 'can', zh: '能够，会' },
          { en: 'see', zh: '看到' }, { en: 'interesting', zh: '有趣的' },
          { en: 'thing', zh: '东西；事情' }, { en: 'people', zh: '人，人们' },
          { en: 'row', zh: '划（船）' }, { en: 'dragon', zh: '龙' },
          { en: 'boat', zh: '船' }, { en: 'men', zh: '男人（复数）' },
          { en: 'between', zh: '在……之间' }, { en: 'chess', zh: '国际象棋' },
          { en: 'drink', zh: '喝，饮用' }, { en: 'clock', zh: '钟' },
          { en: 'hungry', zh: '饥饿的' }, { en: 'draw', zh: '画' },
          { en: 'jump', zh: '跳' }, { en: 'sing', zh: '唱歌' },
          { en: 'dance', zh: '跳舞' }
        ]
      },
      {
        id: 'M4', name: 'Module 4', topic: '食物与购物',
        words: [
          { en: 'want', zh: '想要' }, { en: 'some', zh: '一些' },
          { en: 'juice', zh: '果汁' }, { en: 'ice', zh: '冰，冰块' },
          { en: 'also', zh: '也，还' }, { en: 'food', zh: '食物' },
          { en: 'make', zh: '制作' }, { en: 'tomato', zh: '西红柿' },
          { en: 'egg', zh: '鸡蛋' }, { en: 'potato', zh: '马铃薯，土豆' },
          { en: 'flower', zh: '花' }, { en: 'dumpling', zh: '水饺' },
          { en: 'help', zh: '帮助' }, { en: 'buy', zh: '买' }
        ]
      },
      {
        id: 'M5', name: 'Module 5', topic: '能力本领',
        words: [
          { en: 'run', zh: '跑' }, { en: 'fast', zh: '快' },
          { en: 'sky', zh: '天，天空' }, { en: 'high', zh: '高' },
          { en: 'winner', zh: '获胜者' }, { en: 'far', zh: '远' },
          { en: 'afraid', zh: '恐怕' }, { en: 'strong', zh: '健壮的' },
          { en: 'star', zh: '明星' }
        ]
      },
      {
        id: 'M6', name: 'Module 6', topic: '节日与请求',
        words: [
          { en: 'sweets', zh: '糖果' }, { en: 'soup', zh: '汤' },
          { en: 'sorry', zh: '抱歉，对不起' }, { en: 'bread', zh: '面包' },
          { en: 'dark', zh: '黑暗的' }, { en: 'light', zh: '灯' },
          { en: 'Halloween', zh: '万圣节前夕' }, { en: 'give', zh: '给' },
          { en: 'moon cake', zh: '月饼' }, { en: 'festival', zh: '节日' }
        ]
      },
      {
        id: 'M7', name: 'Module 7', topic: '照片里有什么',
        words: [
          { en: 'horse', zh: '马' }, { en: 'sheep', zh: '羊，绵羊' },
          { en: 'vegetable', zh: '蔬菜' }, { en: 'climb', zh: '爬，攀登' },
          { en: 'face', zh: '脸，面孔' }, { en: 'fruit', zh: '水果' },
          { en: 'chicken', zh: '鸡' }, { en: 'bear', zh: '熊' },
          { en: 'pig', zh: '猪' }, { en: 'photo', zh: '照片' }
        ]
      },
      {
        id: 'M8', name: 'Module 8', topic: '出行计划',
        words: [
          { en: 'visit', zh: '参观，拜访' }, { en: 'tomorrow', zh: '明天' },
          { en: 'plane', zh: '飞机' }, { en: 'sea', zh: '大海' },
          { en: 'swimsuit', zh: '游泳衣' }, { en: 'sock', zh: '短袜' },
          { en: 'fish', zh: '鱼；钓鱼' }, { en: 'bedtime', zh: '就寝时间' },
          { en: 'o\'clock', zh: '……点钟' }
        ]
      },
      {
        id: 'M9', name: 'Module 9', topic: '运动日',
        words: [
          { en: 'win', zh: '胜利，取胜' }, { en: 'month', zh: '月' },
          { en: 'hundred', zh: '一百' }, { en: 'metre', zh: '米' },
          { en: 'every', zh: '每个，每一' }, { en: 'day', zh: '一天，一日' },
          { en: 'luck', zh: '运气' }, { en: 'come on', zh: '快点，赶快' },
          { en: 'subject', zh: '学科，科目' }, { en: 'sports day', zh: '运动日' }
        ]
      },
      {
        id: 'M10', name: 'Module 10', topic: '家庭与节日',
        words: [
          { en: 'family', zh: '家，家庭' }, { en: 'dinner', zh: '晚餐，正餐' },
          { en: 'year', zh: '年份' }, { en: 'Chinese', zh: '中国的' },
          { en: 'festival', zh: '节日' }, { en: 'peanut', zh: '花生' },
          { en: 'merry', zh: '愉快的' }, { en: 'Christmas', zh: '圣诞节' },
          { en: 'New Year', zh: '新年' }
        ]
      }
    ]
  },

  /* ==================== 四年级 下册（外研版三起） ==================== */
  {
    id: '4b', name: '四年级 下册', sub: '外研版（三年级起）',
    modules: [
      {
        id: 'M1', name: 'Module 1', topic: '描述人物',
        words: [
          { en: 'nice', zh: '友好的，亲切的' }, { en: 'clever', zh: '聪明的' },
          { en: 'naughty', zh: '淘气的' }, { en: 'shy', zh: '害羞的' },
          { en: 'answer', zh: '回答；接（电话）' }, { en: 'call', zh: '打电话' },
          { en: 'bad', zh: '不好的，坏的' }, { en: 'cool', zh: '酷的' },
          { en: 'aunt', zh: '姨母；姑母' }, { en: 'uncle', zh: '伯父；叔叔' },
          { en: 'big', zh: '年龄较大的' }, { en: 'little', zh: '幼小的' },
          { en: 'cute', zh: '可爱的' }
        ]
      },
      {
        id: 'M2', name: 'Module 2', topic: '城市与景物',
        words: [
          { en: 'city', zh: '城市' }, { en: 'ship', zh: '船' },
          { en: 'beautiful', zh: '美丽的' }, { en: 'whose', zh: '谁的' },
          { en: 'queen', zh: '女王' }, { en: 'close', zh: '近的，接近的' },
          { en: 'old', zh: '古老的' }, { en: 'famous', zh: '著名的' }
        ]
      },
      {
        id: 'M3', name: 'Module 3', topic: '机器人与日程',
        words: [
          { en: 'robot', zh: '机器人' }, { en: 'will', zh: '将，将会' },
          { en: 'everything', zh: '所有事情' }, { en: 'housework', zh: '家务活' },
          { en: 'learn', zh: '学习' }, { en: 'our', zh: '我们的' },
          { en: 'homework', zh: '家庭作业' }, { en: 'Tuesday', zh: '星期二' },
          { en: 'Wednesday', zh: '星期三' }, { en: 'Thursday', zh: '星期四' },
          { en: 'Friday', zh: '星期五' }, { en: 'week', zh: '星期，周' },
          { en: 'holiday', zh: '假期' }, { en: 'next', zh: '下一个的' }
        ]
      },
      {
        id: 'M4', name: 'Module 4', topic: '野餐与天气',
        words: [
          { en: 'take', zh: '带，拿' }, { en: 'fly', zh: '飞' },
          { en: 'picnic', zh: '野餐' }, { en: 'great', zh: '太好了，好极了' },
          { en: 'why', zh: '为什么' }, { en: 'because', zh: '因为' },
          { en: 'cloudy', zh: '多云的' }, { en: 'weather', zh: '天气' }
        ]
      },
      {
        id: 'M5', name: 'Module 5', topic: '过去与现在',
        words: [
          { en: 'was', zh: '（am,is 过去式）是' }, { en: 'were', zh: '（are 过去式）是' },
          { en: 'then', zh: '当时，那时' }, { en: 'young', zh: '年轻的' },
          { en: 'hair', zh: '头发' }, { en: 'short', zh: '短的' },
          { en: 'long', zh: '长的' }, { en: 'clean', zh: '干净的' },
          { en: 'dirty', zh: '脏的' }, { en: 'grandparent', zh: '祖父母' }
        ]
      },
      {
        id: 'M6', name: 'Module 6', topic: '昨天与乡村',
        words: [
          { en: 'yesterday', zh: '昨天' }, { en: 'out', zh: '不在家（在外）' },
          { en: 'well', zh: '健康的' }, { en: 'thanks', zh: '谢谢' },
          { en: 'sun', zh: '太阳' }, { en: 'lesson', zh: '一堂课' },
          { en: 'village', zh: '乡村' }
        ]
      },
      {
        id: 'M7', name: 'Module 7', topic: '过去的活动',
        words: [
          { en: 'had', zh: '（have 过去式）度过' }, { en: 'phone', zh: '打电话' },
          { en: 'cook', zh: '煮，烹调' }, { en: 'really', zh: '真的' },
          { en: 'wash', zh: '洗' }, { en: 'computer', zh: '计算机，电脑' },
          { en: 'love', zh: '爱，喜欢' }, { en: 'did', zh: '（do 过去式）助动词' },
          { en: 'Mrs', zh: '太太' }, { en: 'Miss', zh: '小姐' }
        ]
      },
      {
        id: 'M8', name: 'Module 8', topic: '一次游玩',
        words: [
          { en: 'sang', zh: '（sing 过去式）唱歌' }, { en: 'beautifully', zh: '优美地' },
          { en: 'saw', zh: '（see 过去式）看见' }, { en: 'game', zh: '游戏，比赛' },
          { en: 'fun', zh: '有趣的事' }, { en: 'went', zh: '（go 过去式）去' },
          { en: 'ate', zh: '（eat 过去式）吃' }, { en: 'drank', zh: '（drink 过去式）喝' },
          { en: 'busy', zh: '忙的' }, { en: 'took', zh: '（take 过去式）拍摄' },
          { en: 'delicious', zh: '美味的' }, { en: 'poster', zh: '海报' }
        ]
      },
      {
        id: 'M9', name: 'Module 9', topic: '欢迎与旅行',
        words: [
          { en: 'welcome', zh: '欢迎' }, { en: 'postcard', zh: '明信片' },
          { en: 'cousin', zh: '表兄弟；表姐妹' }, { en: 'dear', zh: '亲爱的' },
          { en: 'travel', zh: '旅行' }, { en: 'came', zh: '（come 过去式）来' },
          { en: 'pop', zh: '流行音乐' }, { en: 'concert', zh: '音乐会' },
          { en: 'earth', zh: '地球' }
        ]
      },
      {
        id: 'M10', name: 'Module 10', topic: '意外与健康',
        words: [
          { en: 'fall', zh: '掉下来' }, { en: 'fell', zh: '（fall 过去式）掉下来' },
          { en: 'found', zh: '（find 过去式）找到' }, { en: 'town', zh: '城镇，市镇' },
          { en: 'happen', zh: '发生' }, { en: 'ride', zh: '骑车' },
          { en: 'thirsty', zh: '渴的' }, { en: 'water', zh: '水' },
          { en: 'bought', zh: '（buy 过去式）买' }, { en: 'watermelon', zh: '西瓜' },
          { en: 'carried', zh: '（carry 过去式）搬' }, { en: 'hospital', zh: '医院' },
          { en: 'chocolate', zh: '巧克力' }, { en: 'headache', zh: '头疼' },
          { en: 'fever', zh: '发烧' }, { en: 'cold', zh: '感冒' }
        ]
      }
    ]
  }
];
