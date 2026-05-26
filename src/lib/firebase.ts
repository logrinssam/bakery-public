import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getAuth, type Auth } from 'firebase/auth';

function databaseUrlFromEnv(): string {
  const explicit = (import.meta.env.VITE_FIREBASE_DATABASE_URL ?? '').trim();
  if (explicit) return explicit;
  const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '').trim();
  if (projectId) return `https://${projectId}-default-rtdb.firebaseio.com`;
  return '';
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: databaseUrlFromEnv() || undefined,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function isRtdbConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(databaseUrlFromEnv());
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) {
    db = getFirestore(firebaseApp);
  }
  return db;
}

export function getFirebaseRtdb(): Database | null {
  if (!isRtdbConfigured()) return null;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!rtdb) {
    rtdb = getDatabase(firebaseApp);
  }
  return rtdb;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    auth = getAuth(firebaseApp);
  }
  return auth;
}
