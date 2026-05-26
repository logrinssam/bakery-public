import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, ShopType, MathQuestion, Stage, Equipment, QuestionCategory } from './types';
import { STAGES, generateQuestionsForStage, getQuestionsPerStage } from './data/stages';
import { UPGRADE_ITEMS, getActiveGoldMultiplierBoost } from './data/equipment';
import { PixelSprite, BREADS_METADATA } from './components/PixelSprite';
import { MathQuestionBox } from './components/MathQuestionBox';
import { CabinetScreen } from './components/CabinetScreen';
import { HallOfFame } from './components/HallOfFame';
import { InteractiveBacking } from './components/InteractiveBacking';
import { CollectionBook } from './components/CollectionBook';
import {
  clearAllGameStorage,
  parsePlayerStats,
  sanitizeDisplayText,
  STORAGE_KEYS,
  INPUT_LIMITS,
} from './lib/safeStorage';
import {
  loadSfxMutedPreference,
  playPixelSFX,
  primePixelSFX,
  setSfxMuted,
} from './lib/pixelSfx';
import { recordSchoolUser, recordSchoolVisit, recordSessionVisit } from './services/firebaseVisits';
import { ensureAnonSignedIn } from './services/firebaseAnon';
import { loadPinSave, savePinStats } from './services/firebasePinSave';
import { sha256Hex } from './lib/cryptoHash';
import { isFirebaseConfigured } from './lib/firebase';
import { 
  Trophy, 
  Map, 
  ShoppingBag, 
  Sparkles, 
  Lightbulb, 
  CheckCircle, 
  RotateCcw, 
  UserCheck, 
  Home, 
  Compass, 
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Volume2,
  VolumeX
} from 'lucide-react';

const INITIAL_STATS: PlayerStats = {
  stageProgress: 1, // Start at stage 1
  gold: 150, // Starter funds
  streakCount: 0,
  highestStreak: 0,
  starsEarned: 0,
  correctAnswersCount: 0,
  totalAnswersCount: 0,
  purchasedEquipmentIds: [],
  hallOfFameRegistered: false,
  unlockedBreadIndices: [0],
  encounteredMascotNames: ['도토리 다람이']
};

// Animal mascot configurations for immersive, cute woodland ordering dialogue
const MASCOTS = [
  { name: '도토리 다람이 (Squirrely)', emoji: '🐿️', greeting: '도토리 대신 달콤한 걸 먹으러 왔어요! 6학년 비율 문제를 해결해 줄래요?' },
  { name: '달콤 곰돌이 (Honey Bear)', emoji: '🐻', greeting: '안녕! 배에서 꼬르륵 소리가 나서 왔어. 혹시 이 요리 비를 알고 있니?' },
  { name: '새침 아기여우 (Ruby Fox)', emoji: '🦊', greeting: '우리 숲속 무도회에 쓸 특제 디저트야. 비율이 흐트러지지 않게 도와줘!' },
  { name: '솜털 토끼 (Fluffy Bunny)', emoji: '🐰', greeting: '멜론 빵 냄새를 맡고 껑충껑충 뛰어왔어요! 백분율 가격 할인이 궁금해요!' },
  { name: '우주 아기냥이 (Star Kitten)', emoji: '🐱', greeting: '야옹~ 황금 레시피의 농도가 헷갈려. 정밀하게 측정해 주라!' },
  { name: '행복 파랑새 (Bluebird)', emoji: '🐦', greeting: '숲속 해피 뉴스를 전하다가 배고파 날아왔어요! 달콤한 도넛 비율 알려주세요!' },
  { name: '꼬마 고슴도치 (Hedgehog)', emoji: '🦔', greeting: '뾰족뾰족 가시 사이에 달콤꿀 컵케이크를 소담하게 담아 가고 싶어요!' },
  { name: '부지런 비버 (Beaver)', emoji: '🦫', greeting: '숲속 보를 건설하다 힘이 다 빠졌어요! 고칼로리 롤케이크 비와 백분율 계산을 부탁해요!' },
  { name: '다정 코알라 (Koala)', emoji: '🐨', greeting: '유칼립투스 잎만 먹다가 지루해서 왔어요... 부드러운 쿠키를 먹고 힘낼래요!' },
  { name: '밤하늘 부엉이 (Owl)', emoji: '🦉', greeting: '지혜로운 숲속 부엉이입니다. 황금 비율 문제를 멋지게 해결하면 지헤의 빵을 구워주겠죠?' }
];

// Royal VIP mascot configurations for higher-end custom bonuses
const VIP_MASCOTS = [
  { name: '👑 사자 궁전 폐하 (King Leo)', emoji: '🦁', greeting: '왕실에서 그대의 비와 비율 소문을 듣고 행차했도다. 정밀 가공 배합 통과 시 3배 왕실 연성 골드를 하사하마!', isVip: true },
  { name: '🦄 별빛 아기 유니콘 (Astro Unicorn)', emoji: '🦄', greeting: '오색 은하수와 슈가 파우더의 신비로운 백분율 황금 비율을 연마하러 왔어요! 3배 골드를 뿌려드릴게요! ✨', isVip: true },
  { name: '🎩 귀족 젠틀맨 판다 (Lord Panda)', emoji: '🐼', greeting: '신사 최고 회원으로서 오늘 이 마카롱 배합 정답 비율을 검증해주면 특별 정답 포상으로 3배 팁 봉투를 올립니다.', isVip: true }
];

/** 로그인교실 메인(교실 목록) — 서브도메인 게임 공통 */
const PORTAL_HOME_URL = 'https://로그인교실.com';

/**
 * UI/그래픽 및 리소스 무단 복제·재배포 금지 (© 로그린쌤)
 * 이 고지는 화면 표시용이 아니라, 소스 내 저작권 표기용입니다.
 */
const COPYRIGHT_NOTICE = 'UI/그래픽 및 리소스 무단 복제·재배포 금지 (© 로그린쌤)';

import { loadElementarySchools, resolveSchoolName, searchSchools } from './data/schools';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [page, setPage] = useState<'intro' | 'map' | 'kitchen' | 'upgrades' | 'fame'>('intro');
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  
  // Kitchen state elements
  const [currentQuestions, setCurrentQuestions] = useState<MathQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isShieldTriggered, setIsShieldTriggered] = useState(false);
  
  // Backing animator state
  const [isBakingActive, setIsBakingActive] = useState(false);
  const [bakingBreadIndex, setBakingBreadIndex] = useState(0);
  const [bakingBreadName, setBakingBreadName] = useState('');
  const [earnedGoldThisQuestion, setEarnedGoldThisQuestion] = useState(0);

  // Mascot generator per question
  const [activeMascot, setActiveMascot] = useState<any>(MASCOTS[0]);

  const [sfxMuted, setSfxMutedState] = useState(false);

  const [showProfileGate, setShowProfileGate] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileSchoolQuery, setProfileSchoolQuery] = useState('');
  const [profilePin, setProfilePin] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [allowedSchools, setAllowedSchools] = useState<string[]>([]);
  const [schoolsReady, setSchoolsReady] = useState(false);

  const [pinSaveId, setPinSaveId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const saveTimerRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);

  // Load saved state on mount
  const sfxPrimedRef = useRef(false);

  useEffect(() => {
    setSfxMutedState(loadSfxMutedPreference());
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.gameSave);
      if (saved) {
        setStats(parsePlayerStats(JSON.parse(saved), INITIAL_STATS));
      }
    } catch {
      // safe fallback
    }

    try {
      const savedId = localStorage.getItem('pixel_bakery_pin_save_id_v1');
      if (savedId && savedId.length >= 32) setPinSaveId(savedId);
    } catch {
      // ignore
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    void ensureAnonSignedIn();
  }, []);

  useEffect(() => {
    if (!showProfileGate || schoolsReady) return;
    loadElementarySchools().then((list) => {
      setAllowedSchools(list);
      setSchoolsReady(true);
    });
  }, [showProfileGate, schoolsReady]);

  useEffect(() => {
    const primeOnce = () => {
      if (sfxPrimedRef.current) return;
      sfxPrimedRef.current = true;
      primePixelSFX();
    };
    window.addEventListener('pointerdown', primeOnce, { once: true });
    window.addEventListener('keydown', primeOnce, { once: true });
    return () => {
      window.removeEventListener('pointerdown', primeOnce);
      window.removeEventListener('keydown', primeOnce);
    };
  }, []);

  useEffect(() => {
    document.title = '픽셀 베이커리';
    recordSessionVisit();
  }, []);

  useEffect(() => {
    if (!stats.hallSchool) return;
    // best-effort school stats; ok if it fails
    void recordSchoolVisit(stats.hallSchool);
  }, [stats.hallSchool]);

  // Sync state to local storage whenever stats variable updates
  const saveStats = (newStats: PlayerStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEYS.gameSave, JSON.stringify(newStats));
    } catch {
      // safe fallback
    }

    if (pinSaveId) {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(async () => {
        try {
          setSyncStatus('saving');
          await ensureAnonSignedIn();
          await savePinStats(pinSaveId, newStats);
          if (newStats.hallSchool && newStats.hallName) {
            void recordSchoolUser(newStats.hallSchool, newStats.hallName, pinSaveId);
            void recordSchoolVisit(newStats.hallSchool);
          }
          setSyncStatus('idle');
        } catch {
          setSyncStatus('error');
        }
      }, 800);
    }
  };

  const handleStartGame = () => {
    primePixelSFX();
    if (!stats.hallName || !stats.hallSchool || !pinSaveId) {
      setProfileName(stats.hallName ?? '');
      setProfileSchoolQuery(stats.hallSchool ?? '');
      setProfilePin('');
      setProfileError(null);
      setShowProfileGate(true);
      return;
    }
    setPage('map');
  };

  const handleSaveProfile = async () => {
    const name = sanitizeDisplayText(profileName, INPUT_LIMITS.hallName);
    if (!name.trim()) {
      setProfileError('닉네임(이름)을 입력해 주세요.');
      return;
    }

    if (!schoolsReady || allowedSchools.length === 0) {
      setProfileError('학교 목록을 불러오는 중입니다. 잠시만 기다려 주세요.');
      return;
    }

    const resolved = resolveSchoolName(profileSchoolQuery, allowedSchools);
    if (!resolved) {
      setProfileError('학교 이름을 목록에서 정확히 선택해 주세요.');
      return;
    }

    const pin = profilePin.trim();
    if (!/^\d{4}$/.test(pin)) {
      setProfileError('비밀번호는 숫자 4자리로 입력해 주세요.');
      return;
    }

    setProfileError(null);
    setSyncStatus('loading');

    const rawKey = `${resolved}|${name}|${pin}`;
    const fullHash = await sha256Hex(rawKey);
    const saveId = fullHash.slice(0, 40);

    try {
      localStorage.setItem('pixel_bakery_pin_save_id_v1', saveId);
    } catch {
      // ignore quota
    }
    setPinSaveId(saveId);

    await ensureAnonSignedIn();

    try {
      const remote = await loadPinSave(saveId, INITIAL_STATS);
      const next = remote
        ? remote
        : {
            ...stats,
            hallName: name,
            hallSchool: resolved,
          };

      setStats(next);
      try {
        localStorage.setItem(STORAGE_KEYS.gameSave, JSON.stringify(next));
      } catch {
        // ignore quota
      }

      if (!remote) {
        await savePinStats(saveId, next);
      }

      void recordSchoolUser(resolved, name, saveId);
      void recordSchoolVisit(resolved);

      setSyncStatus('idle');
      setShowProfileGate(false);
      setPage('map');
    } catch {
      setSyncStatus('error');
      setProfileError('이어하기 데이터를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
    }
  };

  const handleResetGame = () => {
    if (window.confirm('정말로 게임을 처음부터 다시 시작하겠습니다? 구매한 모든 기구와 스테이지 진행률이 초기화됩니다.')) {
      saveStats(INITIAL_STATS);
      setPage('intro');
      setActiveStageId(null);
    }
  };

  const handleClearBrowserData = () => {
    if (
      window.confirm(
        '이 기기에 저장된 게임 진행과 명예의 전당 기록을 모두 삭제합니다. 공용 PC에서는 수업 후 실행해 주세요. 계속할까요?'
      )
    ) {
      clearAllGameStorage();
      saveStats(INITIAL_STATS);
      setPage('intro');
      setActiveStageId(null);
    }
  };

  const selectMascot = (stageId: number, qIndex: number, purchasedIds: number[]) => {
    const hasVipEquip = purchasedIds.includes(12) || purchasedIds.includes(13);
    if (hasVipEquip && Math.random() < 0.35) {
      const randIdx = Math.floor(Math.random() * VIP_MASCOTS.length);
      return VIP_MASCOTS[randIdx];
    }
    const randIdx = Math.floor(Math.random() * MASCOTS.length);
    return MASCOTS[randIdx];
  };

  const handleSelectStage = (stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) return;

    if (stage.requiredStars > stats.starsEarned) {
      alert(`이 스테이지에 들어가려면 최소 ${stage.requiredStars}개의 별(Stars)이 필요합니다. 이전 스테이지를 다시 풀어 별을 모아 보세요!`);
      return;
    }

    const stageQuestions = generateQuestionsForStage(stageId);
    setCurrentQuestions(stageQuestions);
    setCurrentQIndex(0);
    setActiveStageId(stageId);
    
    const initialMascot = selectMascot(stageId, 0, stats.purchasedEquipmentIds);
    setActiveMascot(initialMascot);

    // Save mascot to encountered book list
    const rawMascotName = initialMascot.name.split(' (')[0];
    const currentMascots = stats.encounteredMascotNames || [];
    const updatedMascots = currentMascots.includes(rawMascotName)
      ? currentMascots
      : [...currentMascots, rawMascotName];

    saveStats({
      ...stats,
      encounteredMascotNames: updatedMascots
    });
    
    setPage('kitchen');
  };

  const handleSubmitAnswer = (userAns: string) => {
    const question = currentQuestions[currentQIndex];
    if (!question) return;

    // Norm check and format conversion for verification
    const normalize = (str: string) => str.toLowerCase().replace(/개|원|%|\s/g, '').trim();
    const cleanUser = normalize(userAns);
    
    const isMatched = question.acceptableAnswers.some(ans => normalize(ans) === cleanUser) || 
                      normalize(question.correctAnswer) === cleanUser;

    if (isMatched) {
      playPixelSFX('correct');

      // Compute correct reward calculations
      const stage = STAGES.find(s => s.id === activeStageId)!;
      const baseGold = Math.round(50 * (stage.goldMultiplier || 1.0));
      
      const sumEquipmentBoost = getActiveGoldMultiplierBoost(stats.purchasedEquipmentIds);

      // VIP custom double chance 3x bonus multiplier
      const isVipCustomer = activeMascot && activeMascot.isVip;
      const vipMultiplier = isVipCustomer ? 3.0 : 1.0;

      const finalGold = Math.round(baseGold * (1 + sumEquipmentBoost) * vipMultiplier);
      const nextStreak = stats.streakCount + 1;
      const nextHighestStreak = Math.max(stats.highestStreak, nextStreak);

      if (nextStreak === 3 || nextStreak === 5) {
        playPixelSFX('streak');
      }

      // Determine correct representative bread sprite based on stage shop structure (1:1 align with stage 1~50 => index 0~49)
      const targetSpriteIndex = Math.max(0, Math.min(49, activeStageId - 1));

      // Track newly unlocked baked dessert
      const currentBreads = stats.unlockedBreadIndices || [];
      const updatedBreads = currentBreads.includes(targetSpriteIndex)
        ? currentBreads
        : [...currentBreads, targetSpriteIndex];

      const updatedStats: PlayerStats = {
        ...stats,
        gold: stats.gold + finalGold,
        starsEarned: stats.starsEarned + 1,
        streakCount: nextStreak,
        highestStreak: nextHighestStreak,
        correctAnswersCount: stats.correctAnswersCount + 1,
        totalAnswersCount: stats.totalAnswersCount + 1,
        unlockedBreadIndices: updatedBreads
      };

      // Trigger baking modal overlays
      setIsCorrect(true);
      setBakingBreadIndex(targetSpriteIndex);
      setBakingBreadName(BREADS_METADATA[targetSpriteIndex] ? BREADS_METADATA[targetSpriteIndex].name : stage.representativeMenu);
      setEarnedGoldThisQuestion(finalGold);

      setTimeout(() => {
        setIsCorrect(false);
        setIsBakingActive(true); // Fire cooking animation progression
        saveStats(updatedStats);
      }, 1200);

    } else {
      playPixelSFX('wrong');

      // Incorrect state trigger
      setIsWrong(true);
      
      // Shield protector: Golden Metal Pin (ID: 7) guards combo streak on a wrong answer
      const isShieldActive = stats.purchasedEquipmentIds.includes(7) && stats.streakCount > 0;
      
      const updatedStats: PlayerStats = {
        ...stats,
        streakCount: isShieldActive ? stats.streakCount : 0,
        totalAnswersCount: stats.totalAnswersCount + 1
      };
      saveStats(updatedStats);

      if (isShieldActive) {
        setIsShieldTriggered(true);
      }

      setTimeout(() => {
        setIsWrong(false);
        setIsShieldTriggered(false);
      }, 1500);
    }
  };

  // Helper helper to distribute sprites safely
  const iBetween = (min: number, max: number, seed: number) => {
    return min + (seed % (max - min + 1));
  };

  const handleBakingComplete = () => {
    setIsBakingActive(false);
    
    // Jump to next question or complete stage
    const questionsInStage = getQuestionsPerStage(activeStageId!);
    if (currentQIndex < questionsInStage - 1) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      const nextMascot = selectMascot(activeStageId!, nextIndex, stats.purchasedEquipmentIds);
      setActiveMascot(nextMascot);

      // Save mascot to encountered book list
      const rawMascotName = nextMascot.name.split(' (')[0];
      const currentMascots = stats.encounteredMascotNames || [];
      const updatedMascots = currentMascots.includes(rawMascotName)
        ? currentMascots
        : [...currentMascots, rawMascotName];

      saveStats({
        ...stats,
        encounteredMascotNames: updatedMascots
      });
    } else {
      // All stage questions solved — unlock progress
      const clearedStageId = activeStageId!;
      const currentProgress = stats.stageProgress;
      const nextProgress = clearedStageId === currentProgress ? Math.min(50, currentProgress + 1) : currentProgress;

      const completionBonus = clearedStageId * 100;
      playPixelSFX('clear');
      saveStats({
        ...stats,
        gold: stats.gold + completionBonus,
        stageProgress: nextProgress
      });

      alert(`🎉 축하합니다! ${clearedStageId}단계를 최고 실력으로 완료하고 단골 주문을 대성공했습니다!\n\n베이커리 매장 확장 축하 보너스: +${completionBonus} G 지급 완료!`);
      setPage('map');
      setActiveStageId(null);
    }
  };

  const handleBuyEquipment = (item: Equipment) => {
    if (stats.gold < item.price) {
      alert('골드가 부족합니다! 수학 주문 문제를 풀어 베이커리 기금을 더 마련하세요.');
      return;
    }

    playPixelSFX('upgrade');

    const updated: PlayerStats = {
      ...stats,
      gold: stats.gold - item.price,
      purchasedEquipmentIds: [...stats.purchasedEquipmentIds, item.id]
    };
    saveStats(updated);
    alert(`🛒 "${item.name}" 구매 완료! 주방에서 바로 사용할 수 있어요.`);
  };

  const handleToggleSfx = () => {
    const nextMuted = !sfxMuted;
    setSfxMutedState(nextMuted);
    setSfxMuted(nextMuted);
    if (!nextMuted) {
      playPixelSFX('correct');
    }
  };

  const handleRegisterToHallOfFame = (name: string, school: string, comment: string) => {
    saveStats({
      ...stats,
      hallOfFameRegistered: true,
      hallName: sanitizeDisplayText(name, INPUT_LIMITS.hallName),
      hallSchool: sanitizeDisplayText(school, INPUT_LIMITS.hallSchool),
      hallComment: sanitizeDisplayText(comment, INPUT_LIMITS.hallComment),
      hallDate: new Date().toISOString().split('T')[0]
    });
  };

  // Render Category Specific Aesthetic Shops Theme
  const getBackgroundStyles = (shopType: ShopType) => {
    // Elegant warm gradients representing cozy Korean custom pixel bakeries if backgrounds fallback
    if (shopType === ShopType.COOKIE) return 'from-amber-100 via-orange-50 to-amber-200';
    if (shopType === ShopType.CUPCAKE) return 'from-pink-100 via-rose-50 to-pink-200';
    if (shopType === ShopType.CAKE) return 'from-rose-100 via-orange-50 to-rose-200';
    if (shopType === ShopType.DONUT) return 'from-orange-100 via-amber-50 to-orange-200';
    if (shopType === ShopType.MACARON) return 'from-purple-100 via-fuchsia-50 to-violet-200';
    if (shopType === ShopType.MARKET) return 'from-stone-100 via-slate-50 to-stone-200';
    if (shopType === ShopType.ROYAL) return 'from-yellow-100 via-amber-50 to-yellow-200 border-yellow-300';
    return 'from-stone-900 via-slate-800 to-indigo-950'; // final celebration starlight
  };

  // Return background image node with fail resilient wrapper
  const renderBackgroundArtFile = (shopType: ShopType) => {
    let fileName = 'shop_cookie.png';
    if (shopType === ShopType.COOKIE) fileName = 'shop_cookie.png';
    else if (shopType === ShopType.CUPCAKE) fileName = 'shop_cupcake.png';
    else if (shopType === ShopType.CAKE) fileName = 'shop_cake.png';
    else if (shopType === ShopType.DONUT) fileName = 'shop_donut.png';
    else if (shopType === ShopType.MACARON) fileName = 'shop_macaron.png';
    else if (shopType === ShopType.MARKET) fileName = 'shop_market.png';
    else if (shopType === ShopType.ROYAL) fileName = 'shop_royal.png';
    else fileName = 'shop_final.png';

    const bgUrl = `/assets/shops/${fileName}`;

    return (
      <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${bgUrl}')` }}>
        <img src={bgUrl} alt="" className="hidden w-0 h-0" referrerPolicy="no-referrer" />
      </div>
    );
  };

  // Convert ShopType to readable text
  const getShopTypeKorean = (st: ShopType) => {
    switch (st) {
      case ShopType.COOKIE: return '쿠키 상점';
      case ShopType.CUPCAKE: return '컵케이크 상점';
      case ShopType.CAKE: return '케이크 상점';
      case ShopType.DONUT: return '도넛 상점';
      case ShopType.MACARON: return '마카롱 상점';
      case ShopType.MARKET: return '베이커리 팝업';
      case ShopType.ROYAL: return '왕실 베이커리';
      case ShopType.FINAL: return '천재 파티셰 명예의 베이커리';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-between font-sans selection:bg-brand-pink/30 scrollbar-thin">
      
      {/* 1. Global Navigation Bar */}
      <header className="w-full bg-[#5D4037] text-white border-b-4 border-[#F4D03F] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative select-none flex items-center justify-center shrink-0 hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-pink-500/15 rounded-full blur-md"></div>
              <PixelSprite type="bread" index={16} size={32} frameless={true} />
            </div>
            <div>
              <span className="font-display font-black text-white text-sm sm:text-base md:text-xl tracking-wider block leading-none">PIXEL BAKERY</span>
              <span className="hidden xs:block font-sans text-[9px] sm:text-[10px] text-[#F4D03F] font-black tracking-widest mt-1 block uppercase">6th Grade Math Tycoon</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 ml-auto flex-wrap sm:flex-nowrap">
            {pinSaveId && (
              <span
                className="shrink-0 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-white/15 bg-[#4E342E] text-white font-sans text-[9px] sm:text-[10px] font-bold tracking-tight opacity-90"
                title="이어하기: 학교/닉네임/비밀번호로 동기화"
              >
                이어하기{syncStatus === 'saving' ? ' · 저장중…' : syncStatus === 'loading' ? ' · 불러오는 중…' : ''}
              </span>
            )}

            <a
              href={PORTAL_HOME_URL}
              className="shrink-0 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-[#F4D03F]/50 bg-[#4E342E] text-[#F4D03F] font-sans text-[9px] sm:text-[10px] font-bold tracking-tight hover:bg-[#6D4C41] hover:border-[#F4D03F] transition-colors flex items-center gap-0.5 sm:gap-1 opacity-90 hover:opacity-100"
              title="로그인교실 교실 목록으로 이동"
            >
              <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">교실목록</span>
            </a>

            <button
              type="button"
              onPointerDown={primePixelSFX}
              onClick={handleToggleSfx}
              className={`shrink-0 p-1.5 sm:p-2 rounded-lg border-2 transition-colors flex items-center justify-center ${
                sfxMuted
                  ? 'border-white/30 bg-[#4E342E] text-white/50 hover:text-white/80'
                  : 'border-[#F4D03F] bg-[#4E342E] text-[#F4D03F] hover:bg-[#6D4C41]'
              }`}
              title={sfxMuted ? '효과음 켜기' : '효과음 끄기'}
              aria-label={sfxMuted ? '효과음 켜기' : '효과음 끄기'}
              aria-pressed={!sfxMuted}
            >
              {sfxMuted ? (
                <VolumeX className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
              )}
            </button>

            {/* Global Wallet Display */}
            <div className="bg-[#4E342E] border-2 border-[#F4D03F] rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-sm shrink-0">
              <PixelSprite type="ui" index={0} size={18} className="sm:w-6 sm:h-6" />
              <span className="font-display text-[#F4D03F] text-xs sm:text-base font-black tracking-wide">{stats.gold.toLocaleString()} G</span>
            </div>

            {/* Global level progress tracker */}
            <div className="hidden sm:flex bg-[#4E342E] border-2 border-white rounded-full px-3 py-1 items-center gap-1 shrink-0">
              <span className="font-sans text-[9px] text-white font-bold opacity-90">🏆 STARS:</span>
              <span className="font-display text-[11px] font-black text-white">{stats.starsEarned} 개</span>
            </div>

            {page !== 'intro' && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage('map')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 cursor-pointer transition-all font-sans text-[10px] sm:text-xs font-black tracking-tight flex items-center gap-0.5 sm:gap-1 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.3)] active:translate-y-[1.5px] active:shadow-none ${
                    page === 'map' 
                      ? 'bg-[#FF85A1] border-[#5D4037] text-white' 
                      : 'bg-white border-[#5D453E] text-[#5D4037] hover:bg-[#FFF4E0]'
                  }`}
                  title="스테이지 지도"
                >
                  <span>🗺️ 지도</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage('collection')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 cursor-pointer transition-all font-sans text-[10px] sm:text-xs font-black tracking-tight flex items-center gap-0.5 sm:gap-1 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.3)] active:translate-y-[1.5px] active:shadow-none ${
                    page === 'collection' 
                      ? 'bg-[#F4D03F] border-[#5D4037] text-[#5D4037]' 
                      : 'bg-white border-[#5D453E] text-[#5D4037] hover:bg-[#FFF4E0]'
                  }`}
                  title="베이커리&단골 도감"
                >
                  <span>📖 도감</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage('fame')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 cursor-pointer transition-all font-sans text-[10px] sm:text-xs font-black tracking-tight flex items-center gap-0.5 sm:gap-1 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.3)] active:translate-y-[1.5px] active:shadow-none ${
                    page === 'fame' 
                      ? 'bg-[#66BB6A] border-[#5D4037] text-white' 
                      : 'bg-white border-[#5D453E] text-[#5D4037] hover:bg-[#FFF4E0]'
                  }`}
                  title="명예 베이커리 목록"
                >
                  <span>🏆 랭킹</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Primary Page router */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-6">

        {showProfileGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
            <div className="w-full max-w-lg bg-white border-4 border-[#5D4037] rounded-3xl shadow-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display font-black text-[#5D4037] text-lg sm:text-xl">
                    🧑‍🍳 시작하기 전에, 닉네임/학교 입력
                  </h2>
                  <p className="mt-1 font-sans text-[11px] text-stone-600 font-semibold leading-relaxed break-keep">
                    수업에서 구분을 위해 <b>닉네임</b>과 <b>학교</b>를 먼저 입력해 주세요. 저장해야 게임을 시작할 수 있습니다.
                  </p>
                  <p className="mt-2 font-sans text-[10px] text-stone-500 font-semibold break-keep">
                    같은 <b>학교/닉네임/비밀번호</b>로 로그인하면 다른 컴퓨터에서도 이어서 할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="block">
                  <span className="font-sans text-xs text-stone-600 font-black">닉네임(이름)</span>
                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-[#5D4037]/30 focus:border-[#FF85A1] focus:outline-none font-sans font-bold text-sm"
                    placeholder="예: 6-3 수학왕"
                    maxLength={INPUT_LIMITS.hallName}
                    autoFocus
                  />
                </label>

                <label className="block">
                  <span className="font-sans text-xs text-stone-600 font-black">학교</span>
                  <input
                    value={profileSchoolQuery}
                    onChange={(e) => setProfileSchoolQuery(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-[#5D4037]/30 focus:border-[#FF85A1] focus:outline-none font-sans font-bold text-sm"
                    placeholder={schoolsReady ? '예: 서울○○초등학교' : '학교 목록 불러오는 중…'}
                    list="pb-school-datalist"
                    disabled={!schoolsReady}
                  />
                  <datalist id="pb-school-datalist">
                    {searchSchools(profileSchoolQuery, allowedSchools, 16).map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <p className="mt-1 text-[10px] font-sans text-stone-500 font-semibold break-keep">
                    학교 이름을 몇 글자 입력하면 목록이 뜹니다. 목록에서 선택해 주세요.
                  </p>
                </label>

                <label className="block">
                  <span className="font-sans text-xs text-stone-600 font-black">비밀번호 (숫자 4자리)</span>
                  <input
                    value={profilePin}
                    onChange={(e) => setProfilePin(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-[#5D4037]/30 focus:border-[#FF85A1] focus:outline-none font-sans font-bold text-sm tracking-widest"
                    placeholder="예: 0000"
                    inputMode="numeric"
                    maxLength={4}
                  />
                  <p className="mt-1 text-[10px] font-sans text-stone-500 font-semibold break-keep">
                    자신이 기억할 수 있는 숫자 4자리로 설정해주세요.
                  </p>
                </label>

                {profileError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 font-sans text-[11px] font-bold">
                    {profileError}
                  </div>
                )}

                <div className="mt-1 flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowProfileGate(false)}
                    className="px-4 py-2 rounded-xl border-2 border-stone-300 bg-stone-100 text-stone-700 font-sans font-black text-sm hover:bg-stone-200"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl border-2 border-[#5D4037] bg-[#FF85A1] text-white font-sans font-black text-sm hover:bg-[#FF9FB6]"
                  >
                    저장하고 시작
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Intro Start Page Screen */}
        {page === 'intro' && (
          <div className="w-full max-w-4xl mx-auto bg-white border-4 border-[#5D4037] rounded-3xl shadow-xl overflow-hidden p-4 xs:p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative" id="game-intro-card">
            <div className="absolute inset-0 bg-radial-gradient from-[#F4D03F]/10 to-transparent pointer-events-none" />
            
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left z-10">
              <span className="bg-[#FFF4E0] text-[#5D4037] border-2 border-[#5D4037] font-sans font-extrabold text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full inline-block self-center md:self-start tracking-wider uppercase">
                초등 수학 6학년 1학기 교과 과정 완벽 반영
              </span>
              
              <h1 className="font-display font-black text-[#5D4037] text-2xl sm:text-4xl lg:text-5xl tracking-wide leading-tight">
                맛있는 비율,<br/>
                <span className="text-[#FF85A1]">PIXEL BAKERY!</span>
              </h1>
              
              <p className="font-sans text-[#5D4037] font-semibold text-xs sm:text-sm md:text-base leading-relaxed break-keep">
                초등학교 6학년 수학 ‘비와 비율’ 단원을 완벽히 마스터하는 베이커리 수학 타이쿤 게임입니다. 베이커리를 찾아오는 귀여운 단골 숲속 마스코트들의 달콤한 주문 수량을 맞추고, 다양한 단원 문제를 해결하여 빵을 구워내세요. 얻은 골드로 베이커리 기구들을 업그레이드하여 명예 베이커리 목록에 올라보세요! ✨
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 mt-3 w-full justify-center md:justify-start" id="main-feature-navigation-group">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="relative px-4 sm:px-5 py-3 sm:py-3.5 bg-[#FF85A1] text-white border-4 border-[#5D4037] rounded-xl sm:rounded-2xl font-black text-sm sm:text-base tracking-tight flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_#5D4037] active:translate-y-[3px] active:shadow-[0_1px_0_#5D4037] transition-all hover:bg-[#FF9FB6] whitespace-nowrap"
                >
                  <span className="text-lg">🥐</span>
                  <span>베이커리 매장 열기</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white animate-pulse" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage('collection')}
                  className="relative px-4 sm:px-5 py-3 sm:py-3.5 bg-[#F4D03F] text-[#5D4037] border-4 border-[#5D4037] rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-tight flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_#5D4037] active:translate-y-[3px] active:shadow-[0_1px_0_#5D4037] transition-all hover:bg-[#FCE16C] whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>베이커리&단골 도감</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage('fame')}
                  className="relative px-4 sm:px-5 py-3 sm:py-3.5 bg-[#66BB6A] text-white border-4 border-[#5D4037] rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-tight flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_#5D4037] active:translate-y-[3px] active:shadow-[0_1px_0_#5D4037] transition-all hover:bg-[#81C784] whitespace-nowrap"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>명예 베이커리 목록</span>
                </button>
              </div>

              {stats.stageProgress > 1 && (
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 pt-3 border-t border-dashed border-stone-200 text-[11px] font-sans text-stone-500">
                  <span>현재 세이브 복원: <b>{stats.stageProgress}스테이지 진행 중</b> (⭐{stats.starsEarned} 스타)</span>
                  <button type="button" onClick={handleResetGame} className="text-red-600 underline font-semibold flex items-center gap-0.5 hover:text-red-700">
                    <RotateCcw className="w-3 h-3" /> 초기화
                  </button>
                  <button type="button" onClick={handleClearBrowserData} className="text-stone-500 underline font-semibold hover:text-stone-700">
                    이 기기 저장 데이터 전체 삭제
                  </button>
                </div>
              )}
            </div>

            {/* Aesthetic visual bakery grid */}
            <div className="w-full md:w-[320px] bg-[#FFF4E0] border-4 border-[#5D4037] rounded-3xl p-6 grid grid-cols-3 gap-3.5 shrink-0 relative shadow-[inset_0_4px_10px_rgba(93,64,55,0.15),4px_4px_0_rgba(93,64,55,0.1)]">
              {/* Wooden shelves highlight bands */}
              <div className="absolute top-[28%] left-4 right-4 h-2 bg-[#5D4037]/10 rounded-full blur-[1px] pointer-events-none" />
              <div className="absolute top-[63%] left-4 right-4 h-2 bg-[#5D4037]/10 rounded-full blur-[1px] pointer-events-none" />
              <div className="absolute top-[98%] left-4 right-4 h-2 bg-[#5D4037]/10 rounded-full blur-[1px] pointer-events-none" />
              
              <div className="absolute top-2 right-2 text-3xl opacity-30 select-none pointer-events-none">🥐</div>
              <div className="absolute bottom-2 left-2 text-3xl opacity-30 select-none pointer-events-none">🧁</div>
              
              {/* Row 1: 기본쿠키(0), 딸기 컵케이크(19), 초코 조각 케이크(27) */}
              <div className="flex items-center justify-center bg-white/95 border-3 border-[#5D4037] rounded-2xl aspect-square relative hover:-translate-y-1 hover:scale-105 transition-all shadow-[2px_2px_0px_rgba(93,64,55,1)] hover:shadow-[4px_4px_0px_rgba(93,64,55,1)] p-2">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF85A1]/10 to-transparent rounded-2xl pointer-events-none" />
                <PixelSprite type="bread" index={0} size={58} frameless={true} />
              </div>
              <div className="flex items-center justify-center bg-white/95 border-3 border-[#5D4037] rounded-2xl aspect-square relative hover:-translate-y-1 hover:scale-105 transition-all shadow-[2px_2px_0px_rgba(93,64,55,1)] hover:shadow-[4px_4px_0px_rgba(93,64,55,1)] p-2">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF85A1]/10 to-transparent rounded-2xl pointer-events-none" />
                <PixelSprite type="bread" index={19} size={58} frameless={true} />
              </div>
              <div className="flex items-center justify-center bg-white/95 border-3 border-[#5D4037] rounded-2xl aspect-square relative hover:-translate-y-1 hover:scale-105 transition-all shadow-[2px_2px_0px_rgba(93,64,55,1)] hover:shadow-[4px_4px_0px_rgba(93,64,55,1)] p-2">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF85A1]/10 to-transparent rounded-2xl pointer-events-none" />
                <PixelSprite type="bread" index={27} size={58} frameless={true} />
              </div>
              
              {/* Row 2: 초코도넛(32), 민트 마카롱(38), 로열 쉬폰 컵케이크(41) */}
              <div className="flex items-center justify-center bg-white/95 border-3 border-[#5D4037] rounded-2xl aspect-square relative hover:-translate-y-1 hover:scale-105 transition-all shadow-[2px_2px_0px_rgba(93,64,55,1)] hover:shadow-[4px_4px_0px_rgba(93,64,55,1)] p-2">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF85A1]/10 to-transparent rounded-2xl pointer-events-none" />
                <PixelSprite type="bread" index={32} size={58} frameless={true} />
              </div>
              <div className="flex items-center justify-center bg-white/95 border-3 border-[#5D4037] rounded-2xl aspect-square relative hover:-translate-y-1 hover:scale-105 transition-all shadow-[2px_2px_0px_rgba(93,64,55,1)] hover:shadow-[4px_4px_0px_rgba(93,64,55,1)] p-2">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF85A1]/10 to-transparent rounded-2xl pointer-events-none" />
                <PixelSprite type="bread" index={38} size={58} frameless={true} />
              </div>
              <div className="flex items-center justify-center bg-white/95 border-3 border-[#5D4037] rounded-2xl aspect-square relative hover:-translate-y-1 hover:scale-105 transition-all shadow-[2px_2px_0px_rgba(93,64,55,1)] hover:shadow-[4px_4px_0px_rgba(93,64,55,1)] p-2">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF85A1]/10 to-transparent rounded-2xl pointer-events-none" />
                <PixelSprite type="bread" index={41} size={58} frameless={true} />
              </div>
            </div>
          </div>
        )}

        {/* 2. Interactive Stage Map Hub */}
        {page === 'map' && (
          <div className="w-full flex flex-col gap-4 sm:gap-6" id="baker-stage-map-panel">
            
            {/* Quick dashboard cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
              <div className="bg-white border-4 border-[#5D4037] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="p-2.5 bg-[#FFF4E0] border-2 border-[#5D4037] rounded-xl text-yellow-700 shrink-0">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#5D4037]" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-sans text-[10px] text-stone-500 font-bold uppercase tracking-wider">Collected Stars</h4>
                    <p className="font-display text-sm sm:text-lg md:text-xl font-black text-[#5D4037] truncate">{stats.starsEarned} / 250 ⭐</p>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-sans font-extrabold text-[#5D4037] bg-[#FFF4E0] border-2 border-[#5D4037] px-2.5 py-1 rounded-full select-none shrink-0">목표: 180</span>
              </div>

              <div className="bg-white border-4 border-[#5D4037] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-[#FFF4E0] border-2 border-[#5D4037] rounded-xl text-orange-700 shrink-0">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF85A1] animate-pulse" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-sans text-[10px] text-stone-500 font-bold uppercase tracking-wider">Combo Streaks</h4>
                    <p className="font-display text-sm sm:text-lg md:text-xl font-black text-[#5D4037] truncate">{stats.streakCount} 콤보</p>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-sans font-extrabold text-[#5D4037] bg-[#FFF4E0] border-2 border-[#5D4037] px-2.5 py-1 rounded-full shrink-0">최대: {stats.highestStreak}</span>
              </div>

              <div className="bg-white border-4 border-[#5D4037] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-[#FFF4E0] border-2 border-[#5D4037] rounded-xl text-emerald-750 shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#5D4037]" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-sans text-[10px] text-stone-500 font-bold uppercase tracking-wider">도구 상점</h4>
                    <p className="font-display text-sm sm:text-lg md:text-xl font-black text-[#5D4037] truncate">{stats.purchasedEquipmentIds.length}종 도구 보유</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPage('upgrades')}
                  className="btn-pixel-pink px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs cursor-pointer shrink-0"
                >
                  도구 상점
                </button>
              </div>
            </div>

            {/* Grid Group Categories */}
            <div className="bg-white border-4 border-[#5D4037] rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 shadow-lg" id="stages-by-shops-shelf">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b-4 border-dashed border-[#FFF4E0] pb-4 sm:pb-6">
                <div>
                  <h2 className="font-display font-black text-[#5D4037] text-lg sm:text-xl md:text-2xl">🗺️ 50단계 베이커리 로드트립</h2>
                  <p className="font-sans font-medium text-[10px] sm:text-xs text-stone-500 mt-0.5">이전 스테이지를 해결하여 대성공 상태로 만들면 다음 상점이 순차 점검 가동됩니다.</p>
                </div>
                <div className="flex gap-2 flex-wrap w-full md:w-auto">
                  <button type="button" onClick={() => setPage('collection')} className="btn-pixel-pink px-3 py-2 rounded-xl text-[11px] sm:text-xs flex items-center gap-1 cursor-pointer text-white font-extrabold shadow-sm flex-1 md:flex-initial justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-white" /> 📖 도감 바로가기
                  </button>
                  <button type="button" onClick={() => setPage('fame')} className="btn-pixel-yellow px-3 py-2 rounded-xl text-[11px] sm:text-xs flex items-center gap-1 cursor-pointer flex-1 md:flex-initial justify-center">
                    <Trophy className="w-3.5 h-3.5 text-[#5D4037]" /> 명예의 전당 바로가기
                  </button>
                </div>
              </div>

              {/* Distribute 50 stages across 8 unique segmented cards */}
              {[
                { type: ShopType.COOKIE, label: '🍪 1~10단계: 쿠키 상점', bounds: [1, 10], colClass: 'from-amber-500/5 to-amber-700/5' },
                { type: ShopType.CUPCAKE, label: '🧁 11~15단계: 컵케이크 상점', bounds: [11, 15], colClass: 'from-pink-500/5 to-rose-700/5' },
                { type: ShopType.CAKE, label: '🍰 16~20단계: 케이크 상점', bounds: [16, 20], colClass: 'from-red-500/5 to-rose-700/5' },
                { type: ShopType.DONUT, label: '🍩 21~25단계: 도넛 상점', bounds: [21, 25], colClass: 'from-orange-500/5 to-amber-700/5' },
                { type: ShopType.MACARON, label: '🍬 26~30단계: 마카롱 상점', bounds: [26, 30], colClass: 'from-purple-500/5 to-fuchsia-700/5' },
                { type: ShopType.MARKET, label: '🏷️ 31~40단계: 베이커리 팝업', bounds: [31, 40], colClass: 'from-stone-500/5 to-slate-700/5' },
                { type: ShopType.ROYAL, label: '👑 41~45단계: 왕실 베이커리', bounds: [41, 45], colClass: 'from-yellow-500/5 to-amber-700/5' },
                { type: ShopType.FINAL, label: '🎆 46~50단계: 천재 파티셰 명예의 베이커리', bounds: [46, 50], colClass: 'from-slate-900/5 to-indigo-950/5' }
              ].map((group, gIdx) => (
                <div key={gIdx} className={`rounded-2xl p-3 sm:p-5 border-4 border-[#5D4037] bg-gradient-to-r ${group.colClass} shadow-xs`}>
                  <h3 className="font-display font-extrabold text-[#5D4037] text-xs sm:text-sm md:text-base mb-3 flex items-center justify-between border-b-2 border-dashed border-[#5D4037]/15 pb-2">
                    <span>{group.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-[#5D4037] opacity-80 font-black tracking-wider uppercase">{getShopTypeKorean(group.type)}</span>
                  </h3>

                  {/* Stage tiles bento layout */}
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3" id={`stage-group-tiles-${group.type}`}>
                    {STAGES.filter(s => s.id >= group.bounds[0] && s.id <= group.bounds[1]).map((st) => {
                      const isUnlocked = st.id <= stats.stageProgress;
                      const isCompleted = st.id < stats.stageProgress;
                      const needStars = st.requiredStars;
                      const starsLocked = stats.starsEarned < needStars;

                      return (
                        <button
                          key={st.id}
                          type="button"
                          disabled={!isUnlocked || starsLocked}
                          onClick={() => handleSelectStage(st.id)}
                          className={`min-h-[72px] sm:min-h-[82px] p-2 sm:p-3 rounded-xl border-2 flex flex-col justify-between text-left transition-all tracking-tight ${
                            isUnlocked && !starsLocked
                              ? isCompleted
                                ? 'bg-[#FFF4E0] border-[#5D4037] hover:bg-amber-100 text-[#5D4037] cursor-pointer shadow-sm hover:scale-[1.04] hover:-translate-y-0.5'
                                : 'bg-[#FF85A1] border-[#5D4037] text-white cursor-pointer shadow-md hover:scale-[1.04] hover:-translate-y-0.5 ring-2 ring-[#FF85A1]/25 font-extrabold'
                              : 'bg-stone-200/60 border-stone-300 text-stone-400 cursor-not-allowed opacity-60'
                          }`}
                          id={`stage-map-tile-${st.id}`}
                        >
                          <div className="flex justify-between items-center w-full leading-none">
                            <span className="font-mono text-[9px] sm:text-[10px] font-black">St.{st.id}</span>
                            {/* Star completion tags */}
                            {isCompleted ? (
                              <span className="text-[9px] sm:text-[10px]" title="완료함">⭐</span>
                            ) : st.id === stats.stageProgress ? (
                              <span className="text-[8px] sm:text-[9px] bg-[#66BB6A] text-white font-sans font-bold px-1 py-0.5 rounded leading-none">진행</span>
                            ) : (
                              <span className="text-[9px] sm:text-[10px]">🔒</span>
                            )}
                          </div>

                          <span className="font-sans text-[10px] sm:text-[11px] font-black break-keep leading-tight block mt-1 line-clamp-1">
                            {st.name}
                          </span>

                          <span className="font-mono text-[8.5px] sm:text-[9px] font-bold block leading-tight mt-1 opacity-95">
                            {starsLocked ? `⭐${needStars}필요` : st.representativeMenu}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Tycoon Kitchen Panel */}
        {page === 'kitchen' && activeStageId && (
          (() => {
            const currentStage = STAGES.find(s => s.id === activeStageId)!;
            const currentQuestion = currentQuestions[currentQIndex];

            // Define active bread index based on current stage (Stage ID 1 to 50 maps to BREADS_METADATA 0 to 49)
            const getCurrentBreadIndex = (stageId: number): number => {
              return Math.max(0, Math.min(49, stageId - 1));
            };

            const activeBreadIndex = getCurrentBreadIndex(currentStage.id);
            const activeBreadMeta = BREADS_METADATA[activeBreadIndex];
            const activeBreadName = activeBreadMeta ? activeBreadMeta.name : currentStage.representativeMenu;
            const questionsInStage = getQuestionsPerStage(activeStageId);

            return (
              <div className="w-full flex flex-col lg:flex-row gap-6 relative" id="kitchen-tycoon-panel">
                
                {/* Responsive Left Sidebar: Bakery Environment Information */}
                <div 
                  className={`w-full lg:w-80 bg-gradient-to-b ${getBackgroundStyles(currentStage.shopType)} border-2 border-dashed border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4 relative overflow-hidden shrink-0 shadow-lg`}
                  id="kitchen-woodland-mascot-area"
                >
                  {/* Absolute fail silent shop backgrounds */}
                  {renderBackgroundArtFile(currentStage.shopType)}

                  <div className="flex justify-between items-center border-b border-amber-250 pb-2 relative z-10 select-none sm:col-span-2">
                    <div>
                      <span className="font-sans text-[10px] text-stone-700 font-bold block bg-white/70 border border-amber-300 px-2 py-0.5 rounded-full self-start w-max">
                        {getShopTypeKorean(currentStage.shopType)}
                      </span>
                      <h3 className="font-sans font-extrabold text-[#3E2723] text-base sm:text-lg mt-1 mb-0.5">{currentStage.name}</h3>
                      <p className="font-sans text-[9px] text-stone-500">테마: {currentStage.theme}</p>
                    </div>
                  </div>

                  {/* Cute Animal Mascot ordering dialog box */}
                  <div className="bg-white/95 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm relative z-10 sm:col-span-1" id="woodland-dialog-balloon">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl filter drop-shadow-sm select-none">{activeMascot.emoji}</span>
                      <div>
                        <h4 className="font-sans font-bold text-[#5C4033] text-xs leading-none">{activeMascot.name}</h4>
                        <span className="font-sans text-[9px] text-[#A0522D] font-bold">숲속 단골 고객</span>
                      </div>
                    </div>
                    
                    <p className="font-sans text-[11px] text-stone-750 leading-relaxed bg-[#FFFDF9] border border-orange-100 p-2 rounded-lg">
                      “{activeMascot.greeting}”
                    </p>
                  </div>

                  {/* Cozy ordered recipe visual card */}
                  <div className="bg-white/90 border-2 border-amber-300 rounded-xl p-3 flex items-center justify-between shadow-sm relative z-10 sm:col-span-1" id="kitchen-current-target-dessert">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[9px] text-[#A0522D] font-black uppercase tracking-wider">주문한 디저트 레시피</span>
                      <span className="font-sans font-black text-xs text-[#5D4037]">{activeBreadName}</span>
                      <span className="font-sans text-[9px] text-stone-500 leading-tight max-w-[160px] line-clamp-2">
                        {activeBreadMeta?.desc || '정밀 가공을 통해 탄생할 비법 디저트'}
                      </span>
                    </div>
                    <div className="bg-amber-50 rounded-lg border-2 border-[#5D4037]/20 p-1 shrink-0">
                      <PixelSprite type="bread" index={activeBreadIndex} size={36} frameless={true} />
                    </div>
                  </div>

                  {/* Stage Progress tracker inside kitchen */}
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-3 flex flex-col gap-1.5 relative z-10 sm:col-span-1" id="kitchen-delivery-progress-status">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-stone-600">주문 접수 완료</span>
                      <span className="font-mono font-bold text-[#E67E22]">{currentQIndex + 1} / {questionsInStage} 장</span>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: questionsInStage }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 h-1.5 rounded-full border border-stone-200/50 ${
                            i < currentQIndex 
                              ? 'bg-amber-600' 
                              : i === currentQIndex 
                              ? 'bg-emerald-450 animate-pulse' 
                              : 'bg-stone-200 shadow-inner'
                          }`} 
                        />
                      ))}
                    </div>

                    <p className="font-sans text-[9px] text-stone-500 leading-tight mt-1">
                      총 {questionsInStage}개의 베이킹 주문을 정확한 비율로 모두 납품하면, 대망의 다음 레벨과 대성공 보너스를 쟁취합니다.
                    </p>
                  </div>

                  {/* Active Installed Equipment Shelf inside kitchen screen */}
                  <div className="bg-white/90 border border-amber-200 rounded-xl p-2.5 flex flex-col gap-1 relative z-10 shadow-xs sm:col-span-1" id="kitchen-active-equipment-display">
                    <span className="font-display text-[9px] font-black text-[#5D4037] flex items-center gap-1 border-b pb-1 uppercase select-none">
                      🛠️ 보유 도구 ({stats.purchasedEquipmentIds.length}개)
                    </span>
                    {stats.purchasedEquipmentIds.length === 0 ? (
                      <span className="text-[9px] text-stone-400 font-bold text-center py-1 block">아직 주방 장비가 없습니다.</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[48px] overflow-y-auto">
                        {UPGRADE_ITEMS.filter(e => stats.purchasedEquipmentIds.includes(e.id)).map(e => (
                          <div 
                            key={e.id} 
                            className="w-8 h-8 bg-[#FFF4E0] border border-[#5D4037]/25 rounded-lg flex items-center justify-center relative group cursor-help hover:scale-105 transition-all shadow-xs"
                            title={`${e.name}: ${e.effectText}`}
                          >
                            <PixelSprite type="equipment" index={e.spriteIndex} size={22} />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#5D4037] text-white text-[9px] font-sans rounded px-2 py-1 whitespace-nowrap z-50">
                              {e.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resilient back button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('정말 스테이지 해결을 멈추고 맵으로 돌아가겠습니까? 진행 사항을 잃게 됩니다.')) {
                        setPage('map');
                        setActiveStageId(null);
                      }
                    }}
                    className="w-full py-2 bg-stone-900/10 hover:bg-stone-900/20 text-[#3E2723] border border-stone-300 font-sans font-bold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wide relative z-10 sm:col-span-2"
                  >
                    중단하고 지도(Map)로 돌아가기
                  </button>
                </div>

                {/* Right Interactive Math Box: Clip-on clipboard */}
                <div className="flex-1 flex flex-col items-center gap-4 relative" id="math-workbook-workbench">
                  
                  {/* Floating combo shield trigger notice */}
                  {isShieldTriggered && (
                    <div className="absolute inset-x-0 top-32 mx-auto max-w-sm bg-blue-600 text-white font-sans font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 border-4 border-[#5D4037] shadow-xl animate-bounce z-50">
                      🛡️ [황금 밀대 보정 안전 가드] 실수로 인한 대성공 콤보({stats.streakCount}!) 락 하락을 철통 수호했습니다!
                    </div>
                  )}
                  
                  {/* Streak and multiplier helper dashboard */}
                  <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex justify-between items-center shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔥</span>
                      <span className="font-sans text-xs text-stone-600 font-bold">연속 정답 가동:</span>
                      <span className="font-mono text-sm font-extrabold text-[#E67E22] bg-[#FFF3E0] px-2 py-0.5 rounded border border-[#FFE0B2]">
                        {stats.streakCount} 콤보
                      </span>
                    </div>

                    {/* Gold Multiplier Boost gauge from Ovens */}
                    <div className="flex items-center gap-1.5 font-sans text-xs text-stone-600 font-semibold" id="active-multiplier-badge">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>기구 골드 보너스: </span>
                      <span className="font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                        +{Math.round(getActiveGoldMultiplierBoost(stats.purchasedEquipmentIds) * 100)}%
                      </span>
                    </div>
                  </div>

                  {currentQuestion && (
                    <MathQuestionBox
                      question={currentQuestion}
                      onSubmitAnswer={handleSubmitAnswer}
                      isWrongNotification={isWrong}
                      isCorrectNotification={isCorrect}
                      breadIndex={activeBreadIndex}
                      breadName={activeBreadName}
                    />
                  )}
                </div>

              </div>
            );
          })()
        )}

        {/* 4. Upgrade Cabinet Screen */}
        {page === 'upgrades' && (
          <CabinetScreen
            gold={stats.gold}
            unlockedIds={stats.purchasedEquipmentIds}
            onPurchase={handleBuyEquipment}
            onBack={() => setPage('map')}
          />
        )}

        {/* 5. Hall of Fame Screen */}
        {page === 'fame' && (
          <HallOfFame
            stats={stats}
            onClose={() => setPage('map')}
            onRegister={handleRegisterToHallOfFame}
          />
        )}

        {/* 6. Collection Book Screen */}
        {page === 'collection' && (
          <CollectionBook
            unlockedBreadIndices={stats.unlockedBreadIndices || []}
            encounteredMascotNames={stats.encounteredMascotNames || []}
            stageProgress={stats.stageProgress}
            onBack={() => setPage('map')}
          />
        )}

      </main>

      {/* 3. Interactive Active Baking overlay */}
      {isBakingActive && (
        <InteractiveBacking
          onAnimationComplete={handleBakingComplete}
          breadIndex={bakingBreadIndex}
          breadName={bakingBreadName}
          earnedGold={earnedGoldThisQuestion}
          isVip={!!activeMascot?.isVip}
        />
      )}

      {/* 4. Global Footer Frame */}
      <footer className="w-full bg-[#EFEBE9] border-t-4 border-[#5D4037] py-6 mt-12 text-center shadow-inner" id="global-tycoon-foot-container">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 font-sans text-xs text-[#5D4037] font-bold">
          <span>🎮 PIXEL BAKERY (비와 비율, 백분율 연습용 수학 게임)</span>
          <div className="flex flex-col items-center sm:items-end gap-0.5">
            <a
              href={PORTAL_HOME_URL}
              className="text-[#5D4037] hover:text-[#E05A47] underline underline-offset-2 decoration-[#E05A47]/40 hover:decoration-[#E05A47] transition-colors"
              title="로그인교실 메인으로 이동"
            >
              로그인교실.com
            </a>
            <span className="text-[#E05A47]">made by 로그린쌤</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
