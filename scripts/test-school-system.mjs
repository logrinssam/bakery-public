/**
 * Local smoke tests: school JSON, name resolution, Firebase reachability.
 * Run: node scripts/test-school-system.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'public/data/elementary-schools.json');

function loadEnvLocal() {
  const env = {};
  try {
    const text = readFileSync(join(root, '.env.local'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // ignore
  }
  return env;
}

function normalizeSchoolName(name) {
  return name.trim().replace(/\s+/g, '');
}

function resolveSchoolName(input, schools) {
  const normalized = normalizeSchoolName(input);
  if (!normalized || schools.length === 0) return null;
  return schools.find((s) => normalizeSchoolName(s) === normalized) ?? null;
}

function searchSchools(query, schools, limit = 12) {
  const q = normalizeSchoolName(query);
  if (!q || schools.length === 0) return [];
  return schools.filter((s) => normalizeSchoolName(s).includes(q)).slice(0, limit);
}

const schools = JSON.parse(readFileSync(jsonPath, 'utf8'));
const errors = [];
const ok = (msg) => console.log(`  OK  ${msg}`);

console.log('\n=== 1. elementary-schools.json ===');
if (!Array.isArray(schools) || schools.length < 100) {
  errors.push(`JSON invalid or too small: ${schools?.length}`);
} else {
  ok(`${schools.length} schools loaded`);
}

const sample = '가거도초등학교';
if (!schools.includes(sample)) errors.push(`Missing sample school: ${sample}`);
else ok(`contains "${sample}"`);

console.log('\n=== 2. resolveSchoolName / searchSchools ===');
if (resolveSchoolName(sample, schools) !== sample) errors.push('Exact match failed');
else ok('exact school name resolves');

if (resolveSchoolName('가거도초', schools) !== null) errors.push('Partial input should NOT resolve');
else ok('partial input correctly rejected');

const hits = searchSchools('서울', schools, 5);
if (hits.length === 0) errors.push('searchSchools(서울) returned empty');
else ok(`search "서울" → ${hits.length} hits (e.g. ${hits[0]})`);

console.log('\n=== 3. Dev server HTTP ===');
const base = 'http://localhost:3000';
try {
  const home = await fetch(base, { signal: AbortSignal.timeout(8000) });
  if (!home.ok) errors.push(`GET / → ${home.status}`);
  else ok(`GET / → ${home.status}`);

  const data = await fetch(`${base}/data/elementary-schools.json`, {
    signal: AbortSignal.timeout(15000)
  });
  if (!data.ok) errors.push(`GET school JSON → ${data.status}`);
  else {
    const remote = await data.json();
    if (remote.length !== schools.length) {
      errors.push(`Dev JSON count ${remote.length} !== file ${schools.length}`);
    } else ok(`GET /data/elementary-schools.json → ${remote.length} schools`);
  }
} catch (e) {
  errors.push(`Dev server not reachable: ${e.message}`);
}

console.log('\n=== 4. Firebase config (.env.local) ===');
const env = loadEnvLocal();
const fbOk = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);
if (!fbOk) errors.push('Firebase env vars missing in .env.local');
else ok(`projectId=${env.VITE_FIREBASE_PROJECT_ID}`);

if (fbOk) {
  console.log('\n=== 5. Firestore read (hallRecords) ===');
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const app = initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    });
    const db = getFirestore(app);
    const q = query(collection(db, 'hallRecords'), orderBy('stars', 'desc'), limit(5));
    const snap = await getDocs(q);
    ok(`hallRecords readable (${snap.size} docs sampled)`);
  } catch (e) {
    errors.push(`Firestore read failed: ${e.code || ''} ${e.message}`);
  }
}

console.log('\n=== Result ===');
if (errors.length) {
  console.error('FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('All automated checks passed.\n');
console.log('Manual UI (browser):');
console.log('  - http://localhost:3000/ → 명예 베이커리 목록');
console.log('  - 학교 입력 시 자동완성, 50단계 후 등록 폼');
