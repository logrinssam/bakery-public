import { get, ref, set, update } from 'firebase/database';
import type { PlayerStats } from '../types';
import { getFirebaseRtdb, isRtdbConfigured } from '../lib/firebase';
import { parsePlayerStats } from '../lib/safeStorage';

export function statsToPlainObject(stats: PlayerStats): Record<string, unknown> {
  return {
    stageProgress: stats.stageProgress,
    gold: stats.gold,
    streakCount: stats.streakCount,
    highestStreak: stats.highestStreak,
    starsEarned: stats.starsEarned,
    correctAnswersCount: stats.correctAnswersCount,
    totalAnswersCount: stats.totalAnswersCount,
    purchasedEquipmentIds: stats.purchasedEquipmentIds ?? [],
    hallOfFameRegistered: Boolean(stats.hallOfFameRegistered),
    hallName: stats.hallName ?? null,
    hallSchool: stats.hallSchool ?? null,
    hallComment: stats.hallComment ?? null,
    hallDate: stats.hallDate ?? null,
    unlockedBreadIndices: stats.unlockedBreadIndices ?? [],
    encounteredMascotNames: stats.encounteredMascotNames ?? [],
  };
}

export async function rtdbLoadPinSave(
  saveId: string,
  fallback: PlayerStats
): Promise<PlayerStats | null> {
  if (!isRtdbConfigured() || saveId.length < 32) return null;
  const db = getFirebaseRtdb();
  if (!db) return null;
  try {
    const snap = await get(ref(db, `pinSaves/${saveId}`));
    if (!snap.exists()) return null;
    return parsePlayerStats(snap.val() as Record<string, unknown>, fallback);
  } catch {
    return null;
  }
}

export async function rtdbSavePinSave(saveId: string, stats: PlayerStats): Promise<void> {
  if (!isRtdbConfigured() || saveId.length < 32) return;
  const db = getFirebaseRtdb();
  if (!db) return;
  await set(ref(db, `pinSaves/${saveId}`), {
    ...statsToPlainObject(stats),
    updatedAt: new Date().toISOString(),
  });
}

export async function rtdbRecordSchoolUser(
  schoolId: string,
  saveId: string,
  schoolName: string,
  nickname: string
): Promise<void> {
  if (!isRtdbConfigured()) return;
  const db = getFirebaseRtdb();
  if (!db) return;
  await set(ref(db, `schoolUsers/${schoolId}/users/${saveId}`), {
    schoolName,
    nickname,
    lastSeenAt: new Date().toISOString(),
  });
}

export async function rtdbPatch(path: string, data: Record<string, unknown>): Promise<void> {
  if (!isRtdbConfigured()) return;
  const db = getFirebaseRtdb();
  if (!db) return;
  await update(ref(db, path), data);
}

export async function rtdbSet(path: string, data: Record<string, unknown>): Promise<void> {
  if (!isRtdbConfigured()) return;
  const db = getFirebaseRtdb();
  if (!db) return;
  await set(ref(db, path), data);
}

export async function rtdbGet(path: string): Promise<Record<string, unknown> | null> {
  if (!isRtdbConfigured()) return null;
  const db = getFirebaseRtdb();
  if (!db) return null;
  const snap = await get(ref(db, path));
  if (!snap.exists()) return null;
  const val = snap.val();
  return val && typeof val === 'object' ? (val as Record<string, unknown>) : null;
}
