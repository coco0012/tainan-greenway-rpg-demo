import React, { useState, useEffect } from 'react';
import { Play, ChevronRight, FastForward } from 'lucide-react';

interface IntroSceneProps {
  onStart: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ onStart }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [typedText, setTypedText] = useState('');

  const panels = [
    {
      text: "台南鐵路地下化完工後，地表上騰出了一條長達數公里的綠色生態廊道，為這座古老城市迎來了前所未有的綠意空間。",
      emoji: "🏙️ 🌳 🚉",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-900 border border-game-primary/30 rounded-lg overflow-hidden">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          <svg viewBox="0 0 400 200" className="w-full h-full text-game-primary max-h-[160px]">
            <path d="M 0,160 Q 200,160 400,160" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeDasharray="5,5" />
            <path d="M -20,180 Q 200,130 420,180" fill="none" stroke="#39ff14" strokeWidth="16" className="opacity-80" />
            <path d="M -20,180 Q 200,130 420,180" fill="none" stroke="#66fcf1" strokeWidth="2" className="animate-pulse" />
            <circle cx="80" cy="145" r="8" fill="#39ff14" opacity="0.8" />
            <circle cx="200" cy="135" r="10" fill="#22c55e" opacity="0.8" />
            <circle cx="320" cy="148" r="8" fill="#39ff14" opacity="0.8" />
            <text x="50" y="80" fill="white" fontSize="12" fontFamily="monospace">府城舊鐵道上...</text>
          </svg>
        </div>
      )
    },
    {
      text: "然而，這片空間的使用權引發了多方角力：居民渴望寧靜生活，商家期盼觀光人潮，通勤者要求通行效率，生態倡議者呼籲還地於自然，青年則希望有廣場可以熱鬧展演。",
      emoji: "👵 🏪 🚲 🌿 🎸",
      visual: (
        <div className="relative w-full h-full flex items-center justify-around bg-slate-900 border border-game-accent/30 rounded-lg overflow-hidden p-4">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          <div className="flex flex-col items-center animate-bounce-slow">
            <div className="w-14 h-14 rounded-full border-2 border-green-500 bg-game-card flex items-center justify-center text-3xl">👵</div>
            <span className="text-[10px] text-green-400 mt-1 font-bold">居民</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-full border-2 border-yellow-500 bg-game-card flex items-center justify-center text-3xl">🏪</div>
            <span className="text-[10px] text-yellow-400 mt-1 font-bold">店家</span>
          </div>
          <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: '0.4s' }}>
            <div className="w-14 h-14 rounded-full border-2 border-blue-500 bg-game-card flex items-center justify-center text-3xl">🚲</div>
            <span className="text-[10px] text-blue-400 mt-1 font-bold">通勤</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.6s' }}>
            <div className="w-14 h-14 rounded-full border-2 border-purple-500 bg-game-card flex items-center justify-center text-3xl">🎸</div>
            <span className="text-[10px] text-purple-400 mt-1 font-bold">青年</span>
          </div>
        </div>
      )
    },
    {
      text: "缺乏溝通的空間規劃，將讓綠園道成為每日爭執不斷的鄰里戰場。尖銳的檢舉哨音與攤商抗議，正悄悄吞噬這片剛誕生的綠帶。",
      emoji: "⚠️ 🗣️ 💥 🏛️",
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-red-950/40 border border-game-danger/30 rounded-lg overflow-hidden">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          <span className="text-4xl animate-pulse">🔥 🗣️ ❌ 🏡</span>
          <div className="mt-4 text-game-danger font-mono text-xs tracking-wider glow-text-pink animate-pulse">
            🚨 SYSTEM ALERT: URBAN STAKEHOLDER CONFLICTS RISING
          </div>
        </div>
      )
    },
    {
      text: "你將扮演由市政府特聘的「城市協調者」，深入綠園道的三個核心爭議節點進行協商，運用你的對策智慧，尋求居民滿意、商家活力、通勤效率與生態環境的最佳共融平衡！",
      emoji: "👔 📐 🤝 🗺️",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-900 border border-game-primary/30 rounded-lg overflow-hidden p-4">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-game-primary bg-game-card/80 flex items-center justify-center text-4xl shadow-lg shadow-game-primary/20 animate-bounce-slow">
              🧐
            </div>
            <div>
              <span className="text-[10px] text-game-primary font-mono tracking-widest block">ROLE ASSIGNMENT</span>
              <span className="text-base font-bold text-white tracking-wide">台南綠廊公共協調官</span>
              <span className="text-xs text-gray-400 block mt-1">任務：解決三場公共空間的危機協商</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Typewriter effect logic
  useEffect(() => {
    if (!gameStarted) return;
    setTypedText('');
    let index = 0;
    const currentText = panels[currentPanel].text;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + currentText.charAt(index));
      index++;
      if (index >= currentText.length) {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [gameStarted, currentPanel]);

  const handleNextPanel = () => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    } else {
      onStart();
    }
  };

  const handleSkip = () => {
    onStart();
  };

  // 1. GAME TITLE SCREEN (Zelda / Retro RPG Start Screen)
  if (!gameStarted) {
    return (
      <div className="min-h-screen w-full bg-game-bg flex flex-col justify-between items-center p-6 md:p-12 relative overflow-hidden">
        {/* Animated Perspective Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(102, 252, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(102, 252, 241, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
            transformOrigin: 'top center',
            animation: 'float 20s linear infinite'
          }}
        />

        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-game-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-game-accent/10 rounded-full blur-3xl" />

        {/* Top bar info */}
        <div className="text-[10px] text-game-primary font-mono tracking-widest glow-text z-10">
          --- GEMINI RPG SYSTEM v3.0.0 PRESENT ---
        </div>

        {/* Title Block */}
        <div className="text-center z-10 flex flex-col items-center gap-4 my-auto select-none">
          <div className="text-5xl md:text-7xl mb-2 animate-bounce-slow">🌳</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-widest text-white leading-tight font-sans">
            台南綠園道
          </h1>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-widest text-game-primary glow-text font-mono uppercase mt-1">
            2.5D RPG 城市協商遊戲
          </h2>
          
          <button
            onClick={() => setGameStarted(true)}
            className="mt-12 px-10 py-5 bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/95 hover:to-game-secondary/95 text-black font-extrabold text-sm tracking-widest rounded-xl shadow-[0_0_30px_rgba(102,252,241,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/20"
          >
            <Play size={16} fill="black" /> 開始遊戲 (PRESS START)
          </button>
        </div>

        {/* Bottom instructions */}
        <div className="text-[10px] text-gray-500 font-mono tracking-wider z-10 text-center">
          PC BROWSER ONLY // CHINESE LANGUAGE SUPPORTED // © 2026 TAINAN GREENWAY RPG
        </div>
      </div>
    );
  }

  // 2. CINEMATIC STORY MODE (Zelda-style dialog typewriter)
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      
      {/* Background decoration */}
      <div className="absolute top-10 right-10 text-game-primary/10 text-9xl font-mono pointer-events-none">🌳</div>
      <div className="absolute bottom-10 left-10 text-game-accent/10 text-9xl font-mono pointer-events-none">⚔️</div>

      {/* Skip Button */}
      <div className="w-full flex justify-end z-10">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          跳過動畫 (SKIP) <FastForward size={12} />
        </button>
      </div>

      {/* Central Visual Graphic Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex items-center justify-center my-6 z-10">
        <div className="w-full aspect-[16/9] max-h-[280px]">
          {panels[currentPanel].visual}
        </div>
      </div>

      {/* Zelda-Style Dialog Typewriter Box */}
      <div className="w-full max-w-3xl mx-auto glass-panel-heavy p-6 rounded-2xl glow-border border-game-primary/30 z-10 flex flex-col justify-between min-h-[160px] relative">
        <div className="absolute inset-0 opacity-5 pixel-grid-bg" />
        
        {/* Speaker Label */}
        <div className="text-[10px] text-game-primary font-mono tracking-wider uppercase mb-2 flex items-center gap-2">
          <span>📜 CINEMATIC SCREEN {currentPanel + 1} / {panels.length}</span>
          <span>{panels[currentPanel].emoji}</span>
        </div>

        {/* Dialogue Text Area */}
        <p className="text-sm md:text-base leading-relaxed text-gray-200 min-h-[60px] font-mono">
          {typedText}
          <span className="w-2 h-4 bg-game-primary inline-block ml-0.5 animate-pulse" />
        </p>

        {/* Action button inside dialog */}
        <div className="w-full flex justify-end mt-4">
          <button
            onClick={handleNextPanel}
            className="flex items-center gap-1 bg-game-primary hover:bg-game-primary/80 text-black font-extrabold text-xs tracking-wider px-4 py-2 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-md shadow-game-primary/20"
          >
            {currentPanel === panels.length - 1 ? "開始任務 ⚔️" : "下一幕 ▶"}
            {currentPanel < panels.length - 1 && <ChevronRight size={14} />}
          </button>
        </div>
      </div>

    </div>
  );
};
