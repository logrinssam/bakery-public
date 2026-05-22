import { Equipment } from '../types';

export const UPGRADE_ITEMS: Equipment[] = [
  // Category 1: 오븐 (Oven types: 1-4)
  {
    id: 1,
    name: '황토 양흙 가마 오븐 (Wood Kiln Oven)',
    category: 'oven',
    price: 300,
    description: '전통 황토와 양흙으로 빚은 피자 화덕 모양 아날로그 가마. 구수한 풍미를 연출합니다.',
    multiplierBoost: 0.2,
    effectText: '정답 수령 골드 획득량 20% 증가 (+20%)',
    unlocked: false,
    spriteIndex: 1
  },
  {
    id: 2,
    name: '단단한 무쇠 전기 오븐 (Steel Electric Oven)',
    category: 'oven',
    price: 1000,
    description: '두껍게 마감된 중후한 회색 철제 오븐. 열전도 균일도가 뛰어나 고유 배합이 안정적입니다.',
    multiplierBoost: 0.5,
    effectText: '정답 수령 골드 획득량 50% 증가 (+50%)',
    unlocked: false,
    spriteIndex: 2
  },
  {
    id: 3,
    name: '콤팩트 콘벡션 미니오븐 (Compact Counter Oven)',
    category: 'oven',
    price: 3500,
    description: '황금빛 다이얼을 장착한 소형 컨벡션 오븐. 미세한 온도 비례 조절이 손쉽게 구형됩니다.',
    multiplierBoost: 1.0,
    effectText: '정답 수령 골드 획득량 100% 증가 (+100%)',
    unlocked: false,
    spriteIndex: 3
  },
  {
    id: 4,
    name: '로열 크라운 명품 황실 오븐 (Royal Crown Oven)',
    category: 'oven',
    price: 9000,
    description: '크라운 왕관 조각을 덧댄 민트 에메랄드 마스터피스 가마. 대영 제과 칭호의 장비입니다.',
    multiplierBoost: 2.0,
    effectText: '정답 수령 골드 획득량 200% 대폭 증가 (+200%!)',
    unlocked: false,
    spriteIndex: 4
  },

  // Category 2: 밀대 (Rolling Pins: 5-8)
  {
    id: 5,
    name: '클래식 편백 원목 밀대 (Basic Wood Pin)',
    category: 'rolling_pin',
    price: 150,
    description: '주방에서 흔히 볼 수 있는 단단하고 향긋한 나무 밀대. 기초 반죽 성형에 제격입니다.',
    multiplierBoost: 0.05,
    effectText: '기본 보너스: 골드 5% 소폭 증가',
    unlocked: false,
    spriteIndex: 5
  },
  {
    id: 6,
    name: '달인 파티셰의 가죽 그립 밀대 (Pro Chef Pin)',
    category: 'rolling_pin',
    price: 600,
    description: '오목조목 디자인된 어두운 색상의 그립 밀대. 반죽의 마찰 소인 비율을 억제합니다.',
    multiplierBoost: 0.15,
    effectText: '골드 획득 15% 증가',
    unlocked: false,
    spriteIndex: 6
  },
  {
    id: 7,
    name: '장인의 정밀 황금 메탈 밀대 (Golden Metal Pin)',
    category: 'rolling_pin',
    price: 1550,
    description: '도금을 수놓아 표면이 매트하게 빛나는 고강도 롤 패널. 밀가루 분포 비율을 보여줍니다.',
    multiplierBoost: 0.35,
    effectText: '골드 획득 35% 증가 및 오차 작성 방지 작동',
    unlocked: false,
    spriteIndex: 7
  },
  {
    id: 8,
    name: '전동 오토 반죽 롤러 롤기 (Dough Sheeter Machine)',
    category: 'rolling_pin',
    price: 4500,
    description: '두께 기계 비율 감지로 정밀 연소 두께 반죽을 쉴 새 없이 압축해 구워주는 최고급 롤러.',
    multiplierBoost: 0.8,
    effectText: '골드 획득 80% 증가',
    unlocked: false,
    spriteIndex: 8
  },

  // Category 3: 계량 (Measuring: 9-12)
  {
    id: 9,
    name: '클래식 아크릴 눈금 계량컵 (Acrylic Beaker Cup)',
    category: 'measuring_cup',
    price: 200,
    description: '수동 밀리리터 눈금이 심플하게 가랑막힌 투명 아크릴 컵입니다.',
    multiplierBoost: 0.1,
    effectText: '골드 획득 10% 증가',
    unlocked: false,
    spriteIndex: 9
  },
  {
    id: 10,
    name: '궁극의 정밀 황금 도금 피처컵 (Golden Precision Pitcher)',
    category: 'measuring_cup',
    price: 1200,
    description: '황금빛으로 코팅되어 비례 배합 성비를 완벽 오차 없이 맞출 수 있는 연금술 주전자입니다.',
    multiplierBoost: 0.3,
    effectText: '골드 획득 30% 증가',
    unlocked: false,
    spriteIndex: 10
  },
  {
    id: 11,
    name: '스프링 아날로그 다이얼 저울 (Classic Dial Scale)',
    category: 'scale',
    price: 2500,
    description: '녹색 수동 메탈 하우징 바늘 다이얼. 바늘 감각 비율로 계량의 아날로그 직관을 늘립니다.',
    multiplierBoost: 0.6,
    effectText: '골드 획득 60% 대폭 인상 적용',
    unlocked: false,
    spriteIndex: 11
  },
  {
    id: 12,
    name: '고밀도 하이테크 스마트 전자저울 (High-Tech Electronic Scale)',
    category: 'scale',
    price: 6000,
    description: '밀리그램 단위의 미세 중량 정수 감도 백분율을 디스플레이로 보여주는 고효율 과학 저울.',
    multiplierBoost: 1.2,
    effectText: '골드 획득 120% 증가',
    unlocked: false,
    spriteIndex: 12
  },

  // Category 4: 데코/진열 (Decor & Display: 13-16)
  {
    id: 13,
    name: '달콤한 고정식 회전 턴테이블 (Cake Turntable)',
    category: 'other',
    price: 400,
    description: '원형 케이크와 타르트의 가생이 시럽 비율 데코를 균등하게 두를 수 있게 돕는 회전판.',
    multiplierBoost: 0.15,
    effectText: '매장 데코 효과: 골드 획득 +15% 증가',
    unlocked: false,
    spriteIndex: 13
  },
  {
    id: 14,
    name: '실리콘 8눈금 커스터드 짤주머니 (Pastry Piping Bag)',
    category: 'other',
    price: 800,
    description: '생크림 짜넣기 배분을 8등분 수식으로 조절하도록 입체 깍지를 제공하는 실리콘 주머니.',
    multiplierBoost: 0.25,
    effectText: '데코레이션 보정: 골드 획득 +25% 증가',
    unlocked: false,
    spriteIndex: 14
  },
  {
    id: 15,
    name: '원목 테이블 다층 렉 진열대 (Natural Wooden Shelf)',
    category: 'other',
    price: 2000,
    description: '갓 구운 수학 롤빵, 마카롱, 도넛의 김을 고르게 식혀 마감이 예쁜 브레드 가죽 진열대.',
    multiplierBoost: 0.5,
    effectText: '매장 비주얼: 골드 획득 +50% 증가 및 진열대 활성화',
    unlocked: false,
    spriteIndex: 15
  },
  {
    id: 16,
    name: '벨벳 LED 명품 쇼케이스 미온 냉각기 (Luxury Heated Glass Cabinet)',
    category: 'other',
    price: 5000,
    description: '고휘도 LED 간접조명과 다정히 조절되는 습도 비율 유지판이 탑재된 베이커리 쇼케이스.',
    multiplierBoost: 1.1,
    effectText: '명품 이펙트: 골드 보너스 110% 유입 증폭',
    unlocked: false,
    spriteIndex: 16
  },

  // Category 5: 연산 계산기 (Calculation devices: 17-20)
  {
    id: 17,
    name: '아기자기한 포켓 미니 계산기 (Pocket Calculator)',
    category: 'calculation',
    price: 500,
    description: '가볍게 수첩에 끼워 사용하던 포켓 초록 계산기. 십진수 누적을 편리하게 해결합니다.',
    multiplierBoost: 0.18,
    effectText: '정정 계산: 골드 획득 18% 증가',
    unlocked: false,
    spriteIndex: 17
  },
  {
    id: 18,
    name: 'Mechanical 기전식 클래식 금전등록기 (Retro POS Mechanical)',
    category: 'calculation',
    price: 1800,
    description: '키 패드를 내리는 소리가 타자기처럼 경쾌한 구식 카운터 포스. 회계 단계를 투명하게 관리합니다.',
    multiplierBoost: 0.4,
    effectText: '경영 보너스: 골드 획득 40% 증가',
    unlocked: false,
    spriteIndex: 18
  },
  {
    id: 19,
    name: '스마트 태블릿 와이드 포스기 (Smart Tablet POS Pad)',
    category: 'calculation',
    price: 4000,
    description: '손가락 터치만으로 백분율 할인 판매 단가를 그래프와 원형 차트로 그려주는 무선 패드 기기.',
    multiplierBoost: 0.9,
    effectText: '신속 정산: 골드 획득 90% 대폭 인상 적용',
    unlocked: false,
    spriteIndex: 19
  },
  {
    id: 20,
    name: 'AI 연산 메인 슈퍼 워크스테이션 모니터 (AI Calculation Terminal)',
    category: 'calculation',
    price: 8500,
    description: '베이커리 가치 환산, 재료비 손실률, 우수 손님 매출 비율을 완전 자동으로 시각화하는 우주 터미널.',
    multiplierBoost: 1.8,
    effectText: '골드 획득 180% 적용',
    unlocked: false,
    spriteIndex: 20
  }
];

/** Gold bonus: highest multiplierBoost per category among owned items (special effects use separate checks). */
export function getActiveGoldMultiplierBoost(purchasedIds: number[]): number {
  const bestByCategory = new Map<Equipment['category'], number>();

  for (const item of UPGRADE_ITEMS) {
    if (!purchasedIds.includes(item.id)) continue;
    const current = bestByCategory.get(item.category) ?? 0;
    if (item.multiplierBoost > current) {
      bestByCategory.set(item.category, item.multiplierBoost);
    }
  }

  let sum = 0;
  for (const boost of bestByCategory.values()) {
    sum += boost;
  }
  return sum;
}
