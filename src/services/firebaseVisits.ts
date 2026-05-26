import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  collection,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
  type Unsubscribe
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';

const DEVICE_ID_KEY = 'pixel_bakery_device_id';
const SESSION_LOGGED_KEY = 'pixel_bakery_session_logged';
const SCHOOL_SESSION_PREFIX = 'pixel_bakery_school_session_logged_v1:';

export interface VisitStats {
  totalSessions: number;
  uniqueDevices: number;
}

export interface SchoolVisitStats extends VisitStats {
  schoolName: string;
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function recordSessionVisit(): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  if (sessionStorage.getItem(SESSION_LOGGED_KEY)) return;

  const deviceId = getOrCreateDeviceId();
  const statsRef = doc(db, 'meta', 'stats');
  const visitorRef = doc(db, 'visitors', deviceId);

  try {
    const statsSnap = await getDoc(statsRef);
    if (!statsSnap.exists()) {
      await setDoc(statsRef, {
        totalSessions: 1,
        uniqueDevices: 0,
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(statsRef, {
        totalSessions: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    const visitorSnap = await getDoc(visitorRef);
    if (!visitorSnap.exists()) {
      await setDoc(visitorRef, {
        deviceId,
        firstSeen: serverTimestamp()
      });
      await updateDoc(statsRef, {
        uniqueDevices: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    sessionStorage.setItem(SESSION_LOGGED_KEY, '1');
  } catch {
    // ignore — visit stats are non-critical
  }
}

/**
 * School-level stats:
 * - counts session once per tab per school
 * - counts unique device once per school (best-effort, based on deviceId doc creation)
 */
export async function recordSchoolVisit(schoolName: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const school = schoolName.trim();
  if (!school) return;

  const deviceId = getOrCreateDeviceId();
  const schoolId = (await sha256Hex(school)).slice(0, 40);
  const sessionKey = `${SCHOOL_SESSION_PREFIX}${schoolId}`;
  if (sessionStorage.getItem(sessionKey)) return;

  const statsRef = doc(db, 'schoolStats', schoolId);
  const visitorRef = doc(db, 'schoolVisitors', schoolId, 'devices', deviceId);

  try {
    const statsSnap = await getDoc(statsRef);
    if (!statsSnap.exists()) {
      await setDoc(statsRef, {
        schoolName: school,
        totalSessions: 1,
        uniqueDevices: 0,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(statsRef, {
        totalSessions: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    const visitorSnap = await getDoc(visitorRef);
    if (!visitorSnap.exists()) {
      await setDoc(visitorRef, {
        deviceId,
        firstSeen: serverTimestamp(),
      });
      await updateDoc(statsRef, {
        uniqueDevices: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // ignore — stats are non-critical
  }
}

export function subscribeVisitStats(
  onStats: (stats: VisitStats) => void
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  const statsRef = doc(db, 'meta', 'stats');
  return onSnapshot(statsRef, (snap) => {
    const data = snap.data();
    onStats({
      totalSessions: Number(data?.totalSessions ?? 0),
      uniqueDevices: Number(data?.uniqueDevices ?? 0)
    });
  });
}

export async function fetchTopSchoolStats(topN = 12): Promise<SchoolVisitStats[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'schoolStats'),
      orderBy('uniqueDevices', 'desc'),
      orderBy('totalSessions', 'desc'),
      limit(topN)
    );
    const snaps = await getDocs(q);
    const out: SchoolVisitStats[] = [];
    snaps.forEach((s) => {
      const d: any = s.data();
      out.push({
        schoolName: String(d?.schoolName ?? ''),
        totalSessions: Number(d?.totalSessions ?? 0),
        uniqueDevices: Number(d?.uniqueDevices ?? 0),
      });
    });
    return out.filter((x) => x.schoolName);
  } catch {
    return [];
  }
}

/** 배포 빌드: PIN 평문 대신 SHA-256 해시만 사용 (번들에 비밀번호 노출 방지) */
export function isTeacherStatsEnabled(): boolean {
  const hash = (import.meta.env.VITE_VISITOR_ADMIN_PIN_SHA256 ?? '').trim();
  if (hash.length > 0) return true;
  return import.meta.env.DEV && Boolean((import.meta.env.VITE_VISITOR_ADMIN_PIN ?? '').trim());
}

export async function verifyTeacherPin(entered: string): Promise<boolean> {
  const pin = entered.trim();
  if (!pin || pin.length > 32) return false;

  const expectedHash = (import.meta.env.VITE_VISITOR_ADMIN_PIN_SHA256 ?? '')
    .trim()
    .toLowerCase();
  if (expectedHash.length > 0) {
    const actual = await sha256Hex(pin);
    return actual === expectedHash;
  }

  if (import.meta.env.DEV) {
    const plain = (import.meta.env.VITE_VISITOR_ADMIN_PIN ?? '').trim();
    return plain.length > 0 && pin === plain;
  }

  return false;
}
