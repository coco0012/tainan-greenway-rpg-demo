import React, { useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface IntroSceneProps {
  onStart: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ onStart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "🏙️ 府城新生的綠色奇蹟",
      description: "隨著台南鐵路地下化完工，原本橫亙市區的鐵軌正式走入歷史。地表上騰出了一條長達數公里的綠色生態廊道，為這座古老城市迎來了全新的開放空間想像。",
      visual: (
        <div className="relative w-full h-48 bg-gradient-to-b from-blue-900/40 to-slate-900 border border-game-primary/30 rounded-lg overflow-hidden flex items-end justify-center">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          {/* SVG Skyline of Tainan with Green Greenway rising */}
          <svg viewBox="0 0 400 200" className="w-full h-full text-game-primary">
            {/* Old tracks fading out */}
            <path d="M 0,160 Q 200,160 400,160" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeDasharray="5,5" />
            <path d="M 0,150 Q 200,150 400,150" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeDasharray="5,5" />
            {/* Historic landmarks */}
            <rect x="50" y="80" width="30" height="60" fill="#1f2833" stroke="#45a29e" strokeWidth="2" />
            <polygon points="50,80 65,50 80,80" fill="#1f2833" stroke="#45a29e" strokeWidth="2" />
            <rect x="280" y="60" width="40" height="80" fill="#1f2833" stroke="#45a29e" strokeWidth="2" />
            <circle cx="300" cy="50" r="10" fill="none" stroke="#45a29e" strokeWidth="2" />
            {/* Green Corridor overlay */}
            <path d="M -20,180 Q 200,130 420,180" fill="none" stroke="#39ff14" strokeWidth="16" className="opacity-80" />
            <path d="M -20,180 Q 200,130 420,180" fill="none" stroke="#66fcf1" strokeWidth="2" className="animate-pulse" />
            {/* Small trees along corridor */}
            <circle cx="80" cy="145" r="8" fill="#39ff14" opacity="0.8" />
            <circle cx="150" cy="138" r="10" fill="#22c55e" opacity="0.8" />
            <circle cx="230" cy="138" r="9" fill="#39ff14" opacity="0.8" />
            <circle cx="320" cy="148" r="8" fill="#22c55e" opacity="0.8" />
          </svg>
          <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded border border-game-primary/30 text-[10px] text-game-primary font-mono tracking-wider">
            SYSTEM STATE: INITIALIZING GREENWAY
          </div>
        </div>
      )
    },
    {
      title: "🗣️ 多方利益與期待拉扯",
      description: "然而，這條新廊道周邊環繞著各式各樣的聲音。居民代表高喊『我們要寧靜日常生活』；商家老闆高呼『我們要消費人潮』；通勤族希望能『快速便利通過』；生態倡議者則要求『多種原生植物並實施夜間低照明』；而熱血的青年們渴望『有可以痛快展演、辦活動的市民廣場』。",
      visual: (
        <div className="relative w-full h-48 bg-gradient-to-b from-purple-900/30 to-slate-900 border border-game-accent/30 rounded-lg overflow-hidden flex items-center justify-around p-4">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          {/* Avatar bubbles fighting */}
          <div className="flex flex-col items-center animate-bounce-slow">
            <div className="w-12 h-12 rounded-full border-2 border-green-500 bg-game-card flex items-center justify-center text-lg">🏡</div>
            <span className="text-[10px] text-green-400 mt-1 font-semibold">安靜生活</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-game-card flex items-center justify-center text-lg">💰</div>
            <span className="text-[10px] text-yellow-400 mt-1 font-semibold">商機人潮</span>
          </div>
          <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: '0.6s' }}>
            <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-game-card flex items-center justify-center text-lg">⚡</div>
            <span className="text-[10px] text-blue-400 mt-1 font-semibold">快速通行</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.9s' }}>
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 bg-game-card flex items-center justify-center text-lg">🎸</div>
            <span className="text-[10px] text-purple-400 mt-1 font-semibold">廣場活動</span>
          </div>
          <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded border border-game-accent/30 text-[10px] text-game-accent font-mono tracking-wider">
            CONFLICT LEVEL: RISING
          </div>
        </div>
      )
    },
    {
      title: "⚡ 缺乏協商的「衝突戰場」",
      description: "一旦缺乏良善的溝通，綠園道非但無法美化城市，反而會引爆嚴重的鄰里糾紛。例如：吵鬧的週末市集讓樓上居民徹夜失眠，或者過度的生態保育導致夜間太過昏暗進而形成治安死角。",
      visual: (
        <div className="relative w-full h-48 bg-gradient-to-b from-red-950/40 to-slate-900 border border-game-danger/30 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          <div className="text-center z-10 px-4">
            <span className="text-3xl animate-pulse">⚠️ 🗣️ 💥 🏠</span>
            <div className="mt-3 text-game-danger font-mono text-xs tracking-wider glow-text-pink">
              WARNING: URBAN NEIGHBORHOOD CRISIS DETECTED
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              噪音檢舉 +200% | 商戶抗議不斷 | 行人動線交織混亂
            </div>
          </div>
          <div className="absolute inset-0 bg-game-danger/5 animate-pulse" />
        </div>
      )
    },
    {
      title: "👔 成為「城市協調者」",
      description: "為了解決僵局，市政府緊急聘請了你作為「城市協調者」。你必須進入綠園道最具爭端的三個關卡節點：處理『快速通行 vs 廣場停留』、『商業人流 vs 居住安靜』、以及『生態低照度 vs 夜間安全』的矛盾，打造市民共融的和諧空間！",
      visual: (
        <div className="relative w-full h-48 bg-gradient-to-b from-game-secondary/30 to-slate-900 border border-game-primary/30 rounded-lg overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-10 pixel-grid-bg" />
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-xl border border-game-primary bg-game-card/80 flex items-center justify-center text-4xl shadow-lg shadow-game-primary/20 animate-pulse">
              🧐
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-game-primary font-mono tracking-widest">ROLE ASSIGNMENT</span>
              <span className="text-lg font-bold text-white tracking-wide">台南綠廊公共協調官</span>
              <span className="text-[10px] text-gray-400 mt-1">任務：尋找市民滿意、生態與效率的最佳平衡點。</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onStart();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-game-bg relative overflow-hidden">
      {/* Background neon grids */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-game-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-game-accent/10 rounded-full blur-3xl" />
      
      {/* Intro Box */}
      <div className="w-full max-w-2xl glass-panel-heavy p-8 rounded-2xl glow-border border-game-primary/30 relative flex flex-col gap-6 scene-transition">
        
        {/* Title Indicator */}
        <div className="flex justify-between items-center text-xs text-gray-400 font-mono pb-2 border-b border-white/5">
          <span className="tracking-widest text-game-primary glow-text uppercase">🎮 TAINAN GREENWAY RPG MVP</span>
          <span>SLIDE {currentSlide + 1} / {slides.length}</span>
        </div>

        {/* Visual Showcase */}
        {slides[currentSlide].visual}

        {/* Slide Title */}
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
          {slides[currentSlide].title}
        </h2>

        {/* Slide Description */}
        <p className="text-sm md:text-base leading-relaxed text-gray-300 min-h-[100px]">
          {slides[currentSlide].description}
        </p>

        {/* Navigation Indicator Dots */}
        <div className="flex gap-2 justify-center py-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-game-primary' : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`px-4 py-2 rounded font-semibold text-xs tracking-wider uppercase border border-gray-700/60 transition-all ${
              currentSlide === 0 
                ? 'opacity-30 cursor-not-allowed text-gray-600' 
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            上一步
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-black font-extrabold text-sm tracking-widest rounded-lg shadow-lg shadow-game-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            {currentSlide === slides.length - 1 ? (
              <>
                開始任務 <ArrowRight size={16} className="animate-pulse" />
              </>
            ) : (
              <>
                下一步 <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
