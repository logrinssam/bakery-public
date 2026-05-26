import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { PlayerStats } from '../types';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { parsePlayerStats } from '../lib/safeStorage';
import { rtdbLoadPinSave, rtdbSavePinSave, statsToPlainObject } from './firebaseRtdbMirror';

type PlayerSaveDoc = {
  updatedAt?: unknown;
} & Record<string, unknown>;

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

  const payload = {
    ...statsToPlainObject(stats),
    updatedAt: serverTimestamp(),
  };

  const writes: Promise<void>[] = [];

  const db = getFirebaseDb();
  if (db) {
    writes.push(
      setDoc(doc(db, 'pinSaves', saveId), payload, { merge: true }).catch(() => undefined)
    );
  }

  writes.push(rtdbSavePinSave(saveId, stats).catch(() => undefined));

  await Promise.all(writes);
}
