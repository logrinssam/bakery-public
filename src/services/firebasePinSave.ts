import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { PlayerStats } from '../types';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { normalizeStarsEarned, parsePlayerStats } from '../lib/safeStorage';
import { TOTAL_STAGE_COUNT } from '../data/stages';
import { rtdbLoadPinSave, rtdbSavePinSave, statsToPlainObject } from './firebaseRtdbMirror';

type PlayerSaveDoc = {
  updatedAt?: unknown;
} & Record<string, unknown>;

/** 클라우드 저장 전 진행도 상한 (버그·연타로 튄 stageProgress 완화) */
export function clampStatsForCloudSave(stats: PlayerStats): PlayerStats {
  const starsEarned = normalizeStarsEarned(stats.starsEarned, stats.stageProgress);
  const maxStage = Math.min(
    TOTAL_STAGE_COUNT,
    Math.max(1, starsEarned + 1)
  );
  return {
    ...stats,
    starsEarned,
    stageProgress: Math.min(stats.stageProgress, maxStage),
  };
}

export async function loadPinSave(saveId: string, fallback: PlayerStats): Promise<PlayerStats | null> {
  if (!isFirebaseConfigured()) return null;

  let fromFirestore: PlayerStats | null = null;
  const db = getFirebaseDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'pinSaves', saveId));
      if (snap.exists()) {
        fromFirestore = parsePlayerStats(snap.data() as PlayerSaveDoc, fallback);
      }
    } catch {
      // Firestore blocked or unavailable — try RTDB
    }
  }

  if (fromFirestore) return fromFirestore;

  return rtdbLoadPinSave(saveId, fallback);
}

export async function savePinStats(saveId: string, stats: PlayerStats): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const safe = clampStatsForCloudSave(stats);
  const payload = {
    ...statsToPlainObject(safe),
    updatedAt: serverTimestamp(),
  };

  const db = getFirebaseDb();
  if (db) {
    try {
      await setDoc(doc(db, 'pinSaves', saveId), payload, { merge: true });
      void rtdbSavePinSave(saveId, stats).catch(() => undefined);
      return;
    } catch {
      // Firestore blocked at school — RTDB only
    }
  }

  await rtdbSavePinSave(saveId, stats);
}
