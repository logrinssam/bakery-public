import React, { useState, useEffect } from 'react';
import { PlayerStats, HallRecord } from '../types';
import { PixelSprite } from './PixelSprite';
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
  HelpCircle
} from 'lucide-react';

interface HallOfFameProps {
  stats: PlayerStats;
  onClose: () => void;
  onRegister: (name: string, school: string, comment: string) => void;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({
  stats,
  onClose,
  onRegister
}) => {
  const [records, setRecords] = useState<HallRecord[]>([]);
  const [userName, setUserName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [userComment, setUserComment] = useState('');
  const [registered, setRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'school'>('individual');
  const [showCertSuccessMsg, setShowCertSuccessMsg] = useState(false);

  // Sync records from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pixel_bakery_hall_records');
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        // Sample legendary records for classroom context
        const sampleRecords: HallRecord[] = [
          { id: '1', name: '김민준 파티셰', schoolName: '빛솔초등학교', comment: '비율과 할인율 단원을 완벽 마스터하고 칭호를 따냈습니당!', date: '2026-05-18', stars: 195, highestStreak: 24 },
          { id: '2', name: '이서윤 꼬마생', schoolName: '새봄초등학교', comment: '50단계까지 도넛이랑 마카롱 굽는 수학 질문 다 맞췄지용! 최고!!', date: '2026-05-20', stars: 180, highestStreak: 12 },
          { id: '3', name: '수학 천재 레몬', schoolName: '은빛초등학교', comment: '왕실 황금 레시피 다 통과했습니다. 대박 재밌어요!', date: '2026-05-21', stars: 210, highestStreak: 45 },
          { id: '4', name: '조은혜 꿈나무', schoolName: '빛솔초등학교', comment: '분수 소수 백분율 다 극복하고 명예 등극 완료 헤헤', date: '2026-05-21', stars: 165, highestStreak: 18 },
          { id: '5', name: '김태우 브레드', schoolName: '은빛초등학교', comment: '할인율 계산하는 상점들 짱 재밌었어요! 전교 1등할래요!', date: '2026-05-21', stars: 175, highestStreak: 15 },
          { id: '6', name: '박사랑 버터', schoolName: '새봄초등학교', comment: '50관문 클리어!! 드디어 왕실 파티셰 임명장 받았다!', date: '2026-05-21', stars: 160, highestStreak: 10 }
        ];
        localStorage.setItem('pixel_bakery_hall_records', JSON.stringify(sampleRecords));
        setRecords(sampleRecords);
      }
    } catch {
      // safe fallback
    }
  }, [registered]);

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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !schoolName.trim() || !userComment.trim()) return;

    onRegister(userName.trim(), schoolName.trim(), userComment.trim());
    setRegistered(true);

    // Append to local records immediately
    const newRecord: HallRecord = {
      id: Date.now().toString(),
      name: userName.trim(),
      schoolName: schoolName.trim(),
      comment: userComment.trim(),
      date: new Date().toISOString().split('T')[0],
      stars: stats.starsEarned,
      highestStreak: stats.highestStreak
    };

    const updated = [newRecord, ...records];
    localStorage.setItem('pixel_bakery_hall_records', JSON.stringify(updated));
    setRecords(updated);

    // Auto trigger download for top-tier positive reinforcement
    handleDownloadCertificate(
      userName.trim(),
      schoolName.trim(),
      stats.starsEarned,
      stats.highestStreak,
      newRecord.date
    );
  };

  // Aggregated ranks grouped by School Name
  const getSchoolRanks = () => {
    const schoolMap: { 
      [key: string]: { 
        schoolName: string; 
        students: string[]; 
        totalStars: number; 
        maxStreak: number 
      } 
    } = {};

    records.forEach(rec => {
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

  const isEligibleToRegister = stats.stageProgress >= 50 && !stats.hallOfFameRegistered && !registered;
  const isAlreadyRegistered = stats.hallOfFameRegistered || registered;

  const currentRegisteredName = stats.hallName || userName;
  const currentRegisteredSchool = stats.hallSchool || schoolName;
  const currentRegisteredDate = stats.hallDate || new Date().toISOString().split('T')[0];

  const sortedIndividualRecords = [...records].sort((a, b) => {
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

  const schoolRanksList = getSchoolRanks();

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
            <h1 className="font-display font-black text-[#5D4037] text-2xl md:text-3xl tracking-tight">🏆 수학 마스터 파티셰 전당</h1>
            <p className="font-sans text-xs text-stone-500 font-medium mt-1">50단계 최종 시그니처 베이커리를 완성한 천재 파티셰들과 최고의 명문 베이커리 학교 연합입니다.</p>
          </div>
        </div>

        {/* Level summary badges */}
        <div className="flex gap-2.5 items-center text-xs">
          <div className="bg-[#FFF4E0] border-4 border-[#5D4037] text-[#5D4037] rounded-2xl px-5 py-2 font-display font-black flex items-center gap-2 shadow-sm">
            <Trophy className="w-4 h-4 text-[#F4D03F]" />
            전원 누적 등재 완료: {records.length}명
          </div>
          <div className="bg-amber-100 border-4 border-[#5D4037] text-[#5D4037] rounded-2xl px-5 py-2 font-display font-black flex items-center gap-2 shadow-sm">
            <School className="w-4 h-4 text-amber-700" />
            참가 베이커리 학교수: {schoolRanksList.length}개교
          </div>
        </div>
      </div>

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
              <span className="text-[#5D4037]">{currentRegisteredSchool || '빛솔 베이커리 초등학교'}</span>
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
                <label className="font-sans text-xs text-stone-500 font-bold" htmlFor="fame-school">🏫 과학/초등 학교명 입력</label>
                <input
                  type="text"
                  id="fame-school"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="예: 빛솔초등학교"
                  required
                  className="bg-white border-4 border-[#5D4037] rounded-2xl px-4 py-3 font-sans text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF85A1]/20 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs text-stone-500 font-bold" htmlFor="fame-name">파티셰 닉네임 (이름)</label>
                <input
                  type="text"
                  id="fame-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
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
                  placeholder="예: 수학 마스터 완료!"
                  required
                  className="bg-white border-4 border-[#5D4037] rounded-2xl px-4 py-3 font-sans text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF85A1]/20 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-pixel-yellow px-6 py-4 rounded-2xl text-center cursor-pointer flex items-center justify-center gap-2 mt-2 font-display text-sm font-black w-full"
            >
              <Award className="w-5 h-5 text-[#5D4037]" />
              서명 등록 신청 & 명예 인증서 즉시 다운로드
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
          🏫 학교 대항전 순위 (실시간)
        </button>
      </div>

      {/* 1. Tab - Individual Hall Records */}
      {activeTab === 'individual' && (
        <div className="flex flex-col gap-4" id="hall-plaques-shelf">
          <div className="flex justify-between items-center bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200">
            <h2 className="font-display font-black text-[#5D4037] text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F4D03F]" />
              현재 서약된 수석 파티셰 동명단 ({sortedIndividualRecords.length}명)
            </h2>
            <span className="font-sans text-[10px] text-amber-800 font-bold">⭐ 높은 별점 우선 정렬</span>
          </div>

          {sortedIndividualRecords.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-4 border-[#5D4037] text-stone-400 font-sans text-sm font-bold">
              등록된 명예로운 인물이 아직 없습니다. 50단계를 클리어하여 최초의 전설이 되어 보세요!
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
                🏫 전국 학교대항 베이커리 리그 (실시간 집계)
              </h2>
              <p className="font-sans text-[11px] text-stone-500 font-medium">학교별 단체 50단계 정복 인원수를 합계하여 순위가 산정됩니다. 동점 시 누적 획득한 별 개수가 많은 우수 학교가 차지합니다.</p>
            </div>
            <span className="font-sans text-[10px] bg-emerald-100 text-emerald-800 border-2 border-emerald-200 font-bold px-2 py-1 rounded-lg">🏫 등록 인원 순 정렬</span>
          </div>

          {schoolRanksList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-4 border-[#5D4037] text-stone-400 font-sans text-sm font-bold">
              학교 대항전에 참여한 학교 정보가 아직 비어있습니다. 본인의 이름과 학교 소속을 추가하여 학교를 1등으로 이끌어가 주세요!
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
