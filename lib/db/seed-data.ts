// Generated from AniList + Bangumi live data.
export type SeedExternalLink = { site: string; url: string; type: string };
export type SeedAnime = {
  id: string; title: string; titleJp: string; enTitle: string; description: string;
  cover: string; banner: string; year: number; episodesCount: number; duration: number;
  score: number | null; genres: string[]; makerId: string; makerName: string; categoryId: string;
  trailer: string; externalLinks: SeedExternalLink[]; anilistId: number | null; bangumiId: number | null;
  anilistUrl: string; bangumiUrl: string; price: number; featured: boolean; viewCount: number;
  chapterTitle: string;
};

export const seedCategories = [
  {
    "id": "cat-tv",
    "name": "番剧",
    "parentId": "",
    "sort": 1
  },
  {
    "id": "cat-hot",
    "name": "热血",
    "parentId": "cat-tv",
    "sort": 1
  },
  {
    "id": "cat-romance",
    "name": "恋爱",
    "parentId": "cat-tv",
    "sort": 2
  },
  {
    "id": "cat-fantasy",
    "name": "奇幻",
    "parentId": "cat-tv",
    "sort": 3
  },
  {
    "id": "cat-mystery",
    "name": "悬疑",
    "parentId": "cat-tv",
    "sort": 4
  },
  {
    "id": "cat-daily",
    "name": "日常",
    "parentId": "cat-tv",
    "sort": 5
  },
  {
    "id": "cat-movie",
    "name": "剧场版",
    "parentId": "",
    "sort": 2
  },
  {
    "id": "cat-film",
    "name": "动画电影",
    "parentId": "cat-movie",
    "sort": 1
  },
  {
    "id": "cat-mad",
    "name": "MAD",
    "parentId": "",
    "sort": 3
  },
  {
    "id": "cat-music",
    "name": "音乐",
    "parentId": "cat-mad",
    "sort": 1
  }
] as const;

export const seedMakers = [
  {
    "id": "maker-mappa",
    "name": "MAPPA",
    "intro": "2011 年由丸山正雄在东京创立，以高密度作画和风格化演出著称。",
    "career": "《咒术回战》《电锯人》《异兽魔都》《狂赌之渊》",
    "sort": 0,
    "avatar": ""
  },
  {
    "id": "maker-ufotable",
    "name": "ufotable",
    "intro": "以高精度数字摄影、光影特效与 3D 合成见长的日本动画制作公司。",
    "career": "《鬼灭之刃》《Fate/Zero》《空之境界》",
    "sort": 1,
    "avatar": ""
  },
  {
    "id": "maker-wit",
    "name": "WIT STUDIO",
    "intro": "2012 年从 Production I.G 独立，擅长动作作画与大规模场面调度。",
    "career": "《进击的巨人》《间谍过家家》",
    "sort": 2,
    "avatar": ""
  },
  {
    "id": "maker-cloverworks",
    "name": "CloverWorks",
    "intro": "由 A-1 Pictures 高圆寺工作室独立而成的动画品牌，擅长细腻的青春群像。",
    "career": "《孤独摇滚！》《间谍过家家》《奇蛋物语》",
    "sort": 3,
    "avatar": ""
  },
  {
    "id": "maker-madhouse",
    "name": "MADHOUSE",
    "intro": "创立于 1972 年的老牌动画公司，作品跨度极广，以演出实验性著称。",
    "career": "《葬送的芙莉莲》《一拳超人》《死亡笔记》",
    "sort": 4,
    "avatar": ""
  },
  {
    "id": "maker-trigger",
    "name": "TRIGGER",
    "intro": "2011 年成立的年轻动画公司，作画张扬、节奏明快。",
    "career": "《迷宫饭》《斩服少女》《赛博朋克：边缘行者》",
    "sort": 5,
    "avatar": ""
  },
  {
    "id": "maker-doga-kobo",
    "name": "Doga Kobo",
    "intro": "以日常系与恋爱喜剧见长的动画制作公司，色彩明快。",
    "career": "《【我推的孩子】》《月刊少女野崎君》",
    "sort": 6,
    "avatar": ""
  },
  {
    "id": "maker-olm",
    "name": "OLM",
    "intro": "日本老牌动画制作公司，长期承担《宝可梦》系列制作。",
    "career": "《药屋少女的呢喃》《宝可梦》",
    "sort": 7,
    "avatar": ""
  },
  {
    "id": "maker-seven-arcs",
    "name": "Seven Arcs",
    "intro": "以《魔法少女奈叶》系列闻名的动画公司，擅长战斗与恋爱题材。",
    "career": "《魔法少女奈叶》《总之就是非常可爱》",
    "sort": 8,
    "avatar": ""
  },
  {
    "id": "maker-comix-wave",
    "name": "CoMix Wave",
    "intro": "新海诚作品的主要制作公司，以极致背景美术与光影表现著称。",
    "career": "《你的名字。》《天气之子》《铃芽之旅》",
    "sort": 9,
    "avatar": ""
  }
];

export const seedAnime: SeedAnime[] = [
  {
    "id": "16498",
    "title": "进击的巨人",
    "titleJp": "進撃の巨人",
    "enTitle": "Attack on Titan",
    "description": "悠长的历史之中,人类曾一度因被巨人捕食而崩溃。幸存下来的人们建造了一面巨大的墙壁,防止了巨人的入侵。不过,作为“和平”的代价,人类失去了到墙壁的外面去这一“自由”。主人公艾伦·耶格尔对还没见过的外面的世界抱有兴趣。在他正做着到墙壁的外面去这个梦的时候,毁坏墙壁的大巨人出现了！",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
    "year": 2013,
    "episodesCount": 25,
    "duration": 24,
    "score": 85,
    "genres": [
      "Action",
      "Drama",
      "Fantasy",
      "Mystery"
    ],
    "makerId": "maker-wit",
    "makerName": "WIT STUDIO",
    "categoryId": "cat-hot",
    "trailer": "LHtdKWJdif4",
    "externalLinks": [
      {
        "site": "Crunchyroll",
        "url": "http://www.crunchyroll.com/attack-on-titan",
        "type": "STREAMING"
      },
      {
        "site": "Official Site",
        "url": "http://shingeki.tv/",
        "type": "INFO"
      },
      {
        "site": "Hulu",
        "url": "http://www.hulu.com/attack-on-titan",
        "type": "STREAMING"
      },
      {
        "site": "Adult Swim",
        "url": "https://www.adultswim.com/videos/attack-on-titan",
        "type": "STREAMING"
      },
      {
        "site": "iQ",
        "url": "https://www.iq.com/album/xq12ps94l5",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://youtube.com/@attackontitan_officialchannel",
        "type": "STREAMING"
      }
    ],
    "anilistId": 16498,
    "bangumiId": 55770,
    "anilistUrl": "https://anilist.co/anime/16498",
    "bangumiUrl": "https://bgm.tv/subject/55770",
    "price": 0,
    "featured": true,
    "viewCount": 5195,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "124845",
    "title": "奇蛋物语",
    "titleJp": "ワンダーエッグ・プライオリティ",
    "enTitle": "WONDER EGG PRIORITY",
    "description": "14岁少女·大户爱在深夜散步的途中，随着神秘声音的指引，获得了一枚「蛋」。\n\n「如果想要改变世界的话」\n「那么就在现在做出选择」\n「请相信自己——」\n「打破这枚蛋——」\n\n而在打破「蛋」之后，等待着爱的是……。",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124845-JXORhqCTGt04.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/124845-uw8Fiw3kWtbj.jpg",
    "year": 2021,
    "episodesCount": 12,
    "duration": 23,
    "score": 74,
    "genres": [
      "Action",
      "Drama",
      "Fantasy",
      "Mystery",
      "Psychological",
      "Sci-Fi",
      "Thriller"
    ],
    "makerId": "maker-cloverworks",
    "makerName": "CloverWorks",
    "categoryId": "cat-fantasy",
    "trailer": "_TpTn3o-_Yk",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://wonder-egg-priority.com",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/wonder-egg-priority",
        "type": "STREAMING"
      }
    ],
    "anilistId": 124845,
    "bangumiId": 316607,
    "anilistUrl": "https://anilist.co/anime/124845",
    "bangumiUrl": "https://bgm.tv/subject/316607",
    "price": 0,
    "featured": false,
    "viewCount": 4911,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "105228",
    "title": "异兽魔都",
    "titleJp": "ドロヘドロ",
    "enTitle": "Dorohedoro",
    "description": "欢迎光临，混沌。\n被魔法作用下头部变成了蜥蜴同时也完全丧失了记忆的男子·开曼。\n开曼为了变回人脸和找回记忆，和搭档的二阶堂一起在寻找着给自己下了这个魔法的魔法师。\n自己到底是谁……",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105228-I4xr84QS9Pvk.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/105228-QBAya2q8SP52.jpg",
    "year": 2020,
    "episodesCount": 12,
    "duration": 24,
    "score": 79,
    "genres": [
      "Action",
      "Adventure",
      "Comedy",
      "Fantasy",
      "Horror",
      "Mystery"
    ],
    "makerId": "maker-mappa",
    "makerName": "MAPPA",
    "categoryId": "cat-fantasy",
    "trailer": "IS6l1K19N1U",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://dorohedoro.net/sp/",
        "type": "INFO"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/80991903",
        "type": "STREAMING"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/series/GT00371893/dorohedoro",
        "type": "STREAMING"
      }
    ],
    "anilistId": 105228,
    "bangumiId": 266301,
    "anilistUrl": "https://anilist.co/anime/105228",
    "bangumiUrl": "https://bgm.tv/subject/266301",
    "price": 0,
    "featured": false,
    "viewCount": 5379,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "98314",
    "title": "狂赌之渊",
    "titleJp": "賭ケグルイ",
    "enTitle": "Kakegurui",
    "description": "赌博的绝对的“成规”——那就是在胜负之后一定会存在胜者与败者。\n胜者获得财富与荣誉，而败者只能被敲上落伍者的烙印、品味着巨大的丧失感。\n在决定胜负前的静寂之中，本能被激发、欲望也到达了令人恍惚的境地。\n对于资本主义的社会而言，赌博正是人生的残酷缩图。\n人为什么会沉迷于这时时刻刻背负着风险的世界？在那狂气的彼端所看到的是——",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b98314-TSJykxVwCCQN.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/98314-gwgiHiJOj2ls.jpg",
    "year": 2017,
    "episodesCount": 12,
    "duration": 25,
    "score": 70,
    "genres": [
      "Drama",
      "Mystery",
      "Psychological"
    ],
    "makerId": "maker-mappa",
    "makerName": "MAPPA",
    "categoryId": "cat-mystery",
    "trailer": "v2xJDuM9ZDM",
    "externalLinks": [
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/80175351",
        "type": "STREAMING"
      },
      {
        "site": "Official Site",
        "url": "https://kakegurui-anime.com/1st/",
        "type": "INFO"
      }
    ],
    "anilistId": 98314,
    "bangumiId": 209408,
    "anilistUrl": "https://anilist.co/anime/98314",
    "bangumiUrl": "https://bgm.tv/subject/209408",
    "price": 0,
    "featured": false,
    "viewCount": 5189,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "2593",
    "title": "空之境界",
    "titleJp": "劇場版 空の境界",
    "enTitle": "the Garden of sinners Chapter 1: Thanatos. (Overlooking View)",
    "description": "TV动画《剧场版 空之境界》是剧场动画《剧场版 空之境界》的再构成版本，将剧场动画全7章中，以两仪式和黑桐干也为中心的故事提炼出来，将原本倒叙、插叙的章节调整为正叙后，用TV动画的形式播出。",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx2593-FsRHa8PIl2OJ.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/2593-4TD2W9Zk693v.jpg",
    "year": 2007,
    "episodesCount": 13,
    "duration": 50,
    "score": 73,
    "genres": [
      "Action",
      "Mystery",
      "Supernatural",
      "Thriller"
    ],
    "makerId": "maker-ufotable",
    "makerName": "ufotable",
    "categoryId": "cat-film",
    "trailer": "",
    "externalLinks": [
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/the-garden-of-sinners/episode-1-overlooking-view-thanatos-763069",
        "type": "STREAMING"
      },
      {
        "site": "Official Site",
        "url": "https://www.karanokyoukai.com/",
        "type": "INFO"
      }
    ],
    "anilistId": 2593,
    "bangumiId": 75533,
    "anilistUrl": "https://anilist.co/anime/2593",
    "bangumiUrl": "https://bgm.tv/subject/75533",
    "price": 3,
    "featured": false,
    "viewCount": 5563,
    "chapterTitle": "剧场版"
  },
  {
    "id": "116267",
    "title": "总之就是非常可爱",
    "titleJp": "トニカクカワイイ",
    "enTitle": "TONIKAWA: Over The Moon For You",
    "description": "由崎星空对神秘美少女——司一见钟情。\n面对星空决死的告白，她的回答是“如果你愿意和我结婚，那我就跟你交往”？！\n充满了星空与司的爱，可爱&高贵的新婚生活开始了！！",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116267-Eo1biPBTlL4i.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/116267-xQRslGT0tMTS.jpg",
    "year": 2020,
    "episodesCount": 12,
    "duration": 24,
    "score": 77,
    "genres": [
      "Comedy",
      "Romance",
      "Slice of Life"
    ],
    "makerId": "maker-seven-arcs",
    "makerName": "Seven Arcs",
    "categoryId": "cat-romance",
    "trailer": "de9OckSLP1o",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "http://tonikawa.com/",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/tonikawa-over-the-moon-for-you",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/en/media/34613",
        "type": "STREAMING"
      }
    ],
    "anilistId": 116267,
    "bangumiId": 301541,
    "anilistUrl": "https://anilist.co/anime/116267",
    "bangumiUrl": "https://bgm.tv/subject/301541",
    "price": 0,
    "featured": false,
    "viewCount": 5984,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "113415",
    "title": "咒术回战",
    "titleJp": "呪術廻戦",
    "enTitle": "JUJUTSU KAISEN",
    "description": "少年战斗着——「为寻求正确的死亡」\n辛酸·后悔·耻辱人类产生的负面情感，化为诅咒，潜入日常生活诅咒是蔓延于世界的祸源，最糟糕的情况下，会让人类踏入死亡，并且诅咒只能以诅咒拔除。\n虎杖悠仁是一位体育万能的高中生，某天他为了从“咒物”危机中解救学姐，而吞下了被诅咒的手指“两面宿傩之指”，让“宿傩”这种诅咒跟自己合而为一。\n在最强咒术师五条悟的指引下，进入对诅咒专门机关「东京都立咒术高等专门学校」，并遇到了伏黑惠与钉崎野蔷薇这两位同学。\n某日，突然出现“特级咒物”，他们三人就奉命到现场支援。为了实现爷爷要他“助人”的遗言，虎杖将会继续与“诅咒”奋斗下去。\n为了祓除诅咒而成为诅咒的少年，无法回头的壮阔故事开始了——",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
    "year": 2020,
    "episodesCount": 24,
    "duration": 24,
    "score": 84,
    "genres": [
      "Action",
      "Drama",
      "Supernatural"
    ],
    "makerId": "maker-mappa",
    "makerName": "MAPPA",
    "categoryId": "cat-hot",
    "trailer": "RIyb52EMx8c",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://jujutsukaisen.jp/",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/jujutsu-kaisen",
        "type": "STREAMING"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81278456",
        "type": "STREAMING"
      },
      {
        "site": "iQ",
        "url": "https://www.iq.com/album/igc33vhvex",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/media/37738",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://youtube.com/playlist?list=PLxSscENEp7JisDU6GAJuyNpVwDvCm-f3J",
        "type": "STREAMING"
      }
    ],
    "anilistId": 113415,
    "bangumiId": 294993,
    "anilistUrl": "https://anilist.co/anime/113415",
    "bangumiUrl": "https://bgm.tv/subject/294993",
    "price": 0,
    "featured": true,
    "viewCount": 6546,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "101922",
    "title": "鬼灭之刃",
    "titleJp": "鬼滅の刃",
    "enTitle": "Demon Slayer: Kimetsu no Yaiba",
    "description": "大正时期、日本。\n卖炭的心地善良的少年·炭治郎，有一天被鬼杀死了家人。\n而唯一幸存下来的妹妹祢豆子变成了鬼。\n被绝望的现实打垮的炭治郎，为了让妹妹变回人类并讨伐杀害家人的鬼，决心沿着“鬼杀队”的道路前进。\n人与鬼交织的悲哀的兄妹的故事，现在开始！",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg",
    "year": 2019,
    "episodesCount": 26,
    "duration": 24,
    "score": 82,
    "genres": [
      "Action",
      "Adventure",
      "Drama",
      "Fantasy",
      "Supernatural"
    ],
    "makerId": "maker-ufotable",
    "makerName": "ufotable",
    "categoryId": "cat-hot",
    "trailer": "6vMuWuWlW4I",
    "externalLinks": [
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/demon-slayer-kimetsu-no-yaiba",
        "type": "STREAMING"
      },
      {
        "site": "Hulu",
        "url": "https://www.hulu.com/demon-slayer-kimetsu-no-yaiba",
        "type": "STREAMING"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81091393",
        "type": "STREAMING"
      },
      {
        "site": "Official Site",
        "url": "https://kimetsu.com/anime/risshihen/",
        "type": "INFO"
      }
    ],
    "anilistId": 101922,
    "bangumiId": 245665,
    "anilistUrl": "https://anilist.co/anime/101922",
    "bangumiUrl": "https://bgm.tv/subject/245665",
    "price": 0,
    "featured": false,
    "viewCount": 6685,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "140960",
    "title": "间谍过家家",
    "titleJp": "SPY×FAMILY",
    "enTitle": "SPY x FAMILY",
    "description": "每个人都有着不让任何人所看见的一面——\n这是一个世界各国在暗地里展开激烈情报战的时代。东国和西国已经处于冷战状态长达十余年之久。\n隶属于西国情报局对东科（WISE）的精英间谍“黄昏”，为了调查东国国家统一党总裁多诺万·德斯蒙这一威胁东西和平的危险人物的战争计划，黄昏被指派了一个绝密的任务。\n这个任务称之为“枭”作战。\n任务的内容是在一周内组建成一个家庭，潜入德斯蒙的儿子就读的名校，并解决掉德斯蒙。\n但是，黄昏所遇到的“女儿”是能读懂内心的超能力者，“妻子”则是暗杀者。三人为了彼此的利益而成为了一家人，并决定在隐藏真实身份的情况下共同生活。\n世界的和平被托付给了这个意外频出的临时家庭。",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg",
    "year": 2022,
    "episodesCount": 12,
    "duration": 24,
    "score": 83,
    "genres": [
      "Action",
      "Comedy",
      "Slice of Life",
      "Supernatural"
    ],
    "makerId": "maker-cloverworks",
    "makerName": "CloverWorks",
    "categoryId": "cat-daily",
    "trailer": "_VRxEEBa1XU",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://spy-family.net/tvseries/",
        "type": "INFO"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81511410",
        "type": "STREAMING"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/spy-x-family",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/media/1048837/",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://youtube.com/playlist?list=PLwLSw1_eDZl1wGMYg5oB3uEns0CZNl6sI",
        "type": "STREAMING"
      },
      {
        "site": "Hulu",
        "url": "https://www.hulu.com/series/65d158d4-443f-44c7-bd2c-eae39f6c60e9",
        "type": "STREAMING"
      }
    ],
    "anilistId": 140960,
    "bangumiId": 329906,
    "anilistUrl": "https://anilist.co/anime/140960",
    "bangumiUrl": "https://bgm.tv/subject/329906",
    "price": 0,
    "featured": false,
    "viewCount": 6965,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "154587",
    "title": "葬送的芙莉莲",
    "titleJp": "葬送のフリーレン",
    "enTitle": "Frieren: Beyond Journey’s End",
    "description": "魔法使芙莉莲和勇者辛美尔等人一起，历经十年的冒险之后击败了魔王，为世界带来了和平。\n身为能活上一千多年的精灵族，她于是和辛美尔等人约定再次相见后，踏上了独自一人的旅途。\n自那以后，50年过去，芙莉莲又前往拜访辛美尔，相比于和50年前一点没变的她来说，辛美尔已经年迈体衰，进入了风烛残年。\n之后，她目睹了辛美尔迎来他的死亡，痛感自己以往没能“知晓人心\"，陷入后悔的芙莉莲，为了“知晓人心\"，踏上了旅途。\n这趟旅途会邂逅各种各样的人，也有各种各样的事情在等待着她。",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg",
    "year": 2023,
    "episodesCount": 28,
    "duration": 24,
    "score": 91,
    "genres": [
      "Adventure",
      "Drama",
      "Fantasy"
    ],
    "makerId": "maker-madhouse",
    "makerName": "MADHOUSE",
    "categoryId": "cat-fantasy",
    "trailer": "tR8YH0G67Rk",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://frieren-anime.jp/",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/series/GG5H5XQX4/frieren-beyond-journeys-end",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/en/media/2090295",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://www.youtube.com/playlist?list=PLwLSw1_eDZl10YPPR7qDsVf10wZfYnIMK",
        "type": "STREAMING"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81726714",
        "type": "STREAMING"
      },
      {
        "site": "Hulu",
        "url": "https://www.hulu.com/series/frieren-beyond-journeys-end-1d4725f8-06d1-43fb-a077-72143ac5502f",
        "type": "STREAMING"
      }
    ],
    "anilistId": 154587,
    "bangumiId": 400602,
    "anilistUrl": "https://anilist.co/anime/154587",
    "bangumiUrl": "https://bgm.tv/subject/400602",
    "price": 0,
    "featured": true,
    "viewCount": 7574,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "130003",
    "title": "孤独摇滚！",
    "titleJp": "ぼっち・ざ・ろっく！",
    "enTitle": "BOCCHI THE ROCK!",
    "description": "作为网络吉他手“吉他英雄”而广受好评的后藤一里，在现实中却是个什么都不会的沟通障碍者。一里有着组建乐队的梦想，但因为不敢向人主动搭话而一直没有成功，直到一天在公园中被伊地知虹夏发现并邀请进入缺少吉他手的“结束乐队”。可是，完全没有和他人合作经历的一里，在人前完全发挥不出原本的实力。为了努力克服沟通障碍，一里与“结束乐队”的成员们一同开始努力……",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/130003-5F90a7BtsPQN.jpg",
    "year": 2022,
    "episodesCount": 12,
    "duration": 24,
    "score": 87,
    "genres": [
      "Comedy",
      "Music",
      "Slice of Life"
    ],
    "makerId": "maker-cloverworks",
    "makerName": "CloverWorks",
    "categoryId": "cat-daily",
    "trailer": "SyMMZF5zNW4",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "http://bocchi.rocks/",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://beta.crunchyroll.com/series/GXJHM3P19",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/en/media/2069564",
        "type": "STREAMING"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81641170",
        "type": "STREAMING"
      }
    ],
    "anilistId": 130003,
    "bangumiId": 328609,
    "anilistUrl": "https://anilist.co/anime/130003",
    "bangumiUrl": "https://bgm.tv/subject/328609",
    "price": 0,
    "featured": false,
    "viewCount": 7619,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "127230",
    "title": "电锯人",
    "titleJp": "チェンソーマン",
    "enTitle": "Chainsaw Man",
    "description": "电次是个背负了父亲遗留下的庞大债务，因此过着极端贫穷生活的少年，他救了恶魔啵奇塔，并与它一起以恶魔猎人的身份斩杀低阶恶魔来换取酬劳。有一天，流氓骗了电次，让他成为一堆恶魔的祭品，电次在临死之际，啵奇塔牺牲自己，把心脏给了他，让他复活并拥有了恶魔的力量，只要一拉位在心脏那边的链子就能发动。之后电次被公安人员看上，因此成为公安的恶魔猎人……",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg",
    "year": 2022,
    "episodesCount": 12,
    "duration": 25,
    "score": 83,
    "genres": [
      "Action",
      "Drama",
      "Horror",
      "Supernatural"
    ],
    "makerId": "maker-mappa",
    "makerName": "MAPPA",
    "categoryId": "cat-hot",
    "trailer": "v4yLeNt-kCU",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://chainsawman.dog/",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://crunchyroll.com/series/GVDHX8QNW",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://www.youtube.com/playlist?list=PLxSscENEp7JhfvHiWN-djJjCOjW8rxA6p",
        "type": "STREAMING"
      },
      {
        "site": "Hulu",
        "url": "https://www.hulu.com/series/chainsaw-man-7b71b5a4-560b-4d8b-98c4-c5dee6004c21",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/en/media/2069687",
        "type": "STREAMING"
      },
      {
        "site": "Disney Plus",
        "url": "https://www.disneyplus.com/series/chainsaw-man/2gMK1kC3JIEh",
        "type": "STREAMING"
      }
    ],
    "anilistId": 127230,
    "bangumiId": 321885,
    "anilistUrl": "https://anilist.co/anime/127230",
    "bangumiUrl": "https://bgm.tv/subject/321885",
    "price": 0,
    "featured": false,
    "viewCount": 7664,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "150672",
    "title": "【我推的孩子】",
    "titleJp": "【推しの子】",
    "enTitle": "OSHI NO KO",
    "description": "“在演艺圈里，谎言就是武器。 ”\n在小城市工作的妇产科医生・五郎，有一天他所推的偶像“B小町”出现在了他的面前。“B小町”有着一个禁忌的秘密。\n如此这般的两人实现了最糟糕的相遇，从此命运的齿轮开始转动——",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/150672-ISwoA0eS722H.jpg",
    "year": 2023,
    "episodesCount": 11,
    "duration": 24,
    "score": 84,
    "genres": [
      "Drama",
      "Mystery",
      "Psychological",
      "Supernatural"
    ],
    "makerId": "maker-doga-kobo",
    "makerName": "Doga Kobo",
    "categoryId": "cat-mystery",
    "trailer": "gKWEUJ4r5do",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://ichigoproduction.com/Season1/",
        "type": "INFO"
      },
      {
        "site": "HIDIVE",
        "url": "https://www.hidive.com/tv/oshi-no-ko",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://www.youtube.com/playlist?list=PLxSscENEp7Jhas5i3D5PMB2HNS6Z6HJF2",
        "type": "STREAMING"
      },
      {
        "site": "Bilibili TV",
        "url": "https://www.bilibili.tv/en/media/2080019",
        "type": "STREAMING"
      },
      {
        "site": "YouTube",
        "url": "https://www.youtube.com/@anime_oshinoko",
        "type": "STREAMING"
      },
      {
        "site": "iQ",
        "url": "https://www.iq.com/album/1jvbmah70pd",
        "type": "STREAMING"
      }
    ],
    "anilistId": 150672,
    "bangumiId": 386809,
    "anilistUrl": "https://anilist.co/anime/150672",
    "bangumiUrl": "https://bgm.tv/subject/386809",
    "price": 0,
    "featured": false,
    "viewCount": 7944,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "153518",
    "title": "迷宫饭",
    "titleJp": "ダンジョン飯",
    "enTitle": "Delicious in Dungeon",
    "description": "迷宫饭，不是吃就是被吃…\n莱欧斯是一名冒险者，在一次探险中，迷宫深处的赤龙吃掉了他的妹妹，他侥幸逃过一命传送回到了地面。莱欧斯想要立马重新挑战迷宫，营救妹妹，但是钱和食物都留在了迷宫深处… 想到妹妹随时都有可能会被赤龙消化，导致无法复活，莱欧斯下定了决心：「食物要在迷宫内就地取材」\n史莱姆、巴西利斯克、宝箱怪、还有龙！\n冒险者啊，以袭来的魔物为食，通关迷宫吧！\n\n[简介原文]\nダンジョン飯。　それは、“食う”か“食われる”か―――\nダンジョン深奥で、レッドドラゴンに妹が喰われた！\n命からがら地上へ生還した冒険者のライオス。\n再びダンジョンへ挑もうとするも、お金や食糧は迷宮の奥底……。\n妹が消化されてしまうかもしれない危機的な状況の中、ライオスは決意する。\n「食糧は、迷宮内で自給自足する！」\nスライム、バジリスク、ミミック、そしてドラゴン！\n襲い来る魔物たちを食べながらダンジョン踏破を目指せ、冒険者よ！",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153518-IVXPDY5ph3kO.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/153518-7uRvV7SLqmHV.jpg",
    "year": 2024,
    "episodesCount": 24,
    "duration": 25,
    "score": 85,
    "genres": [
      "Adventure",
      "Comedy",
      "Fantasy"
    ],
    "makerId": "maker-trigger",
    "makerName": "TRIGGER",
    "categoryId": "cat-fantasy",
    "trailer": "RtpYObV4c1Y",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://delicious-in-dungeon.com/",
        "type": "INFO"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81564899",
        "type": "STREAMING"
      }
    ],
    "anilistId": 153518,
    "bangumiId": 395378,
    "anilistUrl": "https://anilist.co/anime/153518",
    "bangumiUrl": "https://bgm.tv/subject/395378",
    "price": 0,
    "featured": false,
    "viewCount": 8224,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "161645",
    "title": "药屋少女的呢喃",
    "titleJp": "薬屋のひとりごと",
    "enTitle": "The Apothecary Diaries",
    "description": "大陆的中央有个大国，在那个国家的后宫之中有一位少女，其名为“猫猫”。她以前在花街做药师，现在在后宫做事。某天，她得知皇子们皆早夭，而现在的两个皇子都因为生病而逐渐衰弱。于是，在好奇心的驱使下，她开始调查事情的真相，就好像在说世上不可能存在诅咒。壬氏是一位外表俊美的宦官，他让猫猫当皇帝宠妃的试毒人。猫猫对人没有兴趣，却异常钟情毒和药，就是这样一位在花街长大的药师，被卷入了宫中的传闻事件。美丽的玫瑰长有刺，女人的庭院里到处都是毒，流言和阴谋更是不缺。虽然不断地被壬氏委托麻烦事，但猫猫还是照常处理。罕见的嗜毒姑娘今天也在后宫里奔走。",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx161645-QLbzHXiYRgV2.jpg",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/161645-oqzTZYIvviWI.jpg",
    "year": 2023,
    "episodesCount": 24,
    "duration": 23,
    "score": 88,
    "genres": [
      "Drama",
      "Mystery"
    ],
    "makerId": "maker-olm",
    "makerName": "OLM",
    "categoryId": "cat-mystery",
    "trailer": "oyHqh8ue4zw",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "https://kusuriyanohitorigoto.jp/season1/",
        "type": "INFO"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/series/G3KHEVDJ7/the-apothecary-diaries",
        "type": "STREAMING"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/81712068",
        "type": "STREAMING"
      },
      {
        "site": "Hulu",
        "url": "https://www.hulu.com/series/the-apothecary-diaries-d7b5390e-b8cb-4cc3-ba7c-7ed570355d7d",
        "type": "STREAMING"
      }
    ],
    "anilistId": 161645,
    "bangumiId": 420628,
    "anilistUrl": "https://anilist.co/anime/161645",
    "bangumiUrl": "https://bgm.tv/subject/420628",
    "price": 0,
    "featured": false,
    "viewCount": 8598,
    "chapterTitle": "第 1 季"
  },
  {
    "id": "21519",
    "title": "你的名字。",
    "titleJp": "君の名は。",
    "enTitle": "Your Name.",
    "description": "在每千年回归一次的彗星造访过一个月之后的日本。\n　　某个深山的乡下小镇，女高中生三叶每天都过着忧郁的生活。\n　　而她烦恼的不光有担任镇长的父亲所举行的选举运动，还有家传神社的古老习俗。\n　　在这个小小的城镇，周围都只是些爱瞎操心的老人。为此三叶对于大都市充满了憧憬。\n　　“下辈子就让我成为东京的帅哥吧……！！！”\n　　然而某一天，自己做了一个变成男孩子的梦。\n　　这儿有着陌生的房间、陌生的朋友。而眼前出现的则是东京的街道。\n　　三叶虽然感到困惑，但是能够来到朝思暮想的都市生活，让她觉得神清气爽。\n　　“不可思议的梦……”\n　　另一方面在东京生活的男高中生·泷也做了个奇怪的梦。\n　　他在一个从未去过的深山小镇中，变成了女高中生……\n　　那么他们体验的梦境到底有什么秘密呢？\n　　原本不会相遇的两人由此相逢。\n　　少女和少年奇迹的故事，开始了。",
    "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg",
    "year": 2016,
    "episodesCount": 1,
    "duration": 107,
    "score": 85,
    "genres": [
      "Drama",
      "Romance",
      "Supernatural"
    ],
    "makerId": "maker-comix-wave",
    "makerName": "CoMix Wave",
    "categoryId": "cat-film",
    "trailer": "k4xGqY5IDBE",
    "externalLinks": [
      {
        "site": "Official Site",
        "url": "http://www.kiminona.com/",
        "type": "INFO"
      },
      {
        "site": "Netflix",
        "url": "https://www.netflix.com/title/80161371",
        "type": "STREAMING"
      },
      {
        "site": "Crunchyroll",
        "url": "https://www.crunchyroll.com/your-name",
        "type": "STREAMING"
      },
      {
        "site": "Amazon Prime Video",
        "url": "https://www.primevideo.com/detail/0LQ7ANJUT17XBYKOFOUCQ1PORE",
        "type": "STREAMING"
      },
      {
        "site": "Max",
        "url": "https://play.max.com/movie/e95b27d7-7fba-4b3b-bed9-a134dd1bc6ba",
        "type": "STREAMING"
      }
    ],
    "anilistId": 21519,
    "bangumiId": 160209,
    "anilistUrl": "https://anilist.co/anime/21519",
    "bangumiUrl": "https://bgm.tv/subject/160209",
    "price": 6,
    "featured": true,
    "viewCount": 8690,
    "chapterTitle": "剧场版"
  }
];

export const seedAds = [
  {
    "id": "ad-1",
    "title": "进击的巨人",
    "imageUrl": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
    "linkUrl": "/anime/16498",
    "color": "#0f172a",
    "sort": 10,
    "typeId": "1"
  },
  {
    "id": "ad-2",
    "title": "咒术回战",
    "imageUrl": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
    "linkUrl": "/anime/113415",
    "color": "#0f172a",
    "sort": 9,
    "typeId": "1"
  },
  {
    "id": "ad-3",
    "title": "葬送的芙莉莲",
    "imageUrl": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg",
    "linkUrl": "/anime/154587",
    "color": "#0f172a",
    "sort": 8,
    "typeId": "1"
  },
  {
    "id": "ad-4",
    "title": "你的名字。",
    "imageUrl": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg",
    "linkUrl": "/anime/21519",
    "color": "#0f172a",
    "sort": 7,
    "typeId": "1"
  }
];

export const demoComments = [
  { id: 'comment-1', animeId: '154587', content: '芙莉莲的节奏太舒服了，战斗作画又突然拉满，一口气看完。', createdAt: '2026-10-20T13:20:00.000Z' },
  { id: 'comment-2', animeId: '154587', content: '辛美尔的回忆每次出现都很好哭。', createdAt: '2026-10-21T08:05:00.000Z' },
  { id: 'comment-3', animeId: '113415', content: '五条悟出场那段反复看了三遍。', createdAt: '2026-10-18T10:12:00.000Z' },
  { id: 'comment-4', animeId: '21519', content: '第一次在电影院看新海诚，结尾直接起鸡皮疙瘩。', createdAt: '2026-10-17T15:40:00.000Z' },
];
