import { useEffect, useRef } from 'react';
import { initGame } from '../game/main';
import Phaser from 'phaser';

export const GameCanvas = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Only initialize the game once
    if (!gameRef.current) {
      gameRef.current = initGame();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div id="phaser-game-canvas" className="w-full h-full" />
    </div>
  );
};
