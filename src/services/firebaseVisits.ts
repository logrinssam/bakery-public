import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { sanitizeDisplayText, INPUT_LIMITS } from '../lib/safeStorage';

const DEVICE_ID_KEY = 'pixel_bakery_device_id';
const SESSION_LOGGED_KEY = 'pixel_bakery_session_logged';
const SCHOOL_SESSION_PREFIX = 'pixel_bakery_school_session_logged_v1:';

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
/** 학교별 닉네임(학생 saveId당 1명) — Firestore 콘솔에서 조회 */
export async function recordSchoolUser(
  schoolName: string,
  nickname: string,
  saveId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const school = schoolName.trim();
  const name = sanitizeDisplayText(nickname, INPUT_LIMITS.hallName);
  if (!school || !name || saveId.length < 32) return;

  const schoolId = (await sha256Hex(school)).slice(0, 40);
  const ref = doc(db, 'schoolUsers', schoolId, 'users', saveId);

  try {
    await setDoc(
      ref,
      {
        schoolName: school,
        nickname: name,
        lastSeenAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // ignore
  }
}

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
