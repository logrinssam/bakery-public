const SCHOOLS_JSON_URL = '/data/elementary-schools.json';
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

export function searchSchools(query: string, schools: string[], limit = 12): string[] {
  const q = normalizeSchoolName(query);
  if (!q || schools.length === 0) return [];
  return schools.filter((s) => normalizeSchoolName(s).includes(q)).slice(0, limit);
}
