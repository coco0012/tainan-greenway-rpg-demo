import { useState } from 'react';

function App() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none">
        <h1 className="text-3xl font-bold mb-4">城市協商任務已開始！</h1>
        <p className="text-sm text-gray-400">（本機測試正常）</p>
        <button 
          onClick={() => setStarted(false)} 
          className="mt-6 px-4 py-2 border border-white/30 hover:border-white text-xs rounded transition-colors"
        >
          返回測試頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none">
      <h1 className="text-3xl md:text-5xl font-black tracking-wider text-center text-white mb-8 leading-tight">
        GAME DEMO ENTRY 已成功替換首頁
      </h1>
      
      <button
        onClick={() => setStarted(true)}
        className="px-8 py-4 bg-white text-black hover:bg-gray-200 font-extrabold text-sm tracking-widest rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        開始城市協商任務
      </button>
    </div>
  );
}

export default App;
