import Phaser from 'phaser';
import { QUESTS } from '../data/quests';
import type { QuestData, QuestChoice } from '../data/quests';
import type { GameStats } from '../data/stats';

export class MapScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private interactKey!: Phaser.Input.Keyboard.Key;

  // Quest gates & NPC entities
  private questZones!: Phaser.Physics.Arcade.StaticGroup;
  private npcEntities!: Phaser.Physics.Arcade.StaticGroup;

  // Interaction prompt
  private promptTextObj!: Phaser.GameObjects.Text;
  private activeInteractiveObj: { type: 'quest' | 'npc'; id: number; ref: Phaser.GameObjects.GameObject } | null = null;

  // Dialogue UI
  private isDialogueActive = false;
  private isClashActive = false;
  private dialogueOverlay?: Phaser.GameObjects.Container;
  private activeQuest: QuestData | null = null;
  private activeChoiceIndex = -1;

  // HUD UI elements (fixed on screen)
  private hudTexts: { [key: string]: Phaser.GameObjects.Text } = {};
  private hudBars: { [key: string]: Phaser.GameObjects.Graphics } = {};

  constructor() {
    super('MapScene');
  }

  create() {
    this.isDialogueActive = false;
    this.isClashActive = false;
    this.activeInteractiveObj = null;
    this.activeQuest = null;
    this.activeChoiceIndex = -1;

    const mapWidth = 1400;
    const mapHeight = 700;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Set Arcade physics bounds
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // 1. DRAW TAINAN GREENWAY ENVIRONMENT (Flat Vector, Light Pastel Green & Cream theme)
    // Base Cream grass color
    this.add.rectangle(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 0xf4f3ef);

    // Subtle Grid lines
    this.add.grid(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 40, 40, 0, 0, 0xe6e4dc, 0.4);

    // Greenway Spine Path running horizontally through center (Soft pastel green)
    const greenwaySpine = this.add.rectangle(mapWidth / 2, mapHeight / 2 + 10, mapWidth, 90, 0xc2d6c4);
    greenwaySpine.setStrokeStyle(2, 0x7c9a8f, 0.3);

    // Walking / Sidewalk borders (Sage Green)
    this.add.rectangle(mapWidth / 2, mapHeight / 2 - 40, mapWidth, 4, 0xa3c1ad, 0.4);
    this.add.rectangle(mapWidth / 2, mapHeight / 2 + 60, mapWidth, 4, 0xa3c1ad, 0.4);

    // Plazas (circular nodes - warm beige)
    this.add.circle(300, mapHeight / 2 + 10, 65, 0xe6e4dc, 0.85).setStrokeStyle(1.5, 0x7c9a8f, 0.3);
    this.add.circle(700, mapHeight / 2 + 10, 80, 0xe6e4dc, 0.85).setStrokeStyle(1.5, 0x7c9a8f, 0.3);
    this.add.circle(1100, mapHeight / 2 + 10, 70, 0xe6e4dc, 0.85).setStrokeStyle(1.5, 0x7c9a8f, 0.3);

    // Environment Colliders Group (houses/stores/trees)
    const obstacles = this.physics.add.staticGroup();

    // Helper to draw clean white circle pedestals under building emojis
    const createBuildingPedestal = (x: number, y: number, emoji: string, isBig: boolean = false) => {
      const radius = isBig ? 26 : 22;
      const ped = this.add.graphics();
      ped.fillStyle(0xffffff, 1);
      ped.lineStyle(1.5, 0x7c9a8f, 0.4);
      ped.fillCircle(x, y + 4, radius);
      ped.strokeCircle(x, y + 4, radius);
      obstacles.add(ped);

      const txt = this.add.text(x, y, emoji, { font: isBig ? '34px Arial' : '30px Arial' }).setOrigin(0.5);
      // Setup bounding box directly on physics static body
      const body = ped.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(radius * 1.5, radius * 1.5).setOffset(-radius * 0.75, -radius * 0.75);
      return txt;
    };

    // Spawn Buildings (North side = Residential, South side = Shops)
    const houseCoords = [
      { x: 120, y: 180, em: '🏠' }, { x: 250, y: 160, em: '🏠' },
      { x: 800, y: 170, em: '🏠' }, { x: 950, y: 180, em: '🏠' }
    ];
    houseCoords.forEach(c => {
      createBuildingPedestal(c.x, c.y, c.em);
    });

    const shopCoords = [
      { x: 450, y: 530, em: '🏪' }, { x: 600, y: 550, em: '☕' },
      { x: 780, y: 530, em: '🛍️' }, { x: 1250, y: 540, em: '🏪' }
    ];
    shopCoords.forEach(c => {
      createBuildingPedestal(c.x, c.y, c.em);
    });

    // Helper to draw clean vector trees (overlapping soft green circles) instead of basic emojis
    const createVectorTree = (x: number, y: number) => {
      const treeGrp = this.add.graphics();
      // Trunk (brown)
      treeGrp.fillStyle(0xa06a42, 1);
      treeGrp.fillRect(x - 4, y + 10, 8, 18);
      // Foliage layers (multi-tone pastel green circles)
      treeGrp.fillStyle(0x8caf97, 1);
      treeGrp.fillCircle(x, y - 10, 20);
      treeGrp.fillStyle(0xa3c1ad, 1);
      treeGrp.fillCircle(x - 12, y + 2, 16);
      treeGrp.fillStyle(0x7c9a8f, 1);
      treeGrp.fillCircle(x + 12, y + 2, 16);

      // Outline
      treeGrp.lineStyle(1.5, 0x5c6b63, 0.4);
      treeGrp.strokeCircle(x, y - 10, 20);
      treeGrp.strokeCircle(x - 12, y + 2, 16);
      treeGrp.strokeCircle(x + 12, y + 2, 16);
      
      obstacles.add(treeGrp);
      const body = treeGrp.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(36, 36).setOffset(-18, -10);
    };

    // Spawn Trees (Scattered around)
    const treeCoords = [
      { x: 60, y: 280 }, { x: 480, y: 200 }, { x: 640, y: 190 },
      { x: 900, y: 510 }, { x: 1050, y: 180 }, { x: 1350, y: 280 }
    ];
    treeCoords.forEach(c => {
      createVectorTree(c.x, c.y);
    });

    // Spawn stylized concrete wall barrier panels (pure white with soft grey outline - matching architectural diagram)
    const wallCoords = [
      { x: 380, y: 230, w: 120, h: 10 },
      { x: 740, y: 450, w: 160, h: 10 },
      { x: 1010, y: 240, w: 100, h: 10 }
    ];
    wallCoords.forEach(w => {
      const wall = this.add.graphics();
      wall.fillStyle(0xffffff, 1);
      wall.lineStyle(1.5, 0x7c9a8f, 0.4);
      wall.fillRoundedRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h, 4);
      wall.strokeRoundedRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h, 4);
      obstacles.add(wall);
      const body = wall.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(w.w, w.h).setOffset(-w.w / 2, -w.h / 2);
    });

    // 2. PLAYER CHARACTER (Clean warm-teal node)
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x7c9a8f, 1);
    playerGraphics.fillCircle(12, 12, 10);
    playerGraphics.lineStyle(2, 0xffffff, 1);
    playerGraphics.strokeCircle(12, 12, 10);
    playerGraphics.generateTexture('player_texture', 24, 24);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(100, mapHeight / 2 + 10, 'player_texture');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 20);

    // Simple Emoji label floating above player's head
    const playerHead = this.add.text(this.player.x, this.player.y - 20, '🧐', { font: '14px Arial' }).setOrigin(0.5);
    
    // 3. COLLISION RULES
    this.physics.add.collider(this.player, obstacles);

    // Update floating head position
    this.events.on('update', () => {
      playerHead.setPosition(this.player.x, this.player.y - 20);
    });

    // 4. KEYBOARD CONFIG
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Number listeners for choices selection
    this.input.keyboard?.on('keydown-ONE', () => this.handleNumberSelect(0));
    this.input.keyboard?.on('keydown-TWO', () => this.handleNumberSelect(1));
    this.input.keyboard?.on('keydown-THREE', () => this.handleNumberSelect(2));
    this.input.keyboard?.on('keydown-SPACE', () => this.handleSpaceKey());

    // 5. STATIC INTERACTIVES: NPC & QUEST NODES
    this.questZones = this.physics.add.staticGroup();
    this.npcEntities = this.physics.add.staticGroup();

    // Spawn 3 Quest zones along Greenway Spine (Soft pastel colors)
    const questDataList = [
      { id: 1, x: 300, y: mapHeight / 2 + 10, name: '⚔️ 任務 1：通勤衝突' },
      { id: 2, x: 700, y: mapHeight / 2 + 10, name: '⚔️ 任務 2：商住噪音' },
      { id: 3, x: 1100, y: mapHeight / 2 + 10, name: '⚔️ 任務 3：生態照明' }
    ];

    questDataList.forEach(q => {
      // Draw a clean target indicator
      const qMarker = this.add.text(q.x, q.y - 12, '⚔️', { font: '26px Arial' }).setOrigin(0.5);
      qMarker.setData('type', 'quest');
      qMarker.setData('id', q.id);
      this.questZones.add(qMarker);

      // Add a label
      this.add.text(q.x, q.y + 20, q.name, { font: 'bold 9px "Noto Sans TC", sans-serif', color: '#5c6b63' }).setOrigin(0.5);
    });

    // Spawn 6 NPCs representing stakeholders
    const npcCoordsList = [
      { id: 10, x: 180, y: 240, em: '👵', label: '居民代表' },
      { id: 11, x: 500, y: 460, em: '🏪', label: '商家代表' },
      { id: 12, x: 340, y: 390, em: '🚲', label: '通勤族' },
      { id: 13, x: 860, y: 220, em: '🌿', label: '生態學者' },
      { id: 14, x: 660, y: 460, em: '🎸', label: '青年樂手' },
      { id: 15, x: 1060, y: 390, em: '🗣️', label: '抱怨老張' }
    ];

    npcCoordsList.forEach(n => {
      // Pedestal behind NPC
      const ped = this.add.graphics();
      ped.fillStyle(0xffffff, 1);
      ped.lineStyle(1, 0x7c9a8f, 0.3);
      ped.fillCircle(n.x, n.y + 2, 16);
      ped.strokeCircle(n.x, n.y + 2, 16);
      this.npcEntities.add(ped);
      
      const body = ped.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(24, 24).setOffset(-12, -12);

      const npcText = this.add.text(n.x, n.y, n.em, { font: '22px Arial' }).setOrigin(0.5);
      npcText.setData('type', 'npc');
      npcText.setData('id', n.id);
      npcText.setData('label', n.label);
      ped.setData('type', 'npc');
      ped.setData('id', n.id);
      ped.setData('label', n.label);

      // Label
      this.add.text(n.x, n.y + 22, n.label, { font: '8px "Noto Sans TC", sans-serif', color: '#5c6b63' }).setOrigin(0.5);
    });

    // 6. PROMPT POPUP
    this.promptTextObj = this.add.text(width / 2, height / 2, '', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#2c3e35',
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(20);
    this.promptTextObj.setStroke('#7c9a8f', 1);

    // 7. CAMERA SETUP
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 8. RENDER FIXED HUD STATS
    this.drawHUD();

    // Trigger dialog if user walks close and overlaps interactables
    this.physics.add.overlap(this.player, this.questZones, this.handleTriggerInteractive as any, undefined, this);
    this.physics.add.overlap(this.player, this.npcEntities, this.handleTriggerInteractive as any, undefined, this);
  }

  update() {
    // 1. Handle HUD Stats Updates
    this.updateHUD();

    // Reset interaction state if player walks away
    if (this.activeInteractiveObj) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        (this.activeInteractiveObj.ref as any).x, (this.activeInteractiveObj.ref as any).y
      );
      if (dist > 50) {
        this.promptTextObj.setVisible(false);
        this.activeInteractiveObj = null;
      }
    }

    if (this.isDialogueActive || this.isClashActive) {
      this.player.setVelocity(0, 0);
      return;
    }

    // 2. KEYBOARD CONTROLS (WASD/ARROWS)
    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      vx = -speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      vx = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      vy = -speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      vy = speed;
    }

    // Diagonal speed normalization
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // 3. LISTEN FOR INTERACTION PRESS (KEY E)
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.triggerInteraction();
    }
  }

  // INTERACTIVE TRIGGERS
  private handleTriggerInteractive(_player: any, obj: Phaser.GameObjects.GameObject) {
    const type = obj.getData('type');
    const id = obj.getData('id');
    
    this.activeInteractiveObj = { type, id, ref: obj };

    // Set interactive prompt position and text (Clean green theme)
    this.promptTextObj.setText(
      type === 'quest'
        ? `▶ 按【 E 】鍵啟動公共空間協商 ⚔`
        : `▶ 按【 E 】鍵與【${obj.getData('label')}】對話 💬`
    );
    this.promptTextObj.setPosition(this.cameras.main.width / 2, this.cameras.main.height - 110);
    this.promptTextObj.setVisible(true);
  }

  private triggerInteraction() {
    if (!this.activeInteractiveObj) return;

    // Hide prompt
    this.promptTextObj.setVisible(false);

    if (this.activeInteractiveObj.type === 'quest') {
      const qId = this.activeInteractiveObj.id;
      const completed = this.registry.get('completedQuests')[qId];
      if (completed) {
        // Quest already completed text
        this.openNPCBriefDialog('本區協商對策已實施完畢。綠廊正穩定運作中！ 🌟');
      } else {
        const quest = QUESTS.find(q => q.id === qId)!;
        this.openQuestDialogue(quest);
      }
    } else {
      // NPC generic dialogs
      const npcId = this.activeInteractiveObj.id;
      const dialogsMap: { [key: number]: string } = {
        10: '👵 居民代表：「綠園道是我們散步談天的地方。請保護好夜間的安寧，別讓喧鬧吉他或爆量市集毀了社區。」',
        11: '🏪 商家代表：「有商機人潮，店面才有出路！我們希望能爭取更多夜間裝飾亮化與市集推廣！」',
        12: '🚲 通勤族：「我們只希望自行車動線清楚，別被大廣場或亂切的步道擋住，安全通過是最高守則！」',
        13: '🌿 生態學者：「自然是台南的靈魂。請守護原生喬木林帶，夜間降低眩光，鳥兒和昆蟲需要黑暗棲地！」',
        14: '🎸 青年樂手：「我們希望有不插電吉他野台和滑板聚集空間，讓古都有更多朝氣與創意的舞台！」',
        15: '🗣️ 抱怨老張：「哼！做什麼建設都是白花錢，治安變差、房價下跌都是那些大樹 and 沒燈造成的啦！」'
      };
      this.openNPCBriefDialog(dialogsMap[npcId] || '「你好，協商官！」');
    }
  }

  // DIALOGUE LAYER DRAWING
  private openNPCBriefDialog(text: string) {
    this.isDialogueActive = true;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Container
    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    // Dim Background (translucent grey-slate instead of pure black)
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x2f3e46, 0.4);
    this.dialogueOverlay.add(dim);

    // Dialog Box Shape (Rounded White Panel)
    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.98);
    box.lineStyle(1.5, 0x7c9a8f, 0.5);
    box.fillRoundedRect(width / 2 - 300, height / 2 - 60, 600, 120, 8);
    box.strokeRoundedRect(width / 2 - 300, height / 2 - 60, 600, 120, 8);
    this.dialogueOverlay.add(box);

    // Text content (Dark Slate Green)
    const txt = this.add.text(width / 2 - 275, height / 2 - 35, text, {
      font: '14px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: 550, useAdvancedWrap: true },
      lineSpacing: 8
    });
    this.dialogueOverlay.add(txt);

    // Tip hint
    const hint = this.add.text(width / 2, height / 2 + 35, '按【 空白鍵 (SPACE) 】或點擊以關閉', {
      font: '10px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    }).setOrigin(0.5);
    this.dialogueOverlay.add(hint);

    // Click to dismiss
    dim.setInteractive().on('pointerdown', () => this.closeDialogue());
  }

  // ANIMATED STAKEHOLDER CLASH/ARGUMENT ANIMATION
  private playClashAnimation(quest: QuestData, onComplete: () => void) {
    this.isClashActive = true;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create container for animation items
    const clashContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(35);

    // Dim background
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x2f3e46, 0.7);
    clashContainer.add(dim);

    // VS center label
    const vsCircle = this.add.circle(width / 2, height / 2 - 60, 45, 0xd98880, 0.9).setStrokeStyle(2, 0xffffff, 1);
    const vsText = this.add.text(width / 2, height / 2 - 60, 'VS', {
      font: 'bold 28px "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    clashContainer.add([vsCircle, vsText]);

    // Bouncing tween on VS label
    this.tweens.add({
      targets: vsCircle,
      scale: 1.15,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 1. Proponent Card (Left)
    const pCard = this.add.container(-220, height / 2 - 60);
    const pBg = this.add.graphics();
    pBg.fillStyle(0xffffff, 0.95);
    pBg.lineStyle(1.5, 0x8caf97, 0.8);
    pBg.fillRoundedRect(-140, -100, 260, 200, 10);
    pBg.strokeRoundedRect(-140, -100, 260, 200, 10);
    
    const pAvatar = this.add.text(-10, -50, quest.npcAvatar, { font: '48px Arial' }).setOrigin(0.5);
    const pTitle = this.add.text(-10, -5, quest.npcName, {
      font: 'bold 15px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    const pDesc = this.add.text(-10, 40, quest.npcQuote, {
      font: 'italic 11px "Noto Sans TC", sans-serif',
      color: '#5c6b63',
      wordWrap: { width: 220, useAdvancedWrap: true },
      align: 'center'
    }).setOrigin(0.5);
    pCard.add([pBg, pAvatar, pTitle, pDesc]);
    clashContainer.add(pCard);

    // 2. Opponent Card (Right)
    const oCard = this.add.container(width + 220, height / 2 - 60);
    const oBg = this.add.graphics();
    oBg.fillStyle(0xffffff, 0.95);
    oBg.lineStyle(1.5, 0xd98880, 0.8);
    oBg.fillRoundedRect(-120, -100, 260, 200, 10);
    oBg.strokeRoundedRect(-120, -100, 260, 200, 10);

    const oAvatar = this.add.text(10, -50, quest.conflictAvatar, { font: '48px Arial' }).setOrigin(0.5);
    const oTitle = this.add.text(10, -5, `${quest.conflictName}`, {
      font: 'bold 15px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    const oDesc = this.add.text(10, 40, quest.conflictQuote, {
      font: 'italic 11px "Noto Sans TC", sans-serif',
      color: '#5c6b63',
      wordWrap: { width: 220, useAdvancedWrap: true },
      align: 'center'
    }).setOrigin(0.5);
    oCard.add([oBg, oAvatar, oTitle, oDesc]);
    clashContainer.add(oCard);

    // Slide in cards
    this.tweens.add({
      targets: pCard,
      x: width / 2 - 160,
      duration: 600,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: oCard,
      x: width / 2 + 160,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Shaking & head-bumping collision animation
        this.tweens.add({
          targets: pCard,
          x: width / 2 - 130,
          duration: 150,
          yoyo: true,
          repeat: 6,
          ease: 'Sine.easeInOut'
        });

        this.tweens.add({
          targets: oCard,
          x: width / 2 + 130,
          duration: 150,
          yoyo: true,
          repeat: 6,
          ease: 'Sine.easeInOut'
        });

        // Trigger anger particle bursts
        const particleTimer = this.time.addEvent({
          delay: 200,
          callback: () => {
            const rx = width / 2 + Phaser.Math.Between(-60, 60);
            const ry = height / 2 - 60 + Phaser.Math.Between(-80, 80);
            const particleEmoji = ['💢', '💥', '💬', '⚡', '🔥'][Phaser.Math.Between(0, 4)];
            const partText = this.add.text(rx, ry, particleEmoji, { font: '22px Arial' }).setOrigin(0.5).setScrollFactor(0).setDepth(36);
            clashContainer.add(partText);

            this.tweens.add({
              targets: partText,
              y: ry - 40,
              scale: 1.5,
              alpha: 0,
              duration: 400,
              onComplete: () => partText.destroy()
            });
          },
          repeat: 12
        });

        // Camera shakes slightly
        this.cameras.main.shake(1200, 0.003);

        // Add "Start Negotiate" button
        const startBtnBox = this.add.graphics();
        startBtnBox.fillStyle(0x7c9a8f, 1);
        startBtnBox.lineStyle(1.5, 0xffffff, 1);
        startBtnBox.fillRoundedRect(width / 2 - 90, height - 120, 180, 40, 8);
        startBtnBox.strokeRoundedRect(width / 2 - 90, height - 120, 180, 40, 8);
        clashContainer.add(startBtnBox);

        const startBtnText = this.add.text(width / 2, height - 100, '進行公共協商 🤝', {
          font: 'bold 13px "Noto Sans TC", sans-serif',
          color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        clashContainer.add(startBtnText);

        startBtnText.on('pointerover', () => startBtnText.setScale(1.05));
        startBtnText.on('pointerout', () => startBtnText.setScale(1));
        
        const finishClash = () => {
          particleTimer.destroy();
          this.tweens.add({
            targets: clashContainer,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              clashContainer.destroy();
              this.isClashActive = false;
              onComplete();
            }
          });
        };

        startBtnText.on('pointerdown', finishClash);
        dim.setInteractive().on('pointerdown', finishClash);
      }
    });
  }

  private openQuestDialogue(quest: QuestData) {
    this.playClashAnimation(quest, () => {
      this.openQuestDialogueOptions(quest);
    });
  }

  private openQuestDialogueOptions(quest: QuestData) {
    this.isDialogueActive = true;
    this.activeQuest = quest;
    this.activeChoiceIndex = -1;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    // Dim bg (soft grey translucent)
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x2f3e46, 0.55);
    this.dialogueOverlay.add(dim);

    // Large Dialog Box (White Panel)
    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.98);
    box.lineStyle(1.5, 0x7c9a8f, 0.5);
    box.fillRoundedRect(width / 2 - 350, 40, 700, height - 80, 10);
    box.strokeRoundedRect(width / 2 - 350, 40, 700, height - 80, 10);
    this.dialogueOverlay.add(box);

    // Quest Title & Desc
    const titleText = this.add.text(width / 2 - 320, 65, quest.title, {
      font: 'bold 18px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    });
    this.dialogueOverlay.add(titleText);

    const descText = this.add.text(width / 2 - 320, 100, quest.description, {
      font: '12px "Noto Sans TC", sans-serif',
      color: '#5c6b63',
      wordWrap: { width: 640 }
    });
    this.dialogueOverlay.add(descText);

    // NPC Dialog bubble
    const npcTitle = this.add.text(width / 2 - 320, 140, `${quest.npcName} 主張：`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    });
    this.dialogueOverlay.add(npcTitle);

    const npcQuote = this.add.text(width / 2 - 320, 158, quest.npcQuote, {
      font: 'italic 12px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: 640 }
    });
    this.dialogueOverlay.add(npcQuote);

    // Antagonist Dialog bubble
    const antTitle = this.add.text(width / 2 - 320, 205, `${quest.conflictName} (${quest.conflictType}) 主張：`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#d98880'
    });
    this.dialogueOverlay.add(antTitle);

    const antQuote = this.add.text(width / 2 - 320, 222, quest.conflictQuote, {
      font: 'italic 12px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: 640 }
    });
    this.dialogueOverlay.add(antQuote);

    // Choices Title
    const chooseLabel = this.add.text(width / 2 - 320, 280, '🛠️ 選擇您的協商對策方案 (鍵盤按 1, 2, 3)：', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    });
    this.dialogueOverlay.add(chooseLabel);

    // Draw 3 Choices (Clean pastel boxes)
    quest.choices.forEach((choice, idx) => {
      const yCoord = 310 + idx * 62;
      
      const choiceBox = this.add.graphics();
      choiceBox.fillStyle(0xfdfbf7, 0.9);
      choiceBox.lineStyle(1, 0xe6e4dc, 0.8);
      choiceBox.fillRoundedRect(width / 2 - 320, yCoord, 640, 52, 6);
      choiceBox.strokeRoundedRect(width / 2 - 320, yCoord, 640, 52, 6);
      this.dialogueOverlay?.add(choiceBox);

      // Highlighter
      const borderHigh = this.add.graphics();
      borderHigh.lineStyle(2, 0x7c9a8f, 1);
      borderHigh.strokeRoundedRect(width / 2 - 320, yCoord, 640, 52, 6);
      borderHigh.setVisible(false);
      this.dialogueOverlay?.add(borderHigh);

      // Choice Text
      const textPrefix = idx === 0 ? '【A】' : idx === 1 ? '【B】' : '【C】';
      const cTxt = this.add.text(width / 2 - 305, yCoord + 10, `${textPrefix} ${choice.text}`, {
        font: 'bold 12px "Noto Sans TC", sans-serif',
        color: '#2f3e46',
        wordWrap: { width: 610 }
      });
      this.dialogueOverlay?.add(cTxt);

      // Preview stat adjustments text in the choice card
      const activeCharId = this.registry.get('selectedCharacter');
      const adjustedEffects = this.adjustEffectsForRole(choice.effects, activeCharId);
      const effectsStr = Object.entries(adjustedEffects)
        .map(([key, val]) => {
          let label = key;
          if (key === 'residentSatisfaction') label = '居民';
          if (key === 'merchantSatisfaction') label = '商家';
          if (key === 'commuteEfficiency') label = '通勤';
          if (key === 'ecologicalScore') label = '生態';
          if (key === 'safetySense') label = '安全';
          if (key === 'activityVitality') label = '活力';
          if (key === 'conflictValue') label = '衝突';
          return `${label}${val! > 0 ? '+' : ''}${val}`;
        })
        .join('  ');
      
      const effectTxt = this.add.text(width / 2 - 305, yCoord + 32, `影響預估：${effectsStr}`, {
        font: '9px monospace',
        color: '#5c6b63'
      });
      this.dialogueOverlay?.add(effectTxt);

      // Hover zone
      const hoverZone = this.add.zone(width / 2, yCoord + 26, 640, 52).setInteractive({ useHandCursor: true });
      this.dialogueOverlay?.add(hoverZone);

      hoverZone.on('pointerover', () => {
        borderHigh.setVisible(true);
        cTxt.setColor('#7c9a8f');
      });

      hoverZone.on('pointerout', () => {
        borderHigh.setVisible(false);
        cTxt.setColor('#2f3e46');
      });

      hoverZone.on('pointerdown', () => {
        this.selectQuestOption(choice, idx);
      });
    });
  }

  private handleNumberSelect(index: number) {
    if (!this.isDialogueActive || !this.activeQuest || this.activeChoiceIndex !== -1) return;
    const choice = this.activeQuest.choices[index];
    if (choice) this.selectQuestOption(choice, index);
  }

  private selectQuestOption(choice: QuestChoice, index: number) {
    this.activeChoiceIndex = index;
    const activeCharId = this.registry.get('selectedCharacter');
    
    // 1. Calculate adjusted scores based on active role modifiers
    const adjusted = this.adjustEffectsForRole(choice.effects, activeCharId);

    // 2. Apply to global stats in registry
    const stats: GameStats = this.registry.get('stats');
    const updatedStats = { ...stats };
    Object.entries(adjusted).forEach(([key, val]) => {
      const k = key as keyof GameStats;
      updatedStats[k] = Math.max(0, Math.min(100, updatedStats[k] + (val as number)));
    });
    this.registry.set('stats', updatedStats);

    // 3. Mark quest as completed
    const completed = { ...this.registry.get('completedQuests') };
    completed[this.activeQuest!.id] = true;
    this.registry.set('completedQuests', completed);

    // 4. Clean previous interactive screen container
    this.dialogueOverlay?.destroy();
    
    // Draw Feedback Dialog Screen (White Box)
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x2f3e46, 0.4);
    this.dialogueOverlay.add(dim);

    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.98);
    box.lineStyle(2, 0x7c9a8f, 0.7);
    box.fillRoundedRect(width / 2 - 280, height / 2 - 170, 560, 310, 10);
    box.strokeRoundedRect(width / 2 - 280, height / 2 - 170, 560, 310, 10);
    this.dialogueOverlay.add(box);

    const resultTitle = this.add.text(width / 2, height / 2 - 135, '✅ 協商方案實施回饋', {
      font: 'bold 18px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    this.dialogueOverlay.add(resultTitle);

    // NPC Feedback
    const nTitle = this.add.text(width / 2 - 240, height / 2 - 95, `倡議代表反應：`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    });
    this.dialogueOverlay.add(nTitle);

    const nTxt = this.add.text(width / 2 - 240, height / 2 - 75, `「${choice.npcFeedback}」`, {
      font: 'italic 13px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: 480 }
    });
    this.dialogueOverlay.add(nTxt);

    // Antagonist Feedback
    const aTitle = this.add.text(width / 2 - 240, height / 2 - 10, `衝突方反應：`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#d98880'
    });
    this.dialogueOverlay.add(aTitle);

    const aTxt = this.add.text(width / 2 - 240, height / 2 + 10, `「${choice.conflictFeedback}」`, {
      font: 'italic 13px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: 480 }
    });
    this.dialogueOverlay.add(aTxt);

    // Space button to exit
    const closeBox = this.add.graphics();
    closeBox.fillStyle(0xffffff, 0.95);
    closeBox.lineStyle(1.5, 0x7c9a8f, 0.8);
    closeBox.fillRoundedRect(width / 2 - 100, height / 2 + 85, 200, 35, 6);
    closeBox.strokeRoundedRect(width / 2 - 100, height / 2 + 85, 200, 35, 6);
    this.dialogueOverlay.add(closeBox);

    const closeTxt = this.add.text(width / 2, height / 2 + 102, '按【 空白鍵 】關閉對話', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.dialogueOverlay.add(closeTxt);

    closeTxt.on('pointerdown', () => this.closeDialogue());
  }

  private handleSpaceKey() {
    if (!this.isDialogueActive) return;
    
    if (this.activeQuest && this.activeChoiceIndex === -1) {
      // Waiting for choices, ignore space
      return;
    }

    this.closeDialogue();
  }

  private closeDialogue() {
    if (this.dialogueOverlay) {
      this.dialogueOverlay.destroy();
    }
    this.isDialogueActive = false;
    this.activeQuest = null;
    this.activeChoiceIndex = -1;

    // Check if all 3 quests are solved. If so, spawn Portal to Result Scene
    const completed = this.registry.get('completedQuests');
    if (completed[1] && completed[2] && completed[3]) {
      this.spawnFinalCenterPortal();
    }
  }

  private spawnFinalCenterPortal() {
    // Check if already spawned to prevent duplicate
    if (this.children.getByName('final_portal')) return;

    const width = 1400;
    const height = 700;

    // Pulse final portal in warm rose pink
    const portal = this.add.circle(width / 2, height / 2 + 10, 30, 0xf06292, 0.6);
    portal.setName('final_portal');
    portal.setStrokeStyle(2, 0xffffff, 1);
    this.physics.add.existing(portal, true);
    
    // Add pulsing visual
    this.tweens.add({
      targets: portal,
      scale: 1.3,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    this.add.text(width / 2, height / 2 - 30, '🌟 前往成果發表發表會 🌟', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ffffff',
      backgroundColor: '#7c9a8f',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    // Collide rules for portal
    this.physics.add.overlap(this.player, portal, () => {
      this.activeInteractiveObj = { type: 'npc', id: 99, ref: portal };
      this.promptTextObj.setText('▶ 按【 E 】鍵提交對策，產出最終規劃成果圖！ 🎓');
      this.promptTextObj.setPosition(this.cameras.main.width / 2, this.cameras.main.height - 110);
      this.promptTextObj.setVisible(true);
      
      // Override interact key listener
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.scene.start('ResultScene');
      }
    }, undefined, this);
  }

  // PORT TALENT MODIFIER MATH
  private adjustEffectsForRole(effects: Partial<GameStats>, charId: string): Partial<GameStats> {
    const adjusted = { ...effects };
    if (charId === 'resident') {
      if (adjusted.residentSatisfaction && adjusted.residentSatisfaction < 0) {
        adjusted.residentSatisfaction = Math.round(adjusted.residentSatisfaction / 2);
      }
    }
    if (charId === 'merchant') {
      if (adjusted.merchantSatisfaction && adjusted.merchantSatisfaction > 0) {
        adjusted.merchantSatisfaction = Math.round(adjusted.merchantSatisfaction * 1.2);
      }
      if (adjusted.activityVitality && adjusted.activityVitality > 0) {
        adjusted.activityVitality = Math.round(adjusted.activityVitality * 1.2);
      }
    }
    if (charId === 'ecology') {
      if (adjusted.ecologicalScore && adjusted.ecologicalScore > 0) {
        adjusted.ecologicalScore = Math.round(adjusted.ecologicalScore * 1.3);
      }
    }
    if (charId === 'youth') {
      if (adjusted.activityVitality && adjusted.activityVitality > 0) {
        adjusted.activityVitality = Math.round(adjusted.activityVitality * 1.3);
      }
    }
    if (charId === 'designer') {
      if (adjusted.conflictValue && adjusted.conflictValue > 0) {
        adjusted.conflictValue = Math.round(adjusted.conflictValue * 0.7);
      }
    }
    return adjusted;
  }

  // HUD DRAWING & UPDATING
  private drawHUD() {
    const width = this.cameras.main.width;
    
    // HUD Panel Box (White Card Panel)
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0xffffff, 0.95);
    hudBox.lineStyle(1.5, 0x7c9a8f, 0.25);
    hudBox.fillRoundedRect(15, 15, width - 30, 48, 6);
    hudBox.strokeRoundedRect(15, 15, width - 30, 48, 6);
    hudBox.setScrollFactor(0);
    hudBox.setDepth(10);

    // HUD Text Labels (Slate colors)
    const statLabels = [
      { key: 'residentSatisfaction', label: '居民', x: 30, color: '#547c64' },
      { key: 'merchantSatisfaction', label: '商家', x: 140, color: '#b88c42' },
      { key: 'commuteEfficiency', label: '通勤', x: 250, color: '#4c6c96' },
      { key: 'ecologicalScore', label: '生態', x: 360, color: '#3d8c6d' },
      { key: 'safetySense', label: '安全', x: 470, color: '#545899' },
      { key: 'activityVitality', label: '活動', x: 580, color: '#885899' },
    ];

    statLabels.forEach(item => {
      // Label text
      const t = this.add.text(item.x, 22, `${item.label}: 50`, {
        font: 'bold 11px "Noto Sans TC", sans-serif',
        color: item.color
      }).setScrollFactor(0).setDepth(11);
      
      this.hudTexts[item.key] = t;

      // Small beige bar outline
      const barBg = this.add.graphics();
      barBg.fillStyle(0xe6e4dc, 1);
      barBg.fillRect(item.x, 39, 80, 5);
      barBg.setScrollFactor(0).setDepth(11);

      // Colored stats progress bar
      const bar = this.add.graphics();
      bar.setScrollFactor(0).setDepth(12);
      this.hudBars[item.key] = bar;
    });

    // Conflict value indicator (Far right - pastel red)
    const conText = this.add.text(width - 290, 22, '衝突值: 20', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#c95e53'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['conflictValue'] = conText;

    const conBarBg = this.add.graphics();
    conBarBg.fillStyle(0xe6e4dc, 1);
    conBarBg.fillRect(width - 290, 39, 90, 5);
    conBarBg.setScrollFactor(0).setDepth(11);

    const conBar = this.add.graphics();
    conBar.setScrollFactor(0).setDepth(12);
    this.hudBars['conflictValue'] = conBar;

    // Progress Level Indicator
    const progText = this.add.text(width - 170, 22, '任務進度: 0/3', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['progress'] = progText;

    const charText = this.add.text(width - 170, 38, `角色: ${this.registry.get('selectedCharName')}`, {
      font: '9px "Noto Sans TC", sans-serif',
      color: '#5c6b63'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['characterName'] = charText;
  }

  private updateHUD() {
    const stats: GameStats = this.registry.get('stats');
    const completed = this.registry.get('completedQuests');
    
    // Calculate total completed quests count
    let totalCompleted = 0;
    if (completed[1]) totalCompleted++;
    if (completed[2]) totalCompleted++;
    if (completed[3]) totalCompleted++;

    this.hudTexts['progress'].setText(`任務進度: ${totalCompleted}/3`);

    // Update Stats text and drawing bars (Organic Pastel colors)
    const statConfig = [
      { key: 'residentSatisfaction', color: 0x8caf97, label: '居民', width: 80 },
      { key: 'merchantSatisfaction', color: 0xe6c280, label: '商家', width: 80 },
      { key: 'commuteEfficiency', color: 0x8fa8c6, label: '通勤', width: 80 },
      { key: 'ecologicalScore', color: 0x7cb79e, label: '生態', width: 80 },
      { key: 'safetySense', color: 0x9a9ec9, label: '安全', width: 80 },
      { key: 'activityVitality', color: 0xbf9ac9, label: '活動', width: 80 },
      { key: 'conflictValue', color: 0xd98880, label: '衝突值', width: 90 }
    ];

    statConfig.forEach(item => {
      const val = stats[item.key as keyof GameStats];
      this.hudTexts[item.key].setText(`${item.label}: ${val}`);

      // Re-draw color block
      const bar = this.hudBars[item.key];
      bar.clear();
      bar.fillStyle(item.color, 1);
      
      const fillWidth = Math.max(0, Math.min(item.width, (val / 100) * item.width));
      // Position calculation matching static layout
      const xCoord = item.key === 'conflictValue' 
        ? this.cameras.main.width - 290 
        : [
            'residentSatisfaction', 'merchantSatisfaction', 'commuteEfficiency', 
            'ecologicalScore', 'safetySense', 'activityVitality'
          ].indexOf(item.key) * 110 + 30;

      bar.fillRect(xCoord, 39, fillWidth, 5);
    });
  }
}
