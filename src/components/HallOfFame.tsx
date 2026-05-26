import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerStats, HallRecord } from '../types';
import { loadElementarySchools, resolveSchoolName, searchSchools } from '../data/schools';
import {
  isFirebaseConfigured,
  fetchHallRecords,
  addHallRecordToFirebase,
  HALL_RECORDS_TOP_LIMIT
} from '../services/firebaseHall';
import {
  subscribeVisitStats,
  isTeacherStatsEnabled,
  verifyTeacherPin,
  type VisitStats,
  fetchTopSchoolStats,
  type SchoolVisitStats
} from '../services/firebaseVisits';
import {
  filterRecordsForPublishedRanking,
  formatNextRankingPublishLabel,
  formatRankingPublishLabel,
  getRankingIntervalDescription,
  getRankingPublishIntervalHours
} from '../utils/rankingPublish';
import { PixelSprite } from './PixelSprite';
import {
  INPUT_LIMITS,
  clampHallSubmitStats,
  parseHallRecords,
  sanitizeDisplayText,
  STORAGE_KEYS,
} from '../lib/safeStorage';
import { 
  Award, 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  Download, 
  School, 
  Users, 
  Medal, 
  FileText, 
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

const HALL_AUTO_REFRESH_MS = 60 * 60 * 1000;
const HALL_MANUAL_COOLDOWN_MS = 30 * 60 * 1000;

function formatHallClockTime(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  }).format(date);
}

function mergeHallRecords(remote: HallRecord[], local: HallRecord[]): HallRecord[] {
  const byId = new Map<string, HallRecord>();
  for (const r of remote) byId.set(r.id, r);
  for (const r of local) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }
  return Array.from(byId.values()).sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars;
    if (b.highestStreak !== a.highestStreak) return b.highestStreak - a.highestStreak;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    return bTime - aTime;
  });
}

interface HallOfFameProps {
  stats: PlayerStats;
  onClose: () => void;
  onRegister: (name: string, school: string, comment: string) => void;
}

const HALL_RECORDS_KEY = 'pixel_bakery_hall_records_v2';

export const HallOfFame: React.FC<HallOfFameProps> = ({
  stats,
  onClose,
  onRegister
}) => {
  const [records, setRecords] = useState<HallRecord[]>([]);
  const [userName, setUserName] = useState('');
  const [schoolQuery, setSchoolQuery] = useState('');
  const [userComment, setUserComment] = useState('');
  const [schoolError, setSchoolError] = useState('');
  const [allowedSchools, setAllowedSchools] = useState<string[]>([]);
  const [schoolsReady, setSchoolsReady] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'school'>('individual');
  const [showCertSuccessMsg, setShowCertSuccessMsg] = useState(false);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [topSchools, setTopSchools] = useState<SchoolVisitStats[]>([]);
  const [showTeacherStats, setShowTeacherStats] = useState(false);
  const [teacherPin, setTeacherPin] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [rankingClock, setRankingClock] = useState(() => Date.now());
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [lastManualRefreshAt, setLastManualRefreshAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [uiTick, setUiTick] = useState(() => Date.now());
  const lastManualRefreshAtRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = window.setInterval(() => setRankingClock(Date.now()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const needsCooldownTick =
      lastManualRefreshAt !== null &&
      Date.now() - lastManualRefreshAt < HALL_MANUAL_COOLDOWN_MS;
    if (!needsCooldownTick) return;
    const id = window.setInterval(() => setUiTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [lastManualRefreshAt]);

  useEffect(() => {
    loadElementarySchools().then((list) => {
      setAllowedSchools(list);
      setSchoolsReady(true);
    });
  }, []);

  const loadLocalRecords = useCallback((): HallRecord[] => {
    try {
      localStorage.removeItem('pixel_bakery_hall_records');
      const stored = localStorage.getItem(HALL_RECORDS_KEY);
      const parsed: HallRecord[] = stored ? parseHallRecords(JSON.parse(stored)) : [];
      setRecords(parsed);
      return parsed;
    } catch {
      setRecords([]);
      return [];
    }
  }, []);

  const persistRecords = useCallback((merged: HallRecord[]) => {
    setRecords(merged);
    try {
      localStorage.setItem(HALL_RECORDS_KEY, JSON.stringify(merged));
    } catch {
      // ignore quota
    }
    setLastUpdatedAt(new Date());
  }, []);

  const refreshHallRecords = useCallback(
    async (options?: { bypassCooldown?: boolean; isManual?: boolean }) => {
      if (!isFirebaseConfigured()) {
        loadLocalRecords();
        return;
      }

      if (
        options?.isManual &&
        !options?.bypassCooldown &&
        lastManualRefreshAtRef.current !== null &&
        Date.now() - lastManualRefreshAtRef.current < HALL_MANUAL_COOLDOWN_MS
      ) {
        return;
      }

      setRefreshing(true);
      setRefreshError(null);

      try {
        const local = loadLocalRecords();
        const remote = await fetchHallRecords();
        const merged = mergeHallRecords(remote, local);
        persistRecords(merged);

        if (options?.isManual && !options?.bypassCooldown) {
          const now = Date.now();
          lastManualRefreshAtRef.current = now;
          setLastManualRefreshAt(now);
        }
      } catch {
        loadLocalRecords();
        setRefreshError('목록을 불러오지 못했습니다. 로컬 캐시를 표시합니다.');
      } finally {
        setRefreshing(false);
      }
    },
    [loadLocalRecords, persistRecords]
  );

  useEffect(() => {
    loadLocalRecords();

    if (!isFirebaseConfigured()) return;

    void refreshHallRecords({ bypassCooldown: true });

    const autoId = window.setInterval(() => {
      void refreshHallRecords({ bypassCooldown: true });
    }, HALL_AUTO_REFRESH_MS);

    return () => window.clearInterval(autoId);
  }, [loadLocalRecords, refreshHallRecords]);

  useEffect(() => {
    if (!showTeacherStats || !isFirebaseConfigured()) return;
    const unsub = subscribeVisitStats(setVisitStats);
    void fetchTopSchoolStats(12).then(setTopSchools);
    const id = window.setInterval(() => {
      void fetchTopSchoolStats(12).then(setTopSchools);
    }, 60_000);
    return () => unsub?.();
  }, [showTeacherStats]);

  // Handle Certificate Image Generation & Automatic Download via canvas
  const handleDownloadCertificate = (name: string, school: string, stars: number, streak: number, dateStr: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Fill background (Warm, textured vintage parchment)
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(0, 0, 1000, 700);

    // Decorative warm frame tone
    ctx.fillStyle = '#F4EADA';
    ctx.fillRect(30, 30, 940, 640);
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(45, 45, 910, 610);

    // 2. Draw dual fine lines border
    // Outer border (chocolate)
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 6;
    ctx.strokeRect(35, 35, 930, 630);

    // Gold inner border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(55, 55, 890, 590);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(0, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(65, 65, 0);
    drawCorner(935, 65, Math.PI / 2);
    drawCorner(935, 635, Math.PI);
    drawCorner(65, 635, -Math.PI / 2);

    // 3. Top Title Header
    ctx.fillStyle = '#5D4037';
    ctx.font = 'bold 44px "Times New Roman", serif, "Malgun Gothic"';
    ctx.textAlign = 'center';
    ctx.fillText('임 명 장', 500, 140);

    // Ribbon dividing line
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(420, 165);
    ctx.lineTo(580, 165);
    ctx.stroke();

    // Appellation banner subtitle
    ctx.fillStyle = '#C0392B';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🏆 비율 베이커리 수석 마스터 파티셰 인증 🏆', 500, 215);

    // 4. Student Information Subtitle
    ctx.fillStyle = '#2C3E50';
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px sans-serif';
    const textStartX = 180;
    ctx.fillText(`소 속 : ${school || '비율 베이커리 아카데미'}`, textStartX, 275);
    ctx.fillText(`성 명 : ${name}`, textStartX, 315);

    // Body Text Lines (Praising their ratio & percentage math comprehension)
    ctx.fillStyle = '#5D4037';
    ctx.font = '16.5px sans-serif';
    const lines = [
      '위 사람은 「수학 마스터 요정의 비율 베이커리」의 총 50단계에 걸친',
      '모든 복잡한 비와 비율, 소수 백분율, 특별 할인 비율 산정 미션을',
      '우수한 수학적 통찰력과 정성어린 베이커리 배합술로 완벽히 정복하여',
      '맛있고 바른 최고급 수식 디저트를 완성하는 수석 과정을 수료하였습니다.',
      '',
      '이에 수학 요정 위원회의 강력한 지지를 바탕으로 명예 전당의',
      '정식 수석 파티셰 공식 칭호를 부여하며, 본 인증서를 증정합니다.'
    ];

    let currentY = 370;
    lines.forEach(line => {
      ctx.fillText(line, textStartX, currentY);
      currentY += 28;
    });

    // 5. Statistics Ribbon Box
    ctx.fillStyle = '#FFF5E6';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(180, currentY + 10, 640, 65, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E67E22';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`★ 최종 영광 기록 :  누적 별점 ${stars}개 획득  /  연속 정답기록 ${streak}콤보 달성 ★`, 500, currentY + 48);

    // 6. Footer / Date / Official Seal
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    const formattedDate = dateStr ? dateStr.replace(/-/g, '년 ') + '일' : '2026년 05월 21일';
    ctx.fillText(formattedDate, 500, currentY + 115);

    ctx.fillStyle = '#5D4037';
    ctx.font = 'bold 20px serif';
    ctx.fillText('수학 비와비율 베이커리 학술 요정 인증 위원회', 500, currentY + 155);

    // 7. Gold Wax Seal Stamp Graphic
    const stampX = 820;
    const stampY = 540;
    ctx.save();
    ctx.translate(stampX, stampY);

    // Red Seal Wax Base
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    // Gold internal text & mini star
    ctx.strokeStyle = '#F4D03F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#F4D03F';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('★', 0, -8);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('수학인증', 0, 14);
    ctx.fillText('합격', 0, 26);
    ctx.restore();

    // Trigger download trigger
    const link = document.createElement('a');
    link.download = `${name}_수석파티셰_명예인증서.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Trigger notification
    setShowCertSuccessMsg(true);
    setTimeout(() => {
      setShowCertSuccessMsg(false);
    }, 4000);
  };

  const handleOpenTeacherStats = () => {
    if (!isTeacherStatsEnabled()) {
      alert('접속 통계는 VITE_VISITOR_ADMIN_PIN_SHA256 설정 후 사용할 수 있습니다.');
      return;
    }
    const entered = window.prompt('교사용 접속 통계 PIN을 입력하세요.');
    if (entered === null) return;
    void verifyTeacherPin(entered).then((ok) => {
      if (ok) {
        setTeacherPin(entered.trim());
        setShowTeacherStats(true);
      }
      else alert('PIN이 올바르지 않습니다.');
    });
  };

  const handleDeleteHallRecord = async (recordId: string) => {
    if (!teacherPin) {
      alert('교사용 PIN을 먼저 입력해 주세요.');
      return;
    }
    if (!window.confirm('이 명예의 전당 기록을 삭제할까요?')) return;

    const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '').trim();
    if (!projectId) {
      alert('Firebase 프로젝트 설정이 필요합니다.');
      return;
    }
    const endpoint = `https://asia-northeast3-${projectId}.cloudfunctions.net/deleteHallRecord`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: teacherPin, recordId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert('삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      await refreshHallRecords({ bypassCooldown: true, isManual: true });
    } catch {
      alert('삭제에 실패했습니다. 네트워크 상태를 확인해 주세요.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolError('');

    if (!userName.trim() || !schoolQuery.trim() || !userComment.trim()) return;
    if (registering) return;

    if (!schoolsReady || allowedSchools.length === 0) {
      setSchoolError(
        schoolsReady && allowedSchools.length === 0
          ? '학교 목록 파일이 없습니다. data/elementary-schools.csv 를 넣고 npm run build:schools 실행 후 배포해 주세요.'
          : '학교 목록을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.'
      );
      return;
    }

    const resolvedSchool = resolveSchoolName(schoolQuery, allowedSchools);
    if (!resolvedSchool) {
      setSchoolError('실제 초등학교만 등록할 수 있습니다. 목록에서 학교명을 골라 주세요.');
      return;
    }

    const trimmedName = sanitizeDisplayText(userName, INPUT_LIMITS.hallName);
    const trimmedComment = sanitizeDisplayText(userComment, INPUT_LIMITS.hallComment);
    if (!trimmedName || !trimmedComment) return;

    setRegistering(true);
    const recordDate = new Date().toISOString().split('T')[0];

    onRegister(trimmedName, resolvedSchool, trimmedComment);
    setRegistered(true);
    setSchoolQuery(resolvedSchool);

    const createdAt = new Date().toISOString();
    const { stars, highestStreak } = clampHallSubmitStats(
      stats.starsEarned,
      stats.highestStreak
    );
    const recordPayload = {
      name: trimmedName,
      schoolName: resolvedSchool,
      comment: trimmedComment,
      date: recordDate,
      stars,
      highestStreak,
      createdAt
    };

    let recordId = Date.now().toString();
    if (isFirebaseConfigured()) {
      try {
        const remoteId = await addHallRecordToFirebase(recordPayload);
        if (remoteId) recordId = remoteId;
      } catch {
        setSchoolError('서버에 등록하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.');
        setRegistering(false);
        return;
      }
    }

    const newRecord: HallRecord = { id: recordId, ...recordPayload };
    const updated = [newRecord, ...records.filter((r) => r.id !== recordId)];
    persistRecords(updated);

    setRegistering(false);

    if (isFirebaseConfigured()) {
      await refreshHallRecords({ bypassCooldown: true });
    }

    handleDownloadCertificate(
      trimmedName,
      resolvedSchool,
      stars,
      highestStreak,
      recordDate
    );
  };

  const rankingNow = new Date(rankingClock);
  const publishedRecords = filterRecordsForPublishedRanking(records, rankingNow);
  const pendingRankingCount = records.length - publishedRecords.length;

  const manualCooldownRemaining =
    lastManualRefreshAt !== null
      ? Math.max(0, HALL_MANUAL_COOLDOWN_MS - (uiTick - lastManualRefreshAt))
      : 0;
  const canManualRefresh = !refreshing && manualCooldownRemaining === 0;
  const manualCooldownMinutes = Math.ceil(manualCooldownRemaining / 60_000);

  // Aggregated ranks grouped by School Name (scheduled snapshot only)
  const getSchoolRanks = (source: HallRecord[]) => {
    const schoolMap: { 
      [key: string]: { 
        schoolName: string; 
        students: string[]; 
        totalStars: number; 
        maxStreak: number 
      } 
    } = {};

    source.forEach(rec => {
      const sch = (rec.schoolName || '무소속 파티셰 아카데미').trim();
      if (!schoolMap[sch]) {
        schoolMap[sch] = {
          schoolName: sch,
          students: [],
          totalStars: 0,
          maxStreak: 0
        };
      }
      if (!schoolMap[sch].students.includes(rec.name)) {
        schoolMap[sch].students.push(rec.name);
      }
      schoolMap[sch].totalStars += rec.stars;
      schoolMap[sch].maxStreak = Math.max(schoolMap[sch].maxStreak, rec.highestStreak);
    });

    // Ranks based on total registered master chefs (student count), then stars
    return Object.values(schoolMap).sort((a, b) => {
      if (b.students.length !== a.students.length) {
        return b.students.length - a.students.length;
      }
      return b.totalStars - a.totalStars;
    });
  };

  const isEligibleToRegister =
    stats.stageProgress >= 50 && !stats.hallOfFameRegistered && !registered;
  const isAlreadyRegistered = stats.hallOfFameRegistered || registered;

  const currentRegisteredName = stats.hallName || userName;
  const currentRegisteredSchool = stats.hallSchool || schoolQuery;
  const currentRegisteredDate = stats.hallDate || new Date().toISOString().split('T')[0];

  const sortedIndividualRecords = [...publishedRecords].sort((a, b) => {
    if (b.stars !== a.stars) {
      return b.stars - a.stars;
    }
    if (b.highestStreak !== a.highestStreak) {
      return b.highestStreak - a.highestStreak;
    }
    const aTime = isNaN(Number(a.id)) ? new Date(a.date).getTime() : Number(a.id);
    const bTime = isNaN(Number(b.id)) ? new Date(b.date).getTime() : Number(b.id);
    return aTime - bTime;
  });

  const schoolRanksList = getSchoolRanks(publishedRecords);

  return (
    <div className="w-full flex flex-col gap-6 text-[#5D4037]" id="hall-of-fame-panel-section">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-dashed border-[#FFF4E0] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-pixel-yellow p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="지도 화면으로"
            id="hall-back-button"
          >
            <ArrowLeft className="w-5 h-5 text-[#5D4037]" />
          </button>
          <div>
            <h1 className="font-display font-black text-[#5D4037] text-2xl md:text-3xl tracking-tight leading-snug pb-0.5 inline-block">
              🏆 수학 마스터 파티셰 전당
            </h1>
            <p className="font-sans text-xs text-stone-500 font-medium mt-1">
              50단계 최종 시그니처 베이커리를 완성한 천재 파티셰들의 명단·학교 순위는{' '}
              <span className="text-amber-800">{getRankingIntervalDescription(rankingNow)}</span> 공개됩니다.
              (현재 {getRankingPublishIntervalHours(rankingNow)}시간 주기 · 7일마다 주기가 1시간씩 늘어납니다)
            </p>
          </div>
        </div>

        <div className="w-full bg-amber-50/80 border-2 border-amber-200 rounded-2xl px-4 py-3 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="font-sans text-xs font-bold text-amber-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              {formatRankingPublishLabel(rankingNow)}
            </p>
            <p className="font-sans text-[11px] font-bold text-stone-600">
              {formatNextRankingPublishLabel(rankingNow)}
              {pendingRankingCount > 0 && (
                <span className="text-amber-800"> · 다음 공개에 반영 예정 {pendingRankingCount}명</span>
              )}
            </p>
          </div>
          {isFirebaseConfigured() && (
            <div className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2 pt-1 border-t border-amber-200/80">
              <span className="font-sans text-[11px] font-bold text-stone-600">
                마지막 업데이트 {formatHallClockTime(lastUpdatedAt)}
                <span className="text-stone-400 font-medium">
                  {' '}
                  · 서버 상위 {HALL_RECORDS_TOP_LIMIT}명 · 1시간마다 자동 갱신
                </span>
              </span>
              <button
                type="button"
                disabled={!canManualRefresh}
                onClick={() => void refreshHallRecords({ isManual: true })}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-sans text-[11px] font-black transition-all ${
                  canManualRefresh
                    ? 'bg-white border-[#5D4037] text-[#5D4037] hover:bg-[#FFF4E0] cursor-pointer'
                    : 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                }`}
                title="Firestore에서 명단 다시 불러오기"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing
                  ? '불러오는 중…'
                  : manualCooldownRemaining > 0
                    ? `${manualCooldownMinutes}분 후 가능`
                    : '목록 새로고침'}
              </button>
              {refreshError && (
                <span className="font-sans text-[10px] text-red-600 font-bold">{refreshError}</span>
              )}
            </div>
          )}
        </div>

        {/* Level summary badges */}
        <div className="flex flex-wrap gap-2.5 items-center text-xs">
          <div className="bg-[#FFF4E0] border-4 border-[#5D4037] text-[#5D4037] rounded-2xl px-5 py-2 font-display font-black flex items-center gap-2 shadow-sm">
            <Trophy className="w-4 h-4 text-[#F4D03F]" />
            공개 명단: {publishedRecords.length}명
            {records.length > publishedRecords.length && (
              <span className="text-[9px] font-sans font-bold text-stone-500">
                (전체 등록 {records.length}명)
              </span>
            )}
          </div>
          <div className="bg-amber-100 border-4 border-[#5D4037] text-[#5D4037] rounded-2xl px-5 py-2 font-display font-black flex items-center gap-2 shadow-sm">
            <School className="w-4 h-4 text-amber-700" />
            참가 베이커리 학교수: {schoolRanksList.length}개교
          </div>
          {isFirebaseConfigured() && isTeacherStatsEnabled() && (
            <button
              type="button"
              onClick={handleOpenTeacherStats}
              className="bg-slate-100 border-4 border-[#5D4037] text-[#5D4037] rounded-2xl px-4 py-2 font-display font-black flex items-center gap-2 shadow-sm hover:bg-slate-200 transition-colors cursor-pointer"
              title="교사용 접속 통계"
            >
              <Users className="w-4 h-4" />
              접속 통계
            </button>
          )}
        </div>
      </div>

      {showTeacherStats && (
        <div className="bg-slate-50 border-4 border-[#5D4037] rounded-2xl p-4 flex flex-col gap-4">
          <div>
            <p className="font-display font-black text-sm text-[#5D4037]">📊 교사용 접속 누계 (Firebase)</p>
            <p className="text-[10px] font-sans text-stone-500 mt-0.5">
              브라우저 탭을 새로 열 때마다 세션 1회, 기기당 최초 1회만 고유 접속으로 집계합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-display font-black">
            <span className="bg-white border-2 border-[#5D4037] rounded-xl px-4 py-2">
              누적 접속(세션): {(visitStats?.totalSessions ?? 0).toLocaleString()}회
            </span>
            <span className="bg-white border-2 border-[#5D4037] rounded-xl px-4 py-2">
              접속한 기기(추정 인원): {(visitStats?.uniqueDevices ?? 0).toLocaleString()}대
            </span>
          </div>

          <div className="bg-white border-2 border-[#5D4037] rounded-2xl p-3">
            <p className="font-display font-black text-xs text-[#5D4037] mb-2">🏫 학교별 사용 TOP (추정 인원)</p>
            {topSchools.length === 0 ? (
              <p className="text-[10px] font-sans text-stone-500 font-semibold">
                아직 집계된 학교가 없습니다. 학생이 학교를 입력하고 시작하면 자동으로 반영됩니다.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {topSchools.map((s, idx) => (
                  <div
                    key={`${s.schoolName}-${idx}`}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border border-stone-200"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-sans font-black text-stone-500 mr-1.5">#{idx + 1}</span>
                      <span className="font-sans font-black text-[11px] text-[#5D4037] truncate inline-block max-w-[220px]">
                        {s.schoolName}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 text-[10px] font-sans font-black">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-2 py-0.5">
                        {s.uniqueDevices.toLocaleString()}명
                      </span>
                      <span className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-2 py-0.5">
                        {s.totalSessions.toLocaleString()}회
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowTeacherStats(false)}
              className="text-[10px] font-sans font-bold text-stone-500 underline cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* [Feature addition] Live Certificate Preview Mockup Section */}
      <div className="bg-amber-50/40 border-4 border-[#8D6E63] rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600 animate-pulse" />
            <h3 className="font-display font-black text-sm text-[#5D4037]">
              📜 수석 파티셰 인증 임명장 실물 다운로드 예시 (미리보기)
            </h3>
          </div>
          <span className="text-[10px] font-sans font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
            인쇄 소장 가능
          </span>
        </div>
        
        {/* Render fully styled CSS Diploma replica to fulfill the 'Show example image' request beautifully */}
        <div className="w-full max-w-2xl mx-auto bg-[#FFFDF9] border-6 sm:border-[12px] border-[#5D4037] p-4 sm:p-8 rounded-2xl shadow-md relative overflow-hidden text-center" style={{ fontFamily: 'serif' }}>
          {/* Outer fine border */}
          <div className="absolute inset-2 border-2 border-dashed border-[#D4AF37] pointer-events-none" />
          
          {/* Top Header */}
          <h4 className="text-[#5D4037] text-3xl font-black tracking-widest mt-1 mb-2">임 명 장</h4>
          <div className="w-32 h-0.5 bg-[#D4AF37] mx-auto mb-4" />
          
          <p className="text-xs font-sans font-extrabold text-[#C0392B] bg-amber-50 inline-block px-4 py-1.5 rounded-full border border-[#D4AF37]/50 mb-6">
            🏆 비율 베이커리 수석 마스터 파티셰 인증 🏆
          </p>
          
          {/* Player details */}
          <div className="text-left font-sans text-stone-700 text-xs font-black max-w-sm mx-auto mb-6 flex flex-col gap-1 px-4 leading-relaxed">
            <div className="flex border-b border-dashed border-stone-200 py-1">
              <span className="w-16 text-stone-400">소 &nbsp; 속:</span> 
              <span className="text-[#5D4037]">{currentRegisteredSchool || '우리 학교'}</span>
            </div>
            <div className="flex border-b border-dashed border-stone-200 py-1">
              <span className="w-16 text-stone-400">성 &nbsp; 명:</span> 
              <span className="text-[#5D4037] font-bold">{currentRegisteredName || '도전자 파티셰'}</span>
            </div>
          </div>
          
          {/* Core Body text */}
          <div className="text-[#5D4037] font-sans text-xs md:text-xs leading-6 max-w-lg mx-auto text-center px-2 space-y-1 font-medium">
            <p>위 사람은 「수학 마스터 요정의 비율 베이커리」의 총 50단계에 걸친</p>
            <p>모든 복잡한 비와 비율, 소수 백분율, 특별 할인 비율 산정 미션을</p>
            <p>우수한 수학적 통찰력과 정성어린 베이커리 배합술로 완벽히 정복하여</p>
            <p className="font-bold text-[#8D6E63]">맛있고 바른 최고급 수식 디저트를 완성하는 수석 과정을 수료하였습니다.</p>
            <p className="pt-2 text-stone-400 text-[10px]">이에 수학 요정 위원회의 강력한 지지를 바탕으로 명예 전당의</p>
            <p className="text-stone-400 text-[10px]">정식 수석 파티셰 공식 칭호를 부여하며, 본 인증서를 증정합니다.</p>
          </div>

          {/* Achievement summary strip layout */}
          <div className="my-6 bg-[#FFF4E0] border-2 border-dashed border-[#5D4037] rounded-xl py-3 px-4 max-w-md mx-auto">
            <p className="font-sans font-black text-[#E67E22] text-[11px] tracking-wide">
              ★ 누적 별점 {stats.starsEarned || 150}개 획득 &nbsp;|&nbsp; 최고 연속 정답 {stats.highestStreak || 12}콤보 ★
            </p>
          </div>
          
          {/* Footer date & Authority seal block */}
          <div className="mt-4 flex justify-between items-end px-4 md:px-12">
            <div className="text-left font-sans text-stone-400 text-[9px] leading-relaxed">
              <p>인증 일자: {currentRegisteredDate}</p>
              <p className="font-serif text-[11px] text-[#5D4037] font-bold mt-1">수학 비와비율 베이커리 학술 요정 위원회</p>
            </div>
            
            {/* Visual vector of Red Wax Seal stamp */}
            <div className="w-16 h-16 bg-[#C0392B] rounded-full border-2 border-[#F4D03F] flex flex-col items-center justify-center shadow-xs relative shrink-0">
              <span className="text-yellow-300 text-[10px]">★</span>
              <span className="text-white text-[8px] font-sans font-bold leading-none scale-90">수학인증</span>
              <span className="text-white text-[9px] font-sans font-black leading-none scale-90 mt-0.5">합격</span>
              <div className="absolute inset-1 rounded-full border border-dashed border-red-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* If completed stage 50 and hasn't registered yet, show registration card */}
      {isEligibleToRegister ? (
        <form 
          onSubmit={handleRegisterSubmit} 
          className="w-full bg-gradient-to-r from-amber-50 via-amber-100/40 to-orange-100/35 border-4 border-[#FF85A1] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-md"
          id="hall-registration-form"
        >
          <div className="flex items-center justify-center p-5 bg-[#FFF4E0] rounded-2xl border-4 border-[#5D4037] shrink-0">
            <PixelSprite type="ui" index={7} size={84} />
          </div>

          <div className="flex-1 flex flex-col gap-4 w-full">
            <div>
              <span className="bg-[#FF85A1] text-white border-2 border-[#5D4037] font-display font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Champion Register</span>
              <h2 className="font-display font-black text-[#5D4037] text-xl sm:text-2xl mt-2 select-none">축하합니다! 명예의 서명 등재 자격 달성!</h2>
              <p className="font-sans text-stone-600 text-xs font-medium">50단계 최고 난이도의 비와 비율 완벽수식을 정복한 영광을 서명으로 영원히 박제해 보십시오.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs text-stone-500 font-bold" htmlFor="fame-school">🏫 초등학교명 (목록에서 선택)</label>
                <input
                  type="text"
                  id="fame-school"
                  list="fame-school-suggestions"
                  value={schoolQuery}
                  onChange={(e) => {
                    setSchoolQuery(e.target.value);
                    setSchoolError('');
                  }}
                  maxLength={INPUT_LIMITS.hallSchool}
                  placeholder={schoolsReady ? '학교명 입력 후 목록에서 선택' : '학교 목록 불러오는 중...'}
                  autoComplete="off"
                  required
                  disabled={!schoolsReady}
                  className="bg-white border-4 border-[#5D4037] rounded-2xl px-4 py-3 font-sans text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF85A1]/20 shadow-sm disabled:opacity-60"
                />
                <datalist id="fame-school-suggestions">
                  {searchSchools(schoolQuery, allowedSchools, 15).map((school) => (
                    <option key={school} value={school} />
                  ))}
                </datalist>
                {schoolError && (
                  <p className="font-sans text-[11px] text-red-600 font-bold">{schoolError}</p>
                )}
                {schoolsReady && allowedSchools.length > 0 && (
                  <p className="font-sans text-[10px] text-stone-500">전국 실제 초등학교 {allowedSchools.length.toLocaleString()}곳 중에서만 등록됩니다.</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs text-stone-500 font-bold" htmlFor="fame-name">파티셰 닉네임 (이름)</label>
                <input
                  type="text"
                  id="fame-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={INPUT_LIMITS.hallName}
                  placeholder="예: 백분율왕 민준이"
                  required
                  className="bg-white border-4 border-[#5D4037] rounded-2xl px-4 py-3 font-sans text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF85A1]/20 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs text-stone-500 font-bold" htmlFor="fame-comment">영광 가득 기념 서약 한마디</label>
                <input
                  type="text"
                  id="fame-comment"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  maxLength={INPUT_LIMITS.hallComment}
                  placeholder="예: 수학 마스터 완료!"
                  required
                  className="bg-white border-4 border-[#5D4037] rounded-2xl px-4 py-3 font-sans text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF85A1]/20 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="btn-pixel-yellow px-6 py-4 rounded-2xl text-center cursor-pointer flex items-center justify-center gap-2 mt-2 font-display text-sm font-black w-full disabled:opacity-60"
            >
              <Award className="w-5 h-5 text-[#5D4037]" />
              {registering ? '서버에 등록 중…' : '서명 등록 신청 & 명예 인증서 즉시 다운로드'}
            </button>
          </div>
        </form>
      ) : stats.stageProgress < 50 ? (
        <div className="bg-[#FFF4E0]/40 border-4 border-dashed border-[#5D4037]/20 rounded-3xl p-6 text-center text-xs text-stone-600 font-medium" id="hall-locked-disclaimer">
          🔒 아직 50단계 최종 ‘시그니처 서약 명예의 베이커리’를 정복하지 못해 나의 전당 동판을 등재할 수 없습니다.<br/> 
          앞으로 <span className="font-bold text-[#D64566] text-sm">{50 - stats.stageProgress}단계를 더 완료하고</span> 명예로운 파티셰로 당당히 기록과 학교 이름을 박제해보세요!
        </div>
      ) : (
        /* If player already registered, display their customized certificate card so they can download it again! */
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-4 border-[#F4D03F] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm" id="hall-already-submitted">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-200 border-4 border-amber-500 rounded-2xl flex items-center justify-center animate-bounce text-xl">
              🏅
            </div>
            <div>
              <h3 className="font-display font-black text-[#5D4037] text-md sm:text-lg flex items-center gap-1.5">
                축하합니다! {currentRegisteredSchool} 소속 {currentRegisteredName} 파티셰님!
              </h3>
              <p className="font-sans text-stone-600 text-xs font-semibold mt-1">
                이미 50화면 동판 등록이 완료되었습니다. 언제든지 아래의 다운로드 버튼을 누르면 인쇄용 명예 인증 임명장 이미지가 내려받아집니다!
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => handleDownloadCertificate(
              currentRegisteredName,
              currentRegisteredSchool || '비율 베이커리 아카데미',
              stats.starsEarned,
              stats.highestStreak,
              currentRegisteredDate
            )}
            className="w-full md:w-auto bg-[#F4D03F] hover:bg-yellow-500 text-[#5D4037] font-bold text-xs py-3.5 px-6 rounded-2xl border-4 border-[#5D4037] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#5D4037]" />
            인증 임명장 이미지 저장 (.PNG)
          </button>
        </div>
      )}

      {/* Success certificate notice badge */}
      {showCertSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white border-4 border-[#5D4037] px-6 py-4 rounded-3xl flex items-center gap-3 shadow-lg font-sans font-bold text-xs animate-slide-up">
          <CheckCircle className="w-5 h-5 text-emerald-300 animate-pulse" />
          <span>🎉 임명 인증서 그림 내보내기에 성공하였습니다! 학생 컴퓨터의 다운로드 폴더에서 인쇄해 보십시오!</span>
        </div>
      )}

      {/* Playful tab controller between Personal Plaque Hall and School League Table */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-200 self-start mt-4 gap-1 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveTab('individual')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-display font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'individual'
              ? 'bg-[#5D4037] text-white shadow-xs'
              : 'text-stone-500 hover:text-[#5D4037]'
          }`}
        >
          <FileText className="w-4 h-4" />
          개인 명예 전당록
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('school')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-display font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'school'
              ? 'bg-[#5D4037] text-white shadow-xs'
              : 'text-stone-500 hover:text-[#5D4037]'
          }`}
        >
          <School className="w-4 h-4" />
          🏫 학교 대항전 순위
        </button>
      </div>

      {/* 1. Tab - Individual Hall Records */}
      {activeTab === 'individual' && (
        <div className="flex flex-col gap-4" id="hall-plaques-shelf">
          <div className="flex justify-between items-center bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200">
            <h2 className="font-display font-black text-[#5D4037] text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F4D03F]" />
              현재 서약된 수석 파티셰 명단 ({sortedIndividualRecords.length}명)
            </h2>
            <span className="font-sans text-[10px] text-amber-800 font-bold">⭐ 높은 별점 우선 정렬</span>
          </div>

          {sortedIndividualRecords.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-4 border-[#5D4037] text-stone-400 font-sans text-sm font-bold leading-relaxed">
              {records.length > 0 && pendingRankingCount > 0 ? (
                <>
                  아직 이번 시간대 공개 랭킹에 올라온 인물이 없거나, 최근 등록한 분은 다음 갱신에 반영됩니다.
                  <br />
                  <span className="text-amber-700 text-xs mt-2 inline-block">{formatNextRankingPublishLabel(rankingNow)}</span>
                </>
              ) : (
                <>등록된 명예로운 인물이 아직 없습니다. 50단계를 클리어하여 최초의 전설이 되어 보세요!</>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" id="leaders-scroll-area">
              {sortedIndividualRecords.map((rec, i) => {
                let cardStyle = "bg-white border-4 border-[#5D4037]";
                let stripeStyle = "bg-[#FF85A1]";
                let badgeLabel = "🎨 수석 파티셰";
                let badgeClass = "bg-[#FFF4E0] text-[#5D4037] border-[#5D4037]";
                let avatarBg = "bg-[#FFF4E0] border-[#5D4037]";

                if (i === 0) {
                  cardStyle = "bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 border-4 border-[#F4D03F] shadow-yellow-100/50";
                  stripeStyle = "bg-gradient-to-b from-[#F4D03F] via-yellow-300 to-[#F4D03F]";
                  badgeLabel = "👑 1등 골든 마스터 파티셰";
                  badgeClass = "bg-amber-500 text-white border-[#B7950B] animate-pulse";
                  avatarBg = "bg-amber-100 border-[#F4D03F] text-[#9C640C]";
                } else if (i === 1) {
                  cardStyle = "bg-gradient-to-r from-stone-50/80 via-white to-stone-50/80 border-4 border-[#BDC3C7]";
                  stripeStyle = "bg-gradient-to-b from-[#BDC3C7] via-slate-300 to-[#BDC3C7]";
                  badgeLabel = "✨ 2등 실버 레전드 파티셰";
                  badgeClass = "bg-slate-400 text-white border-slate-600";
                  avatarBg = "bg-slate-100 border-[#BDC3C7] text-slate-700";
                } else if (i === 2) {
                  cardStyle = "bg-gradient-to-r from-orange-50/40 via-white to-orange-50/40 border-4 border-[#E59866]";
                  stripeStyle = "bg-gradient-to-b from-[#E59866] via-amber-400 to-[#E59866]";
                  badgeLabel = "🧁 3등 브론즈 명품 파티셰";
                  badgeClass = "bg-amber-700 text-white border-[#A04000]";
                  avatarBg = "bg-orange-50 border-[#E59866] text-amber-900";
                }

                return (
                  <div 
                    key={rec.id || i}
                    className={`${cardStyle} rounded-3xl p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 bottom-0 left-0 w-3.5 ${stripeStyle}`} />

                    <div className="flex items-center gap-5 pl-3">
                      <div className={`w-14 h-14 ${avatarBg} border-4 rounded-2xl flex items-center justify-center shrink-0 shadow-xs`}>
                        <span className="font-mono text-lg font-black tracking-tighter">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-black text-[#5D4037] text-base sm:text-lg">
                            {rec.name}
                          </h3>
                          <span className={`border-2 ${badgeClass} text-[10px] font-sans font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs`}>
                             {badgeLabel}
                          </span>
                          
                          {/* School Badge Tag! */}
                          <span className="bg-emerald-50 text-emerald-800 border-2 border-emerald-300 text-[10px] font-sans font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <School className="w-3 h-3 text-emerald-600" />
                            {rec.schoolName || '무소속'}
                          </span>

                          {rec.stars >= 140 && (
                            <span className="bg-amber-50 text-amber-800 border-2 border-amber-300 text-[9px] font-sans font-black px-1.5 py-0.5 rounded-md">
                              ⭐ 초정밀 비율가 (140성+)
                            </span>
                          )}
                          {rec.highestStreak >= 15 && (
                            <span className="bg-red-50 text-red-700 border-2 border-red-200 text-[9px] font-sans font-black px-1.5 py-0.5 rounded-md">
                              🔥 집중력 마스터 ({rec.highestStreak}연승)
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-stone-600 text-xs sm:text-sm mt-1.5 font-bold italic leading-tight">
                          "{rec.comment}"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center self-end md:self-auto pl-20 md:pl-0 text-stone-600 font-mono text-xs font-bold leading-none">
                      <div className="flex items-center gap-1.5 bg-[#FFF4E0] border-2 border-[#5D4037] px-3.5 py-1.5 rounded-xl shadow-xs">
                        <CheckSquare className="w-4 h-4 text-[#5D4037]" />
                        <span>누적 {rec.stars} ⭐</span>
                      </div>
                      {rec.highestStreak > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl">
                          <span>🔥 최고 {rec.highestStreak} 콤보</span>
                        </div>
                      )}
                      
                      {/* Interactive certificate download directly from the list item! */}
                      <button
                        type="button"
                        onClick={() => handleDownloadCertificate(
                          rec.name,
                          rec.schoolName || '무소속',
                          rec.stars,
                          rec.highestStreak,
                          rec.date
                        )}
                        className="bg-stone-50 hover:bg-stone-200 text-stone-600 hover:text-[#5D4037] border-2 border-stone-300 p-1.5 rounded-xl transition-all h-[34px] w-[34px] flex items-center justify-center cursor-pointer"
                        title="이 파티셰의 임명증 이미지 저장하기"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {showTeacherStats && teacherPin && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteHallRecord(rec.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 p-1.5 rounded-xl transition-all h-[34px] w-[34px] flex items-center justify-center cursor-pointer"
                          title="(교사용) 이 기록 삭제하기"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      <div className="flex items-center gap-1.5 bg-stone-100 border-2 border-stone-200 px-3.5 py-1.5 rounded-xl">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span>{rec.date}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Tab - School League Board */}
      {activeTab === 'school' && (
        <div className="flex flex-col gap-4" id="school-leaderboard-shelf">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-emerald-50/50 p-4 rounded-2xl border-2 border-dashed border-emerald-200">
            <div>
              <h2 className="font-display font-black text-[#5D4037] text-lg flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-700" />
                🏫 전국 학교대항 베이커리 리그
              </h2>
              <p className="font-sans text-[11px] text-stone-500 font-medium">
                {getRankingIntervalDescription(rankingNow)} 공개되는 명단 기준으로, 학교별 50단계 정복 인원과 별 개수로 순위가 정해집니다.
              </p>
            </div>
            <span className="font-sans text-[10px] bg-emerald-100 text-emerald-800 border-2 border-emerald-200 font-bold px-2 py-1 rounded-lg">🏫 등록 인원 순 정렬</span>
          </div>

          {schoolRanksList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-4 border-[#5D4037] text-stone-400 font-sans text-sm font-bold leading-relaxed">
              {records.length > 0 && pendingRankingCount > 0 ? (
                <>
                  학교 순위는 {getRankingIntervalDescription(rankingNow)} 갱신됩니다. 최근 등록분은 다음 공개에 반영됩니다.
                  <br />
                  <span className="text-emerald-700 text-xs mt-2 inline-block">{formatNextRankingPublishLabel(rankingNow)}</span>
                </>
              ) : (
                <>학교 대항전에 참여한 학교 정보가 아직 비어있습니다. 본인의 이름과 학교 소속을 추가하여 학교를 1등으로 이끌어가 주세요!</>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" id="schools-list-container">
              {schoolRanksList.map((sch, i) => {
                let rankSymbol = `#${i + 1}`;
                let cardStyle = "bg-white border-4 border-[#5D4037]";
                let stripeStyle = "bg-stone-300";
                let topBadgeClass = "";
                
                if (i === 0) {
                  rankSymbol = "🏆";
                  cardStyle = "bg-gradient-to-r from-emerald-50/45 via-white to-emerald-50/45 border-4 border-emerald-600 shadow-emerald-100";
                  stripeStyle = "bg-emerald-500";
                  topBadgeClass = "bg-emerald-600 text-white border-emerald-700";
                } else if (i === 1) {
                  rankSymbol = "🥈";
                  cardStyle = "bg-white border-4 border-slate-400";
                  stripeStyle = "bg-slate-400";
                } else if (i === 2) {
                  rankSymbol = "🥉";
                  cardStyle = "bg-white border-4 border-amber-600";
                  stripeStyle = "bg-amber-600";
                }

                return (
                  <div
                    key={sch.schoolName}
                    className={`${cardStyle} rounded-2xl p-5 hover:scale-[1.005] transition-all relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                  >
                    <div className={`absolute top-0 bottom-0 left-0 w-3.5 ${stripeStyle}`} />
                    
                    <div className="flex items-center gap-5 pl-3">
                      <div className="w-14 h-14 bg-stone-50 border-4 border-[#5D4037] rounded-xl flex items-center justify-center font-mono text-xl font-bold font-sans">
                        {rankSymbol}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-display font-black text-[#5D4037] text-base sm:text-lg flex items-center gap-1.5">
                            {sch.schoolName}
                          </h3>
                          {i === 0 && (
                            <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 text-[9px] font-sans font-black px-1.5 py-0.5 rounded-md animate-pulse">
                              🌟 명예의 최고 베이커리 학교
                            </span>
                          )}
                        </div>

                        {/* Visual participant list dots */}
                        <div className="flex flex-wrap items-center mt-2.5 gap-1 text-[11px] font-sans text-stone-500 font-semibold">
                          <span className="text-stone-700 mr-1 flex items-center gap-0.5">
                            <Users className="w-3.5 h-3.5 text-stone-500 inline" />
                            동참 셰프 ({sch.students.length}명) :
                          </span>
                          {sch.students.map((std, sdI) => (
                            <span key={`${std}-${sdI}`} className="bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md text-stone-700 font-sans font-bold">
                              🍳 {std}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats summary for school */}
                    <div className="flex gap-4 items-center self-end md:self-auto pl-20 md:pl-0 font-mono text-xs font-bold leading-none">
                      <div className="flex flex-col gap-1.5 items-end justify-center">
                        <div className="flex items-center gap-1.5 bg-[#FFF4E0] border-2 border-[#5D4037] px-3.5 py-2 rounded-xl shadow-xs">
                          <Trophy className="w-4 h-4 text-[#F4D03F]" />
                          <span>등재 셰프 수: <span className="text-base text-[#D64566] ml-0.5">{sch.students.length}</span>명</span>
                        </div>
                        <div className="text-stone-500 text-[10px] font-sans font-bold">
                          🏫 학교 통산 별점: {sch.totalStars}개, 최고 콤보: {sch.maxStreak}회
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
