import type { GameStats } from './stats';

export type CharacterId = 'resident' | 'merchant' | 'commuter' | 'ecology' | 'youth' | 'designer';

export interface Character {
  id: CharacterId;
  name: string;
  avatar: string;
  description: string;
  specialAbilityName: string;
  specialAbilityDesc: string;
  statModifier: Partial<GameStats>;
}

export const CHARACTERS: Character[] = [
  {
    id: 'resident',
    name: '居民代表',
    avatar: '👵',
    description: '重視夜間安寧、日常品質，抗拒噪音與過度商業化。',
    specialAbilityName: '寧靜領域',
    specialAbilityDesc: '居民滿意度的負面扣減減半。',
    statModifier: {
      residentSatisfaction: 15,
      conflictValue: -5,
      activityVitality: -10,
    }
  },
  {
    id: 'merchant',
    name: '商家代表',
    avatar: '🏪',
    description: '沿線店家，渴望吸引觀光人潮，推動商業活動刺激消費。',
    specialAbilityName: '黃金人流',
    specialAbilityDesc: '商業活動與廣場設計滿意度加成 +20%。',
    statModifier: {
      merchantSatisfaction: 15,
      activityVitality: 10,
      residentSatisfaction: -5,
    }
  },
  {
    id: 'commuter',
    name: '通勤者代表',
    avatar: '🚲',
    description: '自行車或步行通勤族，最關心動線直捷與轉乘便利。',
    specialAbilityName: '暢行無阻',
    specialAbilityDesc: '通勤效率保底增加 10 點。',
    statModifier: {
      commuteEfficiency: 15,
      safetySense: 5,
      activityVitality: -5,
    }
  },
  {
    id: 'ecology',
    name: '生態倡議者',
    avatar: '🌿',
    description: '推廣原生植物與綠地，反對夜間高照度破壞動物棲地。',
    specialAbilityName: '荒野共生',
    specialAbilityDesc: '綠化與低照明設計之生態加成 +30%。',
    statModifier: {
      ecologicalScore: 20,
      safetySense: -5,
      merchantSatisfaction: -5,
    }
  },
  {
    id: 'youth',
    name: '青年活動策展人',
    avatar: '🎸',
    description: '街頭藝人，渴望綠廊能提供彈性滑板與露天展演舞台。',
    specialAbilityName: '創意爆發',
    specialAbilityDesc: '展演活動帶來的活力加成 +30%。',
    statModifier: {
      activityVitality: 20,
      merchantSatisfaction: 5,
      residentSatisfaction: -10,
    }
  },
  {
    id: 'designer',
    name: '城市設計師',
    avatar: '📐',
    description: '講求空間美感與多方平衡，追求衝突最小化的設計。',
    specialAbilityName: '系統性平衡',
    specialAbilityDesc: '每次選擇造成的衝突值上升減少 30%。',
    statModifier: {
      residentSatisfaction: 5,
      merchantSatisfaction: 5,
      commuteEfficiency: 5,
      ecologicalScore: 5,
      safetySense: 5,
      activityVitality: 5,
    }
  }
];
