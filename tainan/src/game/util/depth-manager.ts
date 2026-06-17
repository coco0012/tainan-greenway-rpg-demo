// src/game/util/depth-manager.ts
// Utility for 2.5D depth sorting based on y coordinate.
// Call updateDepth on any GameObject after its position changes to ensure proper rendering order.
export function updateDepth(obj: Phaser.GameObjects.GameObject) {
  // Phaser's depth determines render order; lower depth renders behind higher depth.
  // Using y coordinate provides simple isometric layering (objects lower on screen appear in front).
  if ('setDepth' in obj && typeof (obj as any).setDepth === 'function') {
    (obj as any).setDepth((obj as any).y);
  }
}
