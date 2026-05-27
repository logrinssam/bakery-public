import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { sanitizeDisplayText, INPUT_LIMITS } from '../lib/safeStorage';
import { rtdbGet, rtdbRecordSchoolUser, rtdbSet } from './firebaseRtdbMirror';

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

async function incrementUniqueSchoolsMetaRtdb(): Promise<void> {
  const existing = await rtdbGet('meta/schools');
  const current = Number(existing?.uniqueSchools ?? 0);
  await rtdbSet('meta/schools', {
    uniqueSchools: current + 1,
    updatedAt: new Date().toISOString(),
  });
}

async function recordSessionVisitRtdb(deviceId: string): Promise<boolean> {
  const stats = await rtdbGet('meta/stats');
  const totalSessions = Number(stats?.totalSessions ?? 0) + 1;
  let uniqueDevices = Number(stats?.uniqueDevices ?? 0);

  const visitor = await rtdbGet(`visitors/${deviceId}`);
  if (!visitor) {
    await rtdbSet(`visitors/${deviceId}`, {
      deviceId,
      firstSeen: new Date().toISOString(),
    });
    uniqueDevices += 1;
  }

  await rtdbSet('meta/stats', {
    totalSessions,
    uniqueDevices,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

/** 세션·학교 방문 집계는 RTDB만 사용 (Firestore read-before-write 비용 절감) */
export async function recordSessionVisit(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  if (sessionStorage.getItem(SESSION_LOGGED_KEY)) return;

  const deviceId = getOrCreateDeviceId();

  try {
    await recordSessionVisitRtdb(deviceId);
    sessionStorage.setItem(SESSION_LOGGED_KEY, '1');
  } catch {
    // ignore
  }
}

export async function recordSchoolUser(
  schoolName: string,
  nickname: string,
  saveId: string
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const school = schoolName.trim();
  const name = sanitizeDisplayText(nickname, INPUT_LIMITS.hallName);
  if (!school || !name || saveId.length < 32) return;

  const schoolId = (await sha256Hex(school)).slice(0, 40);
  const payload = {
    schoolName: school,
    nickname: name,
    lastSeenAt: new Date().toISOString(),
  };

  const db = getFirebaseDb();
  if (db) {
    try {
      await setDoc(doc(db, 'schoolUsers', schoolId, 'users', saveId), payload, { merge: true });
    } catch {
      // ignore
    }
  }

  try {
    await rtdbRecordSchoolUser(schoolId, saveId, school, name);
  } catch {
    // ignore
  }
}

async function recordSchoolVisitRtdb(
  school: string,
  schoolId: string,
  deviceId: string
): Promise<boolean> {
  const path = `schoolStats/${schoolId}`;
  const existing = await rtdbGet(path);
  const isNew = !existing;

  let totalSessions = Number(existing?.totalSessions ?? 0) + 1;
  let uniqueDevices = Number(existing?.uniqueDevices ?? 0);

  const devicePath = `schoolVisitors/${schoolId}/devices/${deviceId}`;
  const deviceSnap = await rtdbGet(devicePath);
  if (!deviceSnap) {
    await rtdbSet(devicePath, {
      deviceId,
      firstSeen: new Date().toISOString(),
    });
    uniqueDevices += 1;
  }

  await rtdbSet(path, {
    schoolName: school,
    totalSessions,
    uniqueDevices,
    updatedAt: new Date().toISOString(),
  });

  if (isNew) {
    try {
      await incrementUniqueSchoolsMetaRtdb();
    } catch {
      // optional
    }
  }
  return true;
}

export async function recordSchoolVisit(
  schoolName: string,
  options?: { force?: boolean }
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const school = schoolName.trim();
  if (!school) return;

  const deviceId = getOrCreateDeviceId();
  const schoolId = (await sha256Hex(school)).slice(0, 40);
  const sessionKey = `${SCHOOL_SESSION_PREFIX}${schoolId}`;
  if (!options?.force && sessionStorage.getItem(sessionKey)) return;

  try {
    await recordSchoolVisitRtdb(school, schoolId, deviceId);
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // ignore
  }
}
