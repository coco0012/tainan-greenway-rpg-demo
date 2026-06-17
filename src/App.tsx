import { useState } from 'react';
import { IntroScene } from './components/IntroScene';
import { CharacterSelect, CHARACTERS } from './components/CharacterSelect';
import type { CharacterId } from './components/CharacterSelect';
import { GameMap } from './components/GameMap';
import { LevelScene } from './components/LevelScene';
import { ResultComic } from './components/ResultComic';
import { AwardScene } from './components/AwardScene';
import type { GameStats } from './components/StatsPanel';
import { StatsPanel } from './components/StatsPanel';

const INITIAL_STATS: GameStats = {
  residentSatisfaction: 50,
  merchantSatisfaction: 50,
  commuteEfficiency: 50,
  ecologicalScore: 50,
  safetySense: 50,
  activityVitality: 50,
  conflictValue: 20
};

type Scene = 'intro' | 'character_select' | 'map' | 'level' | 'result_comic' | 'award';

function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('intro');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null);
  const [completedLevels, setCompletedLevels] = useState<{ [key: number]: boolean }>({});
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  // Get active character name
  const activeChar = CHARACTERS.find(c => c.id === selectedCharacter);
  const selectedCharName = activeChar ? activeChar.name : '未選擇';

  const handleStartIntro = () => {
    setCurrentScene('character_select');
  };

  const handleSelectCharacter = (charId: CharacterId) => {
    setSelectedCharacter(charId);
    
    // Find character modifiers
    const char = CHARACTERS.find(c => c.id === charId);
    if (char) {
      const newStats = { ...INITIAL_STATS };
      Object.entries(char.statModifier).forEach(([key, val]) => {
        const k = key as keyof GameStats;
        newStats[k] = Math.max(0, Math.min(100, newStats[k] + (val as number)));
      });
      setStats(newStats);
    }
    
    setCurrentScene('map');
  };

  const handleSelectLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setCurrentScene('level');
  };

  const handleSelectLevelOption = (effects: Partial<GameStats>, _choiceId: string) => {
    setStats((prev) => {
      const updated = { ...prev };
      Object.entries(effects).forEach(([key, value]) => {
        const k = key as keyof GameStats;
        updated[k] = Math.max(0, Math.min(100, updated[k] + (value as number)));
      });
      return updated;
    });

    if (currentLevelId !== null) {
      setCompletedLevels((prev) => ({
        ...prev,
        [currentLevelId]: true
      }));
    }
  };

  const handleLevelBackToMap = () => {
    setCurrentLevelId(null);
    setCurrentScene('map');
  };

  const handleSubmitResult = () => {
    setCurrentScene('result_comic');
  };

  const handleNextToAward = () => {
    setCurrentScene('award');
  };

  const handleRestartGame = () => {
    setStats(INITIAL_STATS);
    setCompletedLevels({});
    setSelectedCharacter(null);
    setCurrentLevelId(null);
    setCurrentScene('intro');
  };

  const showHUD = currentScene === 'map' || currentScene === 'level' || currentScene === 'result_comic';

  return (
    <div className="min-h-screen bg-game-bg text-game-text antialiased flex flex-col font-sans">
      {showHUD && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4 z-40">
          <StatsPanel stats={stats} />
        </div>
      )}
      
      <div className="flex-grow flex flex-col">
        {currentScene === 'intro' && (
          <IntroScene onStart={handleStartIntro} />
        )}
        
        {currentScene === 'character_select' && (
          <CharacterSelect onSelect={handleSelectCharacter} />
        )}
        
        {currentScene === 'map' && (
          <GameMap 
            stats={stats} 
            completedLevels={completedLevels}
            onSelectLevel={handleSelectLevel}
            onSubmitResult={handleSubmitResult}
            selectedCharName={selectedCharName}
          />
        )}
        
        {currentScene === 'level' && currentLevelId !== null && (
          <LevelScene 
            levelId={currentLevelId}
            stats={stats}
            characterId={selectedCharacter || 'designer'}
            onSelectOption={handleSelectLevelOption}
            onBackToMap={handleLevelBackToMap}
          />
        )}
        
        {currentScene === 'result_comic' && (
          <ResultComic 
            stats={stats} 
            onNext={handleNextToAward}
            selectedCharName={selectedCharName}
          />
        )}
        
        {currentScene === 'award' && (
          <AwardScene 
            stats={stats} 
            selectedCharName={selectedCharName}
            onRestart={handleRestartGame}
          />
        )}
      </div>
    </div>
  );
}

export default App;
