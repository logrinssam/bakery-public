/**
 * Converts a local elementary-school CSV to public/data/elementary-schools.json
 * (no NEIS API calls — safe for deployment)
 *
 * Usage:
 *   node scripts/csv-to-elementary-schools.mjs
 *   SCHOOLS_CSV=path/to/file.csv node scripts/csv-to-elementary-schools.mjs
 *
 * Default input: data/elementary-schools.csv
 *
 * Supported columns (first match wins for name):
 *   SCHUL_NM, 학교명, schoolName, name
 * Optional filter column:
 *   SCHUL_KND_SC_NM, 학교종류 — rows must contain "초등학교"
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_CSV = join(ROOT, 'data/elementary-schools.csv');
const OUT_PATH = join(ROOT, 'public/data/elementary-schools.json');

const NAME_HEADERS = ['SCHUL_NM', '학교명', 'schoolName', 'name', '학교명(국문)'];
const KIND_HEADERS = ['SCHUL_KND_SC_NM', '학교종류명', '학교종류', 'schoolKind', '학교급'];

function readCsvText(filePath) {
  const buf = readFileSync(filePath);
  const utf8 = buf.toString('utf8');
  if (utf8.includes('학교명') && utf8.includes('학교종류')) return utf8;

  for (const encoding of ['euc-kr', 'windows-949']) {
    try {
      const text = new TextDecoder(encoding).decode(buf);
      if (text.includes('학교명')) return text;
    } catch {
      // try next
    }
  }
  return utf8;
}

function resolveCsvPath() {
  if (process.env.SCHOOLS_CSV) {
    const p = join(process.cwd(), process.env.SCHOOLS_CSV);
    if (existsSync(p)) return p;
  }
  if (existsSync(DEFAULT_CSV)) return DEFAULT_CSV;

  const rootFiles = readdirSync(ROOT).filter(
    (f) => f.endsWith('.csv') && f.includes('학교기본정보')
  );
  if (rootFiles.length > 0) return join(ROOT, rootFiles[0]);

  return DEFAULT_CSV;
}

function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

function findColumnIndex(headers, candidates) {
  const normalized = headers.map((h) => h.replace(/^\uFEFF/, '').trim());
  for (const key of candidates) {
    const idx = normalized.findIndex((h) => h === key || h.includes(key));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]);
  const nameIdx = findColumnIndex(header, NAME_HEADERS);
  const kindIdx = findColumnIndex(header, KIND_HEADERS);

  const names = new Set();

  const addName = (raw) => {
    const name = String(raw || '').trim();
    if (!name) return;
    if (!name.includes('초등학교') && nameIdx < 0) return;
    names.add(name);
  };

  if (nameIdx < 0) {
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const cell = cols[0]?.trim();
      if (cell && cell.includes('초등학교')) addName(cell);
    }
    return [...names];
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (kindIdx >= 0) {
      const kind = String(cols[kindIdx] || '');
      if (!kind.includes('초등학교')) continue;
    }
    addName(cols[nameIdx]);
  }

  return [...names].sort((a, b) => a.localeCompare(b, 'ko'));
}

function main() {
  const csvPath = resolveCsvPath();

  if (!existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    console.error('');
    console.error('Place your school list CSV at: data/elementary-schools.csv');
    console.error('Or keep 학교기본정보_*.csv in the project root (교육부 학교기본정보)');
    process.exit(1);
  }

  const text = readCsvText(csvPath);
  const schools = parseCsv(text);

  if (schools.length < 100) {
    console.warn(
      `Warning: only ${schools.length} schools parsed. Check CSV columns or 초등학교 filter.`
    );
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(schools), 'utf8');
  console.log(`Read ${csvPath}`);
  console.log(`Wrote ${schools.length} schools → ${OUT_PATH}`);
}

main();
