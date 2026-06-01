import {HallRecord, PlayerStats} from '../types';

export const STORAGE_KEYS = {
  gameSave: 'pixel_bakery_game_save',
  hallRecords: 'pixel_bakery_hall_records',
} as const;

export const INPUT_LIMITS = {
  hallName: 20,
  hallSchool: 30,
  hallComment: 120,
} as const;

/** Control chars·HTML 특수문자 제거, 길이 제한 (XSS 완화·UI 깨짐 방지) */
export function sanitizeDisplayText(value: string, maxLen: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>&]/g, '')
    .trim()
    .slice(0, maxLen);
}

/** 서버 제출용 상한 */
export const HALL_SUBMIT_LIMITS = {
  maxStars: 50,
  maxStreak: 100,
} as const;

export const MAX_STAGE_STARS = 50;

/** 스테이지 클리어 수(별). 예전 세이브(정답마다 +1)는 진행도 기준으로 보정 */
export function normalizeStarsEarned(starsEarned: number, stageProgress: number): number {
  const clearedByProgress = Math.max(0, Math.min(MAX_STAGE_STARS, stageProgress - 1));
  if (starsEarned > MAX_STAGE_STARS || starsEarned > stageProgress + 5) {
    return clearedByProgress;
  }
  return Math.min(MAX_STAGE_STARS, Math.max(0, Math.max(starsEarned, clearedByProgress)));
}

export function clampHallSubmitStats(stars: number, highestStreak: number) {
  return {
    stars: Math.min(HALL_SUBMIT_LIMITS.maxStars, Math.max(0, Math.floor(stars))),
    highestStreak: Math.min(
      HALL_SUBMIT_LIMITS.maxStreak,
      Math.max(0, Math.floor(highestStreak))
    ),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback: number, min = 0, max = 1_000_000): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => asNumber(v, NaN, 0, 999))
    .filter((n) => Number.isFinite(n));
}

function asStringArray(value: unknown, maxItems = 200, maxItemLen = 40): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => sanitizeDisplayText(v, maxItemLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** 저장 데이터가 보정되면서 stageProgress가 줄었는지 (안내 모달용) */
export function getStageProgressAdjustment(
  raw: unknown,
  parsed: PlayerStats
): { adjusted: boolean; previousStage?: number } {
  if (!isRecord(raw) || typeof raw.stageProgress !== 'number') {
    return { adjusted: false };
  }
  const previous = Math.floor(raw.stageProgress);
  if (previous <= parsed.stageProgress) return { adjusted: false };
  return { adjusted: true, previousStage: previous };
}

export function parsePlayerStats(raw: unknown, fallback: PlayerStats): PlayerStats {
  if (!isRecord(raw)) return fallback;

  let stageProgress = asNumber(raw.stageProgress, fallback.stageProgress, 1, MAX_STAGE_STARS);
  const starsRaw = asNumber(raw.starsEarned, fallback.starsEarned, 0, 999_999);
  const starsEarned = normalizeStarsEarned(starsRaw, stageProgress);
  // 버그로 stage만 튀는 세이브 보정 (별·클리어 수 대비 비정상 진행)
  const maxStageFromStars = Math.min(MAX_STAGE_STARS, Math.max(1, starsEarned + 1));
  stageProgress = Math.min(stageProgress, maxStageFromStars);

  return {
    stageProgress,
    gold: asNumber(raw.gold, fallback.gold, 0, 9_999_999),
    streakCount: asNumber(raw.streakCount, fallback.streakCount, 0, 9999),
    highestStreak: asNumber(raw.highestStreak, fallback.highestStreak, 0, 9999),
    starsEarned,
    correctAnswersCount: asNumber(raw.correctAnswersCount, fallback.correctAnswersCount, 0, 999_999),
    totalAnswersCount: asNumber(raw.totalAnswersCount, fallback.totalAnswersCount, 0, 999_999),
    purchasedEquipmentIds: asNumberArray(raw.purchasedEquipmentIds),
    hallOfFameRegistered: Boolean(raw.hallOfFameRegistered),
    hallName:
      typeof raw.hallName === 'string'
        ? sanitizeDisplayText(raw.hallName, INPUT_LIMITS.hallName)
        : undefined,
    hallSchool:
      typeof raw.hallSchool === 'string'
        ? sanitizeDisplayText(raw.hallSchool, INPUT_LIMITS.hallSchool)
        : undefined,
    hallComment:
      typeof raw.hallComment === 'string'
        ? sanitizeDisplayText(raw.hallComment, INPUT_LIMITS.hallComment)
        : undefined,
    hallDate:
      typeof raw.hallDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.hallDate)
        ? raw.hallDate
        : undefined,
    unlockedBreadIndices: asNumberArray(raw.unlockedBreadIndices),
    encounteredMascotNames: asStringArray(raw.encounteredMascotNames),
  };
}

export function parseHallRecords(raw: unknown): HallRecord[] {
  if (!Array.isArray(raw)) return [];

  const records: HallRecord[] = [];
  for (const item of raw.slice(0, 100)) {
    if (!isRecord(item)) continue;
    const name = typeof item.name === 'string' ? sanitizeDisplayText(item.name, INPUT_LIMITS.hallName) : '';
    const comment = typeof item.comment === 'string' ? sanitizeDisplayText(item.comment, INPUT_LIMITS.hallComment) : '';
    if (!name || !comment) continue;

    records.push({
      id: typeof item.id === 'string' ? item.id.slice(0, 32) : String(Date.now()),
      name,
      schoolName:
        typeof item.schoolName === 'string'
          ? sanitizeDisplayText(item.schoolName, INPUT_LIMITS.hallSchool)
          : undefined,
      comment,
      date:
        typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
          ? item.date
          : new Date().toISOString().split('T')[0],
      stars: asNumber(item.stars, 0, 0, 9999),
      highestStreak: asNumber(item.highestStreak, 0, 0, 9999),
      createdAt:
        typeof item.createdAt === 'string' && item.createdAt.length <= 40
          ? item.createdAt
          : undefined,
      commentHidden: Boolean(item.commentHidden),
    });
  }
  return records;
}

export function clearAllGameStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.gameSave);
  localStorage.removeItem(STORAGE_KEYS.hallRecords);
}
