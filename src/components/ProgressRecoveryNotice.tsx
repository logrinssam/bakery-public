import React from 'react';
import { Sparkles } from 'lucide-react';

export type ProgressRecoveryInfo = {
  /** 버그·보정 전 지도에 보이던 단계 */
  previousStage: number;
  /** 실제 플레이 기준으로 맞춘 단계 */
  correctedStage: number;
  starsEarned: number;
};

interface ProgressRecoveryNoticeProps {
  info: ProgressRecoveryInfo;
  onDismiss: () => void;
}

/**
 * 엔터 연타 버그 등으로 stageProgress만 튄 경우 — 진행 소실이 아님을 안내.
 */
export const ProgressRecoveryNotice: React.FC<ProgressRecoveryNoticeProps> = ({
  info,
  onDismiss,
}) => (
  <div
    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#3E2723]/70 backdrop-blur-xs"
    role="dialog"
    aria-labelledby="progress-recovery-title"
    aria-modal="true"
  >
    <div className="w-full max-w-md bg-white border-4 border-[#5D4037] rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-4 text-[#5D4037]">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-[#FF85A1]" />
        <h2 id="progress-recovery-title" className="font-display font-black text-lg sm:text-xl">
          진행이 사라진 게 아니에요!
        </h2>
      </div>

      <p className="font-sans text-sm font-semibold leading-relaxed break-keep text-stone-700">
        예전 버전 <b>엔터 연타 버그</b> 때문에 <b>지도 단계 숫자만</b> 실제보다 많이 올라가 있었어요.
        선생님이 고친 뒤, <b>실제로 깬 단계</b>에 맞게 다시 맞춰 두었습니다.
      </p>

      <div className="bg-[#FFF4E0] border-2 border-dashed border-[#5D4037]/30 rounded-2xl px-4 py-3 font-sans text-sm space-y-2">
        <p className="font-bold">
          ⭐ 실제로 클리어한 단계: <span className="text-[#D64566]">{info.starsEarned}단계</span>
          {info.starsEarned > 0 ? ' (그대로 유지!)' : ''}
        </p>
        <p className="text-stone-600 text-xs sm:text-sm">
          지도 표시: {info.previousStage}단계 →{' '}
          <span className="font-black text-[#5D4037]">{info.correctedStage}단계</span>로 바로잡음
        </p>
        <p className="text-[11px] text-stone-500 font-semibold break-keep">
          골드·도감·닉네임·비밀번호 이어하기는 그대로예요. 걱정하지 마세요!
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="w-full btn-pixel-pink text-white py-3.5 rounded-2xl font-display font-black text-sm cursor-pointer"
      >
        알겠어요, 계속할게요!
      </button>
    </div>
  </div>
);
