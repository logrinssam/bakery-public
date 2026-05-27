const SCHOOLS_JSON_URL = `${import.meta.env.BASE_URL}data/elementary-schools.json`;
const MANUAL_SCHOOL_MAX_LEN = 30;
const SCHOOLS_CACHE_KEY = 'pixel_bakery_elementary_schools_v1';

let cachedSchools: string[] | null = null;

export function normalizeSchoolName(name: string): string {
  return name.trim().replace(/\s+/g, '');
}

function readCache(): string[] | null {
  try {
    const raw = localStorage.getItem(SCHOOLS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 100 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(schools: string[]): void {
  try {
    localStorage.setItem(SCHOOLS_CACHE_KEY, JSON.stringify(schools));
  } catch {
    // ignore quota errors
  }
}

/** Loads schools from bundled JSON (built from CSV). No live API calls. */
export async function loadElementarySchools(): Promise<string[]> {
  if (cachedSchools && cachedSchools.length > 0) return cachedSchools;

  const fromMemoryCache = readCache();
  if (fromMemoryCache) {
    cachedSchools = fromMemoryCache;
    return fromMemoryCache;
  }

  try {
    const res = await fetch(SCHOOLS_JSON_URL);
    if (res.ok) {
      const list = (await res.json()) as string[];
      if (Array.isArray(list) && list.length > 100) {
        cachedSchools = list;
        writeCache(list);
        return list;
      }
    }
  } catch {
    // fall through
  }

  cachedSchools = [];
  return [];
}

export function resolveSchoolName(input: string, schools: string[]): string | null {
  const normalized = normalizeSchoolName(input);
  if (!normalized || schools.length === 0) return null;
  return schools.find((s) => normalizeSchoolName(s) === normalized) ?? null;
}

/** 목록에 없을 때 직접 입력 (공식 학교명, "초등" 포함) */
export function sanitizeManualSchoolName(name: string): string {
  return name
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>&]/g, '')
    .trim()
    .slice(0, MANUAL_SCHOOL_MAX_LEN);
}

export function isValidManualSchoolName(name: string): boolean {
  const normalized = normalizeSchoolName(name);
  if (normalized.length < 4 || normalized.length > MANUAL_SCHOOL_MAX_LEN) return false;
  if (!normalized.includes('초등')) return false;
  if (!/[가-힣]/.test(normalized)) return false;
  return true;
}

/** 목록 일치 우선; allowManual이면 검증된 직접 입력 허용 */
export function resolveSchoolForInput(
  input: string,
  schools: string[],
  allowManual: boolean
): string | null {
  if (schools.length > 0) {
    const fromList = resolveSchoolName(input, schools);
    if (fromList) return fromList;
  }
  if (!allowManual) return null;
  const cleaned = sanitizeManualSchoolName(input);
  if (!isValidManualSchoolName(cleaned)) return null;
  return cleaned;
}

export function searchSchools(query: string, schools: string[], limit = 12): string[] {
  const q = normalizeSchoolName(query);
  if (!q || schools.length === 0) return [];
  return schools.filter((s) => normalizeSchoolName(s).includes(q)).slice(0, limit);
}
