import React from 'react';
import { Equipment } from '../types';
import { UPGRADE_ITEMS } from '../data/equipment';
import { PixelSprite } from './PixelSprite';
import { ShoppingBag, ArrowLeft, Check, TrendingUp } from 'lucide-react';

interface CabinetScreenProps {
  gold: number;
  unlockedIds: number[];
  onPurchase: (item: Equipment) => void;
  onBack: () => void;
}

export const CabinetScreen: React.FC<CabinetScreenProps> = ({
  gold,
  unlockedIds,
  onPurchase,
  onBack
}) => {
  return (
    <div className="w-full flex flex-col gap-8 text-[#5D4037]" id="baker-upgrade-cabinet-panel">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-dashed border-[#FFF4E0] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-pixel-yellow p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="상점으로 돌아가기"
            id="back-to-shop-button"
          >
            <ArrowLeft className="w-5 h-5 text-[#5D4037]" />
          </button>
          <div>
            <h1 className="font-display font-black text-[#5D4037] text-2xl md:text-3xl tracking-tight">🛠️ 베이커리 연구 아카데미</h1>
            <p className="font-sans text-xs text-stone-500 font-medium mt-1">같은 종류 장비는 최고급 1개만 골드 보너스에 적용됩니다. 특수 효과(힌트·콤보 보호)는 보유한 장비마다 따로 작동해요!</p>
          </div>
        </div>

        {/* Account Gold Balance Dashboard */}
        <div className="bg-[#FFF4E0] border-4 border-[#5D4037] rounded-2xl px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-3 sm:gap-4 self-stretch md:self-auto shadow-md">
          <PixelSprite type="ui" index={0} size={32} className="sm:w-10 sm:h-10" />
          <div>
            <span className="font-sans text-[9px] sm:text-[10px] text-[#5D4037] font-bold block leading-none uppercase tracking-wider">My Wallet Gold</span>
            <span className="font-display text-xl sm:text-2xl font-black text-[#5D4037] tracking-tight">{gold.toLocaleString()} G</span>
          </div>
        </div>
      </div>

      {/* Equipment Upgrade Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="upgrades-shelf-cabinet">
        {UPGRADE_ITEMS.map((item) => {
          const isOwned = unlockedIds.includes(item.id);
          const canAfford = gold >= item.price;
          
          return (
            <div 
              key={item.id} 
              className={`border-4 rounded-3xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all hover:scale-[1.02] bg-white ${
                isOwned 
                  ? 'border-[#66BB6A] bg-[#66BB6A]/5 shadow-sm' 
                  : 'border-[#5D4037] hover:shadow-md'
              }`}
              id={`equipment-card-${item.id}`}
            >
              {/* Product Info Segment */}
              <div className="flex gap-3 items-start">
                <div className="relative p-1.5 border-2 border-[#5D4037] rounded-xl bg-[#FFF4E0] shrink-0">
                  <PixelSprite type="equipment" index={item.spriteIndex} size={52} />
                  {isOwned && (
                    <div className="absolute -top-2 -right-2 bg-[#66BB6A] border-2 border-[#5D4037] text-white p-0.5 rounded-full shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  <span className={`text-[9px] font-sans font-black uppercase px-2 py-0.5 rounded-md self-start border border-[#5D4037]/20 ${
                    item.category === 'oven' ? 'bg-[#FF85A1]/20 text-[#D64566]' :
                    item.category === 'rolling_pin' ? 'bg-blue-100 text-blue-900' :
                    item.category === 'measuring_cup' ? 'bg-purple-100 text-purple-900' :
                    item.category === 'scale' ? 'bg-teal-100 text-teal-900' :
                    'bg-[#FFF4E0] text-[#5D4037]'
                  }`}>
                    {item.category === 'oven' && '🔥 가열 오븐'}
                    {item.category === 'rolling_pin' && '🪵 치댐 밀대'}
                    {item.category === 'measuring_cup' && '📐 정량 계량컵'}
                    {item.category === 'scale' && '⚖️ 전자 저울'}
                    {item.category === 'other' && '✨ 매장 장식'}
                    {item.category === 'calculation' && '📟 연산 디바이스'}
                  </span>
                  
                  <h3 className="font-display font-black text-[#5D4037] text-xs sm:text-sm leading-snug break-keep tooltip" title={item.name}>
                    {item.name}
                  </h3>
                </div>
              </div>

              {/* Product Narrative */}
              <div className="flex-1 flex flex-col gap-2.5 justify-between">
                <p className="font-sans text-[11px] text-stone-600 font-medium leading-relaxed min-h-[44px]">
                  {item.description}
                </p>

                {/* Passive Buff Effect Description */}
                <div className="bg-[#FFF4E0]/40 border-2 border-dashed border-[#5D4037]/20 rounded-xl p-2.5 flex gap-2 items-center">
                  <TrendingUp className="w-4 h-4 text-[#66BB6A] shrink-0" />
                  <div className="font-sans text-[10px] text-[#5D4037] font-extrabold leading-tight">
                    {item.effectText}
                  </div>
                </div>
              </div>

              {/* Product Action Button */}
              <div className="border-t-2 border-dashed border-[#5D4037]/10 pt-3.5 flex items-center justify-between mt-1">
                {isOwned ? (
                  <div className="w-full flex items-center justify-center gap-1 py-2.5 bg-[#66BB6A]/10 text-[#2E7D32] border-2 border-[#66BB6A] rounded-xl font-sans text-[11px] font-black shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    보너스 버프 활성 적용 중
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-display font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      canAfford
                        ? 'btn-pixel-pink text-white hover:scale-[1.02] shadow-sm'
                        : 'bg-stone-50 text-stone-400 border-2 border-stone-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>구매: </span>
                    <span className="font-mono font-black text-[11px]">{(item.price).toLocaleString()} G</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
