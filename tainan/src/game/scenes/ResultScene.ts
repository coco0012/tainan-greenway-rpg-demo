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
  private awardData!: { title: string; badge: string; color: number; textColor: string; desc: string };

  constructor() {
    super('ResultScene');
  }

  create() {
    this.stats = this.registry.get('stats');
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Calculate title
    this.awardData = this.calculateAward(this.stats);

    // Background (Light beige)
    this.add.rectangle(width / 2, height / 2, width, height, 0xf4f3ef);
    this.add.grid(width / 2, height / 2, width, height, 40, 40, 0, 0, 0xe6e4dc, 0.4);

    // Title text
    this.add.text(width / 2, 25, '🎨 綠園道共創發表成果與專案頒獎', {
      font: 'bold 20px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    }).setOrigin(0.5);

    // 1. DRAW 2.5D STAGED GREENWAY SCHEMATIC
    const mapBox = this.add.graphics();
    mapBox.fillStyle(0xffffff, 0.95);
    mapBox.lineStyle(1.5, 0x7c9a8f, 0.3);
    mapBox.fillRoundedRect(35, 65, width - 70, 260, 10);
    mapBox.strokeRoundedRect(35, 65, width - 70, 260, 10);

    // Draw green spine horizontal strip (Soft pastel greenway path)
    this.add.rectangle(width / 2, 195, width - 70, 50, 0xc2d6c4);

    // Static elements in background
    this.add.text(100, 140, '🏠', { font: '26px Arial' }).setOrigin(0.5).setAlpha(0.6);
    this.add.text(280, 130, '🏪', { font: '24px Arial' }).setOrigin(0.5).setAlpha(0.6);
    this.add.text(820, 140, '🌳', { font: '28px Arial' }).setOrigin(0.5).setAlpha(0.6);
    this.add.text(700, 130, '🌲', { font: '24px Arial' }).setOrigin(0.5).setAlpha(0.6);

    this.add.text(width / 2, 310, '💡 滑鼠移到市民頭像上，聽聽他們對最終方案的反應對白！', {
      font: 'bold 11px "Noto Sans TC", sans-serif',
      color: '#5c6b63'
    }).setOrigin(0.5);

    // Render interactive citizens
    CITIZENS.forEach(cit => {
      // Ring color depending on their stats score
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

      // Outer ring graphics
      const ring = this.add.graphics();
      ring.lineStyle(2.5, colorVal, 0.7);
      ring.strokeCircle(cit.x, cit.y, 22);

      // Emoji Avatar
      const av = this.add.text(cit.x, cit.y, cit.avatar, { font: '24px Arial' })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Hover name tag
      this.add.text(cit.x, cit.y + 32, cit.name, {
        font: 'bold 9px "Noto Sans TC", sans-serif',
        color: '#2f3e46'
      }).setOrigin(0.5);

      av.on('pointerover', () => {
        av.setScale(1.2);
        this.showSpeechBubble(cit);
      });

      av.on('pointerout', () => {
        av.setScale(1);
        this.hideSpeechBubble();
      });
    });

    // 2. RENDER AWARD SUMMARY & RADAR/BAR CHARTS
    this.drawAwardPanel(width);

    // 3. REPLAY CONTROLS
    this.drawReplayButton(width, height);
  }

  private showSpeechBubble(cit: CitizenNode) {
    this.hideSpeechBubble();
    
    // Bubble Container
    this.bubbleContainer = this.add.container(0, 0).setDepth(40);

    const bubbleX = cit.x;
    const bubbleY = cit.y - 75;

    const speechText = cit.getBubble(this.stats);

    // Styled text object (White background, charcoal text)
    const txt = this.add.text(0, 0, `${cit.name} (${cit.role}):\n${speechText}`, {
      font: '11px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 6 },
      wordWrap: { width: 200 },
      lineSpacing: 4
    }).setOrigin(0.5, 0.5);

    // Border graphics for speech bubble
    const border = this.add.graphics();
    border.lineStyle(1.5, 0x7c9a8f, 0.8);
    border.strokeRect(txt.x - txt.width / 2, txt.y - txt.height / 2, txt.width, txt.height);
    
    this.bubbleContainer.add(txt);
    this.bubbleContainer.add(border);
    this.bubbleContainer.setPosition(bubbleX, bubbleY);
  }

  private hideSpeechBubble() {
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = undefined;
    }
  }

  private drawAwardPanel(width: number) {
    // Left Box: Badge & Title (White Card)
    const badgeBox = this.add.graphics();
    badgeBox.fillStyle(0xffffff, 0.95);
    badgeBox.lineStyle(1.5, this.awardData.color, 0.8);
    badgeBox.fillRoundedRect(35, 345, 280, 175, 8);
    badgeBox.strokeRoundedRect(35, 345, 280, 175, 8);

    const medal = this.add.text(175, 400, this.awardData.badge, { font: '48px Arial' }).setOrigin(0.5);
    // Spin the medal slightly
    this.tweens.add({
      targets: medal,
      angle: 15,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(175, 455, `【 ${this.awardData.title} 】`, {
      font: 'bold 18px "Noto Sans TC", sans-serif',
      color: this.awardData.textColor
    }).setOrigin(0.5);

    // Right Box: Statistics Report Table (White Card)
    const reportBox = this.add.graphics();
    reportBox.fillStyle(0xffffff, 0.95);
    reportBox.lineStyle(1.5, 0x7c9a8f, 0.2);
    reportBox.fillRoundedRect(330, 345, width - 365, 175, 8);
    reportBox.strokeRoundedRect(330, 345, width - 365, 175, 8);

    this.add.text(350, 360, '📊 協商績效總覽：', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#2c3e35'
    });

    const statRows = [
      { label: '居民滿意', val: this.stats.residentSatisfaction, x: 350, y: 390, c: '#547c64' },
      { label: '商家滿意', val: this.stats.merchantSatisfaction, x: 350, y: 420, c: '#b88c42' },
      { label: '通勤效率', val: this.stats.commuteEfficiency, x: 350, y: 450, c: '#4c6c96' },
      
      { label: '生態分數', val: this.stats.ecologicalScore, x: 500, y: 390, c: '#3d8c6d' },
      { label: '安全感', val: this.stats.safetySense, x: 500, y: 420, c: '#545899' },
      { label: '活動活力', val: this.stats.activityVitality, x: 500, y: 450, c: '#885899' }
    ];

    statRows.forEach(item => {
      this.add.text(item.x, item.y, `${item.label}:`, { font: '11px "Noto Sans TC", sans-serif', color: '#5c6b63' });
      this.add.text(item.x + 60, item.y, `${item.val}`, { font: 'bold 11px monospace', color: item.c });
    });

    // Conflict value summary
    const conflictColorStr = this.stats.conflictValue > 45 ? '#c95e53' : '#547c64';
    this.add.text(350, 485, `最終衝突值：`, { font: 'bold 11px "Noto Sans TC", sans-serif', color: '#c95e53' });
    this.add.text(430, 485, `${this.stats.conflictValue} / 100`, { font: 'bold 11px monospace', color: conflictColorStr });

    // Title description
    this.add.text(630, 360, '📜 規劃考評回顧：', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#7c9a8f'
    });

    this.add.text(630, 385, this.awardData.desc, {
      font: '11px "Noto Sans TC", sans-serif',
      color: '#2f3e46',
      wordWrap: { width: width - 660, useAdvancedWrap: true },
      lineSpacing: 5
    });
  }

  private drawReplayButton(width: number, height: number) {
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.input.keyboard?.once('keydown-R', () => this.replay());

    const btnBox = this.add.graphics();
    btnBox.fillStyle(0x7c9a8f, 1);
    btnBox.lineStyle(1.5, 0xffffff, 1);
    btnBox.fillRoundedRect(width - 165, height - 48, 130, 35, 6);
    btnBox.strokeRoundedRect(width - 165, height - 48, 130, 35, 6);

    const btnText = this.add.text(width - 100, height - 31, '重新遊玩 (R)', {
      font: 'bold 12px "Noto Sans TC", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnText.on('pointerover', () => btnText.setScale(1.05));
    btnText.on('pointerout', () => btnText.setScale(1));
    btnText.on('pointerdown', () => this.replay());
  }

  private replay() {
    this.scene.start('IntroScene');
  }

  private calculateAward(stats: GameStats) {
    if (stats.conflictValue >= 45 && stats.residentSatisfaction < 45) {
      return {
        title: '混亂規劃師',
        badge: '💥',
        color: 0xd98880,
        textColor: '#c95e53',
        desc: '你規劃的綠園道充斥著噪音糾紛與居民投訴，商業、通勤與生態利益完全失衡，這無疑是一個動盪的都市混亂現場！'
      };
    }
    if (stats.ecologicalScore >= 65) {
      return {
        title: '綠色守護者',
        badge: '🌿',
        color: 0x7cb79e,
        textColor: '#3d8c6d',
        desc: '你成功為府城保留了寶貴的原生林帶與生物核心棲地！暗空暖燈守護了夜行動物的安寧，生態效益非常卓越！'
      };
    }
    if (stats.activityVitality >= 65 && stats.merchantSatisfaction >= 60) {
      return {
        title: '活力策展人',
        badge: '🎸',
        color: 0xbf9ac9,
        textColor: '#885899',
        desc: '你打造的綠廊活力爆表！滑板青年、街頭樂手與特色市集交匯於此，店面高朋滿座，是個熱鬧非凡的市民舞台！'
      };
    }
    if (stats.commuteEfficiency >= 65 && stats.safetySense >= 60) {
      return {
        title: '流線規劃師',
        badge: '🚲',
        color: 0x8fa8c6,
        textColor: '#4c6c96',
        desc: '你極佳地梳理了人行與單車流線，通道安全性與效率奇高。通勤族在綠意中流暢穿梭，效率滿分！'
      };
    }
    if (stats.conflictValue <= 20) {
      return {
        title: '衝突調停者',
        badge: '🤝',
        color: 0x7c9a8f,
        textColor: '#2c3e35',
        desc: '你是公共協商談判的高超調停專家！用智慧與高度分流的手段完美化解了鄰里摩擦，創造了極高的社會和諧度！'
      };
    }
    return {
      title: '城市共感設計師',
      badge: '📐',
      color: 0xe6c280,
      textColor: '#b88c42',
      desc: '你在居民清靜、商家利益、單車效率、生態綠化與安全照明的拉扯中，尋找到了最平衡的公約數，打造出一個兼顧包容與發展的新台南地標！'
    };
  }
}
