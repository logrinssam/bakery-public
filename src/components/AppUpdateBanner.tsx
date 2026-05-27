import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

declare const __APP_BUILD_ID__: string;

const POLL_MS = 60_000;
const VERSION_URL = `${import.meta.env.BASE_URL}version.json`;

/**
 * 배포 후 탭을 연 채 두면 옛 JS가 돌아감 → version.json 폴링으로 새 빌드 알림.
 */
export function AppUpdateBanner() {
  const [updateReady, setUpdateReady] = useState(false);
  const [reloading, setReloading] = useState(false);

  const applyUpdate = () => {
    if (reloading) return;
    setReloading(true);
    window.location.reload();
  };

  const checkForUpdate = useCallback(async () => {
    if (import.meta.env.DEV) return;
    try {
      const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { id?: string };
      if (data.id && data.id !== __APP_BUILD_ID__) {
        setUpdateReady(true);
      }
    } catch {
      // 네트워크 오류 — 무시
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    void checkForUpdate();
    const intervalId = window.setInterval(() => void checkForUpdate(), POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkForUpdate();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [checkForUpdate]);

  if (!updateReady) return null;

  return (
    <>
    <div className="h-[64px] sm:h-[56px] shrink-0" aria-hidden />
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-[100] bg-[#5D4037] border-b-4 border-[#F4D03F] text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left">
        <p className="font-sans text-xs sm:text-sm font-bold break-keep leading-snug">
          🔄 게임이 업데이트되었어요.{' '}
          <span className="text-[#F4D03F]">확인</span>을 누르면 새로고침됩니다.
          <span className="block mt-0.5 text-[10px] sm:text-[11px] font-semibold text-[#FFF4E0]/95">
            진행·골드·도감은 사라지지 않아요. (엔터 버그로 단계만 튄 경우 맞춰 드려요)
          </span>
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          disabled={reloading}
          className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FF85A1] border-2 border-[#F4D03F] text-white font-sans font-black text-xs sm:text-sm hover:bg-[#FF9FB6] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
        >
          <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
          {reloading ? '적용 중…' : '확인'}
        </button>
      </div>
    </div>
    </>
  );
}
