/**
 * Firestore / RTDB 사용자·저장 집계 (관리자용, 로컬 1회 실행)
 *
 * 1) Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성
 * 2) 키 JSON을 프로젝트 루트에 firebase-service-account.json 으로 저장 (gitignore 됨)
 * 3) npm run count:users
 *
 * 또는: npm run count:users -- --key "C:\path\to\key.json"
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const ROOT = path.resolve(__dirname, "../..");

function readProjectId() {
  try {
    const rc = JSON.parse(
      fs.readFileSync(path.join(ROOT, ".firebaserc"), "utf8")
    );
    return rc.projects?.default || null;
  } catch {
    return null;
  }
}

function readDatabaseUrl(projectId) {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    return `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
  }
  const text = fs.readFileSync(envPath, "utf8");
  const match = text.match(/VITE_FIREBASE_DATABASE_URL="([^"]+)"/);
  if (match?.[1]) return match[1];
  return `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
}

function resolveKeyPath() {
  const keyArg = process.argv.find((a) => a.startsWith("--key="));
  if (keyArg) return keyArg.slice("--key=".length);

  const keyIdx = process.argv.indexOf("--key");
  if (keyIdx !== -1 && process.argv[keyIdx + 1]) {
    return process.argv[keyIdx + 1];
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return process.env.FIREBASE_SERVICE_ACCOUNT;
  }

  const defaultPath = path.join(ROOT, "firebase-service-account.json");
  if (fs.existsSync(defaultPath)) return defaultPath;

  return null;
}

async function countCollection(db, name) {
  const snap = await db.collection(name).count().get();
  return snap.data().count;
}

async function countCollectionGroup(db, name) {
  const snap = await db.collectionGroup(name).count().get();
  return snap.data().count;
}

async function countRtdbChildren(ref) {
  const snap = await ref.get();
  if (!snap.exists()) return 0;
  const val = snap.val();
  if (!val || typeof val !== "object") return 0;
  return Object.keys(val).length;
}

async function main() {
  const keyPath = resolveKeyPath();
  if (!keyPath) {
    console.error(`
서비스 계정 키가 필요합니다.

  Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → 「새 비공개 키 생성」
  저장: ${path.join(ROOT, "firebase-service-account.json")}

  npm run count:users
  npm run count:users -- --key "경로\\키.json"
`);
    process.exit(1);
  }

  if (!fs.existsSync(keyPath)) {
    console.error(`키 파일을 찾을 수 없습니다: ${keyPath}`);
    process.exit(1);
  }

  const projectId = readProjectId();
  if (!projectId) {
    console.error(".firebaserc 에 default 프로젝트가 없습니다.");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
    databaseURL: readDatabaseUrl(projectId),
  });

  const db = admin.firestore();
  const rtdb = admin.database();

  console.log(`\n프로젝트: ${projectId}`);
  console.log(`키 파일: ${keyPath}\n`);
  console.log("── Firestore ──");

  const [pinSaves, hallRecords, schoolUserRows] = await Promise.all([
    countCollection(db, "pinSaves"),
    countCollection(db, "hallRecords"),
    countCollectionGroup(db, "users").catch(() => null),
  ]);

  console.log(`  pinSaves (PIN 클라우드 저장)     : ${pinSaves}명`);
  console.log(`  hallRecords (전당 등록)          : ${hallRecords}명`);
  if (schoolUserRows !== null) {
    console.log(
      `  schoolUsers/*/users (학교별 등록) : ${schoolUserRows}행`
    );
  } else {
    console.log(
      "  schoolUsers/*/users              : (collection group 인덱스 없음 — 콘솔에서 확인)"
    );
  }

  console.log("\n── Realtime Database (참고) ──");

  try {
    const [rtdbPinSaves, statsSnap] = await Promise.all([
      countRtdbChildren(rtdb.ref("pinSaves")),
      rtdb.ref("meta/stats").get(),
    ]);

    console.log(`  pinSaves (RTDB 미러)             : ${rtdbPinSaves}명`);

    if (statsSnap.exists()) {
      const stats = statsSnap.val();
      console.log(
        `  meta/stats.totalSessions         : ${stats.totalSessions ?? 0}`
      );
      console.log(
        `  meta/stats.uniqueDevices         : ${stats.uniqueDevices ?? 0} (기기 수, 유저≠)`
      );
    } else {
      console.log("  meta/stats                       : (없음)");
    }
  } catch (err) {
    console.log(`  RTDB 조회 실패: ${err.message}`);
  }

  console.log(`
해석:
  • pinSaves ≈ 학교+이름+PIN 으로 클라우드 저장한 계정 수
  • hallRecords = 50단계 완주 후 전당 등록한 사람 (pinSaves 보다 적을 수 있음)
  • uniqueDevices = 접속한 브라우저/기기 수 (학생 수와 다름)
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
