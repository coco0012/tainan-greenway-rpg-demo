import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { GameStats } from './StatsPanel';
import type { CharacterId } from './CharacterSelect';

export interface LevelChoice {
  id: string;
  text: string;
  effects: Partial<GameStats>;
  npcFeedback: string;
  conflictFeedback: string;
}

export interface LevelData {
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
  choices: LevelChoice[];
  sceneVisual: React.ReactNode;
}

const LEVELS: LevelData[] = [
  {
    id: 1,
    title: '關卡一：東區 大學里 (民族-青年段)',
    theme: '通勤動線衝突',
    description: '此段廊道鄰近大學校區，每日有大量單車通勤族需要在此快速通過，但社區居民同時希望綠廊是休閒、可以坐著聊天辦市集的漫步空間，人車動線嚴重重疊。',
    npcName: '單車通勤大三生',
    npcAvatar: '🚴',
    npcQuote: '「我們每天上下課都要走這段路，這是最省時間的單車通道。如果中間擺滿了花盆、市集帳篷或讓小孩亂跑的坐椅，對我們來說根本就是路障，騎車太危險了！」',
    conflictName: '過度管制者（巡守隊里長）',
    conflictAvatar: '👮',
    conflictType: '過度管制者',
    conflictQuote: '「腳踏車騎那麼快成何體統？把這當高速公路啊！我主張全面禁止單車進入！綠園道就是要百分之百給老人家散步，連椅子都不該擺，免得吸引遊民！」',
    choices: [
      {
        id: '1a',
        text: '規劃極簡通道：拓寬硬質路面，全段設單車高速直行道，不設任何座椅與活動廣場。',
        effects: {
          commuteEfficiency: 20,
          safetySense: 10,
          residentSatisfaction: 5,
          activityVitality: -15,
          merchantSatisfaction: -12,
          conflictValue: 10
        },
        npcFeedback: '「很好，一路順暢！但這裡除了水泥路面之外什麼都沒有，感覺好荒涼。」',
        conflictFeedback: '「哼！雖然沒人逗留，但單車騎更猛了，老人散步還是心驚膽顫！」'
      },
      {
        id: '1b',
        text: '實施人車立體／綠籬分流：中央設雙向專用單車道，兩側以複層灌木綠籬阻隔，設有凹入式的林蔭座椅休憩區。',
        effects: {
          commuteEfficiency: 12,
          safetySense: 15,
          residentSatisfaction: 12,
          activityVitality: 8,
          merchantSatisfaction: 8,
          ecologicalScore: 10,
          conflictValue: -15
        },
        npcFeedback: '「綠籬劃分得很清楚，我們能保持安全車速，累了也可以拐進座椅區休息，真體貼！」',
        conflictFeedback: '「既然有灌木阻隔，腳踏車撞不到散步的人，那我也沒話說了。」'
      },
      {
        id: '1c',
        text: '打造全通透休閒市集廣場：單車騎士進入此段必須下車牽行，廊道中央完全作為活動使用。',
        effects: {
          commuteEfficiency: -20,
          safetySense: -5,
          residentSatisfaction: -8,
          activityVitality: 22,
          merchantSatisfaction: 18,
          conflictValue: 20
        },
        npcFeedback: '「下車牽行？那我們寧可去騎外面危險的柏油馬路，這根本不是通勤友善！」',
        conflictFeedback: '「大廣場？這週末一定吵翻天，到時候別怪我每天打 1999 投訴電話！」'
      }
    ],
    sceneVisual: (
      <div className="relative w-full h-full bg-[#1A2332] rounded-lg overflow-hidden flex flex-col justify-end p-4 border border-blue-500/20">
        <div className="absolute top-4 left-4 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] text-blue-400 font-mono">
          LOCATION: UNIVERSITY SECTION
        </div>
        {/* Draw 2.5D schematic of lane conflict */}
        <div className="w-full h-32 relative bg-slate-900 rounded border border-white/5 overflow-hidden">
          {/* Greenway path */}
          <div className="absolute h-8 bg-slate-700 w-full top-1/2 -translate-y-1/2 transform -skew-x-12 flex items-center justify-between px-8 text-[10px] text-gray-500">
            <span>BIKE ONLY ⚡</span>
            <span>BIKE ONLY ⚡</span>
          </div>
          {/* Pedestrian path */}
          <div className="absolute h-6 bg-emerald-900/40 w-full top-2/3 transform -skew-x-12 border-t border-emerald-500/20" />
          
          {/* Bikes & Pedestrians overlapping */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-xl animate-bounce-slow">🚲</div>
          <div className="absolute top-2/3 left-1/2 -translate-y-1/2 text-base">🚶</div>
          <div className="absolute top-[40%] left-2/3 -translate-y-1/2 text-lg">👩‍🎓</div>
          
          {/* Red line showing warning */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/40 animate-pulse" />
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: '關卡二：中西區 城隍里 (青年-東門段)',
    theme: '商住矛盾衝擊',
    description: '此段緊鄰傳統民宅巷弄，周邊聚集了許多台南在地美食老店與文創咖啡廳。店家極力主張週末舉辦美食市集與街頭藝人駐唱以帶動商機，但周邊高齡住戶則抗議喇叭低頻噪音影響作息。',
    npcName: '文創店主小林',
    npcAvatar: '☕',
    npcQuote: '「台南的魅力就在於巷弄生活感與夜間漫步！沒有特色市集、文創攤位與吉他彈唱，綠園道就只是一條水泥水溝蓋，怎麼留住旅客？我們需要商業活力活絡地方！」',
    conflictName: '噪音製造者（龐克搖滾主唱）',
    conflictAvatar: '🎸',
    conflictType: '噪音製造者',
    conflictQuote: '「音樂就是靈魂！我們主張在綠園道設大型野台、擺巨型重低音音響，全天候播放重金屬搖滾樂，這樣才夠酷！老年人嫌吵不會戴耳塞嗎？」',
    choices: [
      {
        id: '2a',
        text: '保護居住安寧：全面禁止街頭藝人展演與露天攤商設立，僅保留基本綠廊路網。',
        effects: {
          residentSatisfaction: 20,
          activityVitality: -22,
          merchantSatisfaction: -20,
          safetySense: 5,
          conflictValue: 12
        },
        npcFeedback: '「太遺憾了，把綠園道管得死氣沉沉，年輕人跟店面都只會搬離。」',
        conflictFeedback: '「什麼？連插電唱歌都不行？那我天天扛著收音機在街上放最大聲，看誰管得了！」'
      },
      {
        id: '2b',
        text: '劃定限時音量特區：限特定區域設文創攤商，音樂表演僅限 10:00-20:00，且必須使用「限分貝定向喇叭」，並裝設自動分貝計。',
        effects: {
          residentSatisfaction: 12,
          merchantSatisfaction: 15,
          activityVitality: 12,
          safetySense: 8,
          conflictValue: -15
        },
        npcFeedback: '「雖然限制了表演時間，但定向喇叭確實保住了客群，居民也比較願意來散步，是個好妥協！」',
        conflictFeedback: '「雖然不能唱宵夜場，但有總比沒有好。分貝計亮紅燈我們就稍微轉小聲點囉。」'
      },
      {
        id: '2c',
        text: '大商業時代：允許市集常態化與大型插電音樂祭進駐，無噪音與時間管束。',
        effects: {
          residentSatisfaction: -25,
          merchantSatisfaction: 22,
          activityVitality: 25,
          conflictValue: 25
        },
        npcFeedback: '「人潮爆滿，業績翻倍！但是每天被鄰居潑水丟雞蛋，生意做得很心驚膽顫...」',
        conflictFeedback: '「太爽啦！音量炸裂，搖滾萬歲！把那些老頑固的玻璃全部震碎！」'
      }
    ],
    sceneVisual: (
      <div className="relative w-full h-full bg-[#2A1F2D] rounded-lg overflow-hidden flex flex-col justify-end p-4 border border-yellow-500/20">
        <div className="absolute top-4 left-4 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] text-yellow-400 font-mono">
          LOCATION: RESIDENTIAL & SHOP BORDER
        </div>
        {/* Draw 2.5D schematic of shop/residential clash */}
        <div className="w-full h-32 relative bg-slate-900 rounded border border-white/5 overflow-hidden">
          {/* Cafe shop */}
          <div className="absolute w-12 h-10 bg-amber-800/80 border border-yellow-500/30 top-1/4 left-1/4 rounded">
            <div className="bg-yellow-300 w-6 h-2 mx-auto mt-1" />
            <span className="text-[6px] text-white block text-center mt-2">CAFE ☕</span>
          </div>
          {/* Residential house next door */}
          <div className="absolute w-12 h-14 bg-blue-950/90 border border-blue-500/30 top-1/4 left-1/2 rounded">
            <span className="text-[6px] text-gray-400 block text-center mt-2">RESIDENCE 👵</span>
            <div className="text-center text-xs mt-1">💤?</div>
          </div>
          {/* Sound waves overlay */}
          <div className="absolute left-[38%] top-1/2 text-orange-500 animate-pulse text-lg">📢</div>
          <div className="absolute left-[44%] top-1/3 text-red-500 animate-ping text-xs">⚡</div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: '關卡三：中西區 郡王里 (東門-健康段)',
    theme: '生態安全平衡',
    description: '此段廊道被規劃為都市綠肺核心，生態保育者主張種植大量原生密林，且在夜間保持低照明或無照明，以保護築巢的黑冠麻鷺與珍貴鳥類；然而居民與里民卻擔心沒有足夠的探照燈會造成治安死角、滋生犯罪。',
    npcName: '野生鳥類保育員',
    npcAvatar: '🦉',
    npcQuote: '「都市中的野生動物已經無處可去了！強烈的白色探照燈會摧毀夜行動物的生理時鐘，讓幼鳥無法在黑暗中尋找昆蟲。我們強烈要求保留未開發的原生樹林，且夜間完全熄燈！」',
    conflictName: '假消息 NPC（八卦鄰居老張）',
    conflictAvatar: '🗣️',
    conflictType: '假消息 NPC',
    conflictQuote: '「我聽說綠園道如果種滿黑壓壓的樹林又不裝超亮路燈，強盜跟毒販一定最喜歡躲在那裡作案！種樹只會讓治安變壞、房價下跌啦！應該通通砍掉鋪水泥，裝滿 LED 探照燈！」',
    choices: [
      {
        id: '3a',
        text: '絕對保育主義：全區種植複層茂密森林，取消夜間路燈照明，維持野性黑暗。',
        effects: {
          ecologicalScore: 25,
          safetySense: -25,
          residentSatisfaction: -15,
          activityVitality: -15,
          conflictValue: 20
        },
        npcFeedback: '「太美了！黑冠麻鷺順利繁育，昆蟲在林間飛舞，這才是自然！」',
        conflictFeedback: '「你們看，黑漆漆的根本是強盜溫床！昨天好像有人在那邊鬼鬼祟祟，大家千萬別進去！」'
      },
      {
        id: '3b',
        text: '暗空智能照明：種植蜜源植物與原生林，步道裝設「向下指向型低眩光暖色地燈」（避開樹冠），核心林區保持低干擾，並於步道節點裝設緊急警報監視器。',
        effects: {
          ecologicalScore: 16,
          safetySense: 18,
          residentSatisfaction: 12,
          activityVitality: 8,
          conflictValue: -15
        },
        npcFeedback: '「溫暖的下向暖燈避開了樹冠，鳥類不會被眩光干擾，同時又保留了核心森林，非常高明！」',
        conflictFeedback: '「暖色燈光照亮了腳下的路，又有監視器看著，晚上帶孫子出來散步總算安心了。」'
      },
      {
        id: '3c',
        text: '超亮人工廣場：剷除大部分林地改為水泥鋪面廣場，裝設高功率全彩 LED 投光燈，如白晝般照亮整條廊道。',
        effects: {
          ecologicalScore: -30,
          safetySense: 15,
          activityVitality: 15,
          merchantSatisfaction: 12,
          conflictValue: 15
        },
        npcFeedback: '「這簡直是生態浩劫！鳥類全被嚇跑了，大自然被改造成了水泥荒漠！」',
        conflictFeedback: '「哈哈，亮堂堂的蚊蟲也少，看那些不三不四的人怎麼躲！這才是現代化城市！」'
      }
    ],
    sceneVisual: (
      <div className="relative w-full h-full bg-[#112521] rounded-lg overflow-hidden flex flex-col justify-end p-4 border border-emerald-500/20">
        <div className="absolute top-4 left-4 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono">
          LOCATION: ECOLOGICAL BUFFER ZONE
        </div>
        {/* Draw 2.5D schematic of eco/lighting clash */}
        <div className="w-full h-32 relative bg-slate-900 rounded border border-white/5 overflow-hidden">
          {/* Trees */}
          <div className="absolute text-3xl bottom-2 left-6 z-10">🌳</div>
          <div className="absolute text-2xl bottom-2 left-16 z-10">🌲</div>
          <div className="absolute text-2xl bottom-2 left-1 z-10 opacity-70">🌳</div>

          {/* Owl inside tree */}
          <div className="absolute text-xs bottom-9 left-9 z-20">🦉</div>

          {/* Street light with yellow beam gradient */}
          <div className="absolute right-10 bottom-0 w-8 h-20 flex flex-col items-center justify-end">
            <div className="w-1 h-16 bg-gray-600" />
            <div className="w-4 h-2 bg-gray-500 rounded-t" />
            {/* Light beam */}
            <div className="absolute top-4 right-[-20px] w-12 h-16 bg-gradient-to-b from-yellow-300/30 to-transparent rounded-b-full pointer-events-none transform -rotate-12" />
          </div>
          
          <div className="absolute bottom-2 right-12 text-xs">🗣️</div>
        </div>
      </div>
    )
  }
];

interface LevelSceneProps {
  levelId: number;
  stats: GameStats;
  characterId: CharacterId;
  onSelectOption: (effects: Partial<GameStats>, choiceId: string) => void;
  onBackToMap: () => void;
}

export const LevelScene: React.FC<LevelSceneProps> = ({
  levelId,
  stats: _stats,
  characterId,
  onSelectOption,
  onBackToMap
}) => {
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [hoveredChoiceId, setHoveredChoiceId] = useState<string | null>(null);

  // Character specific calculations:
  // e.g. "resident": residents negatives reduced by 50%
  // e.g. "designer": conflict score raised is reduced by 30%
  const adjustEffectsForRole = (effects: Partial<GameStats>): Partial<GameStats> => {
    const adjusted = { ...effects };
    
    if (characterId === 'resident') {
      // Half resident satisfaction negatives
      if (adjusted.residentSatisfaction && adjusted.residentSatisfaction < 0) {
        adjusted.residentSatisfaction = Math.round(adjusted.residentSatisfaction / 2);
      }
    }
    
    if (characterId === 'merchant') {
      // Boost positive merchant satisfaction
      if (adjusted.merchantSatisfaction && adjusted.merchantSatisfaction > 0) {
        adjusted.merchantSatisfaction = Math.round(adjusted.merchantSatisfaction * 1.2);
      }
      // Boost positive activityVitality
      if (adjusted.activityVitality && adjusted.activityVitality > 0) {
        adjusted.activityVitality = Math.round(adjusted.activityVitality * 1.2);
      }
    }

    if (characterId === 'ecology') {
      // Boost positive ecologicalScore
      if (adjusted.ecologicalScore && adjusted.ecologicalScore > 0) {
        adjusted.ecologicalScore = Math.round(adjusted.ecologicalScore * 1.3);
      }
    }

    if (characterId === 'youth') {
      // Boost positive activityVitality
      if (adjusted.activityVitality && adjusted.activityVitality > 0) {
        adjusted.activityVitality = Math.round(adjusted.activityVitality * 1.3);
      }
    }

    if (characterId === 'designer') {
      // Reduce conflict rise by 30%
      if (adjusted.conflictValue && adjusted.conflictValue > 0) {
        adjusted.conflictValue = Math.round(adjusted.conflictValue * 0.7);
      }
    }

    return adjusted;
  };

  const handleChoiceClick = (choice: LevelChoice) => {
    setSelectedChoiceId(choice.id);
    const adjusted = adjustEffectsForRole(choice.effects);
    onSelectOption(adjusted, choice.id);
  };

  const chosenChoice = level.choices.find(c => c.id === selectedChoiceId);

  return (
    <div className="min-h-screen w-full bg-game-bg p-4 md:p-8 flex flex-col justify-between items-center relative overflow-hidden">
      
      {/* Background Neon Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-game-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-game-accent/5 rounded-full blur-3xl" />

      {/* TOP HEADER */}
      <div className="w-full max-w-6xl flex justify-between items-center z-10 pb-2 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBackToMap}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-game-primary transition-colors bg-white/5 px-3 py-1.5 rounded border border-white/10"
          >
            <ArrowLeft size={14} /> 返回地圖
          </button>
          <span className="text-xs text-game-primary font-mono tracking-widest hidden sm:inline ml-2 uppercase">
            🗺️ PUBLIC NEGOTIATION ARENA
          </span>
        </div>
        <div className="text-right">
          <h2 className="text-sm font-bold text-white tracking-wide">{level.theme}</h2>
          <span className="text-[10px] text-gray-400 font-mono">TASK NODE {level.id} OF 3</span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl z-10 flex-1 items-stretch">
        
        {/* LEFT PANEL: DIALOG & ILLUSTRATION (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Topic description */}
          <div className="glass-panel p-4 rounded-xl border-white/5">
            <h3 className="text-game-primary text-xs font-mono tracking-wider uppercase mb-1">
              📍 協商背景爭執
            </h3>
            <h1 className="text-base font-bold text-white mb-2">{level.title}</h1>
            <p className="text-xs text-gray-300 leading-relaxed">
              {level.description}
            </p>
          </div>

          {/* Visual Canvas illustration */}
          <div className="h-48 rounded-xl overflow-hidden relative">
            {level.sceneVisual}
          </div>

          {/* NPC Dialogue Dialog box */}
          <div className="glass-panel-heavy p-4 rounded-xl border-game-secondary/20 flex flex-col gap-3 flex-1 justify-center relative">
            <div className="absolute inset-0 opacity-5 pixel-grid-bg" />
            
            {/* Dialog 1: NPC Advocate */}
            <div className="flex gap-3 items-start z-10">
              <div className="w-12 h-12 rounded-lg bg-game-bg border border-game-primary/30 flex items-center justify-center text-3xl shadow-md">
                {level.npcAvatar}
              </div>
              <div className="flex-1 bg-black/45 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] text-game-primary font-mono font-bold block mb-1">
                  📢 倡議代表 - {level.npcName}
                </span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  {level.npcQuote}
                </p>
              </div>
            </div>

            {/* Dialog 2: Conflict antagonist */}
            <div className="flex gap-3 items-start z-10">
              <div className="w-12 h-12 rounded-lg bg-game-bg border border-game-accent/30 flex items-center justify-center text-3xl shadow-md">
                {level.conflictAvatar}
              </div>
              <div className="flex-1 bg-black/45 p-3 rounded-lg border border-game-accent/20">
                <span className="text-[10px] text-game-accent font-mono font-bold block mb-1 flex items-center gap-1">
                  <ShieldAlert size={10} className="animate-pulse" />
                  衝突對象 - {level.conflictName} ({level.conflictType})
                </span>
                <p className="text-xs text-orange-400 leading-relaxed italic">
                  {level.conflictQuote}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: THREE OPTIONS AND RESULTS (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="glass-panel p-4 rounded-xl border-white/5 flex flex-col gap-3">
            <h3 className="text-game-accent text-xs font-mono tracking-wider uppercase border-b border-white/5 pb-2">
              🛠️ 協商規劃對策方案
            </h3>
            
            {/* Option Cards */}
            <div className="flex flex-col gap-3">
              {level.choices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;
                const isHovered = hoveredChoiceId === choice.id;
                const isDisabled = selectedChoiceId !== null;

                const displayEffects = adjustEffectsForRole(choice.effects);

                return (
                  <button
                    key={choice.id}
                    disabled={isDisabled}
                    onMouseEnter={() => !isDisabled && setHoveredChoiceId(choice.id)}
                    onMouseLeave={() => setHoveredChoiceId(null)}
                    onClick={() => handleChoiceClick(choice)}
                    className={`text-left p-3 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-game-primary/10 border-game-primary shadow-lg shadow-game-primary/10'
                        : isDisabled
                          ? 'border-white/5 bg-black/20 opacity-50 cursor-not-allowed'
                          : 'border-white/5 hover:border-game-primary/40 bg-black/40 hover:bg-black/60 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border mt-0.5 ${
                        isSelected 
                          ? 'bg-game-primary text-black border-game-primary' 
                          : 'bg-black/50 text-gray-400 border-white/10'
                      }`}>
                        {index === 0 ? 'A' : index === 1 ? 'B' : 'C'}
                      </span>
                      <p className="text-xs text-white leading-relaxed font-semibold">
                        {choice.text}
                      </p>
                    </div>

                    {/* Preview values when hovered (or when selected) */}
                    {(isHovered || isSelected) && (
                      <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                        {Object.entries(displayEffects).map(([key, val]) => {
                          const valNum = val as number;
                          const isPos = valNum > 0;
                          
                          let label = key;
                          if (key === 'residentSatisfaction') label = '居民滿意';
                          if (key === 'merchantSatisfaction') label = '商家滿意';
                          if (key === 'commuteEfficiency') label = '通勤效率';
                          if (key === 'ecologicalScore') label = '生態分數';
                          if (key === 'safetySense') label = '安全感';
                          if (key === 'activityVitality') label = '活動活力';
                          if (key === 'conflictValue') label = '衝突值';

                          return (
                            <span 
                              key={key} 
                              className={isPos ? 'text-green-400 font-bold' : 'text-red-400'}
                            >
                              {label} {isPos ? `+${valNum}` : valNum}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dialog bubble feedback showing after choice selection */}
          {selectedChoiceId !== null && chosenChoice && (
            <div className="glass-panel-heavy p-4 rounded-xl border-game-primary/30 flex flex-col gap-3 animate-fade-in">
              <h3 className="text-game-success text-xs font-mono tracking-widest uppercase flex items-center gap-1 border-b border-white/5 pb-2">
                <CheckCircle2 size={12} className="text-game-success" />
                規劃案實施回饋
              </h3>
              
              <div className="flex flex-col gap-2">
                <div className="bg-game-primary/5 p-2 rounded border border-game-primary/10">
                  <span className="text-[9px] text-game-primary block font-mono">倡議方反應:</span>
                  <p className="text-xs text-gray-300 italic">{chosenChoice.npcFeedback}</p>
                </div>
                
                <div className="bg-game-accent/5 p-2 rounded border border-game-accent/10">
                  <span className="text-[9px] text-game-accent block font-mono">衝突方反應:</span>
                  <p className="text-xs text-orange-300 italic">{chosenChoice.conflictFeedback}</p>
                </div>
              </div>

              <button
                onClick={onBackToMap}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-game-success to-emerald-600 hover:opacity-95 text-black font-extrabold text-xs tracking-wider rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                完成本次協商，返回地圖
              </button>
            </div>
          )}

        </div>

      </div>

      <div className="text-[9px] text-gray-500 font-mono tracking-widest mt-6">
        TAINAN GREENWAY DEBATE HUB v3.0.0
      </div>

    </div>
  );
};
