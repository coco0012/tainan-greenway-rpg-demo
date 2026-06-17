export interface GameStats {
  residentSatisfaction: number;
  merchantSatisfaction: number;
  commuteEfficiency: number;
  ecologicalScore: number;
  safetySense: number;
  activityVitality: number;
  conflictValue: number;
}

export const INITIAL_STATS: GameStats = {
  residentSatisfaction: 50,
  merchantSatisfaction: 50,
  commuteEfficiency: 50,
  ecologicalScore: 50,
  safetySense: 50,
  activityVitality: 50,
  conflictValue: 20
};
