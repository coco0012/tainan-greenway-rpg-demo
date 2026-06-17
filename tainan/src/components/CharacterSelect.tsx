import React, { useState } from 'react';
import { Zap, Sparkles, Award } from 'lucide-react';
import type { GameStats } from './StatsPanel';

export type CharacterId = 'resident' | 'merchant' | 'commuter' | 'ecology' | 'youth' | 'designer';

export interface Character {
  id: CharacterId;
  name: string;
  avatar: string;
  description: string;
  specialAbilityName: string;
  specialAbilityDesc: string;
  statModifier: Partial<GameStats>;
}

export const CHARACTERS: Character[] = [
  {
    id: 'resident',
    name: '居民代表',
    avatar: '👵',
    description: '綠園道旁的長年住戶，注重夜間安寧、散步安全與日常生活品質，抗拒嘈雜噪音與過度商業化。',
    specialAbilityName: '寧靜領域',
    specialAbilityDesc: '居民滿意度的負面扣減減半。',
    statModifier: {
      residentSatisfaction: 15,
      conflictValue: -5,
      activityVitality: -10,
    }
  },
  {
    id: 'merchant',
    name: '商家代表',
    avatar: '🏪',
    description: '沿線店面與市集發起人，希望綠園道能引進觀光人潮，推動商業活動與夜間亮點工程以刺激消費。',
    specialAbilityName: '黃金人流',
    specialAbilityDesc: '商業活動與廣場設計帶來的滿意度加成 +20%。',
    statModifier: {
      merchantSatisfaction: 15,
      activityVitality: 10,
      residentSatisfaction: -5,
    }
  },
  {
    id: 'commuter',
    name: '通勤者代表',
    avatar: '🚲',
    description: '騎自行車或搭乘大眾運輸的通勤族，最關心通勤動線的直捷性、無障礙設計與節點的便利轉換。',
    specialAbilityName: '暢行無阻',
    specialAbilityDesc: '通勤效率的基本保底值增加 10 點。',
    statModifier: {
      commuteEfficiency: 15,
      safetySense: 5,
      activityVitality: -5,
    }
  },
  {
    id: 'ecology',
    name: '生態倡議者',
    avatar: '🌿',
    description: '推動綠色覆蓋率與原生植物保護的團體，反對夜間高亮度照明，主張留出不受人類打擾的生物棲地。',
    specialAbilityName: '荒野共生',
    specialAbilityDesc: '種植植栽與低照明設計的生態加成 +30%。',
    statModifier: {
      ecologicalScore: 20,
      safetySense: -5,
      merchantSatisfaction: -5,
    }
  },
  {
    id: 'youth',
    name: '青年活動策展人',
    avatar: '🎸',
    description: '街頭藝人、青年社團與文創策展人，渴望綠園道能提供大面積、免申請的彈性滑板場地與野台廣場。',
    specialAbilityName: '創意爆發',
    specialAbilityDesc: '戶外展演與滑板廣場帶來的活動活力加成 +30%。',
    statModifier: {
      activityVitality: 20,
      merchantSatisfaction: 5,
      residentSatisfaction: -10,
    }
  },
  {
    id: 'designer',
    name: '城市設計師',
    avatar: '📐',
    description: '專業的景觀城市規劃團隊，注重多方利益的平衡與空間美感，追求衝突降到最低的合理共融設計。',
    specialAbilityName: '系統性平衡',
    specialAbilityDesc: '每次選擇造成的「衝突值」上升減少 30%。',
    statModifier: {
      residentSatisfaction: 5,
      merchantSatisfaction: 5,
      commuteEfficiency: 5,
      ecologicalScore: 5,
      safetySense: 5,
      activityVitality: 5,
    }
  }
];

interface CharacterSelectProps {
  onSelect: (id: CharacterId) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<CharacterId>('designer');

  const selectedChar = CHARACTERS.find(c => c.id === selectedId) || CHARACTERS[5];

  const handleConfirm = () => {
    onSelect(selectedId);
  };

  return (
    <div className="min-h-screen w-full bg-game-bg p-6 md:p-12 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-game-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-game-accent/5 rounded-full blur-3xl" />
      
      {/* Title */}
      <div className="text-center z-10 mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest glow-text">
          🎭 選擇你的協商角色 (Select Role)
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-2 font-mono uppercase tracking-wider">
          不同的身分將決定你的初始數值，並解鎖獨特的公共協商天賦
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl z-10 items-stretch">
        
        {/* Left/Middle Cards Selection Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selectedId;
            return (
              <div
                key={char.id}
                onClick={() => setSelectedId(char.id)}
                className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between items-center text-center ${
                  isSelected 
                    ? 'glow-border border-game-primary/80 bg-game-primary/10 -translate-y-1' 
                    : 'border-white/5 hover:border-game-primary/30 hover:bg-white/5 hover:-translate-y-0.5'
                }`}
              >
                {/* Character avatar */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-3 ${
                  isSelected ? 'bg-game-primary/20 scale-110' : 'bg-black/40'
                } transition-all duration-300`}>
                  {char.avatar}
                </div>

                <div className="flex flex-col items-center">
                  <h3 className={`font-bold text-sm tracking-wide ${isSelected ? 'text-game-primary glow-text' : 'text-white'}`}>
                    {char.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 mt-1 font-mono uppercase">
                    ID: {char.id}
                  </span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 text-game-primary animate-pulse">
                    <Sparkles size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Detail Card */}
        <div className="glass-panel-heavy p-6 rounded-2xl glow-border border-game-primary/20 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <span className="text-4xl">{selectedChar.avatar}</span>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">{selectedChar.name}</h2>
                <span className="text-xs text-game-secondary font-mono tracking-wider">CHOSEN PROFESSION</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs text-gray-400 font-mono tracking-wider uppercase mb-1">📜 背景描述</h4>
              <p className="text-xs leading-relaxed text-gray-300">
                {selectedChar.description}
              </p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <h4 className="text-xs text-game-accent font-semibold flex items-center gap-1 mb-1">
                <Zap size={12} className="text-game-accent animate-pulse" />
                天賦特技：{selectedChar.specialAbilityName}
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                {selectedChar.specialAbilityDesc}
              </p>
            </div>

            <div>
              <h4 className="text-xs text-gray-400 font-mono tracking-wider uppercase mb-2">📊 初始數值調整</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedChar.statModifier).map(([key, val]) => {
                  const valNum = val as number;
                  const isPositive = valNum > 0;
                  
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
                      className={`text-[10px] px-2 py-1 rounded font-mono border ${
                        isPositive 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      {label} {isPositive ? `+${valNum}` : valNum}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full mt-6 py-3 bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-black font-extrabold text-xs tracking-widest rounded-lg shadow-lg shadow-game-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Award size={14} /> 確認角色，進入地圖
          </button>
        </div>

      </div>

      <div className="text-[10px] text-gray-500 font-mono mt-6">
        PROPOSAL AGENT SYSTEM v3.0.0 // READY FOR URBAN ALIGNMENT
      </div>
    </div>
  );
};
