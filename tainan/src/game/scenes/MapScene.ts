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
    this.activeInteractiveObj = null;
    this.activeQuest = null;
    this.activeChoiceIndex = -1;

    const mapWidth = 1400;
    const mapHeight = 700;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Set Arcade physics bounds
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // 1. DRAW TAINAN GREENWAY ENVIRONMENT
    // Base Green grass color
    this.add.rectangle(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 0x0c1117);

    // Grid lines for game feel
    this.add.grid(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 40, 40, 0, 0, 0x1f2833, 0.2);

    // Greenway Spine Path running horizontally through center
    const greenwaySpine = this.add.rectangle(mapWidth / 2, mapHeight / 2 + 10, mapWidth, 90, 0x1a2f24);
    greenwaySpine.setStrokeStyle(2, 0x2e8b57, 0.4);

    // Walking / Sidewalk borders
    this.add.rectangle(mapWidth / 2, mapHeight / 2 - 40, mapWidth, 4, 0x45a29e, 0.2);
    this.add.rectangle(mapWidth / 2, mapHeight / 2 + 60, mapWidth, 4, 0x45a29e, 0.2);

    // Plazas (circular nodes)
    this.add.circle(300, mapHeight / 2 + 10, 65, 0x1f3b2e, 0.7).setStrokeStyle(1, 0x66fcf1, 0.2);
    this.add.circle(700, mapHeight / 2 + 10, 80, 0x243e3c, 0.7).setStrokeStyle(1, 0x66fcf1, 0.2);
    this.add.circle(1100, mapHeight / 2 + 10, 70, 0x1f3b2e, 0.7).setStrokeStyle(1, 0x66fcf1, 0.2);

    // Environment Colliders Group (houses/stores/trees)
    const obstacles = this.physics.add.staticGroup();

    // Spawn Buildings (North side = Residential, South side = Shops)
    const houseCoords = [
      { x: 120, y: 180, em: '🏠' }, { x: 250, y: 160, em: '🏠' },
      { x: 800, y: 170, em: '🏠' }, { x: 950, y: 180, em: '🏠' }
    ];
    houseCoords.forEach(c => {
      const h = this.add.text(c.x, c.y, c.em, { font: '42px Arial' }).setOrigin(0.5);
      obstacles.add(h);
      // Adjust bounding box size for text emojis
      const body = h.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(35, 35).setOffset(-2, 2);
    });

    const shopCoords = [
      { x: 450, y: 530, em: '🏪' }, { x: 600, y: 550, em: '☕' },
      { x: 780, y: 530, em: '🛍️' }, { x: 1250, y: 540, em: '🏪' }
    ];
    shopCoords.forEach(c => {
      const s = this.add.text(c.x, c.y, c.em, { font: '42px Arial' }).setOrigin(0.5);
      obstacles.add(s);
      const body = s.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(38, 38).setOffset(-2, 2);
    });

    // Spawn Trees (Scattered around)
    const treeCoords = [
      { x: 60, y: 280 }, { x: 480, y: 200 }, { x: 640, y: 190 },
      { x: 900, y: 510 }, { x: 1050, y: 180 }, { x: 1350, y: 280 }
    ];
    treeCoords.forEach(c => {
      const t = this.add.text(c.x, c.y, '🌳', { font: '38px Arial' }).setOrigin(0.5);
      obstacles.add(t);
      const body = t.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(30, 30).setOffset(-1, 2);
    });

    // 2. PLAYER CHARACTER (Zelda style geometric hero)
    // Draw character inside dynamic body (a yellow circular node represents coordinator)
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x66fcf1, 1);
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

    // Spawn 3 Quest zones along Greenway Spine
    const questDataList = [
      { id: 1, x: 300, y: mapHeight / 2 + 10, name: '⚔️ 任務 1：通勤衝突' },
      { id: 2, x: 700, y: mapHeight / 2 + 10, name: '⚔️ 任務 2：商住噪音' },
      { id: 3, x: 1100, y: mapHeight / 2 + 10, name: '⚔️ 任務 3：生態照明' }
    ];

    questDataList.forEach(q => {
      // Draw a glowing animated sword or circle
      const qMarker = this.add.text(q.x, q.y - 12, '⚔️', { font: '26px Arial' }).setOrigin(0.5);
      qMarker.setData('type', 'quest');
      qMarker.setData('id', q.id);
      this.questZones.add(qMarker);

      // Add a label
      this.add.text(q.x, q.y + 20, q.name, { font: '9px "Noto Sans TC", sans-serif', color: '#45a29e' }).setOrigin(0.5);
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
      const npcText = this.add.text(n.x, n.y, n.em, { font: '30px Arial' }).setOrigin(0.5);
      npcText.setData('type', 'npc');
      npcText.setData('id', n.id);
      npcText.setData('label', n.label);
      this.npcEntities.add(npcText);

      // Label
      this.add.text(n.x, n.y + 22, n.label, { font: '8px "Noto Sans TC", sans-serif', color: '#888888' }).setOrigin(0.5);
    });

    // 6. PROMPT POPUP
    this.promptTextObj = this.add.text(width / 2, height / 2, '', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#66fcf1',
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(20);

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

    if (this.isDialogueActive) {
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

    // Set interactive prompt position and text
    this.promptTextObj.setText(
      type === 'quest'
        ? `▶ 按【 E 】鍵啟動公共空間協商 ⚔️`
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
        15: '🗣️ 抱怨老張：「哼！做什麼建設都是白花錢，治安變差、房價下跌都是那些大樹和沒燈造成的啦！」'
      };
      this.openNPCBriefDialog(dialogsMap[npcId] || '「你好，協官！」');
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

    // Dim Background
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);
    this.dialogueOverlay.add(dim);

    // Dialog Box Shape
    const box = this.add.graphics();
    box.fillStyle(0x0f1622, 0.95);
    box.lineStyle(2, 0x66fcf1, 0.7);
    box.fillRoundedRect(width / 2 - 300, height / 2 - 60, 600, 120, 8);
    box.strokeRoundedRect(width / 2 - 300, height / 2 - 60, 600, 120, 8);
    this.dialogueOverlay.add(box);

    // Text content
    const txt = this.add.text(width / 2 - 275, height / 2 - 35, text, {
      font: '14px "Noto Sans TC", sans-serif',
      color: '#ffffff',
      wordWrap: { width: 550, useAdvancedWrap: true },
      lineSpacing: 8
    });
    this.dialogueOverlay.add(txt);

    // Tip hint
    const hint = this.add.text(width / 2, height / 2 + 35, '按【 空白鍵 (SPACE) 】或點擊以關閉', {
      font: '10px "Noto Sans TC", sans-serif',
      color: '#45a29e'
    }).setOrigin(0.5);
    this.dialogueOverlay.add(hint);

    // Click to dismiss
    dim.setInteractive().on('pointerdown', () => this.closeDialogue());
  }

  private openQuestDialogue(quest: QuestData) {
    this.isDialogueActive = true;
    this.activeQuest = quest;
    this.activeChoiceIndex = -1;
    this.player.setVelocity(0, 0);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    // Dim bg
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    this.dialogueOverlay.add(dim);

    // Large Dialog Box
    const box = this.add.graphics();
    box.fillStyle(0x0f1622, 0.98);
    box.lineStyle(2, 0x66fcf1, 0.8);
    box.fillRoundedRect(width / 2 - 350, 40, 700, height - 80, 10);
    box.strokeRoundedRect(width / 2 - 350, 40, 700, height - 80, 10);
    this.dialogueOverlay.add(box);

    // Quest Title & Desc
    const titleText = this.add.text(width / 2 - 320, 65, quest.title, {
      font: 'bold 18px "Noto Sans TC", sans-serif',
      color: '#66fcf1'
    });
    this.dialogueOverlay.add(titleText);

    const descText = this.add.text(width / 2 - 320, 100, quest.description, {
      font: '12px "Noto Sans TC", sans-serif',
      color: '#8899a6',
      wordWrap: { width: 640 }
    });
    this.dialogueOverlay.add(descText);

    // NPC Dialog bubble
    const npcTitle = this.add.text(width / 2 - 320, 140, quest.npcName, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#22c55e'
    });
    this.dialogueOverlay.add(npcTitle);

    const npcQuote = this.add.text(width / 2 - 320, 160, quest.npcQuote, {
      font: 'italic 12px "Noto Sans TC", sans-serif',
      color: '#c5c6c7',
      wordWrap: { width: 640 }
    });
    this.dialogueOverlay.add(npcQuote);

    // Antagonist Dialog bubble
    const antTitle = this.add.text(width / 2 - 320, 205, `${quest.conflictName} (${quest.conflictType}) 🗣️`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ef4444'
    });
    this.dialogueOverlay.add(antTitle);

    const antQuote = this.add.text(width / 2 - 320, 222, quest.conflictQuote, {
      font: 'italic 12px "Noto Sans TC", sans-serif',
      color: '#f97316',
      wordWrap: { width: 640 }
    });
    this.dialogueOverlay.add(antQuote);

    // Choices Title
    const chooseLabel = this.add.text(width / 2 - 320, 280, '🛠️ 選擇你的協商對策方案 (鍵盤按1,2,3)：', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#66fcf1'
    });
    this.dialogueOverlay.add(chooseLabel);

    // Draw 3 Choices
    quest.choices.forEach((choice, idx) => {
      const yCoord = 310 + idx * 62;
      
      const choiceBox = this.add.graphics();
      choiceBox.fillStyle(0x1f2833, 0.6);
      choiceBox.lineStyle(1, 0x45a29e, 0.3);
      choiceBox.fillRoundedRect(width / 2 - 320, yCoord, 640, 52, 6);
      choiceBox.strokeRoundedRect(width / 2 - 320, yCoord, 640, 52, 6);
      this.dialogueOverlay?.add(choiceBox);

      // Highlighter
      const borderHigh = this.add.graphics();
      borderHigh.lineStyle(2, 0x66fcf1, 1);
      borderHigh.strokeRoundedRect(width / 2 - 320, yCoord, 640, 52, 6);
      borderHigh.setVisible(false);
      this.dialogueOverlay?.add(borderHigh);

      // Choice Text
      const textPrefix = idx === 0 ? '【A】' : idx === 1 ? '【B】' : '【C】';
      const cTxt = this.add.text(width / 2 - 305, yCoord + 12, `${textPrefix} ${choice.text}`, {
        font: 'bold 12px "Noto Sans TC", sans-serif',
        color: '#ffffff',
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
      
      const effectTxt = this.add.text(width / 2 - 305, yCoord + 32, `數值影響：${effectsStr}`, {
        font: '9px monospace',
        color: '#45a29e'
      });
      this.dialogueOverlay?.add(effectTxt);

      // Hover zone
      const hoverZone = this.add.zone(width / 2, yCoord + 26, 640, 52).setInteractive({ useHandCursor: true });
      this.dialogueOverlay?.add(hoverZone);

      hoverZone.on('pointerover', () => {
        borderHigh.setVisible(true);
        cTxt.setColor('#66fcf1');
      });

      hoverZone.on('pointerout', () => {
        borderHigh.setVisible(false);
        cTxt.setColor('#ffffff');
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
    
    // Draw Feedback Dialog Screen
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.dialogueOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.dialogueOverlay.add(dim);

    const box = this.add.graphics();
    box.fillStyle(0x0f1622, 0.98);
    box.lineStyle(2, 0x39ff14, 0.7);
    box.fillRoundedRect(width / 2 - 280, height / 2 - 170, 560, 310, 10);
    box.strokeRoundedRect(width / 2 - 280, height / 2 - 170, 560, 310, 10);
    this.dialogueOverlay.add(box);

    const resultTitle = this.add.text(width / 2, height / 2 - 135, '✅ 協商方案實施回饋', {
      font: 'bold 18px "Noto Sans TC", sans-serif',
      color: '#39ff14'
    }).setOrigin(0.5);
    this.dialogueOverlay.add(resultTitle);

    // NPC Feedback
    const nTitle = this.add.text(width / 2 - 240, height / 2 - 95, `倡議代表反應：`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#22c55e'
    });
    this.dialogueOverlay.add(nTitle);

    const nTxt = this.add.text(width / 2 - 240, height / 2 - 75, `「${choice.npcFeedback}」`, {
      font: 'italic 13px "Noto Sans TC", sans-serif',
      color: '#c5c6c7',
      wordWrap: { width: 480 }
    });
    this.dialogueOverlay.add(nTxt);

    // Antagonist Feedback
    const aTitle = this.add.text(width / 2 - 240, height / 2 - 10, `衝突方反應：`, {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ef4444'
    });
    this.dialogueOverlay.add(aTitle);

    const aTxt = this.add.text(width / 2 - 240, height / 2 + 10, `「${choice.conflictFeedback}」`, {
      font: 'italic 13px "Noto Sans TC", sans-serif',
      color: '#f97316',
      wordWrap: { width: 480 }
    });
    this.dialogueOverlay.add(aTxt);

    // Space button to exit
    const closeBox = this.add.graphics();
    closeBox.fillStyle(0x1f2833, 0.9);
    closeBox.lineStyle(1, 0x39ff14, 0.8);
    closeBox.fillRoundedRect(width / 2 - 100, height / 2 + 85, 200, 35, 6);
    closeBox.strokeRoundedRect(width / 2 - 100, height / 2 + 85, 200, 35, 6);
    this.dialogueOverlay.add(closeBox);

    const closeTxt = this.add.text(width / 2, height / 2 + 102, '按【 空白鍵 】關閉對話', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#ffffff'
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

    const portal = this.add.circle(width / 2, height / 2 + 10, 30, 0xff007f, 0.6);
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
      color: '#ff007f',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 }
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
    
    // HUD Panel Box
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0x0f1622, 0.85);
    hudBox.lineStyle(1, 0x45a29e, 0.3);
    hudBox.fillRoundedRect(15, 15, width - 30, 48, 6);
    hudBox.strokeRoundedRect(15, 15, width - 30, 48, 6);
    hudBox.setScrollFactor(0);
    hudBox.setDepth(10);

    // HUD Text Labels
    const statLabels = [
      { key: 'residentSatisfaction', label: '居民', x: 30, color: '#22c55e' },
      { key: 'merchantSatisfaction', label: '商家', x: 140, color: '#eab308' },
      { key: 'commuteEfficiency', label: '通勤', x: 250, color: '#3b82f6' },
      { key: 'ecologicalScore', label: '生態', x: 360, color: '#10b981' },
      { key: 'safetySense', label: '安全', x: 470, color: '#6366f1' },
      { key: 'activityVitality', label: '活動', x: 580, color: '#a855f7' },
    ];

    statLabels.forEach(item => {
      // Label text
      const t = this.add.text(item.x, 22, `${item.label}: 50`, {
        font: 'bold 11px "Noto Sans TC", sans-serif',
        color: item.color
      }).setScrollFactor(0).setDepth(11);
      
      this.hudTexts[item.key] = t;

      // Small grey bar outline
      const barBg = this.add.graphics();
      barBg.fillStyle(0x1a202c, 1);
      barBg.fillRect(item.x, 39, 80, 5);
      barBg.setScrollFactor(0).setDepth(11);

      // Colored stats progress bar
      const bar = this.add.graphics();
      bar.setScrollFactor(0).setDepth(12);
      this.hudBars[item.key] = bar;
    });

    // Conflict value indicator (Far right)
    const conText = this.add.text(width - 290, 22, '衝突值: 20', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ff3131'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['conflictValue'] = conText;

    const conBarBg = this.add.graphics();
    conBarBg.fillStyle(0x1a202c, 1);
    conBarBg.fillRect(width - 290, 39, 90, 5);
    conBarBg.setScrollFactor(0).setDepth(11);

    const conBar = this.add.graphics();
    conBar.setScrollFactor(0).setDepth(12);
    this.hudBars['conflictValue'] = conBar;

    // Progress Level Indicator
    const progText = this.add.text(width - 170, 22, '任務進度: 0/3', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#66fcf1'
    }).setScrollFactor(0).setDepth(11);
    this.hudTexts['progress'] = progText;

    const charText = this.add.text(width - 170, 38, `角色: ${this.registry.get('selectedCharName')}`, {
      font: '9px "Noto Sans TC", sans-serif',
      color: '#8899a6'
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

    // Update Stats text and drawing bars
    const statConfig = [
      { key: 'residentSatisfaction', color: 0x22c55e, label: '居民', width: 80 },
      { key: 'merchantSatisfaction', color: 0xeab308, label: '商家', width: 80 },
      { key: 'commuteEfficiency', color: 0x3b82f6, label: '通勤', width: 80 },
      { key: 'ecologicalScore', color: 0x10b981, label: '生態', width: 80 },
      { key: 'safetySense', color: 0x6366f1, label: '安全', width: 80 },
      { key: 'activityVitality', color: 0xa855f7, label: '活動', width: 80 },
      { key: 'conflictValue', color: 0xff3131, label: '衝突值', width: 90 }
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
