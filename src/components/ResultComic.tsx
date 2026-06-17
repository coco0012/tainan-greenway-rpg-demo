import React, { useState } from 'react';
import { Award, Users } from 'lucide-react';
import type { GameStats } from './StatsPanel';

interface ResultComicProps {
  stats: GameStats;
  onNext: () => void;
  selectedCharName: string;
}

interface ComicCitizen {
  id: string;
  name: string;
  role: string;
  avatar: string;
  position: { left: string; top: string };
  // Function to determine bubble content based on stats
  getBubble: (stats: GameStats) => string;
  statKey: keyof GameStats | 'general';
}

const CITIZENS: ComicCitizen[] = [
  {
    id: 'resident',
    name: '李大媽',
    role: '在地居民',
    avatar: '👵',
    position: { left: '12%', top: '45%' },
    statKey: 'residentSatisfaction',
    getBubble: (stats) => 
      stats.residentSatisfaction >= 55 
        ? '「廊道留下了安靜的林蔭，晚上也沒噪音，我們老人能睡個好覺了！」'
        : '「吵死了！週末市集跟吉他唱歌開那麼大聲，我都快得心臟病了！」'
  },
  {
    id: 'merchant',
    name: '陳老闆',
    role: '文創店主',
    avatar: '☕',
    position: { left: '28%', top: '55%' },
    statKey: 'merchantSatisfaction',
    getBubble: (stats) => 
      stats.merchantSatisfaction >= 55
        ? '「市集分流規劃得好，店面客人不斷，營業額提升不少！」'
        : '「限制太多了！門口冷冷清清，連一個遊客都沒有，我們要倒閉了啦！」'
  },
  {
    id: 'commuter',
    name: '阿強',
    role: '自行車通勤族',
    avatar: '🚴',
    position: { left: '45%', top: '38%' },
    statKey: 'commuteEfficiency',
    getBubble: (stats) => 
      stats.commuteEfficiency >= 55
        ? '「通勤專用道很直捷，沒有亂七八糟的攤位擋路，上班不遲到了！」'
        : '「動線被市集大廣場切得稀巴爛，每天都要下車牽行，騎得超痛苦！」'
  },
  {
    id: 'ecology',
    name: '林教授',
    role: '生態倡議者',
    avatar: '🦉',
    position: { left: '72%', top: '35%' },
    statKey: 'ecologicalScore',
    getBubble: (stats) => 
      stats.ecologicalScore >= 55
        ? '「保留了原生密林，改用低光害的向下暖地燈，昨晚看到黑冠麻鷺回來了！」'
        : '「這哪是綠廊？根本是水泥地鋪滿彩光LED，生態棲地全毀了！」'
  },
  {
    id: 'elderly',
    name: '張爺爺',
    role: '社區長者',
    avatar: '👴',
    position: { left: '20%', top: '65%' },
    statKey: 'safetySense',
    getBubble: (stats) => 
      stats.safetySense >= 55
        ? '「路燈溫暖，地不滑，又有監視器，晚上散步總算覺得很安心。」'
        : '「沒有光害是很好，但黑漆漆的根本不敢去，跌倒或遇到壞人怎麼辦？」'
  },
  {
    id: 'child',
    name: '小明',
    role: '嬉戲孩童',
    avatar: '👦',
    position: { left: '60%', top: '62%' },
    statKey: 'safetySense',
    getBubble: (stats) => 
      stats.safetySense >= 50 && stats.activityVitality >= 50
        ? '「放學後能來綠廊踩草皮、玩捉迷藏，而且不用怕被機車撞，好開心！」'
        : '「這裡除了水泥地就是黑森林，爸爸媽媽說不安全，不准我來玩。」'
  },
  {
    id: 'youth',
    name: '莉莉',
    role: '街頭吉他手',
    avatar: '🎸',
    position: { left: '84%', top: '50%' },
    statKey: 'activityVitality',
    getBubble: (stats) => 
      stats.activityVitality >= 55
        ? '「終於有合適的戶外廣場可以表演，大家圍在一起聽歌，氣氛超讚！」'
        : '「限制一大堆，這也不能做那也不能擺，綠園道變得像停屍間一樣死寂。」'
  },
  {
    id: 'rioter',
    name: '隔壁老張',
    role: '抱怨暴民',
    avatar: '🗣️',
    position: { left: '55%', top: '48%' },
    statKey: 'conflictValue',
    getBubble: (stats) => 
      stats.conflictValue <= 30
        ? '「哼……雖然一開始很不爽，但看在這次有認真聽取大家意見的份上，勉強接受啦。」'
        : '「大爛政！這規劃根本是在製造民怨，誰出門誰倒楣，我要去市政府靜坐！」'
  }
];

export const ResultComic: React.FC<ResultComicProps> = ({ stats, onNext, selectedCharName }) => {
  const [activeCitizenId, setActiveCitizenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full bg-game-bg p-4 md:p-8 flex flex-col justify-between items-center relative overflow-hidden">
      
      {/* Background overlay */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-game-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-game-accent/5 rounded-full blur-3xl" />

      {/* HEADER */}
      <div className="text-center z-10 mb-6">
        <span className="text-xs text-game-primary font-mono tracking-widest uppercase glow-text">
          🎨 TAINAN GREENWAY - THE FINAL CANVAS
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-white mt-1 tracking-wider">
          綠園道共創規劃成果 (Planning Results)
        </h1>
        <p className="text-xs text-gray-400 mt-2 max-w-xl mx-auto">
          你身為【{selectedCharName}】所做的協商決策，塑造了此處綠園道的最終樣貌。懸停於市民身上，聆聽他們最真實的聲音！
        </p>
      </div>

      {/* 2.5D INTERACTIVE COMIC SECTION */}
      <div className="w-full max-w-4xl glass-panel p-6 rounded-2xl glow-border border-game-primary/30 z-10 flex flex-col gap-6">
        
        {/* The 2.5D Illustration Canvas */}
        <div className="relative w-full aspect-[2/1] bg-slate-950/80 rounded-xl overflow-hidden border border-white/5 shadow-inner">
          <div className="absolute inset-0 pixel-grid-bg opacity-10" />

          {/* Greenway Background Path */}
          <div className="absolute inset-x-0 h-16 bg-gradient-to-r from-emerald-950/60 via-emerald-800/40 to-slate-900/60 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-x-0 top-[48%] h-0.5 bg-game-secondary/20" />
          <div className="absolute inset-x-0 top-[58%] h-0.5 bg-game-secondary/20" />

          {/* Background environment items based on stats */}
          <div className="absolute top-[28%] left-[10%] text-3xl">🏠</div>
          <div className="absolute top-[32%] left-[25%] text-2xl">🏪</div>
          <div className="absolute top-[28%] left-[78%] text-3xl">🌳</div>
          <div className="absolute top-[32%] left-[68%] text-2xl">🌲</div>
          <div className="absolute top-[62%] left-[48%] text-xl">🛋️</div>
          <div className="absolute top-[42%] left-[90%] text-xl">💡</div>

          {/* Speech bubble popup (Single floating bubble above the active character) */}
          {activeCitizenId && (
            <div 
              className="absolute bg-black/95 text-white border-2 border-game-primary px-4 py-2.5 rounded-xl shadow-2xl z-20 max-w-[280px] animate-slide-up"
              style={{
                left: CITIZENS.find(c => c.id === activeCitizenId)?.position.left,
                top: `calc(${CITIZENS.find(c => c.id === activeCitizenId)?.position.top} - 80px)`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Little speech arrow */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-[10px] border-t-game-primary" />
              
              <div className="flex justify-between items-center mb-1 border-b border-white/5 pb-1">
                <span className="text-[10px] font-bold text-game-primary">
                  {CITIZENS.find(c => c.id === activeCitizenId)?.name} ({CITIZENS.find(c => c.id === activeCitizenId)?.role})
                </span>
                <span className="text-[8px] text-gray-500 font-mono">
                  {CITIZENS.find(c => c.id === activeCitizenId)?.statKey}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-200">
                {CITIZENS.find(c => c.id === activeCitizenId)?.getBubble(stats)}
              </p>
            </div>
          )}

          {/* Interactive Citizens Rendering */}
          {CITIZENS.map((cit) => {
            const isActive = activeCitizenId === cit.id;
            
            // Check satisfaction status for coloring ring
            let ringColor = 'border-gray-500';
            if (cit.statKey !== 'general') {
              const val = stats[cit.statKey as keyof GameStats];
              if (cit.id === 'rioter') {
                ringColor = stats.conflictValue > 45 ? 'border-game-danger animate-pulse' : 'border-game-success';
              } else if (val >= 55) {
                ringColor = 'border-game-success';
              } else if (val < 45) {
                ringColor = 'border-game-danger';
              }
            }

            return (
              <div
                key={cit.id}
                className="absolute cursor-pointer select-none group"
                style={{
                  left: cit.position.left,
                  top: cit.position.top,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setActiveCitizenId(cit.id)}
                onMouseLeave={() => setActiveCitizenId(null)}
              >
                {/* Character Avatar Node */}
                <div 
                  className={`w-12 h-12 rounded-full border-2 bg-slate-900/95 flex items-center justify-center text-2xl transition-all duration-300 relative ${ringColor} ${
                    isActive ? 'scale-125 z-10 shadow-[0_0_15px_rgba(102,252,241,0.6)]' : 'hover:scale-110'
                  }`}
                >
                  {cit.avatar}

                  {/* Character Name Tag */}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 px-1 py-0.5 rounded text-[8px] whitespace-nowrap text-gray-400 border border-white/5 opacity-70 group-hover:opacity-100 transition-opacity">
                    {cit.name}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

        {/* Dynamic HUD indicator for comic stage */}
        <div className="flex justify-between items-center text-xs bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-300">
            <Users size={16} className="text-game-primary" />
            <span>滑鼠懸停人物可察看對應指標的回饋</span>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] text-game-success font-semibold">
              <span className="w-2 h-2 rounded-full bg-game-success" /> 滿意度佳
            </span>
            <span className="flex items-center gap-1 text-[10px] text-game-danger font-semibold">
              <span className="w-2 h-2 rounded-full bg-game-danger" /> 滿意度欠佳
            </span>
          </div>
        </div>

      </div>

      {/* ACTION BUTTON */}
      <button
        onClick={onNext}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-game-primary to-game-secondary hover:opacity-95 text-black font-extrabold text-sm tracking-widest rounded-xl shadow-xl shadow-game-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <Award size={16} className="animate-bounce-slow" /> 查看協商績效與獲頒獎章
      </button>

      <div className="text-[9px] text-gray-500 font-mono mt-6">
        TAINAN GREENWAY PROJECT RESOLUTION REVIEW v3.0.0
      </div>

    </div>
  );
};
