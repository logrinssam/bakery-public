import type { HallRecord, PlayerStats } from '../types';
import { normalizeSchoolName } from '../data/schools';

/** 전당 한마디에서 숨길 키워드 (불만·욕설·게임 해명 등) */
const HIDDEN_COMMENT_KEYWORDS = [
  '버그',
  '버그있',
  '렉',
  '렉걸',
  '사기',
  '망했',
  '쓰레기',
  'ㅅㅂ',
  '시발',
  '병신',
  '바보',
  '멍청',
];

export function isInappropriateHallComment(comment: string): boolean {
  const normalized = comment.trim().toLowerCase();
  if (!normalized) return false;
  return HIDDEN_COMMENT_KEYWORDS.some((word) => normalized.includes(word.toLowerCase()));
}

export function shouldHideHallComment(rec: Pick<HallRecord, 'comment' | 'commentHidden'>): boolean {
  if (rec.commentHidden) return true;
  return isInappropriateHallComment(rec.comment);
}

export function isOwnHallRecord(rec: HallRecord, stats: PlayerStats): boolean {
  const name = stats.hallName?.trim();
  const school = stats.hallSchool?.trim();
  if (!name || !school) return false;
  const recSchool = (rec.schoolName || '').trim();
  return rec.name === name && normalizeSchoolName(recSchool) === normalizeSchoolName(school);
}

export function findOwnHallRecord(records: HallRecord[], stats: PlayerStats): HallRecord | undefined {
  return records.find((rec) => isOwnHallRecord(rec, stats));
}

export function needsHallCommentRevision(records: HallRecord[], stats: PlayerStats): boolean {
  if (!stats.hallOfFameRegistered) return false;
  const own = findOwnHallRecord(records, stats);
  if (own && shouldHideHallComment(own)) return true;
  if (stats.hallComment && isInappropriateHallComment(stats.hallComment)) return true;
  return false;
}
