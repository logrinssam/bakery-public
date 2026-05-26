import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  limit
} from 'firebase/firestore';
import { clampHallSubmitStats, sanitizeDisplayText, INPUT_LIMITS } from '../lib/safeStorage';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import type { HallRecord } from '../types';

const COLLECTION = 'hallRecords';

/** Firestore fetch cap — keeps read costs low */
export const HALL_RECORDS_TOP_LIMIT = 50;

function docToRecord(id: string, data: Record<string, unknown>): HallRecord {
  const createdAt = data.createdAt
    ? typeof data.createdAt === 'string'
      ? data.createdAt
      : String(data.createdAt)
    : undefined;
  return {
    id,
    name: String(data.name ?? ''),
    schoolName: data.schoolName ? String(data.schoolName) : undefined,
    comment: String(data.comment ?? ''),
    date: String(data.date ?? ''),
    stars: Number(data.stars ?? 0),
    highestStreak: Number(data.highestStreak ?? 0),
    createdAt
  };
}

/** One-shot fetch (no realtime listener) */
export async function fetchHallRecords(): Promise<HallRecord[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    orderBy('stars', 'desc'),
    limit(HALL_RECORDS_TOP_LIMIT)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => docToRecord(d.id, d.data()));
}

export async function addHallRecordToFirebase(
  record: Omit<HallRecord, 'id'>
): Promise<string | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const name = sanitizeDisplayText(record.name, INPUT_LIMITS.hallName);
  const schoolName = sanitizeDisplayText(record.schoolName ?? '', INPUT_LIMITS.hallSchool);
  const comment = sanitizeDisplayText(record.comment, INPUT_LIMITS.hallComment);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(record.date)
    ? record.date
    : new Date().toISOString().split('T')[0];
  const { stars, highestStreak } = clampHallSubmitStats(record.stars, record.highestStreak);

  if (!name || !schoolName || !comment) return null;

  const ref = await addDoc(collection(db, COLLECTION), {
    name,
    schoolName,
    comment,
    date,
    stars,
    highestStreak,
    createdAt: new Date().toISOString()
  });
  return ref.id;
}

export { isFirebaseConfigured };
