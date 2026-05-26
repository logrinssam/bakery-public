import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';

export function subscribeAnonUser(cb: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export async function ensureAnonSignedIn(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}

