/**
 * (선택) NEIS API로 JSON 생성 — 일일 호출 제한·100건 페이징 이슈 있음.
 * CSV가 있으면 권장: npm run build:schools  (scripts/csv-to-elementary-schools.mjs)
 *
 * Run: NEIS_API_KEY=키 node scripts/build-elementary-schools.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../public/data/elementary-schools.json');
const PAGE_SIZE = 1000;
const apiKey = process.env.NEIS_API_KEY || process.env.VITE_NEIS_API_KEY;
if (!apiKey) {
  console.error(
    'Set NEIS_API_KEY (or VITE_NEIS_API_KEY) from https://open.neis.go.kr/portal/guide/actKeyPage.do'
  );
  process.exit(1);
}

const BASE =
  `https://open.neis.go.kr/hub/schoolInfo?KEY=${encodeURIComponent(apiKey)}&Type=json&SCHUL_KND_SC_NM=` +
  encodeURIComponent('초등학교');

async function fetchPage(page) {
  const url = `${BASE}&pIndex=${page}&pSize=${PAGE_SIZE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NEIS HTTP ${res.status}`);
  const data = await res.json();
  const block = data?.schoolInfo?.[1]?.row;
  if (!Array.isArray(block)) return [];
  return block.map((r) => String(r.SCHUL_NM || '').trim()).filter(Boolean);
}

async function main() {
  const first = await fetch(`${BASE}&pIndex=1&pSize=1`);
  const firstJson = await first.json();
  const total = Number(firstJson?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
  const pages = Math.ceil(total / PAGE_SIZE) || 1;

  const names = new Set();
  for (let p = 1; p <= pages; p++) {
    const rows = await fetchPage(p);
    for (const name of rows) names.add(name);
    console.log(`Page ${p}/${pages}: +${rows.length} (unique ${names.size})`);
  }

  const sorted = [...names].sort((a, b) => a.localeCompare(b, 'ko'));
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(sorted), 'utf8');
  console.log(`Wrote ${sorted.length} schools to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
