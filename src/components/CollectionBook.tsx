import React, { useState } from 'react';
import { PixelSprite, BREADS_METADATA } from './PixelSprite';
import { ArrowLeft, BookOpen, Star, HelpCircle, Trophy, Sparkles, UserCheck, Check } from 'lucide-react';

interface CollectionBookProps {
  unlockedBreadIndices: number[];
  encounteredMascotNames: string[];
  stageProgress: number;
  onBack: () => void;
}

// Full Customer Mascot Meta list for encyclopedia mapping
const MASCOT_ENTRIES = [
  {
    name: '도토리 다람이 (Squirrely)',
    emoji: '🐿️',
    description: '눈망울이 초롱초롱한 귀여운 아기 다람쥐. 도토리 대신 고소하고 미온적인 설탕 쿠키 반죽과 비의 성질 개념을 탐구하러 찾아옵니다.',
    unlockedClue: '기본 상점 (St.1~10) 쿠키 스테이지 진행 중 고확률 출몰',
    isVip: false,
    baseGreeting: '도토리 대신 달콤한 걸 먹으러 왔어요!'
  },
  {
    name: '달콤 곰돌이 (Honey Bear)',
    emoji: '🐻',
    description: '듬직하고 자상한 숲속의 대표 미식가. 언제나 배가 고파 꼬르륵 소리를 내며, 파스텔 컵케이크와 소량의 성분 비율 공부를 열심히 합니다.',
    unlockedClue: '컵케이크 매장 (St.11~15) 진행 중 고확률 출몰',
    isVip: false,
    baseGreeting: '안녕! 배에서 꼬르륵 소리가 나서 왔어.'
  },
  {
    name: '새침 아기여우 (Ruby Fox)',
    emoji: '🦊',
    description: '조금 도도하지만 빵 한 입에 사르르 녹아버리는 영리한 여우. 숲속 은반 은하 무도회에 바칠 특제 빵 케이크 배합 검수를 기대합니다.',
    unlockedClue: '케이크 대회장 (St.16~20) 진행 중 고확률 출몰',
    isVip: false,
    baseGreeting: '우리 숲속 무도회에 쓸 특제 디저트야!'
  },
  {
    name: '솜털 토끼 (Fluffy Bunny)',
    emoji: '🐰',
    description: '깡충깡충 소동을 피우는 수줍음 많은 토끼. 멜론 빵 소보로 비스킷 냄새를 환상적으로 맡아내며 백분율 가격 인하 판매를 계산하기 좋아합니다.',
    unlockedClue: '도넛 상점·베이커리 팝업 (St.21~25, 31~40) 출몰',
    isVip: false,
    baseGreeting: '멜론 빵 냄새를 맡고 껑충껑충 뛰어왔어요!'
  },
  {
    name: '우주 아기냥이 (Star Kitten)',
    emoji: '🐱',
    description: '별빛을 타고 주방에 조용히 안착한 천재 아기 고양이. 시럽 농도의 정확성을 돋보기로 정밀 분석하며, 오븐 열량 비율에 까다로운 미식 기준을 제시합니다.',
    unlockedClue: '마카롱 및 전설의 매장 (St.26~30, 46~50) 출몰',
    isVip: false,
    baseGreeting: '야옹~ 황금 레시피의 농도가 헷갈려.'
  },
  {
    name: '행복 파랑새 (Bluebird)',
    emoji: '🐦',
    description: '숲속 해피 뉴스를 전하는 우편배달 파랑새. 날갯짓하며 신선한 베이킹 소식과 상큼한 도넛을 주문하며 비와 비율 배합을 함께 정밀 연수합니다.',
    unlockedClue: '도넛 상점 (St.21~25) 진행 중 고확률 출몰',
    isVip: false,
    baseGreeting: '숲속 해피 뉴스를 전하다가 배고파 날아왔어요!'
  },
  {
    name: '꼬마 고슴도치 (Hedgehog)',
    emoji: '🦔',
    description: '동글동글 몸을 마는 부끄럼쟁이 귀요미 고슴도치. 뾰족한 가시 위에 부드러운 컵케이크를 얹고 가며 백분율 단원 지식을 귀엽게 공부합니다.',
    unlockedClue: '컵케이크 상점 (St.11~15) 진행 중 중확률 출몰',
    isVip: false,
    baseGreeting: '가시 사이에 달콤꿀 컵케이크를 소담하게 담아갈래요!'
  },
  {
    name: '부지런 비버 (Beaver)',
    emoji: '🦫',
    description: '하루 종일 통나무 보와 수로를 설계하고 만드는 공학 에이스 비버. 정교한 비 비례 공법을 빵 반죽 배합에 적용하며 기운을 채웁니다.',
    unlockedClue: '베이커리 팝업 (St.31~40) 진행 중 중확률 출몰',
    isVip: false,
    baseGreeting: '숲속 보를 건설하다 힘이 다 빠졌어요! 고칼로리 롤파이 주세요!'
  },
  {
    name: '다정 코알라 (Koala)',
    emoji: '🐨',
    description: '나무 위에서 느릿느릿 살짝 졸던 다정한 마스코트. 백분율 요금 인하율과 소수 비율을 기가 막히게 풀 때마다 볼 빨개지며 기뻐합니다.',
    unlockedClue: '기본 상점 (St.1~10) 및 왕실 상정 진행 중 돌발 방문',
    isVip: false,
    baseGreeting: '유칼립투스 잎만 먹다 디저트가 당겨 느긋이 내려왔어요.'
  },
  {
    name: '밤하늘 부엉이 (Owl)',
    emoji: '🦉',
    description: '달이 뜨는 야간에만 소리 없이 날아드는 기품 있는 숲속 멘토 부엉이. 백분율 수학의 명쾌하고 아름다운 비밀 배합 비율에 존경의 찬사를 보냅니다.',
    unlockedClue: '명예의 매장 (St.46~50) 진행 시 고확률 야간 기습 주문',
    isVip: false,
    baseGreeting: '수학의 가치를 아름다운 빵에 비례 연성하셨군요.'
  },
  {
    name: '👑 사자 궁전 폐하 (King Leo)',
    emoji: '🦁',
    description: '왕궁 비례 연성회의 수장. 엄격하고 진중한 카리스마를 가졌지만 달콤한 마카롱에는 정직합니다. 왕실 비법에 통과할 때마다 300% 포상금을 보장합니다.',
    unlockedClue: '연구소에서 고급 연구 장비를 획득하면 35% 확률로 등극 출몰!',
    isVip: true,
    baseGreeting: '왕실에서 그대의 비와 비율 소문을 듣고 행차했도다. 3배 골드를 하사하마!'
  },
  {
    name: '🦄 별빛 아기 유니콘 (Astro Unicorn)',
    emoji: '🦄',
    description: '오색 수채화 구름에서 정제된 슈가 파우더와 비율의 백분율 극의를 깨닫고자 강림한 성스러운 영수. 우주 별가루 골드 주머니를 전격 하사합니다.',
    unlockedClue: '정밀 전자저울 등 로열 기물 보유 시 가마 연구 중 돌발 방문!',
    isVip: true,
    baseGreeting: '오색 은하수 백분율 황금 비율을 연마하러 왔어요! 3배 골드를 드릴게요! ✨'
  },
  {
    name: '🎩 귀족 젠틀맨 판다 (Lord Panda)',
    emoji: '🐼',
    description: '정장 실크햇과 단안경이 어울리는 대부호 회원. 품위 높은 요리를 평가하며 완벽 정밀 마스킹 배합을 달성하면 3배의 넉넉한 팁 봉투를 수여합니다.',
    unlockedClue: '왕실 베이커리 (St.41~45) 이상 개점 시 최고 단골 특별 정기 순찰!',
    isVip: true,
    baseGreeting: '최고 회원으로서 정답 비율을 검증해주면 특별 포상 3배 팁을 올립니다.'
  }
];

// Helper to check where a dessert indexes falls under to guide the player (1:1 mapped to 1~50 stages)
const getDessertUnlockClue = (index: number) => {
  const stageId = index + 1;
  if (stageId >= 1 && stageId <= 10) return `St.${stageId} 쿠키 상점`;
  if (stageId >= 11 && stageId <= 15) return `St.${stageId} 컵케이크 상점`;
  if (stageId >= 16 && stageId <= 20) return `St.${stageId} 케이크 상점`;
  if (stageId >= 21 && stageId <= 25) return `St.${stageId} 도넛 상점`;
  if (stageId >= 26 && stageId <= 30) return `St.${stageId} 마카롱 상점`;
  if (stageId >= 31 && stageId <= 40) return `St.${stageId} 베이커리 팝업`;
  if (stageId >= 41 && stageId <= 45) return `St.${stageId} 왕실 베이커리`;
  return `St.${stageId} 천재 파티셰 명예의 베이커리`;
};

export const CollectionBook: React.FC<CollectionBookProps> = ({
  unlockedBreadIndices = [],
  encounteredMascotNames = [],
  stageProgress,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'breads' | 'mascots'>('breads');

  const totalBreads = 50; // Constrained to 50 stages
  // Make sure we filter out elements that might be undefined or duplicates
  const uniqueUnlockedBreads = Array.from(new Set(unlockedBreadIndices.filter(i => i >= 0 && i < totalBreads)));
  const breadCompletionPercent = Math.round((uniqueUnlockedBreads.length / totalBreads) * 100);

  const totalMascots = MASCOT_ENTRIES.length;
  const uniqueEncounteredMascots = MASCOT_ENTRIES.filter(m => 
    encounteredMascotNames.some(name => name.includes(m.name.split(' (')[0]))
  );
  const mascotCompletionPercent = Math.round((uniqueEncounteredMascots.length / totalMascots) * 100);

  return (
    <div className="w-full flex flex-col gap-6 text-[#5D4037] pb-8 animate-fade-in" id="baker-encyclopedia-root">
      
      {/* Header bar segments */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-dashed border-[#FFF4E0] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-pixel-yellow p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="상점으로 돌아가기"
            id="collection-back-button"
          >
            <ArrowLeft className="w-5 h-5 text-[#5D4037]" />
          </button>
          <div>
            <h1 className="font-display font-black text-[#5D4037] text-2xl md:text-3xl tracking-tight flex items-center gap-2">
              📖 숲속 베이커리&단골 도감
            </h1>
            <p className="font-sans text-xs text-stone-500 font-medium mt-1">
              정확한 수학 비율 계산 배합으로 구워낸 명품 빵들과 당신의 주방을 찾아왔던 정겨운 단골 손님 컬렉션입니다.
            </p>
          </div>
        </div>

        {/* Global Achievements status block */}
        <div className="flex gap-4 self-stretch md:self-auto">
          <div className="bg-[#FFF4E0] border-4 border-[#5D4037] rounded-2xl px-5 py-2.5 flex items-center gap-3 flex-1 md:flex-initial shadow-sm">
            <Trophy className="w-5 h-5 text-yellow-600 animate-bounce" />
            <div>
              <span className="font-sans text-[9px] text-[#A0522D] font-black uppercase">Dessert Recipe Book</span>
              <span className="font-display text-lg font-black block leading-none">{uniqueUnlockedBreads.length} / {totalBreads}종 ({breadCompletionPercent}%)</span>
            </div>
          </div>
          <div className="bg-[#EAFDF8] border-4 border-[#5D4037] rounded-2xl px-5 py-2.5 flex items-center gap-3 flex-1 md:flex-initial shadow-sm">
            <Sparkles className="w-5 h-5 text-[#2ECC71]" />
            <div>
              <span className="font-sans text-[9px] text-[#2E7D32] font-black uppercase">Regular Mascot Book</span>
              <span className="font-display text-lg font-black block leading-none">{uniqueEncounteredMascots.length} / {totalMascots}명 ({mascotCompletionPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Encyclopedia Screen Tabs Selector */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center md:justify-start" id="encyclopedia-tab-headers">
        <button
          type="button"
          onClick={() => setActiveTab('breads')}
          className={`px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
            activeTab === 'breads'
              ? 'bg-[#FF85A1] text-white border-[#5D4037] shadow-md scale-102'
              : 'bg-white text-stone-600 border-stone-250 hover:bg-stone-50'
          }`}
        >
          🧁 디저트 도감 ({uniqueUnlockedBreads.length}종 발견)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mascots')}
          className={`px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
            activeTab === 'mascots'
              ? 'bg-[#F4D03F] text-[#5D4037] border-[#5D4037] shadow-md scale-102'
              : 'bg-white text-stone-600 border-stone-250 hover:bg-stone-50'
          }`}
        >
          🦊 숲속 단골손님 도감 ({uniqueEncounteredMascots.length}명 만남)
        </button>
      </div>

      {/* TAB A: Desserts (Breads) */}
      {activeTab === 'breads' && (
        <div className="flex flex-col gap-6" id="unlocked-desserts-encyclopedia-grid">
          
          {/* Achievement Details & Progress Gauge Section */}
          <div className="bg-[#FFFDF9] border-4 border-[#5D4037] rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-display font-black text-lg text-[#5D4037]">🎨 디저트 명예의 도서 등재 등급</h2>
                <p className="font-sans text-xs text-stone-500 font-medium">당일 바른 비율 반죽 완료 시마다 새로운 디저트가 활성화됩니다. 최종 50단계 스테이지 정복과 함께 50종 레시피 도감을 완성해보세요!</p>
              </div>
              <div className="flex items-center gap-2.5 font-sans font-bold text-xs bg-[#FFF4E0] border border-dashed border-[#5D4037]/35 rounded-xl px-4 py-2">
                <span>🏆 컬렉션 랭킹 성적달성도:</span>
                <span className="font-display font-black text-sm text-[#FF5722]">
                  {breadCompletionPercent >= 80 ? '🏅 전설의 오븐 마스터 (80%+)' :
                   breadCompletionPercent >= 50 ? '🥈 명품 백분율 수석 파티셰 (50%+)' :
                   breadCompletionPercent >= 20 ? '🥉 성실한 초보 제빵사 (20%+)' :
                   '🥚 견습 주방 보조 요정 (0%+)'}
                </span>
              </div>
            </div>

            {/* Micro Progress Bar Gauge */}
            <div className="w-full h-4.5 bg-stone-100 border-2 border-[#5D4037] rounded-full mt-4 overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-pink-400 to-[#FF85A1] transition-all duration-700" 
                style={{ width: `${breadCompletionPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-black text-[#5D4037]">
                DESSERT ACHIEVEMENT CLASSIFIED: {breadCompletionPercent}% UNLOCKED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" id="dessert-masterlist-bento">
            {BREADS_METADATA.slice(0, 50).map((dessert, dIdx) => {
              const isUnlocked = unlockedBreadIndices.includes(dIdx);
              const clueText = getDessertUnlockClue(dIdx);
              
              return (
                <div 
                  key={dIdx} 
                  className={`border-4 rounded-2xl p-4 flex flex-col items-center text-center gap-3.5 transition-all ${
                    isUnlocked 
                      ? 'border-[#5D4037] bg-white shadow-sm hover:scale-[1.04] hover:shadow-md' 
                      : 'border-[#5D4037]/30 bg-stone-100 opacity-65 grayscale select-none'
                  }`}
                  id={`encyclopedia-item-${dIdx}`}
                  title={isUnlocked ? `${dessert.name}: ${dessert.desc}` : '아직 발견되지 않은 미지의 디저트입니다.'}
                >
                  <div className="relative">
                    <PixelSprite 
                      type="bread" 
                      index={dIdx} 
                      size={64} 
                      className={isUnlocked ? '' : 'brightness-50'} 
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center text-xl bg-black/10 rounded-lg">
                        🔒
                      </div>
                    )}
                  </div>

                  <div className="w-full flex-1 flex flex-col justify-between gap-1 leading-normal">
                    <div>
                      <span className="font-mono text-[9.5px] font-black text-stone-400 block tracking-wider leading-none">
                        No.{(dIdx + 1).toString().padStart(2, '0')}
                      </span>
                      <h3 className="font-display font-black text-[#5D4037] text-xs sm:text-sm mt-1 mb-0.5 line-clamp-1">
                        {isUnlocked ? dessert.name : '????????'}
                      </h3>
                    </div>

                    <p className="font-sans text-[10px] leading-tight text-stone-500 line-clamp-2 min-h-[30px] font-medium grow">
                      {isUnlocked ? dessert.desc : `정확한 황금 부피로 반죽을 구워 교과 도식을 완성하세요.`}
                    </p>

                    <span className={`text-[8.5px] font-mono font-black border uppercase px-1.5 py-0.5 mt-1.5 rounded-md inline-block self-center ${
                      isUnlocked 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : 'bg-stone-200 text-stone-500 border-stone-300'
                    }`}>
                      {isUnlocked ? '✓ 등재완료' : clueText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: Customers (Mascots) */}
      {activeTab === 'mascots' && (
        <div className="flex flex-col gap-6" id="companion-animals-encyclopedia-grid">
          
          {/* Mascot Progress Box */}
          <div className="bg-[#FFFDF9] border-4 border-[#5D4037] rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-display font-black text-lg text-[#5D4037]">🦊 정겨운 숲속 베이커리 1급 단골록</h2>
                <p className="font-sans text-xs text-stone-500 font-medium">당신의 매장을 찾아 다양한 비율 문제를 출제해주신 소중한 단골들의 프로필 목록입니다.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#E1F5FE] border border-sky-300 px-4 py-2 rounded-xl text-xs font-sans font-bold text-sky-800">
                <span>👑 우수 VIP 스카웃 단골율:</span>
                <span className="font-display font-black text-sm text-sky-950">{uniqueEncounteredMascots.length} / {totalMascots}명 ({mascotCompletionPercent}%)</span>
              </div>
            </div>

            {/* Micro Progress Bar Gauge for Customer encounter */}
            <div className="w-full h-4.5 bg-stone-100 border-2 border-[#5D4037] rounded-full mt-4 overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 transition-all duration-700" 
                style={{ width: `${mascotCompletionPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-black text-[#5D4037]">
                CUSTOMER RELATIONSHIP INDEX: {mascotCompletionPercent}% ESTABLISHED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="customer-met-profiles-list">
            {MASCOT_ENTRIES.map((mascot, mIdx) => {
              // Extract raw name to bypass bracket additions like Lord Panda -> Lord Panda
              const rawName = mascot.name.split(' (')[0];
              const isMet = encounteredMascotNames.some(name => name.includes(rawName));

              return (
                <div 
                  key={mIdx} 
                  className={`border-4 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 transition-all relative overflow-hidden ${
                    isMet 
                      ? mascot.isVip 
                        ? 'border-yellow-500 bg-[#FFFDE7] shadow-md hover:scale-[1.01]' 
                        : 'border-[#5D4037] bg-white shadow-sm hover:scale-[1.01]' 
                      : 'border-dashed border-stone-300 bg-stone-50 opacity-60'
                  }`}
                  id={`mascot-profile-card-${mIdx}`}
                >
                  
                  {/* VIP crown sash */}
                  {mascot.isVip && (
                    <div className="absolute top-3 -right-12 bg-yellow-400 border border-yellow-600 text-[8px] font-black text-[#5D4037] px-12 py-1 rotate-45 select-none shadow-sm uppercase tracking-wide">
                      Royal VIP
                    </div>
                  )}

                  {/* Animal visual badge representor */}
                  <div className="flex flex-col items-center gap-2.5 shrink-0">
                    <div className={`w-20 h-20 rounded-2xl border-4 flex items-center justify-center relative select-none ${
                      isMet 
                        ? mascot.isVip ? 'bg-[#FFF9C4] border-yellow-500' : 'bg-[#FFF4E0] border-[#5D4037]' 
                        : 'bg-stone-200 border-stone-400'
                    }`}>
                      <span className={`text-5xl filter drop-shadow-md ${isMet ? '' : 'brightness-50 grayscale'}`}>
                        {mascot.emoji}
                      </span>
                      {!isMet && (
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-black bg-black/15 text-white bg-opacity-40 rounded-xl">
                          🔒 Lock
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-sans font-black uppercase text-center border ${
                      isMet 
                        ? mascot.isVip 
                          ? 'bg-yellow-400/20 text-[#B8860B] border-yellow-500' 
                          : 'bg-[#FFF4E0] text-[#5D4037] border-[#5D4037]/25'
                        : 'bg-stone-200 text-stone-500 border-stone-300'
                    }`}>
                      {isMet ? mascot.isVip ? '👑 로열 VIP 단골' : '🦊 일반 정기단골' : '❓ 숲속 미만남'}
                    </span>
                  </div>

                  {/* Character stats information */}
                  <div className="flex-1 flex flex-col justify-between gap-3 text-left">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-display font-black text-[#5D4037] text-lg">
                          {isMet ? mascot.name : '?????????? (미확인)'}
                        </h3>
                        {isMet && (
                          <span className="text-[10px] text-[#A0522D] bg-[#FFF3E0] px-2 py-0.5 rounded-full border border-orange-200 font-bold flex items-center gap-0.5">
                            <UserCheck className="w-3 h-3 text-emerald-600" /> 단골등록 완
                          </span>
                        )}
                      </div>

                      {/* Famous dialogue balloon quote of character */}
                      <p className="font-sans italic text-[11.5px] leading-relaxed text-stone-600 mt-1.5 p-2 border-l-2 border-amber-300 bg-amber-500/5 rounded-r-lg font-medium">
                        {isMet ? `“${mascot.baseGreeting}”` : '“아직 매장의 인기도가 낮아 소문을 듣고 찾아오지 못했습니다.”'}
                      </p>

                      {/* Detailed narrative lore of character */}
                      <p className="font-sans text-[11px] leading-relaxed text-stone-500 font-semibold mt-2.5">
                        {isMet ? mascot.description : '이 단골 손님의 정보와 좋아하는 레시피 성향은 빵집 매장에서 무작위로 처음 만났을 때 전격 활성화됩니다.'}
                      </p>
                    </div>

                    {/* How to unlock clues or encounter location indicators */}
                    <div className="border-t border-dashed border-[#5D4037]/15 pt-3 flex flex-col gap-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-[#E67E22] bg-[#FFF3E0] px-1.5 py-0.5 rounded">발견 루트 Clue</span>
                        <span className="text-stone-500 font-bold">{mascot.unlockedClue}</span>
                      </div>
                      
                      {mascot.isVip && (
                        <div className="flex items-center gap-1.5 text-amber-700 font-black animate-pulse">
                          <span>✨ 우대 수혜 혜택:</span>
                          <span className="bg-yellow-50 px-2 py-0.5 border border-yellow-200 rounded font-sans text-[9px] uppercase font-black">
                            👑 베이킹 대성공 통과 성공 시 영양 골드 +300% (3배 잭팟!) 즉시 현장 가동 적용
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Encyclopedia footer metrics display */}
      <div className="mt-6 flex flex-col items-center justify-center p-6 border-4 border-dashed border-[#FFF4E0] bg-[#FFF9C4]/15 rounded-3xl" id="collection-conclusions-box">
        <Sparkles className="w-8 h-8 text-yellow-600 mb-1.5 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="font-display font-black text-[#5D4037] text-base">🏅 매 장 컬 렉 션 달 성 훈 장 점 수</span>
        <p className="font-sans text-[11px] text-stone-500 font-bold text-center mt-1 shrink max-w-lg leading-relaxed">
          베이커리 레벨과 인기도는 비와 비율 오븐 조작에 기반합니다. 오답 수호 가드를 장비하고 콤보가 유지될수록, 고난도 왕실 레시피가 개점되며 전설 등급 빵들이 자동으로 도감에 등록됩니다!
        </p>
      </div>

    </div>
  );
};
