import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
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

async function incrementUniqueSchoolsMetaFirestore(
  db: NonNullable<ReturnType<typeof getFirebaseDb>>
): Promise<void> {
  const schoolsMetaRef = doc(db, 'meta', 'schools');
  const snap = await getDoc(schoolsMetaRef);
  if (!snap.exists()) {
    await setDoc(schoolsMetaRef, {
      uniqueSchools: 1,
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(schoolsMetaRef, {
      uniqueSchools: increment(1),
      updatedAt: serverTimestamp(),
    });
  }
}

async function incrementUniqueSchoolsMetaRtdb(): Promise<void> {
  const existing = await rtdbGet('meta/schools');
  const current = Number(existing?.uniqueSchools ?? 0);
  await rtdbSet('meta/schools', {
    uniqueSchools: current + 1,
    updatedAt: new Date().toISOString(),
  });
}

async function recordSessionVisitFirestore(deviceId: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const statsRef = doc(db, 'meta', 'stats');
  const visitorRef = doc(db, 'visitors', deviceId);

  const statsSnap = await getDoc(statsRef);
  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
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
  return true;
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

export async function recordSessionVisit(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  if (sessionStorage.getItem(SESSION_LOGGED_KEY)) return;

  const deviceId = getOrCreateDeviceId();
  let ok = false;

  try {
    ok = await recordSessionVisitFirestore(deviceId);
  } catch {
    // Firestore blocked at school — mirror to RTDB
  }

  if (!ok) {
    try {
      ok = await recordSessionVisitRtdb(deviceId);
    } catch {
      // ignore
    }
  } else {
    void recordSessionVisitRtdb(deviceId).catch(() => undefined);
  }

  if (ok) {
    sessionStorage.setItem(SESSION_LOGGED_KEY, '1');
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

async function recordSchoolVisitFirestore(
  school: string,
  schoolId: string,
  deviceId: string
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const statsRef = doc(db, 'schoolStats', schoolId);
  const visitorRef = doc(db, 'schoolVisitors', schoolId, 'devices', deviceId);

  const statsSnap = await getDoc(statsRef);
  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      schoolName: school,
      totalSessions: 1,
      uniqueDevices: 0,
      updatedAt: serverTimestamp(),
    });
    try {
      await incrementUniqueSchoolsMetaFirestore(db);
    } catch {
      // optional
    }
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
  return true;
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

  let ok = false;
  try {
    ok = await recordSchoolVisitFirestore(school, schoolId, deviceId);
  } catch {
    // Firestore blocked
  }

  if (!ok) {
    try {
      ok = await recordSchoolVisitRtdb(school, schoolId, deviceId);
    } catch {
      // ignore
    }
  } else {
    void recordSchoolVisitRtdb(school, schoolId, deviceId).catch(() => undefined);
  }

  if (ok) {
    sessionStorage.setItem(sessionKey, '1');
  }
}
