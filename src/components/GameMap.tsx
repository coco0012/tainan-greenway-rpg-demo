import { Play, CheckCircle, MapPin, Award } from 'lucide-react';
import { StatsPanel } from './StatsPanel';
import type { GameStats } from './StatsPanel';

interface GameMapProps {
  stats: GameStats;
  completedLevels: { [key: number]: boolean };
  onSelectLevel: (levelId: number) => void;
  onSubmitResult: () => void;
  selectedCharName: string;
}

export const GameMap: React.FC<GameMapProps> = ({
  stats,
  completedLevels,
  onSelectLevel,
  onSubmitResult,
  selectedCharName
}) => {
  const levels = [
    {
      id: 1,
      name: '關卡一：東區 大學里 (民族-青年段)',
      theme: '通勤動線衝突',
      desc: '快速通行 vs 停留活動',
      // Isometric positions on our grid (x, y percentages)
      pos: { x: '25%', y: '45%' },
      color: 'border-blue-400 text-blue-400 bg-blue-950/90',
      glowColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 2,
      name: '關卡二：中西區 城隍里 (青年-東門段)',
      theme: '商住矛盾衝擊',
      desc: '商業活動與住宅安靜衝突',
      pos: { x: '50%', y: '50%' },
      color: 'border-yellow-400 text-yellow-400 bg-yellow-950/90',
      glowColor: 'rgba(234, 179, 8, 0.4)'
    },
    {
      id: 3,
      name: '關卡三：中西區 郡王里 (東門-健康段)',
      theme: '生態安全平衡',
      desc: '生態保育 vs 夜間活動與安全',
      pos: { x: '75%', y: '55%' },
      color: 'border-emerald-400 text-emerald-400 bg-emerald-950/90',
      glowColor: 'rgba(16, 185, 129, 0.4)'
    }
  ];

  const allCompleted = levels.every(level => completedLevels[level.id]);

  return (
    <div className="min-h-screen w-full bg-game-bg flex flex-col justify-between p-4 relative overflow-hidden">
      
      {/* Background star clusters / lights */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-game-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-game-accent/5 rounded-full blur-3xl" />

      {/* TOP HEADER & HUD STATS */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 z-10">
        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">綠園道 2.5D 協商空間</h1>
              <p className="text-[10px] font-mono text-game-primary">COORDINATING OFFICER: {selectedCharName}</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            {levels.map((l) => (
              <div key={l.id} className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                <span className="text-[10px] text-gray-500 font-mono">L{l.id}</span>
                {completedLevels[l.id] ? (
                  <span className="text-game-success font-semibold flex items-center gap-0.5">已解決 🌟</span>
                ) : (
                  <span className="text-game-accent animate-pulse font-semibold">待處理 ⚔️</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Compact stats view */}
        <StatsPanel stats={stats} compact={true} />
      </div>

      {/* 2.5D ISOMETRIC GAME MAP DISPLAY */}
      <div className="flex-1 w-full max-w-6xl mx-auto my-4 flex items-center justify-center relative z-0">
        
        {/* Isometric Board */}
        <div className="w-full max-w-[850px] aspect-[16/10] relative iso-container flex items-center justify-center">
          
          <div className="w-[850px] h-[530px] rounded-2xl bg-[#131921]/90 border border-game-secondary/20 relative shadow-2xl overflow-hidden iso-map-transform">
            
            {/* Map Grid / Gridlines */}
            <div className="absolute inset-0 pixel-grid-bg opacity-15" />

            {/* Greenway Spine (Diagonal path cutting across the map from top-left to bottom-right) */}
            <div 
              className="absolute bg-gradient-to-r from-game-secondary/30 via-emerald-600/40 to-green-800/20"
              style={{
                top: '48%',
                left: '-10%',
                width: '120%',
                height: '80px',
                transform: 'rotate(10deg)',
                boxShadow: '0 0 20px rgba(57, 255, 20, 0.1)'
              }}
            />

            {/* Pathways & Roads bordering */}
            <div className="absolute bg-slate-800/50 w-full h-[15px] top-[40%] transform rotate-[10deg] opacity-60" />
            <div className="absolute bg-slate-800/50 w-full h-[15px] top-[60%] transform rotate-[10deg] opacity-60" />

            {/* Small Plaza Circular Nodes */}
            <div className="absolute rounded-full border border-game-primary/20 bg-game-card/40 w-24 h-24 top-[35%] left-[20%] opacity-80" />
            <div className="absolute rounded-full border border-game-accent/20 bg-game-card/40 w-32 h-32 top-[42%] left-[45%] opacity-80" />
            <div className="absolute rounded-full border border-emerald-500/20 bg-game-card/40 w-28 h-28 top-[38%] left-[70%] opacity-80" />

            {/* 3D Static Buildings (Houses, Shops) pop-up styling */}
            
            {/* Resident Houses (Left Side) */}
            <div className="absolute top-[25%] left-[12%] w-10 h-10 iso-layer-3d">
              <div className="absolute inset-0 bg-red-900/40 border border-red-500/30 rounded flex items-center justify-center text-xl iso-object-stand">
                🏠
              </div>
            </div>
            <div className="absolute top-[28%] left-[26%] w-8 h-8 iso-layer-3d">
              <div className="absolute inset-0 bg-red-900/40 border border-red-500/30 rounded flex items-center justify-center text-sm iso-object-stand">
                🏠
              </div>
            </div>

            {/* Shops (Middle Section) */}
            <div className="absolute top-[32%] left-[48%] w-10 h-10 iso-layer-3d">
              <div className="absolute inset-0 bg-amber-900/50 border border-yellow-500/30 rounded flex items-center justify-center text-xl iso-object-stand">
                🏪
              </div>
            </div>
            <div className="absolute top-[65%] left-[38%] w-12 h-10 iso-layer-3d">
              <div className="absolute inset-0 bg-amber-900/50 border border-yellow-500/30 rounded flex items-center justify-center text-lg iso-object-stand">
                🏬
              </div>
            </div>

            {/* Eco Woodlands & Parks (Right Section) */}
            <div className="absolute top-[68%] left-[72%] w-12 h-12 iso-layer-3d">
              <div className="absolute inset-0 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center text-2xl iso-object-stand">
                🌳
              </div>
            </div>
            <div className="absolute top-[22%] left-[80%] w-10 h-10 iso-layer-3d">
              <div className="absolute inset-0 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center text-lg iso-object-stand">
                🌳
              </div>
            </div>

            {/* Scattered Small Trees (Foliage) */}
            <div className="absolute top-[48%] left-[18%] w-6 h-6 iso-layer-3d"><div className="absolute inset-0 text-sm iso-object-stand">🌲</div></div>
            <div className="absolute top-[45%] left-[36%] w-6 h-6 iso-layer-3d"><div className="absolute inset-0 text-sm iso-object-stand">🌲</div></div>
            <div className="absolute top-[52%] left-[64%] w-6 h-6 iso-layer-3d"><div className="absolute inset-0 text-sm iso-object-stand">🌲</div></div>
            <div className="absolute top-[50%] left-[84%] w-6 h-6 iso-layer-3d"><div className="absolute inset-0 text-sm iso-object-stand">🌲</div></div>

            {/* Small Pedestrians / Walkers */}
            <div className="absolute top-[50%] left-[30%] w-4 h-4 iso-layer-3d animate-pulse"><div className="absolute inset-0 text-xs iso-object-stand">🚶</div></div>
            <div className="absolute top-[47%] left-[58%] w-4 h-4 iso-layer-3d animate-pulse" style={{ animationDelay: '0.5s' }}><div className="absolute inset-0 text-xs iso-object-stand">🚴</div></div>
            <div className="absolute top-[53%] left-[78%] w-4 h-4 iso-layer-3d animate-pulse" style={{ animationDelay: '1s' }}><div className="absolute inset-0 text-xs iso-object-stand">🚶</div></div>

            {/* Clouds Floating Above (using transform-style) */}
            <div className="absolute top-10 left-10 w-20 h-10 opacity-35 bg-white/20 blur-md rounded-full iso-layer-3d animate-float" />
            <div className="absolute top-20 right-20 w-32 h-12 opacity-30 bg-white/25 blur-lg rounded-full iso-layer-3d animate-float" style={{ animationDelay: '1.5s' }} />

            {/* INTERACTIVE LEVEL NODES (PINS) */}
            {levels.map((level) => {
              const isCompleted = completedLevels[level.id];
              return (
                <div 
                  key={level.id}
                  className="absolute iso-layer-3d cursor-pointer group"
                  style={{
                    left: level.pos.x,
                    top: level.pos.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => onSelectLevel(level.id)}
                >
                  {/* Floating Vertical 2.5D Pin */}
                  <div className="level-pin-float relative">
                    
                    {/* The Pin Point */}
                    <div 
                      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                        isCompleted 
                          ? 'border-game-success text-game-success bg-green-950/90 shadow-[0_0_15px_rgba(57,255,20,0.5)]' 
                          : `${level.color} hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.15)]`
                      }`}
                    >
                      {isCompleted ? '⭐' : <MapPin size={24} className="animate-bounce-slow" />}

                      {/* Small floating tooltip inside map grid */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-white/10 px-2 py-0.5 rounded text-[8px] whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                        {level.theme}
                      </div>
                    </div>

                    {/* Ground ripple circle (shows point projection in 2.5D) */}
                    <div 
                      className={`absolute -bottom-1 -left-1 w-16 h-4 rounded-full border border-dashed opacity-60 -translate-z-10 blur-[1px] animate-pulse ${
                        isCompleted ? 'border-game-success/60' : 'border-white/30'
                      }`}
                    />
                  </div>

                  {/* HTML Hover Card (drawn on top of the canvas via absolute overlay position) */}
                  <div 
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-black/95 border border-game-primary/30 p-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 shadow-xl z-20 flex flex-col gap-1.5"
                    style={{ transform: 'translate3d(-50%, 0, 50px)' }} /* Force above 3D plane */
                  >
                    <span className="text-[9px] text-game-primary font-mono tracking-widest uppercase">
                      LEVEL {level.id}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {level.theme}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {level.desc}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-game-accent mt-1">
                      {isCompleted ? (
                        <span className="text-game-success flex items-center gap-0.5"><CheckCircle size={10} /> 協商圓滿解決</span>
                      ) : (
                        <span className="flex items-center gap-0.5 animate-pulse"><Play size={10} /> 點擊進入衝突協調</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* BOTTOM ACTION AREA */}
      <div className="w-full max-w-6xl mx-auto text-center z-10 flex flex-col items-center gap-3">
        {allCompleted ? (
          <button
            onClick={onSubmitResult}
            className="px-10 py-4 bg-gradient-to-r from-game-accent via-game-primary to-game-secondary hover:opacity-95 text-black font-extrabold text-sm tracking-widest rounded-xl shadow-2xl shadow-game-accent/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 animate-bounce-slow border-2 border-white/30"
          >
            <Award size={18} /> 所有任務已解決！產出最終綠廊成果圖
          </button>
        ) : (
          <div className="glass-panel px-6 py-3 rounded-lg border border-game-accent/20 text-xs text-gray-300">
            請在 2.5D 地圖上點擊 <span className="text-game-accent font-bold">閃爍地標 ⚔️</span> 以解決該區域的公共空間糾紛。
          </div>
        )}

        <div className="text-[9px] text-gray-500 font-mono tracking-widest">
          TAINAN METROPOLITAN CORRIDOR PLANNING MAP MVP v3.0.0
        </div>
      </div>

    </div>
  );
};
