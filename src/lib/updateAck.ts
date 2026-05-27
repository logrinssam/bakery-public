/** 같은 배포(빌드) 안내를 확인한 뒤 배너·alert 반복 방지 */
export const UPDATE_ACK_STORAGE_KEY = 'pixel_bakery_update_ack_v1';

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

export function shouldShowUpdatePrompt(remoteBuildId: string, localBuildId: string): boolean {
  if (!remoteBuildId || remoteBuildId === localBuildId) return false;
  return getAcknowledgedBuildId() !== remoteBuildId;
}
