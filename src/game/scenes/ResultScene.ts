import Phaser from 'phaser';
import type { GameStats } from '../data/stats';

interface CitizenNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  x: number;
  y: number;
  statKey: keyof GameStats | 'general';
  getBubble: (stats: GameStats) => string;
}

const CITIZENS: CitizenNode[] = [
  {
    id: 'resident',
    name: '李大媽',
    role: '在地居民',
    avatar: '👵',
    x: 150,
    y: 200,
    statKey: 'residentSatisfaction',
    getBubble: (stats) => 
      stats.residentSatisfaction >= 55 
        ? '「廊道留下了安靜的林蔭，晚上也沒噪音，我們老人能睡個好覺了！」'
        : '「吵死了！週末市集跟吉他唱歌開那麼大聲，我都快得心臟病了！」'
  },
  {
    id: 'merchant',
    name: '陳老闆',
    role: '文創店主',
    avatar: '☕',
    x: 270,
    y: 220,
    statKey: 'merchantSatisfaction',
    getBubble: (stats) => 
      stats.merchantSatisfaction >= 55
        ? '「市集分流規劃得好，店面客人不斷，營業額提升不少！」'
        : '「限制太多了！門口冷冷清清，連一個遊客都沒有，我們要倒閉了啦！」'
  },
  {
    id: 'commuter',
    name: '阿強',
    role: '自行車通勤族',
    avatar: '🚴',
    x: 400,
    y: 190,
    statKey: 'commuteEfficiency',
    getBubble: (stats) => 
      stats.commuteEfficiency >= 55
        ? '「通勤專用道很直捷，沒有亂七八糟的攤位擋路，上班不遲到了！」'
        : '「動線被市集大廣場切得稀巴爛，每天都要下車牽行，騎得超痛苦！」'
  },
  {
    id: 'ecology',
    name: '林教授',
    role: '生態倡議者',
    avatar: '🦉',
    x: 750,
    y: 180,
    statKey: 'ecologicalScore',
    getBubble: (stats) => 
      stats.ecologicalScore >= 55
        ? '「保留了原生密林，改用低光害的向下暖地燈，昨晚看到黑冠麻鷺回來了！」'
        : '「這哪是綠廊？根本是水泥地鋪滿彩光LED，生態棲地全毀了！」'
  },
  {
    id: 'elderly',
    name: '張爺爺',
    role: '社區長者',
    avatar: '👴',
    x: 200,
    y: 280,
    statKey: 'safetySense',
    getBubble: (stats) => 
      stats.safetySense >= 55
        ? '「路燈溫暖，地不滑，又有監視器，晚上散步總算覺得很安心。」'
        : '「沒有光害是很好，但黑漆漆的根本不敢去，跌倒或遇到壞人怎麼辦？」'
  },
  {
    id: 'child',
    name: '小明',
    role: '嬉戲孩童',
    avatar: '👦',
    x: 580,
    y: 270,
    statKey: 'safetySense',
    getBubble: (stats) => 
      stats.safetySense >= 50 && stats.activityVitality >= 50
        ? '「放學後能來綠廊踩草皮、玩捉迷藏，而且不用怕被機車撞，好開心！」'
        : '「這裡除了水泥地就是黑森林，爸爸媽媽說不安全，不准我來玩。」'
  },
  {
    id: 'youth',
    name: '莉莉',
    role: '街頭吉他手',
    avatar: '🎸',
    x: 900,
    y: 230,
    statKey: 'activityVitality',
    getBubble: (stats) => 
      stats.activityVitality >= 55
        ? '「終於有合適的戶外廣場可以表演，大家圍在一起聽歌，氣氛超讚！」'
        : '「限制一大堆，這也不能做那也不能擺，綠園道變得像停屍間一樣死寂。」'
  },
  {
    id: 'rioter',
    name: '隔壁老張',
    role: '抱怨暴民',
    avatar: '🗣️',
    x: 500,
    y: 210,
    statKey: 'conflictValue',
    getBubble: (stats) => 
      stats.conflictValue <= 30
        ? '「哼……雖然一開始很不爽，但看在這次有認真聽取大家意見的份上，勉強接受啦。」'
        : '「大爛政！這規劃根本是在製造民怨，誰出門誰倒楣，我要去市政府靜坐！」'
  }
];

export class ResultScene extends Phaser.Scene {
  private stats!: GameStats;
  private bubbleContainer?: Phaser.GameObjects.Container;
  private awardData!: { title: string; rating: string; badge: string; color: number; textColor: string; desc: string };

  constructor() {
    super('ResultScene');
  }

  create() {
    this.stats = this.registry.get('stats') || {
      residentSatisfaction: 50,
      merchantSatisfaction: 50,
      commuteEfficiency: 50,
      ecologicalScore: 50,
      safetySense: 50,
      activityVitality: 50,
      conflictValue: 20
    };
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Calculate rating and title
    this.awardData = this.calculateAward(this.stats);

    // dim overlay for introductory banner
    this.add.rectangle(width / 2, height / 2, width, height, 0xf4f3ef);
    this.add.grid(width / 2, height / 2, width, height, 40, 40, 0, 0, 0xe6e4dc, 0.4);

    // 1. DRAW 2.5D STAGED GREENWAY SCHEMATIC
    const mapBox = this.add.graphics();
    mapBox.fillStyle(0xffffff, 0.95);
    mapBox.lineStyle(1.5, 0x7c9a8f, 0.3);
    mapBox.fillRoundedRect(35, 65, width - 70, 260, 10);
    mapBox.strokeRoundedRect(35, 65, width - 70, 260, 10);

    // Draw green spine horizontal strip (Soft pastel greenway path)
    this.add.rectangle(width / 2, 195, width - 70, 50, 0xc2d6c4);

    // Static vector elements in background
    this.add.sprite(100, 140, 'house').setScale(0.7).setAlpha(0.65);
    this.add.sprite(280, 130, 'shop').setScale(0.7).setAlpha(0.65);
    
    // Trees in background
    const bgTree = this.add.graphics();
    bgTree.fillStyle(0x8caf97, 0.6);
    bgTree.fillCircle(820, 135, 14);
    bgTree.fillStyle(0xa3c1ad, 0.6);
    bgTree.fillCircle(808, 142, 11);
    bgTree.fillStyle(0x7c9a8f, 0.6);
    bgTree.fillCircle(830, 142, 11);
    
    bgTree.fillStyle(0x8caf97, 0.6);
    bgTree.fillCircle(700, 130, 14);
    bgTree.fillStyle(0xa3c1ad, 0.6);
    bgTree.fillCircle(688, 137, 11);

    this.add.text(width / 2, 310, '💡 將滑鼠游標移至市民頭像上，聽聽他們對您最終對策的漫畫對白！', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#5c6b63'
    }).setOrigin(0.5);

    const citizenTextureMap: { [key: string]: string } = {
      'resident': 'npc_resident',
      'merchant': 'npc_merchant',
      'commuter': 'npc_commuter',
      'ecology': 'npc_ecology',
      'elderly': 'npc_resident',
      'child': 'player',
      'youth': 'npc_youth',
      'rioter': 'npc_rioter'
    };

    // Render interactive citizens
    CITIZENS.forEach(cit => {
      let colorVal = 0x7c9a8f;
      if (cit.statKey !== 'general') {
        const val = this.stats[cit.statKey as keyof GameStats];
        if (cit.id === 'rioter') {
          colorVal = this.stats.conflictValue > 45 ? 0xd98880 : 0x8caf97;
        } else if (val >= 55) {
          colorVal = 0x8caf97;
        } else if (val < 45) {
          colorVal = 0xd98880;
        }
      }

      // Outer ring
      const ring = this.add.graphics();
      ring.lineStyle(2.5, colorVal, 0.85);
      ring.strokeCircle(cit.x, cit.y, 24);

      // Sprite avatar
      const tex = citizenTextureMap[cit.id] || 'player';
      const av = this.add.sprite(cit.x, cit.y, tex)
        .setScale(0.85)
        .setInteractive({ useHandCursor: true });

      // Name tag
      this.add.text(cit.x, cit.y + 34, cit.name, {
        font: 'bold 9px "Noto Sans TC", sans-serif',
        color: '#2f3e46'
      }).setOrigin(0.5);

      av.on('pointerover', () => {
        av.setScale(1.05);
        this.showSpeechBubble(cit);
      });

      av.on('pointerout', () => {
        av.setScale(0.85);
        this.hideSpeechBubble();
      });
    });

    // 2. RENDER AWARD PANEL (With animated score bars)
    this.drawAwardPanel(width);

    // 3. REPLAY & SCREENSHOT CONTROLS
    this.drawControlButtons(width, height);

    // 4. FLASH "共創發表會開始！" BANNER
    this.showEntranceBanner(width, height);
  }

  // ENTRANCE CINEMATIC BANNER
  private showEntranceBanner(width: number, height: number) {
    const bannerContainer = this.add.container(0, 0).setDepth(100);
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1b202c, 0.85);
    
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x7c9a8f, 1);
    bannerBg.lineStyle(2, 0xffffff, 1);
    bannerBg.fillRoundedRect(width / 2 - 200, height / 2 - 60, 400, 120, 10);
    bannerBg.strokeRoundedRect(width / 2 - 200, height / 2 - 60, 400, 120, 10);

    const txt1 = this.add.text(width / 2, height / 2 - 20, '🎉 共創發表會開始！ 🎉', {
      font: 'bold 24px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    const txt2 = this.add.text(width / 2, height / 2 + 18, '正在產出最終規劃成果考評...', {
      font: '13px "Noto Sans TC", sans-serif',
      color: '#e6e4dc'
    }).setOrigin(0.5);

    bannerContainer.add([bg, bannerBg, txt1, txt2]);

    // Zoom and fade out after 1.8 seconds
    this.time.delayedCall(1600, () => {
      this.tweens.add({
        targets: bannerContainer,
        alpha: 0,
        scale: 0.95,
        duration: 450,
        onComplete: () => bannerContainer.destroy()
      });
    });
  }

  // COMIC BUBBLE STYLING
  private showSpeechBubble(cit: CitizenNode) {
    this.hideSpeechBubble();
    
    this.bubbleContainer = this.add.container(0, 0).setDepth(45);

    const bubbleX = cit.x;
    const bubbleY = cit.y - 82;
    const speechText = cit.getBubble(this.stats);

    const paddingX = 14;
    const paddingY = 10;
    const wordWrapW = 200;

    // Text object to calculate sizing
    const txt = this.add.text(0, 0, speechText, {
      font: 'bold 10px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: wordWrapW, useAdvancedWrap: true },
      lineSpacing: 4
    }).setOrigin(0.5);

    const boxW = txt.width + paddingX * 2;
    const boxH = txt.height + paddingY * 2;

    // Drawing comic speech bubble with pointer tail
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.98);
    g.lineStyle(1.5, 0x7c9a8f, 1);
    // Round rectangle bubble
    g.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    g.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    // Draw bubble arrow tail pointing down
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(-6, boxH / 2, 6, boxH / 2, 0, boxH / 2 + 8);
    g.lineStyle(1.5, 0x7c9a8f, 1);
    g.lineBetween(-6, boxH / 2, 0, boxH / 2 + 8);
    g.lineBetween(6, boxH / 2, 0, boxH / 2 + 8);

    this.bubbleContainer.add([g, txt]);
    this.bubbleContainer.setPosition(bubbleX, bubbleY);

    // Slide up fade in
    this.bubbleContainer.alpha = 0;
    this.tweens.add({
      targets: this.bubbleContainer,
      alpha: 1,
      y: bubbleY - 4,
      duration: 150
    });
  }

  private hideSpeechBubble() {
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = undefined;
    }
  }

  private getMedalTextureKey(title: string): string {
    if (title === '城市共感設計師' || title === '衝突調停者') return 'medal_gold';
    if (title === '綠色守護者' || title === '活力策展人' || title === '流線規劃師') return 'medal_silver';
    return 'medal_bronze';
  }

  // AWARD PANEL WITH ANIMATED PROGRESS BARS
  private drawAwardPanel(width: number) {
    // Left Box: Award Ribbon & Title (White Card)
    const badgeBox = this.add.graphics();
    badgeBox.fillStyle(0xffffff, 0.95);
    badgeBox.lineStyle(2, this.awardData.color, 0.85);
    badgeBox.fillRoundedRect(35, 345, 280, 175, 8);
    badgeBox.strokeRoundedRect(35, 345, 280, 175, 8);

    // Medal Sprite Bouncing
    const medalKey = this.getMedalTextureKey(this.awardData.title);
    const medal = this.add.sprite(175, 400, medalKey).setScale(1.25).setOrigin(0.5);
    this.tweens.add({
      targets: medal,
      angle: 12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Big S/A/B/C Level rating badge
    this.add.circle(230, 370, 22, this.awardData.color, 1).setStrokeStyle(2, 0xffffff, 1);
    this.add.text(230, 370, this.awardData.rating, {
      font: 'bold 22px "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(175, 458, `【 ${this.awardData.title} 】`, {
      font: 'bold 18px "Noto Sans TC", sans-serif',
      color: this.awardData.textColor
    }).setOrigin(0.5);

    // Right Box: Statistics Report Table (White Card)
    const reportBox = this.add.graphics();
    reportBox.fillStyle(0xffffff, 0.95);
    reportBox.lineStyle(1.5, 0x7c9a8f, 0.2);
    reportBox.fillRoundedRect(330, 345, width - 365, 175, 8);
    reportBox.strokeRoundedRect(330, 345, width - 365, 175, 8);

    this.add.text(350, 358, '📊 協商成果考評：', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    });

    const statRows = [
      { key: 'residentSatisfaction', label: '居民滿意', val: this.stats.residentSatisfaction, x: 350, y: 382, c: 0x8caf97 },
      { key: 'merchantSatisfaction', label: '商家滿意', val: this.stats.merchantSatisfaction, x: 350, y: 408, c: 0xe6c280 },
      { key: 'commuteEfficiency', label: '通勤效率', val: this.stats.commuteEfficiency, x: 350, y: 434, c: 0x8fa8c6 },
      { key: 'ecologicalScore', label: '生態分數', val: this.stats.ecologicalScore, x: 350, y: 460, c: 0x7cb79e },
      { key: 'safetySense', label: '安全感受', val: this.stats.safetySense, x: 350, y: 486, c: 0x9a9ec9 }
    ];

    // Animate stats progress bars!
    statRows.forEach(item => {
      this.add.text(item.x, item.y, `${item.label}:`, { font: 'bold 10px "Noto Sans TC", sans-serif', color: '#5c6b63' });
      
      const valTxt = this.add.text(item.x + 55, item.y, '0', { font: 'bold 10px monospace', color: '#' + item.c.toString(16) });
      
      // Bar background
      const barBg = this.add.graphics();
      barBg.fillStyle(0xe6e4dc, 1);
      barBg.fillRect(item.x + 85, item.y + 3, 100, 6);

      // Stat fill bar
      const fillBar = this.add.graphics();
      
      // Animate growth
      this.tweens.addCounter({
        from: 0,
        to: item.val,
        duration: 1000,
        ease: 'Quad.easeOut',
        onUpdate: (tween) => {
          const currentVal = Math.round(tween.getValue() as number);
          valTxt.setText(`${currentVal}`);
          
          fillBar.clear();
          fillBar.fillStyle(item.c, 1);
          fillBar.fillRect(item.x + 85, item.y + 3, currentVal, 6);
        }
      });
    });

    // Conflict value animated indicator
    const conflictColorStr = this.stats.conflictValue > 45 ? '#c95e53' : '#547c64';
    const conValTxt = this.add.text(575, 358, `衝突值: 0`, { font: 'bold 11px "Noto Sans TC", sans-serif', color: conflictColorStr });
    this.tweens.addCounter({
      from: 0,
      to: this.stats.conflictValue,
      duration: 1000,
      ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        const currentVal = Math.round(tween.getValue() as number);
        conValTxt.setText(`衝突值: ${currentVal} / 100`);
      }
    });

    // Slogan and analysis
    this.add.text(575, 385, '📜 綜合規劃考評評語：', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    });

    this.add.text(575, 410, this.awardData.desc, {
      font: '11px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: width - 600, useAdvancedWrap: true },
      lineSpacing: 5
    });
  }

  // REPLAY & SCREENSHOT BUTTONS
  private drawControlButtons(width: number, height: number) {
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.input.keyboard?.once('keydown-R', () => this.replay());

    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.input.keyboard?.on('keydown-S', () => this.saveScreenshot());

    // 1. Replay Button (R)
    const replayBox = this.add.graphics();
    replayBox.fillStyle(0x7c9a8f, 1);
    replayBox.lineStyle(1.5, 0xffffff, 1);
    replayBox.fillRoundedRect(width - 295, height - 48, 120, 35, 6);
    replayBox.strokeRoundedRect(width - 295, height - 48, 120, 35, 6);

    const replayTxt = this.add.text(width - 235, height - 31, '重新遊玩 (R)', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    replayTxt.on('pointerover', () => replayTxt.setScale(1.05));
    replayTxt.on('pointerout', () => replayTxt.setScale(1));
    replayTxt.on('pointerdown', () => this.replay());

    // 2. Save Screenshot Button (S)
    const saveBox = this.add.graphics();
    saveBox.fillStyle(0xd98880, 1);
    saveBox.lineStyle(1.5, 0xffffff, 1);
    saveBox.fillRoundedRect(width - 155, height - 48, 120, 35, 6);
    saveBox.strokeRoundedRect(width - 155, height - 48, 120, 35, 6);

    const saveTxt = this.add.text(width - 95, height - 31, '保存成果圖 (S)', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    saveTxt.on('pointerover', () => saveTxt.setScale(1.05));
    saveTxt.on('pointerout', () => saveTxt.setScale(1));
    saveTxt.on('pointerdown', () => this.saveScreenshot());
  }

  private replay() {
    this.scene.start('IntroScene');
  }

  private saveScreenshot() {
    this.game.renderer.snapshot((image: any) => {
      const link = document.createElement('a');
      link.download = 'tainan-greenway-award.png';
      link.href = image.src;
      link.click();
    });
  }

  private calculateAward(stats: GameStats) {
    // Score calculation
    const totalScore = stats.residentSatisfaction + stats.merchantSatisfaction + stats.commuteEfficiency + stats.ecologicalScore + stats.safetySense;
    const finalVal = totalScore - stats.conflictValue;

    let rating = 'B';
    if (finalVal >= 250) rating = 'S';
    else if (finalVal >= 200) rating = 'A';
    else if (finalVal >= 130) rating = 'B';
    else rating = 'C';

    if (stats.conflictValue >= 45 && stats.residentSatisfaction < 45) {
      return {
        title: '混亂規劃者',
        rating: 'C',
        badge: '💥',
        color: 0xd98880,
        textColor: '#c95e53',
        desc: '這無疑是一個動盪的都市混亂現場！你規劃的綠園道充斥著噪音糾紛與居民投訴，多方利益完全失衡，民怨沸騰。'
      };
    }
    if (stats.ecologicalScore >= 65) {
      return {
        title: '綠色生態守護者',
        rating: rating,
        badge: '🌿',
        color: 0x7cb79e,
        textColor: '#3d8c6d',
        desc: '卓越的生態效益！你成功為府城保留了寶貴的原生林帶與生物核心棲地，暗空暖燈也守護了夜行鳥類的安寧。'
      };
    }
    if (stats.activityVitality >= 65 && stats.merchantSatisfaction >= 60) {
      return {
        title: '活力策展人',
        rating: rating,
        badge: '🎸',
        color: 0xbf9ac9,
        textColor: '#885899',
        desc: '熱鬧非凡的市民舞台！你打造的綠廊活力爆表，街頭樂手與市集交匯於此，店鋪生意興隆，創意朝氣勃發。'
      };
    }
    if (stats.commuteEfficiency >= 65 && stats.safetySense >= 60) {
      return {
        title: '流線規劃師',
        rating: rating,
        badge: '🚲',
        color: 0x8fa8c6,
        textColor: '#4c6c96',
        desc: '安全與效率滿分！你極佳地梳理了人行與單車流線，通勤族在綠意中流暢穿梭，是個高安全性的通道。'
      };
    }
    if (stats.conflictValue <= 20) {
      return {
        title: '社會調停大師',
        rating: rating,
        badge: '🤝',
        color: 0x7c9a8f,
        textColor: '#2c3e35',
        desc: '高超的調停手段！你用高度智慧與分流手段完美化解了鄰里摩擦與利益拉扯，創造了極高的社會和諧度。'
      };
    }
    
    return {
      title: '城市共感設計師',
      rating: rating,
      badge: '📐',
      color: 0xe6c280,
      textColor: '#b88c42',
      desc: '平衡發展的都市典範！你在居民清靜、商家利益、單車效率與生態綠化中尋找到了最佳平衡，打造出包容的新地標！'
    };
  }
}
