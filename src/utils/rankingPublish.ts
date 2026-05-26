import type { HallRecord } from '../types';

const TZ = 'Asia/Seoul';
const MS_HOUR = 60 * 60 * 1000;

/** KST — ranking slot alignment & interval growth start */
const RANKING_ANCHOR_KST = '2026-05-22T00:00:00+09:00';

/** Starts at 1h; +1h every 7 days; capped */
const BASE_INTERVAL_HOURS = 1;
const INTERVAL_GROWTH_PER_WEEK_HOURS = 1;
const MAX_INTERVAL_HOURS = 12;
const GROWTH_PERIOD_DAYS = 7;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function kstParts(date: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute'))
  };
}

function toKSTDate(year: number, month: number, day: number, hour: number, minute = 0, second = 0): Date {
  return new Date(
    `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}+09:00`
  );
}

export function getRankingAnchor(): Date {
  return new Date(RANKING_ANCHOR_KST);
}

function getDaysSinceAnchor(now: Date): number {
  const anchor = getRankingAnchor();
  const a = kstParts(anchor);
  const n = kstParts(now);
  const anchorMidnight = toKSTDate(a.year, a.month, a.day, 0, 0, 0).getTime();
  const nowMidnight = toKSTDate(n.year, n.month, n.day, 0, 0, 0).getTime();
  return Math.max(0, Math.floor((nowMidnight - anchorMidnight) / (24 * MS_HOUR)));
}

/** Current publish interval in hours (1 → 2 → 3 … every 7 days, max 12h). */
export function getRankingPublishIntervalHours(now = new Date()): number {
  const weeks = Math.floor(getDaysSinceAnchor(now) / GROWTH_PERIOD_DAYS);
  return Math.min(
    MAX_INTERVAL_HOURS,
    BASE_INTERVAL_HOURS + weeks * INTERVAL_GROWTH_PER_WEEK_HOURS
  );
}

export function getRankingPublishIntervalMs(now = new Date()): number {
  return getRankingPublishIntervalHours(now) * MS_HOUR;
}

/** Human-readable cadence for UI. */
export function getRankingIntervalDescription(now = new Date()): string {
  const h = getRankingPublishIntervalHours(now);
  return h === 1 ? '1시간마다' : `${h}시간마다`;
}

/** Most recent publish slot (KST) that rankings reflect. */
export function getRankingPublishCutoff(now = new Date()): Date {
  const anchorMs = getRankingAnchor().getTime();
  const intervalMs = getRankingPublishIntervalMs(now);
  const elapsed = now.getTime() - anchorMs;
  if (elapsed < 0) return getRankingAnchor();
  const slot = Math.floor(elapsed / intervalMs);
  return new Date(anchorMs + slot * intervalMs);
}

/** Next slot when ranking updates. */
export function getNextRankingPublishAt(now = new Date()): Date {
  return new Date(getRankingPublishCutoff(now).getTime() + getRankingPublishIntervalMs(now));
}

export function getRecordRegisteredAt(record: HallRecord): Date {
  if (record.createdAt) {
    const t = new Date(record.createdAt);
    if (!isNaN(t.getTime())) return t;
  }
  const idNum = Number(record.id);
  if (!isNaN(idNum) && idNum > 1_000_000_000_000) return new Date(idNum);
  if (record.date) {
    const [y, m, d] = record.date.split('-').map(Number);
    if (y && m && d) return toKSTDate(y, m, d, 23, 59, 59);
  }
  return new Date(0);
}

export function filterRecordsForPublishedRanking(records: HallRecord[], now = new Date()): HallRecord[] {
  const cutoff = getRankingPublishCutoff(now);
  return records.filter((r) => getRecordRegisteredAt(r).getTime() <= cutoff.getTime());
}

export function formatRankingPublishLabel(now = new Date()): string {
  const cutoff = getRankingPublishCutoff(now);
  const label = cutoff.toLocaleString('ko-KR', {
    timeZone: TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${label} 기준 공개 랭킹 (${getRankingIntervalDescription(now)} 갱신)`;
}

export function formatNextRankingPublishLabel(now = new Date()): string {
  const next = getNextRankingPublishAt(now);
  const label = next.toLocaleString('ko-KR', {
    timeZone: TZ,
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `다음 공개: ${label}`;
}
