import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { MapScene } from './scenes/MapScene';
import { ResultScene } from './scenes/ResultScene';

export const config: any = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'phaser-game-canvas',
  backgroundColor: '#f4f3ef',
  render: {
    antialias: false,
    antialiasGL: false,
    roundPixels: true,
    resolution: window.devicePixelRatio || 1
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, IntroScene, MapScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const initGame = () => {
  return new Phaser.Game(config);
};
