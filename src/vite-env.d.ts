/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  /** Realtime Database URL (학교망 이어하기·집계 백업). 비우면 {projectId}-default-rtdb.firebaseio.com 사용 */
  readonly VITE_FIREBASE_DATABASE_URL?: string;
  readonly VITE_PUBLIC_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** vite app-version 플러그인 (production 빌드) */
declare const __APP_BUILD_ID__: string;
