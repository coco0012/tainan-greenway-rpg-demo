import Phaser from 'phaser';
import { QUESTS } from '../data/quests';
import type { QuestData, QuestChoice } from '../data/quests';
import type { GameStats } from '../data/stats';

export class MapScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private playerShadow!: Phaser.GameObjects.Sprite;
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

  // Map markers mapping for swapping signposts to flags
  private questMarkers: Map<number, Phaser.GameObjects.Sprite> = new Map();

  // Floating interaction prompt & range ring
  private floatingPrompt!: Phaser.GameObjects.Container;
  private rangeRing!: Phaser.GameObjects.Graphics;
  private activeInteractiveObj: { type: 'quest' | 'npc' | 'portal'; id: number; ref: Phaser.GameObjects.GameObject } | null = null;

  // Dialogue & Quest flows
  private isDialogueActive = false;
  private isClashActive = false;
  private isCinematicActive = false;
  
  private dialogueOverlay?: Phaser.GameObjects.Container;
  private activeQuest: QuestData | null = null;
  private dialogueStep = 0; // 0: Enemy, 1: Advocate, 2: Choices
  private activeChoiceIndex = -1;
  private hudPanel!: Phaser.GameObjects.Graphics;

  // HUD UI elements (fixed on screen, dark mode slate green theme)
  private hudTexts: { [key: string]: Phaser.GameObjects.Text } = {};
  private hudBars: { [key: string]: Phaser.GameObjects.Graphics } = {};

  constructor() {
    super('MapScene');
  }

  create() {
    this.isDialogueActive = false;
    this.isClashActive = false;
    this.isCinematicActive = false;
    this.activeInteractiveObj = null;
    this.activeQuest = null;
    this.dialogueStep = 0;
    this.questMarkers.clear();

    const mapWidth = 1400;
    const mapHeight = 700;

    // Set Arcade physics bounds
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // 1. DRAW 2.5D GRID & SLANTED GREENWAY PATH
    // Tiled grass background
    this.add.tileSprite(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 'ground_2_5d');

    // Greenway Spine Path running diagonally through center (2.5D slanted angle)
    // Runs from (0, 480) to (1400, 240) representing a slanted lane
    const greenwaySpine = this.add.polygon(0, 0, [
      0, 480,
      mapWidth, 240,
      mapWidth, 340,
      0, 580
    ], 0xc2d6c4).setOrigin(0);
    greenwaySpine.setStrokeStyle(2.5, 0x7c9a8f, 0.4);

    // Sidewalk white borders
    const borderTop = this.add.graphics();
    borderTop.lineStyle(3, 0xa3c1ad, 0.6);
    borderTop.beginPath();
    borderTop.moveTo(0, 480);
    borderTop.lineTo(mapWidth, 240);
    borderTop.strokePath();

    const borderBottom = this.add.graphics();
    borderBottom.lineStyle(3, 0xa3c1ad, 0.6);
    borderBottom.beginPath();
    borderBottom.moveTo(0, 580);
    borderBottom.lineTo(mapWidth, 340);
    borderBottom.strokePath();

    // 2.5D Plazas (slanted coordinates along the lane)
    // Plaza 1 center (300, 480)
    this.add.circle(300, 480, 65, 0xe6e4dc, 0.85).setStrokeStyle(2, 0x7c9a8f, 0.4);
    // Plaza 2 center (700, 410)
    this.add.circle(700, 410, 80, 0xe6e4dc, 0.85).setStrokeStyle(2, 0x7c9a8f, 0.4);
    // Plaza 3 center (1100, 340)
    this.add.circle(1100, 340, 70, 0xe6e4dc, 0.85).setStrokeStyle(2, 0x7c9a8f, 0.4);

    // Helpers for shadows
    const addShadow = (x: number, y: number, scaleX = 0.8, scaleY = 0.4) => {
      return this.add.sprite(x, y + 20, 'shadow').setScale(scaleX, scaleY).setAlpha(0.4);
    };

    // Environment Obstacles Group (houses/stores/trees)
    const obstacles = this.physics.add.staticGroup();

    // Houses coords (residential area, upper side of the map)
    const houseCoords = [
      { x: 120, y: 260 }, { x: 280, y: 240 },
      { x: 820, y: 200 }, { x: 960, y: 180 }
    ];
    houseCoords.forEach(c => {
      addShadow(c.x, c.y, 0.9, 0.45).setDepth(c.y - 0.1);
      const h = this.add.sprite(c.x, c.y, 'house');
      h.setDepth(c.y);
      obstacles.add(h);
      const body = h.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(38, 38).setOffset(0, 8);
    });

    // Shops coords (commercial area, lower side of the map)
    const shopCoords = [
      { x: 450, y: 560 }, { x: 590, y: 540 },
      { x: 780, y: 500 }, { x: 1250, y: 420 }
    ];
    shopCoords.forEach(c => {
      addShadow(c.x, c.y, 1.0, 0.5).setDepth(c.y - 0.1);
      const s = this.add.sprite(c.x, c.y, 'shop');
      s.setDepth(c.y);
      obstacles.add(s);
      const body = s.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(42, 42).setOffset(0, 6);
    });

    // Clean vector trees helper (overlapping multi-tone green circles)
    const createVectorTree = (x: number, y: number) => {
      addShadow(x, y + 15, 0.7, 0.35).setDepth(y - 0.1);
      
      const treeGrp = this.add.graphics();
      treeGrp.setDepth(y);
      
      // Trunk
      treeGrp.fillStyle(0xa06a42, 1);
      treeGrp.fillRect(x - 4, y + 10, 8, 18);
      // Foliage layers
      treeGrp.fillStyle(0x8caf97, 1);
      treeGrp.fillCircle(x, y - 10, 20);
      treeGrp.fillStyle(0xa3c1ad, 1);
      treeGrp.fillCircle(x - 12, y + 2, 16);
      treeGrp.fillStyle(0x7c9a8f, 1);
      treeGrp.fillCircle(x + 12, y + 2, 16);

      // Outlines
      treeGrp.lineStyle(1.5, 0x5c6b63, 0.4);
      treeGrp.strokeCircle(x, y - 10, 20);
      treeGrp.strokeCircle(x - 12, y + 2, 16);
      treeGrp.strokeCircle(x + 12, y + 2, 16);

      obstacles.add(treeGrp);
      const body = treeGrp.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(36, 36).setOffset(-18, -10);
    };

    const treeCoords = [
      { x: 60, y: 340 }, { x: 480, y: 280 }, { x: 640, y: 230 },
      { x: 920, y: 520 }, { x: 1050, y: 220 }, { x: 1350, y: 340 }
    ];
    treeCoords.forEach(c => {
      createVectorTree(c.x, c.y);
    });

    // Concrete walls
    const wallCoords = [
      { x: 380, y: 310, w: 120, h: 10 },
      { x: 740, y: 510, w: 160, h: 10 },
      { x: 1010, y: 260, w: 100, h: 10 }
    ];
    wallCoords.forEach(w => {
      addShadow(w.x, w.y, w.w / 32, 0.25).setDepth(w.y - 0.1);
      const wall = this.add.graphics();
      wall.fillStyle(0xffffff, 1);
      wall.lineStyle(1.5, 0x7c9a8f, 0.4);
      wall.fillRoundedRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h, 4);
      wall.strokeRoundedRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h, 4);
      wall.setDepth(w.y);
      obstacles.add(wall);
      const body = wall.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(w.w, w.h).setOffset(-w.w / 2, -w.h / 2);
    });

    // 2. PLAYER CHARACTER
    // Shadow under player
    this.playerShadow = addShadow(100, mapHeight / 2 + 10, 0.7, 0.35).setDepth(1);
    
    // Player Sprite
    this.player = this.physics.add.sprite(100, mapHeight / 2 + 10, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24);
    this.player.setDepth(this.player.y);

    // Collisions
    this.physics.add.collider(this.player, obstacles);

    // 3. KEYBOARD CONFIG
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Listeners
    this.input.keyboard?.on('keydown-ONE', () => this.handleChoiceSelect(0));
    this.input.keyboard?.on('keydown-TWO', () => this.handleChoiceSelect(1));
    this.input.keyboard?.on('keydown-THREE', () => this.handleChoiceSelect(2));
    this.input.keyboard?.on('keydown-SPACE', () => this.handleSpaceKey());

    // 4. INTERACTIVES: NPC & QUEST NODES
    this.questZones = this.physics.add.staticGroup();
    this.npcEntities = this.physics.add.staticGroup();

    // Quest Zones along the slanted Spine
    const questDataList = [
      { id: 1, x: 300, y: 480, name: 'Level 1｜通勤動線衝突' },
      { id: 2, x: 700, y: 410, name: 'Level 2｜商住噪音衝突' },
      { id: 3, x: 1100, y: 340, name: 'Level 3｜夜間照明與安全' }
    ];

    questDataList.forEach(q => {
      // Shadow
      addShadow(q.x, q.y - 12, 0.5, 0.25).setDepth(q.y - 12.1);
      
      const qMarker = this.add.sprite(q.x, q.y - 12, 'quest_marker');
      qMarker.setData('type', 'quest');
      qMarker.setData('id', q.id);
      qMarker.setDepth(q.y - 12);
      this.questZones.add(qMarker);
      this.questMarkers.set(q.id, qMarker);

      // Label
      this.add.text(q.x, q.y + 20, q.name, { font: 'bold 9px "Noto Sans TC", sans-serif', color: '#5c6b63' }).setOrigin(0.5);
    });

    // Check completed quests from registry and update signs to flags
    const completed = this.registry.get('completedQuests') || { 1: false, 2: false, 3: false };
    Object.entries(completed).forEach(([key, done]) => {
      const qId = parseInt(key);
      if (done) {
        const marker = this.questMarkers.get(qId);
        if (marker) marker.setTexture('flag_marker');
      }
    });

    // 6 NPCs representing stakeholders along the lane
    const npcCoordsList = [
      { id: 10, x: 180, y: 420, label: '居民代表' },
      { id: 11, x: 500, y: 500, label: '商家代表' },
      { id: 12, x: 340, y: 430, label: '通勤者' },
      { id: 13, x: 860, y: 300, label: '生態倡議者' },
      { id: 14, x: 660, y: 470, label: '青年活動策展者' },
      { id: 15, x: 1060, y: 390, label: '城市設計師' } // Using city designer placeholder in the map
    ];

    const npcTextureMap: { [key: number]: string } = {
      10: 'npc_resident',
      11: 'npc_merchant',
      12: 'npc_commuter',
      13: 'npc_ecology',
      14: 'npc_youth',
      15: 'player'
    };

    npcCoordsList.forEach(n => {
      // Shadow
      addShadow(n.x, n.y, 0.6, 0.3).setDepth(n.y - 0.1);
      
      const tex = npcTextureMap[n.id] || 'player';
      const npcSprite = this.add.sprite(n.x, n.y, tex);
      npcSprite.setData('type', 'npc');
      npcSprite.setData('id', n.id);
      npcSprite.setData('label', n.label);
      npcSprite.setDepth(n.y);
      this.npcEntities.add(npcSprite);

      // Label below NPC
      this.add.text(n.x, n.y + 28, n.label, { font: 'bold 9px "Noto Sans TC", sans-serif', color: '#5c6b63' }).setOrigin(0.5);
    });

    // 5. INTERACTION RANGE Dashed Ring (under active object)
    this.rangeRing = this.add.graphics().setDepth(1);

    // 6. FLOATING Bouncing "按 E" Prompt
    this.floatingPrompt = this.add.container(0, 0).setDepth(30).setVisible(false);
    const fBg = this.add.graphics();
    fBg.fillStyle(0x7c9a8f, 1);
    fBg.lineStyle(1.5, 0xffffff, 1);
    fBg.fillRoundedRect(-25, -12, 50, 24, 6);
    fBg.strokeRoundedRect(-25, -12, 50, 24, 6);
    // Draw small down arrow
    fBg.fillStyle(0x7c9a8f, 1);
    fBg.fillTriangle(-6, 12, 6, 12, 0, 18);
    fBg.lineStyle(1.5, 0xffffff, 1);
    fBg.lineBetween(-6, 12, 0, 18);
    fBg.lineBetween(6, 12, 0, 18);
    
    const fTxt = this.add.text(0, 0, '按 E', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.floatingPrompt.add([fBg, fTxt]);

    // Bouncing animation for floating prompt
    this.tweens.add({
      targets: this.floatingPrompt,
      y: '-=6',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 7. CAMERA SETUP
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 8. RENDER FIXED HUD STATS
    this.drawHUD();

    // Collide/Overlap rules
    this.physics.add.overlap(this.player, this.questZones, this.handleTriggerInteractive as any, undefined, this);
    this.physics.add.overlap(this.player, this.npcEntities, this.handleTriggerInteractive as any, undefined, this);

    // Check if portal is already completed and spawn portal on boot if so
    if (completed[1] && completed[2] && completed[3]) {
      this.spawnFinalCenterPortal();
    }
  }

  update() {
    this.updateHUD();

    // Check if active object has gone out of range
    if (this.activeInteractiveObj) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        (this.activeInteractiveObj.ref as any).x, (this.activeInteractiveObj.ref as any).y
      );
      if (dist > 50) {
        this.floatingPrompt.setVisible(false);
        this.rangeRing.clear();
        this.activeInteractiveObj = null;
      }
    }

    if (this.isDialogueActive || this.isClashActive || this.isCinematicActive) {
      this.player.setVelocity(0, 0);
      // Reset player anim
      this.player.scaleY = 1;
      this.player.scaleX = 1;
      this.player.angle = 0;
      return;
    }

    // 2. PLAYER MOVEMENT & WALK WADDLE ANIMATION
    const speed = 180;
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

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Dynamic depth sorting
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y + 22);
    this.playerShadow.setDepth(this.player.y - 0.01);

    // Procedural walk animation
    if (vx !== 0 || vy !== 0) {
      this.player.scaleY = 1 + Math.sin(this.time.now * 0.018) * 0.08;
      this.player.scaleX = 1 - Math.sin(this.time.now * 0.018) * 0.04;
      this.player.angle = Math.sin(this.time.now * 0.015) * 5;
    } else {
      this.player.scaleY = 1;
      this.player.scaleX = 1;
      this.player.angle = 0;
    }

    // Interaction key check
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.triggerInteraction();
    }
  }

  // INTERACTIVE TRIGGERS
  private handleTriggerInteractive(_player: any, obj: Phaser.GameObjects.GameObject) {
    if (this.isDialogueActive || this.isClashActive || this.isCinematicActive) return;
    
    const type = obj.getData('type');
    const id = obj.getData('id');
    
    this.activeInteractiveObj = { type, id, ref: obj };

    // Position floating E prompt above target
    const targetSprite = obj as Phaser.GameObjects.Sprite;
    this.floatingPrompt.setPosition(targetSprite.x, targetSprite.y - 42);
    this.floatingPrompt.setVisible(true);

    // Draw selection ring
    this.rangeRing.clear();
    this.rangeRing.lineStyle(1.5, 0x7c9a8f, 0.8);
    this.rangeRing.strokeCircle(targetSprite.x, targetSprite.y + 15, 32);
  }

  private triggerInteraction() {
    if (!this.activeInteractiveObj) return;

    // Hide prompt & ring
    this.floatingPrompt.setVisible(false);
    this.rangeRing.clear();

    if (this.activeInteractiveObj.type === 'portal') {
      this.scene.start('ResultScene');
      return;
    }

    if (this.activeInteractiveObj.type === 'quest') {
      const qId = this.activeInteractiveObj.id;
      const completed = this.registry.get('completedQuests')[qId];
      if (completed) {
        this.openNPCBriefDialog('探索隊長', 'player', '本區段公共空間對策已實施完畢。\n綠園道正以最佳狀態穩定運作中！ 🌟');
      } else {
        const quest = QUESTS.find(q => q.id === qId)!;
        this.startLevelCinematic(quest);
      }
    } else {
      // NPC dialogues
      const npcId = this.activeInteractiveObj.id;
      const dialogsMap: { [key: number]: { name: string; avatar: string; text: string } } = {
        10: { name: '居民代表 李大媽', avatar: 'npc_resident', text: '「綠園道是我們每天散步談天的地方。請保護好夜間的安寧，別讓喧鬧吉他或爆量市集毀了我們社區清靜！」' },
        11: { name: '商家代表 陳老闆', avatar: 'npc_merchant', text: '「有商機人潮，店面才有出路！我們希望能爭取更多夜間裝飾亮化與假日市集推廣，促進繁榮！」' },
        12: { name: '通勤者代表 阿強', avatar: 'npc_commuter', text: '「我們只希望自行車通勤動線安全清楚，別被大廣場或亂切的步道擋住，順利安全通過是最高守則！」' },
        13: { name: '生態倡議者 林教授', avatar: 'npc_ecology', text: '「自然是台南的靈魂。請守護原生喬木林帶，夜間降低路燈眩光，給鳥兒和昆蟲們一個安靜的生活棲地！」' },
        14: { name: '青年活動策展者 莉莉', avatar: 'npc_youth', text: '「我們希望有不插電吉他舞台和滑板滑行空間，讓這座古都有更多朝氣與年輕創意的舞台！」' },
        15: { name: '協商大師 (你)', avatar: 'player', text: '「加油！穿梭在綠園道，只要靠近木頭告示牌，就可以開始解決各區段的設計衝突任務。」' }
      };

      const d = dialogsMap[npcId] || { name: '居民', avatar: 'player', text: '「你好，協商官！」' };
      this.openNPCBriefDialog(d.name, d.avatar, d.text);
    }
  }

  // CINEMATIC LEVEL START FLOW
  private startLevelCinematic(quest: QuestData) {
    this.isCinematicActive = true;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Zoom and Dim overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0).setScrollFactor(0).setDepth(40);
    const lvlText = this.add.text(width / 2, height / 2 - 40, `LEVEL ${quest.id}`, {
      font: 'bold 36px "Inter", sans-serif',
      color: '#e6c280'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setScale(0);

    const titleText = this.add.text(width / 2, height / 2 + 20, quest.title.split('：')[1], {
      font: 'bold 20px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setAlpha(0);

    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 400
    });

    this.tweens.add({
      targets: lvlText,
      scale: 1.1,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: titleText,
          alpha: 1,
          y: height / 2 + 10,
          duration: 400
        });
      }
    });

    // Wait and transition to Clash Warning
    this.time.delayedCall(1600, () => {
      this.tweens.add({
        targets: [lvlText, titleText],
        alpha: 0,
        scale: 0.8,
        duration: 300,
        onComplete: () => {
          lvlText.destroy();
          titleText.destroy();
          this.triggerConflictWarning(quest, overlay);
        }
      });
    });
  }

  // RED FLASH CONFLICT WARNING
  private triggerConflictWarning(quest: QuestData, overlay: Phaser.GameObjects.Rectangle) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Siren-like flash
    this.cameras.main.flash(600, 180, 50, 50);

    const warningBanner = this.add.container(0, 0).setScrollFactor(0).setDepth(41);
    
    // Red diagonal stripes warning bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0xc95e53, 1);
    barBg.fillRect(0, height / 2 - 50, width, 100);
    
    // Border stripes
    barBg.fillStyle(0xfdd835, 1);
    for (let i = 0; i < width; i += 40) {
      barBg.fillTriangle(i, height / 2 - 50, i + 20, height / 2 - 50, i, height / 2 - 42);
      barBg.fillTriangle(i, height / 2 + 50, i + 20, height / 2 + 50, i, height / 2 + 42);
    }
    
    const warnTxt = this.add.text(width / 2, height / 2, '⚠ 衝突事件發生！ ⚠', {
      font: 'bold 26px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    warningBanner.add([barBg, warnTxt]);
    warningBanner.setScale(0, 1);

    // Zoom warning banner in
    this.tweens.add({
      targets: warningBanner,
      scaleX: 1,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Pulse warning banner scale
        this.tweens.add({
          targets: warnTxt,
          scale: 1.15,
          duration: 300,
          yoyo: true,
          repeat: 3
        });
      }
    });

    this.time.delayedCall(1600, () => {
      this.tweens.add({
        targets: warningBanner,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          warningBanner.destroy();
          overlay.destroy();
          this.isCinematicActive = false;
          // Trigger the VS card clash screen
          this.playClashAnimation(quest, () => {
            this.openQuestDialogue(quest);
          });
        }
      });
    });
  }

  // RPG DIALOGUE SYSTEM (NPC & Antagonist speech bubbles)
  private playClashAnimation(quest: QuestData, onComplete: () => void) {
    this.isClashActive = true;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const clashContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(35);

    // Dim bg
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0.7);
    clashContainer.add(dim);

    // VS center label
    const vsCircle = this.add.circle(width / 2, height / 2 - 60, 45, 0xc95e53, 0.95).setStrokeStyle(2.5, 0xffffff, 1);
    const vsText = this.add.text(width / 2, height / 2 - 60, 'VS', {
      font: 'bold 28px "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    clashContainer.add([vsCircle, vsText]);

    // Bouncing VS
    this.tweens.add({
      targets: vsCircle,
      scale: 1.15,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Proponent Card (Left)
    const pCard = this.add.container(-220, height / 2 - 60);
    const pBg = this.add.graphics();
    pBg.fillStyle(0xffffff, 0.95);
    pBg.lineStyle(2, 0x7c9a8f, 0.8);
    pBg.fillRoundedRect(-140, -100, 260, 200, 10);
    pBg.strokeRoundedRect(-140, -100, 260, 200, 10);
    
    const pTex = this.getTextureKeyFromAvatar(quest.npcAvatar);
    const pAvatar = this.add.sprite(0, -38, pTex).setScale(1.5);
    const pTitle = this.add.text(0, 15, quest.npcName, {
      font: 'bold 14px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    const pDesc = this.add.text(0, 50, quest.npcQuote, {
      font: 'italic 11px "Noto Sans TC", sans-serif',
      color: '#5c6b63',
      wordWrap: { width: 220, useAdvancedWrap: true },
      align: 'center'
    }).setOrigin(0.5);
    pCard.add([pBg, pAvatar, pTitle, pDesc]);
    clashContainer.add(pCard);

    // Opponent Card (Right)
    const oCard = this.add.container(width + 220, height / 2 - 60);
    const oBg = this.add.graphics();
    oBg.fillStyle(0xffffff, 0.95);
    oBg.lineStyle(2, 0xc95e53, 0.8);
    oBg.fillRoundedRect(-120, -100, 260, 200, 10);
    oBg.strokeRoundedRect(-120, -100, 260, 200, 10);

    const oTex = this.getTextureKeyFromAvatar(quest.conflictAvatar);
    const oAvatar = this.add.sprite(0, -38, oTex).setScale(1.5);
    const oTitle = this.add.text(0, 15, `${quest.conflictName} (${quest.conflictType})`, {
      font: 'bold 14px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);
    const oDesc = this.add.text(0, 50, quest.conflictQuote, {
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
      x: width / 2 - 165,
      duration: 600,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: oCard,
      x: width / 2 + 165,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Shake & collision tween
        this.tweens.add({
          targets: pCard,
          x: width / 2 - 135,
          duration: 120,
          yoyo: true,
          repeat: 4,
          ease: 'Sine.easeInOut'
        });

        this.tweens.add({
          targets: oCard,
          x: width / 2 + 135,
          duration: 120,
          yoyo: true,
          repeat: 4,
          ease: 'Sine.easeInOut'
        });

        // Anger particles
        const particleTimer = this.time.addEvent({
          delay: 150,
          callback: () => {
            const rx = width / 2 + Phaser.Math.Between(-80, 80);
            const ry = height / 2 - 60 + Phaser.Math.Between(-80, 80);
            const part = this.add.sprite(rx, ry, 'anger_particle').setScrollFactor(0).setDepth(36);
            clashContainer.add(part);

            this.tweens.add({
              targets: part,
              y: ry - 40,
              scale: 2.2,
              alpha: 0,
              duration: 500,
              onComplete: () => part.destroy()
            });
          },
          repeat: 8
        });

        this.cameras.main.shake(800, 0.003);

        // Continue Button
        const startBtnBox = this.add.graphics();
        startBtnBox.fillStyle(0x7c9a8f, 1);
        startBtnBox.lineStyle(1.5, 0xffffff, 1);
        startBtnBox.fillRoundedRect(width / 2 - 90, height - 120, 180, 40, 8);
        startBtnBox.strokeRoundedRect(width / 2 - 90, height - 120, 180, 40, 8);
        clashContainer.add(startBtnBox);

        const startBtnText = this.add.text(width / 2, height - 100, '展開設計協商 🤝', {
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

  // OVERVIEW OF QUEST DIALOGUE FLOW
  private openQuestDialogue(quest: QuestData) {
    this.isDialogueActive = true;
    this.activeQuest = quest;
    this.dialogueStep = 0;
    this.activeChoiceIndex = -1;
    this.player.setVelocity(0, 0);

    this.renderRpgDialogueStep();
  }

  private renderRpgDialogueStep() {
    // Clear old dialogue
    if (this.dialogueOverlay) this.dialogueOverlay.destroy();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    // Dim Background
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0.5);
    this.dialogueOverlay.add(dim);

    if (this.dialogueStep === 0) {
      // Step 0: Conflict Antagonist Speaks
      this.drawSpeechBubble(
        this.activeQuest!.conflictName,
        `(${this.activeQuest!.conflictType})`,
        this.activeQuest!.conflictQuote,
        this.getTextureKeyFromAvatar(this.activeQuest!.conflictAvatar),
        true // Red border for antagonist
      );
    } else if (this.dialogueStep === 1) {
      // Step 1: Proponent NPC Speaks
      this.drawSpeechBubble(
        this.activeQuest!.npcName,
        '（提案倡議者）',
        this.activeQuest!.npcQuote,
        this.getTextureKeyFromAvatar(this.activeQuest!.npcAvatar),
        false // Green border for advocate
      );
    } else {
      // Step 2: Show 3 Options Cards
      this.drawOptionsSelection();
    }
  }

  // Draw Bottom styled RPG Dialogue Bubble
  private drawSpeechBubble(name: string, role: string, text: string, avatarTexture: string, isEnemy: boolean) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Bottom Box layout
    const boxY = height - 160;
    const boxH = 130;
    const boxW = width - 80;

    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.98);
    box.lineStyle(2, isEnemy ? 0xc95e53 : 0x7c9a8f, 0.95);
    box.fillRoundedRect(40, boxY, boxW, boxH, 10);
    box.strokeRoundedRect(40, boxY, boxW, boxH, 10);
    this.dialogueOverlay!.add(box);

    // Speaker portrait
    const pSprite = this.add.sprite(95, boxY + boxH / 2, avatarTexture).setScale(1.5);
    this.dialogueOverlay!.add(pSprite);

    // Speaker name
    const nTxt = this.add.text(170, boxY + 18, `${name} ${role}`, {
      font: 'bold 14px "Noto Sans TC", sans-serif',
      color: isEnemy ? '#c95e53' : '#2c3e35'
    });
    this.dialogueOverlay!.add(nTxt);

    // Dialogue text
    const tTxt = this.add.text(170, boxY + 45, '', {
      font: '13px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: boxW - 170 },
      lineSpacing: 5
    });
    this.dialogueOverlay!.add(tTxt);

    // Hint text at bottom right of dialog box
    const hTxt = this.add.text(width - 60, boxY + boxH - 22, '▶ 點擊或按空白鍵繼續對話', {
      font: '10px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    }).setOrigin(1, 0.5);
    this.dialogueOverlay!.add(hTxt);

    // Bouncing indicator
    this.tweens.add({
      targets: hTxt,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Typewriter effect
    let charIndex = 0;
    const timer = this.time.addEvent({
      delay: 20,
      callback: () => {
        tTxt.setText(text.substring(0, charIndex + 1));
        charIndex++;
      },
      repeat: text.length - 1
    });

    // Click to advance
    const clickZone = this.add.rectangle(width / 2, height / 2, width, height).setInteractive();
    this.dialogueOverlay!.add(clickZone);
    clickZone.on('pointerdown', () => {
      if (timer.getProgress() < 1) {
        timer.destroy();
        tTxt.setText(text);
      } else {
        this.dialogueStep++;
        this.renderRpgDialogueStep();
      }
    });
  }

  // Draw Option Cards (designed like command boxes)
  private drawOptionsSelection() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const quest = this.activeQuest!;

    // Dialogue Box at bottom showing instructions
    const instructionBox = this.add.graphics();
    instructionBox.fillStyle(0xffffff, 0.96);
    instructionBox.lineStyle(1.5, 0x7c9a8f, 0.8);
    instructionBox.fillRoundedRect(40, 50, width - 80, 52, 6);
    instructionBox.strokeRoundedRect(40, 50, width - 80, 52, 6);
    this.dialogueOverlay!.add(instructionBox);

    const instTxt = this.add.text(60, 68, `🛠️ 協商任務對策中！請下達您的都市設計方案指令：`, {
      font: 'bold 14px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    });
    this.dialogueOverlay!.add(instTxt);

    // 3 Options layout (stacked vertically in the center area)
    const cardW = width - 180;
    const cardH = 65;
    const startY = 125;

    quest.choices.forEach((choice, idx) => {
      const yCoord = startY + idx * 75;

      const card = this.add.graphics();
      card.fillStyle(0xffffff, 0.98);
      card.lineStyle(1.5, 0xe6e4dc, 0.8);
      card.fillRoundedRect(90, yCoord, cardW, cardH, 8);
      card.strokeRoundedRect(90, yCoord, cardW, cardH, 8);
      this.dialogueOverlay!.add(card);

      // Card hover indicator
      const glow = this.add.graphics();
      glow.lineStyle(2, 0x7c9a8f, 1);
      glow.strokeRoundedRect(90, yCoord, cardW, cardH, 8);
      glow.setVisible(false);
      this.dialogueOverlay!.add(glow);

      // Option label (Command title style)
      const prefixes = ['【設計方案 A】', '【設計方案 B】', '【設計方案 C】'];
      const cTxt = this.add.text(115, yCoord + 12, `${prefixes[idx]} ${choice.text}`, {
        font: 'bold 12px "Noto Sans TC", sans-serif',
        color: '#2f3e46',
        wordWrap: { width: cardW - 50 }
      });
      this.dialogueOverlay!.add(cTxt);

      // Estimate effects
      const activeCharId = this.registry.get('selectedCharacter');
      const adjusted = this.adjustEffectsForRole(choice.effects, activeCharId);
      const effectsStr = Object.entries(adjusted)
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
        .join('   ');
      
      const effTxt = this.add.text(115, yCoord + 40, `✦ 預估變動：${effectsStr}`, {
        font: '9px "Noto Sans TC", sans-serif',
        color: '#7c9a8f'
      });
      this.dialogueOverlay!.add(effTxt);

      // Interactive zone
      const zone = this.add.zone(width / 2, yCoord + cardH / 2, cardW, cardH).setInteractive({ useHandCursor: true });
      this.dialogueOverlay!.add(zone);

      zone.on('pointerover', () => {
        glow.setVisible(true);
        cTxt.setColor('#7c9a8f');
      });

      zone.on('pointerout', () => {
        glow.setVisible(false);
        cTxt.setColor('#2f3e46');
      });

      zone.on('pointerdown', () => {
        this.selectQuestOption(choice, idx);
      });
    });

    const keyHint = this.add.text(width / 2, height - 25, '按鍵盤數字 1、2、3 可以直接選擇方案', {
      font: '10px monospace',
      color: '#7c9a8f'
    }).setOrigin(0.5);
    this.dialogueOverlay!.add(keyHint);
  }

  private handleChoiceSelect(index: number) {
    if (!this.isDialogueActive || !this.activeQuest || this.dialogueStep !== 2 || this.activeChoiceIndex !== -1) return;
    const choice = this.activeQuest.choices[index];
    if (choice) this.selectQuestOption(choice, index);
  }

  private selectQuestOption(choice: QuestChoice, index: number) {
    this.activeChoiceIndex = index;
    const activeCharId = this.registry.get('selectedCharacter');

    // 1. Calculate adjusted scores
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

    // 4. Animate Flying Stats Numbers
    this.playFloatingStatsAnimation(adjusted);

    // 5. Clean option cards overlay
    this.dialogueOverlay?.destroy();

    // 6. Draw Feedback Dialogue Box (bottom RPG dialog style)
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0.4);
    this.dialogueOverlay.add(dim);

    const boxY = height - 170;
    const boxH = 140;
    const boxW = width - 80;

    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.98);
    box.lineStyle(2.5, 0x7c9a8f, 1);
    box.fillRoundedRect(40, boxY, boxW, boxH, 10);
    box.strokeRoundedRect(40, boxY, boxW, boxH, 10);
    this.dialogueOverlay.add(box);

    // Speaker Name (Advocate Feedback)
    const nTxt = this.add.text(60, boxY + 15, `【${this.activeQuest!.npcName} 反應】`, {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    });
    const f1Txt = this.add.text(60, boxY + 33, `「${choice.npcFeedback}」`, {
      font: 'italic 12px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: boxW - 40 }
    });
    this.dialogueOverlay.add([nTxt, f1Txt]);

    // Speaker Name (Antagonist Feedback)
    const oTxt = this.add.text(60, boxY + 72, `【${this.activeQuest!.conflictName} 反應】`, {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#c95e53'
    });
    const f2Txt = this.add.text(60, boxY + 90, `「${choice.conflictFeedback}」`, {
      font: 'italic 12px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: boxW - 40 }
    });
    this.dialogueOverlay.add([oTxt, f2Txt]);

    // Space/Click hint
    const closeTxt = this.add.text(width - 60, boxY + boxH - 16, '▶ 按空白鍵或點擊以結束任務', {
      font: '9px "Noto Sans TC", sans-serif',
      color: '#5c6b63'
    }).setOrigin(1, 0.5);
    this.dialogueOverlay.add(closeTxt);

    this.tweens.add({
      targets: closeTxt,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    dim.setInteractive().on('pointerdown', () => this.closeDialogueAndShowClearBanner());
  }

  // FLOATING STAT CHANGES ANIMATION (+8 Residents, etc.)
  private playFloatingStatsAnimation(effects: Partial<GameStats>) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    let offsetIndex = 0;
    Object.entries(effects).forEach(([key, val]) => {
      if (val === 0) return;

      let statLabel = key;
      if (key === 'residentSatisfaction') statLabel = '居民滿意度';
      if (key === 'merchantSatisfaction') statLabel = '商家滿意度';
      if (key === 'commuteEfficiency') statLabel = '通勤效率';
      if (key === 'ecologicalScore') statLabel = '生態分數';
      if (key === 'safetySense') statLabel = '安全感';
      if (key === 'activityVitality') statLabel = '活動活力';
      if (key === 'conflictValue') statLabel = '衝突值';

      const textVal = val! > 0 ? `+${val}` : `${val}`;
      const colorVal = val! > 0 ? '#547c64' : '#c95e53';

      const floatText = this.add.text(width / 2, height / 2 - 40 + offsetIndex * 20, `${statLabel} ${textVal}`, {
        font: 'bold 14px "Noto Sans TC", sans-serif',
        color: colorVal
      }).setOrigin(0.5).setScrollFactor(0).setDepth(45);

      this.tweens.add({
        targets: floatText,
        y: '-=80',
        alpha: 0,
        duration: 1800,
        ease: 'Quad.easeOut',
        onComplete: () => floatText.destroy()
      });

      offsetIndex++;
    });
  }

  // CINEMATIC LEVEL CLEAR ANIMATION & SWAP MARKER TO FLAG
  private closeDialogueAndShowClearBanner() {
    const qId = this.activeQuest!.id;
    this.closeDialogue();

    this.isCinematicActive = true;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dim overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0.4).setScrollFactor(0).setDepth(40);
    
    // Clear banner text
    const banner = this.add.text(width / 2, height / 2 - 40, 'LEVEL CLEAR!', {
      font: 'bold 44px "Inter", sans-serif',
      color: '#e6c280'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setScale(0);
    banner.setStroke('#2c3e35', 6);

    const sub = this.add.text(width / 2, height / 2 + 20, '── 協商方案實施完畢 ──', {
      font: 'bold 16px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setAlpha(0);

    // Zoom in text
    this.tweens.add({
      targets: banner,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: sub,
          alpha: 1,
          duration: 350
        });

        // Trigger particle bursts
        for (let i = 0; i < 20; i++) {
          this.time.delayedCall(Phaser.Math.Between(0, 500), () => {
            const rx = width / 2 + Phaser.Math.Between(-200, 200);
            const ry = height / 2 + Phaser.Math.Between(-80, 80);
            const particle = this.add.circle(rx, ry, Phaser.Math.Between(4, 8), 0xe6c280, 0.9).setScrollFactor(0).setDepth(42);
            
            this.tweens.add({
              targets: particle,
              y: ry - 60,
              scale: 0.1,
              alpha: 0,
              duration: 800,
              onComplete: () => particle.destroy()
            });
          });
        }
      }
    });

    // Morph signpost to flag_marker
    const marker = this.questMarkers.get(qId);
    if (marker) {
      marker.setTexture('flag_marker');
      this.tweens.add({
        targets: marker,
        scaleY: 1.3,
        scaleX: 1.3,
        yoyo: true,
        duration: 250
      });
    }

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [overlay, banner, sub],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          overlay.destroy();
          banner.destroy();
          sub.destroy();
          this.isCinematicActive = false;

          // Check if all 3 quests completed to spawn portal
          const completed = this.registry.get('completedQuests');
          if (completed[1] && completed[2] && completed[3]) {
            this.spawnFinalCenterPortal();
          }
        }
      });
    });
  }

  private handleSpaceKey() {
    if (!this.isDialogueActive) return;
    
    if (this.activeQuest && this.dialogueStep === 2 && this.activeChoiceIndex === -1) {
      // Waiting for choices selection, disable space dismiss
      return;
    }

    if (this.activeChoiceIndex !== -1) {
      this.closeDialogueAndShowClearBanner();
    } else {
      this.dialogueStep++;
      this.renderRpgDialogueStep();
    }
  }

  private closeDialogue() {
    if (this.dialogueOverlay) {
      this.dialogueOverlay.destroy();
    }
    this.isDialogueActive = false;
    this.activeQuest = null;
    this.dialogueStep = 0;
    this.activeChoiceIndex = -1;
  }

  // SPAWN RESULTS PORTAL AFTER ALL 3 COMPLETED
  private spawnFinalCenterPortal() {
    if (this.children.getByName('final_portal')) return;

    const mapWidth = 1400;
    const mapHeight = 700;

    // Portal shadow
    this.add.sprite(mapWidth / 2, mapHeight / 2 + 10, 'shadow').setScale(1.2, 0.6).setAlpha(0.5).setDepth(mapHeight / 2 + 9.9);

    // Pulse rose pink portal graphic
    const portal = this.add.circle(mapWidth / 2, mapHeight / 2 + 10, 30, 0xd98880, 0.75);
    portal.setName('final_portal');
    portal.setStrokeStyle(2.5, 0xffffff, 1);
    portal.setDepth(mapHeight / 2 + 10);
    this.physics.add.existing(portal, true);
    
    this.tweens.add({
      targets: portal,
      scale: 1.25,
      alpha: 0.9,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    this.add.text(mapWidth / 2, mapHeight / 2 - 32, '成果發表入口 🌟', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ffffff',
      backgroundColor: '#7c9a8f',
      padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(mapHeight / 2 + 11);

    // Overlap rule for portal
    this.physics.add.overlap(this.player, portal, () => {
      this.activeInteractiveObj = { type: 'portal', id: 99, ref: portal };
      
      // Floating prompt position
      this.floatingPrompt.setPosition(mapWidth / 2, mapHeight / 2 - 45);
      this.floatingPrompt.setVisible(true);

      // Dash circle
      this.rangeRing.clear();
      this.rangeRing.lineStyle(1.5, 0xd98880, 0.85);
      this.rangeRing.strokeCircle(mapWidth / 2, mapHeight / 2 + 10, 42);
    }, undefined, this);
  }

  // NPC dialogue brief popup
  private openNPCBriefDialog(name: string, avatar: string, text: string) {
    this.isDialogueActive = true;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0.4);
    this.dialogueOverlay.add(dim);

    // Rounded Box
    const boxY = height - 160;
    const boxH = 130;
    const boxW = width - 80;

    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.98);
    box.lineStyle(2, 0x7c9a8f, 0.9);
    box.fillRoundedRect(40, boxY, boxW, boxH, 10);
    box.strokeRoundedRect(40, boxY, boxW, boxH, 10);
    this.dialogueOverlay.add(box);

    const pSprite = this.add.sprite(95, boxY + boxH / 2, avatar).setScale(1.5);
    this.dialogueOverlay.add(pSprite);

    const nTxt = this.add.text(170, boxY + 18, name, {
      font: 'bold 14px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    });
    this.dialogueOverlay.add(nTxt);

    const tTxt = this.add.text(170, boxY + 45, text, {
      font: '13px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: boxW - 170 },
      lineSpacing: 5
    });
    this.dialogueOverlay.add(tTxt);

    const hint = this.add.text(width - 60, boxY + boxH - 22, '▶ 點擊以關閉對話', {
      font: '10px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    }).setOrigin(1, 0.5);
    this.dialogueOverlay.add(hint);

    this.tweens.add({
      targets: hint,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    dim.setInteractive().on('pointerdown', () => this.closeDialogue());
  }

  // Parse avatar emoji text to dynamic texture keys
  private getTextureKeyFromAvatar(avatar: string): string {
    if (avatar.includes('🚴') || avatar.includes('commuter')) return 'npc_commuter';
    if (avatar.includes('👮') || avatar.includes('antagonist_1')) return 'npc_antagonist_1';
    if (avatar.includes('☕') || avatar.includes('merchant')) return 'npc_merchant';
    if (avatar.includes('🎸') || avatar.includes('antagonist_2')) return 'npc_antagonist_2';
    if (avatar.includes('🦉') || avatar.includes('ecology')) return 'npc_ecology';
    if (avatar.includes('🗣️') || avatar.includes('rioter') || avatar.includes('conflict')) return 'npc_rioter';
    if (avatar.includes('👵') || avatar.includes('resident')) return 'npc_resident';
    return 'player';
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

  // DRAW GAME HUD
  private drawHUD() {
    const width = this.cameras.main.width;
    
    // HUD Panel Box (Dark slate green theme)
    this.hudPanel = this.add.graphics();
    this.hudPanel.fillStyle(0x2c3e35, 0.95);
    this.hudPanel.lineStyle(2, 0xffffff, 0.9);
    this.hudPanel.fillRoundedRect(15, 15, width - 30, 48, 8);
    this.hudPanel.strokeRoundedRect(15, 15, width - 30, 48, 8);
    this.hudPanel.setScrollFactor(0);
    this.hudPanel.setDepth(10);

    const statLabels = [
      { key: 'residentSatisfaction', label: '居民', x: 30, color: '#a3c1ad' },
      { key: 'merchantSatisfaction', label: '商家', x: 135, color: '#e6c280' },
      { key: 'commuteEfficiency', label: '通勤', x: 240, color: '#9cc3e6' },
      { key: 'ecologicalScore', label: '生態', x: 345, color: '#8caf97' },
      { key: 'safetySense', label: '安全', x: 450, color: '#c3c6e6' },
      { key: 'activityVitality', label: '活動', x: 555, color: '#e2c3e6' },
    ];

    statLabels.forEach(item => {
      // Label text
      const t = this.add.text(item.x, 22, `${item.label}: 50`, {
        font: 'bold 11px "Noto Sans TC", sans-serif',
        color: '#ffffff'
      }).setScrollFactor(0).setDepth(11);
      
      this.hudTexts[item.key] = t;

      // Small grey progress bar background
      const barBg = this.add.graphics();
      barBg.fillStyle(0x5c6b63, 1);
      barBg.fillRect(item.x, 39, 80, 5);
      barBg.setScrollFactor(0).setDepth(11);

      // Stat fill bar
      const bar = this.add.graphics();
      bar.setScrollFactor(0).setDepth(12);
      this.hudBars[item.key] = bar;
    });

    // Conflict value (red style)
    const conText = this.add.text(width - 290, 22, '衝突值: 20', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ffb3b3'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['conflictValue'] = conText;

    const conBarBg = this.add.graphics();
    conBarBg.fillStyle(0x5c6b63, 1);
    conBarBg.fillRect(width - 290, 39, 90, 5);
    conBarBg.setScrollFactor(0).setDepth(11);

    const conBar = this.add.graphics();
    conBar.setScrollFactor(0).setDepth(12);
    this.hudBars['conflictValue'] = conBar;

    // Level progression
    const progText = this.add.text(width - 170, 22, '任務進度: 0/3', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#e6c280'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['progress'] = progText;

    const charText = this.add.text(width - 170, 38, `角色: ${this.registry.get('selectedCharName')}`, {
      font: '9px "Noto Sans TC", sans-serif',
      color: '#e6e4dc'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['characterName'] = charText;
  }

  private updateHUD() {
    const stats: GameStats = this.registry.get('stats');
    const completed = this.registry.get('completedQuests') || { 1: false, 2: false, 3: false };
    
    let totalCompleted = 0;
    if (completed[1]) totalCompleted++;
    if (completed[2]) totalCompleted++;
    if (completed[3]) totalCompleted++;

    this.hudTexts['progress'].setText(`任務進度: ${totalCompleted}/3`);

    const statConfig = [
      { key: 'residentSatisfaction', color: 0x8caf97, label: '居民', width: 80 },
      { key: 'merchantSatisfaction', color: 0xe6c280, label: '商家', width: 80 },
      { key: 'commuteEfficiency', color: 0x8fa8c6, label: '通勤', width: 80 },
      { key: 'ecologicalScore', color: 0x7cb79e, label: '生態', width: 80 },
      { key: 'safetySense', color: 0x9a9ec9, label: '安全', width: 80 },
      { key: 'activityVitality', color: 0xbf9ac9, label: '活動', width: 80 },
      { key: 'conflictValue', color: 0xd98880, label: '衝突', width: 90 }
    ];

    statConfig.forEach(item => {
      const val = stats[item.key as keyof GameStats];
      this.hudTexts[item.key].setText(`${item.label}: ${val}`);

      const bar = this.hudBars[item.key];
      bar.clear();
      bar.fillStyle(item.color, 1);
      
      const fillWidth = Math.max(0, Math.min(item.width, (val / 100) * item.width));
      const xCoord = item.key === 'conflictValue' 
        ? this.cameras.main.width - 290 
        : [
            'residentSatisfaction', 'merchantSatisfaction', 'commuteEfficiency', 
            'ecologicalScore', 'safetySense', 'activityVitality'
          ].indexOf(item.key) * 105 + 30;

      bar.fillRect(xCoord, 39, fillWidth, 5);
    });
  }
}
