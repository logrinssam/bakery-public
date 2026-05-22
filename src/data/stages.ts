import { Stage, ShopType, MathQuestion, QuestionCategory } from '../types';

export const STAGES: Stage[] = [
  // 1-10 Cookie Shop
  { id: 1, name: '기본 쿠키 상점', representativeMenu: '기본 라운드 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 0, goldMultiplier: 1.0, theme: '기본 비의 성질' },
  { id: 2, name: '버터 쿠키 상점', representativeMenu: '버터 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 3, goldMultiplier: 1.1, theme: '기본 비의 성질' },
  { id: 3, name: '초코칩 쿠키 상점', representativeMenu: '초코칩 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 6, goldMultiplier: 1.2, theme: '상대적 비의 개념' },
  { id: 4, name: '딸기잼 쿠키 상점', representativeMenu: '딸기잼 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 9, goldMultiplier: 1.3, theme: '기준량과 비교하는 양' },
  { id: 5, name: '바닐라 쿠키 상점', representativeMenu: '바닐라 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 12, goldMultiplier: 1.4, theme: '비의 문장 표현' },
  { id: 6, name: '시나몬 쿠키 상점', representativeMenu: '시나몬 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 15, goldMultiplier: 1.5, theme: '기준량 찾기' },
  { id: 7, name: '곰돌이 쿠키 상점', representativeMenu: '모양 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 18, goldMultiplier: 1.6, theme: '비료와 기준값' },
  { id: 8, name: '별사탕 쿠키 상점', representativeMenu: '별 쿠키', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 21, goldMultiplier: 1.7, theme: '비교하는 양 찾기' },
  { id: 9, name: '선물 쿠키 상점', representativeMenu: '쿠키 박스', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 24, goldMultiplier: 1.8, theme: '비의 응용' },
  { id: 10, name: '쿠키 페스티벌', representativeMenu: '쿠키 세트', shopType: ShopType.COOKIE, backgroundImage: '/assets/shops/shop_cookie.png', requiredStars: 27, goldMultiplier: 2.0, theme: '비 단원 종합' },

  // 11-15 Cupcake Shop
  { id: 11, name: '바닐라 컵케이크 상점', representativeMenu: '바닐라 컵케이크', shopType: ShopType.CUPCAKE, backgroundImage: '/assets/shops/shop_cupcake.png', requiredStars: 30, goldMultiplier: 2.2, theme: '비율의 기호 표현' },
  { id: 12, name: '딸기 컵케이크 상점', representativeMenu: '딸기 컵케이크', shopType: ShopType.CUPCAKE, backgroundImage: '/assets/shops/shop_cupcake.png', requiredStars: 33, goldMultiplier: 2.4, theme: '비율을 분수로 나타내기' },
  { id: 13, name: '초코 컵케이크 상점', representativeMenu: '초코 컵케이크', shopType: ShopType.CUPCAKE, backgroundImage: '/assets/shops/shop_cupcake.png', requiredStars: 36, goldMultiplier: 2.6, theme: '전체에 대한 부분의 비율' },
  { id: 14, name: '생크림 컵케이크 상점', representativeMenu: '생크림 컵케이크', shopType: ShopType.CUPCAKE, backgroundImage: '/assets/shops/shop_cupcake.png', requiredStars: 39, goldMultiplier: 2.8, theme: '두 수의 크기 비교 비율' },
  { id: 15, name: '컵케이크 파티', representativeMenu: '컵케이크 세트', shopType: ShopType.CUPCAKE, backgroundImage: '/assets/shops/shop_cupcake.png', requiredStars: 42, goldMultiplier: 3.1, theme: '분수 비율 마스터' },

  // 16-20 Cake Shop
  { id: 16, name: '생크림 케이크 상점', representativeMenu: '생크림 케이크', shopType: ShopType.CAKE, backgroundImage: '/assets/shops/shop_cake.png', requiredStars: 45, goldMultiplier: 3.4, theme: '비율을 소수로 나타내기' },
  { id: 17, name: '딸기 케이크 상점', representativeMenu: '딸기 케이크', shopType: ShopType.CAKE, backgroundImage: '/assets/shops/shop_cake.png', requiredStars: 48, goldMultiplier: 3.7, theme: '소수 비율 계산' },
  { id: 18, name: '초코 케이크 상점', representativeMenu: '초코 케이크', shopType: ShopType.CAKE, backgroundImage: '/assets/shops/shop_cake.png', requiredStars: 51, goldMultiplier: 4.0, theme: '기준량이 100일 때의 비율' },
  { id: 19, name: '과일 케이크 상점', representativeMenu: '과일 케이크', shopType: ShopType.CAKE, backgroundImage: '/assets/shops/shop_cake.png', requiredStars: 54, goldMultiplier: 4.4, theme: '실생활 소수 비율 응용' },
  { id: 20, name: '케이크 대회장', representativeMenu: '케이크 세트', shopType: ShopType.CAKE, backgroundImage: '/assets/shops/shop_cake.png', requiredStars: 57, goldMultiplier: 4.8, theme: '비율 소수 마스터' },

  // 21-25 Donut Shop
  { id: 21, name: '기본 도넛 상점', representativeMenu: '기본 도넛', shopType: ShopType.DONUT, backgroundImage: '/assets/shops/shop_donut.png', requiredStars: 60, goldMultiplier: 5.2, theme: '백분율의 의미와 기호' },
  { id: 22, name: '글레이즈 도넛 상점', representativeMenu: '글레이즈 도넛', shopType: ShopType.DONUT, backgroundImage: '/assets/shops/shop_donut.png', requiredStars: 63, goldMultiplier: 5.6, theme: '비율을 백분율로 바꾸기' },
  { id: 23, name: '초코 도넛 상점', representativeMenu: '초코 도넛', shopType: ShopType.DONUT, backgroundImage: '/assets/shops/shop_donut.png', requiredStars: 66, goldMultiplier: 6.0, theme: '백분율을 소수/분수로 바꾸기' },
  { id: 24, name: '스프링클 도넛 상점', representativeMenu: '스프링클 도넛', shopType: ShopType.DONUT, backgroundImage: '/assets/shops/shop_donut.png', requiredStars: 69, goldMultiplier: 6.5, theme: '전체의 백분율 구하기' },
  { id: 25, name: '도넛 박스 상점', representativeMenu: '도넛 박스', shopType: ShopType.DONUT, backgroundImage: '/assets/shops/shop_donut.png', requiredStars: 72, goldMultiplier: 7.0, theme: '백분율 마스터' },

  // 26-30 Macaron Shop
  { id: 26, name: '딸기 마카롱 상점', representativeMenu: '딸기 마카롱', shopType: ShopType.MACARON, backgroundImage: '/assets/shops/shop_macaron.png', requiredStars: 75, goldMultiplier: 7.6, theme: '백분율로 비교하는 양 구하기' },
  { id: 27, name: '민트 마카롱 상점', representativeMenu: '민트 마카롱', shopType: ShopType.MACARON, backgroundImage: '/assets/shops/shop_macaron.png', requiredStars: 78, goldMultiplier: 8.2, theme: '백분율과 실제 수량' },
  { id: 28, name: '초코 마카롱 상점', representativeMenu: '초코 마카롱', shopType: ShopType.MACARON, backgroundImage: '/assets/shops/shop_macaron.png', requiredStars: 81, goldMultiplier: 8.8, theme: '비율을 통한 양의 배분' },
  { id: 29, name: '선물 마카롱 상점', representativeMenu: '마카롱 박스', shopType: ShopType.MACARON, backgroundImage: '/assets/shops/shop_macaron.png', requiredStars: 84, goldMultiplier: 9.5, theme: '여러 성분의 비율 관계' },
  { id: 30, name: '디저트 박람회', representativeMenu: '디저트 세트', shopType: ShopType.MACARON, backgroundImage: '/assets/shops/shop_macaron.png', requiredStars: 87, goldMultiplier: 10.2, theme: '마카롱 비율 마스터' },

  // 31-40 Discount Market
  { id: 31, name: '할인 쿠키 마켓', representativeMenu: '할인 쿠키 세트', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 90, goldMultiplier: 11.0, theme: '할인율 계산 원리' },
  { id: 32, name: '할인 케이크 마켓', representativeMenu: '할인 케이크', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 94, goldMultiplier: 11.8, theme: '인하된 판매가격 구하기' },
  { id: 33, name: '쿠폰 베이커리', representativeMenu: '쿠폰 상품', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 98, goldMultiplier: 12.6, theme: '쿠폰 할인가 계산' },
  { id: 34, name: '오전 세일 상점', representativeMenu: '세일 빵', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 102, goldMultiplier: 13.5, theme: '할인율 역산하기' },
  { id: 35, name: '오후 세일 상점', representativeMenu: '세일 세트', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 106, goldMultiplier: 14.5, theme: '세트 할인율 비교' },
  { id: 36, name: '인기 메뉴 상점', representativeMenu: '인기 메뉴', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 110, goldMultiplier: 15.5, theme: '증가율과 감소율' },
  { id: 37, name: '재고 정리 상점', representativeMenu: '재고 상품', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 114, goldMultiplier: 16.6, theme: '원가와 할인가 비율' },
  { id: 38, name: '프리미엄 세트 상점', representativeMenu: '프리미엄 세트', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 118, goldMultiplier: 17.8, theme: '복수 할인 적용' },
  { id: 39, name: '단골 쿠폰 상점', representativeMenu: '단골 세트', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 122, goldMultiplier: 19.0, theme: '할인 금액과 할인율 관계' },
  { id: 40, name: '백분율 마스터 마켓', representativeMenu: '마스터 세트', shopType: ShopType.MARKET, backgroundImage: '/assets/shops/shop_market.png', requiredStars: 126, goldMultiplier: 20.5, theme: '비율과 백분율 마스터' },

  // 41-45 Royal Bakery
  { id: 41, name: '왕실 쿠키 베이커리', representativeMenu: '왕실 쿠키', shopType: ShopType.ROYAL, backgroundImage: '/assets/shops/shop_royal.png', requiredStars: 130, goldMultiplier: 22.0, theme: '소금물과 시럽 농도 비율' },
  { id: 42, name: '왕실 케이크 베이커리', representativeMenu: '왕실 케이크', shopType: ShopType.ROYAL, backgroundImage: '/assets/shops/shop_royal.png', requiredStars: 135, goldMultiplier: 23.5, theme: '성분 비율의 혼합 계산' },
  { id: 43, name: '왕실 도넛 베이커리', representativeMenu: '왕실 도넛', shopType: ShopType.ROYAL, backgroundImage: '/assets/shops/shop_royal.png', requiredStars: 140, goldMultiplier: 25.0, theme: '기준량의 역산' },
  { id: 44, name: '왕실 마카롱 베이커리', representativeMenu: '왕실 마카롱', shopType: ShopType.ROYAL, backgroundImage: '/assets/shops/shop_royal.png', requiredStars: 145, goldMultiplier: 27.0, theme: '전체의 수 추정하기' },
  { id: 45, name: '황금 레시피 상점', representativeMenu: '황금 레시피', shopType: ShopType.ROYAL, backgroundImage: '/assets/shops/shop_royal.png', requiredStars: 150, goldMultiplier: 30.0, theme: '황금 비율 분배' },

  // 46-50 Hall of Fame
  { id: 46, name: '베이커리 챔피언십', representativeMenu: '대회 세트', shopType: ShopType.FINAL, backgroundImage: '/assets/shops/shop_final.png', requiredStars: 155, goldMultiplier: 33.0, theme: '종합 응용 문장제 1' },
  { id: 47, name: '별빛 베이커리', representativeMenu: '별빛 디저트', shopType: ShopType.FINAL, backgroundImage: '/assets/shops/shop_final.png', requiredStars: 160, goldMultiplier: 36.5, theme: '종합 응용 문장제 2' },
  { id: 48, name: '꿈빛 베이커리', representativeMenu: '꿈빛 디저트', shopType: ShopType.FINAL, backgroundImage: '/assets/shops/shop_final.png', requiredStars: 166, goldMultiplier: 40.0, theme: '종합 응용 문장제 3' },
  { id: 49, name: '전설의 베이커리', representativeMenu: '전설의 빵', shopType: ShopType.FINAL, backgroundImage: '/assets/shops/shop_final.png', requiredStars: 172, goldMultiplier: 45.0, theme: '전설 레시피 비율 탐구' },
  { id: 50, name: '명예의 베이커리', representativeMenu: '시그니처 빵', shopType: ShopType.FINAL, backgroundImage: '/assets/shops/shop_final.png', requiredStars: 180, goldMultiplier: 50.0, theme: '비와 비율의 마스터 선서' }
];

export const QUESTIONS_PER_STAGE = 10;

// Helper to determine clean whole number factors
function getCleanFraction(seed: number): { numerator: number; denominator: number; decimal: number; percent: number } {
  const choices = [
    { numerator: 1, denominator: 2, decimal: 0.5, percent: 50 },
    { numerator: 1, denominator: 4, decimal: 0.25, percent: 25 },
    { numerator: 3, denominator: 4, decimal: 0.75, percent: 75 },
    { numerator: 1, denominator: 5, decimal: 0.2, percent: 20 },
    { numerator: 2, denominator: 5, decimal: 0.4, percent: 40 },
    { numerator: 3, denominator: 5, decimal: 0.6, percent: 60 },
    { numerator: 4, denominator: 5, decimal: 0.8, percent: 80 },
    { numerator: 1, denominator: 10, decimal: 0.1, percent: 10 },
    { numerator: 3, denominator: 10, decimal: 0.3, percent: 30 },
    { numerator: 7, denominator: 10, decimal: 0.7, percent: 70 },
    { numerator: 9, denominator: 10, decimal: 0.9, percent: 90 },
    { numerator: 1, denominator: 20, decimal: 0.05, percent: 5 },
    { numerator: 3, denominator: 20, decimal: 0.15, percent: 15 },
    { numerator: 7, denominator: 20, decimal: 0.35, percent: 35 },
    { numerator: 9, denominator: 20, decimal: 0.45, percent: 45 },
    { numerator: 11, denominator: 20, decimal: 0.55, percent: 55 },
    { numerator: 13, denominator: 20, decimal: 0.65, percent: 65 },
    { numerator: 17, denominator: 20, denominatorText: '20', decimal: 0.85, percent: 85 },
    { numerator: 1, denominator: 25, decimal: 0.04, percent: 4 },
    { numerator: 2, denominator: 25, decimal: 0.08, percent: 8 },
    { numerator: 4, denominator: 25, decimal: 0.16, percent: 16 },
    { numerator: 12, denominator: 25, decimal: 0.48, percent: 48 },
    { numerator: 3, denominator: 50, decimal: 0.06, percent: 6 }
  ];
  return choices[seed % choices.length];
}

export function generateQuestionsForStage(stageId: number): MathQuestion[] {
  const stage = STAGES.find(s => s.id === stageId) || STAGES[0];
  const questions: MathQuestion[] = [];
  const menu = stage.representativeMenu;

  // 10 questions per stage (reuses 5 templates with varied seeds for 6–10)
  for (let qIndex = 1; qIndex <= QUESTIONS_PER_STAGE; qIndex++) {
    const slot = ((qIndex - 1) % 5) + 1;
    const seed = (stageId * 7) + (qIndex * 13);
    const id = (stageId * 100) + qIndex;

    if (stage.shopType === ShopType.COOKIE) {
      // 1-10: Basic Ratio Expression
      if (slot === 1) {
        // Simple Ratio count
        const countA = 3 + (seed % 6);
        const countB = 2 + ((seed + 2) % 5);
        questions.push({
          id,
          category: QuestionCategory.RATIO_EXPRESSION,
          questionText: `우리 베이커리 주방에 ${menu}를 굽기 위해 버터 ${countA}조각과 설탕 ${countB}컵이 있습니다. 버터 수와 설탕 수의 '비'를 기호(:)를 사용하여 나타내세요.`,
          helperText: '기호를 사용하여 "A와 B의 비"를 나타냅니다.',
          recipeDetails: { itemA: '버터', itemB: '설탕', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`, `${countA} : ${countB}`],
          hint: 'A와 B의 비는 기호(:)를 사용하여 A:B 형태로 나타냅니다. 순서가 밀리지 않도록 하세요.'
        });
      } else if (slot === 2) {
        // A에 대한 B의 비와 같은 함정 문제
        const compareVal = 2 + (seed % 5);
        const baseVal = 5 + ((seed + 1) % 6);
        // "A에 대한 B의 비", comparing is B (compareVal), basis is A (baseVal). So ratio is B:A (compareVal:baseVal)
        questions.push({
          id,
          category: QuestionCategory.RATIO_EXPRESSION,
          questionText: `초코 조각 ${baseVal}개에 대한 크림 ${compareVal}개의 '비'를 기호(:)를 사용해 나타내세요.`,
          helperText: '"~에 대한"이 붙는 양이 뒤쪽에 옵니다.',
          correctAnswer: `${compareVal}:${baseVal}`,
          acceptableAnswers: [`${compareVal}:${baseVal}`, `${compareVal} : ${baseVal}`],
          hint: '초등학교 6학년 수학의 핵심! "~에 대한"이 달라붙는 쪽이 언제나 뒤쪽인 "기준량(오른쪽)"에 배치됩니다. 따라서 "A에 대한 B의 비"는 B:A 입니다!'
        });
      } else if (slot === 3) {
        // 기준량 맞추기
        const countA = 4 + (seed % 6);
        const countB = 7 + ((seed + 3) % 4);
        questions.push({
          id,
          category: QuestionCategory.RATIO_EXPRESSION,
          questionText: `쿠키 틀 ${countA}개와 밀대 ${countB}개가 있습니다. '밀대 수에 대한 쿠키 틀 수의 비'에서 '기준량'은 얼마입니까?`,
          helperText: '숫자 하나를 적어보세요.',
          correctAnswer: `${countB}`,
          acceptableAnswers: [`${countB}`],
          hint: '"밀대 수에 대한" 이라고 했으니 밀대 수가 기준량(뒤)이 됩니다. 뒤에 놓인 숫자를 적으면 됩니다.'
        });
      } else if (slot === 4) {
        // 비교하는 양 맞추기
        const countA = 5 + (seed % 5);
        const countB = 9 + ((seed + 1) % 4);
        questions.push({
          id,
          category: QuestionCategory.RATIO_EXPRESSION,
          questionText: `'계량컵 수 ${countA}개와 오븐 수 ${countB}개의 비'에서 '비교하는 양'은 무엇입니까?`,
          helperText: '숫자 하나를 적어세요.',
          correctAnswer: `${countA}`,
          acceptableAnswers: [`${countA}`],
          hint: '"A와 B의 비"는 A:B 입니다. 기호(:) 왼쪽에 있는 양이 바로 비교하는 양입니다.'
        });
      } else {
        // Interactive Ratio builder representation
        const countA = 2 + (seed % 4);
        const countB = 3 + ((seed + 2) % 4);
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `아래 재료 도구에서 밀가루(${countA}컵)와 우유(${countB}컵)를 볼에 넣어서 반죽의 비인 ${countA}:${countB}를 만족하는 쿠키를 제작하세요.`,
          helperText: '아래 버튼으로 올바른 수량만큼 재료를 추가하세요!',
          recipeDetails: { itemA: '밀가루', itemB: '우유', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '밀가루를 ' + countA + '번 넣고, 우유를 ' + countB + '번 넣어 주방 그릇을 채운 후 베이킹 버튼을 누르세요!'
        });
      }

    } else if (stage.shopType === ShopType.CUPCAKE) {
      // 11-15: Cupcake Shop (Ratio Value in Fraction)
      const frac = getCleanFraction(seed);
      if (slot === 1) {
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_FRACTION,
          questionText: `컵케이크 세트에 포함된 전체 컵케이크 ${frac.denominator}개 중, 초코 맛이 ${frac.numerator}개 있습니다. 전체 컵케이크 수에 대한 초코 컵케이크 수의 '비율'을 분수로 나타내세요. (예: 2/5 형식)`,
          helperText: '분모/분자 형태로 입력하세요.',
          correctAnswer: `${frac.numerator}/${frac.denominator}`,
          acceptableAnswers: [`${frac.numerator}/${frac.denominator}`],
          hint: '비율 = (비교하는 양) ÷ (기준량) 입니다. "전체 수에 대한" 이므로 분모가 전체 수인 ' + frac.denominator + ' 이 되고, 초코 수가 분자인 ' + frac.numerator + ' 가 됩니다.'
        });
      } else if (slot === 2) {
        // Comparing A vs B ratio value
        const valA = 3 + (seed % 6);
        const valB = 10;
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_FRACTION,
          questionText: `우리 컵케이크 상점에는 바닐라 오일 ${valA}L와 물 ${valB}L를 혼합한 특제 소스가 있습니다. '물 양에 대한 바닐라 오일 양의 비율'을 기약분수로 나타내세요.`,
          correctAnswer: `${valA / 2 === Math.floor(valA / 2) && valB / 2 === Math.floor(valB / 2) ? (valA / 2) + '/' + (valB / 2) : valA + '/' + valB}`,
          acceptableAnswers: [
            `${valA}/${valB}`,
            `${valA / 2 === Math.floor(valA / 2) ? (valA / 2) + '/' + (valB / 2) : valA + '/' + valB}`
          ],
          hint: '물에 대한 비율이므로 기준량은 물(10)입니다. 비율은 기약분수 형태로 약분하여도 정답 인정됩니다.'
        });
      } else if (slot === 3) {
        // Percentage conversion basic
        const frac2 = getCleanFraction(seed + 1);
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_FRACTION,
          questionText: `어느 단골 손님이 컵케이크 상자 ${frac2.denominator}개 중 ${frac2.numerator}개에 분홍색 리본을 묶어 달라고 신청했습니다. 리본을 묶은 상자 수의 비율을 분수 형태로 나타내세요.`,
          correctAnswer: `${frac2.numerator}/${frac2.denominator}`,
          acceptableAnswers: [`${frac2.numerator}/${frac2.denominator}`],
          hint: '전체 상자 수에 대한 리본 달린 상자 수입니다. 분모는 ' + frac2.denominator + ', 분자는 ' + frac2.numerator + ' 입니다.'
        });
      } else if (slot === 4) {
        // Option select question
        const options = ['3/4', '1/4', '4/3', '1/3'];
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_FRACTION,
          questionText: `딸기 크림 컵케이크 4개와 초코 크림 컵케이크 3개가 있습니다. 초코 컵케이크 수에 대한 딸기 컵케이크 수의 비율을 고르세요.`,
          options,
          correctAnswer: `4/3`,
          acceptableAnswers: [`4/3`, `4 / 3`],
          hint: '초코 컵케이크 수에 대한 비율이므로, 초코 컵케이크 수인 3이 기준량(분모), 딸기 컵케이크 수인 4가 비교하는 양(분자)이 됩니다. 따라서 4/3입니다.'
        });
      } else {
        // Interactive Ratio Builder
        const countA = 1 + (seed % 3);
        const countB = 4;
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `체리 컵케이크의 황금 생크림 비는 체리 시럽 ${countA}방울 대 바닐라 크림 ${countB}번입니다. 이 비율에 알맞게 재료들을 볼에 담아 베이킹하세요.`,
          recipeDetails: { itemA: '체리시럽', itemB: '바닐라크림', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '체리시럽 ' + countA + '번, 바닐라크림 ' + countB + '번 채워주세요!'
        });
      }

    } else if (stage.shopType === ShopType.CAKE) {
      // 16-20: Cake Shop (Ratio Value in Decimal)
      const frac = getCleanFraction(seed);
      if (slot === 1) {
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_DECIMAL,
          questionText: `블루베리 케이크 ${frac.denominator}개를 진열하기 위해 장식 깃발 ${frac.numerator}개를 골고루 꽂아 장식했습니다. 케이크 수에 대한 블루베리 장식 수가 차지하는 비율을 '소수'로 나타내세요.`,
          correctAnswer: `${frac.decimal}`,
          acceptableAnswers: [`${frac.decimal}`, `${frac.decimal}`.replace('0.', '.')],
          hint: `비율인 분수 ${frac.numerator}/${frac.denominator}를 소수로 환산하기 위해 분자를 분모로 나누면 됩니다: ${frac.numerator} ÷ ${frac.denominator} = ${frac.decimal} 입니다.`
        });
      } else if (slot === 2) {
        // Decimal ratio of water vs oil
        const compare = 3;
        const total = 5; // 3/5 = 0.6
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_DECIMAL,
          questionText: `우리 베이커리 쇼케이스에 장식용 케이크 5개 중 3개가 딸기 케이크입니다. 전체 진열 케이크 수에 대한 딸기 케이크 수의 비율을 소수로 구하세요.`,
          correctAnswer: `0.6`,
          acceptableAnswers: [`0.6`, `.6`],
          hint: '3/5을 소수로 나타내면 0.6입니다.'
        });
      } else if (slot === 3) {
        // Large cake slicing ratio fraction to decimal
        const sliceNum = 4;
        const totalSlices = 20; // 4/20 = 0.2
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_DECIMAL,
          questionText: `커다란 케이크를 20조각으로 자른 뒤, 그 중 ${sliceNum}조각을 즉시 판매하였습니다. 전체 조각 수에 대한 판매된 조각 수의 비율을 소수로 나타내세요.`,
          correctAnswer: `0.2`,
          acceptableAnswers: [`0.2`, `.2`],
          hint: `${sliceNum}/20 = 2/10 이므로 소수 한 자리수인 0.2가 됩니다.`
        });
      } else if (slot === 4) {
        const optionList = ['0.12', '0.4', '0.25', '0.3'];
        questions.push({
          id,
          category: QuestionCategory.RATIO_VALUE_DECIMAL,
          questionText: `초코 케이크 시트를 굽기 위해 밀가루 25컵과 초콜릿 가루 3컵을 섞었습니다. 밀가루 양에 대한 초콜릿 가루 양의 비율을 소수 값으로 선택하세요.`,
          options: optionList,
          correctAnswer: `0.12`,
          acceptableAnswers: [`0.12`, `.12`],
          hint: '3/25의 비율입니다. 분모와 분자에 각각 4를 곱하면 12/100 이 되어 소수로는 0.12가 됩니다.'
        });
      } else {
        // Interactive Ratio Builder
        const countA = 1;
        const countB = 4;
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `무지개 조각 케이크는 식용 색소 ${countA}방울과 백년초 가루 ${countB}스푼이 혼합되어 소수 비율 0.25를 만족해야 맛있게 만들어집니다. 수량대로 배합하세요.`,
          recipeDetails: { itemA: '식용색소', itemB: '백년초가루', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '식용색소 1번, 백년초가루 4번을 넣으면 비율은 1/5, 즉 0.2가 아니라 1 ÷ 4 = 0.25의 비가 성립됩니다!'
        });
      }

    } else if (stage.shopType === ShopType.DONUT) {
      // 21-25: Donut Shop (Percentage Conversions)
      const frac = getCleanFraction(seed);
      if (slot === 1) {
        questions.push({
          id,
          category: QuestionCategory.PERCENTAGE_CONVERSION,
          questionText: `오늘 구운 도넛 25개 중에서 ${frac.denominator === 25 ? frac.numerator : Math.round(25 * frac.decimal)}개가 생크림 스프링클 도넛입니다. 생크림 도넛이 차지하는 비율은 몇 '%' 입니까? (기호는 빼고 정수만 적으세요)`,
          correctAnswer: `${frac.percent}`,
          acceptableAnswers: [`${frac.percent}`],
          unit: '%',
          hint: `백분율은 기준량을 100으로 둘 때의 비율입니다. 소수 비율에 100을 곱하면 퍼센트(%) 단위를 얻을 수 있습니다: ${frac.decimal} × 100 = ${frac.percent}% 입니다.`
        });
      } else if (slot === 2) {
        const decimalVal = 0.15 + ((seed % 10) / 100); // from 0.15 to 0.24
        const ansPercent = Math.round(decimalVal * 100);
        questions.push({
          id,
          category: QuestionCategory.PERCENTAGE_CONVERSION,
          questionText: `기본 도넛의 마진 비율 계산값이 ${decimalVal.toFixed(2)} 입니다. 이 소수 비율을 백분율(%)로 표기하면 얼마입니까?`,
          correctAnswer: `${ansPercent}`,
          acceptableAnswers: [`${ansPercent}`],
          unit: '%',
          hint: '소수에 100을 곱한 뒤 % 기호를 붙이면 백분율이 완성됩니다. 예: 0.15는 15% 입니다.'
        });
      } else if (slot === 3) {
        const numer = 3;
        const denom = 5; // 3/5 = 60
        questions.push({
          id,
          category: QuestionCategory.PERCENTAGE_CONVERSION,
          questionText: `단골 도넛 세트 박스 속 ${denom}가지 도넛 중 초콜릿 코팅 버전은 ${numer}가지입니다. 초콜릿 도넛의 비중은 전체의 몇 % 입니까?`,
          correctAnswer: `60`,
          acceptableAnswers: [`60`],
          unit: '%',
          hint: `${numer}/${denom} = 6/10 = 60/100 이므로, 100을 곱하면 60%가 됩니다.`
        });
      } else if (slot === 4) {
        // Selection options
        const opts = ['15%', '35%', '45%', '55%'];
        questions.push({
          id,
          category: QuestionCategory.PERCENTAGE_CONVERSION,
          questionText: `기본 글레이즈 도넛을 완성하는 데 필요한 밀가루 20스푼 중, 9스푼이 감자 전분 분말입니다. 전체 분량 중 감자 전분이 차지하는 비중은 몇 % 인지 고르세요.`,
          options: opts,
          correctAnswer: `45%`,
          acceptableAnswers: [`45%`, `45`],
          unit: '%',
          hint: '9/20 = 45/100 이 되므로 백분율은 45% 입니다.'
        });
      } else {
        // Interactive Ratio Builder
        const countA = 3;
        const countB = 2; // Ratio 3:2 -> portion is 3/5 = 60%
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `설탕 도넛 요리 기법에서는 글레이즈 시럽 ${countA}g 과 설탕 파우더 ${countB}g 을 잘 섞어야 합니다. 시럽이 전체 수량의 60% 기여도를 가질 수 있도록 알맞게 투입하세요.`,
          recipeDetails: { itemA: '글레이즈시럽', itemB: '설탕파우더', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '글레이즈시럽 3번, 설탕파우더 2번을 배합하면 전체 5 중에서 시럽 3의 비중인 3/5 = 60% 가 성립됩니다.'
        });
      }

    } else if (stage.shopType === ShopType.MACARON) {
      // 26-30: Macaron Shop (Calculate Target Value from Percentage)
      const totalMacarons = 10 + ((seed % 5) * 10); // 10, 20, 30, 40, 50
      const frac = getCleanFraction(seed + 2);
      const targetCount = Math.round(totalMacarons * (frac.percent / 100));
      if (slot === 1) {
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `마카롱 단체 포장 상자 한 개에 총 ${totalMacarons}개의 알록달록한 마카롱이 가득 들어있습니다. 그 중 딸기 마카롱의 백분율이 ${frac.percent}% 일 때, 실제 상자 안의 딸기 마카롱은 몇 개입니까?`,
          correctAnswer: `${targetCount}`,
          acceptableAnswers: [`${targetCount}`],
          unit: '개',
          hint: `'비교하는 양(딸기 수) = 기준량(전체 마카롱 수) × 비율(백분율 ÷ 100)' 공식을 활용해 보세요: ${totalMacarons} × ${frac.percent / 100} = ${targetCount}개 입니다.`
        });
      } else if (slot === 2) {
        const total = 40;
        const percent = 25; // 40 * 0.25 = 10
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `고객님이 민트 마카롱 세트 40개를 미리 주문하셨습니다. 민트 마카롱 세트 중 25%에는 장식용 별가루를 뿌리기로 했습니다. 별가루를 뿌릴 민트 마카롱은 총 몇 개입니까?`,
          correctAnswer: `10`,
          acceptableAnswers: [`10`],
          unit: '개',
          hint: '40개의 25% (40 × 0.25)는 10개입니다.'
        });
      } else if (slot === 3) {
        const totalNum = 15;
        const ratioText = '4:1'; // chocolate to vanilla. chocolate is 4/5, vanilla is 1/5
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `우리 마카롱 창고에 초콜릿 꼬끄와 바닐라 꼬끄의 개수 비가 ${ratioText} 로 보관되어 있습니다. 보관된 전체 꼬끄의 수가 15개일 때, 바닐라 꼬끄는 몇 개입니까?`,
          correctAnswer: `3`,
          acceptableAnswers: [`3`],
          unit: '개',
          hint: '전체 15개 중 바닐라 꼬끄는 비 4:1의 비율 배분에 의해 전체의 1/(4+1) = 1/5 만큼을 차지합니다. 따라서 15 × 1/5 = 3개 입니다.'
        });
      } else if (slot === 4) {
        const optionSelect = ['6개', '12개', '18개', '24개'];
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `마카롱 페스티벌 세트의 총 30개 디저트 중, 필링이 버터 크림인 디저트의 비율이 40% 입니다. 버터 크림 필링 디저트는 몇 개인지 선택하세요.`,
          options: optionSelect,
          correctAnswer: `12개`,
          acceptableAnswers: [`12개`, `12`],
          unit: '개',
          hint: '30 × 0.4 = 12개 입니다.'
        });
      } else {
        // Interactive Ratio Builder
        const countA = 4;
        const countB = 1;
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `레몬 마카롱 완성도를 높이려면 레몬 제스트 ${countA}조각과 라임 가루 ${countB}스푼을 혼합 투입해야 합니다. 두 성분의 무게비가 4:1을 나타내도록 그릇에 채우세요.`,
          recipeDetails: { itemA: '레몬제스트', itemB: '라임가루', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '레몬제스트 4번, 라임가루 1번을 투입해서 딱 알맞는 신맛 비율을 맞추어 보세요.'
        });
      }

    } else if (stage.shopType === ShopType.MARKET) {
      // 31-40: Discount Market (Sales & Percentages)
      const basePrice = 2000 + ((seed % 10) * 1000); // 2000 ~ 11000
      const discountRates = [10, 15, 20, 25, 30, 40, 50];
      const discountRate = discountRates[seed % discountRates.length];
      const savings = Math.round(basePrice * (discountRate / 100));
      const salePrice = basePrice - savings;

      if (slot === 1) {
        questions.push({
          id,
          category: QuestionCategory.DISCOUNT_CALCULATION,
          questionText: `우리 베이커리 마켓의 ${menu} 가격은 원래 ${basePrice}원 입니다. 오늘 '반짝 타임 세일'로 ${discountRate}% 할인해 준다면, 손님이 지불할 할인 판매 가격은 원래 금액에서 얼마로 조정됩니까? (단위 빼고 숫자만 입력)`,
          correctAnswer: `${salePrice}`,
          acceptableAnswers: [`${salePrice}`],
          unit: '원',
          hint: `'지불할 가격 = 원래 가격 × (1 - 할인율 ÷ 100)' 공식을 대입합니다: ${basePrice} × (1 - ${discountRate / 100}) = ${salePrice}원 입니다.`
        });
      } else if (slot === 2) {
        const fixedBasePrice = 8000;
        const fixedSalePrice = 6400; // 1600 off = 20%
        questions.push({
          id,
          category: QuestionCategory.DISCOUNT_CALCULATION,
          questionText: `마켓 카운터에서 원래 8000원인 스페셜 케이크 한 판을 폐점 직전 떨이로 6400원에 저렴하게 긴급 양도하였습니다. 이 케이크의 '할인율'은 몇 % 이었습니까?`,
          correctAnswer: `20`,
          acceptableAnswers: [`20`],
          unit: '%',
          hint: '할인된 액수는 8000 - 6400 = 1600원 입니다. 할인율은 원래 금액 대비 할인 금액의 비율을 뜻해요: 1600 ÷ 8000 = 0.2 이므로 백분율로 환산하면 20% 입니다.'
        });
      } else if (slot === 3) {
        const beforePrice = 12000;
        const couponVal = 15; // 1800 off = 10200
        questions.push({
          id,
          category: QuestionCategory.DISCOUNT_CALCULATION,
          questionText: `특별 미션을 통과한 우수 고객이 단골 쿠폰 15% 기프트 태그를 적용해 12000원짜리 파티 롤케이크를 구매했습니다. 할인 혜택을 받아 깎아준 순수 '할인 금액'은 얼마입니까?`,
          correctAnswer: `1800`,
          acceptableAnswers: [`1800`],
          unit: '원',
          hint: '구매하려는 가격이 아닌 깎아준 "순수 할인 금액"을 묻는 질문입니다. 원래 금액의 15% 를 구하면 됩니다: 12000 × 0.15 = 1800원 입니다.'
        });
      } else if (slot === 4) {
        const optionMarket = ['5250원', '4500원', '5500원', '6000원'];
        questions.push({
          id,
          category: QuestionCategory.DISCOUNT_CALCULATION,
          questionText: `오전 한정 세일 기간으로 정가 7500원인 프레시 바게트 샌드위치를 30% 저렴한 가격에 판매하고 있습니다. 실제 판매 가격을 선택하세요.`,
          options: optionMarket,
          correctAnswer: `5250원`,
          acceptableAnswers: [`5250원`, `5250`],
          unit: '원',
          hint: '할인율 30%를 빼고 정가의 70% 가격만 받습니다. 7500 × 0.7 = 5250원 입니다.'
        });
      } else {
        // Interactive Ratio Builder for mixing flour & starch
        const countA = 3;
        const countB = 7;
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `할인용 저가형 마가린 반죽을 만들기 위해 대용량 오일 ${countA}잔과 정제 팜유 ${countB}잔을 잘 섞어 최적의 백분율 기름 혼합 마가린을 베이킹하세요.`,
          recipeDetails: { itemA: '대용량오일', itemB: '정제팜유', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '대용량오일 3번, 정제팜유 7번을 넣어 3:7 오일 배합을 완료하세요.'
        });
      }

    } else if (stage.shopType === ShopType.ROYAL) {
      // 41-45: Royal Bakery ( Mixtures & Advanced Rates & Compound Ratios )
      if (slot === 1) {
        // Percentage of mixture concentration
        const glucoseGram = 40;
        const creamGram = 160; // total 200g. 40/200 = 20%
        questions.push({
          id,
          category: QuestionCategory.PERCENTAGE_CONVERSION,
          questionText: `왕실 전용 로열 시럽 소스를 조제하기 위해, 포도당 분말 ${glucoseGram}g 과 생크림 베이스 무스 ${creamGram}g 을 오븐 비커에 담아 골고루 혼합했습니다. 완성된 포도당 무스 혼합물 속에서 포도당 농도(비중)는 몇 % 입니까?`,
          correctAnswer: `20`,
          acceptableAnswers: [`20`],
          unit: '%',
          hint: '혼합 설탕 시럽/무스의 농도 비율을 구하는 문제입니다. 기준량은 분말과 무스 전체를 골고루 합친 총 중량입니다: 40 + 160 = 200g. 비교하는 비교량은 포도당 무게인 40g입니다. 따라서 비율은 40 ÷ 200 = 0.2, 백분율 표기는 20% 입니다!'
        });
      } else if (slot === 2) {
        // Reverse calculation of original base amount
        const savingsCost = 1500;
        const disPercent = 30; // 1500 / 0.3 = 5000
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `왕실 파티용 크라운 쉬폰 케이크를 구매하려는데, 30% 골든 킹 쿠폰을 적용하니 원래 가격보다 무려 ${savingsCost}원이 저렴해졌습니다. 이 로열 크라운 케이크의 쿠폰 적용 전 '원래의 정상 정가'는 몇 원이었나요?`,
          correctAnswer: `5000`,
          acceptableAnswers: [`5000`],
          unit: '원',
          hint: '할인된 차액 1500원 자체가 원래 정가의 30%에 해당하는 가치를 가집니다. 따라서 기준량(원래의 가격) = 비교하는 양(할인 금액) ÷ 할인율식에 대입해 거꾸로 추적하세요: 1500 ÷ 0.3 = 5000원 입니다.'
        });
      } else if (slot === 3) {
        const goldenN = 3;
        const royalN = 8;
        questions.push({
          id,
          category: QuestionCategory.RATIO_EXPRESSION,
          questionText: `특제 로열 크루아상의 최고 식감을 내기 위해 꿀 소스 ${goldenN}스푼을 넣고 이스트 밀가루 반죽 ${royalN}스푼을 대조하여 반죽을 치댑니다. '꿀 소스 수에 대한 이스트 반죽 수의 비'를 올바르게 작성하세요.`,
          correctAnswer: `${royalN}:${goldenN}`,
          acceptableAnswers: [`${royalN}:${goldenN}`, `${royalN} : ${goldenN}`],
          hint: '"꿀 소스 수에 대한" 이므로 꿀 소스 수(' + goldenN + ')가 영리하게 오른쪽 기준량으로 이동하고, 이스트 반죽 수(' + royalN + ')가 왼쪽 비교하는 양에 할당됩니다.'
        });
      } else if (slot === 4) {
        const optionRoyalList = ['150개', '200개', '250개', '300개'];
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `황금 밀가루 자루에서 크루아상을 굽고 남은 사용 불가능한 부스러기가 무려 60개입니다. 이것이 오늘 사용한 전체 밀가루 분량의 30% 비중이라면, 오늘 처음 사용하기 시작한 황금 밀가루 자루의 전체 무게(개수)는 몇 단위였을까요?`,
          options: optionRoyalList,
          correctAnswer: `200개`,
          acceptableAnswers: [`200개`, `200`],
          unit: '개',
          hint: '60개가 전체의 30%에 해당하므로 전체 분량은 60 ÷ 0.3 = 200개 입니다.'
        });
      } else {
        // Interactive Ratio Builder
        const countA = 5;
        const countB = 3;
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `로열 티타림 허니 마카롱은 최고 꿀액체 ${countA}방울과 프리미엄 천일염 가루 ${countB}꼬집이 정교하게 5:3 비율을 교차 성립해야 입안에서 사르르 녹아내립니다. 볼을 알맞게 채워 베이킹하세요.`,
          recipeDetails: { itemA: '최고꿀액체', itemB: '천일염가루', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '최고꿀액체 5번, 천일염가루 3번을 정교하게 넣어서 5:3 레시피를 달성하세요!'
        });
      }

    } else {
      // 46-50: Hall of Fame (Championship, Legendary & Master Level)
      if (slot === 1) {
        // Compound mixture problem
        const sugar = 30;
        const flour = 270; // total 300g. 30/300 = 10%
        questions.push({
          id,
          category: QuestionCategory.PERCENTAGE_CONVERSION,
          questionText: `전설의 시그니처 카스텔라 반죽 비법입니다. 유기농 무설탕 밀가루 ${flour}g 을 붓고 그 위에 스위트 시럽 결정체 ${sugar}g 을 정교하게 측정해 완벽히 한 대접의 반죽으로 치댔습니다. 이 반죽 중 시럽 결정체가 차지하는 백분율 농도는 몇 % 일까요?`,
          correctAnswer: `10`,
          acceptableAnswers: [`10`],
          unit: '%',
          hint: '전체 혼합된 반죽 무게는 밀가루 + 시럽 분량인 ' + (flour + sugar) + 'g 이 기준량이 되고, 시럽 ' + sugar + 'g 이 비교하는 양이 되어 30/300 = 1/10 = 10% 비율이 됩니다.'
        });
      } else if (slot === 2) {
        // original price compound
        const origPrice = 15000;
        const firstDiscount = 20; // 15000 * 0.8 = 12000
        const secondDiscount = 10; // 12000 * 0.9 = 10800
        questions.push({
          id,
          category: QuestionCategory.DISCOUNT_CALCULATION,
          questionText: `명예의 전당 베이커리에 전시될 대형 스위트 타워 케이크 세트의 가격은 15000원입니다. 1단계로 20% 마블 할인을 연속 적용한 뒤, 다시 추가 2단계로 10% VIP 단골 칭호 할인을 최종 적용했습니다. 손님이 내야 할 결제 금액은 최종 얼마입니까?`,
          correctAnswer: `10800`,
          acceptableAnswers: [`10800`],
          unit: '원',
          hint: '연속 할인 계산법입니다. 첫 번째 할인에 의해 15000 × 0.8 = 12000원이 유도되고, 여기서 다시 10%를 깎으므로 12000 × 0.9 = 10800원이 됩니다. (이것은 통합 30% 할인이 아니니 절대 한 번에 합치지 마세요!)'
        });
      } else if (slot === 3) {
        // Base amount conversion word problem
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `마스터 파티셰인 나교주가 소유한 빵집에서 판매한 크루아상 수와 바게트 수의 비율이 0.75 입니다. 바게트가 120개 판매되었을 때, 오늘 판매된 크루아상은 총 몇 개입니까? (크루아상의 바게트에 대한 비율이 0.75 임을 의미합니다)`,
          correctAnswer: `90`,
          acceptableAnswers: [`90`],
          unit: '개',
          hint: '바게트에 대한 크루아상의 비율이 0.75 이므로 바게트가 분모인 기준량(120), 크루아상이 비교량입니다. 비교하는 양 = 기준량 × 비율 이므로 120 × 0.75 = 90개 입니다.'
        });
      } else if (slot === 4) {
        const optionMasterList = ['400개', '500개', '600개', '800개'];
        questions.push({
          id,
          category: QuestionCategory.APPLIED_WORD_PROBLEM,
          questionText: `전설의 초코칩 멜론 빵 세트에 멜론이 무려 150알 포함되어 있습니다. 이것이 멜론 빵 세트 과일 장식 전체의 30% 비중이라면, 과일 장식 전체 총량은 몇 개입니까?`,
          options: optionMasterList,
          correctAnswer: `500개`,
          acceptableAnswers: [`500개`, `500`],
          unit: '개',
          hint: '150이 전체의 30%이므로 150 ÷ 0.3 = 500개 입니다.'
        });
      } else {
        // Interactive Ratio Builder
        const countA = 6;
        const countB = 2; // ratio 6:2 = 3:1 -> portion 75%
        questions.push({
          id,
          category: QuestionCategory.INGREDIENT_RATIO_BUILDER,
          questionText: `별빛 꿈결 케이크 요리의 최정상 공정에서는 스타 크림액티브 ${countA}방울과 드림 발효액 ${countB}방울이 화학적 무게비 6:2를 지켜 투입되어 한 점 번짐도 없이 발효되어야 최고 등급의 빵 촉감이 영속됩니다. 배합해 빵을 구워내세요.`,
          recipeDetails: { itemA: '스타크림', itemB: '드림발효액', valA: countA, valB: countB },
          correctAnswer: `${countA}:${countB}`,
          acceptableAnswers: [`${countA}:${countB}`],
          hint: '스타크림 6번, 드림발효액 2번을 순서대로 투입하여 명예의 전당을 완전히 장식하세요!'
        });
      }
    }
  }

  return questions;
}
