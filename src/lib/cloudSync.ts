import { getEquipmentLevel, UPGRADE_ITEMS } from '../data/equipment';
import { TOTAL_STAGE_COUNT } from '../data/stages';
import type { PlayerStats } from '../types';
import { normalizeStarsEarned } from './safeStorage';

function mergeEquipmentIds(a: number[], b: number[]): number[] {
  const result: number[] = [];
  for (const item of UPGRADE_ITEMS) {
    const maxLevel = Math.max(
      getEquipmentLevel(a, item.id),
      getEquipmentLevel(b, item.id)
    );
    for (let i = 0; i < maxLevel; i++) {
      result.push(item.id);
    }
  }
  return result;
}

function mergeUniqueNumbers(a?: number[], b?: number[]): number[] {
  return [...new Set([...(a ?? []), ...(b ?? [])])].sort((x, y) => x - y);
}

function mergeUniqueStrings(a?: string[], b?: string[]): string[] {
  return [...new Set([...(a ?? []), ...(b ?? [])])];
}

/** 로컬·클라우드 진행을 합쳐 더 앞선 쪽을 반영 (기기 간 이어하기) */
export function mergePlayerStatsForSync(
  local: PlayerStats,
  remote: PlayerStats
): PlayerStats {
  let stageProgress = Math.max(local.stageProgress, remote.stageProgress);
  const starsEarned = normalizeStarsEarned(
    Math.max(local.starsEarned, remote.starsEarned),
    stageProgress
  );
  const maxStageFromStars = Math.min(
    TOTAL_STAGE_COUNT,
    Math.max(1, starsEarned + 1)
  );
  stageProgress = Math.min(stageProgress, maxStageFromStars);

  return {
    stageProgress,
    gold: Math.max(local.gold, remote.gold),
    streakCount: Math.max(local.streakCount, remote.streakCount),
    highestStreak: Math.max(local.highestStreak, remote.highestStreak),
    starsEarned,
    correctAnswersCount: Math.max(
      local.correctAnswersCount,
      remote.correctAnswersCount
    ),
    totalAnswersCount: Math.max(
      local.totalAnswersCount,
      remote.totalAnswersCount
    ),
    purchasedEquipmentIds: mergeEquipmentIds(
      local.purchasedEquipmentIds,
      remote.purchasedEquipmentIds
    ),
    hallOfFameRegistered:
      local.hallOfFameRegistered || remote.hallOfFameRegistered,
    hallName: local.hallName || remote.hallName,
    hallSchool: local.hallSchool || remote.hallSchool,
    hallComment: local.hallComment || remote.hallComment,
    hallDate: local.hallDate || remote.hallDate,
    unlockedBreadIndices: mergeUniqueNumbers(
      local.unlockedBreadIndices,
      remote.unlockedBreadIndices
    ),
    encounteredMascotNames: mergeUniqueStrings(
      local.encounteredMascotNames,
      remote.encounteredMascotNames
    ),
  };
}

export function describeSyncProgressChange(
  before: PlayerStats,
  after: PlayerStats
): string | null {
  if (
    after.stageProgress > before.stageProgress ||
    after.starsEarned > before.starsEarned
  ) {
    return `다른 기기 진행을 불러왔어요. (현재 ${after.starsEarned}단계 클리어 · ${after.stageProgress}단계 진행 가능)`;
  }
  if (
    after.stageProgress < before.stageProgress ||
    after.starsEarned < before.starsEarned
  ) {
    return null;
  }
  return '다른 기기와 진행이 맞춰졌어요.';
}
