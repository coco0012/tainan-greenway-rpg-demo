import React from 'react';
import { 
  Users, Store, Zap, Heart, Shield, Activity, AlertTriangle 
} from 'lucide-react';

export interface GameStats {
  residentSatisfaction: number;
  merchantSatisfaction: number;
  commuteEfficiency: number;
  ecologicalScore: number;
  safetySense: number;
  activityVitality: number;
  conflictValue: number;
}

interface StatsPanelProps {
  stats: GameStats;
  compact?: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, compact = false }) => {
  const statConfig = [
    {
      key: 'residentSatisfaction' as const,
      label: '居民滿意度',
      value: stats.residentSatisfaction,
      color: 'bg-green-500',
      textColor: 'text-green-400',
      icon: Users,
    },
    {
      key: 'merchantSatisfaction' as const,
      label: '商家滿意度',
      value: stats.merchantSatisfaction,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      icon: Store,
    },
    {
      key: 'commuteEfficiency' as const,
      label: '通勤效率',
      value: stats.commuteEfficiency,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      icon: Zap,
    },
    {
      key: 'ecologicalScore' as const,
      label: '生態分數',
      value: stats.ecologicalScore,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      icon: Heart,
    },
    {
      key: 'safetySense' as const,
      label: '安全感',
      value: stats.safetySense,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      icon: Shield,
    },
    {
      key: 'activityVitality' as const,
      label: '活動活力',
      value: stats.activityVitality,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      icon: Activity,
    },
  ];

  // Helper for Conflict color (higher is worse)
  const getConflictColor = (val: number) => {
    if (val > 60) return { bar: 'bg-game-danger', text: 'text-game-danger font-bold animate-pulse' };
    if (val > 40) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-game-primary', text: 'text-game-primary' };
  };

  const conflictStyle = getConflictColor(stats.conflictValue);

  if (compact) {
    return (
      <div className="glass-panel p-3 rounded-lg flex flex-wrap gap-4 items-center justify-between glow-border border-game-primary/30">
        <div className="flex gap-4 overflow-x-auto py-1">
          {statConfig.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-xs min-w-[110px]">
                <Icon size={12} className={item.textColor} />
                <span className="text-gray-400 text-[10px] truncate max-w-[50px]">{item.label}</span>
                <span className={`ml-auto font-bold ${item.textColor}`}>{item.value}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded text-xs glow-border border-game-accent/20">
          <AlertTriangle size={14} className={conflictStyle.text} />
          <span className="text-gray-400 text-[10px]">衝突值</span>
          <span className={`font-bold ${conflictStyle.text}`}>{stats.conflictValue}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-xl glow-border border-game-primary/20 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-game-secondary/20 pb-2">
        <h3 className="font-semibold text-game-primary text-sm tracking-wider glow-text uppercase">
          📟 綠廊即時指標 (HUD STATS)
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-game-bg/60 border border-game-accent/30 animate-pulse">
          <AlertTriangle size={16} className={`${conflictStyle.text}`} />
          <span className="text-xs text-gray-300">當前衝突值:</span>
          <span className={`font-bold text-sm ${conflictStyle.text}`}>{stats.conflictValue}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statConfig.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="bg-game-bg/80 p-3 rounded-lg border border-game-card/50 flex flex-col justify-between hover:border-game-primary/30 transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={`${item.textColor} group-hover:scale-110 transition-transform`} />
                <span className="text-xs text-gray-300 font-semibold">{item.label}</span>
                <span className={`ml-auto font-bold text-sm ${item.textColor}`}>{item.value}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className={`h-full ${item.color} transition-all duration-500 ease-out`} 
                  style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
