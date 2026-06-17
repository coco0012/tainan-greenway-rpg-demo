import React from 'react';
import { RefreshCw, AlertTriangle, BarChart3, MessageSquare } from 'lucide-react';
import type { GameStats } from './StatsPanel';

interface AwardSceneProps {
  stats: GameStats;
  selectedCharName: string;
  onRestart: () => void;
}

export const AwardScene: React.FC<AwardSceneProps> = ({ stats, selectedCharName: _selectedCharName, onRestart }) => {
  
  // Calculate title based on final scores
  const getAwardData = (stats: GameStats) => {
    if (stats.conflictValue >= 45 && stats.residentSatisfaction < 45) {
      return {
        title: '混亂規劃師',
        badge: '💥',
        color: 'text-game-danger border-game-danger/40 bg-game-danger/5 shadow-[0_0_20px_rgba(255,49,49,0.2)]',
        description: '你規劃的綠園道充斥著噪音糾紛與居民投訴，商業、通勤與生態利益完全失衡，這無疑是一個動盪的都市混亂現場！'
      };
    }
    if (stats.ecologicalScore >= 65) {
      return {
        title: '綠色守護者',
        badge: '🌿',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        description: '你成功為府城保留了寶貴的原生林帶與生物核心棲地！暗空暖燈守護了夜行動物的安寧，生態效益非常卓越！'
      };
    }
    if (stats.activityVitality >= 65 && stats.merchantSatisfaction >= 60) {
      return {
        title: '活力策展人',
        badge: '🎸',
        color: 'text-purple-400 border-purple-500/40 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
        description: '你打造的綠廊活力爆表！滑板青年、街頭樂手與特色市集交匯於此，店面高朋滿座，是個熱鬧非凡的市民舞台！'
      };
    }
    if (stats.commuteEfficiency >= 65 && stats.safetySense >= 60) {
      return {
        title: '流線規劃師',
        badge: '🚲',
        color: 'text-blue-400 border-blue-500/40 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        description: '你極佳地梳理了人行與單車流線，通道安全性與效率奇高。通勤族在綠意中流暢穿梭，效率滿分！'
      };
    }
    if (stats.conflictValue <= 20) {
      return {
        title: '衝突調停者',
        badge: '🤝',
        color: 'text-game-primary border-game-primary/40 bg-game-primary/5 shadow-[0_0_20px_rgba(102,252,241,0.2)]',
        description: '你是公共協商談判的高超調停專家！用智慧與高度分流的手段完美化解了鄰里摩擦，創造了極高的社會和諧度！'
      };
    }
    // Default balanced
    return {
      title: '城市共感設計師',
      badge: '📐',
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      description: '你在居民清靜、商家利益、單車效率、生態綠化與安全照明的拉扯中，尋找到了最平衡的公約數，打造出一個兼顧包容與發展的新台南地標！'
    };
  };

  const award = getAwardData(stats);

  // Character evaluation comments based on scores
  const evalComments = [
    {
      role: '居民代表 👵',
      comment: stats.residentSatisfaction >= 55 
        ? '「這次的規劃顧慮到了老人家散步安全，晚上也沒有吵死人的音響，真的很感謝協調官！」'
        : '「每天吵吵鬧鬧，這叫我們周邊鄰居怎麼生活？協商根本沒有誠意！」'
    },
    {
      role: '商家代表 🏪',
      comment: stats.merchantSatisfaction >= 55 
        ? '「動線引流做得好，店面生意蒸蒸日上。有活動廣場，客人都願意留下來喝杯咖啡！」'
        : '「綠園道冷冷清清，規定一大堆，這根本是要斷我們生路，真倒楣！」'
    },
    {
      role: '生態倡議者 🌿',
      comment: stats.ecologicalScore >= 55 
        ? '「沒有為了賺錢把林地全剷平，暖色指向燈光對鳥類影響很小，我們給予高度肯定。」'
        : '「到處都是水泥鋪面跟彩色LED光害，這根本不是生態綠廊，大自然哭了！」'
    },
    {
      role: '通勤族 🚲',
      comment: stats.commuteEfficiency >= 55 
        ? '「有劃分清楚的人車分流專用道，通勤能維持速度，又安全，規劃得好！」'
        : '「路障多、廣場大，騎單車一直被活動攤位擋路，通勤速度慘不忍睹！」'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-game-bg p-6 md:p-12 flex flex-col justify-between items-center relative overflow-hidden">
      
      {/* Background Lights */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-game-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-game-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* HEADER */}
      <div className="text-center z-10 mb-4">
        <span className="text-xs text-game-primary font-mono tracking-widest uppercase">
          🏆 TAINAN GREENWAY RPG - END OF STAGE
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-white mt-1 tracking-wider glow-text">
          都市協商專案總結 (Project Evaluation)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl z-10 items-stretch flex-1">
        
        {/* LEFT COLUMN: TITLE & AWARD DESCRIPTION (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-center">
          
          {/* Big Medal Card */}
          <div className={`glass-panel p-8 rounded-2xl border text-center flex flex-col items-center gap-4 ${award.color}`}>
            <span className="text-[9px] text-gray-400 font-mono tracking-widest block uppercase">
              CONGRATULATIONS OFFICER
            </span>
            
            {/* Pulsing Medal Shape */}
            <div className="w-24 h-24 rounded-full bg-black/40 border-2 border-current flex items-center justify-center text-5xl relative animate-float shadow-xl">
              {award.badge}
              <div className="absolute inset-0 rounded-full border border-dashed border-current opacity-40 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            <div>
              <span className="text-xs text-gray-300">榮獲都市稱號</span>
              <h2 className="text-2xl font-black tracking-widest mt-1 text-white glow-text">
                【{award.title}】
              </h2>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-xs">
              {award.description}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED REPORT & REVIEWS (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Detailed stats summary */}
          <div className="glass-panel p-5 rounded-xl border-white/5">
            <h3 className="text-game-primary text-xs font-mono tracking-wider mb-3 flex items-center gap-1">
              <BarChart3 size={14} /> 最終規劃績效數值
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '居民滿意度', value: stats.residentSatisfaction, color: 'text-green-400' },
                { label: '商家滿意度', value: stats.merchantSatisfaction, color: 'text-yellow-400' },
                { label: '通勤效率', value: stats.commuteEfficiency, color: 'text-blue-400' },
                { label: '生態分數', value: stats.ecologicalScore, color: 'text-emerald-400' },
                { label: '安全感', value: stats.safetySense, color: 'text-indigo-400' },
                { label: '活動活力', value: stats.activityVitality, color: 'text-purple-400' },
              ].map((item) => (
                <div key={item.label} className="bg-black/35 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className={`font-mono font-bold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Conflict display row */}
            <div className="mt-4 p-3 bg-black/50 border border-game-accent/20 rounded-lg flex justify-between items-center">
              <span className="text-xs text-game-accent font-semibold flex items-center gap-1">
                <AlertTriangle size={14} /> 最終城市衝突值
              </span>
              <span className={`font-mono font-bold text-base ${stats.conflictValue > 40 ? 'text-game-danger animate-pulse' : 'text-game-primary'}`}>
                {stats.conflictValue}
              </span>
            </div>
          </div>

          {/* Citizen reviews list */}
          <div className="glass-panel p-5 rounded-xl border-white/5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-game-primary text-xs font-mono tracking-wider mb-3 flex items-center gap-1">
                <MessageSquare size={14} /> 代表性市民意見回顧
              </h3>
              
              <div className="flex flex-col gap-3">
                {evalComments.map((item, idx) => (
                  <div key={idx} className="text-xs flex gap-2.5 items-start border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <span className="font-semibold text-white whitespace-nowrap min-w-[90px]">{item.role}</span>
                    <p className="text-gray-300 italic">
                      {item.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-8 z-10 w-full max-w-5xl flex justify-center gap-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-game-primary to-game-secondary hover:opacity-95 text-black font-extrabold text-sm tracking-widest rounded-xl shadow-xl shadow-game-primary/25 hover:scale-105 active:scale-95 transition-all"
        >
          <RefreshCw size={16} /> 重新規劃新方案 (Replay)
        </button>
      </div>

      <div className="text-[9px] text-gray-500 font-mono tracking-widest mt-6">
        TAINAN GREENWAY ASSESSMENT COMPLETE // DEPLOYMENT READY
      </div>

    </div>
  );
};
