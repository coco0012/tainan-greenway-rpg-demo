import type { GameStats } from './stats';

export interface QuestChoice {
  key: string;
  text: string;
  effects: Partial<GameStats>;
  npcFeedback: string;
  conflictFeedback: string;
}

export interface QuestData {
  id: number;
  title: string;
  theme: string;
  description: string;
  npcName: string;
  npcAvatar: string;
  npcQuote: string;
  conflictName: string;
  conflictAvatar: string;
  conflictType: string;
  conflictQuote: string;
  choices: QuestChoice[];
}

export const QUESTS: QuestData[] = [
  {
    id: 1,
    title: '關卡一：通勤動線衝突',
    theme: '通勤動線衝突',
    description: '大學區通勤單車騎士希望快速通過，但社區巡守隊主張全面禁止單車以維護長者散步安全。',
    npcName: '單車通勤族 🚴',
    npcAvatar: '🚴',
    npcQuote: '「這段路是我們上課最快的路線。如果擺滿了椅子或市集花盆，騎車太危險了！」',
    conflictName: '巡守隊長 👮',
    conflictAvatar: '👮',
    conflictType: '過度管制者',
    conflictQuote: '「腳踏車在人行步道騎那麼快成何體統？我主張全面禁止單車進入！」',
    choices: [
      {
        key: 'A',
        text: '擴大活動廣場：單車需要下車牽行，廊道中央完全改為水泥休閒大廣場。',
        effects: {
          commuteEfficiency: -20,
          safetySense: -5,
          residentSatisfaction: -8,
          activityVitality: 20,
          merchantSatisfaction: 15,
          conflictValue: 20
        },
        npcFeedback: '「天天要下來推車，那我們根本不會想來騎了。」',
        conflictFeedback: '「週末吵翻天，我一定要天天檢舉！」'
      },
      {
        key: 'B',
        text: '分離快速與停留動線：中央設單車雙向專用道，兩側以複層灌木綠籬阻隔人行道。',
        effects: {
          commuteEfficiency: 15,
          safetySense: 15,
          residentSatisfaction: 10,
          activityVitality: 5,
          merchantSatisfaction: 5,
          ecologicalScore: 10,
          conflictValue: -10
        },
        npcFeedback: '「太棒了！綠籬隔開後，騎車更安全又順暢！」',
        conflictFeedback: '「既然有綠籬擋著撞不到散步的人，我也勉強同意吧。」'
      },
      {
        key: 'C',
        text: '取消活動空間：全段改為硬質鋪面，僅供快速直行，不設任何休閒坐椅。',
        effects: {
          commuteEfficiency: 20,
          safetySense: 10,
          residentSatisfaction: 5,
          activityVitality: -15,
          merchantSatisfaction: -12,
          conflictValue: 10
        },
        npcFeedback: '「雖然快，但連買杯水坐一下的地方都沒有，十分荒涼。」',
        conflictFeedback: '「雖然沒人逗留，但單車騎更猛了，老人還是心驚膽顫！」'
      }
    ]
  },
  {
    id: 2,
    title: '關卡二：商業活動與住宅安靜衝突',
    theme: '商業活動與住宅安靜衝突',
    description: '文創店主希望引進週末市集與街頭藝人帶動生意，但隔壁民宅住戶抱怨吉他喇叭低頻噪音干擾作息。',
    npcName: '文創店主 ☕',
    npcAvatar: '☕',
    npcQuote: '「綠園道不能像乾涸的排水溝！我們需要音樂會和市集人潮，不然店鋪都要倒閉了！」',
    conflictName: '龐克搖滾主唱 🎸',
    conflictAvatar: '🎸',
    conflictType: '噪音製造者',
    conflictQuote: '「音樂就是自由！我們應該全天候用大喇叭放送重金屬，老人家嫌吵不會搬走嗎？」',
    choices: [
      {
        key: 'A',
        text: '讓商業攤位集中住宅旁：允許無管制的露天大型音樂派對與美食市集常態化。',
        effects: {
          residentSatisfaction: -25,
          merchantSatisfaction: 20,
          activityVitality: 25,
          conflictValue: 25
        },
        npcFeedback: '「人潮爆滿！但每天被隔壁住戶潑水檢舉，生意做得心驚膽顫...」',
        conflictFeedback: '「搖滾萬歲！把那些老頑固的玻璃全部震碎！」'
      },
      {
        key: 'B',
        text: '加入植栽緩衝與分時活動：音樂展演限特定區且限時 10:00-20:00，使用定向分貝喇叭並裝設監測儀。',
        effects: {
          residentSatisfaction: 10,
          merchantSatisfaction: 12,
          activityVitality: 10,
          safetySense: 8,
          conflictValue: -12
        },
        npcFeedback: '「雖然有限制，但有定向喇叭，住戶不再抗議，客人也更願意坐下聊天！」',
        conflictFeedback: '「雖然不能唱宵夜場，但至少還能表演，我們會遵守分貝上限的。」'
      },
      {
        key: 'C',
        text: '完全禁止商業活動：全面禁絕市集與藝人表演，只作為基本靜態散步道。',
        effects: {
          residentSatisfaction: 20,
          activityVitality: -20,
          merchantSatisfaction: -20,
          safetySense: 5,
          conflictValue: 10
        },
        npcFeedback: '「扼殺地方創生！沒有生機，綠園道變得像荒地一樣冷清。」',
        conflictFeedback: '「不能唱歌了？好啊，那我天天扛手提收音機在街上跑，看誰管得了！」'
      }
    ]
  },
  {
    id: 3,
    title: '關卡三：生態、安全與夜間活動衝突',
    theme: '生態、安全與夜間活動衝突',
    description: '鳥類保育員希望核心林區夜間完全熄燈以保護貓頭鷹，但八卦鄰居老張宣稱黑暗密林會招致吸毒犯並威脅社區治安。',
    npcName: '野生鳥類保育員 🦉',
    npcAvatar: '🦉',
    npcQuote: '「強烈探照燈會破壞夜行鳥類的生理時鐘。我們要求保留原生林，夜間保持完全黑暗！」',
    conflictName: '八卦老張 🗣️',
    conflictAvatar: '🗣️',
    conflictType: '假消息 NPC',
    conflictQuote: '「如果種滿樹林又不裝超亮路燈，強盜跟毒販一定最喜歡躲在那裡作案啦！」',
    choices: [
      {
        key: 'A',
        text: '大量照明與鋪面：剷除密林鋪設水泥地，裝設高照度 LED 彩色探照燈。',
        effects: {
          ecologicalScore: -30,
          safetySense: 15,
          activityVitality: 15,
          merchantSatisfaction: 12,
          conflictValue: 15
        },
        npcFeedback: '「生態浩劫！原生鳥類全被趕走了，這裡只剩下反光的水泥死寂！」',
        conflictFeedback: '「哈哈！亮堂堂的蚊蟲也少，看那些不三不四的人怎麼躲！」'
      },
      {
        key: 'B',
        text: '分區照明與夜間安全節點：步道使用向下型暖色地燈（避開樹冠），核心林保持低干擾，步道裝設監視器。',
        effects: {
          ecologicalScore: 15,
          safetySense: 18,
          residentSatisfaction: 12,
          activityVitality: 8,
          conflictValue: -15
        },
        npcFeedback: '「指向地燈避開樹冠，鳥類能安靜築巢，同時步道又保留了基本的步行視線。」',
        conflictFeedback: '「有微弱暖光跟監視器看著，晚上帶孫子出來散步總算安心多了。」'
      },
      {
        key: 'C',
        text: '完全不設照明：維持野性黑暗，不設任何人工光源，全面種植密林。',
        effects: {
          ecologicalScore: 25,
          safetySense: -25,
          residentSatisfaction: -15,
          activityVitality: -15,
          conflictValue: 20
        },
        npcFeedback: '「黑冠麻鷺順利安家，昆蟲在林間自由飛舞，這才是原本的大自然！」',
        conflictFeedback: '「你們看，黑漆漆的根本是強盜溫床！昨天好像有人在那邊鬼鬼祟祟！」'
      }
    ]
  }
];
