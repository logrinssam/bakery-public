import React, { useState, useEffect } from 'react';
import { MathQuestion, QuestionCategory } from '../types';
import { PixelSprite } from './PixelSprite';
import { Sparkles, HelpCircle, Utensils } from 'lucide-react';

interface MathQuestionBoxProps {
  question: MathQuestion;
  onSubmitAnswer: (answer: string) => void;
  isWrongNotification: boolean;
  isCorrectNotification: boolean;
  /** 정답·오답·굽기 중 — 엔터 연타로 중복 제출 방지 */
  inputDisabled?: boolean;
  breadIndex?: number;
  breadName?: string;
}

export const MathQuestionBox: React.FC<MathQuestionBoxProps> = ({
  question,
  onSubmitAnswer,
  isWrongNotification,
  isCorrectNotification,
  inputDisabled = false,
  breadIndex,
  breadName
}) => {
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  
  // Interactive recipe builder quantities
  const [qtyA, setQtyA] = useState(0);
  const [qtyB, setQtyB] = useState(0);

  // Clear inputs when question changes
  useEffect(() => {
    setUserInput('');
    setShowHint(false);
    setQtyA(0);
    setQtyB(0);
  }, [question.id]);

  const handleKeypadClick = (val: string) => {
    if (inputDisabled) return;
    if (val === 'C') {
      setUserInput('');
    } else if (val === '⌫') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + val);
    }
  };

  const handleBuilderSubmit = () => {
    if (inputDisabled) return;
    onSubmitAnswer(`${qtyA}:${qtyB}`);
  };

  const handleRegularSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputDisabled || !userInput.trim()) return;
    onSubmitAnswer(userInput.trim());
  };

  const selectMultipleOption = (option: string) => {
    if (inputDisabled) return;
    onSubmitAnswer(option);
  };

  // Render Interactive Ingredients Bowl
  const renderIngredientRatioBuilder = () => {
    const details = question.recipeDetails || { itemA: '밀가루', itemB: '우유', valA: 1, valB: 1 };
    const maxQtyA = Math.min(12, details.valA + 2);
    const maxQtyB = Math.min(12, details.valB + 2);
    const targetRatio = `${details.valA}:${details.valB}`;

    return (
      <div className="w-full flex flex-col items-center gap-6 bg-[#FFF4E0]/40 border-4 border-dashed border-[#5D4037]/20 rounded-3xl p-5 md:p-6" id="ratio-ingredient-bowl-panel">
        <div className="text-center font-sans font-bold text-[#5D4037] text-sm md:text-base mb-2">
          🍳 <span className="font-extrabold text-[#D64566] underline">{details.itemA}</span> 와 <span className="font-extrabold text-blue-700 underline">{details.itemB}</span>를 볼에 알맞은 수량으로 믹싱해 황금 비율을 맞춰 보세요!
        </div>
        <p className="text-center font-mono text-sm font-black text-[#D64566] bg-white border-2 border-[#5D4037] rounded-xl px-4 py-1.5">
          목표 비: {targetRatio}
        </p>

        <div className="w-full grid grid-cols-2 gap-4 max-w-md">
          {/* Ingredient A Controller */}
          <div className="flex flex-col items-center bg-white border-4 border-[#5D4037] rounded-2xl p-4 shadow-sm transition-all">
            <span className="font-sans text-xs text-[#5D4037] font-extrabold mb-1">재료 ①: {details.itemA}</span>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQtyA(p => Math.max(0, p - 1))}
                className="w-10 h-10 flex items-center justify-center font-mono font-black bg-stone-100 hover:bg-stone-200 border-2 border-[#5D4037] text-[#5D4037] rounded-xl text-lg cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center font-mono text-xl font-black text-[#5D4037]">{qtyA}</span>
              <button
                type="button"
                onClick={() => setQtyA(p => Math.min(maxQtyA, p + 1))}
                className="w-10 h-10 flex items-center justify-center font-mono font-black bg-[#FF85A1] hover:bg-[#FF85A1]/80 border-2 border-[#5D4037] text-white rounded-xl text-lg cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-3 justify-center min-h-[24px]">
              {Array.from({ length: qtyA }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-[#FF85A1] border border-[#5D4037] rounded animate-bounce shadow-xs" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>

          {/* Ingredient B Controller */}
          <div className="flex flex-col items-center bg-white border-4 border-[#5D4037] rounded-2xl p-4 shadow-sm transition-all">
            <span className="font-sans text-xs text-blue-800 font-extrabold mb-1">재료 ②: {details.itemB}</span>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQtyB(p => Math.max(0, p - 1))}
                className="w-10 h-10 flex items-center justify-center font-mono font-black bg-stone-100 hover:bg-stone-200 border-2 border-[#5D4037] text-[#5D4037] rounded-xl text-lg cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center font-mono text-xl font-black text-[#5D4037]">{qtyB}</span>
              <button
                type="button"
                onClick={() => setQtyB(p => Math.min(maxQtyB, p + 1))}
                className="w-10 h-10 flex items-center justify-center font-mono font-black bg-blue-500 hover:bg-blue-600 border-2 border-[#5D4037] text-white rounded-xl text-lg cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-3 justify-center min-h-[24px]">
              {Array.from({ length: qtyB }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-blue-400 border border-[#5D4037] rounded-full animate-bounce shadow-xs" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {/* The Big Mixing Bowl Rendering */}
        <div className="relative w-64 h-32 bg-stone-100 border-b-8 border-x-4 border-[#5D4037] rounded-b-full shadow-inner flex flex-col items-center justify-end p-2 mt-4 overflow-hidden">
          <div className="absolute top-2 left-0 right-0 border-t-2 border-[#5D4037]/10 border-dashed" />
          
          {/* Dynamic filled level animation based on entries */}
          {qtyA === 0 && qtyB === 0 ? (
            <span className="font-sans text-xs text-[#5D4037] opacity-60 font-medium pb-2 select-none animate-pulse">볼에 재료를 부어 수치를 높이세요</span>
          ) : (
            <div className="w-full flex flex-col items-center justify-end h-full">
              {/* Dough layered visual inside */}
              <div 
                className="w-full bg-[#FFF4E0] border-t border-[#5D4037]/25 transition-all rounded-b-full"
                style={{ height: `${Math.min(100, ((qtyA * 10 + qtyB * 10) / 160) * 100)}%` }}
              >
                <div className="flex flex-wrap items-center justify-center gap-1 p-2">
                  {Array.from({ length: qtyA }).map((_, i) => (
                    <span key={`a-${i}`} className="text-base select-none" title={details.itemA}>🌾</span>
                  ))}
                  {Array.from({ length: qtyB }).map((_, i) => (
                    <span key={`b-${i}`} className="text-base select-none" title={details.itemB}>🥛</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Baking Action */}
        <button
          type="button"
          disabled={inputDisabled || (qtyA === 0 && qtyB === 0)}
          onClick={handleBuilderSubmit}
          className={`px-8 py-4.5 rounded-2xl font-display font-black text-sm shadow-md transition-all flex items-center gap-2 mt-2 cursor-pointer ${
            qtyA === 0 && qtyB === 0
              ? 'bg-stone-100 text-stone-400 border-2 border-stone-200 cursor-not-allowed opacity-65'
              : 'btn-pixel-pink text-white hover:scale-[1.02]'
          }`}
          id="bake-curriculum-button"
        >
          <Utensils className="w-4 h-4 text-white" />
          황금비율 반죽 믹싱 & 오븐 굽기 시작
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl bg-white border-4 border-[#5D4037] rounded-3xl shadow-lg p-5 md:p-7 overflow-hidden flex flex-col gap-5 relative text-[#5D4037]" id="curriculum-math-question-card">

      {/* Ribbon Banner Category */}
      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
        <span className="bg-[#FFF4E0] text-[#5D4037] text-[11px] font-display font-black px-4 py-1.5 rounded-full border-2 border-[#5D4037] shadow-xs flex items-center gap-2 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#FF85A1]" />
          {question.category === QuestionCategory.RATIO_EXPRESSION && '비의 기초 구하기'}
          {question.category === QuestionCategory.RATIO_VALUE_FRACTION && '비율 구하기 (분수)'}
          {question.category === QuestionCategory.RATIO_VALUE_DECIMAL && '비율 구하기 (소수)'}
          {question.category === QuestionCategory.PERCENTAGE_CONVERSION && '비율 → 백분율(%) 구하기'}
          {question.category === QuestionCategory.APPLIED_WORD_PROBLEM && question.unit === '개' && question.questionText.includes('목표') && '목표 대비 백분율 판매량'}
          {question.category === QuestionCategory.APPLIED_WORD_PROBLEM && question.unit === '개' && question.questionText.includes('%') && !question.questionText.includes('목표') && '백분율에 해당하는 양 구하기'}
          {question.category === QuestionCategory.APPLIED_WORD_PROBLEM && !(question.unit === '개' && question.questionText.includes('%')) && '실생활 비의 응용수학'}
          {question.category === QuestionCategory.DISCOUNT_CALCULATION && '할인율과 판매 가액'}
          {question.category === QuestionCategory.INGREDIENT_RATIO_BUILDER && '핸즈온 베이킹 배합'}
        </span>
        
        {breadName && breadIndex !== undefined && (
          <div className="flex items-center gap-1.5 bg-[#FFFDE7] border-2 border-[#F4D03F] rounded-full px-3 py-1 text-[11px] font-sans text-[#795548] font-black shadow-xs">
            <PixelSprite type="bread" index={breadIndex} size={20} frameless={true} />
            <span>목표 디저트:</span>
            <span className="text-[#E65100] underline">{breadName}</span>
          </div>
        )}
        
        {/* Help button for hint */}
        <button
          type="button"
          onClick={() => setShowHint(p => !p)}
          className="btn-pixel-yellow px-3.5 py-1 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          title="힌트 보기"
        >
          <HelpCircle className="w-4 h-4 text-[#5D4037]" />
          <span>힌트보기</span>
        </button>
      </div>

      {/* Question Narrative */}
      <div className="font-sans text-[#5D4037] font-bold text-base sm:text-lg leading-relaxed pt-3 border-t-2 border-dashed border-[#FFF4E0]" id="math-problem-text">
        {question.questionText}
      </div>

      {showHint && (
        <div className="bg-[#FFF4E0]/50 border-4 border-[#5D4037] rounded-2xl p-4 text-xs sm:text-sm text-[#5D4037] leading-relaxed font-sans shadow-sm animate-fade-in" id="hint-bubble-box">
          <span className="font-black text-[#D64566]">💡 [베이킹 힌트]</span><br/>
          <span className="block mt-1 font-medium">{question.hint}</span>
          {question.helperText && (
            <span className="block mt-2 pt-2 border-t border-[#5D4037]/15 text-[11px] text-stone-600 font-semibold">
              📌 {question.helperText}
            </span>
          )}
        </div>
      )}

      {/* Answer submission interface depending on category / structure */}
      <div className="mt-2 border-t-2 border-dashed border-[#FFF4E0] pt-5">
        {question.category === QuestionCategory.INGREDIENT_RATIO_BUILDER ? (
          renderIngredientRatioBuilder()
        ) : question.options ? (
          /* Multiple choice input */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="multiple-choice-grid">
            {question.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={inputDisabled}
                onClick={() => selectMultipleOption(opt)}
                className="w-full text-left p-4 rounded-xl border-4 border-[#5D4037] bg-white hover:bg-[#FFF4E0]/40 text-[#5D4037] font-sans font-bold text-sm transition-all focus:outline-none flex items-center justify-between group shadow-sm hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>{opt}</span>
                <span className="w-7 h-7 rounded-lg border-2 border-[#5D4037] bg-[#FFF4E0] text-[#5D4037] group-hover:bg-[#FF85A1] group-hover:text-white flex items-center justify-center font-mono text-xs font-black transition-all">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Short text answer with a tailored on-screen digital baking keypad! */
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Typing Form */}
            <form onSubmit={handleRegularSubmit} className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="student-answer-input" className="font-sans text-xs text-stone-500 font-black">실제 황금 비율 수식을 타이핑하세요</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="student-answer-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={inputDisabled}
                    placeholder="예: 3:5 또는 2/5 또는 0.4 등 형식에 맞춰 입력"
                    className="w-full bg-[#FFF4E0]/20 border-4 border-[#5D4037] rounded-2xl px-4 py-3.5 font-mono text-lg font-black text-[#5D4037] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all shadow-inner disabled:opacity-50"
                    autoComplete="off"
                  />
                  {question.unit && (
                    <span className="absolute right-4 font-display font-black text-[#5D4037] bg-[#FFF4E0] border-2 border-[#5D4037] rounded-lg px-2.5 py-1 text-xs">
                      {question.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="submit"
                  disabled={inputDisabled}
                  className="w-full btn-pixel-pink text-white py-4.5 rounded-2xl font-display font-black text-sm transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  반죽 농도 확인하고 제출하기
                </button>
                <p className="font-sans text-[10px] text-center text-stone-500 font-bold">
                  * 오븐 키패드로 비율 특수기호(:)나 분수(/)를 손쉽게 완성할 수 있습니다.
                </p>
              </div>
            </form>

            {/* Tactical Custom Digital Keypad tailored for math notations */}
            <div className="w-full md:w-56 bg-white border-4 border-[#5D4037] rounded-2xl p-3 grid grid-cols-4 gap-1.5 select-none shadow-sm" id="tactile-calculating-keypad">
              {['1', '2', '3', ':'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadClick(k)}
                  className={`h-11 rounded-xl border-2 border-[#5D4037] font-mono font-black text-base transition-all flex items-center justify-center cursor-pointer ${
                    k === ':' ? 'bg-[#FF85A1] hover:bg-[#FF85A1]/80 text-white text-lg' : 'bg-[#FFF4E0]/20 hover:bg-[#FFF4E0]/60 text-[#5D4037]'
                  }`}
                >
                  {k}
                </button>
              ))}
              {['4', '5', '6', '/'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadClick(k)}
                  className={`h-11 rounded-xl border-2 border-[#5D4037] font-mono font-black text-base transition-all flex items-center justify-center cursor-pointer ${
                    k === '/' ? 'bg-[#FF85A1] hover:bg-[#FF85A1]/80 text-white text-lg' : 'bg-[#FFF4E0]/20 hover:bg-[#FFF4E0]/60 text-[#5D4037]'
                  }`}
                >
                  {k}
                </button>
              ))}
              {['7', '8', '9', '.'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadClick(k)}
                  className="h-11 rounded-xl bg-[#FFF4E0]/20 hover:bg-[#FFF4E0]/60 border-2 border-[#5D4037] font-mono font-black text-base transition-all flex items-center justify-center text-[#5D4037] cursor-pointer"
                >
                  {k}
                </button>
              ))}
              {['0', '⌫', 'C', '00'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadClick(k)}
                  className={`h-11 rounded-xl border-2 border-[#5D4037] font-sans font-black transition-all flex items-center justify-center cursor-pointer ${
                    k === '⌫' 
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs' 
                      : k === 'C' 
                      ? 'bg-[#F4D03F] hover:bg-[#F4D03F]/80 text-[#5D4037] text-sm' 
                      : 'bg-[#FFF4E0]/20 hover:bg-[#FFF4E0]/60 text-[#5D4037] font-mono text-base'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visual Indicator of correctness state */}
      {isWrongNotification && (
        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none animate-flash-red">
          <div className="bg-red-600 text-white font-sans font-black text-sm sm:text-base px-6 py-4 rounded-2xl flex items-center gap-2.5 shadow-lg scale-95 border-4 border-[#5D4037]">
            ❌ 조금 눈대중이 빗나갔어요! 배합 기준량을 확인하고 다시 맞춰보세요.
          </div>
        </div>
      )}

      {isCorrectNotification && (
        <div className="absolute inset-0 bg-emerald-500/15 flex items-center justify-center pointer-events-none">
          <div className="bg-[#66BB6A] text-white font-sans font-black text-sm sm:text-base px-6 py-4 rounded-2xl flex items-center gap-2.5 shadow-lg border-4 border-[#5D4037] animate-bounce">
            🎉 완벽한 배합 성공! 정밀하게 반죽이 부풀어 오르고 있습니다!
          </div>
        </div>
      )}

    </div>
  );
};
