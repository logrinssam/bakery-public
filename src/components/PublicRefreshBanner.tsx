import React, { useState } from 'react';
import { Cloud, RefreshCw, X } from 'lucide-react';
import { isGithubPagesPublic } from '../lib/isGithubPages';
import { isFirebaseConfigured } from '../lib/firebase';

const DISMISS_KEY = 'pixel_bakery_public_refresh_dismiss_v1';

/**
 * GitHub Pages — 예전 탭·캐시 사용자에게 새로고침 안내 (클라우드 저장·전당 활성화).
 */
export function PublicRefreshBanner() {
  const urgent = !isFirebaseConfigured();
  const [dismissed, setDismissed] = useState(() => {
    if (urgent) return false;
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [reloading, setReloading] = useState(false);

  if (!isGithubPagesPublic() || dismissed) return null;

  const reload = () => {
    if (reloading) return;
    setReloading(true);
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', String(Date.now()));
    window.location.replace(url.toString());
  };

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <>
      <div className="h-[72px] sm:h-[64px] shrink-0" aria-hidden />
      <div
        role="alert"
        className={`fixed top-0 left-0 right-0 z-[100] border-b-4 shadow-lg ${
          urgent
            ? 'bg-[#C0392B] border-[#F4D03F] text-white'
            : 'bg-[#1B5E20] border-[#F4D03F] text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left">
          <p className="font-sans text-xs sm:text-sm font-bold break-keep leading-snug flex items-start sm:items-center gap-2">
            <Cloud className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" aria-hidden />
            <span>
              {urgent ? (
                <>
                  <span className="text-[#F4D03F]">새로고침이 필요해요!</span> 지금 화면은 예전 버전이라
                  기록·명예의 전당이 서버에 저장되지 않아요.
                </>
              ) : (
                <>
                  <span className="text-[#F4D03F]">클라우드 저장이 켜졌어요.</span> 새로고침 후{' '}
                  <b>학교·이름·PIN 저장</b>을 꼭 해 주세요. (50단계면 명예의 전당 등록도!)
                </>
              )}
              <span className="block mt-0.5 text-[10px] sm:text-[11px] font-semibold text-white/90">
                진행도·골드·도감은 사라지지 않아요.
              </span>
            </span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={reload}
              disabled={reloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF85A1] border-2 border-[#F4D03F] text-white font-sans font-black text-xs sm:text-sm hover:bg-[#FF9FB6] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
              {reloading ? '적용 중…' : '새로고침'}
            </button>
            {!urgent && (
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 border-white/40 text-white/90 hover:bg-white/10 cursor-pointer"
                aria-label="배너 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
