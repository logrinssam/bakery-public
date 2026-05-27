/** 새 빌드 안내 — sessionStorage (탭 단위) */
export const UPDATE_ACK_STORAGE_KEY = 'pixel_bakery_update_ack_v1';
/** 캐시 때문에 reload가 실패할 때 반복 새로고침 방지 */
export const UPDATE_RELOAD_ATTEMPTS_KEY = 'pixel_bakery_update_reload_attempts_v1';

export function getAcknowledgedBuildId(): string | null {
  try {
    return sessionStorage.getItem(UPDATE_ACK_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function acknowledgeBuildId(buildId: string): void {
  try {
    sessionStorage.setItem(UPDATE_ACK_STORAGE_KEY, buildId);
  } catch {
    // ignore
  }
}

export function clearUpdateAck(): void {
  try {
    sessionStorage.removeItem(UPDATE_ACK_STORAGE_KEY);
    sessionStorage.removeItem(UPDATE_RELOAD_ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}

export function getReloadAttempts(): number {
  try {
    return Number(sessionStorage.getItem(UPDATE_RELOAD_ATTEMPTS_KEY) || '0');
  } catch {
    return 0;
  }
}

export function incrementReloadAttempts(): number {
  const next = getReloadAttempts() + 1;
  try {
    sessionStorage.setItem(UPDATE_RELOAD_ATTEMPTS_KEY, String(next));
  } catch {
    // ignore
  }
  return next;
}

export function shouldShowUpdatePrompt(remoteBuildId: string, localBuildId: string): boolean {
  if (!remoteBuildId || remoteBuildId === localBuildId) return false;
  // 확인(새로고침) 전에 ack 하면 캐시가 남아도 배너가 사라져 버림 → 반드시 버전이 맞을 때만 ack
  return true;
}
