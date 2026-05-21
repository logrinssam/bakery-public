import React, { useEffect, useState } from 'react';
import { PixelSprite } from './PixelSprite';
import { Sparkles, ShoppingBag, Flame } from 'lucide-react';

interface InteractiveBackingProps {
  onAnimationComplete: () => void;
  breadIndex: number;
  breadName: string;
  earnedGold: number;
  isVip?: boolean;
}

export const InteractiveBacking: React.FC<InteractiveBackingProps> = ({
  onAnimationComplete,
  breadIndex,
  breadName,
  earnedGold,
  isVip = false
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'heating' | 'unveiling'>('heating');

  useEffect(() => {
    // Progressive heater progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase('unveiling');
          return 100;
        }
        return p + 4; // takes ~1s
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleFinish = () => {
    onAnimationComplete();
  };

  return (
    <div className="fixed inset-0 bg-[#3E2723]/85 z-55 flex items-center justify-center p-4 backdrop-blur-xs select-none" id="baking-animation-modal">
      <div 
        className="w-full max-w-sm bg-white border-8 border-[#5D4037] rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center relative gap-6 text-center animate-scale-in"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Ribbon decoration */}
        <div className="absolute -top-7 px-6 py-2 bg-[#FF85A1] border-4 border-[#5D4037] text-white font-display font-black text-xs tracking-wider rounded-full shadow-md">
          🔥 BAKERY OVEN ACTIVATED
        </div>

        {phase === 'heating' ? (
          <div className="w-full flex flex-col items-center gap-4 py-4">
            {/* Visual heating cooker */}
            <div className="relative w-40 h-40 bg-[#5D4037] rounded-2xl border-4 border-[#3E2723] shadow-inner flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-[#FF85A1]/35 to-transparent animate-pulse" />
              
              {/* Oven window showing active heating of the specific bread */}
              <div className="relative opacity-70 scale-90 blur-[1px]">
                <PixelSprite type="bread" index={breadIndex} size={84} />
              </div>
              
              {/* Glowing furnace grids */}
              <div className="absolute bottom-3 left-4 right-4 flex gap-1 items-center justify-between z-10">
                <Flame className="w-5 h-5 text-[#FF85A1] animate-bounce" />
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono font-black text-white text-center tracking-wider px-1">200℃ HEATING</span>
                </div>
                <Flame className="w-5 h-5 text-[#FF85A1] animate-bounce" style={{ animationDelay: '150ms' }} />
              </div>
            </div>

            {/* Instruction bar */}
            <div className="w-full mt-2 text-[#5D4037]">
              <div className="flex justify-between items-center text-xs font-mono font-black mb-1.5">
                <span>반죽 이스트 발효 중...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-5 bg-[#FFF4E0] border-4 border-[#5D4037] rounded-full overflow-hidden shadow-inner p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF85A1] to-[#F4D03F] transition-all ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <p className="font-sans text-xs text-[#5D4037] font-bold animate-pulse leading-relaxed">
              비와 백분율 배합 공식에 맞춰 촉매 반응 진행 중...
            </p>
          </div>
        ) : (
          /* Unveiled Baked Dessert Reward display */
          <div className="w-full flex flex-col items-center gap-4 py-2 text-[#5D4037]">
            <div className="relative flex items-center justify-center p-6 bg-[#FFF4E0] rounded-full border-4 border-[#5D4037] shadow-inner">
              <PixelSprite type="bread" index={breadIndex} size={112} className="relative z-10 scale-110" />
              <div className="absolute inset-0 rounded-full bg-[#F4D03F]/25 blur-md animate-ping" />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <h3 className="font-sans text-[#FF85A1] text-xs font-black uppercase tracking-wider">New Dessert Baked!</h3>
              <h2 className="font-display font-black text-[#5D4037] text-2xl sm:text-3xl">{breadName}</h2>
              <p className="font-sans text-stone-600 text-[11px] font-semibold max-w-[240px] leading-relaxed mx-auto">
                정밀한 6학년 수학 비와 비율 기준에 완벽히 부합하게 소킹되어 아주 달콤하게 탄생했습니다!
              </p>
            </div>

            {/* Gold Earning Board */}
            <div className={`border-4 border-[#5D4037] px-6 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 mt-2 shadow-md w-full ${
              isVip ? 'bg-[#FFFDE7] border-yellow-500 animate-pulse ring-4 ring-[#F4D03F]/20' : 'bg-[#FFF4E0]'
            }`}>
              <div className="flex items-center justify-center gap-3">
                <PixelSprite type="ui" index={0} size={32} />
                <span className="font-display text-xl font-black text-[#5D4037]">+{earnedGold} 골드 획득!</span>
              </div>
              {isVip && (
                <span className="text-[10px] text-[#A0522D] font-sans font-black bg-[#FFF3E0] px-3 py-1 rounded-full border border-dashed border-yellow-600 animate-bounce">
                  👑 VIP 단골 포상금 300% 잭팟 적용!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="mt-4 btn-pixel-pink px-8 py-4 rounded-2xl cursor-pointer w-full text-white flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>진열대 진열 및 지도 가기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
