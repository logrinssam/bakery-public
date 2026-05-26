import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { PlayerStats } from '../types';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { parsePlayerStats } from '../lib/safeStorage';

type PlayerSaveDoc = {
  updatedAt?: unknown;
} & Record<string, unknown>;

function statsToFirestore(stats: PlayerStats): Record<string, unknown> {
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

export async function loadPinSave(saveId: string, fallback: PlayerStats): Promise<PlayerStats | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseDb();
  if (!db) return null;
  const ref = doc(db, 'pinSaves', saveId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as PlayerSaveDoc;
  return parsePlayerStats(data, fallback);
}

export async function savePinStats(saveId: string, stats: PlayerStats): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, 'pinSaves', saveId);
  await setDoc(
    ref,
    {
      ...statsToFirestore(stats),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

