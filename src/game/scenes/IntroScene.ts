import Phaser from 'phaser';
import { CHARACTERS } from '../data/characters';
import type { CharacterId } from '../data/characters';
import { INITIAL_STATS } from '../data/stats';

export class IntroScene extends Phaser.Scene {
  private phase: 'title' | 'story' | 'character' = 'title';
  private currentSlide = 0;
  private typedText = '';
  private fullText = '';
  private typewriterTimer?: Phaser.Time.TimerEvent;
  private dialogTextObj?: Phaser.GameObjects.Text;
  
  // Visual elements list for cleanup
  private tempElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('IntroScene');
  }

  create() {
    this.phase = 'title';
    this.currentSlide = 0;
    this.tempElements = [];
    
    // Draw Title Screen
    this.drawTitleScreen();
  }

  // PHASE 1: TITLE SCREEN
  private drawTitleScreen() {
    this.cleanupTempElements();
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background color (light beige/cream)
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xf4f3ef);
    this.tempElements.push(bg);

    // Glowing grids - soft green
    const grid = this.add.grid(width / 2, height / 2, width, height, 40, 40, 0, 0, 0x7c9a8f, 0.1);
    this.tempElements.push(grid);

    // Giant Emoji
    const emoji = this.add.text(width / 2, height / 2 - 120, '🌳', { font: '70px Arial' }).setOrigin(0.5);
    this.tempElements.push(emoji);
    
    // Animate emoji bouncing slightly
    this.tweens.add({
      targets: emoji,
      y: height / 2 - 135,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Game Title
    const title = this.add.text(width / 2, height / 2 - 30, '台南綠園道', {
      font: 'bold 44px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    this.tempElements.push(title);

    const subtitle = this.add.text(width / 2, height / 2 + 25, '2.5D RPG 城市協商遊戲', {
      font: 'bold 22px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    }).setOrigin(0.5);
    this.tempElements.push(subtitle);

    // Press Start Button (Minimalist white box with grey border)
    const startButtonBox = this.add.graphics();
    startButtonBox.fillStyle(0xffffff, 1);
    startButtonBox.lineStyle(2, 0x7c9a8f, 1);
    startButtonBox.fillRoundedRect(width / 2 - 120, height / 2 + 100, 240, 50, 8);
    startButtonBox.strokeRoundedRect(width / 2 - 120, height / 2 + 100, 240, 50, 8);
    this.tempElements.push(startButtonBox);

    const startBtn = this.add.text(width / 2, height / 2 + 125, '開始遊戲 (START)', {
      font: 'bold 15px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tempElements.push(startBtn);

    startBtn.on('pointerover', () => startBtn.setColor('#7c9a8f'));
    startBtn.on('pointerout', () => startBtn.setColor('#2c3e35'));
    startBtn.on('pointerdown', () => this.startStoryCinematic());

    // Press Space Key listener
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard?.once('keydown-SPACE', () => {
      if (this.phase === 'title') this.startStoryCinematic();
    });

    const info = this.add.text(width / 2, height - 30, 'WASD鍵盤移動 // E互動 // 1,2,3選擇對話 // 支援滑鼠操作', {
      font: '10px monospace',
      color: '#5c6b63'
    }).setOrigin(0.5);
    this.tempElements.push(info);
  }

  // PHASE 2: STORY CINEMATIC
  private startStoryCinematic() {
    this.phase = 'story';
    this.currentSlide = 0;
    this.cleanupTempElements();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Light beige canvas
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xf4f3ef);
    this.tempElements.push(bg);

    // Skip Intro button
    const skipBtn = this.add.text(width - 80, 30, '跳過動畫 ➔', {
      font: '12px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tempElements.push(skipBtn);
    skipBtn.on('pointerover', () => skipBtn.setColor('#2c3e35'));
    skipBtn.on('pointerout', () => skipBtn.setColor('#7c9a8f'));
    skipBtn.on('pointerdown', () => this.startCharacterSelection());

    // Visual Panel Box
    const visualBox = this.add.graphics();
    visualBox.lineStyle(1, 0x7c9a8f, 0.3);
    visualBox.strokeRect(width / 2 - 200, height / 2 - 170, 400, 180);
    this.tempElements.push(visualBox);

    // Dialog Box (Clean white card)
    const dialogBox = this.add.graphics();
    dialogBox.fillStyle(0xffffff, 0.95);
    dialogBox.lineStyle(1, 0x7c9a8f, 0.5);
    dialogBox.fillRoundedRect(width / 2 - 350, height - 150, 700, 110, 10);
    dialogBox.strokeRoundedRect(width / 2 - 350, height - 150, 700, 110, 10);
    this.tempElements.push(dialogBox);

    // Dialog Text Object (Dark charcoal text)
    this.dialogTextObj = this.add.text(width / 2 - 330, height - 135, '', {
      font: '14px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: 660, useAdvancedWrap: true },
      lineSpacing: 8
    });
    this.tempElements.push(this.dialogTextObj);

    // Next Slide Button (White panel)
    const nextBtnBox = this.add.graphics();
    nextBtnBox.fillStyle(0xffffff, 0.95);
    nextBtnBox.lineStyle(1, 0x7c9a8f, 0.8);
    nextBtnBox.fillRoundedRect(width / 2 + 250, height - 70, 80, 25, 4);
    nextBtnBox.strokeRoundedRect(width / 2 + 250, height - 70, 80, 25, 4);
    this.tempElements.push(nextBtnBox);

    const nextText = this.add.text(width / 2 + 290, height - 58, '下一幕', {
      font: '10px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tempElements.push(nextText);

    nextText.on('pointerdown', () => this.advanceSlide());

    // Launch first slide
    this.showSlide();
  }

  private showSlide() {
    // Remove previous slide graphics
    if (this.tempElements.indexOf(this.dialogTextObj!) === -1) {
      // Avoid deleting the static elements
    }
    
    // Clean old slide items (emojis or custom visual graphics)
    const itemsToRemove = this.tempElements.filter(e => e.name === 'slide_item');
    itemsToRemove.forEach(e => {
      e.destroy();
      this.tempElements.splice(this.tempElements.indexOf(e), 1);
    });

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const slides = [
      {
        text: "台南鐵路地下化正式完工！地表上騰出了一條長達數公里的綠色廊道，市民們正熱烈討論著這片得來不易的空間該如何運用...",
        emoji: "🏙️ 🌳 🚉",
        color: 0x22c55e,
        visual: () => {
          const t1 = this.add.text(width / 2, height / 2 - 80, '🏙️ 🚊 🌳', { font: '64px Arial' }).setOrigin(0.5);
          t1.name = 'slide_item';
          this.tempElements.push(t1);
        }
      },
      {
        text: "然而多方利益拉扯：居民想要清靜、店家想要商機、通勤族要求暢通無阻、生態團體主張低干擾，而青年們則爭取滑板與表演廣場...",
        emoji: "👵 🏪 🚲 🌿 🎸",
        color: 0xeab308,
        visual: () => {
          const emojis = ['👵', '🏪', '🚲', '🌿', '🎸'];
          emojis.forEach((em, idx) => {
            const x = width / 2 - 120 + idx * 60;
            const t = this.add.text(x, height / 2 - 80, em, { font: '40px Arial' }).setOrigin(0.5);
            t.name = 'slide_item';
            this.tempElements.push(t);
            this.tweens.add({
              targets: t,
              y: height / 2 - 95,
              duration: 800 + idx * 200,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          });
        }
      },
      {
        text: "你被指派為【城市協調者】！你必須前往通勤熱區、商住混合點及夜間林核心區，完成三場衝突協商，並維持各指標的良性平衡！",
        emoji: "👔 📐 🤝 ⚔️",
        color: 0x06b6d4,
        visual: () => {
          const t1 = this.add.text(width / 2, height / 2 - 80, '🧐 🤝 ⚔️', { font: '55px Arial' }).setOrigin(0.5);
          t1.name = 'slide_item';
          this.tempElements.push(t1);
        }
      }
    ];

    const currentData = slides[this.currentSlide];
    currentData.visual();

    // Typewriter
    this.fullText = currentData.text;
    this.typedText = '';
    
    if (this.typewriterTimer) this.typewriterTimer.destroy();
    
    let charIndex = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: 30,
      callback: () => {
        this.typedText += this.fullText.charAt(charIndex);
        if (this.dialogTextObj) this.dialogTextObj.setText(this.typedText);
        charIndex++;
      },
      repeat: this.fullText.length - 1
    });
  }

  private advanceSlide() {
    if (this.typewriterTimer && this.typewriterTimer.getProgress() < 1) {
      // Force complete typewriter
      this.typewriterTimer.destroy();
      this.typedText = this.fullText;
      this.dialogTextObj?.setText(this.fullText);
      return;
    }

    if (this.currentSlide < 2) {
      this.currentSlide++;
      this.showSlide();
    } else {
      this.startCharacterSelection();
    }
  }

  // PHASE 3: CHARACTER SELECTION SCREEN
  private startCharacterSelection() {
    this.phase = 'character';
    this.cleanupTempElements();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background (light beige)
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xf4f3ef);
    this.tempElements.push(bg);

    const grid = this.add.grid(width / 2, height / 2, width, height, 40, 40, 0, 0, 0x7c9a8f, 0.06);
    this.tempElements.push(grid);

    // Title (Dark green-grey)
    const title = this.add.text(width / 2, 40, '🎭 選擇你的協調角色 (Select Role)', {
      font: 'bold 24px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    this.tempElements.push(title);

    const subtitle = this.add.text(width / 2, 75, '身分將決定你的初始 HUD 數值，並帶來特定的公共空間協商加成', {
      font: '12px "Noto Sans TC", sans-serif',
      color: '#5c6b63'
    }).setOrigin(0.5);
    this.tempElements.push(subtitle);

    // Render 6 Character Cards (2 rows of 3)
    const cardWidth = 220;
    const cardHeight = 150;
    const startX = width / 2 - 240;
    const startY = height / 2 - 80;

    CHARACTERS.forEach((char, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * 240;
      const y = startY + row * 170;

      // Draw Card graphics (Clean white card)
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0xffffff, 0.95);
      cardBg.lineStyle(1, 0x7c9a8f, 0.2);
      cardBg.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 8);
      cardBg.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 8);
      this.tempElements.push(cardBg);

      // Card hover state indicator
      const borderGlow = this.add.graphics();
      borderGlow.lineStyle(2, 0x7c9a8f, 1);
      borderGlow.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 8);
      borderGlow.setVisible(false);
      this.tempElements.push(borderGlow);

      // Avatar
      const avText = this.add.text(x, y - 40, char.avatar, { font: '36px Arial' }).setOrigin(0.5);
      this.tempElements.push(avText);

      // Name
      const nameText = this.add.text(x, y + 2, char.name, {
        font: 'bold 13px "Noto Sans TC", sans-serif',
        color: '#2f3e46'
      }).setOrigin(0.5);
      this.tempElements.push(nameText);

      // Talent Ability
      const talentText = this.add.text(x, y + 22, `★ ${char.specialAbilityName}`, {
        font: '9px "Noto Sans TC", sans-serif',
        color: '#7c9a8f'
      }).setOrigin(0.5);
      this.tempElements.push(talentText);

      // Short Description
      const descText = this.add.text(x, y + 46, char.description, {
        font: '8px "Noto Sans TC", sans-serif',
        color: '#5c6b63',
        wordWrap: { width: cardWidth - 24, useAdvancedWrap: true },
        align: 'center'
      }).setOrigin(0.5);
      this.tempElements.push(descText);

      // Interactive Card Zone
      const hitArea = this.add.zone(x, y, cardWidth, cardHeight).setInteractive({ useHandCursor: true });
      this.tempElements.push(hitArea);

      hitArea.on('pointerover', () => {
        borderGlow.setVisible(true);
        avText.setScale(1.15);
      });

      hitArea.on('pointerout', () => {
        borderGlow.setVisible(false);
        avText.setScale(1);
      });

      hitArea.on('pointerdown', () => {
        this.selectCharacterAndLaunch(char.id);
      });
    });
  }

  private selectCharacterAndLaunch(charId: CharacterId) {
    const char = CHARACTERS.find(c => c.id === charId)!;

    // Apply modifiers to default stats
    const stats = { ...INITIAL_STATS };
    Object.entries(char.statModifier).forEach(([key, val]) => {
      const k = key as keyof typeof INITIAL_STATS;
      stats[k] = Math.max(0, Math.min(100, stats[k] + (val as number)));
    });

    // Save configuration in Phaser Registry
    this.registry.set('selectedCharacter', charId);
    this.registry.set('selectedCharName', char.name);
    this.registry.set('stats', stats);
    this.registry.set('completedQuests', { 1: false, 2: false, 3: false });

    // Transition to main map scene
    this.scene.start('MapScene');
  }

  private cleanupTempElements() {
    this.tempElements.forEach(e => {
      if (e.destroy) e.destroy();
    });
    this.tempElements = [];
  }
}
