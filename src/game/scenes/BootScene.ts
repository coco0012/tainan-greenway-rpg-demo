import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show a loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'LOADING ASSETS...',
      style: {
        font: 'bold 18px "Noto Sans TC", monospace',
        color: '#7c9a8f'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0xe6e4dc, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 10, 320, 20, 4);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x7c9a8f, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 5, 300 * value, 10, 2);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    // Generate all vector textures dynamically
    this.createVectorTextures();

    // Immediately launch the IntroScene
    this.scene.start('IntroScene');
  }

  private createVectorTextures() {
    // Outer outline color (charcoal)
    const outlineColor = 0x2c3e35;

    // --- 1. PLAYER (64x64) ---
    let g = this.add.graphics();
    // Head skin
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Hair
    g.fillStyle(0x3a2d27, 1);
    g.slice(32, 32, 14, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    g.fillPath();
    // Explorer Hat
    g.fillStyle(0xe6c280, 1); // dome
    g.fillCircle(32, 20, 10);
    g.fillRect(18, 22, 28, 4); // brim
    // Clothes / Coat
    g.fillStyle(0x7c9a8f, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Glasses (characteristic)
    g.lineStyle(1.5, 0x000000, 1);
    g.strokeCircle(26, 32, 4);
    g.strokeCircle(38, 32, 4);
    g.lineBetween(30, 32, 34, 32);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.strokeCircle(32, 20, 10);
    g.strokeRect(18, 22, 28, 4);
    g.generateTexture('player', 64, 64);
    g.destroy();

    // --- 2. NPC RESIDENT (64x64, 👵 Resident Li) ---
    g = this.add.graphics();
    // Head skin
    g.fillStyle(0xfce5d8, 1);
    g.fillCircle(32, 34, 14);
    // Grey hair & bun
    g.fillStyle(0xb0b5b8, 1);
    g.fillCircle(32, 16, 8); // bun
    g.fillCircle(20, 32, 6);
    g.fillCircle(44, 32, 6);
    g.fillCircle(32, 24, 12);
    // Glasses
    g.lineStyle(1, 0x000000, 1);
    g.strokeRect(22, 30, 7, 5);
    g.strokeRect(35, 30, 7, 5);
    g.lineBetween(29, 32, 35, 32);
    // Clothes (Pink shirt)
    g.fillStyle(0xd98880, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeCircle(32, 16, 8);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.generateTexture('npc_resident', 64, 64);
    g.destroy();

    // --- 3. NPC MERCHANT (64x64, 🏪 Cafe Owner Chen) ---
    g = this.add.graphics();
    // Head skin
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Apron (Brown)
    g.fillStyle(0xa06a42, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Mustache
    g.fillStyle(0x221a17, 1);
    g.fillRect(26, 38, 12, 3);
    // Barista Cap (Dark brown beret)
    g.fillStyle(0x503525, 1);
    g.fillEllipse(32, 22, 18, 6);
    g.fillCircle(24, 21, 3);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.strokeEllipse(32, 22, 18, 6);
    g.generateTexture('npc_merchant', 64, 64);
    g.destroy();

    // --- 4. NPC COMMUTER (64x64, 🚲 Commuter A-Qiang) ---
    g = this.add.graphics();
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Helmet (Yellow)
    g.fillStyle(0xe6c280, 1);
    g.fillRoundedRect(18, 16, 28, 10, 4);
    g.fillRect(30, 24, 4, 12); // strap
    // Visor / Goggles
    g.fillStyle(0x2f3e46, 1);
    g.fillRect(20, 28, 24, 6);
    // Blue collar
    g.fillStyle(0x8fa8c6, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 16, 28, 10, 4);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.generateTexture('npc_commuter', 64, 64);
    g.destroy();

    // --- 5. NPC ECOLOGY (64x64, 🌿 Professor Lin) ---
    g = this.add.graphics();
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Field Hat (Green)
    g.fillStyle(0x7c9a8f, 1);
    g.fillCircle(32, 22, 10);
    g.fillRect(16, 23, 32, 3);
    // Glasses
    g.lineStyle(1, 0x000000, 1);
    g.strokeCircle(26, 32, 4);
    g.strokeCircle(38, 32, 4);
    g.lineBetween(30, 32, 34, 32);
    // Green jacket
    g.fillStyle(0x547c64, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.strokeCircle(32, 22, 10);
    g.generateTexture('npc_ecology', 64, 64);
    g.destroy();

    // --- 6. NPC YOUTH (64x64, 🎸 Street Musician Lili) ---
    g = this.add.graphics();
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Brown hair
    g.fillStyle(0x8a5229, 1);
    g.fillCircle(20, 38, 8); // left strand
    g.fillCircle(44, 38, 8); // right strand
    g.fillCircle(32, 23, 13);
    // Red headband
    g.fillStyle(0xd98880, 1);
    g.fillRect(20, 22, 24, 4);
    // Headphones
    g.fillStyle(0x2f3e46, 1);
    g.fillCircle(18, 34, 5); // left cup
    g.fillCircle(46, 34, 5); // right cup
    g.lineStyle(2, 0x2f3e46, 1);
    g.strokeCircle(32, 30, 14);
    // Orange shirt
    g.fillStyle(0xe6c280, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.generateTexture('npc_youth', 64, 64);
    g.destroy();

    // --- 7. NPC RIOTER / ANGRY ZHANG (64x64) ---
    g = this.add.graphics();
    // Angry red skin
    g.fillStyle(0xfba59e, 1);
    g.fillCircle(32, 34, 14);
    // Hair (frizzled black)
    g.fillStyle(0x1a202c, 1);
    g.fillCircle(22, 22, 6);
    g.fillCircle(42, 22, 6);
    g.fillCircle(32, 20, 10);
    // Angry eyebrows & open mouth
    g.lineStyle(1.5, 0x000000, 1);
    g.lineBetween(22, 28, 28, 31); // frown L
    g.lineBetween(42, 28, 36, 31); // frown R
    g.fillStyle(0x000000, 1);
    g.fillCircle(32, 39, 4); // open mouth
    // Grey shirt
    g.fillStyle(0x718096, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.generateTexture('npc_rioter', 64, 64);
    g.destroy();

    // --- 8. NPC ANTAGONIST 1 / PATROL LEADER (64x64) ---
    g = this.add.graphics();
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Police/Patrol Cap (Dark blue with gold dot)
    g.fillStyle(0x4c6c96, 1);
    g.fillRect(18, 18, 28, 8);
    g.fillStyle(0xe6c280, 1);
    g.fillCircle(32, 22, 3); // badge
    // Cap visor
    g.fillStyle(0x2c3e35, 1);
    g.fillRect(16, 25, 32, 2);
    // Uniform collar
    g.fillStyle(0x4c6c96, 1);
    g.fillRoundedRect(18, 46, 28, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 46, 28, 16, 4);
    g.strokeRect(18, 18, 28, 8);
    g.generateTexture('npc_antagonist_1', 64, 64);
    g.destroy();

    // --- 9. NPC ANTAGONIST 2 / PUNK SINGER (64x64) ---
    g = this.add.graphics();
    g.fillStyle(0xfbe0d0, 1);
    g.fillCircle(32, 34, 14);
    // Mohawk haircut (Purple spikes)
    g.fillStyle(0xbf9ac9, 1);
    g.fillTriangle(32, 8, 26, 22, 38, 22);
    g.fillTriangle(26, 14, 22, 24, 30, 24);
    g.fillTriangle(38, 14, 34, 24, 42, 24);
    // Studded collar
    g.fillStyle(0x2f3e46, 1);
    g.fillRect(24, 44, 16, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(28, 46, 2);
    g.fillCircle(36, 46, 2);
    // Leather jacket
    g.fillStyle(0x1a202c, 1);
    g.fillRoundedRect(18, 48, 28, 14, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 34, 14);
    g.strokeRoundedRect(18, 48, 28, 14, 4);
    g.generateTexture('npc_antagonist_2', 64, 64);
    g.destroy();


    // --- 10. HOUSE (64x64) ---
    g = this.add.graphics();
    // Cream walls
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 24, 36, 34);
    // Red triangle roof
    g.fillStyle(0xd98880, 1);
    g.fillTriangle(32, 6, 8, 24, 56, 24);
    // Brown door
    g.fillStyle(0xa06a42, 1);
    g.fillRect(28, 42, 10, 16);
    // Windows
    g.fillStyle(0x8fa8c6, 1);
    g.fillRect(20, 30, 8, 8);
    g.fillRect(36, 30, 8, 8);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeRect(14, 24, 36, 34);
    g.strokeTriangle(32, 6, 8, 24, 56, 24);
    g.strokeRect(28, 42, 10, 16);
    g.strokeRect(20, 30, 8, 8);
    g.strokeRect(36, 30, 8, 8);
    g.generateTexture('house', 64, 64);
    g.destroy();

    // --- 11. SHOP (64x64) ---
    g = this.add.graphics();
    // Cream walls
    g.fillStyle(0xffffff, 1);
    g.fillRect(12, 20, 40, 38);
    // Awning stripes (Sage & White)
    const stripeW = 8;
    for (let i = 0; i < 5; i++) {
      g.fillStyle(i % 2 === 0 ? 0x7c9a8f : 0xffffff, 1);
      g.fillRect(12 + i * stripeW, 20, stripeW, 10);
    }
    // Big shop window (Blue glass)
    g.fillStyle(0x8fa8c6, 1);
    g.fillRect(18, 34, 18, 16);
    // Shop door
    g.fillStyle(0xa06a42, 1);
    g.fillRect(38, 36, 10, 22);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeRect(12, 20, 40, 38);
    g.strokeRect(18, 34, 18, 16);
    g.strokeRect(38, 36, 10, 22);
    g.strokeRect(12, 20, 40, 10);
    g.generateTexture('shop', 64, 64);
    g.destroy();

    // --- 12. QUEST MARKER (48x48) ---
    g = this.add.graphics();
    // Brown signpost
    g.fillStyle(0xa06a42, 1);
    g.fillRect(22, 20, 4, 24); // post
    g.fillStyle(0x8c5a3c, 1);
    g.fillRoundedRect(8, 6, 32, 16, 4); // sign board
    // Leaf circle detail
    g.fillStyle(0x7cb79e, 1);
    g.fillCircle(16, 14, 4);
    g.fillStyle(0x8caf97, 1);
    g.fillCircle(22, 12, 3);
    // Sign markings (fake writing)
    g.fillStyle(0xffffff, 1);
    g.fillRect(28, 10, 8, 2);
    g.fillRect(26, 15, 10, 2);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeRect(22, 20, 4, 24);
    g.strokeRoundedRect(8, 6, 32, 16, 4);
    g.generateTexture('quest_marker', 48, 48);
    g.destroy();

    // --- 13. ANGER PARTICLE (16x16) ---
    g = this.add.graphics();
    g.lineStyle(2, 0xd98880, 1);
    // Draw cross lines for anger mark (manga anger mark 💢 simplified for compile safety)
    g.lineBetween(3, 3, 13, 13);
    g.lineBetween(13, 3, 3, 13);
    g.lineBetween(3, 8, 13, 8);
    g.lineBetween(8, 3, 8, 13);
    g.generateTexture('anger_particle', 16, 16);
    g.destroy();

    // --- 14. MEDAL GOLD (64x64) ---
    g = this.add.graphics();
    // Ribbon ribbons (crossing)
    g.fillStyle(0xd98880, 1); // red
    g.fillTriangle(24, 28, 16, 56, 32, 46);
    g.fillTriangle(40, 28, 48, 56, 32, 46);
    // Golden circle
    g.fillStyle(0xe6c280, 1);
    g.fillCircle(32, 26, 16);
    g.fillStyle(0xfdd835, 1);
    g.fillCircle(32, 26, 12);
    // Star details
    g.fillStyle(0xffffff, 1);
    g.fillCircle(32, 26, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 26, 16);
    g.strokeTriangle(24, 28, 16, 56, 32, 46);
    g.strokeTriangle(40, 28, 48, 56, 32, 46);
    g.generateTexture('medal_gold', 64, 64);
    g.destroy();

    // --- 15. MEDAL SILVER (64x64) ---
    g = this.add.graphics();
    // Ribbon (blue)
    g.fillStyle(0x8fa8c6, 1);
    g.fillTriangle(24, 28, 16, 56, 32, 46);
    g.fillTriangle(40, 28, 48, 56, 32, 46);
    // Silver circle
    g.fillStyle(0xd1d5db, 1);
    g.fillCircle(32, 26, 16);
    g.fillStyle(0xf3f4f6, 1);
    g.fillCircle(32, 26, 12);
    // Center dot
    g.fillStyle(0xffffff, 1);
    g.fillCircle(32, 26, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 26, 16);
    g.strokeTriangle(24, 28, 16, 56, 32, 46);
    g.strokeTriangle(40, 28, 48, 56, 32, 46);
    g.generateTexture('medal_silver', 64, 64);
    g.destroy();

    // --- 16. MEDAL BRONZE (64x64) ---
    g = this.add.graphics();
    // Ribbon (green)
    g.fillStyle(0x7cb79e, 1);
    g.fillTriangle(24, 28, 16, 56, 32, 46);
    g.fillTriangle(40, 28, 48, 56, 32, 46);
    // Bronze circle
    g.fillStyle(0xa06a42, 1);
    g.fillCircle(32, 26, 16);
    g.fillStyle(0xcd7f32, 1);
    g.fillCircle(32, 26, 12);
    // Center dot
    g.fillStyle(0xffffff, 1);
    g.fillCircle(32, 26, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeCircle(32, 26, 16);
    g.strokeTriangle(24, 28, 16, 56, 32, 46);
    g.generateTexture('medal_bronze', 64, 64);
    g.destroy();

    // --- 17. FLAG MARKER (48x48) ---
    g = this.add.graphics();
    // Pole (Grey)
    g.fillStyle(0x718096, 1);
    g.fillRect(20, 8, 4, 32);
    // Flag banner (Pastel Gold/Yellow)
    g.fillStyle(0xe6c280, 1);
    g.fillTriangle(24, 8, 42, 16, 24, 24);
    // Flag base stand
    g.fillStyle(0x2c3e35, 1);
    g.fillRect(14, 38, 16, 4);
    // Outlines
    g.lineStyle(1.5, outlineColor, 1);
    g.strokeRect(20, 8, 4, 32);
    g.strokeTriangle(24, 8, 42, 16, 24, 24);
    g.strokeRect(14, 38, 16, 4);
    g.generateTexture('flag_marker', 48, 48);
    g.destroy();

    // --- 18. SHADOW (64x64) ---
    g = this.add.graphics();
    g.fillStyle(0x000000, 0.22); // 22% opacity black
    g.fillEllipse(32, 42, 22, 10); // Oval ellipse shadow for 2.5D objects
    g.generateTexture('shadow', 64, 64);
    g.destroy();
  }
}
