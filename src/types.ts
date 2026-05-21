export enum ShopType {
  COOKIE = 'COOKIE',
  CUPCAKE = 'CUPCAKE',
  CAKE = 'CAKE',
  DONUT = 'DONUT',
  MACARON = 'MACARON',
  MARKET = 'MARKET',
  ROYAL = 'ROYAL',
  FINAL = 'FINAL'
}

export interface Stage {
  id: number;
  name: string;
  representativeMenu: string;
  shopType: ShopType;
  backgroundImage: string;
  requiredStars: number;
  goldMultiplier: number;
  theme: string;
}

export enum QuestionCategory {
  RATIO_EXPRESSION = 'RATIO_EXPRESSION', // 비의 표현 (A:B)
  RATIO_VALUE_FRACTION = 'RATIO_VALUE_FRACTION', // 비율의 분수값
  RATIO_VALUE_DECIMAL = 'RATIO_VALUE_DECIMAL', // 비율의 소수값
  PERCENTAGE_CONVERSION = 'PERCENTAGE_CONVERSION', // 백분율 변환 (비율 -> 백분율)
  DISCOUNT_CALCULATION = 'DISCOUNT_CALCULATION', // 할인 판매 가격 계산
  APPLIED_WORD_PROBLEM = 'APPLIED_WORD_PROBLEM', // 실생활 비와 비율 문장제
  INGREDIENT_RATIO_BUILDER = 'INGREDIENT_RATIO_BUILDER' // 직접 재료 조절하기 (실습형)
}

export interface MathQuestion {
  id: number;
  category: QuestionCategory;
  questionText: string;
  helperText?: string;
  recipeDetails?: {
    itemA: string;
    itemB: string;
    valA: number;
    valB: number;
  };
  options?: string[]; // Multiple choice options if any
  correctAnswer: string; // The literal clean representation of correct answer
  acceptableAnswers: string[]; // List of alternative formats (e.g. ['0.4', '.4', '2/5'])
  unit?: string; // %, 개, 원, 등.
  hint: string;
}

export interface Equipment {
  id: number;
  name: string;
  category: 'oven' | 'rolling_pin' | 'measuring_cup' | 'scale' | 'other' | 'calculation';
  price: number;
  description: string;
  multiplierBoost: number; // e.g. 0.2 means +20% gold earning
  effectText: string;
  unlocked: boolean;
  spriteIndex: number; // 0 to 63
}

export interface PlayerStats {
  stageProgress: number; // Current unlocked stage (1 - 50)
  gold: number;
  streakCount: number;
  highestStreak: number;
  starsEarned: number; // Total correct answers
  correctAnswersCount: number;
  totalAnswersCount: number;
  purchasedEquipmentIds: number[];
  hallOfFameRegistered: boolean;
  hallName?: string;
  hallSchool?: string;
  hallComment?: string;
  hallDate?: string;
  unlockedBreadIndices?: number[];
  encounteredMascotNames?: string[];
}

export interface HallRecord {
  id: string;
  name: string;
  schoolName?: string;
  comment: string;
  date: string;
  stars: number;
  highestStreak: number;
}
